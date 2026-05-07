"use client";

import { useState } from "react";

const integrations = [
  {
    id: "google-drive",
    name: "Google Drive",
    description:
      "Salve e acesse arquivos do Drive diretamente pelo WhatsApp. Envie um arquivo e o OSC salva no seu Drive.",
    icon: "🟢",
    status: "available",
    connectPath: "/api/integrations/google/connect",
  },
  {
    id: "gmail",
    name: "Gmail",
    description:
      "Salve e-mails importantes como memórias. Peça ao OSC para buscar ou resumir e-mails do seu Gmail.",
    icon: "📧",
    status: "available",
    connectPath: "/api/integrations/google/connect",
  },
  {
    id: "obsidian",
    name: "Obsidian Vault",
    description:
      "Sincronize suas notas do Obsidian (Brain Vault) com a memória do OSC via API REST do Obsidian ou upload de arquivos .md.",
    icon: "🟣",
    status: "available",
    connectPath: "/dashboard/integracoes/obsidian",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Salve memórias e notas diretamente em páginas do seu Notion.",
    icon: "⬛",
    status: "coming_soon",
    connectPath: "",
  },
  {
    id: "calendar",
    name: "Google Agenda",
    description: "Sincronize compromissos criados no OSC com seu Google Calendar.",
    icon: "📆",
    status: "coming_soon",
    connectPath: "",
  },
  {
    id: "mobile",
    name: "App Android & iOS",
    description:
      "Em breve: acesse todo o painel OSC pelo celular. Visualize notas, lembretes e arquivos no seu smartphone.",
    icon: "📱",
    status: "coming_soon",
    connectPath: "",
  },
];

export default function IntegracoesPage() {
  const [connected, setConnected] = useState<string[]>([]);

  const handleConnect = async (id: string, path: string) => {
    if (id === "obsidian") {
      window.location.href = path;
      return;
    }
    window.location.href = path;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">🔗 Integrações</h1>
        <p className="mt-1 text-slate-400">
          Conecte o OSC com suas ferramentas favoritas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((intg) => (
          <div key={intg.id} className="card flex flex-col">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-3xl">{intg.icon}</span>
              <div>
                <h3 className="font-semibold text-white">{intg.name}</h3>
                {intg.status === "coming_soon" ? (
                  <span className="text-xs text-slate-500">Em breve</span>
                ) : connected.includes(intg.id) ? (
                  <span className="text-xs text-green-400">● Conectado</span>
                ) : (
                  <span className="text-xs text-slate-500">● Não conectado</span>
                )}
              </div>
            </div>

            <p className="mb-4 flex-1 text-sm text-slate-400">{intg.description}</p>

            {intg.status === "coming_soon" ? (
              <button
                disabled
                className="w-full rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-600 cursor-not-allowed"
              >
                Em breve
              </button>
            ) : connected.includes(intg.id) ? (
              <button
                onClick={() => setConnected((c) => c.filter((x) => x !== intg.id))}
                className="w-full rounded-xl border border-red-800 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition"
              >
                Desconectar
              </button>
            ) : (
              <button
                onClick={() => handleConnect(intg.id, intg.connectPath)}
                className="btn-primary w-full justify-center py-2"
              >
                Conectar
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Obsidian instructions */}
      <div className="mt-8 card border-purple-800/50">
        <h2 className="mb-3 font-semibold text-white">🟣 Como usar o Obsidian Vault</h2>
        <div className="space-y-2 text-sm text-slate-400">
          <p>
            <strong className="text-white">Opção 1 — REST API:</strong> Instale o plugin
            &quot;Local REST API&quot; no Obsidian, ative-o e cole a URL + token na integração.
            O OSC vai sincronizar suas notas automaticamente.
          </p>
          <p>
            <strong className="text-white">Opção 2 — Upload de arquivos .md:</strong> Exporte
            as notas do seu Vault como Markdown e envie o arquivo pelo WhatsApp. O OSC
            processa e importa tudo para sua memória.
          </p>
          <p>
            <strong className="text-white">Opção 3 — Pasta sincronizada:</strong> Configure
            seu Vault em uma pasta do Google Drive e conecte o Drive ao OSC para
            sincronização automática.
          </p>
        </div>
      </div>
    </div>
  );
}
