import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@osc/database";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
    include: { plan: true },
  });

  if (!user) return null;

  const now = new Date();
  const trialActive = user.trialEndsAt && user.trialEndsAt > now && !user.subscriptionId;
  const trialDaysLeft = trialActive
    ? Math.ceil((user.trialEndsAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const [memoryCount, reminderCount, appointmentCount, fileCount] =
    await Promise.all([
      prisma.memory.count({ where: { userId: user.id } }),
      prisma.reminder.count({ where: { userId: user.id, status: "pending" } }),
      prisma.appointment.count({ where: { userId: user.id, status: "pending" } }),
      prisma.userFile.count({ where: { userId: user.id } }),
    ]);

  const stats = [
    { label: "Memórias salvas", value: memoryCount, icon: "🧠", href: "/dashboard/notas" },
    { label: "Lembretes ativos", value: reminderCount, icon: "⏰", href: "/dashboard/lembretes" },
    { label: "Compromissos", value: appointmentCount, icon: "📅", href: "/dashboard/compromissos" },
    { label: "Arquivos", value: fileCount, icon: "📁", href: "/dashboard/arquivos" },
  ];

  const usagePct = Math.round((user.messagesUsedToday / user.plan.messagesPerDay) * 100);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-white">
        Olá, {user.name.split(" ")[0]}! 👋
      </h1>
      <p className="mb-4 text-slate-400">Aqui está um resumo do seu segundo cérebro.</p>

      {/* Banner de trial */}
      {trialActive && (
        <div className="mb-6 rounded-xl border border-brand-500/40 bg-brand-500/10 px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-white">
              🎉 Você está no período de teste gratuito — {trialDaysLeft} dia{trialDaysLeft !== 1 ? "s" : ""} restante{trialDaysLeft !== 1 ? "s" : ""}
            </p>
            <p className="text-sm text-slate-400">
              Aproveite todos os recursos Pro gratuitamente. Assine antes de expirar para não perder acesso.
            </p>
          </div>
          <Link href="/dashboard/plano" className="btn-primary shrink-0 py-2 text-sm">
            Assinar Pro
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card hover:border-slate-700 transition">
            <div className="mb-2 text-2xl">{s.icon}</div>
            <div className="text-3xl font-bold text-white">{s.value}</div>
            <div className="text-sm text-slate-400">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Uso diário */}
      <div className="card mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-white">Uso hoje</h2>
          <span className="text-sm text-slate-400">Plano {user.plan.displayName}</span>
        </div>

        {/* Mensagens */}
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-slate-400">Mensagens</span>
          <span className="text-white">
            {user.messagesUsedToday} / {user.plan.messagesPerDay === 99999 ? "∞" : user.plan.messagesPerDay}
          </span>
        </div>
        <div className="mb-4 h-2 rounded-full bg-slate-800">
          <div
            className={`h-2 rounded-full transition-all ${usagePct >= 90 ? "bg-red-500" : usagePct >= 70 ? "bg-yellow-500" : "bg-brand-500"}`}
            style={{ width: `${Math.min(usagePct, 100)}%` }}
          />
        </div>

        {/* Tokens de IA */}
        {user.plan.aiTokensPerDay > 0 && (
          <>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-400">Tokens de IA</span>
              <span className="text-white">
                {user.aiTokensUsedToday.toLocaleString()} / {(user.plan.aiTokensPerDay / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="mb-4 h-2 rounded-full bg-slate-800">
              {(() => {
                const tokenPct = Math.round((user.aiTokensUsedToday / user.plan.aiTokensPerDay) * 100);
                return (
                  <div
                    className={`h-2 rounded-full transition-all ${tokenPct >= 90 ? "bg-red-500" : tokenPct >= 70 ? "bg-yellow-500" : "bg-purple-500"}`}
                    style={{ width: `${Math.min(tokenPct, 100)}%` }}
                  />
                );
              })()}
            </div>
          </>
        )}

        {!user.subscriptionId && !trialActive && user.plan.name !== "pro" && (
          <p className="text-sm text-slate-500">
            Quer limites maiores?{" "}
            <Link href="/dashboard/plano" className="text-brand-400 hover:underline">
              Faça upgrade para o Pro
            </Link>
          </p>
        )}
      </div>

      {/* Quick actions */}
      <h2 className="mb-4 font-semibold text-white">Ações rápidas</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Ver notas", href: "/dashboard/notas", icon: "📝" },
          { label: "Ver lembretes", href: "/dashboard/lembretes", icon: "⏰" },
          { label: "Integrações", href: "/dashboard/integracoes", icon: "🔗" },
        ].map((a) => (
          <Link key={a.label} href={a.href} className="card flex items-center gap-3 hover:border-slate-700 transition">
            <span className="text-2xl">{a.icon}</span>
            <span className="font-medium text-white">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
