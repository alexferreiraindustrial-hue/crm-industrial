#!/bin/bash
set -eu
cd /tmp/bruna-login
C=crm-industrial-chatwoot-1
docker cp logo.png "$C:/app/public/brand-assets/logo.png"
docker cp logo-mark.png "$C:/app/public/brand-assets/logo-mark.png"
docker cp icons/. "$C:/app/public/"
docker cp login-bruna.css "$C:/tmp/login-bruna.css"
docker cp aplicar-login-producao.rb "$C:/tmp/aplicar-login-producao.rb"
docker exec "$C" sh -c 'grep -q "Tela de entrada da Bruna" /app/public/crm-industrial/theme.css || cat /tmp/login-bruna.css >> /app/public/crm-industrial/theme.css'
docker cp "$C:/app/app/views/layouts/vueapp.html.erb" /tmp/bruna-login/vueapp.html.erb
sed -i 's/theme.css?v=whatsapp-web-18/theme.css?v=whatsapp-web-26/' /tmp/bruna-login/vueapp.html.erb
docker cp /tmp/bruna-login/vueapp.html.erb "$C:/app/app/views/layouts/vueapp.html.erb"
docker exec "$C" bundle exec rails runner /tmp/aplicar-login-producao.rb
docker restart "$C"
echo restarted
