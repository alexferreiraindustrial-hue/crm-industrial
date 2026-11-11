# Onde cada melhoria entra

**Regra principal (pedido do Alex, 09/11/2026): a interface do CRM Industrial continua igual.** Sem barra nova, sem redesenho, sem reorganizar menus. Só entram funcionalidades, e sempre dentro das telas que já existem, no visual que elas já têm.

## Barra lateral de hoje (não muda)

Computador: Tarefas e Checklist · Atividades · Conversas · Central de E-mail (só com caixa conectada) · Kanban · Calendário · Configurações (submenu) · Perfil.

Celular: Conversas · Checklist · Atividades · Mais.

## Encaixe de cada item

| Lugar que já existe | O que entra | Itens |
|---|---|---|
| Tarefas e Checklist | Filtros na lista e no calendário | MEL-030 |
| Atividades | — | — |
| Conversas | Botão de agendar no editor, leitura em massa, enviar cartão de contato; Salas da equipe como filtro na lista, quando chegar a vez | MEL-040, MEL-095, MEL-013, MEL-100 |
| Central de E-mail | Proteções de IMAP e SMTP (não aparecem na tela) e fases do e-mail | MEL-050, MEL-051, MEL-053 a MEL-058 |
| Kanban | Botão Relatórios no topo do quadro; aba de produtos no cartão; catálogo no gerenciamento do funil; contagem regressiva, atalhos e mensagem por etapa | MEL-070, MEL-020, MEL-021, MEL-022, MEL-023 |
| Calendário | Mensagens agendadas aparecem no dia, junto com tarefas e atividades | MEL-040, MEL-041 |
| Configurações → item novo **Recursos** (só administrador) | Ligar e desligar cada funcionalidade nova | MEL-001 |
| Configurações → Automações | Automação por tempo (já existe na base) | MEL-042, MEL-043 |
| Configurações → Conexões | Saúde do WhatsApp e das filas | MEL-014, MEL-090 |
| Configurações → Integrações | API de envio para ERP e n8n | MEL-110 |
| Configurações → Relatórios | Relatório de chamadas | MEL-072 |
| Menu do Perfil | Modo apresentação, novidades, notas pessoais; Assistente de IA quando chegar a vez | MEL-002, MEL-003, MEL-004, MEL-060 |
| Faixa de aviso no topo | Só aparece quando algo falha (WhatsApp caiu, fila parada) | MEL-014, MEL-090 |

## Como cada funcionalidade nova se comporta

1. Começa **desligada** em Configurações → Recursos. Desligada, não aparece em lugar nenhum.
2. Usa os componentes, cores, ícones e temas que a tela onde entra já tem.
3. Funciona no celular dentro do "Mais" ou da própria tela, sem botão novo na barra inferior.
4. Se algum item não couber em nenhuma tela existente, ele volta para discussão antes de qualquer código.
