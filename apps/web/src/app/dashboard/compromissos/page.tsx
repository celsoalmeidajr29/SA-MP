import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@osc/database";

export default async function CompromissosPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
  });

  const appointments = await prisma.appointment.findMany({
    where: { userId: user!.id },
    orderBy: { scheduledAt: "asc" },
  });

  const now = new Date();
  const upcoming = appointments.filter((a) => a.scheduledAt >= now);
  const past = appointments.filter((a) => a.scheduledAt < now);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">📅 Compromissos</h1>
        <p className="mt-1 text-slate-400">
          {upcoming.length} próximo{upcoming.length !== 1 ? "s" : ""},{" "}
          {past.length} passado{past.length !== 1 ? "s" : ""}
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="card py-16 text-center">
          <div className="mb-4 text-5xl">📅</div>
          <h2 className="mb-2 text-lg font-semibold text-white">
            Nenhum compromisso ainda
          </h2>
          <p className="text-slate-400">
            Mande uma mensagem para o OSC: <em>&quot;Agende reunião com João sexta às 15h&quot;</em>
          </p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-4 font-semibold text-white">⏭️ Próximos</h2>
              <div className="space-y-3">
                {upcoming.map((a) => (
                  <div key={a.id} className="card flex items-start gap-4">
                    <div className="text-2xl">📅</div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{a.title}</p>
                      {a.description && (
                        <p className="text-sm text-slate-400">{a.description}</p>
                      )}
                      <p className="mt-1 text-sm text-brand-400">
                        {new Date(a.scheduledAt).toLocaleString("pt-BR", {
                          timeZone: "America/Sao_Paulo",
                          dateStyle: "full",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.status === "canceled"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {a.status === "canceled" ? "Cancelado" : "Pendente"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="mb-4 font-semibold text-white">📜 Histórico</h2>
              <div className="space-y-3 opacity-60">
                {past.slice(0, 20).map((a) => (
                  <div key={a.id} className="card flex items-start gap-4">
                    <div className="text-2xl">📅</div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{a.title}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {new Date(a.scheduledAt).toLocaleString("pt-BR", {
                          timeZone: "America/Sao_Paulo",
                        })}
                      </p>
                    </div>
                    {a.status === "notified" && (
                      <span className="shrink-0 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                        ✓ Notificado
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
