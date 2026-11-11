# Kanban do CRM da Bruna: especificação

Levantado em 2026-11-08 observando o Kanban do ProsaHub (`app.prosahub.com.br`), só leitura.
O ProsaHub roda sobre a plataforma Mega, de código fechado. Aqui o Kanban é reescrito a partir do comportamento observado, sem copiar código.

## Navegação
- Área própria na barra lateral, com Etapas (quadro), Ofertas e Gerenciar Funis.
- Topo do quadro: visão Kanban ou Lista, seletor de funil com contagem, busca por item, filtro de Status (Mostrar todos, Aberto, Ganho, Perdido), Filtros, menu com Configurar Funil e Ofertas.

## Quadro
- Colunas com cor, nome, avatares dos agentes, total em valor e contagem ("N Itens"), rolagem própria, "Carregar mais", "Adicionar Item", largura ajustável arrastando a borda.
- Menu da coluna: Editar Etapa, Ocultar etapa, Ordenar, Colapsar todos, Relatório da Etapa, Expandir etapa.
- Arrastar cartão entre colunas e dentro da coluna. Sem arrastar no celular: usa "Mover negócio".

## Cartão
- Título, prioridade em barras, número (#), colapsar, menu.
- Contato com foto, descrição, progresso do checklist (0/N), agente, valor, produto, atividades, tempo na etapa.
- Botões: abrir conversa (com contador de não lidas), ações (+) e gerenciar etiquetas.
- Ações: Mover negócio (funil/etapa), Mensagem Rápida, Ganhar, Perder, Eliminar.

## Novo item
Funil, etapa, prioridade, etiquetas, título, descrição (5000), data e hora do agendamento, agentes.

## Detalhe do item (`?item=ID`)
- Cabeçalho: título, status, prioridade, atualizado em, Mudar Status (Em aberto, Ganho, Perdido), Mover Funil, Mensagem Rápida.
- Coluna esquerda: contato e telefone, agentes atribuídos, Editar Item, Métricas (valor, total de propostas, tempo na etapa, antiguidade, mudanças de etapa), Notas, Conversa, Perfil, Campos adicionais.
- Abas: Info do Negócio (número, valor total, criação, linha do progresso no funil com tempo por etapa), Notas, Checklist (ordenar, ocultar concluídos), Anexos (nome, descrição, tamanho, data, ações), Histórico (com busca), Ofertas (total, adicionar do catálogo), Mensagens Agendadas, Relacionamentos (conversas e outros itens vinculados).

## Filtros
Rápidos (Hoje, Esta semana Seg-Dom, Últimos 7 dias, Último mês, Este ano), filtros salvos, Prioridade, Status, Etiquetas, Agente, Canal/Inbox, Valor, Filtros avançados. Botões Limpar, Cancelar e Aplicar.

## Ofertas
Catálogo com tipo, nome, valor, data e número. Botão Nova Oferta.

## Funis
- Lista com etapas coloridas, Modelos, Novo Funil, Definir como padrão, Editar, Duplicar, Excluir.
- Edição: nome, descrição, Status Ativo, Mensagem Rápida, etapas ordenáveis (criar, copiar ID, editar, remover), caixas de entrada, agentes, visibilidade (todos ou só atribuídos).
- Etapa: nome, cor, descrição, Etapa de Entrada (conversa nova entra no funil), presets de checklist (com Obrigatório), automações, modelos de mensagem, condições de auto criação.

### Automações por etapa
- Quando: ao entrar, ao sair, depois de certo tempo.
- Então: mover para outra etapa, atribuir agente, criar nota, notificar equipe, enviar mensagem.

### Condições de auto criação
Contato tem tag, atributo customizado, mensagem contém, prioridade da conversa, inbox específico, mensagem privada contém, mensagem por automação contém, quantidade de mensagens, idade da última mensagem, mensagem não lida, conversa sem agente, conversa reaberta, conversa adiada.

### Configuração avançada do funil
- Card: mensagens não lidas; campos visíveis (Descrição, Etiquetas, Prioridade, Valor e Produto, Prazo, Conversa, Checklist, Agente, Metadados), restaurar padrão.
- Tempo: máximo por etapa (minutos, horas, dias), cor no cartão (< 50%, 50-90%, ≥ 90%), reaviso de prazo do checklist.
- Webhook do funil: URL e eventos de item, estágio, ordenação, agente, nota, checklist, timer e status.
- Campos: Texto, Número, Data, Verdadeiro/Falso, Único, Lista.
- Metas: Taxa de Conversão, Valor Médio, Tempo Médio, Total de Conversões, Receita Total.
- Motivos de ganho e de perda.
- Rótulos singular e plural das colunas.
- Painel do contato: mostrar itens abertos de todas as conversas do contato.

## Fora do escopo
Assistente/mascote do ProsaHub e a integração com o ERP da ótica ("Status ERP" é texto vindo dele).

## Ainda por ler no ProsaHub
Conteúdo de Filtros avançados, Relatório da Etapa, Modelos de funil, formulário de Nova Oferta e colunas da visão Lista.

## Fases
0. Base: trazer para o fork o que só existe no container de produção e deixar o CRM local igual à produção.
1. Núcleo: funis, etapas, quadro, arrastar, cartão, novo item, edição, ganho/perdido, etiquetas, agentes, conversa, detalhe com Info, Notas, Histórico e Métricas, Lista, busca, etapa de entrada.
2. Gestão: checklist e presets, anexos, filtros, ofertas, campos, motivos, metas, rótulos, campos do cartão, tempo por etapa, relatório.
3. Automação: automações, auto criação, modelos, Mensagem Rápida, mensagens agendadas, timer, webhooks, notificações, tempo real, modelos de funil, duplicar, relacionamentos, painel do contato.
