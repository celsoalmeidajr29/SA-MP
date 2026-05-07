# Roadmap OSC

## ✅ Fase 1 — MVP (Concluída localmente)

- [x] Monorepo estruturado (apps/bot, apps/web, packages/database)
- [x] Schema Prisma completo (User, Plan, Memory, Appointment, Reminder, UserFile, Conversation, Session)
- [x] Bot WhatsApp com Baileys
- [x] Handlers: texto, áudio (Whisper), imagem (Claude Vision), documento
- [x] Detecção de intenção: salvar, agendar, lembrete, chat livre
- [x] IA com Claude API + busca semântica (pgvector)
- [x] Agendamentos com BullMQ + Redis
- [x] Google Drive como storage principal (Drive do usuário)
- [x] OAuth Google completo (connect/callback/disconnect)
- [x] Frontend Next.js: landing, cadastro, login
- [x] Dashboard: notas, arquivos, lembretes, compromissos
- [x] Página de integrações (Drive, Gmail, Obsidian)
- [x] Trial 7 dias automático para novos usuários
- [x] Limite de tokens de IA por plano
- [x] Planos Free e Pro com limites no banco
- [x] Docker Compose (PostgreSQL+pgvector, Redis, MinIO, Nginx)
- [x] Vault Obsidian com documentação completa

## 🔲 Fase 2 — Pós-VPS

- [ ] Stripe: assinaturas Pro, webhook de pagamento
- [ ] Página `/dashboard/plano` com botão de upgrade
- [ ] Página de saúde (`/dashboard/saude`) — memórias do tipo health
- [ ] Integração Obsidian via REST API
- [ ] Sincronização Google Calendar
- [ ] Cache de respostas IA no Redis (economia de tokens)
- [ ] Roteamento por complexidade (Haiku vs Opus)
- [ ] Analytics no dashboard (memórias por categoria, gráfico de uso)
- [ ] Export de dados (JSON, Markdown)
- [ ] Notificações por email (SendGrid/Resend)

## 🔲 Fase 3 — App Mobile

- [ ] React Native + Expo
- [ ] Telas: Dashboard, Notas, Lembretes, Arquivos, Integrações
- [ ] Autenticação via mesmo backend (NextAuth JWT)
- [ ] Push notifications nativas (Expo Notifications)
- [ ] Publicação na App Store e Google Play

## 🔲 Fase 4 — Escala

- [ ] Migrar para WhatsApp Business API oficial (Meta Cloud API)
- [ ] Multi-número WhatsApp (para times)
- [ ] Migrar para plataforma gerenciada (Railway/Render)
- [ ] API pública para desenvolvedores
- [ ] Plano Família / Empresarial
- [ ] Kubernetes para alta disponibilidade
