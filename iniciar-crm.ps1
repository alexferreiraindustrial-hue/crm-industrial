# CRM Industrial - liga o CRM (http://localhost:3020) e o atendimento: Chatwoot (3009) + WAHA (3040)
# Uso: clique com o botao direito > "Executar com o PowerShell"
$ErrorActionPreference = 'Stop'
docker info *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Abrindo o Docker Desktop...'
  Start-Process "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
  do { Start-Sleep 3; docker info *> $null } until ($LASTEXITCODE -eq 0)
}
Set-Location "$PSScriptRoot\packages\twenty-docker"
docker compose -p crm-industrial up -d
Set-Location "$PSScriptRoot\atendimento"
docker compose up -d
Write-Host 'Aguardando o CRM ficar pronto (a primeira vez demora mais)...'
do { Start-Sleep 5; $s = docker inspect -f '{{.State.Health.Status}}' crm-industrial-server-1 } until ($s -eq 'healthy')
Start-Process 'http://localhost:3020'
Write-Host 'CRM Industrial: http://localhost:3020'
Write-Host 'Chatwoot (atendimento): http://localhost:3009'
Write-Host 'WAHA (sessoes do WhatsApp): http://localhost:3040/dashboard'
