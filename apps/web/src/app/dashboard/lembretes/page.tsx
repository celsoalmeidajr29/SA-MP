import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@osc/database";

export default async function LembretesPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
  });

  const reminders = await prisma.reminder.findMany({
    where: { userId: user!.id },
    orderBy: { scheduledAt: "asc" },
  });

  const appointments = await prisma.appointment.findMany({
    where: { userId: user!.id },
    orderBy: { scheduledAt: "asc" },
  });

  const now = new Date();

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-white">⏰ Lembretes & Compromissos</h1>

      {/* Compromissos */}
      <section className="mb-8">
        <h2 className="mb-4 font-semibold text-white">📅 Compromissos</h2>
        {appointments.length === 0 ? (
          <div className="card py-8 text-center text-slate-500">
            Nenhum compromisso. Envie uma mensagem para o OSC para agendar!
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => {
              const isPast = a.scheduledAt < now;
              return (
                <div
                  key={a.id}
                  className={`card flex items-start gap-4 ${isPast ? "opacity-50" : ""}`}
                >
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
                      a.status === "notified"
                        ? "bg-green-500/20 text-green-400"
                        : a.status === "canceled"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {a.status === "notified" ? "Notificado" : a.status === "canceled" ? "Cancelado" : "Pendente"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Lembretes */}
      <section>
        <h2 className="mb-4 font-semibold text-white">⏰ Lembretes</h2>
        {reminders.length === 0 ? (
          <div className="card py-8 text-center text-slate-500">
            Nenhum lembrete. Diga ao OSC para te lembrar de algo!
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((r) => (
              <div
                key={r.id}
                className={`card flex items-start gap-4 ${r.status !== "pending" ? "opacity-50" : ""}`}
              >
                <div className="text-2xl">⏰</div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{r.message}</p>
                  {r.repeat && (
                    <p className="text-xs text-slate-500">Repete: {r.repeat}</p>
                  )}
                  <p className="mt-1 text-sm text-brand-400">
                    {new Date(r.scheduledAt).toLocaleString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    r.status === "notified"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {r.status === "notified" ? "Enviado" : "Pendente"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
