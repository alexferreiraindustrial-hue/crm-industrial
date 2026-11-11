# CRM Industrial: imagem oficial do Twenty + marca (tema, logo, nome, textos pt-BR).
# Solucao provisoria ate o fork ser compilado do codigo-fonte (ver ai-vault, T-002/T-003).
ARG TAG=latest
FROM twentycrm/twenty:${TAG}

USER root
COPY branding/ /app/packages/twenty-server/dist/front/crm-industrial/
COPY apply-branding.mjs /tmp/apply-branding.mjs
RUN node /tmp/apply-branding.mjs && rm /tmp/apply-branding.mjs \
  && chown -R node:node /app/packages/twenty-server/dist/front
USER node
