# Guia de Setup na VPS

## Requisitos mínimos

- Ubuntu 22.04 LTS
- 2 vCPU, 4 GB RAM (recomendado: 4 vCPU, 8 GB)
- 50 GB SSD
- Porta 80 e 443 abertas no firewall

## Passo a passo

### 1. Instalar Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Instalar Docker Compose

```bash
sudo apt install docker-compose-plugin
```

### 3. Clonar o repositório

```bash
git clone https://github.com/celsoalmeidajr29/sa-mp osc
cd osc
```

### 4. Configurar variáveis de ambiente

```bash
cp .env.example .env
nano .env   # Edite com suas chaves de API
```

### 5. SSL com Let's Encrypt

```bash
sudo apt install certbot
certbot certonly --standalone -d osc.app -d www.osc.app
mkdir -p nginx/ssl
cp /etc/letsencrypt/live/osc.app/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/osc.app/privkey.pem nginx/ssl/
```

### 6. Subir os serviços

```bash
docker compose up -d
```

### 7. Rodar migrations do banco

```bash
docker compose exec web npx prisma migrate deploy
```

### 8. Seed dos planos (grátis e pro)

```bash
docker compose exec web node -e "
const { prisma } = require('@osc/database');
async function main() {
  await prisma.plan.createMany({
    data: [
      {
        name: 'free',
        displayName: 'Grátis',
        priceMonthly: 0,
        messagesPerDay: 50,
        storageBytes: BigInt(104857600),
        maxActiveReminders: 5,
        memoryRetentionDays: 30,
        maxDocumentsPerMonth: 3,
      },
      {
        name: 'pro',
        displayName: 'Pro',
        priceMonthly: 29,
        messagesPerDay: 99999,
        storageBytes: BigInt(10737418240),
        maxActiveReminders: 9999,
        memoryRetentionDays: 9999,
        maxDocumentsPerMonth: 9999,
      },
    ],
    skipDuplicates: true,
  });
}
main();
"
```

### 9. Escanear QR Code do WhatsApp

```bash
docker compose logs -f bot
# Aparecerá o QR Code — escaneie com o WhatsApp do número OSC
```

### 10. Renovação automática SSL

```bash
echo "0 3 * * * certbot renew --quiet && docker compose restart nginx" | crontab -
```

## Comandos úteis

```bash
# Ver logs
docker compose logs -f bot
docker compose logs -f web

# Reiniciar serviço
docker compose restart bot

# Acessar banco de dados
docker compose exec postgres psql -U osc -d oscdb

# Backup do banco
docker compose exec postgres pg_dump -U osc oscdb > backup.sql
```
