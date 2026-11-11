# CRM Industrial - desliga o CRM e o atendimento (os dados ficam guardados)
Set-Location "$PSScriptRoot\atendimento"
docker compose stop
Set-Location "$PSScriptRoot\packages\twenty-docker"
docker compose -p crm-industrial stop
Write-Host 'CRM Industrial e atendimento desligados. Os dados continuam salvos.'
