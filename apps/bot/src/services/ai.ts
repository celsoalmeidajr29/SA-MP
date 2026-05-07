import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { config } from "../config";
import { prisma } from "@osc/database";

const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });
const openai = new OpenAI({ apiKey: config.openaiApiKey });

export async function generateEmbedding(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return res.data[0].embedding;
}

export async function searchMemories(
  userId: string,
  query: string,
  limit = 10
): Promise<string> {
  const embedding = await generateEmbedding(query);
  const vector = `[${embedding.join(",")}]`;

  // pgvector cosine similarity search
  const memories = await prisma.$queryRaw<
    { content: string; type: string; title: string | null }[]
  >`
    SELECT content, type, title
    FROM "Memory"
    WHERE "userId" = ${userId}
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY embedding <=> ${vector}::vector
    LIMIT ${limit}
  `;

  if (!memories.length) return "";

  return memories
    .map((m) => `[${m.type}] ${m.title ? `${m.title}: ` : ""}${m.content}`)
    .join("\n");
}

export async function saveMemory(
  userId: string,
  content: string,
  type: string,
  title?: string,
  tags: string[] = []
): Promise<void> {
  const embedding = await generateEmbedding(content);
  const vector = `[${embedding.join(",")}]`;

  await prisma.$executeRaw`
    INSERT INTO "Memory" (id, "userId", type, title, content, tags, embedding, "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      ${userId},
      ${type},
      ${title ?? null},
      ${content},
      ${tags}::text[],
      ${vector}::vector,
      NOW(),
      NOW()
    )
  `;
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  const file = new File([audioBuffer], "audio.ogg", { type: "audio/ogg" });
  const res = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    language: "pt",
  });
  return res.text;
}

export async function chat(
  userId: string,
  userMessage: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  mediaBase64?: string,
  mediaType?: "image" | "document"
): Promise<{ response: string; tokensUsed: number }> {
  const memories = await searchMemories(userId, userMessage);

  const systemPrompt = `Você é o OSC, o segundo cérebro do usuário. Você tem acesso às memórias, anotações, compromissos e informações salvas pelo usuário.

MEMÓRIAS RELEVANTES:
${memories || "Nenhuma memória relevante encontrada."}

INSTRUÇÕES:
- Responda em português, de forma amigável e direta
- Use as memórias para contextualizar suas respostas
- Se o usuário pedir para salvar algo, confirme o que foi salvo
- Se o usuário perguntar sobre algo que não está nas memórias, diga que não encontrou e pergunte se quer registrar
- Para compromissos e lembretes, confirme a data e hora antes de agendar
- Seja conciso nas mensagens de WhatsApp`;

  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  if (mediaBase64 && mediaType === "image") {
    messages.push({
      role: "user",
      content: [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: "image/jpeg",
            data: mediaBase64,
          },
        },
        { type: "text", text: userMessage },
      ],
    });
  } else {
    messages.push({ role: "user", content: userMessage });
  }

  const response = await anthropic.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
  return { response: text, tokensUsed };
}

export async function summarizeDocument(
  content: string,
  filename: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Por favor, faça um resumo detalhado do seguinte documento "${filename}":\n\n${content}`,
      },
    ],
  });

  return response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");
}
