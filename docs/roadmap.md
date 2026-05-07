# OSC — Roadmap

## Fase 1 — MVP (Atual)
- [x] Bot WhatsApp (Baileys)
- [x] Memória com IA (Claude + embeddings)
- [x] Agendamentos e lembretes (BullMQ)
- [x] Upload de arquivos e PDFs
- [x] Transcrição de áudio (Whisper)
- [x] Frontend: landing, cadastro, login, dashboard
- [x] Painel: notas, arquivos, lembretes
- [x] Integrações: Google Drive, Gmail, Obsidian
- [x] Plano Grátis e Pro (Stripe)

## Fase 2 — Pós-MVP
- [ ] App Android (React Native / Expo)
- [ ] App iOS (React Native / Expo)
- [ ] Google Calendar sync
- [ ] Notion integration
- [ ] WhatsApp Business API oficial (migrar do Baileys)
- [ ] Dashboard analytics (memórias por categoria, uso)
- [ ] Export de dados (JSON, Markdown)
- [ ] Compartilhamento de memórias entre usuários

## Fase 3 — Escala
- [ ] Migrar para cloud gerenciada (Railway, Render ou AWS)
- [ ] Multi-número WhatsApp (para times)
- [ ] API pública para desenvolvedores
- [ ] Plano Família / Empresarial

## App Mobile (React Native)

Estrutura planejada:

```
apps/mobile/          # React Native + Expo
  src/
    screens/
      DashboardScreen.tsx
      NotesScreen.tsx
      RemindersScreen.tsx
      FilesScreen.tsx
      IntegrationsScreen.tsx
    components/
    services/         # Consome a mesma API do web
```

O app mobile consumirá a mesma API Next.js do frontend web,
autenticando via NextAuth com JWT. Não haverá código duplicado —
toda lógica de negócio fica no backend.

## Integração Obsidian

Três modos:
1. **REST API**: Plugin "Local REST API" no Obsidian → OSC puxa notas via API
2. **Upload .md**: Envie arquivos Markdown pelo WhatsApp
3. **Google Drive**: Sincronize o Vault pelo Drive e conecte ao OSC
