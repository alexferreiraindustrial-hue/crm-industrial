# CRM Industrial - Atendimento: gera senhas e ajusta os .env do WAHA + Chatwoot (rodar uma vez)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
function New-Secret([int]$bytes) {
  $b = New-Object byte[] $bytes
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
  -join ($b | ForEach-Object { $_.ToString('x2') })
}
$wahaKey = New-Secret 16
$wahaDash = New-Secret 12
$pgPass = New-Secret 16
$redisPass = New-Secret 16
$secretBase = New-Secret 64

function Set-EnvValue([string]$file, [string]$key, [string]$value) {
  $lines = Get-Content $file
  $found = $false
  $lines = $lines | ForEach-Object {
    if ($_ -match "^\s*#?\s*$key=") { $found = $true; "$key=$value" } else { $_ }
  }
  if (-not $found) { $lines += "$key=$value" }
  Set-Content -Encoding ascii $file $lines
}

# WAHA
Set-EnvValue .waha.env 'WAHA_API_KEY_PLAIN' $wahaKey
Set-EnvValue .waha.env 'WAHA_API_KEY' $wahaKey
Set-EnvValue .waha.env 'WAHA_DASHBOARD_PASSWORD' $wahaDash
Set-EnvValue .waha.env 'WHATSAPP_SWAGGER_PASSWORD' $wahaDash
Set-EnvValue .waha.env 'WAHA_PUBLIC_URL' 'http://localhost:3040'
Set-EnvValue .waha.env 'REDIS_URL' "redis://:$redisPass@redis:6379"
Set-EnvValue .waha.env 'TZ' 'America/Sao_Paulo'
(Get-Content .waha.env) -replace '^WHATSAPP_SESSIONS_POSTGRESQL_URL=', '# WHATSAPP_SESSIONS_POSTGRESQL_URL=' | Set-Content -Encoding ascii .waha.env

# Chatwoot
Set-EnvValue .chatwoot.env 'SECRET_KEY_BASE' $secretBase
Set-EnvValue .chatwoot.env 'FRONTEND_URL' 'http://localhost:3009'
Set-EnvValue .chatwoot.env 'RAILS_ENV' 'production'
Set-EnvValue .chatwoot.env 'POSTGRES_PASSWORD' $pgPass
Set-EnvValue .chatwoot.env 'REDIS_PASSWORD' $redisPass
Set-EnvValue .chatwoot.env 'REDIS_URL' 'redis://redis:6379'
Set-EnvValue .chatwoot.env 'DEFAULT_LOCALE' 'pt_BR'
Set-EnvValue .chatwoot.env 'TZ' 'America/Sao_Paulo'
# Provedor WAHA (QR Code) dentro do Chatwoot
Set-EnvValue .chatwoot.env 'WAHA_URL' 'http://waha:3000'
Set-EnvValue .chatwoot.env 'WAHA_API_KEY' $wahaKey
Set-EnvValue .chatwoot.env 'WAHA_CHATWOOT_URL' 'http://chatwoot:3009'
Set-EnvValue .chatwoot.env 'WAHA_CHATWOOT_LOCALE' 'pt-BR'

# Postgres do docker-compose le a senha do .env deste projeto
Set-Content -Encoding ascii .env @("POSTGRES_PASSWORD=$pgPass", "REDIS_PASSWORD=$redisPass")
Write-Host 'Senhas geradas e arquivos .env ajustados.'
