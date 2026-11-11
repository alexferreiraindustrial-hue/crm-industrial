#!/bin/sh
# Restaura o backup mais novo num Postgres descartavel e compara contagens.
# Nao usa o banco de producao e nao publica porta.
set -eu
dest="/var/backups/crm-industrial"
key="/opt/crm-industrial/deploy/backup.key"
name="crm-restore-test"
latest="$(ls -1t "$dest"/chatwoot-*.dump.enc | head -n 1)"
plain="$(mktemp /tmp/chatwoot-restore-XXXXXX.dump)"
cleanup() {
  rm -f "$plain"
  docker rm -f "$name" >/dev/null 2>&1 || true
}
trap cleanup EXIT
openssl enc -d -aes-256-cbc -pbkdf2 -in "$latest" -out "$plain" -pass "file:$key"
chmod 600 "$plain"
docker rm -f "$name" >/dev/null 2>&1 || true
docker run -d --name "$name" --network none -e POSTGRES_HOST_AUTH_METHOD=trust pgvector/pgvector:pg16 >/dev/null
ready=0
i=0
while [ "$i" -lt 30 ]; do
  if docker exec "$name" pg_isready -U postgres >/dev/null 2>&1; then
    ready=1
    break
  fi
  i=$((i + 1))
  sleep 1
done
[ "$ready" -eq 1 ]
docker exec "$name" createdb -U postgres chatwoot
docker exec -i "$name" pg_restore -U postgres -d chatwoot --no-owner --no-acl < "$plain" || true
sql="SELECT 'contacts', count(*) FROM contacts UNION ALL SELECT 'conversations', count(*) FROM conversations UNION ALL SELECT 'messages', count(*) FROM messages ORDER BY 1;"
echo "RESTAURADO"
docker exec "$name" psql -U postgres -d chatwoot -tAc "$sql"
echo "PRODUCAO"
docker exec crm-industrial-postgres-1 psql -U postgres -d chatwoot -tAc "$sql"
