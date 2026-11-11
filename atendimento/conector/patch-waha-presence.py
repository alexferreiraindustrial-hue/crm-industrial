import pathlib
import sys

controller = pathlib.Path(sys.argv[1])
created = pathlib.Path(sys.argv[2])

controller_text = controller.read_text(encoding="utf-8")
created_text = created.read_text(encoding="utf-8")

typing_anchor = """        if (!body || !(body === null || body === void 0 ? void 0 : body.event)) {
            return { success: true };
        }
        if (body.message_type == types_1.MessageType.INCOMING) {"""

typing_replacement = """        if (!body || !(body === null || body === void 0 ? void 0 : body.event)) {
            return { success: true };
        }
        if (body.event === types_1.EventName.CONVERSATION_TYPING_ON ||
            body.event === types_1.EventName.CONVERSATION_TYPING_OFF) {
            try {
                if (!body.is_private) {
                    const sender = body.conversation && body.conversation.meta && body.conversation.meta.sender;
                    const chatId = sender ? (0, ids_1.FindChatID)(sender) : null;
                    if (chatId) {
                        const whatsapp = await this.manager.getWorkingSession(session);
                        const request = { session: session, chatId: chatId };
                        if (body.event === types_1.EventName.CONVERSATION_TYPING_ON) {
                            await whatsapp.startTyping(request);
                        }
                        else {
                            await whatsapp.stopTyping(request);
                        }
                    }
                }
            }
            catch (err) {
                // A falha de presenca nao pode derrubar o webhook.
            }
            return { success: true };
        }
        if (body.message_type == types_1.MessageType.INCOMING) {"""

private_anchor = """            if (!deleted) {
                return { success: true };
            }"""

private_replacement = """            const crmReaction = body.content_attributes &&
                Object.prototype.hasOwnProperty.call(body.content_attributes, 'waha_reaction');
            if (!deleted && !crmReaction) {
                return { success: true };
            }"""

handle_anchor = """        const chatId = await (0, base_1.LookupAndCheckChatId)(this.session, body);
        const message = body;
        if (message.content_type != 'text' &&"""

handle_replacement = """        const chatId = await (0, base_1.LookupAndCheckChatId)(this.session, body);
        const message = body;
        const crmReaction = message.content_attributes &&
            Object.prototype.hasOwnProperty.call(message.content_attributes, 'waha_reaction');
        if (crmReaction) {
            const replyTo = await this.getReplyTo(message).catch((err) => {
                this.logger.warn(`CRM Industrial: reacao sem mensagem de origem: ${err}`);
                return undefined;
            });
            if (replyTo && this.session.api && this.session.api.client) {
                await this.session.api.client.put('/api/reaction', {
                    session: this.session.session,
                    messageId: replyTo,
                    reaction: message.content_attributes.waha_reaction || '',
                }).catch((err) => {
                    this.logger.warn(`CRM Industrial: falha ao reagir: ${err}`);
                });
            }
            return;
        }
        if (message.content_type != 'text' &&"""

def once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 occurrence, found {count}")
    return text.replace(old, new, 1)

controller_text = once(controller_text, typing_anchor, typing_replacement, "typing")
controller_text = once(controller_text, private_anchor, private_replacement, "private")
created_text = once(created_text, handle_anchor, handle_replacement, "reaction")

controller.write_text(controller_text, encoding="utf-8")
created.write_text(created_text, encoding="utf-8")
print("PATCH_OK")
