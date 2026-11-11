# CRM Industrial - liga o conector WAHA -> Chatwoot (rodar uma vez, depois de criar o administrador no Chatwoot)
Set-Location $PSScriptRoot
docker compose cp conector/token-admin.rb chatwoot:/tmp/token-admin.rb | Out-Null
$out = (docker compose exec -T chatwoot bundle exec rails runner /tmp/token-admin.rb 2>$null) | Where-Object { $_ -match '^CONECTOR \d+ \S+$' } | Select-Object -Last 1
if (-not $out) {
  Write-Host 'Nao encontrei o administrador. Crie a conta em http://localhost:3009 e rode de novo.'
  exit 1
}
$null, $account, $token = $out -split ' ', 3
Set-Content -Encoding ascii .conector.env @("CHATWOOT_ACCOUNT_ID=$account", "CHATWOOT_API_TOKEN=$token")
docker compose up -d --force-recreate conector
Start-Sleep 8
docker compose logs conector --tail 10
Write-Host "Conector ligado na conta $account do Chatwoot."
