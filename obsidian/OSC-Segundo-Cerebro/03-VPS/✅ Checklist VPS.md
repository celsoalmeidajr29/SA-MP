# ✅ Checklist VPS — Do Zero ao Bot Rodando

> Execute cada passo em ordem. Marque ✅ quando concluir.

**Pré-requisitos antes de começar:**
- [ ] VPS Ubuntu 22.04 contratada com IP público
- [ ] Domínio apontando para o IP da VPS (DNS propagado)
- [ ] Todas as chaves de API em mãos → [[🔑 Chaves Necessárias]]

---

## ETAPA 1 — Acesso e Segurança Inicial

```bash
# Acesse a VPS via SSH
ssh root@IP_DA_VPS

# Atualize o sistema
apt update && apt upgrade -y

# Crie um usuário não-root
adduser osc
usermod -aG sudo osc

# Copie sua chave SSH para o novo usuário (no seu computador local)
# ssh-copy-id osc@IP_DA_VPS

# Acesse como novo usuário
su - osc
```

- [ ] VPS acessível via SSH
- [ ] Usuário `osc` criado com sudo

---

## ETAPA 2 — Instalar Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

- [ ] Docker instalado e funcionando

---

## ETAPA 3 — Clonar o Repositório

```bash
cd /home/osc
git clone https://github.com/celsoalmeidajr29/sa-mp osc
cd osc

# Verificar branch correto
git checkout claude/clean-up-repository-RfVTr
git log --oneline -3
```

- [ ] Repositório clonado
- [ ] Branch `claude/clean-up-repository-RfVTr` ativo

---

## ETAPA 4 — Configurar o .env

```bash
cp .env.example .env
nano .env
```

**Preencher obrigatoriamente:**
```
DATABASE_URL=postgresql://osc:SUA_SENHA@postgres:5432/oscdb
POSTGRES_PASSWORD=SUA_SENHA
REDIS_PASSWORD=SUA_SENHA_REDIS
MINIO_SECRET_KEY=SUA_SENHA_MINIO
MINIO_ROOT_PASSWORD=SUA_SENHA_MINIO
ANTHROPIC_API_KEY=sk-ant-SUA_CHAVE
OPENAI_API_KEY=sk-SUA_CHAVE
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://SEU_DOMINIO
```

- [ ] .env preenchido com todas as chaves

---

## ETAPA 5 — SSL com Let's Encrypt

```bash
sudo apt install certbot -y
sudo certbot certonly --standalone -d SEU_DOMINIO -d www.SEU_DOMINIO

# Copiar certificados para nginx
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/SEU_DOMINIO/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/SEU_DOMINIO/privkey.pem nginx/ssl/
sudo chown osc:osc nginx/ssl/*

# Atualizar nginx.conf com seu domínio
sed -i 's/osc.app/SEU_DOMINIO/g' nginx/nginx.conf
```

- [ ] Certificado SSL gerado
- [ ] nginx/ssl/ com os arquivos

---

## ETAPA 6 — Instalar pgvector

```bash
sudo apt install postgresql-16-pgvector -y
```

> Se der erro de repositório:
```bash
sudo apt-get install -y postgresql-common
sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh
sudo apt-get install -y postgresql-16-pgvector
```

- [ ] pgvector instalado

---

## ETAPA 7 — Subir os Contêineres

```bash
# Subir só a infraestrutura primeiro
docker compose up -d postgres redis minio

# Aguardar o banco iniciar
sleep 5
docker compose logs postgres | tail -5
```

- [ ] PostgreSQL rodando
- [ ] Redis rodando
- [ ] MinIO rodando

---

## ETAPA 8 — Rodar Migrations do Banco

```bash
# Instalar dependências do pacote database
cd packages/database
npm install
npx prisma migrate deploy
cd ../..
```

- [ ] Migrations aplicadas sem erro

---

## ETAPA 9 — Seed dos Planos

```bash
docker compose exec postgres psql -U osc -d oscdb << 'EOF'
INSERT INTO "Plan" (name, "displayName", "priceMonthly", "messagesPerDay", "aiTokensPerDay", "storageBytes", "maxActiveReminders", "memoryRetentionDays", "maxDocumentsPerMonth", "trialDays")
VALUES
  ('free', 'Grátis', 0, 50, 30000, 104857600, 5, 30, 3, 7),
  ('pro', 'Pro', 29, 99999, 0, 10737418240, 9999, 9999, 9999, 7)
ON CONFLICT (name) DO NOTHING;
SELECT name, "displayName" FROM "Plan";
EOF
```

- [ ] Planos Free e Pro no banco

---

## ETAPA 10 — Subir Web e Bot

```bash
# Subir todos os serviços
docker compose up -d

# Verificar status
docker compose ps
```

- [ ] Todos os contêineres `Up`

---

## ETAPA 11 — Escanear QR Code do WhatsApp

```bash
# Ver o QR Code no terminal
docker compose logs -f bot
```

1. Abra o WhatsApp no celular do número OSC
2. Vá em **Configurações** → **Aparelhos conectados** → **Conectar aparelho**
3. Escaneie o QR Code que aparece no terminal
4. Aguarde a mensagem `✅ Bot conectado ao WhatsApp!`

- [ ] QR Code escaneado
- [ ] Bot conectado

---

## ETAPA 12 — Teste Final

Mande uma mensagem para o número do OSC:
```
Olá
```
Deve responder pedindo cadastro ou iniciando conversa.

```
Salvar: reunião com João amanhã às 10h
```
Deve confirmar o agendamento.

- [ ] Bot respondendo no WhatsApp
- [ ] Site acessível em https://SEU_DOMINIO

---

## ETAPA 13 — Renovação Automática SSL

```bash
echo "0 3 * * * certbot renew --quiet && docker compose -f /home/osc/osc/docker-compose.yml restart nginx" | crontab -
```

- [ ] Cron de renovação SSL configurado

---

## 🎉 Pronto!

O OSC está no ar. Próximos passos opcionais:
- [ ] Configurar Google OAuth → [[🔑 Chaves Necessárias]]
- [ ] Configurar Stripe → [[🔑 Chaves Necessárias]]
- [ ] Monitorar logs: `docker compose logs -f bot web`
- [ ] Backup automático do banco: `pg_dump` via cron
