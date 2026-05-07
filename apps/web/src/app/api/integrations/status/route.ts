import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@osc/database";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user!.email! },
    select: {
      googleAccessToken: true,
      googleRefreshToken: true,
      gmailConnected: true,
    },
  });

  const driveConnected = !!(user?.googleAccessToken && user?.googleRefreshToken);

  return NextResponse.json({
    googleDrive: driveConnected,
    gmail: driveConnected && user?.gmailConnected,
  });
}
