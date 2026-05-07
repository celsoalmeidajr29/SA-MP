import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@osc/database";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const userId = searchParams.get("state");

  if (!code || !userId) {
    return NextResponse.redirect(
      new URL("/dashboard/integracoes?error=invalid_callback", req.url)
    );
  }

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  try {
    const { tokens } = await oauth2.getToken(code);

    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleTokenExpiry: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null,
        gmailConnected: true,
      },
    });

    return NextResponse.redirect(
      new URL("/dashboard/integracoes?connected=google", req.url)
    );
  } catch {
    return NextResponse.redirect(
      new URL("/dashboard/integracoes?error=auth_failed", req.url)
    );
  }
}
