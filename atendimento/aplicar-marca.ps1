# CRM Industrial - grava o nome CRM Industrial nas configuracoes do Chatwoot (rodar uma vez)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
docker compose cp chatwoot-marca/aplicar-marca.rb chatwoot:/tmp/aplicar-marca.rb
docker compose exec -T chatwoot bundle exec rails runner /tmp/aplicar-marca.rb
