# Arquitetura Técnica

## Stack Completa

| Camada | Tecnologia | Versão | Função |
|---|---|---|---|
| Bot WhatsApp | Baileys | 6.x | Conexão com WhatsApp sem API oficial |
| Backend Bot | Node.js + TypeScript | 22.x | Runtime principal |
| IA | Claude API (Anthropic) | claude-opus-4-7 | Chat, visão, resumos |
| Embeddings | OpenAI text-embedding-3-small | — | Busca semântica na memória |
| Transcrição áudio | OpenAI Whisper | whisper-1 | Áudio → texto |
| Banco principal | PostgreSQL 16 + pgvector | pg16 | Dados + busca vetorial |
| Cache / Fila | Redis 7 + BullMQ | — | Sessões e agendamentos |
| Armazenamento | Google Drive (usuário) + MinIO | — | Arquivos (Drive é prioritário) |
| Frontend | Next.js 14 | App Router | Landing, cadastro, dashboard |
| Auth | NextAuth.js | 4.x | JWT com credentials |
| Pagamentos | Stripe | — | Assinaturas Pro |
| Deploy | Docker Compose + Nginx | — | Portável VPS → Cloud |

## Fluxo de uma Mensagem

```
Usuário (WhatsApp)
    ↓  envia texto/áudio/imagem/doc
Baileys (recebe o evento)
    ↓
messageHandler.ts
    ├─ Verifica usuário cadastrado
    ├─ Verifica trial / limites (mensagens, tokens)
    ├─ Detecta intenção:
    │   ├─ SALVAR → saveMemory() → pgvector
    │   ├─ COMPROMISSO → parseAppointment() → BullMQ delay job
    │   ├─ LEMBRETE → parseReminder() → BullMQ delay job
    │   └─ CHAT LIVRE → chat() → Claude API + busca memória
    ├─ Áudio → Whisper → texto
    ├─ Documento → Drive ou MinIO → summarizeDocument() → Claude
    └─ Salva conversa no banco
BullMQ Worker (scheduler)
    └─ No horário agendado → sendMessage() → WhatsApp
```

## Estrutura de Pastas

```
apps/
  bot/
    src/
      config/index.ts          ← variáveis de ambiente tipadas
      handlers/
        messageHandler.ts      ← roteamento de intenções
      services/
        ai.ts                  ← Claude + embeddings + Whisper
        googleDrive.ts         ← upload/download/list no Drive
        scheduler.ts           ← BullMQ queues e workers
        storage.ts             ← MinIO (fallback)
      utils/
        dateParser.ts          ← extração de datas/horas do texto
      index.ts                 ← boot do bot + conexão WhatsApp
  web/
    src/app/
      page.tsx                 ← Landing page de vendas
      cadastro/page.tsx        ← Formulário de cadastro
      login/page.tsx           ← Login com NextAuth
      dashboard/
        page.tsx               ← Visão geral + stats + trial banner
        notas/page.tsx         ← Grid de memórias
        arquivos/page.tsx      ← Lista de arquivos com uso de storage
        lembretes/page.tsx     ← Compromissos e lembretes
        integracoes/           ← Drive, Gmail, Obsidian
      api/
        auth/[...nextauth]/    ← NextAuth handler
        auth/register/         ← Cadastro com trial automático
        integrations/google/   ← connect / callback / disconnect
packages/
  database/
    prisma/
      schema.prisma            ← Modelos principais (com pgvector)
      schema.local.prisma      ← Dev local (sem pgvector)
    src/index.ts               ← PrismaClient singleton exportado
obsidian/                      ← Este vault
nginx/nginx.conf               ← Reverse proxy + SSL
docker-compose.yml             ← Produção (todos os serviços)
docker-compose.dev.yml         ← Dev local (só infra: PG + Redis + MinIO)
.env.example                   ← Template de variáveis
```

## Decisões de Arquitetura

### Google Drive como storage principal
Arquivos vão direto para o Google Drive do usuário. Custo zero de armazenamento. O banco guarda só o `driveFileId`. Fallback para MinIO quando Drive não está conectado.

### pgvector para busca semântica
Embeddings de 1536 dimensões armazenados junto das memórias. Busca por similaridade de cosseno (`<=>` operator). Sem serviço separado de busca.

### BullMQ para agendamentos
Jobs com `delay` calculado pela diferença entre agora e o horário agendado. Persistidos no Redis. Worker dedicado envia a mensagem e marca como notificado.

### Baileys vs API oficial
Baileys é open-source e funciona com qualquer número. Ideal para MVP. Quando escalar (10k+ usuários), migrar para WhatsApp Business API oficial (Meta Cloud API).
