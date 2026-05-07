import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@osc/database";
import IntegracoesClient from "./IntegracoesClient";

export default async function IntegracoesPage({
  searchParams,
}: {
  searchParams: { connected?: string; error?: string };
}) {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
    select: {
      googleAccessToken: true,
      googleRefreshToken: true,
      gmailConnected: true,
    },
  });

  const driveConnected = !!(user?.googleAccessToken && user?.googleRefreshToken);
  const gmailConnected = driveConnected && !!user?.gmailConnected;

  return (
    <IntegracoesClient
      driveConnected={driveConnected}
      gmailConnected={gmailConnected}
      justConnected={searchParams.connected}
      error={searchParams.error}
    />
  );
}
