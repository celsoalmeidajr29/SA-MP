import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OSC — Segundo Cérebro",
  description:
    "Seu assistente pessoal no WhatsApp com memória inteligente, lembretes e muito mais.",
  openGraph: {
    title: "OSC — Segundo Cérebro",
    description: "Salve tudo, lembre de tudo, pelo WhatsApp.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-white antialiased">{children}</body>
    </html>
  );
}
