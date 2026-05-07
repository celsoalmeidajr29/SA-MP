import { Queue, Worker } from "bullmq";
import { IORedis } from "ioredis";
import { prisma } from "@osc/database";
import { config } from "../config";
import pino from "pino";

const logger = pino({ name: "scheduler" });

const redisConnection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
});

export const notificationQueue = new Queue("notifications", {
  connection: redisConnection,
});

// Enviará a mensagem via WhatsApp (injetado no boot)
let sendMessageFn: ((to: string, message: string) => Promise<void>) | null =
  null;

export function registerSendMessage(
  fn: (to: string, message: string) => Promise<void>
) {
  sendMessageFn = fn;
}

export function startWorker() {
  const worker = new Worker(
    "notifications",
    async (job) => {
      const { userId, message, type, resourceId } = job.data;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return;

      if (sendMessageFn) {
        await sendMessageFn(user.whatsappNumber, message);
      }

      if (type === "appointment") {
        await prisma.appointment.update({
          where: { id: resourceId },
          data: { notifiedAt: new Date(), status: "notified" },
        });
      } else if (type === "reminder") {
        await prisma.reminder.update({
          where: { id: resourceId },
          data: { notifiedAt: new Date(), status: "notified" },
        });
      }

      logger.info({ userId, type }, "Notificação enviada");
    },
    { connection: redisConnection }
  );

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, err }, "Falha no job de notificação");
  });

  return worker;
}

export async function scheduleAppointment(
  userId: string,
  appointmentId: string,
  title: string,
  scheduledAt: Date
) {
  const delay = scheduledAt.getTime() - Date.now();
  if (delay <= 0) return;

  await notificationQueue.add(
    "appointment",
    {
      userId,
      resourceId: appointmentId,
      type: "appointment",
      message: `🗓️ *Compromisso agora!*\n\n*${title}*\n\nCriado pelo OSC - Seu Segundo Cérebro`,
    },
    { delay, removeOnComplete: true }
  );
}

export async function scheduleReminder(
  userId: string,
  reminderId: string,
  message: string,
  scheduledAt: Date
) {
  const delay = scheduledAt.getTime() - Date.now();
  if (delay <= 0) return;

  await notificationQueue.add(
    "reminder",
    {
      userId,
      resourceId: reminderId,
      type: "reminder",
      message: `⏰ *Lembrete!*\n\n${message}`,
    },
    { delay, removeOnComplete: true }
  );
}
