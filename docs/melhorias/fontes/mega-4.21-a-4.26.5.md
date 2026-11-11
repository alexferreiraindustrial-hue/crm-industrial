# Triagem das notas do MEGA (v4.21.0 a v4.26.5 e n8n-nodes-mega 0.13.0)

O ProsaHub roda sobre o MEGA, uma versão comercial do Chatwoot vendida como "white label" (imagem `sendingtk/chatwoot`). As notas foram enviadas pelo fornecedor entre 31/07 e 07/10.

**Regra de uso:** as notas servem só como **fonte de ideias**. O código do MEGA é do fornecedor, e o do módulo pago é do Chatwoot. Nada disso é copiado para o CRM Industrial. Quando uma ideia for aprovada, ela é construída do nosso jeito. Antes, conferimos se ela já veio no Chatwoot oficial, que é de código aberto.

Legenda:
- **Aplica**: vale para o CRM Industrial e virou item do backlog.
- **Já temos**: o CRM já faz isso.
- **Verificar**: precisa de conferência antes de decidir.
- **Não se aplica**: depende de algo que o CRM não usa (WhatsApp Cloud, cobrança SaaS, outros canais).

## v4.21.0 (31/07)

| Novidade | Triagem | Item |
|---|---|---|
| Evitar mistura de conversas WAHA com LID | Verificar no nosso conector | MEL-010 |
| Monitorar saúde do número WhatsApp | Aplica | MEL-014 |
| Isolar ACK em lote WAHA, reply com ID escopado | Verificar | MEL-015 |
| Bloquear envio livre fora da janela de 24h, Cloud Calling, templates | Não se aplica (WAHA) | MEL-902 |
| Captain V2, FAQ, ciclo de vida do bot | Não se aplica (módulo pago) | MEL-903 |
| **Automações por tempo** | **Já temos na base**: `execution_delay` e as telas existem; nenhuma regra foi criada | MEL-042 |
| Kanban: notas preservadas, etiquetas na criação | Verificar | MEL-024 |
| Kanban: contagem regressiva de item agendado | Aplica | MEL-021 |
| Kanban: mensagem automática por etapa | Aplica | MEL-022 |
| Tarefas: filtros na lista e no calendário | Aplica | MEL-030 |
| API de envio externo e MCP | Aplica (API) | MEL-110 |
| IMAP com diagnóstico, destinatário correto na resposta | Verificar | MEL-050 |
| Segurança: integrações e exclusões só por administrador | Verificar | MEL-081 |
| SLA, Help Center, Super Admin | Não se aplica | MEL-903, MEL-904 |
| Salas: nome e presença | Aplica junto com as Salas | MEL-100 |

## v4.21.5 (06/08)

| Novidade | Triagem | Item |
|---|---|---|
| Reenviar mensagem agendada que falhou | Aplica | MEL-041 |
| Handoff de AgentBot expirado | Não se aplica hoje (sem bot) | MEL-111 |
| Webhooks WhatsApp isolados | Verificar no conector | MEL-015 |
| Excluir de vez e-mail sincronizado do Gmail | Aplica, baixa prioridade | MEL-053 |
| Painel lateral reutilizável | Ideia de interface; usar no próprio padrão | — |
| Captain, MCP, citações | Não se aplica (módulo pago) | MEL-903 |
| Telegram, Twilio, Help Center | Não se aplica | MEL-904 |

## n8n-nodes-mega 0.13.0 (13/08)

| Novidade | Triagem | Item |
|---|---|---|
| Enviar mensagem sem conversa existente | Aplica, via API própria | MEL-110 |
| Agendada com reenvio e reagendamento | Aplica | MEL-040, MEL-041 |
| Chave contra envio duplicado (idempotência) | Aplica como regra da API | MEL-110 |

## v4.23.0 (01/09)

| Novidade | Triagem | Item |
|---|---|---|
| Recuperar mídia pendente, anexo por CDN | Verificar | MEL-011 |
| Proxy para WAHA | Não se aplica hoje | — |
| Condição de "atrasada" nas automações | Aplica | MEL-043 |
| Saudação não dispara em mensagem que não é recebida | Verificar | MEL-044 |
| Esconder identificadores sociais, assinatura de webhook Slack | Não se aplica | MEL-904 |
| Captain V2 com raciocínio, audiência, agenda | Não se aplica (módulo pago) | MEL-903 |
| Hora exata ao passar o mouse | Ideia pequena | MEL-094 |

## v4.23.5 (02/09)

| Novidade | Triagem | Item |
|---|---|---|
| Notificação de responsável em fila prioritária | Verificar | MEL-093 |
| Reação WAHA no alvo certo | Verificar (`reactions.js`) | MEL-012 |
| Marcar como lida ao abrir e ações em massa de leitura | Aplica | MEL-095 |
| Registrar conteúdo de mensagem apagada na auditoria | Aplica, junto com a auditoria própria | MEL-080 |
| Copilot preserva texto quando o envio falha | Não se aplica (módulo pago) | — |

## v4.25.0 (24/09)

| Novidade | Triagem | Item |
|---|---|---|
| Cobrança nativa, Asaas, dLocal, PayPal, planos | Não se aplica | MEL-900 |
| **Mega Assistant** com ferramentas e ações | Aplica, construído do nosso jeito | MEL-060 |
| Relatório de custo de IA e créditos | Aplica junto com o assistente | MEL-062 |
| Sugestão de etiqueta e prioridade | Aplica | MEL-061 |
| Configuração de sessão WAHA redesenhada | Já temos (`connections.js`) | — |
| Motivo de falha nas campanhas | Não se aplica hoje | — |
| Abrir conversa a partir do relatório | Aplica | MEL-071 |
| Aviso de handoff do bot e push em atribuição | Aplica | MEL-093 |
| Aviso de login em aparelho novo | Aplica, baixa prioridade | MEL-083 |
| Limpeza de HTML e links Markdown inseguros | Verificar | MEL-082 |
| Super Admin traduzido | Não se aplica | MEL-900 |

## v4.26.5 (07/10)

| Novidade | Triagem | Item |
|---|---|---|
| **Detectar fila do Sidekiq sem consumidor** | Aplica, urgente com o novo processo de e-mail | MEL-090 |
| **Limite de tempo no IMAP** (servidor mudo não prende o processo) | Aplica: hoje o limite é só por e-mail processado | MEL-050 |
| **Resposta SMTP marcada como falha quando acabam as tentativas** | Aplica | MEL-051 |
| Tamanho máximo de anexo na resposta | Aplica, baixa prioridade | MEL-052 |
| Contadores da barra com limite de frequência | Aplica | MEL-091 |
| Busca de contato e mensagem por índice | Aplica quando o volume crescer | MEL-092 |
| Kanban: não recarregar etapas, contador no cartão | Contador já temos (item 5 da 1ª leva); o resto aplica | MEL-025 |
| Cartão de contato pelo editor | Aplica | MEL-013 |
| Chamadas WhatsApp Cloud | Não se aplica (usamos AstraCalls) | MEL-902 |
| Etiquetas em minúsculas | Já temos na base (`label.rb`) | — |
| Áudio OGG mantendo o tom ao acelerar (Safari/iOS) | Aplica, baixa prioridade | MEL-096 |
| Duplicar planos no Super Admin | Não se aplica | MEL-900 |
