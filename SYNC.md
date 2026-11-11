# Sync CRM Bruna Logística

Branch: `sync-crm`  
Remote de publicação: `https://github.com/alexferreiraindustrial-hue/crm-industrial.git`

## Caminhos locais

| Papel | Caminho |
|-------|---------|
| Overlay CRM (Twenty + atendimento Bruna) | `C:\Users\anton\Projects\crm-industrial` |
| Fork Chatwoot (Captain, kanban, patches) | `C:\Users\anton\Projects\crm-industrial-chatwoot` |
| Worktree deste branch | `C:\Users\anton\Projects\crm-industrial-sync` |

## Remotes no checkout principal (`crm-industrial`)

- `origin` → `https://github.com/twentyhq/twenty.git` (upstream Twenty)
- `crm` → `https://github.com/alexferreiraindustrial-hue/crm-industrial.git` (repositório deste sync)

## Segredos

Arquivos reais `.env`, `.chatwoot.env`, `.waha.env`, `.conector.env`, `.google.env` e `sessions/` **não** entram no Git.  
Use os `*.env.example` em `atendimento/`.
