import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@osc/database";
import Link from "next/link";

export default async function PlanoPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
    include: { plan: true },
  });

  if (!user) return null;

  const now = new Date();
  const trialActive =
    user.trialEndsAt && user.trialEndsAt > now && !user.subscriptionId;
  const trialDaysLeft = trialActive
    ? Math.ceil((user.trialEndsAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const isPro = user.plan.name === "pro" || !!user.subscriptionId;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-white">⭐ Meu Plano</h1>
      <p className="mb-8 text-slate-400">Gerencie sua assinatura e veja seu uso.</p>

      {/* Status atual */}
      <div className="card mb-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400">Plano atual</p>
            <h2 className="text-2xl font-bold text-white">
              {isPro ? "🌟 Pro" : "🆓 " + user.plan.displayName}
            </h2>
          </div>
          {trialActive && (
            <span className="rounded-full bg-brand-500/20 px-3 py-1 text-sm font-medium text-brand-400">
              Trial: {trialDaysLeft} dia{trialDaysLeft !== 1 ? "s" : ""} restante{trialDaysLeft !== 1 ? "s" : ""}
            </span>
          )}
          {user.subscriptionStatus === "active" && (
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-400">
              ✓ Assinatura ativa
            </span>
          )}
        </div>

        {trialActive && (
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 px-4 py-3 mb-4">
            <p className="text-sm text-yellow-300">
              Seu trial expira em {user.trialEndsAt!.toLocaleDateString("pt-BR")}.
              Assine o Pro antes para não perder o acesso.
            </p>
          </div>
        )}
      </div>

      {/* Comparação de planos */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Free */}
        <div className={`card ${user.plan.name === "free" && !trialActive ? "border-brand-500" : ""}`}>
          <h3 className="mb-1 text-xl font-bold text-white">Grátis</h3>
          <p className="mb-4 text-3xl font-extrabold text-white">R$ 0<span className="text-base font-normal text-slate-400">/mês</span></p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>✓ 50 mensagens por dia</li>
            <li>✓ 30k tokens de IA por dia</li>
            <li>✓ 100 MB de armazenamento</li>
            <li>✓ 5 lembretes ativos</li>
            <li>✓ Histórico de 30 dias</li>
            <li>✓ 3 documentos por mês</li>
          </ul>
        </div>

        {/* Pro */}
        <div className={`card ${isPro || trialActive ? "border-brand-500 ring-1 ring-brand-500" : ""}`}>
          <div className="mb-2 inline-flex rounded-full bg-brand-500/20 px-2 py-0.5 text-xs font-semibold text-brand-400">
            ⭐ Recomendado
          </div>
          <h3 className="mb-1 text-xl font-bold text-white">Pro</h3>
          <p className="mb-4 text-3xl font-extrabold text-white">R$ 29<span className="text-base font-normal text-slate-400">/mês</span></p>
          <ul className="mb-6 space-y-2 text-sm text-slate-300">
            <li>✓ Mensagens ilimitadas</li>
            <li>✓ Tokens de IA ilimitados</li>
            <li>✓ 10 GB no Google Drive</li>
            <li>✓ Lembretes ilimitados</li>
            <li>✓ Histórico ilimitado</li>
            <li>✓ Documentos ilimitados</li>
            <li>✓ Google Drive + Gmail + Obsidian</li>
            <li>✓ Suporte prioritário</li>
          </ul>

          {isPro ? (
            <button className="btn-outline w-full justify-center" disabled>
              Plano atual
            </button>
          ) : (
            <form action="/api/billing/checkout" method="POST">
              <button type="submit" className="btn-primary w-full justify-center">
                Assinar Pro
              </button>
            </form>
          )}
        </div>
      </div>

      {isPro && (
        <div className="mt-6 card">
          <h2 className="mb-3 font-semibold text-white">Gerenciar assinatura</h2>
          <p className="mb-4 text-sm text-slate-400">
            Atualize forma de pagamento, baixe faturas ou cancele sua assinatura.
          </p>
          <form action="/api/billing/portal" method="POST">
            <button type="submit" className="btn-outline">
              Abrir portal de pagamentos
            </button>
          </form>
        </div>
      )}

      <div className="mt-6 text-center text-sm text-slate-500">
        Dúvidas?{" "}
        <Link href="mailto:suporte@osc.app" className="text-brand-400 hover:underline">
          Fale com o suporte
        </Link>
      </div>
    </div>
  );
}
