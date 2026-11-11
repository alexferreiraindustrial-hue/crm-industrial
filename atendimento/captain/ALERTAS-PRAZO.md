# Alertas de prazo — como o Assistente encaixa

## O que a UI mostra

- Sino `.kb-bell` em `.logo-tools` (`kanban.js` → `mountBell` / `loadReminders`).
- Lista: `GET /api/v1/accounts/:id/crm_reminders` → `{ items, unread }`.
- Marcar lido: `PATCH .../crm_reminders/:id` · todos: `POST .../crm_reminders/read_all`.

## Onde grava

Tabela `crm_reminders` (modelo `CrmReminder`):

| Campo | Papel |
|-------|--------|
| `account_id` / `user_id` | Dono do alerta (Bruna) |
| `source_type` / `source_id` | Polimórfico: `KanbanItem` ou `WorkActivity` |
| `stage` | `day_before` ou `due_day` |
| `due_on` | Data do prazo |
| `read_at` | Lido ou não |

Índice único: `(user_id, source_type, source_id, stage, due_on)` — não há alerta “solto” sem fonte.

Geração automática: `CrmRemindersJob` (cron horário) → `CrmRemindersBuilder` cria linhas para cards/atividades com `due_on` **hoje ou amanhã** (fuso São Paulo, só a partir das 8h).

API **não** tem `POST` de alerta: só listar e marcar lido.

## Como o Assistente escreve no mesmo store

1. **`create_activity`** com `due_on` (e dono = Bruna) — fonte nativa; o job passa a alimentar o sino no dia anterior / no dia.
2. **`create_deadline_alert`** (contrato do assistente) — cria/garante a atividade (ou card) com prazo e, no wiring futuro, pode inserir `CrmReminder` na hora para o sino atualizar sem esperar o cron. Continua **interno**; zero outbound.

Sem prazo concreto no compromisso: propor no Assistente; não inventar `due_on` só para forçar o sino.
