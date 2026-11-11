# Backlog de melhorias do CRM Industrial

Lista única. Toda ideia, pedido ou correção ganha um código `MEL-###` e entra aqui antes de ser feita. O método está em `README.md`.

- **Prioridade:** A primeiro · B depois · C se sobrar tempo · D não fazer
- **Esforço:** P até 2 dias · M de 3 a 7 dias · G mais de 7 dias
- **Origem:** PH auditoria do ProsaHub · MG notas do MEGA · AL pedido do Alex · CI achado técnico nosso
- **Status:** Ideia → Triado → Aprovado → Em desenvolvimento → Pronto no local → Publicado (versão) · Descartado

Última atualização: 11/11/2026. Versão no ar: 98.

## Levas

| Leva | Versão | Itens | Por que nesta ordem |
|---|---|---|---|
| 1 | 84 (publicada em 10/11) | MEL-121, MEL-001, MEL-090, MEL-050, MEL-051, MEL-010 | Arruma a casa (Git), cria a página Recursos para ligar e desligar e protege o processo de e-mail recém-publicado |
| 2 | 85 (publicada em 10/11) | MEL-002, MEL-014, MEL-070 | Ganhos visíveis com pouco risco: modo apresentação, aviso de WhatsApp caído e relatório do Kanban |
| 3 | 86 (publicada em 10/11) | MEL-020 (MEL-021 e MEL-023 já existiam) | Kanban como pedido de verdade: itens e valor, atalhos e prazo |
| 4 | 87 (publicada em 10/11) | MEL-040, MEL-041 (MEL-042 já existia; só configurar) | Envio programado e automação por tempo, que mandam mensagem real e por isso entram depois que o resto estiver estável |
| 5 | 88 (publicada em 10/11) | MEL-095, MEL-030 (MEL-093 já existia; MEL-073 adiado) | Atalhos do dia a dia, só na interface: ler várias conversas de uma vez e filtrar Atividades e Calendário |
| 6 | 89 (publicada em 10/11) | MEL-110, MEL-081 (MEL-082 já existia) | Integração com o ERP e o n8n, com as travas de segurança juntas: chave própria e só o administrador apaga mensagem de outra pessoa |
| 7 | 90 (publicada em 10/11) | MEL-100 | Conversa interna da equipe sem misturar com o cliente e sem ícone novo na barra |
| 8 | 91 (publicada em 10/11) | MEL-060, MEL-062 | Assistente só de consulta, com o registro de custo junto, para o gasto nunca ficar sem controle |
| 9 | 92 (publicada em 10/11) | MEL-130 a MEL-134 | Ferramentas rápidas na conversa pedidas pelo Alex, sem duplicar o que já existe |
| 10 | 93 (publicada em 10/11) | Ajuste do Alex no MEL-130 a 134 | PIX como recurso próprio e enviado pelo botão; ferramentas de ajuda no menu do perfil |
| depois | — | Itens B | Um tema por leva |

---

## T1. Navegação e organização

| Código | Item | Origem | Prior. | Esforço | Status | Observação |
|---|---|---|---|---|---|---|
| MEL-001 | Página **Recursos** em Configurações (só administrador) para ligar e desligar cada funcionalidade nova | PH | A | P | Publicado (84) | Base pronta e vazia: o item "Recursos" só aparece no menu quando a primeira funcionalidade for registrada (leva 85). O servidor recusa funcionalidade desligada (`CrmModuleGate`) |
| MEL-002 | Modo apresentação (borrar clientes na tela) | PH | A | P | Publicado (85) | Recurso `modo_apresentacao`. Item no menu do perfil; borra nome, foto, prévia e mensagens nas Conversas, título e cliente no Kanban, Contatos e Central de E-mail. Etiqueta "Desligar" na tela. Escolha guardada só no navegador de cada pessoa |
| MEL-003 | Anúncios/novidades para a equipe | PH | C | P | Ideia | |
| MEL-004 | Minhas notas (bloco pessoal) | PH | C | P | Ideia | Já há notas em cartão e atividade |
| MEL-005 | Tour guiado ao ligar um módulo | PH | C | P | Ideia | |

## T2. WhatsApp (conector WAHA)

| Código | Item | Origem | Prior. | Esforço | Status | Observação |
|---|---|---|---|---|---|---|
| MEL-010 | **Diagnóstico de LID**: o mesmo contato virar duas conversas | MG 4.21 | A | P | Concluído (leva 84) | Em 10/11: **0 duplicados**. Quem trata LID é o app Chatwoot do próprio WAHA (o `conector.mjs` só liga sessões), e os 7 contatos com LID já têm telefone. A checagem de duplicação entrou no aviso do MEL-090. Achados: a sessão `bruna-logistica` do WAHA está com o websocket caído (24 erros em 24 h) e não tem caixa no CRM; o contato com 10 conversas abertas é da caixa de e-mail, onde isso é esperado |
| MEL-011 | Recuperar mídia que falhou ao baixar | MG 4.23 | B | M | Verificar | |
| MEL-012 | Reação no alvo certo | MG 4.23.5 | C | P | Verificar | `reactions.js` |
| MEL-013 | Enviar cartão de contato pelo editor | MG 4.26.5 | C | P | Ideia | |
| MEL-014 | **Aviso quando a sessão do WhatsApp cair** | MG 4.21 | A | P | Publicado (85) | Entra no aviso de saúde (só administrador): sessão do WAHA parada, com falha, esperando QR Code ou apagada. "Iniciando" não conta |
| MEL-015 | Reenvio quando a conversa está ocupada; ACK em lote | MG 4.21, 4.23.5 | C | M | Verificar | |
| MEL-016 | **Fotos e vídeos no tamanho de foto** | Alex | A | P | Publicado (96) | Mensagem de grupo ou com legenda mostrava a mídia como miniatura de 72px |
| MEL-017 | **Datas e horas no padrão do Brasil** | Alex | A | P | Publicado (96) | "Nov 9, 8:01 PM" vira "09/11 20:01" na tela |
| MEL-019 | **E-mail só na Central de E-mail** (fora da Caixa de Entrada) | Alex | A | P | Publicado (97) | A Caixa de Entrada mostrava avisos de conversas de e-mail misturados com os do WhatsApp |
| MEL-020 | **Foto de quem fala no grupo** | Alex | A | P | Publicado (98) | Nome sem o número/LID e foto do WhatsApp pelo WAHA (antes só achava foto se houvesse contato com o mesmo nome) |
| MEL-021 | **Reação na própria mensagem**, não como mensagem nova | Alex | A | P | Publicado (98) | Também em grupo e nas mensagens enviadas; as antigas também vão para o lugar |
| MEL-022 | **Carinha das reações abre só no clique** | Alex | B | P | Publicado (98) | Antes abria ao passar o mouse |
| MEL-023 | **Calculadora de volta na barra lateral** | Alex | B | P | Publicado (98) | Tinha saído na 93; continua também em Ferramentas |
| MEL-018 | PIX com botão de copiar no WhatsApp do cliente (motor NOWEB) | Alex | B | M | Pausado (10/11) | Pausado pelo Alex até descobrir como o ProsaHub faz. Pronto para retomar: contêiner `waha-noweb-teste` parado no computador (motor NOWEB, porta 127.0.0.1:3050, volume `waha-noweb-teste-sessions`), com o envio de botões ajustado (nó `biz`) e o PIX nativo (`payment_info`); cópia do arquivo em [waha-noweb-teste/noweb.buttons.js](waha-noweb-teste/noweb.buttons.js). Falta conectar o chip reserva e testar no celular. Sessão `alex` não foi tocada |

