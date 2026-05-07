import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@osc/database";

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  note: { label: "Nota", color: "bg-blue-500/20 text-blue-400" },
  health: { label: "Saúde", color: "bg-red-500/20 text-red-400" },
  contact: { label: "Contato", color: "bg-purple-500/20 text-purple-400" },
  task: { label: "Tarefa", color: "bg-yellow-500/20 text-yellow-400" },
  info: { label: "Info", color: "bg-green-500/20 text-green-400" },
  document: { label: "Documento", color: "bg-orange-500/20 text-orange-400" },
};

export default async function NotasPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
  });

  const memories = await prisma.memory.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">📝 Notas & Memórias</h1>
          <p className="mt-1 text-slate-400">
            {memories.length} item{memories.length !== 1 ? "s" : ""} salvos via WhatsApp
          </p>
        </div>
      </div>

      {memories.length === 0 ? (
        <div className="card text-center py-16">
          <div className="mb-4 text-5xl">🧠</div>
          <h2 className="mb-2 text-lg font-semibold text-white">
            Sua memória está vazia
          </h2>
          <p className="text-slate-400">
            Envie uma mensagem para o OSC no WhatsApp para começar a salvar.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {memories.map((m) => {
            const typeInfo = TYPE_LABELS[m.type] ?? { label: m.type, color: "bg-slate-700 text-slate-300" };
            return (
              <div key={m.id} className="card hover:border-slate-700 transition flex flex-col">
                <div className="mb-3 flex items-start justify-between gap-2">
                  {m.title && (
                    <h3 className="font-semibold text-white text-sm leading-snug">
                      {m.title}
                    </h3>
                  )}
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${typeInfo.color}`}>
                    {typeInfo.label}
                  </span>
                </div>
                <p className="flex-1 text-sm text-slate-400 line-clamp-4 whitespace-pre-wrap">
                  {m.content}
                </p>
                {m.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {m.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-xs text-slate-600">
                  {new Date(m.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
