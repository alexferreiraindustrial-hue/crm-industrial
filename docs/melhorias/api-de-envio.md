# API de envio (MEL-110)

Permite que outro sistema (o ERP da ótica, um fluxo do n8n) mande uma mensagem de WhatsApp pelo CRM Industrial sem que ninguém precise abrir a conversa.

## Ligar

1. Configurações → Recursos → ligar **API de envio (ERP e n8n)**. Só o administrador vê e liga.
2. Na mesma janela, botão **Chaves da API** → dar um nome (ex.: "ERP da loja"), marcar as caixas de WhatsApp que a chave pode usar e o limite por minuto (padrão 30, máximo 60).
3. A chave completa aparece **uma única vez**. Copiar e guardar no sistema que vai usar. O CRM guarda só um resumo (HMAC) e os primeiros e últimos caracteres para reconhecer na lista.
4. Se a chave vazar ou o sistema sair de uso: **Revogar**. Ela para de funcionar na hora.

## Enviar

```
POST https://brunalogistica.tech/crm_api/v1/messages
Authorization: Bearer crmi_...
Idempotency-Key: pedido-12345
Content-Type: application/json

{ "inbox_id": 3, "phone": "5512991234567", "name": "Maria", "content": "Seu óculos está pronto para retirada." }
```

| Campo | Obrigatório | Observação |
|---|---|---|
| `phone` | sim | Com DDI e DDD. Sem DDI, número de 10 ou 11 dígitos ganha o 55. Aceita espaços, parênteses e traço |
| `content` | sim | Até 4096 caracteres |
| `inbox_id` | só se a chave tiver mais de uma caixa | O id aparece no exemplo da janela "Chaves da API" |
| `name` | não | Usado só quando o contato é novo |
| `Idempotency-Key` (cabeçalho) | recomendado | Número do pedido ou do evento. Repetido, devolve o primeiro resultado (`duplicate: true`) e não envia de novo. Se o primeiro tinha falhado, tenta outra vez |

Resposta `201`:

```json
{ "id": 18, "status": "sent", "duplicate": false, "inbox_id": 3, "contact_id": 120, "conversation_id": 845,
  "message_id": 9921, "created_contact": false, "created_conversation": false }
```

`GET /crm_api/v1/messages/18` com a mesma chave mostra a situação, inclusive `message_status` (`sent`, `delivered`, `read` ou `failed`, conforme o WAHA informa).

Erros: `401` chave inválida ou revogada; `403` recurso desligado ou caixa fora da chave; `422` telefone ou texto inválido (a mensagem vem em `error`); `429` passou do limite por minuto (esperar 60 s, cabeçalho `Retry-After`).

## O que o CRM faz

- Procura o contato pelo telefone, com e sem o nono dígito, e pelo identificador que o WAHA guarda. Se não achar, cria.
- Usa a conversa que ainda está aberta nessa caixa. Se não houver, abre uma nova. Caixa com "conversa única" usa sempre a mesma.
- Grava a mensagem como saída, sem nome de atendente. O WAHA entrega como entrega qualquer resposta. Para número novo, o WAHA confere antes se o número existe no WhatsApp.
- Não guarda o texto nem o telefone no histórico da API: só os números de contato, conversa e mensagem.

## Limite conhecido

Cliente que o WhatsApp só identifica por LID, sem telefone no cadastro, não é achado pelo número. Nesse caso o CRM cria um contato novo, e o aviso de saúde pode apontar contato duplicado por LID.

## No n8n

Nó **HTTP Request**: método POST, URL acima, autenticação "Header Auth" com nome `Authorization` e valor `Bearer crmi_...`, corpo JSON com os campos. Em "Headers", acrescentar `Idempotency-Key` com o id do item do fluxo.
