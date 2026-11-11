---
name: crm-industrial-ui
description: "Design system do CRM Industrial (atendimento Chatwoot). Use ao mudar botões, menu, chat, checklist, cartões ou tema. Preserva a identidade WhatsApp e não altera API nem regras de negócio."
---

# CRM Industrial UI

O produto no ar é o fork Chatwoot em `atendimento/chatwoot-marca/branding`. O visual entra por `theme-v3.css` depois de `theme.css`, e o menu por `sidebar.js`. Não há um design system em React separado. Não crie outro.

## Tokens

| Papel | Claro | Escuro |
|---|---|---|
| Página | `#F0F2F5` | `#0B141A` |
| Painel | `#FFFFFF` | `#111B21` |
| Faixa | `#F0F2F5` | `#202C33` |
| Chat | `#EFEAE2` | `#0B141A` |
| Enviada / recebida | `#D9FDD3` / `#FFFFFF` | `#005C4B` / `#202C33` |
| Ação | `#00A884` | `#00A884` |
| Texto / secundário | `#111B21` / `#667781` | `#E9EDEF` / `#8696A0` |
| Pendente | âmbar | âmbar |

Raio: balão 7,5 px, pílula 16 px, ícone circular. Fonte do chat: nome 16 px, prévia 14 px, balão 14,2 px.

## Botões

- Primário: verde `#00A884`, texto branco, pílula ou círculo de 40 px (Enviar).
- Ícone do chat: 36 px, fundo transparente, hover na faixa.
- Secundário (Resolver): pílula 32 px, sem fundo chapado.
- Concluir: pílula verde 28 px, uma ação por linha.
- Nota privada: a letra continua `#3B2A00` no fundo `#FFF3C4`.

## Etapas

1. Botões do chat.
2. Menu e submenu.
3. Checklist e indicadores.
4. Cartões, modais e formulários.
5. Listas e tabelas.

Cada etapa só mexe no CSS/JS de marca, sobe a versão `whatsapp-web-N` e confere no navegador. Não muda rota, API, login nem dados.
