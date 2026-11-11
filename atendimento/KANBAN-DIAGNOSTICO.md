# Kanban profissional: diagnóstico e plano de migração

Auditoria de 2026-11-08, feita só com leitura. Nenhuma tabela foi alterada. O Kanban ainda não está na produção, então não existe dado real a preservar; o CRM local tem só dados de teste.

## Arquitetura atual

| Camada | Situação |
|---|---|
| Frontend do CRM | Chatwoot em Vue 3, Vuex e vue-router. Não há React no projeto. |
| Kanban | Camada própria em JavaScript puro (`kanban.js`, 1430 linhas; `kanban.css`, 468), carregada sobre o Chatwoot. Mesmo padrão de `sidebar.js` e `reactions.js`. |
| Backend | Rails: 7 tabelas `kanban_*`, 3 controllers, serviço de entrada automática. |
| WhatsApp | WAHA ligado ao Chatwoot pelo app nativo. A caixa é `Channel::Api`. O frontend nunca toca em token do WAHA. |
| Painel do contato | `ContactPanel.vue`, compilado no Chatwoot. Já tem `WorkActivityList`. |
| Iniciar conversa | O Chatwoot já oferece `contactable_inboxes` e `POST conversations`. |

## Projetos de referência

| Projeto | Licença | Última atividade | Stack | Conclusão |
|---|---|---|---|---|
| marmelab/atomic-crm | MIT | nov/2026 | React 19, @hello-pangea/dnd | Referência de produto: arquivar negócio, data de fechamento, estrutura de card e coluna. |
| Georgegriff/react-dnd-kit-tailwind-shadcn-ui | MIT | mai/2024 | React 18, dnd-kit | Parado. Só a ideia de anúncios para leitor de tela e arraste por teclado. |
| janhesters/shadcn-kanban-board | MIT | mai/2025 | React 19, Radix | Referência de teclado e acessibilidade. |
| svar-widgets/react-kanban | MIT | jun/2026 | React, 12 pacotes próprios | Não usar: traz um ecossistema inteiro e tem pouca adoção. |
| chatwoot/chatwoot | MIT com pasta enterprise à parte | nov/2026 | Vue 3 | É a base atual. O fork é Community, sem a pasta enterprise. |

**Nenhum código desses projetos React será incorporado.** Colocar React dentro de um app Vue criaria um segundo framework no navegador, contrariando a prioridade de desempenho. Reaproveitamos os padrões e reescrevemos no que já existe.

Para arrastar, o Chatwoot já usa `vuedraggable`, construído sobre SortableJS (MIT). Proponho usar o SortableJS no Kanban: ganha toque no celular, rolagem automática nas bordas e animação, que o arraste nativo atual não tem, sem introduzir uma tecnologia nova no projeto.

## Problemas encontrados

### Crítico: o Kanban atual quebraria exclusões do Chatwoot
Testado em transação desfeita logo depois. Com um cartão vinculado:

| Ação | Resultado |
|---|---|
| Apagar conversa | Falha com `InvalidForeignKey` |
| Apagar contato | Falha com `InvalidForeignKey` |
| Apagar agente | Falha com `InvalidForeignKey` |

Por isso, **a versão atual não deve ser publicada** antes da migração 1.

### Outros
- Prazo de entrega não existe; `scheduled_at` é agendamento.
- Cliente ou transportadora sem contato cadastrado não tem campo próprio.
- Excluir item e funil é irreversível.
- Excluir coluna com cards só bloqueia; não oferece mover.
- O app roda em UTC, o que exige cuidado com o dia em São Paulo.
- Só administrador cria quadro; agente não organiza o próprio fluxo.
- O cartão expõe caixa e contador de conversa sem checar se o agente tem acesso àquela caixa.
- Etiquetas não são validadas contra as da conta.
- Cada coluna faz uma requisição com cerca de 13 consultas, o que pesa com muitas colunas.
- Alterações em quadro e coluna não ficam registradas.

### O que já atende
Quadros e colunas ilimitados e persistentes, renomear, cor, reordenar, arrastar com atualização otimista, card independente de telefone e conversa, histórico do item, permissões no backend testadas.

## Plano de migração
Só adiciona. Nenhuma coluna existente é removida ou reescrita.

**Migração 1: integridade**

| Coluna | Ao apagar o registro de origem |
|---|---|
| `kanban_items.contact_id`, `conversation_id`, `creator_id` | Limpa o vínculo e mantém o card |
| `kanban_item_notes.user_id`, `kanban_item_events.user_id` | Limpa o autor e mantém o registro |
| `kanban_item_agents.user_id` | Remove só a atribuição |
| `account_id`, `kanban_funnel_id` e filhos do item | Cascata, apenas para exclusão real da conta ou do item |
| `kanban_items.kanban_stage_id` | Continua bloqueando: card nunca fica sem coluna |

**Migração 2: novos campos**

