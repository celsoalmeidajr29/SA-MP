import { proto } from "baileys";
import { prisma } from "@osc/database";
import { chat, saveMemory, transcribeAudio, summarizeDocument } from "../services/ai";
import { uploadFile } from "../services/storage";
import {
  scheduleAppointment,
  scheduleReminder,
} from "../services/scheduler";
import { parseAppointment, parseReminder } from "../utils/dateParser";
import pino from "pino";
import { v4 as uuid } from "uuid";

const logger = pino({ name: "messageHandler" });

const SAVE_KEYWORDS = ["salva", "salvar", "anota", "anotar", "registra", "registrar", "guarda", "guardar"];
const APPOINTMENT_KEYWORDS = ["agendar", "agenda", "compromisso", "reunião", "consulta"];
const REMINDER_KEYWORDS = ["lembrar", "lembre", "lembrete", "me avisa", "me avise"];
const SUMMARY_KEYWORDS = ["resuma", "resume", "resumo", "resumir"];

export async function handleMessage(
  from: string,
  message: proto.IWebMessageInfo,
  sendMessage: (to: string, text: string) => Promise<void>
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { whatsappNumber: from },
      include: { plan: true },
    });

    if (!user) {
      await sendMessage(
        from,
        `👋 Olá! Você ainda não está cadastrado no *OSC - Segundo Cérebro*.\n\nAcesse o link para criar sua conta:\n🔗 https://osc.app/cadastro`
      );
      return;
    }

    // Verificar limite de mensagens
    await resetDailyCountIfNeeded(user.id);
    if (user.messagesUsedToday >= user.plan.messagesPerDay) {
      await sendMessage(
        from,
        `⚠️ Você atingiu o limite de *${user.plan.messagesPerDay} mensagens/dia* do plano ${user.plan.displayName}.\n\nFaça upgrade para o plano Pro para mensagens ilimitadas:\n🔗 https://osc.app/planos`
      );
      return;
    }

    const msg = message.message;
    let userText = "";
    let mediaBuffer: Buffer | null = null;
    let mediaType: "image" | "audio" | "document" | null = null;
    let mediaBase64: string | undefined;
    let filename = "";

    // Extrair texto e mídia
    if (msg?.conversation) {
      userText = msg.conversation;
    } else if (msg?.extendedTextMessage?.text) {
      userText = msg.extendedTextMessage.text;
    } else if (msg?.imageMessage) {
      mediaType = "image";
      userText = msg.imageMessage.caption || "O que é essa imagem?";
    } else if (msg?.audioMessage) {
      mediaType = "audio";
      userText = "[áudio]";
    } else if (msg?.documentMessage) {
      mediaType = "document";
      filename = msg.documentMessage.fileName || "documento";
      userText = msg.documentMessage.caption || `Salvar documento: ${filename}`;
    } else {
      return;
    }

    // Processar áudio → texto
    if (mediaType === "audio" && mediaBuffer) {
      const transcription = await transcribeAudio(mediaBuffer);
      userText = transcription;
      await sendMessage(from, `🎤 _Transcrição:_ ${transcription}`);
    }

    // Imagem → base64 para Claude
    if (mediaType === "image" && mediaBuffer) {
      mediaBase64 = mediaBuffer.toString("base64");
    }

    // Upload de documento
    if (mediaType === "document" && mediaBuffer) {
      const key = `${user.id}/${uuid()}-${filename}`;
      await uploadFile(key, mediaBuffer, "application/octet-stream");

      const docContent = mediaBuffer.toString("utf-8").slice(0, 50000);
      const summary = await summarizeDocument(docContent, filename);

      const fileRecord = await prisma.userFile.create({
        data: {
          userId: user.id,
          originalName: filename,
          mimeType: "application/pdf",
          sizeBytes: BigInt(mediaBuffer.length),
          storagePath: key,
          processed: true,
          summary,
        },
      });

      await saveMemory(
        user.id,
        `Documento: ${filename}\n\nResumo: ${summary}`,
        "document",
        filename,
        ["documento", "arquivo"]
      );

      await sendMessage(
        from,
        `📄 Documento *${filename}* salvo e processado!\n\n*Resumo rápido:*\n${summary.slice(0, 500)}...`
      );

      await prisma.user.update({
        where: { id: user.id },
        data: { documentsThisMonth: { increment: 1 } },
      });
      return;
    }

    const lowerText = userText.toLowerCase();

    // Detectar intenção de salvar memória
    if (SAVE_KEYWORDS.some((k) => lowerText.includes(k))) {
      const content = userText.replace(/salva[r]?|anota[r]?|registra[r]?|guarda[r]?/gi, "").trim();
      await saveMemory(user.id, content, "note", undefined, []);
      await incrementMessages(user.id);
      await sendMessage(from, `✅ Anotado! Guardei isso na sua memória:\n_"${content}"_`);
      return;
    }

    // Detectar compromisso
    if (APPOINTMENT_KEYWORDS.some((k) => lowerText.includes(k))) {
      const parsed = parseAppointment(userText);
      if (parsed) {
        const appointment = await prisma.appointment.create({
          data: {
            userId: user.id,
            title: parsed.title,
            scheduledAt: parsed.date,
          },
        });

        await scheduleAppointment(
          user.id,
          appointment.id,
          parsed.title,
          parsed.date
        );

        await saveMemory(
          user.id,
          `Compromisso: ${parsed.title} em ${parsed.date.toLocaleString("pt-BR")}`,
          "note",
          "Compromisso",
          ["compromisso", "agenda"]
        );

        await incrementMessages(user.id);
        await sendMessage(
          from,
          `🗓️ Compromisso agendado!\n\n*${parsed.title}*\n📅 ${parsed.date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}\n\nVou te avisar na hora!`
        );
        return;
      }
    }

    // Detectar lembrete
    if (REMINDER_KEYWORDS.some((k) => lowerText.includes(k))) {
      const parsed = parseReminder(userText);
      if (parsed) {
        const reminder = await prisma.reminder.create({
          data: {
            userId: user.id,
            message: parsed.message,
            scheduledAt: parsed.date,
          },
        });

        await scheduleReminder(user.id, reminder.id, parsed.message, parsed.date);
        await incrementMessages(user.id);
        await sendMessage(
          from,
          `⏰ Lembrete criado!\n\n_"${parsed.message}"_\n📅 ${parsed.date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`
        );
        return;
      }
    }

    // Buscar histórico de conversa
    const history = await prisma.conversation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const conversationHistory = history
      .reverse()
      .map((c) => ({ role: c.role as "user" | "assistant", content: c.content }));

    // Chat com IA
    const response = await chat(
      user.id,
      userText,
      conversationHistory,
      mediaBase64,
      mediaType === "image" ? "image" : undefined
    );

    // Salvar conversa
    await prisma.conversation.createMany({
      data: [
        { userId: user.id, role: "user", content: userText, mediaType: mediaType ?? "text" },
        { userId: user.id, role: "assistant", content: response },
      ],
    });

    // Extrair e salvar memória automaticamente se a IA identificou algo importante
    if (
      response.toLowerCase().includes("anotei") ||
      response.toLowerCase().includes("registrei") ||
      response.toLowerCase().includes("salvei")
    ) {
      await saveMemory(user.id, userText, "info");
    }

    await incrementMessages(user.id);
    await sendMessage(from, response);
  } catch (err) {
    logger.error({ err, from }, "Erro ao processar mensagem");
    await sendMessage(from, "❌ Ocorreu um erro. Tente novamente em instantes.");
  }
}

async function incrementMessages(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { messagesUsedToday: { increment: 1 } },
  });
}

async function resetDailyCountIfNeeded(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const now = new Date();
  const lastReset = user.lastResetAt;
  const isNewDay =
    now.getDate() !== lastReset.getDate() ||
    now.getMonth() !== lastReset.getMonth();

  if (isNewDay) {
    await prisma.user.update({
      where: { id: userId },
      data: { messagesUsedToday: 0, lastResetAt: now },
    });
  }
}
