import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@osc/database";

export default async function SaudePage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
  });

  const healthMemories = await prisma.memory.findMany({
    where: {
      userId: user!.id,
      OR: [
        { type: "health" },
        { tags: { has: "saude" } },
        { tags: { has: "saúde" } },
        { tags: { has: "medico" } },
        { tags: { has: "remedio" } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">❤️ Saúde</h1>
        <p className="mt-1 text-slate-400">
          Informações de saúde, consultas, exames e medicamentos.
        </p>
      </div>

      {healthMemories.length === 0 ? (
        <div className="card py-16 text-center">
          <div className="mb-4 text-5xl">❤️</div>
          <h2 className="mb-2 text-lg font-semibold text-white">
            Nenhuma informação de saúde salva
          </h2>
          <p className="text-slate-400">
            Mande mensagens como:
            <br />
            <em>&quot;Salva: pressão arterial 12 por 8 hoje&quot;</em>
            <br />
            <em>&quot;Anota: tomar dipirona 500mg de 8 em 8 horas&quot;</em>
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {healthMemories.map((m) => (
            <div key={m.id} className="card border-red-500/20">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xl">❤️</span>
                {m.title && (
                  <h3 className="font-semibold text-white text-sm">{m.title}</h3>
                )}
              </div>
              <p className="text-sm text-slate-400 whitespace-pre-wrap">{m.content}</p>
              {m.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {m.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-3 text-xs text-slate-600">
                {new Date(m.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
