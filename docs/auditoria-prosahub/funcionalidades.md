# Funcionalidades do ProsaHub

Cada ficha segue os 14 pontos pedidos. Em "Adaptação", **Já tem** significa que o CRM Industrial já faz isso, **Parcial** que faz em parte e **Falta** que não existe. Complexidade: baixa (até 2 dias), média (3 a 7 dias), alta (mais de 1 semana).

Só entra aqui o que foi visto na tela. O que não abriu está em `inventario-geral.md`.

---

## 1. ProsaHub Assistant

1. **Nome:** ProsaHub Assistant, com um mascote flutuante.
2. **Finalidade:** perguntar sobre a própria conta em linguagem natural e pedir ações.
3. **Local:** ícone no menu (`/assistant`) e mascote em todas as telas (Alt+Shift+M esconde).
4. **Aparência:** tela de chat com histórico à esquerda (abas "Meus chats" e "Equipe", busca, "Novo chat") e saudação com nome no centro. Captura: `02-assistente-prosahub.png`.
5. **Ações:** Novo chat, Enviar, anexar arquivo, dispensar sugestão, ocultar mascote, redimensionar e arrastar.
6. **Campos:** "Pergunte ao ProsaHub Assistant…" e anexo.
7. **Filtros:** busca nos chats, Meus chats/Equipe.
8. **Fluxo:** escolher uma sugestão ("Resuma minhas conversas recentes", "Conversas que me aguardam", "Análise as respostas dos bots", "Revise a configuração das minhas caixas", "Revise a atividade das automações") ou digitar → resposta → ação proposta → confirmação.
9. **Comportamento visto:** o rodapé diz "Visível para você e os administradores da conta · Ações exigem sua confirmação". O contador de AI Actions fica no topo.
10. **Regras aparentes:** responde "sobre sua conta, caixas de entrada ou conversas às quais você tem acesso" (respeita permissão); cada uso consome AI Actions; ações só depois de confirmar; chats visíveis a administradores.
11. **Dependências:** modelo de IA ("GPT-6 Luna" padrão), recursos `mega_ai_assistant` e `mega_ai_assistant_actions` e cobrança por uso.
12. **Benefício:** o gestor consulta o atendimento sem abrir relatórios.
13. **Adaptação:** Falta. O CRM já tem a chave OpenAI nas contas 2 e 3 e as ações do editor (resumir, reescrever, sugerir).
14. **Complexidade:** alta. Exige consultas seguras por permissão, registro de custo e confirmação de cada ação.

## 2. Kanban: Etapas, Ofertas e Funis

1. **Nome:** Kanban, com submenus Etapas, Ofertas e Gerenciar Funis.
2. **Finalidade:** funil de negócios ligado às conversas.
3. **Local:** `/kanban`, `/kanban?view=offers`, `/kanban?view=funnels`.
4. **Aparência:** colunas coloridas com contador e cartões de foto, título, contato, etiquetas, prioridade, produto e atividades. Capturas: `03`, `08`, `09`, `10`.
5. **Ações no quadro:** troca de funil ("ERP-Kanban 52"), Status, Colapsar, Abrir conversa, Gerenciar etiquetas, Adicionar Item e Carregar mais.
6. **Formulário "Adicionar Item":** Funil, Estágio Atual, Prioridade, Etiquetas, Título, Descrição (até 5000, com formatação), Data e Hora do Agendamento e Agente Atribuído.
7. **Filtros:** "Pesquisar por um item...", Status e funil.
8. **Fluxo do cartão:** clicar abre `?item=ID` com cabeçalho (status Aberto, prioridade) e os botões **Mudar Status**, **Mover Funil** e **Mensagem Rápida**. A coluna esquerda tem Editar Item, Métricas, Notas, Conversa, Perfil e Campos adicionais. As abas são **Info do Negócio** (número, Valor Total, Data de Criação, **Progresso do Funil** em linha do tempo), Notas, **Checklist** ("Mais recentes", "Ocultar concluídos"), **Anexos**, **Histórico** (busca), **Ofertas** ("Adicionar do catálogo") e Mensagem Agendada.
9. **Comportamento:** tour guiado de 9 passos na primeira visita ("Bem-vindo(a) ao Kanban!").
10. **Regras aparentes:** o cartão pode ficar "Sem contato" e ser vinculado ou desvinculado de uma conversa; o Valor Total aparece ao lado das ofertas, então provavelmente é a soma delas (não confirmado); o status visto foi "Aberto", e as outras opções de "Mudar Status" não foram abertas.
11. **Dependências:** conversas, contatos, etiquetas, agentes e o catálogo de ofertas.
12. **Benefício:** o pedido acompanha o atendimento sem sair do CRM.
13. **Adaptação:** **Parcial**. O CRM Industrial já tem funis, etapas, valor, prioridade, data agendada, etiquetas, agentes, notas, checklist, anexos, histórico e modelos de funil. **Falta o catálogo de Ofertas/Produtos ligado ao cartão**, a linha "Progresso do Funil", Mover Funil e Mensagem Rápida a partir do cartão (estes dois a confirmar no código).
14. **Complexidade:** média para Ofertas e baixa para o resto.