## T3. Kanban

| Código | Item | Origem | Prior. | Esforço | Status | Observação |
|---|---|---|---|---|---|---|
| MEL-020 | **Catálogo de produtos/serviços no cartão** (itens, quantidade, total) | PH, AL | A | M | Publicado (86) | Recurso `produtos_kanban`. Catálogo (menu ⋮ do Kanban; só administrador altera; desativar não apaga) e aba "Itens" no cartão com quantidade, unidade, preço e total; o valor do cartão vira a soma e não é digitado. Nome e preço ficam copiados no item. "Principais produtos" no relatório e coluna Itens na planilha. Migração aditiva `20261110040000_create_crm_products` |
| MEL-021 | Contagem regressiva de item agendado | MG 4.21 | B | P | Já temos | O cartão já mostra "Vence hoje", "Vence amanhã", "Em N dias" e "Vencido há N dias" |
| MEL-022 | Mensagem automática ao entrar em etapa | MG 4.21 | B | M | Ideia | Envia mensagem real |
| MEL-023 | Progresso do funil, Mover Funil e Mensagem Rápida no cartão | PH | B | P | Já temos | Progresso do funil com tempo por etapa já está no Resumo do item; "Mover" já leva para outra coluna ou quadro; o botão do WhatsApp no cartão abre a conversa ao lado, que faz o papel da "Mensagem rápida" |
| MEL-024 | Etiquetas já na criação; notas preservadas ao editar | MG 4.21 | C | P | Verificar | |
| MEL-025 | Etapas não recarregam a cada atualização | MG 4.26.5 | C | P | Ideia | Volume ainda baixo |

## T4. Tarefas, atividades e calendário

| Código | Item | Origem | Prior. | Esforço | Status | Observação |
|---|---|---|---|---|---|---|
| MEL-030 | Filtros na lista e no calendário | MG 4.21 | B | P | Publicado (88) | Atividades: responsável e prioridade. Calendário: mostrar atividades, cards, agendadas e e-mail. A escolha fica salva no navegador |

## T5. Automação e agendamento

| Código | Item | Origem | Prior. | Esforço | Status | Observação |
|---|---|---|---|---|---|---|
| MEL-040 | **Mensagens agendadas** (calendário, vários contatos, repetição, a partir do cartão) | PH, MG | A | M | Publicado (87) | Recurso `mensagens_agendadas`. Agenda pelo Calendário, pelo botão direito na conversa e pelo menu + do card; até 50 contatos, repetição (dia, semana, mês, com data final), horário comercial (seg a sáb, 8h às 18h). Sai só pela conversa que o contato já tem na caixa; sem conversa, é pulado com motivo. No máximo 20 envios por minuto; não reenvia a mesma rodada; recurso desligado pausa tudo. Migração aditiva `20261110050000_create_crm_scheduled_messages` |
| MEL-041 | Reenviar e reagendar agendada que falhou | MG 4.21.5 | A | P | Publicado (87) | "Reenviar falhas" na lista do Calendário: só as falhas da última rodada. "Retomar" pula repetições atrasadas para a próxima data futura |
| MEL-042 | **Automação por tempo** (follow-up) | MG 4.21 | B | P | Já temos | A tela de Automações do site já tem o atraso (`execution_delay`). Falta só criar a regra de follow-up que a empresa quiser; isso é configuração, sem código |
| MEL-043 | Condição "atrasada" nas automações | MG 4.23 | C | M | Ideia | |
| MEL-044 | Saudação só para mensagem recebida | MG 4.23 | C | P | Verificar | |

## T6. E-mail

| Código | Item | Origem | Prior. | Esforço | Status | Observação |
|---|---|---|---|---|---|---|
| MEL-050 | **Limite de tempo na conexão IMAP** | MG 4.26.5 | A | P | Publicado (84) | 15 s para abrir e 4 min para a busca inteira (`IMAP_FETCH_TIMEOUT_SECONDS`); servidor mudo é desconectado e tenta no próximo ciclo |
| MEL-051 | **Resposta SMTP: novas tentativas antes de marcar falha** | MG 4.26.5 | A | P | Publicado (84) | Antes falhava na 1ª tentativa. Agora: falha de conexão e servidor ocupado tentam de novo em 1 e 5 min; tempo esgotado no meio do envio não reenvia (evita cópia dupla) e orienta conferir os enviados |
| MEL-052 | Tamanho máximo de anexo na resposta | MG 4.26.5 | C | P | Ideia | |
| MEL-053 | Excluir de vez e-mail sincronizado do Gmail | MG 4.21.5 | C | P | Ideia | |
| MEL-054 | Teste real do Gmail: chegada e resposta | AL | A | P | Aprovado em parte | Resposta só com sua aprovação, porque é e-mail de verdade |
| MEL-055 | Política de Privacidade pública e app Google em produção | AL | B | P | Triado | Necessário antes de usar OAuth no site |
| MEL-056 | Microsoft Graph (Outlook) | AL | B | M | Triado | Fase 3 |
| MEL-057 | Painel de saúde das caixas, anexos sob demanda | AL | B | M | Triado | Fase 5 |
| MEL-058 | Aba Comunicações no cartão e na empresa | AL | B | M | Triado | Fase 6 |

## T7. Inteligência artificial

