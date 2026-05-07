# 🧠 OSC — Segundo Cérebro
> Chatbot WhatsApp com memória inteligente, agendamentos e integrações

**Status atual:** `🟡 Em desenvolvimento — Código pronto, aguardando VPS`
**Última atualização:** 2026-05-07
**Repositório:** `celsoalmeidajr29/SA-MP` → branch `claude/clean-up-repository-RfVTr`

---

## 🗺️ Mapa de Notas

### Projeto
- [[01-Projeto/Visão Geral]] — O que é, para quem é, planos
- [[01-Projeto/Funcionalidades]] — Lista completa de features
- [[01-Projeto/Roadmap]] — Fases passadas e futuras

### Técnico
- [[02-Tecnico/Arquitetura]] — Stack, fluxo de dados, estrutura de pastas
- [[02-Tecnico/Banco de Dados]] — Schema Prisma, modelos, relações
- [[02-Tecnico/IA e Memória]] — Claude API, embeddings, pgvector
- [[02-Tecnico/WhatsApp Bot]] — Baileys, handlers, fluxos

### VPS — Próximos Passos
- [[03-VPS/✅ Checklist VPS]] — Passo a passo completo para subir em produção
- [[03-VPS/Comandos Úteis]] — Git, Docker, banco, logs

### Chaves e Configurações
- [[04-Chaves/🔑 Chaves Necessárias]] — Todas as APIs e onde obter
- [[04-Chaves/Variáveis de Ambiente]] — .env completo comentado

### Custos
- [[05-Custos/Análise de Custos]] — Por escala (1, 100, 1000, 10000 usuários)

---

## 🚦 Status dos Componentes

| Componente | Status | Notas |
|---|---|---|
| Schema do banco (Prisma) | ✅ Pronto | Com trial, tokens, Google OAuth |
| Bot WhatsApp (Baileys) | ✅ Pronto | Handlers de texto, áudio, doc, imagem |
| IA + Memória (Claude) | ✅ Pronto | Embeddings + busca semântica |
| Agendamentos (BullMQ) | ✅ Pronto | Lembretes e compromissos |
| Google Drive storage | ✅ Pronto | Drive do usuário como backend |
| OAuth Google | ✅ Pronto | Drive + Gmail |
| Frontend — Landing | ✅ Pronto | Página de vendas com planos |
| Frontend — Cadastro | ✅ Pronto | Trial 7 dias automático |
| Frontend — Login | ✅ Pronto | NextAuth credentials |
| Frontend — Dashboard | ✅ Pronto | Stats, notas, arquivos, lembretes |
| Frontend — Integrações | ✅ Pronto | Drive, Gmail, Obsidian |
| Docker Compose | ✅ Pronto | PostgreSQL+pgvector, Redis, MinIO, Nginx |
| App Mobile (React Native) | 🔲 Roadmap | Fase 2 |
| Stripe Pagamentos | 🔲 Pendente | Precisa de conta Stripe |
| pgvector na VPS | 🔲 Pendente | Instalar na VPS |

---

## ⏭️ Próxima Ação Imediata

**→ [[03-VPS/✅ Checklist VPS]]**

Tudo que precisa ser feito agora está nessa nota, passo a passo.
