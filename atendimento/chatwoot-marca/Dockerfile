# CRM Industrial: Chatwoot Community Edition (MIT, sem enterprise/) + marca CRM Industrial.
# Imagem base: Chatwoot CE oficial ou o nosso fork compilado (crm-industrial-chatwoot-base)
ARG CHATWOOT_BASE=chatwoot/chatwoot:v4.12.1-ce

# Etapa 1: gera os icones PNG a partir do SVG da marca
FROM alpine:3.20 AS icones
RUN apk add --no-cache rsvg-convert || apk add --no-cache librsvg
COPY branding/logo_thumbnail.svg branding/icon-badge.svg gerar-icones.sh /src/
RUN sh /src/gerar-icones.sh /out

# Etapa 2: Chatwoot CE + marca
FROM ${CHATWOOT_BASE}
COPY --from=icones /out/ /app/public/
COPY --from=icones /out/ /app/public/packs/
COPY branding/logo.svg branding/logo_dark.svg branding/logo_thumbnail.svg branding/logo.png branding/logo-mark.png /app/public/brand-assets/
COPY branding/icons/ /app/public/
COPY branding/icons/ /app/public/packs/
COPY branding/theme.css branding/theme-v3.css branding/whatsapp-web.css branding/kanban.css branding/kanban.js branding/connections.js branding/qrcode.js branding/sortable.min.js branding/sortable.LICENSE branding/reactions.js branding/sidebar.js branding/manifest.webmanifest branding/chat-background-light.jpg branding/chat-background-dark.jpg branding/chat-claro.jpg branding/chat-escuro.jpg branding/chat-bruna-claro.jpg branding/chat-bruna-escuro.jpg /app/public/crm-industrial/
COPY apply-branding.rb /tmp/apply-branding.rb
RUN ruby /tmp/apply-branding.rb && rm /tmp/apply-branding.rb
