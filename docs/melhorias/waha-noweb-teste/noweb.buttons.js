"use strict";
// Versão de TESTE do noweb.buttons.js do WAHA, montada só no contêiner waha-noweb-teste.
// Diferenças em relação ao original:
//  1. acrescenta ao envio o nó "biz" que o WhatsApp exige para mostrar botões (o Baileys só faz isso para listas);
//  2. aceita um botão de PIX nativo (payment_info / pix_static_code) quando o id do botão começa com "pix";
//  3. o id do primeiro botão pode trazer opções de teste: "t:biz=mixed,wrap=vo|..." (o resto depois de "|" é o id real).
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomId = randomId;
exports.buttonToJson = buttonToJson;
exports.sendButtonMessage = sendButtonMessage;
const chatting_buttons_dto_1 = require("../../../structures/chatting.buttons.dto");
const esm_1 = require("../../../vendor/esm");
function toName(type) {
    switch (type) {
        case chatting_buttons_dto_1.ButtonType.REPLY:
            return 'quick_reply';
        case chatting_buttons_dto_1.ButtonType.URL:
            return 'cta_url';
        case chatting_buttons_dto_1.ButtonType.CALL:
            return 'cta_call';
        case chatting_buttons_dto_1.ButtonType.COPY:
            return 'cta_copy';
    }
}
function randomId() {
    return Math.random().toString().slice(2, 18);
}
function parseOptions(buttons) {
    const options = { biz: 'mixed', wrap: 'vo' };
    const first = buttons[0];
    if (first && typeof first.id === 'string' && first.id.startsWith('t:')) {
        const [opts, realId] = first.id.slice(2).split('|');
        for (const pair of opts.split(',')) {
            const [k, v] = pair.split('=');
            if (k && v) options[k.trim()] = v.trim();
        }
        first.id = realId || undefined;
    }
    return options;
}
function pixButton(button) {
    // copyCode traz {"merchant_name","key","key_type","amount"} em JSON.
    const pix = JSON.parse(button.copyCode);
    const cents = Math.round(Number(pix.amount || 0) * 100);
    const money = (value) => ({ value: value, offset: 100 });
    const params = {
        currency: 'BRL',
        total_amount: money(cents),
        reference_id: randomId().slice(0, 10),
        type: 'physical-goods',
        order: {
            status: 'pending',
            subtotal: money(cents),
            order_type: 'ORDER',
            items: [{ name: pix.item || '', amount: money(cents), quantity: 1, sale_amount: money(cents) }],
        },
        payment_settings: [{
                type: 'pix_static_code',
                pix_static_code: { merchant_name: pix.merchant_name, key: pix.key, key_type: pix.key_type },
            }],
        share_payment_status: false,
    };
    return { name: 'payment_info', buttonParamsJson: JSON.stringify(params) };
}
function buttonToJson(button) {
    if (button.type === chatting_buttons_dto_1.ButtonType.COPY && typeof button.id === 'string' && button.id.startsWith('pix')) {
        return pixButton(button);
    }
    const name = toName(button.type);
    const buttonParams = {
        display_text: button.text,
        id: button.id || randomId(),
        disabled: false,
    };
    switch (button.type) {
        case chatting_buttons_dto_1.ButtonType.REPLY:
            break;
        case chatting_buttons_dto_1.ButtonType.CALL:
            buttonParams.phone_number = button.phoneNumber;
            break;
        case chatting_buttons_dto_1.ButtonType.COPY:
            buttonParams.copy_code = button.copyCode;
            break;
        case chatting_buttons_dto_1.ButtonType.URL:
            buttonParams.url = button.url;
            buttonParams.merchant_url = button.url;
            break;
    }
    return {
        name: name,
        buttonParamsJson: JSON.stringify(buttonParams),
    };
}
function bizNodes(kind) {
    if (kind === 'none') return [];
    if (kind === 'payattr') return [{ tag: 'biz', attrs: { native_flow_name: 'payment_info' } }];
    const name = kind === 'pay' ? 'payment_info' : 'mixed';
    return [{
            tag: 'biz',
            attrs: {},
            content: [{
                    tag: 'interactive',
                    attrs: { type: 'native_flow', v: '1' },
                    content: [{ tag: 'native_flow', attrs: { v: '9', name: name } }],
                }],
        }];
}
async function sendButtonMessage(sock, chatId, buttons, header, headerImage, body, footer) {
    var _a;
    const options = parseOptions(buttons);
    const interactiveMessage = {
        body: body ? { text: body } : undefined,
        header: undefined,
        footer: footer ? { text: footer } : undefined,
        nativeFlowMessage: {
            buttons: buttons.map(buttonToJson),
            messageParamsJson: JSON.stringify({ from: 'api', templateId: randomId() }),
        },
    };
    if (header || headerImage) {
        interactiveMessage.header = {
            title: header,
            hasMediaAttachment: !!headerImage,
            imageMessage: headerImage,
        };
    }
    const context = { deviceListMetadata: {}, deviceListMetadataVersion: 2 };
    const data = options.wrap === 'flat'
        ? { messageContextInfo: context, interactiveMessage: interactiveMessage }
        : { viewOnceMessage: { message: { messageContextInfo: context, interactiveMessage: interactiveMessage } } };
    const msg = esm_1.default.b.proto.Message.create(data);
    const fullMessage = esm_1.default.b.generateWAMessageFromContent(chatId, msg, {
        userJid: (_a = sock === null || sock === void 0 ? void 0 : sock.user) === null || _a === void 0 ? void 0 : _a.id,
    });
    await sock.relayMessage(chatId, fullMessage.message, {
        messageId: fullMessage.key.id,
        additionalNodes: bizNodes(options.biz),
    });
    return fullMessage;
}
