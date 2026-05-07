"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Visão geral", icon: "🏠" },
  { href: "/dashboard/notas", label: "Notas", icon: "📝" },
  { href: "/dashboard/arquivos", label: "Arquivos", icon: "📁" },
  { href: "/dashboard/lembretes", label: "Lembretes", icon: "⏰" },
  { href: "/dashboard/compromissos", label: "Compromissos", icon: "📅" },
  { href: "/dashboard/saude", label: "Saúde", icon: "❤️" },
  { href: "/dashboard/integracoes", label: "Integrações", icon: "🔗" },
  { href: "/dashboard/plano", label: "Meu plano", icon: "⭐" },
];

export default function Sidebar({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 border-r border-slate-800 bg-slate-900 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <Link href="/" className="text-xl font-bold text-white">
          OSC<span className="text-brand-500">.</span>
        </Link>
        <p className="mt-1 text-xs text-slate-500">Segundo Cérebro</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-brand-500/20 text-brand-400 font-medium"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium text-white truncate">{user.name}</p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          🚪 Sair
        </button>
      </div>
    </aside>
  );
}
