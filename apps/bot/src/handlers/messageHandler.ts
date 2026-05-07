import { proto } from "baileys";
import { prisma } from "@osc/database";
import {
  chat,
  saveMemory,
  transcribeAudio,
  summarizeDocument,
} from "../services/ai";
import { uploadFile } from "../services/storage";
import {
  uploadToDrive,
  hasDriveConnected,
} from "../services/googleDrive";
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

    // Verificar trial expirado
    if (user.trialEndsAt && user.trialEndsAt < new Date() && !user.subscriptionId) {
      await sendMessage(
        from,
        `⏰ Seu período de teste de 7 dias encerrou!\n\nAssine o plano Pro para continuar usando o OSC:\n🔗 https://osc.app/dashboard/plano`
      );
      return;
    }

    // Resetar contadores diários se necessário
    await resetDailyCountIfNeeded(user.id);

    // Re-buscar user atualizado
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { plan: true },
    });
    if (!freshUser) return;

    // Verificar limite de mensagens
    if (freshUser.messagesUsedToday >= freshUser.plan.messagesPerDay) {
      await sendMessage(
        from,
        `⚠️ Você atingiu o limite de *${freshUser.plan.messagesPerDay} mensagens/dia* do plano ${freshUser.plan.displayName}.\n\nFaça upgrade para o plano Pro:\n🔗 https://osc.app/dashboard/plano`
      );
      return;
    }

    // Verificar limite de tokens de IA
    if (
      freshUser.plan.aiTokensPerDay > 0 &&
      freshUser.aiTokensUsedToday >= freshUser.plan.aiTokensPerDay
    ) {
      await sendMessage(
        from,
        `🧠 Você atingiu o limite de processamento de IA de hoje (plano ${freshUser.plan.displayName}).\n\nLimite renova à meia-noite. Faça upgrade para mais:\n🔗 https://osc.app/dashboard/plano`
      );
      return;
    }

    const msg = message.message;
    let userText = "";
    let mediaBuffer: Buffer | null = null;
    let mediaType: "image" | "audio" | "document" | null = null;
    let mediaBase64: string | undefined;
    let filename = "";
    let mimeType = "application/octet-stream";

    // Extrair texto e mídia
    if (msg?.conversation) {
      userText = msg.conversation;
    } else if (msg?.extendedTextMessage?.text) {
      userText = msg.extendedTextMessage.text;
    } else if (msg?.imageMessage) {
      mediaType = "image";
      mimeType = msg.imageMessage.mimetype ?? "image/jpeg";
      userText = msg.imageMessage.caption || "O que é essa imagem?";
    } else if (msg?.audioMessage) {
      mediaType = "audio";
      mimeType = "audio/ogg";
      userText = "[áudio]";
    } else if (msg?.documentMessage) {
      mediaType = "document";
      mimeType = msg.documentMessage.mimetype ?? "application/octet-stream";
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

    // Upload de documento (Drive ou MinIO como fallback)
    if (mediaType === "document" && mediaBuffer) {
      const driveConnected = hasDriveConnected(freshUser);
      let driveFileId: string | null = null;
      let driveWebViewLink: string | null = null;
      let storagePath: string | null = null;
      let storageBackend: "drive" | "minio" = "minio";

      if (driveConnected) {
        const result = await uploadToDrive(
          freshUser.id,
          mediaBuffer,
          filename,
          mimeType
        );
        if (result) {
          driveFileId = result.fileId;
          driveWebViewLink = result.webViewLink;
          storageBackend = "drive";
        }
      }

      if (!driveConnected || !driveFileId) {
        const key = `${freshUser.id}/${uuid()}-${filename}`;
        await uploadFile(key, mediaBuffer, mimeType);
        storagePath = key;
      }

      // Processar conteúdo para memória
      const docContent = mediaBuffer.toString("utf-8").slice(0, 50000);
      const summary = await summarizeDocument(docContent, filename);

      await prisma.userFile.create({
        data: {
          userId: freshUser.id,
          originalName: filename,
          mimeType,
          sizeBytes: BigInt(mediaBuffer.length),
          storageBackend,
          storagePath: storagePath ?? undefined,
          driveFileId: driveFileId ?? undefined,
          driveWebViewLink: driveWebViewLink ?? undefined,
          processed: true,
          summary,
        },
      });

      await saveMemory(
        freshUser.id,
        `Documento: ${filename}\n\nResumo: ${summary}`,
        "document",
        filename,
        ["documento", "arquivo"]
      );

      const storageMsg =
        storageBackend === "drive"
          ? `\n\n📂 Salvo no seu _Google Drive_ (pasta OSC)`
          : "";

      await sendMessage(
        from,
        `📄 Documento *${filename}* salvo!\n\n*Resumo:*\n${summary.slice(0, 500)}...${storageMsg}`
      );

      await prisma.user.update({
        where: { id: freshUser.id },
        data: { documentsThisMonth: { increment: 1 } },
      });

      await incrementMessages(freshUser.id);
      return;
    }

    const lowerText = userText.toLowerCase();

    // Detectar intenção de salvar memória
    if (SAVE_KEYWORDS.some((k) => lowerText.includes(k))) {
      const content = userText
        .replace(/salva[r]?|anota[r]?|registra[r]?|guarda[r]?/gi, "")
        .trim();
      await saveMemory(freshUser.id, content, "note");
      await incrementMessages(freshUser.id);
      await sendMessage(from, `✅ Anotado na sua memória:\n_"${content}"_`);
      return;
    }

    // Detectar compromisso
    if (APPOINTMENT_KEYWORDS.some((k) => lowerText.includes(k))) {
      const parsed = parseAppointment(userText);
      if (parsed) {
        const appointment = await prisma.appointment.create({
          data: {
            userId: freshUser.id,
            title: parsed.title,
            scheduledAt: parsed.date,
          },
        });

        await scheduleAppointment(
          freshUser.id,
          appointment.id,
          parsed.title,
          parsed.date
        );

        await saveMemory(
          freshUser.id,
          `Compromisso: ${parsed.title} em ${parsed.date.toLocaleString("pt-BR")}`,
          "note",
          "Compromisso",
          ["compromisso", "agenda"]
        );

        await incrementMessages(freshUser.id);
        await sendMessage(
          from,
          `🗓️ Compromisso agendado!\n\n*${parsed.title}*\n📅 ${parsed.date.toLocaleString("pt-BR", {
            timeZone: "America/Sao_Paulo",
          })}\n\nVou te avisar na hora! ✅`
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
            userId: freshUser.id,
            message: parsed.message,
            scheduledAt: parsed.date,
          },
        });

        await scheduleReminder(
          freshUser.id,
          reminder.id,
          parsed.message,
          parsed.date
        );

        await incrementMessages(freshUser.id);
        await sendMessage(
          from,
          `⏰ Lembrete criado!\n\n_"${parsed.message}"_\n📅 ${parsed.date.toLocaleString("pt-BR", {
            timeZone: "America/Sao_Paulo",
          })}`
        );
        return;
      }
    }

    // Buscar histórico de conversa
    const history = await prisma.conversation.findMany({
      where: { userId: freshUser.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const conversationHistory = history
      .reverse()
      .map((c) => ({ role: c.role as "user" | "assistant", content: c.content }));

    // Chat com IA
    const { response, tokensUsed } = await chat(
      freshUser.id,
      userText,
      conversationHistory,
      mediaBase64,
      mediaType === "image" ? "image" : undefined
    );

    // Salvar conversa
    await prisma.conversation.createMany({
      data: [
        {
          userId: freshUser.id,
          role: "user",
          content: userText,
          mediaType: mediaType ?? "text",
        },
        { userId: freshUser.id, role: "assistant", content: response },
      ],
    });

    // Salvar automaticamente se IA indicou
    if (
      response.toLowerCase().includes("anotei") ||
      response.toLowerCase().includes("registrei") ||
      response.toLowerCase().includes("salvei")
    ) {
      await saveMemory(freshUser.id, userText, "info");
    }

    await incrementMessages(freshUser.id, tokensUsed);
    await sendMessage(from, response);
  } catch (err) {
    logger.error({ err, from }, "Erro ao processar mensagem");
    await sendMessage(from, "❌ Ocorreu um erro. Tente novamente em instantes.");
  }
}

async function incrementMessages(userId: string, tokens = 0) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      messagesUsedToday: { increment: 1 },
      aiTokensUsedToday: { increment: tokens },
    },
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
      data: {
        messagesUsedToday: 0,
        aiTokensUsedToday: 0,
        lastResetAt: now,
      },
    });
  }
}