| Código | Item | Origem | Prior. | Esforço | Status | Observação |
|---|---|---|---|---|---|---|
| MEL-060 | Assistente da operação, primeiro só consultando | PH, MG 4.25 | B | G | Publicado (91) | Recurso `assistente_ia`, no menu do perfil. 5 consultas só de leitura, presas ao que a pessoa vê; não envia nem altera. Modelo padrão do Chatwoot (`gpt-6-luna`) com a chave OpenAI da conta |
| MEL-061 | Sugestão de etiqueta e prioridade | MG 4.25 | B | M | Ideia | O código da base pede OpenRouter; avaliar versão com a chave OpenAI |
| MEL-062 | Registro de consumo e custo de IA | MG 4.25 | B | P | Publicado (91) | Tabela `crm_ai_usages` (tokens, consultas e custo estimado por pergunta, sem o texto) e limite mensal da conta (padrão US$ 5), que o administrador muda no painel |
| MEL-063 | Teste real de resumir, reescrever e sugerir resposta | CI | B | P | Feito (10/11) | Teste real na conta 2, aprovado pelo Alex: 2 perguntas de contagem certas, US$ 0,0004 no total, recurso continua desligado na tela |

## T8. Relatórios

| Código | Item | Origem | Prior. | Esforço | Status | Observação |
|---|---|---|---|---|---|---|
| MEL-070 | **Relatórios do Kanban** (visão geral, produtividade, meta do mês, CSV) | PH | A | M | Publicado (85) | Recurso `relatorios_kanban`. Terceira opção "Relatórios" ao lado de Kanban e Lista: em andamento, atrasados, sem responsável, concluídos, ticket médio, tempo até concluir, por etapa (tempo parado), por prioridade, por pessoa, checklist, meta do mês (guardada no funil, sem migração) e planilha CSV para o Excel. Mesmas permissões do quadro |
| MEL-071 | Abrir a conversa a partir do relatório | MG 4.25 | C | P | Ideia | |
| MEL-072 | Relatório de chamadas (AstraCalls) | PH | D | M | Descartado (10/11) | Dependia do AstraCalls, que saiu do CRM |
| MEL-073 | Relatórios e filtro avançado sem caixas de e-mail | CI | B | P | Adiado | Limite conhecido da versão 83; mexe nos relatórios nativos, fica para uma leva própria |

## T9. Segurança e auditoria

| Código | Item | Origem | Prior. | Esforço | Status | Observação |
|---|---|---|---|---|---|---|
| MEL-080 | Auditoria própria (quem fez o quê, mensagem apagada) | PH, MG 4.23.5 | C | M | Ideia | A versão do Chatwoot é paga |
| MEL-081 | Excluir e integrar só por administrador | MG 4.21 | B | P | Publicado (89) | Faltava só mensagem: atendente apaga só a própria; administrador apaga qualquer uma; exclusão registrada no servidor. O resto já era só do administrador |
| MEL-082 | Limpar HTML e links Markdown inseguros | MG 4.25 | B | P | Já temos | Chatwoot 4.19.1 (Markdown sem HTML, links validados, DOMPurify) e escape em todas as nossas telas |
| MEL-083 | Aviso de login em aparelho novo | MG 4.25 | C | M | Ideia | |

## T10. Desempenho e monitoramento

| Código | Item | Origem | Prior. | Esforço | Status | Observação |
|---|---|---|---|---|---|---|
| MEL-090 | **Alerta de fila do Sidekiq sem consumidor** | MG 4.26.5 | A | P | Publicado (84) | Faixa discreta no topo, só para administrador e só quando há problema: fila com tarefas e sem processo, fila parada há mais de 15 min, contatos duplicados por LID. Só contagens, sem dado de cliente |
| MEL-091 | Contadores da barra com limite de frequência | MG 4.26.5 | C | P | Ideia | |
| MEL-092 | Busca por índice | MG 4.26.5 | C | M | Ideia | Quando o volume crescer |
| MEL-093 | Notificação push em atribuição e handoff | MG 4.23.5, 4.25 | B | M | Já temos | As chaves VAPID estão configuradas e o aviso de atribuição é do Chatwoot; cada pessoa ativa em Perfil → Notificações e permite no navegador |
| MEL-094 | Hora exata ao passar o mouse | MG 4.23 | C | P | Ideia | |
| MEL-095 | Marcar como lida ao abrir; leitura em massa | MG 4.23.5 | B | P | Publicado (88) | Abrir já marca como lida e o menu do botão direito já tinha lida/não lida. Novo: botão "Marcar lidas" na barra de seleção da lista |
| MEL-096 | Áudio acelerado sem mudar o tom (Safari/iOS) | MG 4.26.5 | C | P | Ideia | |

## T11. Comunicação interna

| Código | Item | Origem | Prior. | Esforço | Status | Observação |
|---|---|---|---|---|---|---|
| MEL-100 | Salas de chat da equipe (canais e mensagens diretas) | PH, MG | B | G | Publicado (90) | Recurso `salas_equipe`; botão "Equipe" na linha de filtros da lista de conversas, painel lateral; canais (todos ou restritos) e conversa direta; atualiza a cada 4 s com o painel aberto |

## T12. Integrações

| Código | Item | Origem | Prior. | Esforço | Status | Observação |
|---|---|---|---|---|---|---|
| MEL-110 | API para enviar mensagem sem conversa aberta (ERP, n8n) | MG 4.21, n8n 0.13 | B | M | Publicado (89) | Recurso `api_envio`; chave própria por sistema, `Idempotency-Key`, limite por minuto. Ver [api-de-envio.md](api-de-envio.md) |
| MEL-111 | Bot recebe a resposta humana; handoff do bot | MG 4.21.5, 4.26.5 | C | M | Ideia | Só se houver bot |

## T13. Base e organização do código

| Código | Item | Origem | Prior. | Esforço | Status | Observação |
|---|---|---|---|---|---|---|
| MEL-120 | Avaliar atualizar a base Chatwoot 4.19.1 para a versão oficial mais nova | CI | B | G | Ideia | Muito do que o MEGA anuncia pode vir de graça; risco alto pelas mudanças do fork |
| MEL-121 | **Pôr em ordem o Git** | CI | A | P | Concluído (leva 84) | Commits locais `f828390` (fork, branch `crm-industrial/central-email`) e `0c2367bd` (`crm-industrial`). Leva 84 nas branches `crm-industrial/leva-84` e `atendimento/leva-84`. Nada enviado ao GitHub |
| MEL-122 | **Código guardado tem coisas que não estão no ar** | CI | A | P | Registrado | O commit `833cdf8` traz Conexões, reações (`crm_reactions`), rotas do AstraCalls e o nome do remetente acima da mensagem (`senderLabel`), que a versão 83 não levou. Toda publicação continua só com os arquivos da leva, comparando em três vias com o servidor |
| MEL-123 | **Retirar o AstraCalls do CRM** | AL | A | P | Concluído (10/11) | Pedido do Alex. Código e marca sem AstraCalls (commits `9efb649` e `16165e11`); Conexões ficou só com WAHA. Com a confirmação do Alex, foram apagados de vez: no servidor, contêineres, redes, volumes `astracalls_app-data` e `astracalls_pg`, a pasta `/opt/crm-industrial/astracalls` e a imagem `astraonline/astracalls:v1.1.6`; no computador, contêineres, volume `astracalls-local_pg`, a pasta `astracalls-local` e as linhas `VOZ_*`/`ASTRACALLS_*` do `.chatwoot.env`. Não reinstalar |

