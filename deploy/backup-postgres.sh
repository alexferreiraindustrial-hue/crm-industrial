#!/bin/sh
# Copia diaria do banco, cifrada. Mantem 7 arquivos. Nao apaga o volume do Postgres.
set -eu
dest="/var/backups/crm-industrial"
key="/opt/crm-industrial/deploy/backup.key"
umask 077
mkdir -p "$dest"
chmod 700 "$dest"
if [ ! -s "$key" ]; then
  openssl rand -base64 32 > "$key"
fi
chmod 600 "$key"
stamp="$(date +%Y%m%d-%H%M%S)"
plain="$(mktemp /tmp/chatwoot-XXXXXX.dump)"
trap 'rm -f "$plain"' EXIT
docker exec crm-industrial-postgres-1 pg_dump -U postgres -Fc chatwoot > "$plain"
file="$dest/chatwoot-$stamp.dump.enc"
openssl enc -aes-256-cbc -pbkdf2 -salt -in "$plain" -out "$file" -pass "file:$key"
chmod 600 "$file"
rm -f "$plain"
find "$dest" -name 'chatwoot-*.dump' -delete
find "$dest" -name 'chatwoot-*.dump.enc' -mtime +7 -delete
echo "Backup cifrado em $file"
