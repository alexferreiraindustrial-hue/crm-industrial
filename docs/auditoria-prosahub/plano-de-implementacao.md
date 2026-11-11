# Plano: Ferramentas e Recursos

**Status: aguardando aprovação. Nada foi alterado no CRM Industrial.**

## Ideia central

> Revisado em 09/11/2026 a pedido do Alex: **a interface atual do CRM Industrial não muda.** Não entra ícone novo na barra. Cada funcionalidade vai para dentro de uma tela existente, conforme o mapa em `docs/melhorias/navegacao.md`. O backlog oficial agora é `docs/melhorias/backlog.md`.

A barra lateral continua como está hoje. A página **Recursos**, dentro do submenu Configurações e visível só para o administrador, lista as funcionalidades novas, cada uma com Ligar/Desligar. Funcionalidade desligada não aparece para ninguém, e o servidor recusa o uso dela.

**Onde guardar a escolha:** em `accounts.custom_attributes['crm_modules']`, sem tabela nova. Todos os módulos começam **desligados**.

**Como as telas entram:** no mesmo padrão do `kanban.js`, com arquivos JS/CSS em `branding/`. Assim o servidor não precisa compilar a interface. Cada módulo novo é um arquivo próprio, incluído uma única vez, sem rodar `apply-branding.rb` de novo.

## Classificação

Custo em dias de trabalho, contando os testes.

### A: implementar primeiro

| # | Módulo | Benefício | Complexidade | Custo | Dependências | Riscos | Arquivos |
|---|---|---|---|---|---|---|---|
| A1 | **Ferramentas e Recursos** (base de ligar/desligar) | Organiza tudo o que vier depois sem poluir a barra | baixa | 2 d | nenhuma | Esquecer a trava no servidor; tem teste para isso | `branding/sidebar.js`, novo `branding/ferramentas.js` e `.css`, `config/routes.rb`, novo `crm_modules_controller.rb`, novo `concerns/crm_module_gate.rb`, spec |
| A2 | **Modo apresentação** | Mostrar o CRM em reunião ou no celular sem expor cliente | baixa | 1 d | A1 | Algum ponto da tela ficar sem borrar; conferir tela por tela | `branding/ferramentas.js`, `whatsapp-web.css`, `kanban.css` |
| A3 | **Relatórios do Kanban** (visão geral, produtividade, meta do mês, exportar CSV) | Gestor vê gargalo, prazo e produção por etapa | média | 4 d | A1; dados já existem | Consulta pesada em conta grande; usar índices e período limitado | novo `kanban_reports_controller.rb`, migração `kanban_funnel_goals`, `branding/kanban.js` (aba Relatórios) ou novo `relatorios-kanban.js`, spec |
| A4 | **Catálogo de produtos e serviços no cartão** | Orçamento com itens, quantidade e total; base para "principais produtos" no relatório | média | 4 d | A1 | Conflito com o `value` digitado à mão; a regra proposta é que o valor vira a soma quando houver itens | migrações `crm_products` e `kanban_item_products`, modelos, 2 controladores, `kanban_items_controller.rb`, `branding/kanban.js` (aba Itens), spec |
| A5 | **Mensagens agendadas** (calendário, vários contatos, repetição, também a partir do cartão) | Aviso de pedido pronto, retorno de orçamento, cobrança | média | 5 d | A1, Sidekiq, envio WAHA | **Envia mensagem real**: limite por minuto, horário comercial, cancelar fácil, teste só em caixa de teste, desligado por padrão | migração `crm_scheduled_messages`, modelo, controlador, `jobs/crm/send_scheduled_message_job.rb`, `config/schedule.yml`, novo `branding/agendadas.js`, `kanban.js` (atalho), spec |

### B: implementar depois

| # | Módulo | Benefício | Complexidade | Custo | Riscos | Arquivos principais |
|---|---|---|---|---|---|---|
| B1 | Salas de chat internas (canais e mensagens diretas) | Setores conversam sem misturar com o cliente | alta | 8 d | Tempo real e notificações; mensagens internas sensíveis | 3 migrações, modelos, controlador, broadcast ActionCable, `branding/salas.js` |
| B2 | Assistente de IA da operação, primeiro só consultando | Perguntar "o que está atrasado hoje?" | alta | 8 d | Custo por uso na OpenAI; vazar dado de caixa sem permissão; ações só com confirmação | controlador, serviço com consultas fixas por permissão, tabela de uso, `branding/assistente.js` |
| B3 | Relatório de chamadas (AstraCalls) | Medir ligações por agente | média | 3 d | baixo | `crm_calls_controller.rb`, tela nova |
| B4 | Cartão: Progresso do Funil, Mover Funil, Mensagem Rápida | Menos cliques por pedido | baixa | 2 d | Conferir antes o que já existe | `branding/kanban.js`, `kanban_items_controller.rb` |

### C: interessante, sem prioridade

| Módulo | Motivo |
|---|---|
| Calculadora WhatsApp API | O CRM usa WAHA e não paga por mensagem; útil só se migrar para a API oficial |
| Minhas notas | Já há notas no cartão e nas atividades |
| Anúncios/novidades para a equipe | Bom para avisar mudanças; pouco uso no dia a dia |
| Construtor de Modelos Meta | Só com WhatsApp Cloud API |
| Escolha de modelo de IA por recurso | Pouco ganho com uma única chave |
| Tour guiado ao ligar um módulo | Ajuda a treinar, mas não é urgente |
| Auditoria própria das ações do CRM | Útil para gestão; a versão do Chatwoot é paga |

### D: não recomendado

| Módulo | Motivo |
|---|---|
| Google Maps Scraper | Vai contra os termos do Google; captar e-mails de terceiros sem consentimento traz risco pela LGPD |
| Cobrança e planos SaaS | O CRM Industrial atende uma empresa, não vende assinatura |
| Copiar SLA, Funções Personalizadas, Auditoria, Atribuição por capacidade e Capitão completo do ProsaHub | Esse código é do módulo pago do Chatwoot, com licença própria. Se fizer falta, construir versão própria ou contratar a licença |
| Mascote flutuante em todas as telas | Cobre conteúdo no celular; o assistente abre pelo menu |

## Ordem sugerida

A1 → A2 → A3 → A4 → A5. Cada um é testado e publicado separadamente. Assim, se um der problema, os outros não param.

## Como será feito, depois da aprovação

1. Branch própria a partir da versão 83, por exemplo `crm-industrial/ferramentas`. A branch da Central de E-mail ainda não tem commit, então primeiro decidimos se ela entra antes.
2. Conferir o backup cifrado mais recente em `/var/backups/crm-industrial/`, ou fazer um novo antes de publicar.
3. Cada módulo com testes no servidor, na interface e na tela, primeiro na cópia local (`crm-email-preview`).
4. Publicação no mesmo processo da versão 83: comparação em três vias, imagem de retorno e conferência depois de publicar.
5. Produção não é alterada direto em nenhum momento.
