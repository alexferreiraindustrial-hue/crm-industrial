# Comparação com o CRM Industrial

Código conferido em 09/11/2026: fork `crm-industrial-chatwoot` (worktree `crm-industrial-chatwoot-email`, com a versão 83 publicada) e interface própria em `crm-industrial/atendimento/chatwoot-marca/branding/`.

## O que o CRM Industrial já tem

| Recurso | Onde está |
|---|---|
| Kanban com funis, etapas coloridas, valor, prioridade, data agendada, etiquetas, agentes | `kanban_funnels`, `kanban_stages`, `kanban_items`, `branding/kanban.js` |
| Notas, checklist, histórico e anexos no cartão | `kanban_item_notes`, `kanban_item_checks`, `kanban_item_events`, `crm_attachments_controller.rb` |
| Modelos de funil | `kanban.js` (`draftFromTemplate`) |
| Tarefas e checklist, atividades | `/task-checklist`, `work_activities`, `checklist_lists`, `checklist_items` |
| Calendário (com agenda do e-mail) | `sidebar.js` (`#calendario`) |
| Empresas | `companies_controller.rb`, `routes/dashboard/companies` |
| Ligações (AstraCalls) | `crm_calls_controller.rb`, `branding/calls.js` |
| Central de E-mail separada do WhatsApp | versão 83 |
| Conexão WhatsApp por QR, reações, lembretes | `connections.js`, `reactions.js`, `crm_reminders` |
| Calculadora comum | `kanban.js` |
| Ações de IA no editor (reescrever, resumir, sugerir) | Capitão "tasks" com chave OpenAI |

Destes, **Empresas, Tarefas, Atividades e Calendário não abriram no ProsaHub** nesta conta. O CRM Industrial está à frente nesses pontos.

## Parcial

| Recurso do ProsaHub | O que falta no CRM |
|---|---|
| Detalhe do cartão | Linha "Progresso do Funil"; botões Mover Funil e Mensagem Rápida (confirmar no `kanban.js`) |
| Configurações do Capitão | Tela existe, o servidor é do módulo pago |
| Relatório de chamadas | Registros existem em `crm_calls`, a tela de relatório não |

## Falta

| Recurso | Precisa de tabela nova? | Precisa de servidor? | Componente novo |
|---|---|---|---|
| Ferramentas e Recursos (ligar/desligar módulos) | Não: `accounts.custom_attributes['crm_modules']` | Sim: 1 controlador e 1 trava | `branding/ferramentas.js` |
| Modo apresentação | Não | Não | CSS e um botão |
| Relatórios Kanban (+ meta mensal) | Só a meta: `kanban_funnel_goals` | Sim: controlador só de leitura | tela de relatório |
| Catálogo de produtos/serviços no cartão | Sim: `crm_products`, `kanban_item_products` | Sim | aba no cartão e tela de catálogo |
| Mensagens agendadas (com repetição) | Sim: `crm_scheduled_messages` | Sim: tarefa por horário no Sidekiq | calendário e formulário |
| Salas de chat internas | Sim: salas, membros, mensagens | Sim: tempo real | tela de salas |
| Assistente de IA da operação | Sim: registro de uso | Sim | tela de chat |
| Calculadora WhatsApp API | Não | Não | janela |
| Minhas notas | Não | Não | painel |

## Reaproveitável

- Ação de IA, que já usa a chave da integração OpenAI da conta.
- Sidekiq com cron e a fila separada já em produção.
- Padrão de tela "fora do Vue" do `kanban.js` e `sidebar.js`, que não precisa compilar no servidor.
- Permissões que o Kanban já aplica (`can_manage`, `isAdmin`).
