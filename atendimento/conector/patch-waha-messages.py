from pathlib import Path

ROOT = Path("/tmp/crm-waha-patch")


def replace_once(path, old, new):
    file = ROOT / path
    text = file.read_text()
    found = text.count(old)
    if found != 1:
        raise SystemExit(f"{path}: expected 1 occurrence, found {found}")
    file.write_text(text.replace(old, new, 1))
    print(f"patched {path}")


replace_once(
    "message.any.js",
    """        const protoMessage = (0, chatwoot_1.resolveProtoMessage)(payload._data);
        converter = new chatwoot_1.FacebookAdMessage(this.l, this.logger);""",
    """        const protoMessage = (0, chatwoot_1.resolveProtoMessage)(payload._data);
        const special = crmIndustrialBeforeConverters(payload);
        if (special) {
            return special;
        }
        converter = new chatwoot_1.FacebookAdMessage(this.l, this.logger);""",
)

replace_once(
    "message.any.js",
    """        converter = new chatwoot_1.TextMessage(this.l, this.logger, this.waha, this.job);
        msg = await converter.convert(payload, null);
        if (msg) {
            return msg;
        }
        converter = new chatwoot_1.LocationMessage(this.l);""",
    """        converter = new chatwoot_1.LocationMessage(this.l);""",
)

replace_once(
    "message.any.js",
    """        converter = new chatwoot_1.AlbumMessage(this.l);
        msg = await converter.convert(payload, protoMessage);
        if (msg) {
            return msg;
        }
        converter = new HasMediaWithNoMediaMessage_1.HasMediaWithNoMediaMessage(this.l, this.job);""",
    """        converter = new chatwoot_1.AlbumMessage(this.l);
        msg = await converter.convert(payload, protoMessage);
        if (msg) {
            return msg;
        }
        converter = new chatwoot_1.TextMessage(this.l, this.logger, this.waha, this.job);
        msg = await converter.convert(payload, null);
        if (msg) {
            return msg;
        }
        const fallback = crmIndustrialFallback(protoMessage);
        if (fallback) {
            return fallback;
        }
        converter = new HasMediaWithNoMediaMessage_1.HasMediaWithNoMediaMessage(this.l, this.job);""",
)

message = (ROOT / "message.any.js").read_text()
helper = r"""
function crmIndustrialBeforeConverters(payload) {
    if (payload && payload.pollVote) {
        const vote = payload.pollVote.vote || {};
        const options = Array.isArray(vote.selectedOptions) ? vote.selectedOptions : [];
        const names = options.map(function (option) {
            if (typeof option === 'string') {
                return option;
            }
            if (option && typeof option === 'object') {
                return option.name || option.optionName || '';
            }
            return '';
        }).map(function (name) {
            return String(name || '').trim();
        }).filter(function (name) {
            return name && name.length <= 80;
        });
        const choice = names.length ? names.join(', ') : 'voto registrado';
        return {
            content: '📊 **Voto na enquete**\n' + choice,
            attachments: [],
            private: undefined,
        };
    }
    if (payload && payload.eventResponse) {
        const response = payload.eventResponse.response;
        const labels = {
            GOING: 'Vou',
            NOT_GOING: 'Não vou',
            MAYBE: 'Talvez',
            UNKNOWN: 'Respondeu',
        };
        const label = labels[response] || 'Respondeu';
        const guests = Number(payload.eventResponse.extraGuestCount) || 0;
        const extra = guests > 0 ? '\nAcompanhantes: ' + guests : '';
        return {
            content: '📅 **Resposta do evento**\n' + label + extra,
            attachments: [],
            private: undefined,
        };
    }
    return null;
}
function crmIndustrialFallback(protoMessage) {
    const skip = {
        messageContextInfo: true,
        senderKeyDistributionMessage: true,
        protocolMessage: true,
    };
    const labels = {
        interactiveMessage: 'Mensagem com botões',
        buttonsMessage: 'Mensagem com botões',
        templateMessage: 'Mensagem com botões',
        viewOnceMessage: 'Mídia de visualização única',
        viewOnceMessageV2: 'Mídia de visualização única',
        productMessage: 'Produto do catálogo',
        orderMessage: 'Pedido',
        groupInviteMessage: 'Convite de grupo',
        liveLocationMessage: 'Localização em tempo real',
        contactMessage: 'Contato compartilhado',
        contactsArrayMessage: 'Contatos compartilhados',
        pollUpdateMessage: 'Voto na enquete',
        pinInChatMessage: 'Mensagem fixada',
        keepInChatMessage: 'Mensagem mantida',
        documentWithCaptionMessage: 'Documento',
        lottieStickerMessage: 'Figurinha animada',
        requestPhoneNumberMessage: 'Pedido do número',
        encReactionMessage: 'Reação',
        stickerMessage: 'Figurinha',
        ptvMessage: 'Recado de vídeo',
    };
    if (!protoMessage || typeof protoMessage !== 'object') {
        return null;
    }
    const key = Object.keys(protoMessage).find(function (name) {
        return !skip[name] && protoMessage[name];
    });
    if (!key || !labels[key]) {
        return null;
    }
    return {
        content: '**' + labels[key] + '**',
        attachments: [],
        private: undefined,
    };
}
"""
marker = "//# sourceMappingURL=message.any.js.map"
if marker not in message:
    raise SystemExit("message.any.js source map marker missing")