## T14. Ferramentas da conversa (pedido do Alex, 10/11/2026)

Auditoria antes de programar: a calculadora já existia (completa, na barra de ícones) e as respostas prontas do Chatwoot já têm atalho `/` e 13 variáveis (`{{contact.name}}`, `{{agent.name}}`…); em produção não há nenhuma cadastrada. O repositório PIX indicado (`Bruno-Teixeira/br_code_pix`) não existe no GitHub; nenhuma biblioteca nova foi usada (QR pela `qrcode.js`, MIT, já carregada).

| Código | Item | Origem | Prior. | Esforço | Status | Observação |
|---|---|---|---|---|---|---|
| MEL-130 | Botão + no campo de digitação com painel de ferramentas | Alex | A | P | Publicado (92) | Recurso `ferramentas_conversa`; ao lado do emoji; nada é enviado sozinho |
| MEL-131 | PIX Copia e Cola com QR Code | Alex | A | M | Publicado (92) | BR Code estático conferido com o exemplo do Banco Central; chave da conta em `custom_attributes['crm_pix']` (só o administrador altera); copiar, inserir mensagem e anexar QR pelo clipe |
| MEL-132 | Conversor de unidades e cubagem | Alex | B | P | Publicado (92) | Peso, comprimento, área, volume; cubagem com fator ajustável (padrão 300 kg/m³) |
| MEL-133 | Modelos com campos | Alex | B | P | Publicado (92) | Respostas prontas com `[[Campo]]` viram formulário; variáveis do Chatwoot continuam; sem tabela nova |
| MEL-134 | Calculadora: inserir resultado na conversa | Alex | C | P | Publicado (92) | Botão Inserir na calculadora existente e atalho no painel |
| MEL-135 | Respostas prontas novas ou duplicadas | Alex | — | — | Já temos | Chatwoot já tem; falta só cadastrar |

## Não fazer ou não se aplica

| Código | Item | Motivo |
|---|---|---|
| MEL-900 | Cobrança, planos, gateways, Super Admin, revenda white label | O CRM atende uma empresa |
| MEL-901 | Google Maps Scraper | Termos do Google e LGPD |
| MEL-902 | WhatsApp Cloud: janela de 24h, modelos Meta, chamadas Cloud, coexistência, calculadora de tarifa | O CRM usa WAHA. Reabrir se migrar para a API oficial |
| MEL-903 | Copiar Captain V2, Copilot, SLA, funções personalizadas, auditoria e Mega Assistant | Código do fornecedor e do módulo pago. Fazer versão própria (MEL-060, MEL-080) |
| MEL-904 | Uazapi, Evolution, NotificaMe, Facebook, Instagram, TikTok, Telegram, Twilio, Slack, Help Center | Canais não usados hoje |

## Versão 84 (10/11/2026)

Publicada sem migração e sem build de interface: 12 arquivos (8 do servidor, rotas, layout, `sidebar.js` e `whatsapp-web.css`), montados como "arquivo do site + mudanças da leva". Backup: `/var/backups/crm-industrial/chatwoot-20261110-022156.dump.enc` (128 tabelas). Para voltar: `sh aplicar-84.sh voltar` (imagem `crm-industrial-chatwoot:v4.19.1-pre-84` e arquivos em `/opt/crm-industrial/deploy/backup-pre-84`). Imagem atual: `v4.19.1` = `v4.19.1-email-84`. Conferência: saúde sem avisos nas contas 2 e 3, filas vazias, 0 erros nos três processos, 0 respostas 5xx, WhatsApp chegando.

## Versão 85 (10/11/2026)

Publicada sem migração e sem build de interface: 11 arquivos (5 do servidor, rotas, layout, `kanban.js`, `kanban.css`, `sidebar.js` e `whatsapp-web.css`), só no processo web. Os recursos "Relatórios do Kanban" e "Modo apresentação" entram desligados em Configurações → Recursos. Backup: `/var/backups/crm-industrial/chatwoot-20261110-030409.dump.enc` (128 tabelas). Para voltar: `sh aplicar-85.sh voltar` (imagem `v4.19.1-pre-85` e `/opt/crm-industrial/deploy/backup-pre-85`). Imagem atual: `v4.19.1` = `v4.19.1-kanban-85`. Conferência: relatório calculado no quadro real sem erro, WAHA consultado (sessão conectada), 0 erros, 0 respostas 5xx.

## Versão 86 (10/11/2026)

Publicada com 1 migração só aditiva (`crm_products` e `kanban_item_products`) e sem build de interface: 16 arquivos. O recurso "Produtos e serviços no cartão" entra desligado em Configurações → Recursos. Backup: `/var/backups/crm-industrial/chatwoot-20261110-032921.dump.enc` (128 tabelas). Para voltar: `sh aplicar-86.sh voltar` (imagem `v4.19.1-pre-86`; as 2 tabelas novas podem ficar, não atrapalham). Imagem atual: `v4.19.1` = `v4.19.1-produtos-86`.

**Tropeço da publicação:** o roteiro copiava só `app`, `config` e `public`; a migração (em `db`) não foi junto e o código novo ficou cerca de 3 minutos sem as tabelas. Ninguém usou o Kanban nesse intervalo (0 erros, 0 respostas 5xx). A migração foi enviada e aplicada em seguida, e o roteiro agora leva `db` também.

## Versão 87 (10/11/2026)

