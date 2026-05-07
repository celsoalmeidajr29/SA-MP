"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  driveConnected: boolean;
  gmailConnected: boolean;
  justConnected?: string;
  error?: string;
}

export default function IntegracoesClient({
  driveConnected,
  gmailConnected,
  justConnected,
  error,
}: Props) {
  const router = useRouter();
  const [disconnecting, setDisconnecting] = useState(false);

  const handleDisconnectGoogle = async () => {
    setDisconnecting(true);
    await fetch("/api/integrations/google/disconnect", { method: "POST" });
    router.refresh();
    setDisconnecting(false);
  };

  const integrations = [
    {
      id: "google-drive",
      name: "Google Drive",
      description:
        "Arquivos enviados pelo WhatsApp são salvos diretamente na pasta \"OSC\" do seu Drive. Você controla seus dados e economiza armazenamento.",
      icon: "🟢",
      badge: "Recomendado",
      connected: driveConnected,
      connectHref: "/api/integrations/google/connect",
      onDisconnect: handleDisconnectGoogle,
    },
    {
      id: "gmail",
      name: "Gmail",
      description:
        "Salve e-mails importantes como memórias. Peça ao OSC para buscar ou resumir e-mails. Conecte o Google Drive para habilitar.",
      icon: "📧",
      badge: null,
      connected: gmailConnected,
      connectHref: "/api/integrations/google/connect",
      onDisconnect: handleDisconnectGoogle,
    },
    {
      id: "obsidian",
      name: "Obsidian Vault",
      description:
        "Sincronize suas notas do Obsidian com a memória do OSC. Use REST API local, upload de .md ou via Google Drive.",
      icon: "🟣",
      badge: null,
      connected: false,
      connectHref: "/dashboard/integracoes/obsidian",
      onDisconnect: null,
    },
    {
      id: "notion",
      name: "Notion",
      description: "Salve memórias diretamente em páginas do seu Notion.",
      icon: "⬛",
      badge: "Em breve",
      connected: false,
      connectHref: "",
      onDisconnect: null,
    },
    {
      id: "calendar",
      name: "Google Agenda",
      description: "Sincronize compromissos criados no OSC com seu Google Calendar.",
      icon: "📆",
      badge: "Em breve",
      connected: false,
      connectHref: "",
      onDisconnect: null,
    },
    {
      id: "mobile",
      name: "App Android & iOS",
      description:
        "Em breve: acesse o painel OSC pelo celular. Notas, lembretes e arquivos no seu smartphone.",
      icon: "📱",
      badge: "Em breve",
      connected: false,
      connectHref: "",
      onDisconnect: null,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">🔗 Integrações</h1>
        <p className="mt-1 text-slate-400">
          Conecte o OSC com suas ferramentas favoritas.
        </p>
      </div>

      {justConnected === "google" && (
        <div className="mb-6 rounded-xl bg-green-500/10 border border-green-800 px-4 py-3 text-sm text-green-400">
          ✅ Google Drive e Gmail conectados! Seus arquivos agora serão salvos no seu Drive.
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl bg-red-500/10 border border-red-800 px-4 py-3 text-sm text-red-400">
          ❌ Erro ao conectar: {error === "auth_failed" ? "Falha na autenticação. Tente novamente." : error}
        </div>
      )}

      {/* Destaque: Drive salva no Drive do usuário */}
      {!driveConnected && (
        <div className="mb-6 card border-brand-500/40 bg-brand-500/5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-semibold text-white">
                Conecte o Google Drive e economize armazenamento
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Com o Drive conectado, seus arquivos ficam na sua conta Google (15 GB grátis),
                não ocupam cota do OSC e você tem controle total sobre eles.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((intg) => {
          const comingSoon = intg.badge === "Em breve";
          return (
            <div key={intg.id} className="card flex flex-col">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{intg.icon}</span>
                  <div>
                    <h3 className="font-semibold text-white">{intg.name}</h3>
                    {intg.connected ? (
                      <span className="text-xs text-green-400">● Conectado</span>
                    ) : comingSoon ? (
                      <span className="text-xs text-slate-500">Em breve</span>
                    ) : (
                      <span className="text-xs text-slate-500">● Não conectado</span>
                    )}
                  </div>
                </div>
                {intg.badge && intg.badge !== "Em breve" && (
                  <span className="shrink-0 rounded-full bg-brand-500/20 px-2 py-0.5 text-xs font-medium text-brand-400">
                    {intg.badge}
                  </span>
                )}
              </div>

              <p className="mb-4 flex-1 text-sm text-slate-400">{intg.description}</p>

              {comingSoon ? (
                <button
                  disabled
                  className="w-full rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-600 cursor-not-allowed"
                >
                  Em breve
                </button>
              ) : intg.connected ? (
                <button
                  onClick={intg.onDisconnect ?? undefined}
                  disabled={disconnecting}
                  className="w-full rounded-xl border border-red-800 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                >
                  {disconnecting ? "Desconectando..." : "Desconectar"}
                </button>
              ) : (
                <a href={intg.connectHref} className="btn-primary w-full justify-center py-2 text-center">
                  Conectar
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* Instrução Obsidian */}
      <div className="mt-8 card border-purple-800/50">
        <h2 className="mb-3 font-semibold text-white">🟣 Obsidian Vault — Como conectar</h2>
        <div className="space-y-3 text-sm text-slate-400">
          <div>
            <p className="font-medium text-white">Opção 1 — REST API (recomendada)</p>
            <p>
              Instale o plugin <em>Local REST API</em> no Obsidian, ative-o e copie a URL
              e o token de API. Cole aqui nas configurações da integração.
              O OSC sincroniza suas notas automaticamente.
            </p>
          </div>
          <div>
            <p className="font-medium text-white">Opção 2 — Upload de arquivos .md</p>
            <p>
              Exporte notas do seu Vault como Markdown e envie pelo WhatsApp.
              O OSC importa e cria memórias a partir do conteúdo.
            </p>
          </div>
          <div>
            <p className="font-medium text-white">Opção 3 — Via Google Drive</p>
            <p>
              Configure seu Obsidian Vault para sincronizar com uma pasta do Google Drive.
              Conecte o Drive ao OSC e ele processará os arquivos automaticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
