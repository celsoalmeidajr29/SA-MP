# 🔑 Chaves e Credenciais Necessárias

> Antes de subir na VPS, você precisa dessas chaves. Veja onde obter cada uma.

---

## 1. Anthropic API (Claude) ⭐ Obrigatória

**Função:** IA do chatbot — chat, visão de imagens, resumo de documentos

**Onde obter:**
1. Acesse console.anthropic.com
2. Crie uma conta ou faça login
3. Vá em **API Keys** → **Create Key**
4. Copie a chave (começa com `sk-ant-`)

**Custo estimado:**
- claude-opus-4-7: ~$15/1M tokens input, $75/1M output
- Para 100 usuários/mês: ~$30-80/mês

**Variável:** `ANTHROPIC_API_KEY=sk-ant-...`

---

## 2. OpenAI API ⭐ Obrigatória

**Função:** Embeddings (busca semântica) + Whisper (transcrição de áudio)

**Onde obter:**
1. Acesse platform.openai.com
2. Vá em **API Keys** → **Create new secret key**
3. Copie a chave (começa com `sk-`)

**Custo estimado:**
- text-embedding-3-small: $0.02/1M tokens (muito barato)
- Whisper: $0.006/minuto de áudio
- Para 100 usuários/mês: ~$5-15/mês

**Variáveis:**
```
OPENAI_API_KEY=sk-...
```

---

## 3. Google Cloud (Drive + Gmail) — Integração Opcional

**Função:** Salvar arquivos no Google Drive do usuário, ler Gmail

**Onde obter:**
1. Acesse console.cloud.google.com
2. Crie um projeto: **OSC Segundo Cerebro**
3. Habilite as APIs:
   - **Google Drive API**
   - **Gmail API**
4. Vá em **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Tipo: **Web application**
6. Authorized redirect URIs: `https://SEU_DOMINIO/api/integrations/google/callback`
7. Copie Client ID e Client Secret

**Custo:** Gratuito (dentro dos limites de uso)

**Variáveis:**
```
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REDIRECT_URI=https://SEU_DOMINIO/api/integrations/google/callback
```

---

## 4. Stripe — Pagamentos (Para cobrar o plano Pro)

**Função:** Assinaturas recorrentes do plano Pro (R$29/mês)

**Onde obter:**
1. Acesse dashboard.stripe.com
2. Crie uma conta
3. No modo **Test** primeiro (para testar)
4. Vá em **Developers** → **API Keys**
5. Copie **Publishable key** e **Secret key**
6. Para webhook: **Developers** → **Webhooks** → **Add endpoint**
   - URL: `https://SEU_DOMINIO/api/webhooks/stripe`
   - Eventos: `customer.subscription.created`, `customer.subscription.deleted`, `invoice.paid`

**Custo:** 1,5% + R$0,37 por transação (taxa Stripe Brasil)

**Variáveis:**
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 5. NEXTAUTH_SECRET — Gerado Localmente

**Função:** Assinar os tokens JWT da sessão web

**Como gerar:**
```bash
openssl rand -base64 32
```

**Variável:** `NEXTAUTH_SECRET=<resultado do comando acima>`

> ✅ Já foi gerado: `Mzw0lKks+L0P/Dn7vTAte+FwrriMOrrQSN2PV/yOt6U=`
> (Gere um novo para produção)

---

## 6. Domínio e DNS

**Função:** Endereço do site (ex: osc.app, meusegundocerebro.com.br)

**Onde registrar:**
- registro.br (domínios .com.br) — R$40/ano
- Namecheap ou GoDaddy (.com) — $10-15/ano

**Configuração DNS após VPS:**
```
A    @        → IP_DA_VPS
A    www      → IP_DA_VPS
```

---

## Checklist de Chaves

- [ ] `ANTHROPIC_API_KEY` — console.anthropic.com
- [ ] `OPENAI_API_KEY` — platform.openai.com
- [ ] `NEXTAUTH_SECRET` — `openssl rand -base64 32`
- [ ] `GOOGLE_CLIENT_ID` — console.cloud.google.com (opcional)
- [ ] `GOOGLE_CLIENT_SECRET` — console.cloud.google.com (opcional)
- [ ] `STRIPE_SECRET_KEY` — dashboard.stripe.com (opcional no início)
- [ ] Domínio registrado
- [ ] VPS contratada
