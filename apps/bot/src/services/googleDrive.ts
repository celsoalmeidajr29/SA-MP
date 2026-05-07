import { google } from "googleapis";
import { prisma } from "@osc/database";
import { Readable } from "stream";

const OSC_FOLDER_NAME = "OSC - Segundo Cérebro";

function createOAuth2Client(accessToken: string, refreshToken: string) {
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return oauth2;
}

async function refreshAndSaveToken(userId: string, oauth2: InstanceType<typeof google.auth.OAuth2>) {
  const { credentials } = await oauth2.refreshAccessToken();
  await prisma.user.update({
    where: { id: userId },
    data: {
      googleAccessToken: credentials.access_token ?? undefined,
      googleTokenExpiry: credentials.expiry_date
        ? new Date(credentials.expiry_date)
        : undefined,
    },
  });
  return credentials.access_token!;
}

async function getValidOAuth2(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.googleAccessToken || !user.googleRefreshToken) return null;

  const oauth2 = createOAuth2Client(user.googleAccessToken, user.googleRefreshToken);

  // Renovar token se expirado ou expirando em menos de 5 minutos
  const expiresAt = user.googleTokenExpiry?.getTime() ?? 0;
  if (Date.now() >= expiresAt - 5 * 60 * 1000) {
    await refreshAndSaveToken(userId, oauth2);
  }

  return oauth2;
}

async function ensureOscFolder(
  drive: ReturnType<typeof google.drive>,
  userId: string
): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Reusar pasta existente
  if (user?.googleDriveFolderId) return user.googleDriveFolderId;

  // Criar pasta "OSC - Segundo Cérebro" no Drive
  const res = await drive.files.create({
    requestBody: {
      name: OSC_FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id",
  });

  const folderId = res.data.id!;
  await prisma.user.update({
    where: { id: userId },
    data: { googleDriveFolderId: folderId },
  });

  return folderId;
}

export interface DriveUploadResult {
  fileId: string;
  webViewLink: string;
  name: string;
}

export async function uploadToDrive(
  userId: string,
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<DriveUploadResult | null> {
  const oauth2 = await getValidOAuth2(userId);
  if (!oauth2) return null;

  const drive = google.drive({ version: "v3", auth: oauth2 });
  const folderId = await ensureOscFolder(drive, userId);

  const stream = Readable.from(buffer);

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: "id,webViewLink,name",
  });

  return {
    fileId: res.data.id!,
    webViewLink: res.data.webViewLink!,
    name: res.data.name!,
  };
}

export async function downloadFromDrive(
  userId: string,
  fileId: string
): Promise<Buffer | null> {
  const oauth2 = await getValidOAuth2(userId);
  if (!oauth2) return null;

  const drive = google.drive({ version: "v3", auth: oauth2 });

  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" }
  );

  return Buffer.from(res.data as ArrayBuffer);
}

export async function listDriveFiles(
  userId: string
): Promise<{ id: string; name: string; mimeType: string; size: string; webViewLink: string }[]> {
  const oauth2 = await getValidOAuth2(userId);
  if (!oauth2) return [];

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.googleDriveFolderId) return [];

  const drive = google.drive({ version: "v3", auth: oauth2 });

  const res = await drive.files.list({
    q: `'${user.googleDriveFolderId}' in parents and trashed = false`,
    fields: "files(id,name,mimeType,size,webViewLink)",
    orderBy: "createdTime desc",
    pageSize: 50,
  });

  return (res.data.files ?? []) as {
    id: string;
    name: string;
    mimeType: string;
    size: string;
    webViewLink: string;
  }[];
}

export async function deleteFromDrive(
  userId: string,
  fileId: string
): Promise<void> {
  const oauth2 = await getValidOAuth2(userId);
  if (!oauth2) return;

  const drive = google.drive({ version: "v3", auth: oauth2 });
  await drive.files.delete({ fileId });
}

export function hasDriveConnected(user: {
  googleAccessToken: string | null;
  googleRefreshToken: string | null;
}): boolean {
  return !!(user.googleAccessToken && user.googleRefreshToken);
}
