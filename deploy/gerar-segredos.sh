#!/bin/sh
# Gera senhas novas nesta maquina. Nao reaproveita as senhas do computador de desenvolvimento.
set -eu
cd "$(dirname "$0")"

if [ -f .env ]; then
  echo "Os segredos ja existem. Nada foi alterado."
  exit 0
fi

secret() {
  openssl rand -hex "$1"
}

pg="$(secret 16)"
redis="$(secret 16)"
waha="$(secret 16)"
dash="$(secret 12)"
base="$(secret 64)"
frontend="${FRONTEND_URL:-https://brunalogistica.tech}"

umask 077

cat > .env <<EOF
FRONTEND_URL=${frontend}
ACME_EMAIL=alex.ferreira.industrial@gmail.com
POSTGRES_PASSWORD=${pg}
REDIS_PASSWORD=${redis}
EOF

cat > .chatwoot.env <<EOF
SECRET_KEY_BASE=${base}
FRONTEND_URL=${frontend}
DEFAULT_LOCALE=pt_BR
FORCE_SSL=false
ENABLE_ACCOUNT_SIGNUP=false
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=${redis}
POSTGRES_DATABASE=chatwoot
POSTGRES_HOST=postgres
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=${pg}
RAILS_ENV=production
RAILS_LOG_TO_STDOUT=true
ACTIVE_STORAGE_SERVICE=local
TZ=America/Sao_Paulo
SAFE_FETCH_ALLOW_PRIVATE_NETWORK=true
WAHA_URL=http://waha:3000
WAHA_API_KEY=${waha}
WAHA_CHATWOOT_URL=http://chatwoot:3009
WAHA_CHATWOOT_LOCALE=pt-BR
EOF

cat > .waha.env <<EOF
WAHA_API_KEY_PLAIN=${waha}
WAHA_API_KEY=${waha}
WAHA_DASHBOARD_USERNAME=admin
WAHA_DASHBOARD_PASSWORD=${dash}
WHATSAPP_SWAGGER_USERNAME=admin
WHATSAPP_SWAGGER_PASSWORD=${dash}
WAHA_DASHBOARD_ENABLED=False
WHATSAPP_SWAGGER_ENABLED=False
WAHA_BASE_URL=http://waha:3000
WAHA_PUBLIC_URL=http://waha:3000
WHATSAPP_DEFAULT_ENGINE=GOWS
WAHA_APPS_ENABLED=True
REDIS_URL=redis://:${redis}@redis:6379
WAHA_LOG_FORMAT=JSON
WAHA_LOG_LEVEL=info
WAHA_PRINT_QR=False
WAHA_MEDIA_STORAGE=LOCAL
WHATSAPP_FILES_LIFETIME=1800
WHATSAPP_FILES_FOLDER=/app/.media
TZ=America/Sao_Paulo
EOF

cat > .conector.env <<EOF
CHATWOOT_ACCOUNT_ID=1
CHATWOOT_API_TOKEN=
WAHA_URL=http://waha:3000
CHATWOOT_URL=http://chatwoot:3009
IDIOMA=pt-BR
EOF

echo "Segredos criados em deploy/.env e nos arquivos vizinhos. Eles nao entram no git."
