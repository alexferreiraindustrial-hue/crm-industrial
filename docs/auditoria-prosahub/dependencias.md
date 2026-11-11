# Dependências

| Recurso | Depende de | Já existe no CRM Industrial? |
|---|---|---|
| Assistente de IA | Chave de IA, consulta segura por permissão, registro de uso e custo, confirmação de ações | Chave OpenAI nas contas 2 e 3 (integração `openai`). O resto falta |
| Ofertas no cartão | Catálogo de produtos/serviços com preço; vínculo item ↔ oferta com quantidade | `kanban_items.value` existe; catálogo não |
| Relatórios Kanban | `kanban_items`, `kanban_item_events`, `kanban_item_checks`, `work_activities`; meta por funil | Dados existem; meta não |
| Mensagens agendadas | Tabela de agendamentos, Sidekiq (tarefa por horário), envio pelo canal (WAHA via `Channel::Api`), recorrência | Sidekiq e envio existem |
| Salas de chat | ActionCable, tabelas de sala, membro e mensagem, notificações | ActionCable existe |
| Modo apresentação | Só interface (CSS) | — |
| Calculadora WhatsApp | Tabela de tarifas Meta | Só faz sentido com API oficial |
| Construtor Modelos Meta | WhatsApp Cloud API | CRM usa WAHA |
| SLA, funções, auditoria, Capitão completo | Módulo pago do Chatwoot | Não (Community) |
| Google Maps Scraper | Serviço externo de raspagem | Não, e não recomendado |

## Infraestrutura de produção a respeitar

- O servidor não compila. A interface publicada são arquivos copiados nos containers mais `docker commit`.
- `apply-branding.rb` roda **uma vez só**. Se rodar de novo, duplica o `<script>` no layout e a aba trava. Módulos novos de interface entram como arquivos novos em `branding/`, com uma única inclusão.
- A fila separada de e-mail (`chatwoot-email-worker`) já existe. Mensagens agendadas devem ir para uma fila própria ou para a fila principal com limite, nunca bloqueando o WhatsApp.