if "crmIndustrialBeforeConverters" not in message.split(marker)[0]:
    raise SystemExit("helper call missing before insertion")
if message.count(marker) != 1:
    raise SystemExit("unexpected source map markers")
(ROOT / "message.any.js").write_text(message.replace(marker, helper + marker, 1))
print("patched message.any.js helpers")

replace_once(
    "base.js",
    """        enums_dto_1.WAHAEvents.CALL_REJECTED,
    ];""",
    """        enums_dto_1.WAHAEvents.CALL_REJECTED,
        enums_dto_1.WAHAEvents.POLL_VOTE,
        enums_dto_1.WAHAEvents.POLL_VOTE_FAILED,
        enums_dto_1.WAHAEvents.EVENT_RESPONSE,
        enums_dto_1.WAHAEvents.EVENT_RESPONSE_FAILED,
    ];""",
)

replace_once(
    "ChatWootWAHAQueueService.js",
    """            case enums_dto_1.WAHAEvents.CALL_REJECTED:
                return this.queueRegistry.queue(QueueName_1.QueueName.WAHA_CALL_REJECTED);
            default:""",
    """            case enums_dto_1.WAHAEvents.CALL_REJECTED:
                return this.queueRegistry.queue(QueueName_1.QueueName.WAHA_CALL_REJECTED);
            case enums_dto_1.WAHAEvents.POLL_VOTE:
            case enums_dto_1.WAHAEvents.POLL_VOTE_FAILED:
            case enums_dto_1.WAHAEvents.EVENT_RESPONSE:
            case enums_dto_1.WAHAEvents.EVENT_RESPONSE_FAILED:
                return this.queueRegistry.queue(QueueName_1.QueueName.WAHA_MESSAGE_ANY);
            default:""",
)

replace_once(
    "ChatWootWAHAQueueService.js",
    """    async addJobToQueue(event, data, appId) {
        const queue = this.getQueueForEvent(event);""",
    """    async addJobToQueue(event, data, appId) {
        if ((event === 'poll.vote' || event === 'poll.vote.failed') && data && data.payload && data.payload.vote) {
            const vote = data.payload.vote;
            let timestamp = Number(vote.timestamp) || 0;
            if (timestamp > 1000000000000) {
                timestamp = Math.floor(timestamp / 1000);
            }
            data = Object.assign({}, data, {
                payload: {
                    id: vote.id,
                    from: vote.from,
                    fromMe: Boolean(vote.fromMe),
                    to: vote.to || vote.from,
                    participant: vote.participant || null,
                    timestamp: timestamp,
                    source: 'app',
                    body: null,
                    hasMedia: false,
                    pollVote: data.payload,
                    _data: data.payload._data || {},
                },
            });
        }
        const queue = this.getQueueForEvent(event);""",
)

replace_once(
    "ChatWootWAHAQueueService.js",
    """            const obs$ = session.getEventObservable(event);
            obs$.subscribe(async (payload) => {""",
    """            const obs$ = session.getEventObservable(event);
            if (!obs$) {
                continue;
            }
            obs$.subscribe(async (payload) => {""",
)

replace_once(
    "UnsupportedMessage.js",
    """            attachments: [],
            private: true,""",
    """            attachments: [],
            private: undefined,""",
)

replace_once(
    "HasMediaWithNoMediaMessage.js",
    """            attachments: [],
            private: true,""",
    """            attachments: [],
            private: undefined,""",
)

print("patch complete")