Publicada com 1 migração só aditiva (3 tabelas de mensagens agendadas), sem build de interface: 15 arquivos, e o processo de tarefas recriado para registrar o despachante (`crm_scheduled_messages_dispatch_job`, a cada minuto). O recurso "Mensagens agendadas" entra desligado. Backup: `/var/backups/crm-industrial/` do dia 10/11 antes da 87 (130 tabelas). Para voltar: `sh aplicar-87.sh voltar` (imagem `v4.19.1-pre-87`; as tabelas novas podem ficar). Imagem atual: `v4.19.1` = `v4.19.1-agenda-87`. Conferência: migração aplicada, despachante rodando sem erro, filas vazias, 0 respostas 5xx; o único registro de erro no web foi um robô procurando `/wp-admin`.

**As 4 levas propostas estão no ar.**

## Versão 88 (10/11/2026)

Publicada só com interface: 3 arquivos (`sidebar.js`, `whatsapp-web.css` e o layout). Sem migração, sem mudar o servidor e sem recriar processos. Os itens não dependem de Configurações → Recursos: aparecem para todos. Backup: `/var/backups/crm-industrial/chatwoot-20261110-101554.dump.enc` (133 tabelas). Para voltar: `sh aplicar-88.sh voltar` (imagem `v4.19.1-pre-88`). Imagem atual: `v4.19.1` = `v4.19.1-filtros-88`. Conferência: layout servindo `whatsapp-web-88`, 0 erros nos três processos, 0 respostas 5xx, WhatsApp chegando. Leva junto uma correção antiga: `dressTaskEditing` quebrava quando a página tinha um título fora de cabeçalho. Testada na cópia local com dados fictícios: 2 conversas não lidas viram 0 com um clique e a barra fecha; "Minhas" e "Prioridade baixa" filtram certo e os contadores acompanham; no Calendário, desligar "Cards" tira 4 de 8 eventos; 0 erros na página.

## Versão 89 (10/11/2026)

Publicada com 1 migração só aditiva (`crm_api_tokens` e `crm_api_requests`): 13 arquivos, sem recriar o processo de filas. Backup: `/var/backups/crm-industrial/chatwoot-20261110-111924.dump.enc` (133 tabelas). Para voltar: `sh aplicar-89.sh voltar` (imagem `v4.19.1-pre-89`; as 2 tabelas novas podem ficar). Imagem atual: `v4.19.1` = `v4.19.1-api-89`. Conferência: migração aplicada, API sem chave devolve 401, chaves sem login 401, layout `whatsapp-web-89`, 0 erros nos três processos, 0 respostas 5xx, WhatsApp chegando. O recurso "API de envio" está desligado nas contas 2 e 3 e nenhuma chave foi criada; a entrega real pelo WAHA ainda não foi testada.

Preparada com 1 migração só aditiva (`crm_api_tokens` e `crm_api_requests`), código novo no servidor (sem recriar o Sidekiq: nada novo no cron) e telas em `sidebar.js` e `whatsapp-web.css`.

- **MEL-110 API de envio:** recurso `api_envio`, desligado por padrão. Detalhes e exemplo para o n8n em [api-de-envio.md](api-de-envio.md). Chave por sistema, guardada só como HMAC, presa às caixas escolhidas, com limite por minuto, `Idempotency-Key` e revogação. Entra por `/crm_api/v1/messages`, fora do login de pessoas.
- **MEL-081:** o Chatwoot Community deixava qualquer atendente com acesso à conversa apagar qualquer mensagem, até a do cliente. Agora o atendente apaga só a que ele enviou, o administrador apaga qualquer uma, e cada exclusão fica no registro do servidor (quem, qual mensagem, qual conversa). Excluir conversa, contato, caixa e integração já era só do administrador. Cartão e quadro do Kanban vão para o arquivo e podem ser restaurados. Na tela, o atendente ainda vê "Apagar" na mensagem do cliente, mas recebe o aviso de que só o administrador pode.
- **MEL-082:** já coberto. O Chatwoot 4.19.1 desliga HTML no Markdown das mensagens, valida links e limpa HTML de e-mail com DOMPurify. Nas nossas telas, todo texto vindo de pessoas passa por escape.

Testes: 42 novos e 124 de regressão sem falha, lint limpo, migração de ida e volta. Na cópia local, com a caixa de teste sem webhook: chave criada pela tela e mostrada uma vez, envio com contato e conversa novos (201), mesmo pedido repetido sem reenviar, mesmo número reaproveitando contato e conversa, chave revogada pela tela devolvendo 401, 0 erros na página.

## Versão 90 (10/11/2026)

Publicada com 1 migração só aditiva (3 tabelas): 13 arquivos, sem recriar o processo de filas. Backup: `/var/backups/crm-industrial/chatwoot-20261110-121705.dump.enc` (135 tabelas). Para voltar: `sh aplicar-90.sh voltar` (imagem `v4.19.1-pre-90`; as 3 tabelas novas podem ficar). Imagem atual: `v4.19.1` = `v4.19.1-salas-90`. Conferência: migração aplicada, salas sem login devolvem 401, layout `whatsapp-web-90`, 0 erros nos três processos, 0 respostas 5xx, WhatsApp chegando. O recurso "Salas da equipe" está desligado nas contas 2 e 3.

Preparada com 1 migração só aditiva (`crm_team_rooms`, `crm_team_room_members`, `crm_team_messages`), código novo no servidor sem mudar o cron, e telas em `sidebar.js` e `whatsapp-web.css`.

- **MEL-100 Salas da equipe:** recurso `salas_equipe`, desligado por padrão. Botão "Equipe" com o número de não lidas na linha de filtros da lista de conversas (ao lado de "Todas"); abre um painel lateral por cima da tela, sem ícone novo na barra. O administrador cria canais para todos da conta ou só para quem escolher, renomeia e arquiva. Qualquer pessoa abre conversa direta com um colega. Conversa direta só é vista por quem participa: nem o administrador lê. Apaga a mensagem quem escreveu ou o administrador (o texto some e a exclusão fica no registro do servidor).
- **Tempo real:** consulta curta a cada 4 s com o painel aberto e contagem a cada 30 s, sem mexer no ActionCable do Chatwoot. Basta para uma equipe pequena; se crescer, dá para trocar por ActionCable depois.
- **Celular:** o painel ocupa a tela, com a lista de salas e a volta. Lá o Enter quebra a linha e o envio é pelo botão.

Testes: 38 novos e 42 de regressão sem falha, lint limpo, migração de ida e volta. Na cópia local, com duas pessoas fictícias ao mesmo tempo: a administradora criou a sala Geral e escreveu na sala e na conversa direta; o contador do atendente marcou 2 e zerou ao ler; a resposta dele apareceu sozinha para a administradora; texto com HTML saiu como texto; o atendente não vê "Nova sala" e só apaga a própria mensagem; 0 erros na página. Dois defeitos achados e corrigidos no teste: a sala aberta ainda contava como não lida, e no celular o tema escondia o painel (regra que some com todo `aside` que tem `nav`).

