# Melhorias pedidas em 2026-11-08

> A partir de 09/11/2026, os itens novos vão para `docs/melhorias/backlog.md`. Este arquivo guarda o histórico das levas 76 a 80.

Marque aqui o que for concluído. Tudo é aplicado primeiro no CRM local; publicar na VPS depende de aprovação.

| # | Pedido | Estado |
|---|---|---|
| 1 | Kanban: minimizar a coluna "Kanban / Quadro / Quadros", que rouba espaço | Publicado |
| 2 | Corrigir a escrita "Tarefas Cheqlist" para "Tarefas e Checklist" em todos os lugares | Publicado |
| 3 | Card parecido com o modelo enviado: título com prioridade e número, contato com foto, descrição e prazo, linha de checklist com progresso, agente, valor, atividades, tempo | Publicado |
| 4 | Checklist específico do serviço acessível a partir do próprio card | Publicado |
| 5 | Símbolo do WhatsApp no card quando houver conexão, abrindo a conversa, com contador de não lidas | Publicado |
| 6 | Calculadora como a do Windows, em janela flutuante que dá para arrastar, aberta por um ícone, usável durante a conversa | Publicado |
| 7 | Caixa de escrever do chat: poder aumentar a altura puxando | Publicado |
| 8 | Tarefas: editar e excluir à vista, tanto as listas quanto as demandas | Publicado |
| 9 | Número verde de pendências no ícone de Conversas, como já existe em Tarefas, sem precisar clicar antes | Publicado |
| 10 | Nome do remetente: uma vez só em grupo; nenhum nome em conversa individual recebida | Publicado; conferir em grupo real |
| 11 | Mensagem enviada: ícone de celular se saiu pelo telefone; bonequinho com nome discreto se saiu de alguém no CRM | Publicado; conferir com envio real |

Publicado em brunalogistica.tech em 2026-11-08 (`whatsapp-web-76`), sem migração. Backup: `/var/backups/crm-industrial/chatwoot-20261108-191900.dump.enc`. Para voltar: imagem `crm-industrial-chatwoot:v4.19.1-pre-76` e arquivos em `/opt/crm-industrial/deploy/backup-pre-76`. Imagem atual: `v4.19.1` e `v4.19.1-kanban-76`.

## Segunda leva

| # | Pedido | Estado |
|---|---|---|
| 12 | Mensagem privada com cor própria, diferente da mensagem normal; hoje fica verde, só com o cadeado | Publicado |
| 13 | Mensagem privada não pode sumir quando outra é adicionada; todas permanecem no chat | Publicado: cada nota mantém marca e autor; sumiço real não reproduzido, conferir na produção |
| 14 | Janela de emojis sempre visível, sem ficar escondida na tela | Publicado |
| 15 | Tela dividida: poder chegar a todos os grupos, movendo a faixa para o lado | Publicado |
| 16 | Grupos: ícone do participante no canto, como no WhatsApp, em vez do nome dentro da mensagem | Publicado; conferir em grupo real |
| 17 | Logo original e clean, diferente do exemplo enviado | Publicado |
| 18 | Logo nova na tela de login, com a identidade da tela acompanhando | Publicado |
| 19 | Logo nova como ícone da aba do navegador | Publicado |

Segunda leva publicada em brunalogistica.tech em 2026-11-08 (`whatsapp-web-77`), sem migração e sem mudança no backend. Backup: `/var/backups/crm-industrial/chatwoot-20261108-201024.dump.enc`. Para voltar: imagem `crm-industrial-chatwoot:v4.19.1-pre-77` e arquivos em `/opt/crm-industrial/deploy/backup-pre-77`. Imagem atual: `v4.19.1` e `v4.19.1-kanban-77`. A marca anterior está guardada em `chatwoot-marca/branding/marca-anterior`.

## Terceira leva

