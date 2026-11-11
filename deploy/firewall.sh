#!/bin/sh
# Libera so SSH, HTTP e HTTPS. Nao desliga a senha do SSH: isso so depois da chave entrar.
set -eu
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status verbose