## Versão 91 (10/11/2026)

Publicada com 1 migração só aditiva (`crm_ai_usages`): 18 arquivos, sem recriar o processo de filas. Backup: `/var/backups/crm-industrial/chatwoot-20261110-144540.dump.enc` (138 tabelas). Para voltar: `sh aplicar-91.sh voltar` (imagem `v4.19.1-pre-91`; a tabela nova pode ficar). Imagem atual: `v4.19.1` = `v4.19.1-ia-91`. Conferência: biblioteca de IA 2.0.0 e modelo `gpt-6-luna` no servidor, migração aplicada, assistente sem login devolve 401, layout `whatsapp-web-91`, 0 erros nos três processos (só um robô procurando `/wp-admin`), 0 respostas 5xx, WhatsApp chegando. O recurso "Assistente de IA" está desligado nas contas 2 e 3.

**Teste real com a OpenAI (MEL-063), aprovado pelo Alex em 10/11/2026:** na conta 2, pelo serviço do assistente, sem ligar o recurso na tela, com perguntas só de contagem (nenhuma conversa de cliente enviada). "Quantas conversas abertas e sem responsável?" → 58 abertas e 39 sem responsável (banco: 59 e 39 segundos depois; chegou uma conversa nova no meio), 1 consulta, 1.633 tokens de entrada e 32 de saída, US$ 0,000179, 5 s. "Atividades e cartões atrasados?" → 0 e 0 (banco: 0 e 0), 3 consultas, 1.758 e 100 tokens, US$ 0,000226, 3,5 s. Total do mês na conta 2: US$ 0,0004 de US$ 5.

**Ligado na conta 2 em 10/11/2026, a pedido do Alex:** o assistente aparece no menu do perfil de quem usa a conta 2 (1 pessoa), com limite de US$ 5 por mês. A conta 3 continua sem ele.

**Pedido do Alex junto com a 91 — barras laterais minimizadas a cada login:** a barra de ícones, a barra do Chatwoot e o painel do contato começam fechados em cada login, como no WhatsApp Web; quem abrir pelo botão continua com ela aberta até sair. Antes, quem abria a barra de ícones uma vez ficava com ela aberta para sempre, e a barra do Chatwoot era recolhida com recarga da página. Agora é sem recarga (ação `updateUISettings` do próprio Chatwoot), uma vez por login (o `client` do cookie de sessão marca o login). Testado na cópia local: login fechado, abrir e recarregar mantém aberto, novo login fecha de novo.

Preparada com 1 migração só aditiva (`crm_ai_usages`), código novo no servidor sem mudar o cron, e telas em `sidebar.js` e `whatsapp-web.css`.

- **MEL-060 Assistente de IA:** recurso `assistente_ia`, desligado por padrão, aberto pelo menu do perfil (sem mascote flutuante, como previsto). Responde perguntas como "o que está atrasado hoje?" chamando 5 consultas só de leitura: resumo do atendimento, lista de conversas, leitura de uma conversa, atividades e cartões do Kanban. Cada consulta usa as mesmas regras das telas: o atendente só vê as caixas e times dele e os quadros que enxerga; o administrador vê a conta. Não envia mensagem nem altera nada. Texto de cliente entra como dado, não como instrução. Até 6 consultas por pergunta, 30 perguntas por hora por pessoa, pergunta até 1.000 caracteres.
- **MEL-062 Consumo e custo:** cada pergunta grava quem perguntou, modelo, tokens, consultas e custo estimado (pela tabela de preços do Chatwoot), sem guardar a pergunta nem a resposta. O assistente para quando o gasto do mês chega no limite da conta (padrão US$ 5); o administrador vê o gasto e muda o limite no painel.
- **Chave e modelo:** usa a chave da integração OpenAI da conta (contas 2 e 3 já têm) e o modelo padrão desta versão do Chatwoot, `gpt-6-luna` (US$ 0,10 por milhão de tokens de entrada e US$ 0,50 de saída). Uma pergunta típica de teste gastou 2.400 tokens de entrada e 300 de saída: menos de US$ 0,001.
- **Aviso na tela:** o painel diz que a pergunta e os dados consultados vão para a OpenAI.

Testes: 31 novos e 28 de regressão sem falha, lint limpo, migração de ida e volta. Na cópia local, com um servidor falso compatível com a OpenAI (sem internet e sem custo), pelo caminho real da biblioteca de IA: o modelo recebeu as 5 consultas, pediu o resumo, recebeu os números e respondeu; o consumo somou as duas rodadas; o administrador vê o gasto e mudou o limite; o atendente não vê o gasto; o link #1 abre a conversa; HTML vindo da IA sai como texto; 0 erros na página. **Falta o teste real com a OpenAI (MEL-063)**, que custa frações de centavo e depende da sua aprovação.

## Versão 92 (10/11/2026)

Publicada sem migração: 9 arquivos, sem recriar processos. Backup: `/var/backups/crm-industrial/chatwoot-20261110-162801.dump.enc` (139 tabelas; decifrado e listado por inteiro depois, porque a contagem rápida mostrou um aviso do openssl sem efeito no arquivo). Para voltar: `sh aplicar-92.sh voltar` (imagem `v4.19.1-pre-92`). Imagem atual: `v4.19.1` = `v4.19.1-ferramentas-92`. Conferência: rota do PIX sem login devolve 401, layout `whatsapp-web-92` (inclusive `kanban.js`), 0 erros nos três processos, 0 respostas 5xx, mensagens chegando. O recurso "Ferramentas da conversa" foi ligado na conta 2 em 10/11/2026, a pedido do Alex (conta 3 desligada); a chave PIX ainda não foi cadastrada e não há modelos com campos.

Preparada sem migração. Servidor: dados do PIX da conta (`crm_pix_settings`), recurso `ferramentas_conversa` e uma correção no `MessageBuilder`. Telas: `sidebar.js`, `kanban.js` e `whatsapp-web.css`.