| Tabela | Campo | Uso |
|---|---|---|
| `kanban_items` | `customer_name` (texto) | Cliente ou transportadora sem cadastro |
| `kanban_items` | `due_on` (data, sem hora) | Prazo; sem hora não há erro de um dia |
| `kanban_items` | `archived_at` | Exclusão reversível |
| `kanban_stages` | `done_stage` (booleano) | Coluna que conclui: card fica verde |
| `kanban_funnels` | `owner_id` (opcional) | Quadro pessoal; vazio é quadro da empresa |
| `kanban_funnels` | `archived_at` | Exclusão reversível |
| `kanban_funnels.settings` | `due_soon_days` (padrão 2) | Antecedência do "prazo próximo", sem coluna nova |

Índices: `(account_id, due_on)` para abertos e não arquivados, `owner_id`.

**Migração 3: auditoria do quadro**
Tabela `kanban_funnel_events` (quadro, usuário, tipo, dados), para criação, edição, exclusão e movimentação em massa de colunas.

Observações usam as notas do item, que já existem. Não entra campo novo.

Na produção: `pg_dump` antes, migrações reversíveis, sem reescrita de tabela.

## Decisões técnicas propostas

| Tema | Proposta | Motivo |
|---|---|---|
| Prazo | Status calculado na tela a partir de `due_on` e da data em `America/Sao_Paulo` | Sem rotina em segundo plano; muda sozinho à meia-noite |
| Conversa lateral | Painel com a própria tela de conversa do Chatwoot em iframe único, reaproveitado | Áudio, anexos, reações e permissões iguais, sem segundo mecanismo de envio. Medido: 3,0 s na primeira abertura local. |
| Produção do iframe | Trocar `X-Frame-Options: DENY` por `SAMEORIGIN` | Hoje o Traefik bloqueia; o site só poderá se embutir nele mesmo |
| "Criar card" | Botão inserido no painel do contato, na conversa e na ficha de contato | Mesmo padrão já usado em `reactions.js` |
| Atualizar sem recarregar | Evento entre abas com `BroadcastChannel` | Sem nova infraestrutura |
| Carga do quadro | Um endpoint com a primeira página de todas as colunas; colunas fora da tela sob demanda | Menos consultas em quadros grandes |
| Conversas | Mensagens só ao abrir o painel | Nada de mensagens no quadro |

## Ordem depois da aprovação
1. Migrações 1 a 3 no local, com testes de exclusão e reversão.
2. Design: apresentar a estrutura visual antes de aplicar.
3. Quadros e colunas: quadro pessoal, excluir com mover cards, SortableJS.
4. Cards: novos campos e cores de prazo.
5. Conversa lateral.
6. Criar card pela conversa e pelo contato.
7. Testes de criação, edição, movimentação, vínculos, prazos, permissões e desempenho.

As Fases 2 e 3 da especificação anterior (`KANBAN-ESPECIFICACAO.md`) continuam válidas para o que não foi citado aqui.

## Requisito adicional: produto para qualquer empresa
O Kanban não é específico de logística. Nenhum termo do ramo fica fixo na interface: cada quadro define como chama os itens, o cliente, o prazo e o concluído (`settings.labels`), com padrões neutros. Novos quadros partem de modelos (Geral, Vendas, Atendimento, Logística, Produção, Projetos, Em branco), todos editáveis.

## Situação
- Concluído no CRM local: migrações, quadros pessoais e da empresa, colunas no próprio quadro, excluir coluna movendo cards, arquivar e restaurar, SortableJS, prazo com cores automáticas.
- Concluído no CRM local: conversa lateral em iframe, vincular depois contato e conversa, respeito ao acesso às caixas de entrada.
- Concluído no CRM local: criar card pela ficha da conversa e pela página do contato, com observação inicial, vínculo opcional com a conversa e atualização do quadro aberto em outra aba.
- Teste final concluído no CRM local em 2026-11-08.
- Publicado em brunalogistica.tech em 2026-11-08 (versão `whatsapp-web-74`).

## Alertas e checklist no card (aprovado em 2026-11-08)

Aplicado e testado só no CRM local: migrações `20261109060000` e `20261109070000`, reversão conferida, 38 verificações de API aprovadas. A rotina `crm_reminders_job` roda de hora em hora e só gera alertas a partir das 8h de São Paulo, para incluir prazos criados durante o dia. Publicado em brunalogistica.tech em 2026-11-08 (`whatsapp-web-75`), junto com lista de contatos, lembretes, edição de listas, cards, calendário e fundos do chat. Backup: `/var/backups/crm-industrial/chatwoot-20261108-182147.dump.enc`. Para voltar: imagens `v4.19.1-pre-75` e `v4.19.1-sidekiq-pre-75`, arquivos em `/opt/crm-industrial/deploy/backup-pre-75`. Imagem atual: `v4.19.1` e `v4.19.1-kanban-75`.

Plano aprovado:

