# Captain / agentes — CRM Bruna Logística

Configuração do **Captain como estagiário** da Bruna: lê e organiza conversas/tarefas, entende vocabulário de logística, **não envia mensagens**.

## Persona ativa (usar nesta ordem no assistente)

| Arquivo | Papel |
|---------|--------|
| [`persona.md`](persona.md) | Identidade: estagiário da Bruna; missão e limites |
| [`guardrails.md`](guardrails.md) | Bloqueio de outbound; escopo interno; fatos |
| [`response_guidelines.md`](response_guidelines.md) | Tom, formato de resumo, labels e prioridades |
| [`vocabulario-logistica.md`](vocabulario-logistica.md) | Frete, prazos e termos do domínio |

## Tools

| Arquivo | Papel |
|---------|--------|
| [`agents/tools.yml`](agents/tools.yml) | Leitura Chatwoot (`list_recent_conversations`, `read_conversation`) + organização interna. Sem resolve automático. Sem envio. |
| [`conversa-analise-STATUS.md`](conversa-analise-STATUS.md) | O que a config cobre vs o que falta no Ruby/runtime |

## Análise de conversas

Persona + guidelines pedem: resumir, marcar urgência, sugerir tarefas e labels. Guardrails: só leitura; zero outbound. Fonte Ruby extraída da produção: [`ruby/`](ruby/) + [`ruby/ORIGIN.md`](ruby/ORIGIN.md). UI: [`NAV-ASSISTENTE.md`](NAV-ASSISTENTE.md).

## LLM / catálogo (estrutura Chatwoot)

| Arquivo | Conteúdo |
|---------|----------|
| `llm.yml` / `llm_models.json` | Providers e modelos (inalterados na estrutura) |
| `AGENTS.md` | Guidelines de **desenvolvimento** do código Chatwoot (não é a persona do produto) |

## Regras de ouro

1. **Estagiário da Bruna** — organiza o dia a dia dela no CRM.
2. **Conversas + tarefas** — etiquetar, priorizar, anotar, extrair pendências e prazos.
3. **Sem outbound** — nenhuma mensagem ao cliente ou canal externo.
4. **Vocabulário de logística** — frete, prazos, coleta, entrega, CTE/NF, etc.

## Produto / UI

- Marca visual Bruna: `atendimento/chatwoot-marca/`
- No Chatwoot: Configurações → Captain — colar guidelines/guardrails a partir dos `.md` acima.
- Captura de auditoria: `docs/auditoria-prosahub/capturas-de-tela/07-configuracoes-captain.png`

## Fontes locais

- Overlay: `C:\Users\anton\Projects\crm-industrial`
- Sync branch: `C:\Users\anton\Projects\crm-industrial-sync`
- Chatwoot fork: `C:\Users\anton\Projects\crm-industrial-chatwoot`