- **Ferramentas da conversa (MEL-130 a 134):** botão + ao lado do emoji. PIX (cadastro da chave pelo administrador; valor, identificador e descrição; QR, copiar código, inserir mensagem pronta, anexar QR), conversor e cubagem, modelos com campos a partir das respostas prontas e atalho da calculadora, que ganhou o botão Inserir. O texto entra no campo de digitação com quebras de linha simples (como Shift+Enter) e o QR entra pelo campo do clipe: o atendente revisa e envia, e o WAHA entrega como sempre.
- **Correção encontrada no teste:** mensagem com anexo chega do navegador com quebras CRLF e o WAHA só converte a quebra do editor seguida de LF, então a barra do Markdown apareceria no WhatsApp. O `MessageBuilder` passou a gravar sempre LF (vale para qualquer mensagem com anexo e várias linhas).
- **Também:** as cores `--kb-*` passaram a valer nos painéis Equipe e Assistente (bordas e botões apareciam apagados fora do Kanban).

Testes: 20 novos e 94 de regressão sem falha, lint limpo. Na cópia local (caixa sem webhook): código PIX idêntico ao gerador conferido com o Banco Central (valor e CRC certos), QR anexado e enviado como `pix-qrcode.png`, mensagem gravada com quebras no formato que o WAHA converte, conversor (1.500 kg = 1,5 t) e cubagem (3 × 120 × 80 × 100 cm = 2,88 m³, 864 kg), modelo com 6 campos e o nome do contato, calculadora inserindo 36, painel no celular; 0 erros na página.

## Versão 93 (10/11/2026)

Publicada sem migração: 6 arquivos, sem recriar processos. Backup: `/var/backups/crm-industrial/chatwoot-20261110-165438.dump.enc` (139 tabelas, decifrado e listado por inteiro). Para voltar: `sh aplicar-93.sh voltar` (imagem `v4.19.1-pre-93`). Imagem atual: `v4.19.1` = `v4.19.1-pix-93`. Conferência: PIX sem login devolve 401, layout `whatsapp-web-93`, 0 erros, 0 respostas 5xx, mensagens chegando. "PIX na conversa" ligado na conta 2 a pedido do Alex (com "Ferramentas de ajuda", que já estava ligado); conta 3 sem os dois. Chave PIX ainda não cadastrada.

Ajuste pedido pelo Alex em 10/11/2026, depois de usar a 92. Sem migração; servidor muda só o registro dos recursos.

- **PIX como recurso próprio** (`pix_conversa`): o botão + abre só o PIX. A chave aceita CPF, CNPJ, telefone, e-mail e chave aleatória com botões visíveis e reconhecimento automático (na 92 o tipo ficava numa lista que o tema deixava sem setinha e parecia fixo em CPF). Botões **Copiar código** e **Enviar PIX**: com confirmação, envia duas mensagens pelo caminho normal (API de mensagens do Chatwoot → WAHA): a cobrança com o QR Code e, em seguida, só o código para o cliente copiar.
- **Botão "Copiar código" no WhatsApp do cliente: não dá com a ligação atual.** O WAHA de produção usa o motor GOWS, que não implementa mensagens com botão (só o NOWEB tem, e o próprio WAHA trata como experimental). Trocar de motor exigiria refazer a sessão, o que o Alex pediu para não mexer. Por isso o código vai sozinho numa mensagem, fácil de copiar segurando o dedo.
- **Ferramentas de ajuda** (`ferramentas_conversa`, renomeado): calculadora, conversor e cubagem e modelos com campos, no item **Ferramentas** do menu do perfil, só quando liberado. O ícone fixo da calculadora saiu da barra da esquerda.

Testes: 20 novos e 94 de regressão sem falha, lint limpo. Na cópia local: reconhecimento da chave em 7 exemplos; cadastro com chave aleatória; envio gerou as duas mensagens (QR anexado; segunda mensagem idêntica ao código gerado, conferido com o Banco Central); com os dois recursos desligados não aparece o + nem o item Ferramentas; 0 erros na página.

## Versão 94 (10/11/2026)

Publicada só com tela (3 arquivos). Backup: `/var/backups/crm-industrial/chatwoot-20261110-171523.dump.enc` (139 tabelas, conferido por inteiro). Para voltar: `sh aplicar-94.sh voltar` (imagem `v4.19.1-pre-94`). Imagem atual: `v4.19.1` = `v4.19.1-pix-94`. Conferência: layout `whatsapp-web-94`, 0 erros, 0 respostas 5xx, mensagens chegando.

Correção só de tela, depois do primeiro uso real do Alex na 93: a chave foi salva, mas o pedido de envio nunca chegou ao servidor porque o botão **Enviar PIX** ficava escondido embaixo do QR em tela de notebook (era preciso rolar dentro do painel). Agora **Copiar código** e **Enviar PIX** ficam presos no rodapé do painel e o QR ficou menor. Conferido em 1366×650 e no celular: os dois botões visíveis sem rolar. 2 arquivos (`sidebar.js`, `whatsapp-web.css`) e o layout.

## Versão 95 (10/11/2026)

Publicada só com tela (3 arquivos; `qrcode.js` novo no site). Backup: `/var/backups/crm-industrial/chatwoot-20261110-172353.dump.enc` (139 tabelas, decifrado inteiro). Para voltar: `sh aplicar-95.sh voltar` (imagem `v4.19.1-pre-95`; remove o `qrcode.js`). Imagem atual: `v4.19.1` = `v4.19.1-pix-95`. Conferência: `qrcode.js` e `sidebar.js` servidos (200), layout `whatsapp-web-95`, 0 erros, 0 respostas 5xx, mensagens chegando. Tropeço da publicação: o roteiro (copiado do da 88) não tratava arquivo novo e parou na etapa de backup antes de enviar; nada mudou no site. Corrigido e publicado em seguida.

Segunda correção depois do uso real do Alex: o QR não aparecia igual à demonstração e o Enviar PIX continuava sem enviar. Causa: **o `qrcode.js` nunca foi publicado em produção** (estava só na cópia local, junto com Conexões, que não está no ar); sem ele o QR não era desenhado e o envio travava esperando a imagem. Erro da auditoria da 92, que conferiu a cópia local e não o site. Correção: o pacote leva o `qrcode.js` (MIT) com a tag no layout antes do `sidebar.js`; e o PIX passa a sair mesmo sem a imagem (dados + código, com aviso no painel), preparando a imagem no clique se ainda não estiver pronta. Testado com e sem a biblioteca, com clique rápido. 3 arquivos (`qrcode.js`, `sidebar.js` e o layout).

## Versão 96 (10/11/2026)

Publicada só com tela (3 arquivos: `sidebar.js`, `whatsapp-web.css` e o layout). Backup: `/var/backups/crm-industrial/chatwoot-20261110-221546.dump.enc` (139 tabelas, decifrado inteiro). Para voltar: `sh aplicar-96.sh voltar` (imagem `v4.19.1-pre-96`). Imagem atual: `v4.19.1` = `v4.19.1-midia-96`. Conferência: layout `whatsapp-web-96`, `sidebar.js` e `whatsapp-web.css` servidos (200), sem erro no servidor; na conversa do grupo "Mundo das Montagens" as fotos passaram de 72×72 para 256×340 e as horas para "10/11 18:13".

