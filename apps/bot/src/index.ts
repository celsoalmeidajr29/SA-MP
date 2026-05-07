import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} from "baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import { handleMessage } from "./handlers/messageHandler";
import {
  registerSendMessage,
  startWorker,
} from "./services/scheduler";
import { config } from "./config";

const logger = pino({ name: "osc-bot", level: "info" });

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }) as any,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }) as any),
    },
    printQRInTerminal: true,
    generateHighQualityLinkPreview: false,
  });

  sock.ev.on("creds.update", saveCreds);

  const sendMessage = async (to: string, text: string) => {
    const jid = to.includes("@s.whatsapp.net") ? to : `${to}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text });
  };

  registerSendMessage(sendMessage);
  startWorker();

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      logger.info("📱 Escaneie o QR Code acima com seu WhatsApp");
    }
    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      logger.warn({ shouldReconnect }, "Conexão encerrada");
      if (shouldReconnect) startBot();
    } else if (connection === "open") {
      logger.info("✅ Bot conectado ao WhatsApp!");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
      if (msg.key.fromMe || !msg.message) continue;
      const from = msg.key.remoteJid?.replace("@s.whatsapp.net", "") ?? "";
      if (!from) continue;
      await handleMessage(from, msg, sendMessage);
    }
  });
}

startBot().catch(logger.error.bind(logger));
