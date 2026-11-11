# CRM Industrial - compila o fork do Chatwoot (provedor WAHA) e sobe com a marca CRM Industrial.
# O fork fica em ..\..\crm-industrial-chatwoot (Chatwoot v4.19.1 Community + commits do CRM Industrial).
# Demora de 15 a 30 minutos na primeira vez.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$fork = Resolve-Path '..\..\crm-industrial-chatwoot'

Write-Host '1/4 Compilando o Chatwoot (fork)...'
docker build -f "$fork\docker\Dockerfile" -t crm-industrial-chatwoot-base:v4.19.1 $fork
if ($LASTEXITCODE -ne 0) { throw 'Falha ao compilar o fork do Chatwoot' }

Write-Host '2/4 Aplicando a marca CRM Industrial...'
docker compose build chatwoot
if ($LASTEXITCODE -ne 0) { throw 'Falha ao aplicar a marca' }

Write-Host '3/4 Atualizando o banco do Chatwoot...'
docker compose stop chatwoot chatwoot-sidekiq
docker compose run --rm chatwoot bundle exec rails db:chatwoot_prepare

Write-Host '4/4 Subindo...'
docker compose up -d
Write-Host 'Chatwoot (CRM Industrial) no ar: http://localhost:3009'
