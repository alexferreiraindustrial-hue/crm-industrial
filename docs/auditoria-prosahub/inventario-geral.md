# Inventário geral do ProsaHub

Auditoria feita em 09/11/2026 na conta "Otica Moreira" (conta 5) de app.prosahub.com.br, com perfil de administrador, no plano Premium mensal.

A visita foi só de leitura. Não salvei, enviei, excluí nem alterei configuração. Formulários abertos foram fechados sem salvar. O tour do Kanban não foi respondido, e o "Modo apresentação" não foi acionado. Também não mandei nenhuma pergunta ao Assistente, porque cada uma consome AI Actions.

## Como foi levantado

- Lista de rotas registradas na aplicação: 222 caminhos.
- Lista de recursos ligados na conta: 80 marcadores, todos ligados.
- Visita a cada tela pelo menu e registro de títulos, botões, campos, filtros e abas.
- Capturas em `capturas-de-tela/`, com os cartões de clientes borrados no Kanban.

## Base

Assim como o CRM Industrial, o ProsaHub é um fork do Chatwoot 4.x. A diferença é que tem o módulo pago (Enterprise) ligado: `isEnterprise` aparece na configuração, e Capitão, SLA, funções personalizadas, auditoria e atribuição avançada respondem. No CRM Industrial, que é Community, esses itens existem só na interface. Os controladores do servidor não existem: `sla_policies`, `custom_roles`, `audit_logs` e `applied_slas` têm 0 arquivos.

## Menu lateral (ordem real)

| Ícone | Destino | Origem provável |
|---|---|---|
| Anúncios | painel de novidades | ProsaHub |
| ProsaHub Assistant | `/assistant` | ProsaHub |
| Aplicativos do Painel | `/dashboard_apps` | Chatwoot |
| Conversas (contador 19) | `/dashboard` | Chatwoot |
| Salas de chat | `/chat_rooms` | ProsaHub |
| Kanban: Etapas, Ofertas, Gerenciar Funis | `/kanban` | ProsaHub |
| Capitão: Visão geral, Perguntas frequentes, Documentos, Cenários, Playground, Caixas, Ferramentas, Configurações | `/captain/...` | Chatwoot Enterprise |
| Contatos: Todos, Ativo, por etiqueta | `/contacts` | Chatwoot |
| Relatórios: Visão geral, Conversas, Agentes, Etiquetas, Caixa, Time, **Kanban**, CSAT, SLA, **Chamadas**, Robôs | `/reports/...` | misto |
| Campanhas: WhatsApp, Modelos Meta, **Google Maps Scraper** | `/campaigns`, `/settings/templates` | misto |
| Mensagens Agendadas | `/scheduled-messages` | ProsaHub |
| Central de Ajuda | `/portals` | Chatwoot |
| Minhas notas | painel lateral | ProsaHub |
| Calculadora WhatsApp | janela | ProsaHub |
| Modo apresentação | alternador | ProsaHub |
| Tema claro/escuro, Configurações, Perfil | | Chatwoot |

No celular, o ProsaHub usa uma barra inferior com Chats, Salas, Kanban, Contatos e Mais.

## Configurações (menu real)

Conta, Capitão, Agentes, Times, Salas de chat, Atribuição de agentes, Caixas de Entrada, Etiquetas, Atributos Personalizados, Automação, Robôs, Macros, Respostas Prontas, Modelos Meta, Integrações, Auditoria, Funções Personalizadas, SLA, Fluxo de conversa, Segurança e Cobrança.

## Rotas que existem, mas não abriram nesta conta

Estas rotas voltaram para Conversas e foram registradas como **não confirmadas**. Não tentei forçar a entrada:

`/activities`, `/calendar`, `/companies`, `/inbox-view`, `/reports/tasks`, `/settings/captain/monitors`, `/settings/mcp-servers`, `/settings/data` e `/automations`, que mostrou "Tentar novamente".

O plano Pro e o Premium listam "Tarefas" e "Google Calendar". Isso indica que essas telas dependem de uma integração que não está ligada nesta conta.

## Planos vistos em Cobrança

| Plano | Preço/mês | Limites | Diferenciais |
|---|---|---|---|
| Start | R$ 360 | 3 agentes, 3 caixas | Kanban, campanhas, automações, mensagens agendadas, Google Calendar, SLA |
| Pro | R$ 497 | 10 agentes, 10 caixas | + Telegram, SMS, Voz, Capitão, Assistente de IA, Tarefas, WooCommerce |
| Premium (atual) | R$ 697 | 20 agentes, 15 caixas, 100 AI Actions/mês | tudo |

Adicionais: caixa de entrada extra a R$ 50/mês e pacotes de AI Actions. Neste mês foram usadas 21 de 100 AI Actions do plano, com 10.079 disponíveis no total.
