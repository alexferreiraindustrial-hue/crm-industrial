#!/bin/bash
set -eu
C=crm-industrial-waha-1
cd /tmp/bruna-login
docker cp "$C:/app/dist/apps/chatwoot/consumers/waha/message.reaction.js" /tmp/bruna-login/message.reaction.js
docker cp "$C:/app/dist/apps/chatwoot/consumers/inbox/message_created.js" /tmp/bruna-login/message_created.js
python3 - <<'PY'
from pathlib import Path

reaction = Path('/tmp/bruna-login/message.reaction.js')
text = reaction.read_text()
marker = 'CRM Industrial: reacao propria nao vira mensagem'
if marker not in text:
    extra = """
MessageReactionHandler.prototype.handle = async function (payload) {
    if (payload && payload.fromMe) {
        this.logger.info('CRM Industrial: reacao propria nao vira mensagem');
        return null;
    }
    return Object.getPrototypeOf(MessageReactionHandler.prototype).handle.call(this, payload);
};
"""
    needle = '//# sourceMappingURL=message.reaction.js.map'
    if needle not in text:
        raise SystemExit('reaction map marker missing')
    reaction.write_text(text.replace(needle, extra + needle, 1))

created = Path('/tmp/bruna-login/message_created.js')
src = created.read_text()
guard = 'CRM Industrial: aviso de reacao nao e enviado como mensagem'
if guard not in src:
    old = """            return;
        }
        if (message.content_type != 'text' &&"""
    new = """            return;
        }
        const reactionNotice = String(message.content || '').replace(/\\*/g, '');
        if (reactionNotice.indexOf('Reagiu com') !== -1 || reactionNotice.indexOf('Reação removida') !== -1) {
            this.logger.info('CRM Industrial: aviso de reacao nao e enviado como mensagem');
            return;
        }
        if (message.content_type != 'text' &&"""
    if old not in src:
        raise SystemExit('message_created anchor missing')
    created.write_text(src.replace(old, new, 1))
print('patched')
PY
docker cp /tmp/bruna-login/message.reaction.js "$C:/app/dist/apps/chatwoot/consumers/waha/message.reaction.js"
docker cp /tmp/bruna-login/message_created.js "$C:/app/dist/apps/chatwoot/consumers/inbox/message_created.js"
docker exec "$C" node --check /app/dist/apps/chatwoot/consumers/waha/message.reaction.js
docker exec "$C" node --check /app/dist/apps/chatwoot/consumers/inbox/message_created.js
docker restart "$C"