Pedido do Alex: imagens e vídeos "aparecendo esquisito" e datas no padrão do Brasil.

- **MEL-016 Fotos e vídeos:** mensagem de grupo (o WAHA põe o nome de quem mandou no texto) e mensagem com legenda caem no balão de texto, onde o Chatwoot mostra a mídia como miniatura quadrada de 72px. Agora a mídia aparece com até 280px de largura e na proporção original (altura até 340px); várias fotos viram grade de duas por linha; vídeo com play maior; foto sem texto limitada a 300×380; balão com mídia pode ocupar até 92% da largura (o de texto continua em 62%), para a foto não ficar espremida no celular.
- **MEL-017 Datas:** o Chatwoot escreve datas em inglês em vários lugares, com o formato fixo no código já compilado. Como o servidor não compila, o `sidebar.js` troca na tela textos que são inteiros uma data ou hora: "Nov 9, 8:01 PM" → "09/11 20:01", "8:01 PM" → "20:01", "Nov 9, 2026" → "09/11/2026", "Fri, Nov 7, 2026 at 3:04 PM" → "sex. 07/11/2026 15:04". Não mexe no texto das mensagens (`.prose`) nem onde se digita. O horário é o do aparelho de quem usa (no Brasil, o de São Paulo); a troca muda só a escrita.

Testes: 21 formatos de data (inclusive textos que não podem mudar, como "Mayor 5"); na cópia local, foto com texto, foto sem texto e álbum de três fotos no computador (1366) e no celular (390), 0 erros na página. Vídeo real não testado (a cópia local não gera vídeo); usa as mesmas regras das fotos.

## Versão 97 (10/11/2026)

Publicada só no servidor: 2 arquivos (`notification_finder.rb` e `action_cable_listener.rb`), no web e nos dois processos de filas (o aviso em tempo real roda nas filas; as duas foram reiniciadas com espera). Sem migração e sem mudar a tela. Backup: `/var/backups/crm-industrial/chatwoot-20261110-232421.dump.enc` (139 tabelas, decifrado inteiro). Para voltar: `sh aplicar-97.sh voltar` (arquivos de volta nos três processos e imagem `v4.19.1-pre-97`). Imagem atual: `v4.19.1` = `v4.19.1-caixa-97`. Conferência: site 200, 0 erros nos três processos, filas vazias e 2 processos de fila ativos, mensagem nova chegando na hora; na Caixa de Entrada da conta 2 só aparecem conversas do WhatsApp.

- **MEL-019 E-mail só na Central de E-mail (pedido do Alex):** a lista de Conversas já separava o e-mail desde a 83, mas a **Caixa de Entrada** (notificações) ainda mostrava avisos de conversas de e-mail junto com os do WhatsApp. Agora o `NotificationFinder` deixa de fora as notificações de conversas de caixas de e-mail (lista e contadores), e o aviso em tempo real dessas notificações não é mais mandado para a tela. Nada é apagado: os e-mails seguem na Central de E-mail, com o contador próprio.

Testes: 6 novos e 69 de regressão sem falha, lint limpo. Na cópia local, com um aviso de e-mail e um de WhatsApp: antes, a Caixa de Entrada recebia 2 e mostrava 2 não lidas; depois, só o do WhatsApp e 1 não lida, no computador e no celular, 0 erros na página.

## Versão 98 (11/11/2026)

Publicada sem migração: 10 arquivos (3 novos). Web recebe todos; as duas filas recebem o código Ruby de `app/` (a reação é tratada no modelo de mensagem) e foram reiniciadas com espera. Backup: `/var/backups/crm-industrial/chatwoot-20261111-002919.dump.enc` (139 tabelas, decifrado inteiro). Para voltar: `sh aplicar-98.sh voltar` (arquivos de volta, novos removidos nos três processos, imagem `v4.19.1-pre-98`). Imagem atual: `v4.19.1` = `v4.19.1-reacoes-98`. Conferência: site 200, rota de fotos sem login 401, layout `whatsapp-web-98` e os 4 arquivos de tela servidos (200), 0 erros nos três processos, código carregado no web e nas filas. A conferência na tela do site ficou para o Alex (o navegador do app saiu da conta).

Pedidos do Alex em 10/11/2026:

- **MEL-020 Foto de quem fala no grupo:** o nome e as iniciais já existiam (`dressGroupMessage` no `sidebar.js`), mas o nome vinha com o número/LID e a foto só aparecia se houvesse um contato com o mesmo nome. Agora o nome sai limpo e a foto vem do WhatsApp: rota `crm_participant_photos` (só para quem vê a conversa; só números e LIDs válidos, até 30 por pedido) que pede ao WAHA `/api/contacts/profile-picture` e guarda 12 h no cache, inclusive "sem foto"; com o WAHA fora do ar não grava nada. Link vencido volta para as iniciais.
- **MEL-021 Reação na mensagem:** o WAHA entrega a reação como mensagem "*Reagiu com* 👍" respondendo à mensagem reagida. Agora ela vira registro de atividade (`CrmReactionMessage`, com `crm_reaction`: emoji, quem e mensagem reagida): não conta como não lida, não notifica, não muda a prévia nem sobe a conversa, e não volta ao WAHA. A tela (`reactions.js`) junta reações de contatos, as suas (nota privada `waha_reaction`) e as antigas, e mostra o selo em cima da mensagem reagida, com o número de pessoas e quem reagiu ao passar o mouse; reação removida some.
- **MEL-022 Carinha no clique:** uma regra do `theme.css` abria os emojis no `:hover`; o `whatsapp-web.css` agora só mostra com `.is-open`.
- **MEL-023 Calculadora na barra:** ícone de volta ao lado do botão de tema (`kanban.js`).

Testes: 11 novos e 189 de regressão sem falha, lint limpo. Na cópia local, grupo fictício com duas pessoas: selos certos (❤️👍 2 na mensagem enviada, 😂 na do contato, 🙏 sua), reação removida sumiu, 6 notas de reação escondidas, nome sem número, foto e iniciais, carinha não abre no mouse e abre no clique, calculadora abre pela barra; computador e celular, 0 erros na página.

Próximos candidatos (prioridade B): MEL-073 relatórios sem caixas de e-mail.
