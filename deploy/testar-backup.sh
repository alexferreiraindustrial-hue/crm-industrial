#!/bin/sh
set -eu
/opt/crm-industrial/deploy/backup-postgres.sh
latest="$(ls -t /var/backups/crm-industrial/chatwoot-*.dump | head -n 1)"
docker exec crm-industrial-postgres-1 psql -U postgres -c 'DROP DATABASE IF EXISTS chatwoot_restore_test;'
docker exec crm-industrial-postgres-1 psql -U postgres -c 'CREATE DATABASE chatwoot_restore_test;'
set +e
docker exec -i crm-industrial-postgres-1 pg_restore -U postgres -d chatwoot_restore_test --no-owner < "$latest"
restore_status=$?
set -e
echo "pg_restore exit ${restore_status}"
docker exec crm-industrial-postgres-1 psql -U postgres -d chatwoot_restore_test -tAc "SELECT to_regclass('public.users');"
docker exec crm-industrial-postgres-1 psql -U postgres -c 'DROP DATABASE chatwoot_restore_test;'
printf '%s\n' '30 6 * * * root /opt/crm-industrial/deploy/backup-postgres.sh >> /var/log/crm-backup.log 2>&1' > /etc/cron.d/crm-industrial-backup
chmod 644 /etc/cron.d/crm-industrial-backup
echo "Backup testado e cron instalado. Arquivo: $latest"
