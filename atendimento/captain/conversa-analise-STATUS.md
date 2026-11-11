# Análise de conversas — o que foi feito vs bloqueado

## Implementado (neste repo `crm-industrial-sync`)

| Artefato | Mudança |
|----------|---------|
| `agents/tools.yml` | Tools read-only `list_recent_conversations` e `read_conversation` |
| `persona.md` / `response_guidelines.md` / `guardrails.md` | Resumo, urgência, tarefas; sem outbound |
| `ruby/` | Extração do container de produção (MEL-060) — ver `ruby/ORIGIN.md` |
| `chatwoot-marca/branding/sidebar.js` | Ícone no rail + Configurações; briefing proativo na 1ª abertura |
| `NAV-ASSISTENTE.md` | Mapa da UI + loop proativo |

## Runtime real (produção)

O Assistente **não** usa `Captain::Tools::*`. Usa `CrmAi::Tools::*`:

- `ResumoAtendimento`, `ListarConversas`, `LerConversa`, `ListarAtividades`, `ListarCartoes`

Controller: `Api::V1::Accounts::CrmAiAssistantController` · gate: `assistente_ia`.

## Ainda bloqueado / pendente de deploy

1. Copiar `ruby/app/**` de volta para a imagem/git trackeado do Chatwoot (hoje só auditoria no sync).
2. Publicar `sidebar.js` novo no container (`instalar-acoes-mensagem.sh` / commit de imagem).
3. Job Sidekiq proativo (`ruby/proposed/...`) — só proposta.
4. Atualizar string `place` de `assistente_ia` em `CrmModules::REGISTRY` no próximo deploy Ruby.
