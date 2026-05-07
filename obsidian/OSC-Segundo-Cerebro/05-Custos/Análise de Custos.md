# 💰 Análise de Custos Operacionais

## Premissas do Cálculo

- Usuário médio: 30 msgs/dia, 2 docs/mês, 3 min de áudio/mês
- Modelo: claude-opus-4-7 (~500 tokens input + 300 output por msg)
- Embedding: ~100 tokens por memória salva
- Câmbio: 1 USD = R$5,50

---

## Por escala

### 1 usuário (fase de testes)

| Serviço | Custo/mês |
|---|---|
| VPS 2GB (Contabo, Hostinger) | R$ 25 |
| Claude API (30 msgs/dia × 30 dias) | ~R$ 2,50 |
| OpenAI Embeddings + Whisper | ~R$ 0,50 |
| Domínio | R$ 3 (R$40/ano) |
| **Total** | **~R$ 31/mês** |

---

### 100 usuários

| Serviço | Custo/mês |
|---|---|
| VPS 4GB (Contabo ou Hetzner) | R$ 60 |
| Claude API | ~R$ 250 |
| OpenAI (embeddings + Whisper) | ~R$ 40 |
| Domínio + SSL (Let's Encrypt = grátis) | R$ 3 |
| **Total** | **~R$ 353/mês** |

**Receita com 30% pagantes Pro (30 × R$29):** R$ 870/mês
**Margem:** ~R$ 517/mês ✅

---

### 1.000 usuários

| Serviço | Custo/mês |
|---|---|
| VPS 8GB + 2 vCPU | R$ 120 |
| Claude API | ~R$ 2.500 |
| OpenAI | ~R$ 400 |
| Redis Cloud ou self-hosted | R$ 0 (self-hosted) |
| **Total** | **~R$ 3.020/mês** |

**Receita com 30% pagantes (300 × R$29):** R$ 8.700/mês
**Margem:** ~R$ 5.680/mês ✅✅

---

### 10.000 usuários

| Serviço | Custo/mês |
|---|---|
| 3× VPS 16GB (load balance) | R$ 900 |
| Claude API | ~R$ 25.000 |
| OpenAI | ~R$ 4.000 |
| Banco gerenciado (opcional) | R$ 500 |
| **Total** | **~R$ 30.400/mês** |

**Receita com 30% pagantes (3.000 × R$29):** R$ 87.000/mês
**Margem:** ~R$ 56.600/mês 🚀

---

## Estratégias para Reduzir Custo de IA

### 1. Google Drive — já implementado ✅
Arquivos no Drive do usuário → custo zero de storage.

### 2. Cache de respostas
Perguntas idênticas → resposta em cache (Redis TTL 1h).
Economia estimada: 20-30% nos tokens.

### 3. Modelos menores para tarefas simples
- Perguntas curtas/FAQ → `claude-haiku-4-5` (8× mais barato)
- Resumos longos → `claude-opus-4-7`
- Implementar roteamento por complexidade.

### 4. Limite de contexto de conversa
Já implementado: só os últimos 10 turnos de conversa são enviados para a IA.

### 5. Plano Grátis com limite de tokens
Já implementado: 30.000 tokens/dia (~60 mensagens médias).

---

## Comparativo de VPS

| Provedor | Specs | Preço/mês | Indicado para |
|---|---|---|---|
| Hostinger VPS | 4GB, 2 vCPU, 100GB | ~R$ 45 | Início (1-200 usuários) |
| Contabo VPS S | 8GB, 4 vCPU, 200GB | ~R$ 70 | 200-1000 usuários |
| Hetzner CX31 | 8GB, 2 vCPU, 80GB | ~R$ 55 | Europa, ótimo custo |
| DigitalOcean | 8GB, 4 vCPU | ~R$ 150 | Fácil migração para K8s |
| Railway (managed) | Variável | ~R$ 100+ | Sem ops, escala auto |

**Recomendação inicial:** Hostinger ou Contabo para começar.
