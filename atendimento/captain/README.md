# Captain / agentes — CRM Bruna Logística

Configuração e instruções relacionadas ao Captain (Chatwoot) e aos agentes do CRM Industrial.

## O que há nesta pasta

| Arquivo | Origem | Conteúdo |
|---------|--------|----------|
| `agents/tools.yml` | `crm-industrial-chatwoot/config/agents/tools.yml` | Catálogo de tools dos agentes |
| `llm.yml` | `crm-industrial-chatwoot/config/llm.yml` | Config LLM |
| `llm_models.json` | `crm-industrial-chatwoot/config/llm_models.json` | Modelos LLM |
| `AGENTS.md` | `crm-industrial-chatwoot/AGENTS.md` | Instruções de desenvolvimento / persona de trabalho no código Chatwoot |

## Persona e assistente no produto

- A marca e a persona visual **Bruna Logística** estão em `atendimento/chatwoot-marca/` (login, sidebar, tema).
- O módulo **Captain** (assistentes, FAQ, guidelines/guardrails) no Chatwoot fica no banco da conta; a UI aparece em Configurações → Captain.
- Captura de auditoria: `docs/auditoria-prosahub/capturas-de-tela/07-configuracoes-captain.png`.

## Diretórios-fonte locais

- Overlay CRM: `C:\Users\anton\Projects\crm-industrial`
- Fork Chatwoot: `C:\Users\anton\Projects\crm-industrial-chatwoot` (remote origin = `https://github.com/chatwoot/chatwoot.git`, branch de trabalho `crm-industrial/astracalls-conexoes`)
