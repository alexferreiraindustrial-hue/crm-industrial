// CRM Industrial - Conector WAHA -> Chatwoot
// Para cada sessao aberta no WAHA, garante uma caixa de entrada "WhatsApp · <sessao>" no Chatwoot
// ligada pelo App Chatwoot nativo do WAHA. Nao apaga nada: sessao removida mantem a caixa e o historico.
const env = (name, fallback) => {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Variavel ${name} nao definida`);
  }
  return value;
};

const WAHA_URL = env('WAHA_URL', 'http://waha:3000');
const WAHA_API_KEY = env('WAHA_API_KEY_PLAIN');
const CHATWOOT_URL = env('CHATWOOT_URL', 'http://chatwoot:3009');
const CHATWOOT_ACCOUNT_ID = Number(env('CHATWOOT_ACCOUNT_ID', '1'));
const CHATWOOT_API_TOKEN = process.env.CHATWOOT_API_TOKEN ?? '';
const INTERVAL_SECONDS = Number(env('INTERVALO_SEGUNDOS', '20'));
const PREFERRED_LOCALE = env('IDIOMA', 'pt-BR');
const INBOX_PREFIX = 'WhatsApp · ';

const log = (message) => console.log(`${new Date().toISOString()} ${message}`);

const request = async (base, path, { method = 'GET', body, headers }) => {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${method} ${path} -> ${response.status} ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : null;
};

const waha = (path, options = {}) => request(WAHA_URL, path, { ...options, headers: { 'X-Api-Key': WAHA_API_KEY } });
const chatwoot = (path, options = {}) =>
  request(CHATWOOT_URL, `/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}${path}`, {
    ...options,
    headers: { api_access_token: CHATWOOT_API_TOKEN },
  });

const conversationConfig = {
  sort: 'activity_newest',
  status: ['open', 'pending', 'snoozed'],
  markAsRead: true,
  syncMessageStatus: true,
  outgoing: 'message',
};

const appIdFor = (session) => `chatwoot-${session}`.replace(/[^a-zA-Z0-9_-]/g, '-');
const webhookFor = (session) => `${WAHA_URL}/webhooks/chatwoot/${session}/${appIdFor(session)}`;

let locale = 'en-US';
let localeResolved = false;
const resolveLocale = async () => {
  const locales = await waha('/api/apps/chatwoot/locales');
  const codes = (Array.isArray(locales) ? locales : []).map((item) => item.locale ?? item.code ?? item);
  locale = codes.includes(PREFERRED_LOCALE) ? PREFERRED_LOCALE : 'en-US';
  localeResolved = true;
  log(`Idioma das mensagens do WAHA no Chatwoot: ${locale}`);
};

const findOrCreateInbox = async (session) => {
  const name = `${INBOX_PREFIX}${session}`;
  const { payload: inboxes } = await chatwoot('/inboxes');
  const existing = inboxes.find((inbox) => inbox.name === name && inbox.channel_type === 'Channel::Api');
  if (existing) {
    if (existing.webhook_url !== webhookFor(session)) {
      await chatwoot(`/inboxes/${existing.id}`, {
        method: 'PATCH',
        body: { channel: { webhook_url: webhookFor(session) } },
      });
    }
    return existing;
  }
  const created = await chatwoot('/inboxes', {
    method: 'POST',
    body: { name, channel: { type: 'api', webhook_url: webhookFor(session) } },
  });
  const agents = await chatwoot('/agents');
  const adminIds = agents.filter((agent) => agent.role === 'administrator').map((agent) => agent.id);
  if (adminIds.length > 0) {
    await chatwoot('/inbox_members', { method: 'POST', body: { inbox_id: created.id, user_ids: adminIds } });
  }
  log(`Caixa criada no Chatwoot: "${name}" (id ${created.id})`);
  return created;
};

const connectSession = async (session) => {
  const inbox = await findOrCreateInbox(session);
  await waha('/api/apps', {
    method: 'POST',
    body: {
      id: appIdFor(session),
      session,
      app: 'chatwoot',
      enabled: true,
      config: {
        url: CHATWOOT_URL,
        accountId: CHATWOOT_ACCOUNT_ID,
        accountToken: CHATWOOT_API_TOKEN,
        inboxId: inbox.id,
        inboxIdentifier: inbox.inbox_identifier,
        locale,
        linkPreview: 'OFF',
        conversations: conversationConfig,
      },
    },
  });
  log(`Sessao "${session}" ligada ao Chatwoot (app ${appIdFor(session)})`);
};

const sameConversationConfig = (config) => {
  const conversations = config?.conversations ?? {};
  const status = Array.isArray(conversations.status) ? [...conversations.status].sort() : [];
  return (
    conversations.outgoing === conversationConfig.outgoing &&
    conversations.markAsRead === true &&
    conversations.syncMessageStatus === true &&
    conversations.sort === conversationConfig.sort &&
    status.join() === [...conversationConfig.status].sort().join()
  );
};

const ensureConversationConfig = async (session, apps) => {
  const app = apps.find((item) => item.app === 'chatwoot' && item.id === appIdFor(session));
  if (!app?.config?.accountToken || sameConversationConfig(app.config)) {
    return;
  }
  await waha(`/api/apps/${encodeURIComponent(app.id)}`, {
    method: 'PUT',
    body: {
      id: app.id,
      session: app.session,
      app: app.app,
      enabled: true,
      config: {
        ...app.config,
        locale,
        linkPreview: 'OFF',
        conversations: { ...app.config.conversations, ...conversationConfig },
      },
    },
  });
  log(`Sessao "${session}": mensagens do celular entram na conversa, com status de leitura`);
};

const ensureBrazilianNumbers = async (session, apps) => {
  if (apps.some((app) => app.app === 'brazilian-phone-numbers')) {
    return;
  }
  await waha('/api/apps', {
    method: 'POST',
    body: { id: `br-numbers-${session}`.replace(/[^a-zA-Z0-9_-]/g, '-'), session, app: 'brazilian-phone-numbers', enabled: true, config: {} },
  });
  log(`Correcao do 9o digito ligada na sessao "${session}"`);
};

const syncOnce = async () => {
  const sessions = await waha('/api/sessions?all=true');
  for (const { name: session } of sessions) {
    try {
      const apps = await waha(`/api/apps?session=${encodeURIComponent(session)}`);
      if (!apps.some((app) => app.app === 'chatwoot')) {
        await connectSession(session);
      } else {
        await ensureConversationConfig(session, apps);
      }
      await ensureBrazilianNumbers(session, apps);
    } catch (error) {
      log(`ERRO na sessao "${session}": ${error.message}`);
    }
  }
};

const main = async () => {
  if (CHATWOOT_API_TOKEN === '') {
    log('Aguardando configuracao: crie o administrador no Chatwoot e rode ligar-conector.ps1');
    setInterval(() => {}, 1 << 30);
    return;
  }
  log(`Conector WAHA -> Chatwoot iniciado (a cada ${INTERVAL_SECONDS}s)`);
  for (;;) {
    try {
      if (!localeResolved) {
        await resolveLocale();
      }
      await syncOnce();
    } catch (error) {
      log(`ERRO: ${error.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, INTERVAL_SECONDS * 1000));
  }
};

main();
