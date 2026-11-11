# CRM Industrial

O sistema tem duas partes. As duas rodam com Docker. O banco de cada uma é PostgreSQL, e nenhuma das duas abre o Postgres para a internet.

| Parte | O que faz | Onde roda | Endereço |
| --- | --- | --- | --- |
| CRM | Cadastro, empresas e o produto Twenty | Este computador, `packages/twenty-docker` | http://localhost:3020 |
| Atendimento | Conversas, WhatsApp, e-mail e tarefas | VPS `187.41.126.73` | https://brunalogistica.tech |

A VPS é Hostinger KVM 2, Ubuntu 24.04, 2 CPUs e 7,8 GB de RAM. O atendimento cabe. O CRM da porta 3020 continua neste computador.

```text
Internet
  |
  |  brunalogistica.tech  :443
  v
Traefik (Let's Encrypt, redireciona HTTP para HTTPS)
  |
  +-- Chatwoot, porta interna 3009
  |     +-- Sidekiq
  |     +-- PostgreSQL 16, rede interna
  |     +-- Redis com senha e disco, rede interna
  +-- WAHA (WhatsApp), sem porta pública
        +-- conector
```

Prometheus, Grafana, Loki e Sentry não entram nesta VPS. Juntos passam da memória que sobra depois do atendimento.

## Rodar neste computador

Atendimento, na pasta `atendimento`:

```powershell
.\configurar.ps1
.\construir-chatwoot.ps1
```

`configurar.ps1` só na primeira vez: ele gera senhas locais. `construir-chatwoot.ps1` compila o fork do Chatwoot e sobe os containers. O fork fica em `crm-industrial-chatwoot`, ao lado deste repositório.

CRM, na pasta `packages/twenty-docker`:

```powershell
docker compose up -d
```

O arquivo `docker-compose.override.yml` dessa pasta fixa a porta 3020.

## Manutenção na VPS

A pasta no servidor é `/opt/crm-industrial`. Os segredos ficam em `deploy/.env` e nos arquivos ao lado. Não copie os `.env` deste PC.

```sh
cd /opt/crm-industrial/deploy
docker compose ps
docker compose logs -f chatwoot
./backup-postgres.sh
```

O backup grava `/var/backups/crm-industrial/chatwoot-DATA.dump` e apaga cópias com mais de 7 dias. Para testar uma restauração sem mexer no banco real:

```sh
docker exec -i crm-industrial-postgres-1 pg_restore -U postgres -d chatwoot_restore_test --create
```

O primeiro acesso em https://brunalogistica.tech cria o administrador. O cadastro público fica desligado. O WhatsApp da VPS pede um QR novo. A sessão deste computador não é copiada.

O conector espera `CHATWOOT_API_TOKEN` e `CHATWOOT_ACCOUNT_ID` em `.conector.env`. Até lá ele fica no ar sem ligar sessões.

Para voltar a imagem anterior, a tag `crm-industrial-chatwoot:v4.19.1` permanece no servidor. Um deploy novo deve usar outra tag antes de substituir esta.