## 3. Modelos de funil

- **Local:** Gerenciar Funis → Modelos. **Visto:** Funil de Vendas, Suporte, Recrutamento e Delivery.
- **Adaptação:** **Já tem** (`kanban.js`, `draftFromTemplate`). Para a indústria valeria acrescentar modelos próprios: Pedido de produção, Assistência técnica, Compras e Orçamento.

## 4. Relatórios Kanban

1. **Nome:** Relatórios Kanban.
2. **Finalidade:** medir o funil.
3. **Local:** Relatórios → Kanban (`/reports/kanban`).
4. **Aparência:** cartões de número, barras de distribuição e três abas. Captura: `04-relatorios-kanban.png`.
5. **Ações:** **Baixar Relatório**, período ("Últimos 7 dias"), agentes, funil.
6. **Indicadores:** Itens Totais, Valor Total, Valor Médio, Contatos; Estatísticas Rápidas (checklist completo, com conversa, com prazo); Distribuição por Etapa e por Prioridade; Métricas de Checklist (tarefas, concluídas, taxa); Métricas de Atividade (total, média por item, com conversa); Faixas de Oferta (até R$ 1.000, R$ 1.000–5.000, acima de R$ 5.000).
7. **Aba Produtividade:** Desempenho de Vendas e Análise de Ciclo.
8. **Aba Vendas:** Vendas por Canal, Eficiência do Funil, Principais Produtos/Serviços, Vendas por Região e **Meta Mensal** por funil.
9. **Comportamento:** sem dados, mostra "Nenhuma meta definida para este funil".
10. **Regras:** filtra por período, agente e funil; a meta é por funil e mês.
11. **Dependências:** valor, etapa, prioridade, checklist, atividades, ofertas e meta.
12. **Benefício:** gestor vê gargalo e produção sem planilha.
13. **Adaptação:** **Falta**. Os dados já existem nas tabelas `kanban_items`, `kanban_item_events`, `kanban_item_checks` e `work_activities`.
14. **Complexidade:** média. Só lê dados, então o risco é baixo.

## 5. Mensagens agendadas

1. **Nome:** Mensagens agendadas.
2. **Finalidade:** programar envio de mensagem a contatos.
3. **Local:** menu (`/scheduled-messages`) e aba "Mensagem Agendada" no cartão.
4. **Aparência:** calendário mensal com o dia de hoje destacado, alternando para lista. Captura: `05-mensagens-agendadas.png`.
5. **Ações:** Filtros, Visualização lista, Atualizar, Agendar mensagem e navegação por mês.
6. **Formulário:** Título, **Contatos** (vários), Caixa de entrada, Data e hora, **Repetir** ("Não repetir" e opções), Mensagem e Anexar arquivo.
7. **Busca:** "Buscar por título, contato ou telefone".
8. **Fluxo:** Agendar → preencher → Agendar → aparece no calendário → envio na hora marcada.
9. **Comportamento:** não houve envio, porque não agendei nada.
10. **Regras aparentes:** recorrência, envio por caixa escolhida e vários contatos.
11. **Dependências:** fila de tarefas, canal de envio e contatos.
12. **Benefício:** lembrete de retirada, cobrança, retorno de orçamento e aviso de produção.
13. **Adaptação:** **Falta**. O Kanban tem `scheduled_at`, que é data do item, mas não dispara mensagem.
14. **Complexidade:** média. Envia mensagem real, então precisa de trava e teste em caixa de teste.

## 6. Salas de chat (comunicação interna)

1. **Nome:** Salas de Chat.
2. **Finalidade:** conversa interna da equipe, fora do WhatsApp do cliente.
3. **Local:** `/chat_rooms`, ícone no menu e na barra do celular.
4. **Aparência:** lista com CANAIS (ex.: "Informativos") e MENSAGENS DIRETAS.
5. **Ações:** Criar, buscar e entrar.
6. **Campos:** "Buscar salas e mensagens".
7. **Configuração:** Configurações → Salas de chat (nova sala, membros, editar).
8. **Fluxo:** criar sala → escolher membros → conversar. O recurso `chat_room_calls` indica que também há chamadas.
9. **Comportamento:** só a lista foi vista; não abri sala para não ler mensagens internas.
10. **Regras:** salas com membros; mensagens diretas entre usuários.
11. **Dependências:** tempo real (ActionCable) e usuários.
12. **Benefício:** produção, vendas e laboratório falam sem misturar com o cliente.
13. **Adaptação:** **Falta**.
14. **Complexidade:** alta (tempo real, notificações, permissões, anexos).

