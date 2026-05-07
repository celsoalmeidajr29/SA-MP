# Variáveis de Ambiente — .env completo

> Copie este conteúdo para o arquivo `.env` na VPS após preencher os valores.

```bash
# ─── Banco de dados ─────────────────────────────────────────────────────────
# Na VPS: o hostname é "postgres" (nome do serviço Docker)
DATABASE_URL=postgresql://osc:SENHA_SEGURA@postgres:5432/oscdb
POSTGRES_USER=osc
POSTGRES_PASSWORD=SENHA_SEGURA
POSTGRES_DB=oscdb

# ─── Redis ──────────────────────────────────────────────────────────────────
REDIS_URL=redis://:SENHA_REDIS@redis:6379
REDIS_PASSWORD=SENHA_REDIS

# ─── MinIO (armazenamento fallback) ──────────────────────────────────────────
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=oscminio
MINIO_SECRET_KEY=SENHA_MINIO
MINIO_BUCKET=osc-files
MINIO_ROOT_USER=oscminio
MINIO_ROOT_PASSWORD=SENHA_MINIO

# ─── IA ──────────────────────────────────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-COLOQUE_SUA_CHAVE
OPENAI_API_KEY=sk-COLOQUE_SUA_CHAVE

# ─── Auth ────────────────────────────────────────────────────────────────────
# Gerar com: openssl rand -base64 32
NEXTAUTH_SECRET=GERE_UMA_CHAVE_SEGURA
NEXTAUTH_URL=https://SEU_DOMINIO

# ─── Stripe ──────────────────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# ─── Google OAuth ─────────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REDIRECT_URI=https://SEU_DOMINIO/api/integrations/google/callback

# ─── Bot ─────────────────────────────────────────────────────────────────────
SESSION_PATH=./sessions
TZ=America/Sao_Paulo
NODE_ENV=production
```

## Senhas que você precisa inventar (podem ser qualquer string forte)

| Variável | Exemplo seguro |
|---|---|
| `POSTGRES_PASSWORD` | `Tr0ub4dor&3_pg` |
| `REDIS_PASSWORD` | `Tr0ub4dor&3_redis` |
| `MINIO_SECRET_KEY` | `Tr0ub4dor&3_minio` |

> Use um gerenciador de senhas (Bitwarden, 1Password) para gerar e guardar essas senhas.
