# Proveniência — extração MEL-060 / Assistente de IA

## Origem

| Campo | Valor |
|-------|--------|
| Host | `crm-industrial-vps` → brunalogistica.tech |
| Container | `crm-industrial-chatwoot-1` |
| Image tag | `crm-industrial-chatwoot:v4.19.1` |
| Image ID | `sha256:36336986aff5e3a560f469bd66254f1377877b468e3f88afd7b91327cd6396a0` |
| Deploy | MEL-060 / MEL-062 (versão 91, `v4.19.1-ia-91` documentado no backlog) |
| Extraído em | 2026-11-10 |
| Método | `docker cp` dos paths sob `/app/...` → `/tmp/crm-ai-extract` → `scp` para este diretório |

## Arquivos (paths no container → paths locais)

| Container (`/app/...`) | Local (`atendimento/captain/ruby/...`) |
|------------------------|----------------------------------------|
| `app/controllers/api/v1/accounts/crm_ai_assistant_controller.rb` | igual sob `app/` |
| `app/models/crm_ai_usage.rb` | igual |
| `app/services/crm_ai/assistant.rb` | igual |
| `app/services/crm_ai/access.rb` | igual |
| `app/services/crm_ai/budget.rb` | igual |
| `app/services/crm_ai/pricing.rb` | igual |
| `app/services/crm_ai/tools/base.rb` | igual |
| `app/services/crm_ai/tools/resumo_atendimento.rb` | igual |
| `app/services/crm_ai/tools/listar_conversas.rb` | igual |
| `app/services/crm_ai/tools/ler_conversa.rb` | igual |
| `app/services/crm_ai/tools/listar_atividades.rb` | igual |
| `app/services/crm_ai/tools/listar_cartoes.rb` | igual |
| `db/migrate/20261110080000_create_crm_ai_usages.rb` | igual |
| `app/controllers/api/v1/accounts/crm_modules_controller.rb` | igual (gate do recurso) |
| `app/controllers/concerns/crm_module_gate.rb` | igual |
| `app/services/crm_modules.rb` | igual (`assistente_ia` no REGISTRY) |
| `config/routes.rb` (trecho) | `routes-crm_ai.txt` + `routes-crm_ai-context.txt` |

## Referência (não é o assistente; padrão de cron)

| Container | Local |
|-----------|--------|
| `app/jobs/crm_reminders_job.rb` | `reference/crm_reminders_job.rb` |
| `app/services/crm_reminders_builder.rb` | `reference/crm_reminders_builder.rb` |

`crm_reminders_job` está em `config/schedule.yml` no container (cron horário). Usado como modelo para o loop proativo proposto.

## O que **não** existe nesta imagem / não foi encontrado

| Pedido | Resultado |
|--------|-----------|
| `Captain::Tools::*` ligados ao Assistente de IA | **Não há.** O assistente usa `CrmAi::Tools::*` (RubyLLM tools), não classes `Captain::Tools`. |
| Classes Captain de tools de conversa para MEL-060 | Inventário em `captain-ruby-files.txt` — Captain enterprise (summary, reply suggestion, etc.), separado do `crm_ai_assistant`. |
| Branch/tag git local com o mesmo código | Ausente no fork `crm-industrial-chatwoot` e no sync antes desta extração. |
| Artefato `aplicar-91.sh` no sync | Não versionado aqui; só referido no backlog. |

## Nota

Esta pasta é **cópia de auditoria / working tree**. Não substitui o deploy: a imagem de produção continua sendo a fonte viva até o código voltar a um git trackeado e um novo `docker commit`/build.
