import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@osc/database";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, whatsappNumber, password, plan } = await req.json();

    if (!name || !email || !whatsappNumber || !password) {
      return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { whatsappNumber }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "E-mail ou WhatsApp já cadastrado." },
        { status: 409 }
      );
    }

    const planRecord = await prisma.plan.findFirst({
      where: { name: plan === "pro" ? "pro" : "free" },
    });

    if (!planRecord) {
      return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        whatsappNumber: whatsappNumber.replace(/\D/g, ""),
        passwordHash,
        planId: planRecord.id,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