## 7. Calculadora WhatsApp API

- **Finalidade:** estimar o custo mensal da API oficial do WhatsApp.
- **Campos:** Mensagens por atendimento, Atendimentos por dia, Números conectados, sábados/domingos/feriados, "Inicia com template", dia em que a franquia acaba, tarifas por categoria (Serviço, Utilidade, Autenticação, Marketing) com padrões editáveis e "Restaurar tarifas padrão".
- **Ações:** Dados reais, Configurar tarifas, Imprimir e calendário do mês.
- **Adaptação:** **Falta**, mas o CRM usa WAHA (WhatsApp Web) e não paga por mensagem. Só tem utilidade se for migrar para a API oficial. O CRM já tem uma calculadora comum no Kanban.
- **Complexidade:** baixa.

## 8. Minhas notas

- **Finalidade:** bloco de anotações pessoal.
- **Campo:** "Escreva aqui. Fica salvo só neste navegador." e botão "Copiar tudo".
- **Regra:** salvo só no navegador; não sincroniza entre aparelhos.
- **Adaptação:** **Falta**, mas o CRM já tem notas nos cartões e nas atividades. **Complexidade:** baixa.

## 9. Modo apresentação

- **Visto:** alternador no menu com o nome "Modo apresentação".
- **Não confirmado:** o que muda ao ligar, porque não acionei. Pelo nome, deve esconder dados de clientes para mostrar a tela a terceiros.
- **Adaptação:** **Falta**. **Complexidade:** baixa (CSS que borra nomes, telefones e mensagens).

## 10. Anúncios

- Ícone de novidades no topo do menu. Não abri, porque abrir pode marcar como lido.
- **Adaptação:** C. Serve para avisar a equipe sobre mudanças no CRM.

## 11. Google Maps Scraper

- **Local:** Campanhas → Google Maps Scraper. Captura: `01-google-maps-scraper.png`.
- **Campos:** "O que você procura?", "Onde? Bairro, cidade...", Quantidade (20/40/120/200+), Raio em km no mapa, Idioma, **Buscar e-mails** (visita o site de cada empresa) e Limite de tempo.
- **Comportamento:** selo "scraper online", histórico "Suas buscas" e o aviso "Uma busca por vez evita bloqueio temporário do Google".
- **Adaptação:** **Não recomendado**. Extrair dados do Google Maps vai contra os termos do Google, e captar e-mails para contato sem consentimento cria risco pela LGPD.

## 12. Construtor de Modelos Meta

- **Local:** Campanhas → Modelos Meta e Configurações → Modelos Meta. Captura: `06`.
- **Campos:** categoria (Marketing, Utilidade, Autenticação), caixa WhatsApp, nome e idioma, conteúdo com negrito/itálico/variáveis/botões, parâmetro posicional ou nomeado, pré-visualização e "Sincronizar modelos".
- **Adaptação:** C, porque só serve com a API oficial (Cloud). O CRM usa WAHA.

## 13. Configurações do Capitão (modelo por recurso)

- Escolha do modelo de IA para Recursos do Editor, Assistente, Copiloto, Transcrição de Áudio e Busca na Central de Ajuda. Captura: `07`.
- **Adaptação:** Parcial, porque o CRM tem a tela, mas o servidor do Capitão é do módulo pago. Classificação C.

## 14. Painel da conversa

- O cabeçalho tem etiquetas rápidas ("Colocar a etiqueta aguardando", "Tirar a etiqueta em-produção"), Agente, Participantes, Resolver, Reação, Mais ações e Contatos.
- **Copiloto** aparece no painel lateral (Enterprise).
- **Adaptação:** **Já tem**: etiquetas, reações, participantes e cartão do Kanban. O Copiloto é do módulo pago.

## 15. Relatório de Chamadas e de Robôs

- **Chamadas:** filtros por caixa, agente, status e direção, com busca por nome ou telefone.
- **Robôs:** número de conversas, respostas, tempo de resolução e taxa de entrega.
- **Adaptação:** o CRM tem AstraCalls com registro de ligações (`crm_calls`). Falta a tela de relatório de chamadas (B). O relatório de robôs já existe no Chatwoot Community (`BotReports.vue`).

## 16. Recursos do módulo pago do Chatwoot vistos no ProsaHub

SLA, Funções Personalizadas, Auditoria, Atribuição por capacidade e assistentes do Capitão (FAQ, documentos, cenários, playground, ferramentas, MCP).

**Adaptação:** não copiar. Esse código tem licença própria do Chatwoot. Se fizer falta, o caminho é construir versão própria e simples (por exemplo, auditoria das ações do CRM) ou contratar a licença.