Já pronto no CRM local, sem alterar o banco: lista de contatos clean, lembretes em faixa, editar listas e demandas, cards fechados ou abertos, tempo na coluna, cor por prioridade, prazos de cards e atividades no calendário, gerar card ao criar atividade.

**Diagnóstico**
- Prazos já existem em `kanban_items.due_on`, `kanban_items.scheduled_at` e `work_activities.due_on`. Falta registrar quem já foi avisado, senão o mesmo alerta se repete.
- O Chatwoot só avisa por tipos próprios de notificação; acrescentar um tipo mexeria em um recurso nativo. Uma tabela própria evita isso.
- `checklist_items` pertence às listas de tarefas. Reaproveitar no card misturaria as duas coisas e distorceria os gráficos da tela de Tarefas.

**Migração 6: `crm_reminders`** (alertas enviados e lidos)

| Coluna | Uso |
|---|---|
| `account_id`, `user_id` | Conta e destinatário |
| `source_type`, `source_id` | Card ou atividade |
| `stage` | `day_before` ou `due_day` |
| `due_on` | Prazo avisado; se o prazo mudar, avisa de novo |
| `read_at` | Sino marca como lido |

Índice único em usuário, origem, etapa e prazo: o alerta não duplica. Apagar usuário, card ou atividade remove só os alertas deles.

**Migração 7: `kanban_item_checks`** (checklist do card)

| Coluna | Uso |
|---|---|
| `kanban_item_id` | Card; cascata ao apagar de vez |
| `title`, `position` | Texto e ordem |
| `done_at`, `done_by_id` | Quando e quem concluiu; apagar usuário limpa o autor |

Índice por card. O progresso vem de uma consulta agrupada por página, sem custo por card.

**Comportamento proposto:** rotina diária no Sidekiq às 08h de São Paulo avisa os agentes do card ou o responsável da atividade (na falta, quem criou), um dia antes e no dia. Aparece em um sino na barra lateral e como notificação do navegador se permitida. Card concluído, ganho, perdido ou arquivado e atividade concluída não avisam. Tudo aditivo e reversível; na produção, com `pg_dump` antes.

## Publicação (2026-11-08)

| Item | Onde |
|---|---|
| Backup do banco | `/var/backups/crm-industrial/chatwoot-20261108-161823.dump.enc`, com leitura conferida |
| Arquivos anteriores | `/opt/crm-industrial/deploy/backup-pre-kanban-74` (`dynamic.yml`, `routes.rb`, layout, `sidebar.js`) |
| Imagens anteriores | `crm-industrial-chatwoot:v4.19.1-pre-kanban` e `v4.19.1-sidekiq-pre-kanban` |
| Imagem atual | `crm-industrial-chatwoot:v4.19.1` e `v4.19.1-kanban-74` |
| Traefik | `frameDeny` trocado por `customFrameOptionsValue: SAMEORIGIN` |

Verificado sem sessão: site no ar, arquivos iguais aos testados, API exigindo login, entrada automática ativa no web e no Sidekiq, escrita nas tabelas em transação desfeita, nenhuma resposta 5xx após o reinício. Falta conferir com login real na tela.

## Teste final (CRM local, 2026-11-08)

| Área | Resultado |
|---|---|
| Criação, edição e notas | 21 verificações aprovadas, incluindo campos inválidos e campos internos recusados |
| Vínculos | 16 aprovadas: vincular depois, trocar, desvincular, sem duplicar contato, conversa única por quadro |
| Movimentação | 14 aprovadas: coluna, ordem, outro quadro, status, arquivar, remover coluna movendo cards |
| Permissões | 50 aprovadas: quadro pessoal, atribuídos, lista restrita, acesso à caixa, outra conta, nenhum token exposto |
| Integridade e entrada automática | 7 aprovadas: apagar conversa, contato ou agente mantém o card |
| Prazos | Todas as cores conferidas; virada às 00h de São Paulo atualiza o quadro aberto |
| Desempenho, 3.000 cards em 6 colunas | Quadro abre em 338 ms, 120 cards na tela, nenhuma requisição de mensagens; API de 15 a 40 ms em mediana |
| Segurança na tela | Título com código aparece como texto, sem executar |
| Arrastar | Mover, reordenar e reverter quando o servidor falha, com eventos simulados em passos |

Correções feitas durante o teste: agente sem acesso à caixa não desvincula mais a conversa do card; o quadro aberto passou a atualizar os prazos na virada do dia.

Não testado aqui: arraste com a mão no celular e no mouse real, envio real de mensagem pelo painel lateral, gravação de áudio no painel (o navegador de teste bloqueia o microfone), "Iniciar conversa" e sons de notificação duplicados.
- Na publicação: trocar `frameDeny` do Traefik por `SAMEORIGIN`, aumentar a versão dos arquivos no layout (o cache do navegador dura um ano) e rodar as migrações com backup.
