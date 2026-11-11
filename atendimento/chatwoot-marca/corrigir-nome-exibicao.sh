#!/bin/bash
set -eu
WEB=crm-industrial-chatwoot-1
JOB=crm-industrial-chatwoot-sidekiq-1
WAHA=crm-industrial-waha-1
cd /tmp/bruna-login

docker cp "$WEB:/app/app/models/user.rb" /tmp/bruna-login/user.rb
python3 - <<'PY'
from pathlib import Path
path = Path('/tmp/bruna-login/user.rb')
text = path.read_text()
needle = "      display_name: available_name,\n"
if needle not in text:
    old = "      name: name,\n      email: email,\n"
    new = "      name: name,\n      display_name: available_name,\n      email: email,\n"
    if old not in text:
        raise SystemExit('user webhook_data anchor missing')
    text = text.replace(old, new, 1)
    path.write_text(text)
print('user')
PY
docker cp /tmp/bruna-login/user.rb "$WEB:/app/app/models/user.rb"
docker cp /tmp/bruna-login/user.rb "$JOB:/app/app/models/user.rb"

docker cp "$WAHA:/app/dist/apps/chatwoot/consumers/inbox/message_created.js" /tmp/bruna-login/message_created.js
python3 - <<'PY'
from pathlib import Path
path = Path('/tmp/bruna-login/message_created.js')
text = path.read_text()
marker = "String.fromCharCode(10)"
if marker not in text:
    old = "        content = (0, markdown_1.MarkdownToWhatsApp)(content);\n"
    new = """        content = (0, markdown_1.MarkdownToWhatsApp)(content);
        if (typeof content === 'string' && content.trim()) {
            const sender = message.sender || {};
            const displayName = String(sender.display_name || '').trim();
            const prefix = displayName + ':' + String.fromCharCode(10);
            if (displayName && content.indexOf(prefix) !== 0) {
                content = prefix + content;
            }
        }
"""
    if old not in text:
        raise SystemExit('message_created anchor missing')
    text = text.replace(old, new, 1)
    path.write_text(text)
print('waha')
PY
docker cp /tmp/bruna-login/message_created.js "$WAHA:/app/dist/apps/chatwoot/consumers/inbox/message_created.js"
docker exec "$WAHA" node --check /app/dist/apps/chatwoot/consumers/inbox/message_created.js
docker restart "$WEB" "$JOB" "$WAHA"
