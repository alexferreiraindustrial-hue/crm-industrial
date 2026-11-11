# Como organizamos as melhorias do CRM Industrial

Chega informação de várias fontes: auditoria do ProsaHub, notas do MEGA, pedidos do dia a dia e problemas encontrados. Para não se perder, o trabalho segue quatro regras.

## 1. Um lugar só

Tudo entra em **`backlog.md`** com um código `MEL-###`. Se não tem código, não é feito.

- As fontes originais ficam em `fontes/` (notas do MEGA) e em `../auditoria-prosahub/` (ProsaHub).
- `atendimento/MELHORIAS-PENDENTES.md` guarda o histórico das levas 76 a 80 e não recebe itens novos.

## 2. Triagem antes de fazer

Toda novidade passa por quatro perguntas:

1. **Já temos?** Conferir no código e no site antes de construir. Exemplo: a automação por tempo já veio na base.
2. **Se aplica?** Algo que depende de WhatsApp Cloud, de cobrança SaaS ou de canal que não usamos vai para "não se aplica".
3. **Vale quanto e custa quanto?** Prioridade de A a D e esforço P, M ou G.
4. **Tem risco de mandar mensagem real ou mexer em dado?** Se tiver, entra depois e com trava.

Quando chegar uma nova nota do MEGA ou uma ideia, é só colar aqui na conversa. A triagem vai para `fontes/` e os itens para o backlog.

## 3. Levas pequenas

- Uma leva tem **até 6 itens** e vira **uma versão** (84, 85, 86...).
- Ciclo de cada leva: aprovação sua → branch própria → desenvolvimento no local → testes → sua conferência → publicação com backup e imagem de retorno → status "Publicado (versão)" no backlog.
- Só começa outra leva depois que a anterior foi publicada e conferida.
- Funcionalidades novas entram **desligadas** em Configurações → Recursos. Você liga quando quiser mostrar para a equipe.

## 4. Regras fixas

- **A interface do CRM Industrial continua a mesma.** Sem ícone novo na barra, sem redesenho e sem reorganizar menus. Funcionalidade nova entra dentro de uma tela existente, no visual dela (mapa em `navegacao.md`).
- Ideias do ProsaHub e do MEGA são bem-vindas, mas **não se copia código** do MEGA (do fornecedor) nem do módulo pago do Chatwoot. Fazemos nossa versão. Antes, conferimos se a ideia já existe no Chatwoot oficial, que é aberto.
- Produção nunca é alterada direto. A publicação segue o processo da versão 83: comparação em três vias, backup cifrado e imagem `pre-XX`.
- Nada de envio real de WhatsApp ou e-mail em teste sem sua autorização.
- Commit e push só com sua autorização.
