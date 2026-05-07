import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@osc/database";

function formatBytes(bytes: bigint): string {
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default async function ArquivosPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
    include: { plan: true },
  });

  const files = await prisma.userFile.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: "desc" },
  });

  const storageUsed = formatBytes(user!.storageUsedBytes);
  const storageTotal = formatBytes(user!.plan.storageBytes);
  const storagePct = Math.round(
    (Number(user!.storageUsedBytes) / Number(user!.plan.storageBytes)) * 100
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">📁 Arquivos</h1>
        <p className="mt-1 text-slate-400">{files.length} arquivo(s) armazenados</p>
      </div>

      {/* Storage usage */}
      <div className="card mb-8">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-slate-400">Armazenamento usado</span>
          <span className="text-white">
            {storageUsed} / {storageTotal}
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-800">
          <div
            className="h-2 rounded-full bg-brand-500 transition-all"
            style={{ width: `${Math.min(storagePct, 100)}%` }}
          />
        </div>
      </div>

      {files.length === 0 ? (
        <div className="card py-16 text-center">
          <div className="mb-4 text-5xl">📁</div>
          <h2 className="mb-2 text-lg font-semibold text-white">
            Nenhum arquivo ainda
          </h2>
          <p className="text-slate-400">
            Envie PDFs, imagens ou documentos para o OSC no WhatsApp.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((f) => (
            <div key={f.id} className="card flex items-start gap-4">
              <div className="text-2xl">
                {f.mimeType.includes("pdf")
                  ? "📄"
                  : f.mimeType.includes("image")
                  ? "🖼️"
                  : "📎"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{f.originalName}</p>
                <p className="text-xs text-slate-500">
                  {formatBytes(f.sizeBytes)} ·{" "}
                  {new Date(f.createdAt).toLocaleDateString("pt-BR")}
                </p>
                {f.summary && (
                  <p className="mt-2 text-sm text-slate-400 line-clamp-2">{f.summary}</p>
                )}
              </div>
              {f.processed && (
                <span className="shrink-0 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                  Processado
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
