# OSC — Segundo Cérebro

Chatbot para WhatsApp com memória persistente, agendamentos, lembretes e processamento de texto, imagens, áudios e documentos.

## Stack

- **Bot**: Node.js + TypeScript + Baileys
- **IA**: Claude API (Anthropic)
- **Banco**: PostgreSQL + pgvector
- **Cache/Fila**: Redis + BullMQ
- **Arquivos**: MinIO
- **Frontend**: Next.js 14
- **Deploy**: Docker Compose + Nginx

## Estrutura

```
apps/
  bot/          # Serviço do bot WhatsApp
  web/          # Frontend (landing, cadastro, login, dashboard)
packages/
  database/     # Prisma schema e migrações
  shared/       # Tipos e utilitários compartilhados
nginx/          # Configuração do reverse proxy
docs/           # Documentação
```

## Início Rápido

```bash
cp .env.example .env
# Edite o .env com suas chaves
docker compose up -d
```

## Planos

| Recurso | Grátis | Pro |
|---|---|---|
| Mensagens/dia | 50 | Ilimitado |
| Armazenamento | 100 MB | 10 GB |
| Lembretes ativos | 5 | Ilimitado |
| Histórico de memória | 30 dias | Ilimitado |
| PDFs e documentos | 3/mês | Ilimitado |
| Suporte | Comunidade | Prioritário |