| # | Pedido | Estado |
|---|---|---|
| 20 | Campo de escrever centralizado e sem o texto de orientação | Publicado |
| 21 | Menus recolhidos ao abrir a página: Configurações não abre sozinho na barra | Publicado |
| 22 | Atividades no estilo da imagem enviada, nos dois temas | Publicado |
| 23 | Tarefas e Checklist no estilo da imagem enviada, mantendo a cor do sistema | Publicado |
| 24 | Ícone de administrador funcionando, para entrar e fazer verificações | Publicado; "Sair" não foi exercitado |
| 25 | Ícone do Kanban melhor | Publicado |
| 26 | Atualizar o repositório do GitHub como portfólio: projeto e ideia descritos, sem expor o código | Pull request aberto; falta o merge no `main` |
| 27 | Contato na lista de conversas com a cor da maior prioridade das atividades abertas | Publicado |
| 28 | Selo no contato quando ele tem card aberto | Publicado |
| 29 | Criar atividade e criar card pelo botão direito na conversa | Publicado |
| 30 | Atividades demorando para abrir: a barra recarregava o aplicativo inteiro | Publicado (`whatsapp-web-79`) |
| 31 | Rolagem da lista de Atividades travada por regra antiga de `overflow` | Publicado (`whatsapp-web-79`) |
| 32 | Concluir a atividade conclui e tira do quadro o card gerado dela; reabrir traz de volta | Pronto no local |
| 33 | Botão Pronto no card não vinculado | Pronto no local |
| 34 | Calendário mantém atividades e cards concluídos em verde, no dia em que aconteceram | Pronto no local |
| 35 | Caixa de emojis cortada pela borda do painel da conversa | Pronto no local |
| 36 | Anexar documentos e prints em atividades e tarefas, com clipe discreto e visualização limpa | Pronto no local |
| 37 | Conectar e-mail como ferramenta nativa (Gmail, Hostinger, Yahoo e outros por IMAP/SMTP) | Pronto no local; falta testar com conta real |
| 38 | Senha de e-mail: não volta ao navegador e senha recusada não é gravada | Pronto no local |
| 39 | Ligar criptografia no servidor antes de conectar e-mail real (`ACTIVE_RECORD_ENCRYPTION_*`) | Publicado |

Itens 32 a 39 publicados em 2026-11-09 (`whatsapp-web-80`), sem migração. Backup: `/var/backups/crm-industrial/chatwoot-20261109-005606.dump.enc`. Cópia cifrada das chaves: `/var/backups/crm-industrial/chaves-criptografia-20261109-005652.enc`. Para voltar: imagem `crm-industrial-chatwoot:v4.19.1-pre-80` e `/opt/crm-industrial/deploy/backup-pre-80`. Imagem atual: `v4.19.1` e `v4.19.1-kanban-80`.

Incidente da publicação: por cerca de 8 minutos, metade das páginas respondeu 504. O sidekiq recriado herdou as etiquetas do Traefik gravadas na imagem pelo `docker commit`. Correção: `traefik.enable=false` no sidekiq em `docker-compose.yml`.

Terceira leva publicada em brunalogistica.tech em 2026-11-08 (`whatsapp-web-78`), sem migração. Backup: `/var/backups/crm-industrial/chatwoot-20261108-211952.dump.enc`. Para voltar: imagem `crm-industrial-chatwoot:v4.19.1-pre-78` e arquivos em `/opt/crm-industrial/deploy/backup-pre-78`. Imagem atual: `v4.19.1` e `v4.19.1-kanban-78`. Portfólio: https://github.com/alexferreiraindustrial-hue/crm-industrial/pull/1.

Versão 79 publicada na sequência, sem migração e sem backend. Backup: `/var/backups/crm-industrial/chatwoot-20261108-213147.dump.enc`. Para voltar: imagem `crm-industrial-chatwoot:v4.19.1-pre-79` e arquivos em `/opt/crm-industrial/deploy/backup-pre-79`. Imagem atual: `v4.19.1` e `v4.19.1-kanban-79`.

## Incidente de 2026-11-08: WhatsApp sem chegar ao CRM

O `FORCE_SSL` do web redirecionava para `https` as chamadas internas do WAHA (`http://chatwoot:3009`), e a entrega falhava com `EPROTO`. Correção aplicada às 20:21 UTC em `config/environments/production.rb`: o host interno `chatwoot` fica fora do redirecionamento; o site público segue exigindo `https`. Para voltar: imagem `v4.19.1-pre-ssl` e `/opt/crm-industrial/deploy/backup-pre-ssl`. Imagem atual: `v4.19.1` e `v4.19.1-kanban-77-ssl`.

Fora da lista por enquanto: a linha "Sem produto" do modelo, porque o card não tem campo de produto. Criar esse campo precisa de migração e de sua decisão.
