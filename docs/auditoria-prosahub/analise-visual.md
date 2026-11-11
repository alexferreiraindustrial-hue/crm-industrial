# Análise visual

## ProsaHub

- **Tema escuro padrão**, fundo quase preto, verde como cor de ação (botões "Agendar mensagem", "Novo Funil", "Baixar Relatório").
- **Menu de ícones estreito à esquerda**, com cerca de 17 ícones empilhados, e menu secundário em coluna ao lado. São ícones demais no mesmo nível: Anúncios, Assistente, Aplicativos, Conversas, Salas, Kanban, Capitão, Contatos, Relatórios, Campanhas, Agendadas, Central de Ajuda, Notas, Calculadora, Apresentação, Tema e Configurações. Foi isso que deixou a barra poluída.
- **Mascote flutuante** no canto inferior direito, em todas as telas, que dá para arrastar e redimensionar.
- **Tour guiado** sobre o Kanban na primeira visita, com escurecimento e balão de 9 passos.
- **Cartão do Kanban** com foto, título, contato, etiquetas coloridas, prioridade, produto e atividades.
- **Detalhe do cartão** em página cheia, com coluna de perfil à esquerda, abas no topo e cartões de número (Valor Total, Data de Criação) com borda colorida.
- **Relatórios** com cartões de número no topo e barras horizontais por etapa e prioridade.
- **No celular:** barra inferior com Chats, Salas, Kanban, Contatos e Mais.

## CRM Industrial (padrão a manter)

- Tema claro no tom do WhatsApp e escuro opcional, com ícones no estilo WhatsApp (definido nesta sessão, versão 83).
- Barra lateral própria em `sidebar.js`, com dock no celular e alvos de toque de 44px.
- Kanban próprio em `kanban.js` e `kanban.css`.

## Lição para o CRM Industrial

1. **A barra do CRM Industrial não muda** (decisão do Alex em 09/11/2026). Funcionalidade nova entra dentro de uma tela que já existe.
2. Ferramentas ocasionais (modo apresentação, notas, novidades) vão para o menu do Perfil, não para a barra.
3. Mascote fixo cobre conteúdo no celular. Se houver assistente, deve abrir só pelo menu ou por atalho.
4. Tour só quando o módulo for ligado pela primeira vez, e com "Pular" visível.
