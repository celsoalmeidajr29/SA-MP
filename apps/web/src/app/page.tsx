import Link from "next/link";

const features = [
  {
    icon: "🧠",
    title: "Memória Inteligente",
    desc: "Salve notas, informações, contatos e qualquer coisa via WhatsApp. O OSC lembra de tudo por você.",
  },
  {
    icon: "📅",
    title: "Compromissos e Lembretes",
    desc: "Agende compromissos pelo chat e receba notificações automáticas no WhatsApp na hora certa.",
  },
  {
    icon: "📄",
    title: "PDFs e Documentos",
    desc: "Envie arquivos, PDFs, imagens e áudios. O OSC lê, processa e resume tudo para você.",
  },
  {
    icon: "🎤",
    title: "Áudio para Texto",
    desc: "Mande mensagens de voz e o OSC transcreve e salva automaticamente na sua memória.",
  },
  {
    icon: "🔍",
    title: "Busca Semântica",
    desc: "Pergunte qualquer coisa e o OSC encontra exatamente o que você precisa no seu histórico.",
  },
  {
    icon: "🔗",
    title: "Integrações",
    desc: "Conecte com Google Drive e Gmail para salvar e acessar arquivos diretamente pelo WhatsApp.",
  },
];

const plans = [
  {
    name: "Grátis",
    price: "R$ 0",
    period: "/mês",
    highlight: false,
    features: [
      "50 mensagens por dia",
      "100 MB de armazenamento",
      "5 lembretes ativos",
      "Histórico de 30 dias",
      "3 documentos por mês",
      "Suporte da comunidade",
    ],
    cta: "Começar grátis",
    href: "/cadastro",
  },
  {
    name: "Pro",
    price: "R$ 29",
    period: "/mês",
    highlight: true,
    features: [
      "Mensagens ilimitadas",
      "10 GB de armazenamento",
      "Lembretes ilimitados",
      "Histórico ilimitado",
      "Documentos ilimitados",
      "Google Drive & Gmail",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro",
    href: "/cadastro?plano=pro",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-white">
            OSC<span className="text-brand-500">.</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-slate-400 hover:text-white">
              Entrar
            </Link>
            <Link href="/cadastro" className="btn-primary py-2 text-sm">
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-400">
          🧠 Seu Segundo Cérebro no WhatsApp
        </div>
        <h1 className="mb-6 text-5xl font-extrabold leading-tight text-white sm:text-6xl">
          Salve tudo.
          <br />
          <span className="text-brand-500">Lembre de tudo.</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400">
          O OSC é um chatbot inteligente para WhatsApp que funciona como sua
          memória pessoal. Anote, agende, envie arquivos e pergunte qualquer
          coisa — 24 horas por dia.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/cadastro" className="btn-primary px-8 py-4 text-base">
            Começar grátis agora
          </Link>
          <Link href="#como-funciona" className="btn-outline px-8 py-4 text-base">
            Ver como funciona
          </Link>
        </div>
      </section>

      {/* Demo */}
      <section className="mx-auto max-w-6xl px-6 pb-24" id="como-funciona">
        <div className="card mx-auto max-w-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand-500 flex items-center justify-center text-lg">🧠</div>
            <div>
              <p className="text-sm font-semibold text-white">OSC</p>
              <p className="text-xs text-green-400">● Online agora</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { from: "user", text: "Salva: reunião com cliente João na quinta às 14h" },
              { from: "bot", text: "✅ Anotado! Compromisso agendado para quinta às 14h. Vou te avisar na hora!" },
              { from: "user", text: "Me resume o PDF que enviei semana passada" },
              { from: "bot", text: "📄 Aqui está o resumo do \"Proposta Comercial.pdf\":\n\n• Serviços de consultoria por R$ 5.000/mês\n• Prazo de 6 meses\n• Entrega mensal de relatórios..." },
            ].map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
                    msg.from === "user"
                      ? "bg-brand-500 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-900/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-white">
            Tudo que você precisa em um só lugar
          </h2>
          <p className="mb-16 text-center text-slate-400">
            Funcionalidades pensadas para quem não quer perder nada.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card hover:border-slate-700 transition">
                <div className="mb-4 text-3xl">{f.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="planos" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-white">
            Planos simples e transparentes
          </h2>
          <p className="mb-16 text-center text-slate-400">
            Comece grátis. Faça upgrade quando precisar.
          </p>
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-stretch sm:justify-center">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`card w-full max-w-sm flex flex-col ${
                  plan.highlight
                    ? "border-brand-500 ring-1 ring-brand-500"
                    : ""
                }`}
              >
                {plan.highlight && (
                  <div className="mb-4 inline-flex items-center rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-400">
                    ⭐ Mais popular
                  </div>
                )}
                <h3 className="mb-1 text-xl font-bold text-white">{plan.name}</h3>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    {plan.price}
                  </span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-green-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={plan.highlight ? "btn-primary justify-center" : "btn-outline justify-center"}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} OSC — Segundo Cérebro. Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}
