# Comandos Úteis — VPS

## Logs

```bash
# Ver logs do bot em tempo real
docker compose logs -f bot

# Ver logs do web
docker compose logs -f web

# Ver logs do nginx (acessos e erros)
docker compose logs -f nginx

# Ver logs de todos os serviços
docker compose logs -f
```

## Reiniciar Serviços

```bash
docker compose restart bot
docker compose restart web
docker compose restart nginx
docker compose restart          # todos
```

## Banco de Dados

```bash
# Acessar o banco
docker compose exec postgres psql -U osc -d oscdb

# Ver usuários cadastrados
docker compose exec postgres psql -U osc -d oscdb -c "SELECT name, email, \"whatsappNumber\", \"createdAt\" FROM \"User\" ORDER BY \"createdAt\" DESC;"

# Ver memórias de um usuário
docker compose exec postgres psql -U osc -d oscdb -c "SELECT type, title, LEFT(content, 100) FROM \"Memory\" WHERE \"userId\" = 'ID_DO_USUARIO';"

# Backup do banco
docker compose exec postgres pg_dump -U osc oscdb > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker compose exec -T postgres psql -U osc oscdb < backup_20260507.sql
```

## Bot WhatsApp

```bash
# Desconectar sessão (forçar novo QR Code)
docker compose stop bot
rm -rf sessions/*
docker compose start bot
docker compose logs -f bot
```

## Atualizar o Código

```bash
git pull origin claude/clean-up-repository-RfVTr
docker compose build bot web
docker compose up -d bot web
```

## Monitorar Recursos

```bash
# CPU e memória dos contêineres
docker stats

# Espaço em disco
df -h
du -sh /var/lib/docker/volumes/*
```

## MinIO (Arquivos)

```bash
# Acessar console do MinIO
# Abra no navegador: http://IP_DA_VPS:9001
# Login: oscminio / SUA_SENHA_MINIO
```

## Redis

```bash
# Verificar filas do BullMQ
docker compose exec redis redis-cli -a SUA_SENHA_REDIS
> KEYS bull:notifications:*
> LLEN bull:notifications:wait
```
