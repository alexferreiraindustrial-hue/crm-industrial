# Assistente de IA — entrada na UI e iniciativa

## (1) Onde o ícone fica

Arquivo: `atendimento/chatwoot-marca/branding/sidebar.js` (publicado em produção em `/app/public/crm-industrial/sidebar.js`)

| Entrada | O quê |
|---------|--------|
| `.logo-tools` (topo do rail) | Botão pequeno `crm-fold` com `data-crm-assistente`, mesmo estilo de tema/recolher. Fica no mesmo grupo em que o `kanban.js` injeta **Calculadora** (`.kb-calc-open`) e **Alertas de prazo** (`.kb-bell`), ao lado de **Alternar tema** e **Recolher menu** |
| Menu do perfil | Já existia (MEL-060); mantido |
| Rail `nv` / Configurações | Removidos (não ficam no menu grande) |

Conta 2: recurso `assistente_ia` ligado em Configurações → Recursos. Sem isso o botão some.

Produção: `https://brunalogistica.tech/app/accounts/2/...` · script `?v=whatsapp-web-98` (só o arquivo foi trocado; hard refresh se o navegador cachear).

## (2) Mecanismo proativo

### Já existe no CRM

- Sidekiq + `config/schedule.yml` (cron)
- `CrmRemindersJob` horário → `CrmRemindersBuilder` (lembretes de prazo Kanban/atividades)
- Assistente sob demanda via `POST /crm_ai_assistant/ask` (só leitura)

### Adicionado agora (leve, só front)

Em `openAssistant()`: na primeira abertura da sessão, se a chave OpenAI estiver ok, dispara sozinho o briefing `AI_BRIEFING` (urgências + tarefas internas). Sem outbound.

### Proposto (ainda não no container)

`atendimento/captain/ruby/proposed/crm_ai_proactive_briefing_job.rb` — job horário no Sidekiq, contas com `assistente_ia`, reusa `CrmAi::Tools::*`, grava resultado em lembrete/nota interna. Precisa de deploy Ruby + linha no `schedule.yml`.
