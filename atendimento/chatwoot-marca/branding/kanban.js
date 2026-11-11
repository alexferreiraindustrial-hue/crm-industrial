(function () {
  if (window.crmKanban) return;

  const PREFS_KEY = 'crm-kanban-prefs-v1';
  const PRIORITIES = [[0, 'Nenhuma'], [1, 'Baixa'], [2, 'Média'], [3, 'Alta']];
  const STATUS = { open: 'Aberto', won: 'Ganho', lost: 'Perdido' };
  const STATUS_FILTERS = [['all', 'Mostrar todos'], ['open', 'Aberto'], ['won', 'Ganho'], ['lost', 'Perdido']];
  const SORTS = [['manual', 'Manual'], ['newest', 'Mais recentes'], ['oldest', 'Mais antigos'], ['value', 'Maior valor'], ['priority', 'Maior prioridade']];
  const STAGE_COLORS = ['#21c063', '#f15c6d', '#8b7cf6', '#e8b44a', '#5096cf', '#ff8a4c', '#2bb8c4', '#d66bd6'];
  const DEFAULT_LABELS = { item_singular: 'Card', item_plural: 'Cards', customer: 'Cliente', due: 'Prazo', done: 'Concluído' };
  const LABEL_FIELDS = [['item_singular', 'Cada item se chama'], ['item_plural', 'Vários itens se chamam'], ['customer', 'O cliente se chama'], ['due', 'O prazo se chama'], ['done', 'O concluído se chama']];
  const TEMPLATES = [
    { key: 'general', name: 'Geral', labels: {}, stages: [['A fazer'], ['Em andamento'], ['Concluído', true]] },
    { key: 'sales', name: 'Vendas', labels: { item_singular: 'Negócio', item_plural: 'Negócios', due: 'Previsão de fechamento', done: 'Fechado' }, stages: [['Novo contato'], ['Qualificação'], ['Proposta'], ['Negociação'], ['Fechado', true]] },
    { key: 'service', name: 'Atendimento', labels: { item_singular: 'Chamado', item_plural: 'Chamados', done: 'Resolvido' }, stages: [['Novo'], ['Em atendimento'], ['Aguardando cliente'], ['Resolvido', true]] },
    { key: 'logistics', name: 'Logística', labels: { item_singular: 'Entrega', item_plural: 'Entregas', customer: 'Cliente ou transportadora', due: 'Prazo de entrega', done: 'Entregue' }, stages: [['Aguardando coleta'], ['Em trânsito'], ['Entregue', true]] },
    { key: 'production', name: 'Produção', labels: { item_singular: 'Pedido', item_plural: 'Pedidos', done: 'Pronto' }, stages: [['Orçamento'], ['Em produção'], ['Conferência'], ['Pronto', true]] },
    { key: 'projects', name: 'Projetos', labels: { item_singular: 'Tarefa', item_plural: 'Tarefas' }, stages: [['Ideias'], ['Planejado'], ['Em execução'], ['Revisão'], ['Concluído', true]] },
    { key: 'blank', name: 'Em branco', labels: {}, stages: [['Nova coluna']] },
  ];
  const ICONS = {
    external: 'M14 3h7v7M21 3l-9 9M18 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5',
    whatsapp: 'M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1',
    alert: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
    dots: 'M12 5h.01M12 12h.01M12 19h.01',
    plus: 'M12 5v14M5 12h14',
    bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
    calc: 'M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01',
    checks: 'M3 6h9M3 12h6M3 18h9M15 17l2 2 4-4',
    boards: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    tag: 'M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01',
    clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
    money: 'M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    user: 'M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    chevron: 'M6 9l6 6 6-6',
    close: 'M18 6 6 18M6 6l12 12',
    search: 'M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
    star: 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z',
    edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
    copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
    trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    grip: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
    filter: 'M3 5h18l-7 8v6l-4 2v-8z',
    check: 'M5 12.5l4.5 4.5L19 7',
    download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  };

  const state = {
    visible: false, view: 'board', layout: 'kanban', funnels: [], funnel: null, columns: {}, list: null,
    status: 'open', q: '', labels: [], agents: [], inboxes: [], isAdmin: false, loaded: false, dragging: null,
    drawer: null, draftFunnel: null, chat: null,
  };

  let prefs = readPrefs();
  let root = null;
  let searchTimer = 0;

  function readPrefs() {
    const base = { funnelId: null, layout: 'kanban', widths: {}, hidden: {}, sort: {}, collapsed: {}, expanded: null };
    try {
      return Object.assign(base, JSON.parse(localStorage.getItem(PREFS_KEY) || '{}'));
    } catch (error) {
      return base;
    }
  }

  function savePrefs() {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch (error) {
      return;
    }
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function icon(name, size) {
    return '<svg class="kb-i" viewBox="0 0 24 24" width="' + (size || 16) + '" height="' + (size || 16) + '" aria-hidden="true"><path d="' + ICONS[name] + '"></path></svg>';
  }

  function money(value) {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function parseMoney(text) {
    const clean = String(text || '').replace(/[^\d,.-]/g, '');
    if (!clean) return 0;
    const normalized = clean.indexOf(',') !== -1 ? clean.replace(/\./g, '').replace(',', '.') : clean;
    return Number(normalized) || 0;
  }

  function duration(seconds) {
    const total = Math.max(0, Math.floor(seconds));
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    if (days) return days + 'd ' + hours + 'h';
    if (hours) return hours + 'h ' + minutes + 'm';
    return minutes + 'm';
  }

  function shortAge(from) {
    const seconds = (Date.now() - new Date(from).getTime()) / 1000;
    if (seconds >= 86400) return Math.floor(seconds / 86400) + 'd';
    if (seconds >= 3600) return Math.floor(seconds / 3600) + 'h';
    return Math.max(1, Math.floor(seconds / 60)) + 'm';
  }

  function dateTime(value) {
    return value ? new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
  }

  function dateOnly(value) {
    return value ? new Date(value).toLocaleDateString('pt-BR') : '—';
  }

  function toLocalInput(value) {
    if (!value) return '';
    const date = new Date(value);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  }

  function accountId() {
    const match = window.location.pathname.match(/\/app\/accounts\/(\d+)/);
    return match ? match[1] : '';
  }

  function authHeaders() {
    const cookie = document.cookie.split('; ').find((part) => part.indexOf('cw_d_session_info=') === 0);
    if (!cookie) return null;
    try {
      const data = JSON.parse(decodeURIComponent(cookie.slice('cw_d_session_info='.length)));
      return {
        'access-token': data['access-token'], 'token-type': data['token-type'] || 'Bearer', client: data.client,
        expiry: data.expiry, uid: data.uid, 'Content-Type': 'application/json', Accept: 'application/json',
      };
    } catch (error) {
      return null;
    }
  }

  async function request(method, url, body) {
    const headers = authHeaders();
    if (!headers) throw new Error('Sua sessão expirou. Entre novamente.');
    const response = await fetch(url, { method, credentials: 'same-origin', headers, body: body ? JSON.stringify(body) : undefined });
    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (error) {
      data = null;
    }
    if (!response.ok) {
      if (response.status === 403) throw new Error('Você não tem permissão para esta ação.');
      throw new Error((data && (data.error || data.message)) || 'Não foi possível concluir. Tente novamente.');
    }
    if (method !== 'GET') window.dispatchEvent(new Event('crm:changed'));
    return data;
  }

  const api = (method, path, body) => request(method, '/api/v1/accounts/' + accountId() + path, body);

  function toast(message, kind) {
    let host = document.querySelector('.kb-toasts');
    if (!host) {
      host = document.createElement('div');
      host.className = 'kb-toasts';
      host.setAttribute('role', 'status');
      document.body.appendChild(host);
    }
    const item = document.createElement('div');
    item.className = 'kb-toast' + (kind === 'error' ? ' is-error' : '');
    item.textContent = message;
    host.appendChild(item);
    setTimeout(() => item.remove(), 4200);
  }

  const failed = (error) => toast(error.message || 'Não foi possível concluir.', 'error');

  function initials(name) {
    const parts = String(name || '?').trim().split(/\s+/).filter(Boolean);
    return ((parts[0] || '?')[0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  }

  function avatar(person, size) {
    const style = 'width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * 0.38) + 'px';
    const name = person ? person.name : '';
    if (person && person.thumbnail) return '<img class="kb-avatar" style="' + style + '" src="' + esc(person.thumbnail) + '" alt="" loading="lazy">';
    return '<span class="kb-avatar" style="' + style + '" aria-hidden="true">' + esc(initials(name)) + '</span>';
  }

  function labelColor(title) {
    const found = state.labels.find((label) => label.title === title);
    return found ? found.color : '#8a8a8a';
  }

  function chip(title) {
    return '<span class="kb-label"><i style="background:' + esc(labelColor(title)) + '"></i>' + esc(title) + '</span>';
  }

  function priorityBars(priority) {
    const label = (PRIORITIES.find((entry) => entry[0] === priority) || PRIORITIES[0])[1];
    let bars = '';
    for (let level = 1; level <= 3; level += 1) bars += '<i class="' + (priority >= level ? 'on p' + priority : '') + '" style="height:' + (3 + level * 3) + 'px"></i>';
    return '<span class="kb-bars" title="Prioridade: ' + label + '" aria-label="Prioridade: ' + label + '">' + bars + '</span>';
  }

  function labelsFor(funnelId) {
    const funnel = state.funnels.find((entry) => entry.id === funnelId) || state.funnel;
    const labels = Object.assign({}, DEFAULT_LABELS);
    if (funnel && funnel.labels) Object.keys(funnel.labels).forEach((key) => { if (funnel.labels[key]) labels[key] = funnel.labels[key]; });
    return labels;
  }

  function saoPauloToday() {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  }

  function dayNumber(iso) {
    const parts = iso.split('-').map(Number);
    return Date.UTC(parts[0], parts[1] - 1, parts[2]) / 86400000;
  }

  function dueInfo(item) {
    if (item.status === 'won' || item.done_stage) return { state: 'done', text: labelsFor(item.funnel_id).done, icon: 'check' };
    if (!item.due_on || item.status === 'lost') return null;
    const funnel = state.funnels.find((entry) => entry.id === item.funnel_id);
    const soon = funnel ? funnel.due_soon_days : 2;
    const days = dayNumber(item.due_on) - dayNumber(saoPauloToday());
    if (days < 0) return { state: 'late', text: 'Vencido há ' + (-days) + (days === -1 ? ' dia' : ' dias'), icon: 'alert' };
    if (days === 0) return { state: 'today', text: 'Vence hoje', icon: 'clock' };
    if (days <= soon) return { state: 'soon', text: days === 1 ? 'Vence amanhã' : 'Em ' + days + ' dias', icon: 'calendar' };
    const parts = item.due_on.split('-');
    return { state: 'far', text: parts[2] + '/' + parts[1] + (parts[0] === saoPauloToday().slice(0, 4) ? '' : '/' + parts[0]), icon: 'calendar' };
  }

  function dueChip(item) {
    const info = dueInfo(item);
    return info ? '<span class="kb-due is-' + info.state + '" title="' + esc(labelsFor(item.funnel_id).due) + '">' + icon(info.icon, 13) + esc(info.text) + '</span>' : '';
  }

  function customerOf(item) {
    return item.contact ? item.contact.name : (item.customer_name || '');
  }

  function funnelSelectOptions() {
    const option = (funnel) => '<option value="' + funnel.id + '"' + (funnel.id === state.funnel.id ? ' selected' : '') + '>' + esc(funnel.name) + ' (' + funnel.open_count + ')</option>';
    const usable = state.funnels.filter((funnel) => funnel.active || funnel.id === state.funnel.id);
    const shared = usable.filter((funnel) => !funnel.personal).map(option).join('');
    const mine = usable.filter((funnel) => funnel.personal).map(option).join('');
    return (shared ? '<optgroup label="Da empresa">' + shared + '</optgroup>' : '') + (mine ? '<optgroup label="Meus quadros">' + mine + '</optgroup>' : '');
  }

  function conversationUrl(conversation) {
    return '/app/accounts/' + accountId() + '/conversations/' + conversation.display_id;
  }

  // ---------- Menus e janelas ----------

  function closeMenu() {
    const open = document.querySelector('.kb-menu');
    if (open) open.remove();
  }

  function placeFloating(element, anchor) {
    const rect = anchor.getBoundingClientRect();
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    let left = Math.min(rect.left, window.innerWidth - width - 8);
    let top = rect.bottom + 4;
    if (top + height > window.innerHeight - 8) top = Math.max(8, rect.top - height - 4);
    left = Math.max(8, left);
    element.style.left = left + 'px';
    element.style.top = top + 'px';
  }

  function openMenu(anchor, items) {
    closeMenu();
    const menu = document.createElement('div');
    menu.className = 'kb-menu';
    menu.setAttribute('role', 'menu');
    menu.innerHTML = items.map((item, index) => '<button type="button" role="menuitem" data-index="' + index + '" class="' + (item.danger ? 'is-danger' : '') + (item.active ? ' is-active' : '') + '"><span>' + esc(item.label) + '</span>' + (item.hint ? '<small>' + esc(item.hint) + '</small>' : '') + '</button>').join('');
    document.body.appendChild(menu);
    placeFloating(menu, anchor);
    menu.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-index]');
      if (!button) return;
      event.stopPropagation();
      const chosen = items[Number(button.getAttribute('data-index'))];
      closeMenu();
      chosen.run();
    });
    const first = menu.querySelector('button');
    if (first) first.focus();
  }

  function openChecklistPopover(anchor, options, selected, onSave, title) {
    closeMenu();
    const menu = document.createElement('div');
    menu.className = 'kb-menu kb-popover';
    menu.innerHTML = '<p class="kb-pop-title">' + esc(title) + '</p><div class="kb-check-list">' +
      (options.length ? options.map((option) => '<label class="kb-check"><input type="checkbox" value="' + esc(option.value) + '"' + (selected.indexOf(option.value) !== -1 ? ' checked' : '') + '>' + (option.color ? '<i style="background:' + esc(option.color) + '"></i>' : '') + '<span>' + esc(option.label) + '</span></label>').join('') : '<p class="kb-empty-small">Nenhuma opção cadastrada.</p>') +
      '</div><div class="kb-pop-foot"><button type="button" class="kb-btn" data-pop="cancel">Cancelar</button><button type="button" class="kb-btn is-primary" data-pop="save">Salvar</button></div>';
    document.body.appendChild(menu);
    placeFloating(menu, anchor);
    menu.addEventListener('click', (event) => {
      event.stopPropagation();
      const action = event.target.closest('[data-pop]');
      if (!action) return;
      const values = Array.from(menu.querySelectorAll('input:checked')).map((input) => input.value);
      closeMenu();
      if (action.getAttribute('data-pop') === 'save') onSave(values);
    });
  }

  function closeDialog(layer) {
    if (layer) layer.remove();
  }

  function openDialog(options) {
    const layer = document.createElement('div');
    layer.className = 'kb-layer' + (options.side ? ' is-side' : '');
    layer.innerHTML = '<form class="kb-dialog' + (options.narrow ? ' is-narrow' : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(options.title) + '" novalidate>' +
      '<header><h3>' + esc(options.title) + '</h3><button type="button" class="kb-icon-btn" data-close aria-label="Fechar">' + icon('close', 18) + '</button></header>' +
      '<div class="kb-dialog-body">' + options.body + '</div><p class="kb-form-error" hidden></p>' +
      '<footer>' + (options.extraFoot || '') + '<span class="kb-grow"></span><button type="button" class="kb-btn" data-close>Cancelar</button><button type="submit" class="kb-btn ' + (options.danger ? 'is-danger' : 'is-primary') + '">' + esc(options.submit || 'Salvar') + '</button></footer></form>';
    document.body.appendChild(layer);
    const form = layer.querySelector('form');
    const errorBox = layer.querySelector('.kb-form-error');
    layer.addEventListener('mousedown', (event) => {
      if (event.target === layer) closeDialog(layer);
    });
    form.addEventListener('click', (event) => {
      if (event.target.closest('[data-close]')) closeDialog(layer);
    });
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submit = form.querySelector('button[type=submit]');
      submit.disabled = true;
      errorBox.hidden = true;
      try {
        await options.onSubmit(form, layer);
        closeDialog(layer);
      } catch (error) {
        errorBox.textContent = error.message || 'Não foi possível salvar.';
        errorBox.hidden = false;
      } finally {
        submit.disabled = false;
      }
    });
    if (options.onOpen) options.onOpen(form, layer);
    const focusable = form.querySelector('.kb-dialog-body input:not([type=hidden]), .kb-dialog-body select, .kb-dialog-body textarea');
    if (focusable) focusable.focus();
    return layer;
  }

  function confirmAction(title, message, submit, run) {
    openDialog({ title, narrow: true, danger: true, submit, body: '<p class="kb-confirm">' + esc(message) + '</p>', onSubmit: run });
  }

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.kb-menu')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (document.querySelector('.kb-menu')) return closeMenu();
    const layers = document.querySelectorAll('.kb-layer');
    if (layers.length) return closeDialog(layers[layers.length - 1]);
    if (!state.visible) return;
    if (state.drawer) return closeDrawer();
    if (state.chat) closeChat();
  });

  // ---------- Dados de apoio ----------

  async function loadReference() {
    if (state.loaded) return;
    const [labels, agents, inboxes, profile] = await Promise.all([
      api('GET', '/labels').catch(() => ({ payload: [] })),
      api('GET', '/agents').catch(() => []),
      api('GET', '/inboxes').catch(() => ({ payload: [] })),
      request('GET', '/api/v1/profile').catch(() => null),
    ]);
    state.labels = labels.payload || labels || [];
    state.agents = agents.payload || agents || [];
    state.inboxes = inboxes.payload || inboxes || [];
    const account = profile && (profile.accounts || []).find((entry) => String(entry.id) === accountId());
    state.isAdmin = !!(account && account.role === 'administrator');
    state.loaded = true;
  }

  async function loadFunnels() {
    state.funnels = await api('GET', '/kanban_funnels');
    const preferred = state.funnels.find((funnel) => funnel.id === prefs.funnelId);
    state.funnel = preferred || state.funnels.find((funnel) => funnel.is_default) || state.funnels[0] || null;
  }

  function stageById(id) {
    for (const funnel of state.funnels) {
      const found = funnel.stages.find((stage) => stage.id === id);
      if (found) return found;
    }
    return null;
  }

  function agentName(id) {
    const agent = state.agents.find((entry) => entry.id === id);
    return agent ? (agent.available_name || agent.name) : 'Agente';
  }

  // ---------- Painel ----------

  function host() {
    return document.querySelector('.crm-col') || (document.querySelector('#app main') || {}).parentElement || document.body;
  }

  function mount() {
    if (root && root.isConnected) return;
    const parent = host();
    root = document.createElement('section');
    root.className = 'crm-kanban';
    root.setAttribute('aria-label', 'Kanban');
    root.innerHTML = '<div class="kb-sub"><p class="kb-sub-title">Kanban</p><nav><a href="#kanban" data-nav="board">Quadro</a><a href="#kanban/funis" data-nav="funnels">Quadros</a></nav></div><div class="kb-main"></div>';
    const main = parent.querySelector(':scope > main');
    if (main) parent.insertBefore(root, main);
    else parent.appendChild(root);
    root.addEventListener('click', onRootClick);
    root.addEventListener('input', onRootInput);
    root.addEventListener('change', onRootChange);
    root.addEventListener('pointerdown', onResizeStart);
  }

  function mainEl() {
    return root.querySelector('.kb-main');
  }

  function markNav() {
    root.querySelectorAll('.kb-sub [data-nav]').forEach((link) => {
      link.classList.toggle('is-on', link.getAttribute('data-nav') === state.view);
    });
  }

  async function route() {
    const hash = window.location.hash;
    if (hash.indexOf('#kanban') !== 0) {
      hide();
      return;
    }
    show();
    try {
      await loadReference();
      if (!state.funnels.length) await loadFunnels();
    } catch (error) {
      mainEl().innerHTML = '<div class="kb-empty"><h2>Não foi possível abrir o Kanban</h2><p>' + esc(error.message) + '</p></div>';
      return;
    }
    const parts = hash.split('/');
    if (parts[1] === 'funis') {
      state.view = 'funnels';
      closeDrawerSilently();
      if (parts[2]) openFunnelEditor(parts[2] === 'novo' ? null : Number(parts[2]));
      else renderFunnels();
    } else {
      if (state.view !== 'board' || !mainEl().querySelector('.kb-board')) {
        state.view = 'board';
        renderBoard();
      }
      if (parts[1] === 'item' && parts[2]) openDrawer(Number(parts[2]));
      else closeDrawerSilently();
    }
    markNav();
  }

  function show() {
    if (window.crmCloseCalendar) window.crmCloseCalendar();
    mount();
    state.visible = true;
    document.body.setAttribute('data-crm-kanban', 'open');
  }

  function hide() {
    state.visible = false;
    document.body.removeAttribute('data-crm-kanban');
    closeDrawerSilently();
    closeMenu();
    document.querySelectorAll('.kb-layer').forEach((layer) => layer.remove());
    closeChat();
    if (root) root.remove();
    root = null;
    state.view = 'board';
  }

  function open() {
    if (window.location.hash.indexOf('#kanban') === 0) route();
    else window.location.hash = '#kanban';
  }

  function close() {
    if (window.location.hash.indexOf('#kanban') === 0) history.replaceState(null, '', window.location.pathname + window.location.search);
    hide();
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }

  // ---------- Quadro ----------

  function visibleStages() {
    if (!state.funnel) return [];
    if (prefs.expanded && state.funnel.stages.some((stage) => stage.id === prefs.expanded)) return state.funnel.stages.filter((stage) => stage.id === prefs.expanded);
    return state.funnel.stages.filter((stage) => !prefs.hidden[stage.id]);
  }

  function renderBoard() {
    closeMenu();
    if (!state.funnel) {
      mainEl().innerHTML = '<div class="kb-empty"><h2>Crie seu primeiro quadro</h2><p>Monte as colunas do jeito que o seu trabalho funciona.</p><a class="kb-btn is-primary" href="#kanban/funis/novo">Criar quadro</a></div>';
      return;
    }
    if (prefs.layout === 'report' && reportsOn()) state.layout = 'report';
    else state.layout = prefs.layout === 'list' ? 'list' : 'kanban';
    mainEl().innerHTML = '<div class="kb-board">' + boardHeader() + '<div class="kb-content"></div></div>';
    renderContent();
  }

  // Relatórios do Kanban: só com o recurso ligado em Configurações → Recursos.
  function reportsOn() {
    return Boolean(window.crmModules && window.crmModules.enabled('relatorios_kanban'));
  }

  // Produtos e serviços no cartão: só com o recurso ligado.
  function productsOn() {
    return Boolean(window.crmModules && window.crmModules.enabled('produtos_kanban'));
  }

  function hasProductLines(item) {
    return Boolean(item && (item.products_count || (item.products && item.products.length)));
  }

  function boardHeader() {
    const statusLabel = (STATUS_FILTERS.find((entry) => entry[0] === state.status) || STATUS_FILTERS[0])[1];
    const report = state.layout === 'report';
    return '<header class="kb-top">' +
      '<div class="kb-segment" role="group" aria-label="Visualização"><button type="button" data-act="layout" data-value="kanban" class="' + (state.layout === 'kanban' ? 'is-on' : '') + '">Kanban</button><button type="button" data-act="layout" data-value="list" class="' + (state.layout === 'list' ? 'is-on' : '') + '">Lista</button>' +
      (reportsOn() ? '<button type="button" data-act="layout" data-value="report" class="' + (report ? 'is-on' : '') + '">Relatórios</button>' : '') + '</div>' +
      '<label class="kb-select"><span class="kb-sr">Quadro</span><select data-field="funnel">' + funnelSelectOptions() + '</select>' + icon('chevron', 14) + '</label>' +
      (report ? reportHeaderTools() + '</header>' : boardHeaderTools(statusLabel));
  }

  function boardHeaderTools(statusLabel) {
    return '<label class="kb-search">' + icon('search') + '<span class="kb-sr">Pesquisar</span><input type="search" data-field="search" placeholder="Buscar" value="' + esc(state.q) + '"></label>' +
      '<button type="button" class="kb-btn" data-act="status-menu">' + icon('filter', 14) + esc(statusLabel) + '</button>' +
      '<button type="button" class="kb-btn" data-act="card-mode" title="Escolher se os cards começam fechados ou abertos">' + icon('chevron', 14) + '<span>' + (prefs.closedByDefault ? 'Fechados' : 'Abertos') + '</span></button>' +
      '<button type="button" class="kb-btn is-primary" data-act="add-item">' + icon('plus', 14) + esc(labelsFor(state.funnel.id).item_singular) + '</button>' +
      '<a class="kb-icon-btn" href="#kanban/funis" title="Gerenciar quadros" aria-label="Gerenciar quadros">' + icon('boards', 18) + '</a>' +
      '<button type="button" class="kb-icon-btn" data-act="top-menu" aria-label="Mais opções">' + icon('dots', 18) + '</button></header>';
  }

  function renderContent() {
    const content = mainEl().querySelector('.kb-content');
    if (!content) return;
    if (state.layout === 'report') {
      content.innerHTML = '<div class="kb-report"><p class="kb-loading">Carregando…</p></div>';
      loadReport();
      return;
    }
    if (state.layout === 'list') {
      state.list = null;
      content.innerHTML = '<div class="kb-list-wrap"><p class="kb-loading">Carregando…</p></div>';
      loadList(1);
      return;
    }
    const stages = visibleStages();
    state.columns = {};
    content.innerHTML = '<div class="kb-columns' + (prefs.expanded ? ' is-expanded' : '') + '">' + stages.map(columnShell).join('') + (state.funnel.can_manage && !prefs.expanded ? '<button type="button" class="kb-new-column" data-act="add-column">' + icon('plus', 15) + 'Nova coluna</button>' : '') + '</div>';
    initSortables();
    stages.forEach((stage) => loadColumn(stage.id, 1));
  }

  function columnShell(stage) {
    const width = prefs.widths[stage.id];
    const style = width && !prefs.expanded ? ' style="flex-basis:' + width + 'px;width:' + width + 'px"' : '';
    return '<div class="kb-column" data-stage="' + stage.id + '"' + style + '><div class="kb-col-head"><div class="kb-col-title"><i style="background:' + esc(stage.color) + '"></i><h3 title="' + esc(stage.description || stage.name) + '">' + esc(stage.name) + '</h3><span class="kb-col-agents"></span><button type="button" class="kb-icon-btn" data-act="column-menu" aria-label="Opções da coluna ' + esc(stage.name) + '">' + icon('dots', 16) + '</button></div>' +
      '<div class="kb-col-meta"><span data-role="value">—</span><span data-role="count">Carregando…</span></div></div>' +
      '<div class="kb-col-body" data-role="body"></div><button type="button" class="kb-add" data-act="add-item" data-stage="' + stage.id + '">' + icon('plus', 14) + 'Adicionar</button><div class="kb-resize" title="Arraste para redimensionar"></div></div>';
  }

  function itemsQuery(extra) {
    const params = new URLSearchParams(Object.assign({ funnel_id: state.funnel.id }, extra));
    if (state.q.trim()) params.set('q', state.q.trim());
    if (state.status !== 'all') params.append('statuses[]', state.status);
    return '/kanban_items?' + params.toString();
  }

  async function loadColumn(stageId, page) {
    const column = state.columns[stageId] || (state.columns[stageId] = { items: [], meta: null, token: 0 });
    const token = ++column.token;
    try {
      const data = await api('GET', itemsQuery({ stage_id: stageId, page, sort: prefs.sort[stageId] || 'manual' }));
      if (token !== column.token) return;
      column.items = page > 1 ? column.items.concat(data.items) : data.items;
      column.meta = data.meta;
      paintColumn(stageId);
    } catch (error) {
      if (token === column.token) failed(error);
    }
  }

  function paintColumn(stageId) {
    const element = root && root.querySelector('.kb-column[data-stage="' + stageId + '"]');
    const column = state.columns[stageId];
    if (!element || !column || !column.meta) return;
    const body = element.querySelector('[data-role=body]');
    const scroll = body.scrollTop;
    const total = column.meta.total;
    const words = labelsFor(state.funnel.id);
    element.querySelector('[data-role=count]').textContent = total + ' ' + (total === 1 ? words.item_singular : words.item_plural);
    element.querySelector('[data-role=value]').textContent = column.meta.total_value ? money(column.meta.total_value) : '—';
    const agents = [];
    column.items.forEach((item) => item.agents.forEach((agent) => {
      if (!agents.some((entry) => entry.id === agent.id)) agents.push(agent);
    }));
    element.querySelector('.kb-col-agents').innerHTML = agents.slice(0, 3).map((agent) => avatar(agent, 22)).join('');
    body.innerHTML = column.items.map(cardHtml).join('') + (column.meta.has_more ? '<button type="button" class="kb-more" data-act="load-more">Carregar mais</button>' : '') +
      (column.items.length ? '' : '<p class="kb-col-empty">Nada nesta coluna</p>');
    body.scrollTop = scroll;
  }

  // Escolha do próprio card vale mais que o padrão do quadro.
  function isCollapsed(id) {
    return prefs.collapsed[id] === undefined ? !!prefs.closedByDefault : !!prefs.collapsed[id];
  }

  const cardRow = (iconName, content, title) => '<div class="kb-row"' + (title ? ' title="' + esc(title) + '"' : '') + '>' + icon(iconName, 15) + content + '</div>';

  function checklistRow(item) {
    const total = item.checks_total;
    const rate = total ? Math.round((item.checks_done / total) * 100) : 0;
    const content = total ? '<span class="kb-checkbar"><i style="width:' + rate + '%"></i></span><span class="kb-row-count">' + item.checks_done + '/' + total + '</span>' : '<span class="kb-row-empty">Adicionar checklist</span>';
    return '<button type="button" class="kb-row kb-row-btn" data-act="card-checklist" title="' + (total ? 'Checklist: ' + rate + '% concluído' : 'Criar um checklist para este card') + '">' + icon('checks', 15) + content + '</button>';
  }

  function agentRow(item) {
    const owner = item.agents[0];
    if (!owner) return cardRow('user', '<span>—</span>');
    const extra = item.agents.length > 1 ? ' +' + (item.agents.length - 1) : '';
    return '<div class="kb-row" title="' + esc(item.agents.map((agent) => agent.name).join(', ')) + '">' + avatar(owner, 18) + '<span>' + esc(owner.name + extra) + '</span></div>';
  }

  function cardHtml(item) {
    const collapsed = isCollapsed(item.id);
    const conversation = item.conversation;
    const customer = customerOf(item);
    const head = '<div class="kb-card-top"><h4 title="' + esc(item.title) + '">' + esc(item.title) + '</h4><span class="kb-card-tools">' + priorityBars(item.priority) + '<span class="kb-num">#' + item.id + '</span>' +
      '<button type="button" class="kb-icon-btn is-small kb-done" data-act="card-done" aria-label="Pronto: concluir e tirar do quadro" title="Pronto: concluir e tirar do quadro">' + icon('check', 14) + '</button>' +
      '<button type="button" class="kb-icon-btn is-small" data-act="card-collapse" aria-label="' + (collapsed ? 'Expandir' : 'Recolher') + ' card" title="' + (collapsed ? 'Expandir' : 'Recolher') + '">' + icon('chevron', 14) + '</button>' +
      '<button type="button" class="kb-icon-btn is-small" data-act="card-menu" aria-label="Opções do card">' + icon('dots', 14) + '</button></span></div>';
    const open = '<article class="kb-card' + (collapsed ? ' is-collapsed' : '') + '" data-item="' + item.id + '" data-priority="' + item.priority + '" tabindex="0">' + head;
    if (collapsed) return open + (customer ? '<span class="kb-customer">' + esc(customer) + '</span>' : '') + '</article>';
    const person = customer ? '<div class="kb-card-person">' + avatar(item.contact || { name: customer }, 34) + '<span>' + esc(customer) + '</span></div>' : '';
    const summary = item.description ? '<p class="kb-card-desc">' + esc(item.description) + '</p>' : '';
    const lost = item.status === 'lost' ? '<span class="kb-status is-lost">' + STATUS.lost + '</span>' : '';
    const deadline = dueChip(item) || lost ? '<div class="kb-card-due">' + dueChip(item) + lost + '</div>' : '';
    const labels = item.label_titles.length ? item.label_titles.slice(0, 3).map(chip).join('') + (item.label_titles.length > 3 ? '<span class="kb-label">+' + (item.label_titles.length - 3) + '</span>' : '') : '';
    const unread = conversation && conversation.unread ? '<b>' + (conversation.unread > 99 ? '99+' : conversation.unread) + '</b>' : '';
    const chat = conversation || (item.contact && item.contact.phone) ? '<button type="button" class="kb-icon-btn kb-conv" data-act="open-chat" title="Abrir conversa" aria-label="Abrir conversa">' + icon(conversation && !conversation.whatsapp ? 'chat' : 'whatsapp', 20) + unread + '</button>' : '';
    const activities = item.activities_open;
    const age = shortAge(item.stage_entered_at);
    return open + person + summary + deadline +
      '<div class="kb-card-rows">' + checklistRow(item) + agentRow(item) + cardRow('money', '<span>' + (item.value ? money(item.value) : '—') + (productsOn() && item.products_count ? ' · ' + item.products_count + (item.products_count === 1 ? ' item' : ' itens') : '') + '</span>') +
      cardRow('calendar', '<span>' + (activities ? activities + (activities === 1 ? ' atividade' : ' atividades') : 'Sem atividades') + '</span>') +
      cardRow('clock', '<span>' + esc(age) + '</span>', 'Nesta coluna há ' + age) + '</div>' +
      '<div class="kb-card-side">' + chat + '<button type="button" class="kb-icon-btn" data-act="card-plus" title="Ações" aria-label="Ações do card">' + icon('plus', 18) + '</button></div>' +
      '<div class="kb-card-foot"><div class="kb-card-labels">' + labels + '</div><span class="kb-grow"></span><button type="button" class="kb-icon-btn is-small" data-act="card-labels" title="Etiquetas" aria-label="Etiquetas">' + icon('tag', 15) + '</button></div></article>';
  }

  function findItem(id) {
    for (const key of Object.keys(state.columns)) {
      const found = state.columns[key].items.find((item) => item.id === id);
      if (found) return found;
    }
    return state.list ? state.list.items.find((item) => item.id === id) : null;
  }

  function refreshBoard() {
    if (state.view !== 'board' || !root || !mainEl().querySelector('.kb-board')) return;
    if (state.layout === 'list') loadList(state.list ? state.list.page : 1);
    else visibleStages().forEach((stage) => loadColumn(stage.id, 1));
    api('GET', '/kanban_funnels').then((funnels) => {
      state.funnels = funnels;
      const current = funnels.find((funnel) => state.funnel && funnel.id === state.funnel.id);
      if (current) state.funnel = current;
      const select = root && root.querySelector('[data-field=funnel]');
      if (select) select.innerHTML = funnelSelectOptions();
    }).catch(() => {});
  }

  // ---------- Lista ----------

  async function loadList(page) {
    try {
      const data = await api('GET', itemsQuery({ page, sort: 'newest' }));
      state.list = { items: data.items, meta: data.meta, page };
      paintList();
    } catch (error) {
      failed(error);
    }
  }

  function paintList() {
    const wrap = root && root.querySelector('.kb-list-wrap');
    if (!wrap || !state.list) return;
    const { items, meta, page } = state.list;
    if (!items.length) {
      wrap.innerHTML = '<div class="kb-empty"><h2>Nenhum item encontrado</h2><p>Ajuste a busca ou o status, ou crie um novo item.</p></div>';
      return;
    }
    const rows = items.map((item) => {
      const stage = stageById(item.stage_id);
      return '<tr data-item="' + item.id + '" tabindex="0"><td class="kb-num">#' + item.id + '</td><td class="kb-list-title">' + esc(item.title) + '</td><td>' + esc(customerOf(item) || '—') + '</td><td>' + (dueChip(item) || '—') + '</td>' +
        '<td><span class="kb-stage-chip"><i style="background:' + esc(stage ? stage.color : '#8a8a8a') + '"></i>' + esc(item.stage_name) + '</span></td><td>' + priorityBars(item.priority) + '</td>' +
        '<td><span class="kb-status is-' + item.status + '">' + STATUS[item.status] + '</span></td><td class="kb-right">' + (item.value ? money(item.value) : '—') + '</td>' +
        '<td>' + (item.agents.length ? esc(item.agents.map((agent) => agent.name).join(', ')) : '—') + '</td><td>' + shortAge(item.stage_entered_at) + '</td><td>' + esc(dateOnly(item.updated_at)) + '</td></tr>';
    }).join('');
    wrap.innerHTML = '<div class="kb-table-scroll"><table class="kb-table"><thead><tr><th>Nº</th><th>Título</th><th>' + esc(labelsFor(state.funnel.id).customer) + '</th><th>' + esc(labelsFor(state.funnel.id).due) + '</th><th>Coluna</th><th>Prioridade</th><th>Status</th><th class="kb-right">Valor</th><th>Agentes</th><th>Na etapa</th><th>Atualizado</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="kb-pager"><span>' + meta.total + ' ' + (meta.total === 1 ? labelsFor(state.funnel.id).item_singular : labelsFor(state.funnel.id).item_plural).toLowerCase() + '</span><span class="kb-grow"></span><button type="button" class="kb-btn" data-act="list-page" data-value="' + (page - 1) + '"' + (page <= 1 ? ' disabled' : '') + '>Anterior</button><span>Página ' + page + '</span><button type="button" class="kb-btn" data-act="list-page" data-value="' + (page + 1) + '"' + (meta.has_more ? '' : ' disabled') + '>Próxima</button></div>';
  }

  // ---------- Relatórios ----------

  function isoDay(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }

  function reportPeriod() {
    if (!state.report) {
      const today = new Date();
      state.report = { from: isoDay(new Date(today.getFullYear(), today.getMonth(), 1)), to: isoDay(today), data: null };
    }
    return state.report;
  }

  function reportQuery() {
    const period = reportPeriod();
    return new URLSearchParams({ funnel_id: state.funnel.id, from: period.from, to: period.to }).toString();
  }

  function reportHeaderTools() {
    const period = reportPeriod();
    return '<label class="kb-report-date">De<input type="date" data-field="report-from" value="' + esc(period.from) + '"></label>' +
      '<label class="kb-report-date">até<input type="date" data-field="report-to" value="' + esc(period.to) + '"></label>' +
      '<span class="kb-grow"></span>' +
      '<button type="button" class="kb-btn" data-act="report-csv">' + icon('download', 14) + 'Planilha</button>' +
      '<a class="kb-icon-btn" href="#kanban/funis" title="Gerenciar quadros" aria-label="Gerenciar quadros">' + icon('boards', 18) + '</a>';
  }

  async function loadReport() {
    const token = (state.reportToken = (state.reportToken || 0) + 1);
    try {
      const data = await api('GET', '/kanban_reports?' + reportQuery());
      if (token !== state.reportToken || state.layout !== 'report') return;
      reportPeriod().data = data;
      paintReport(data);
    } catch (error) {
      const box = mainEl().querySelector('.kb-report');
      if (box) box.innerHTML = '<p class="kb-loading">' + esc(error.message) + '</p>';
    }
  }

  function days(value) {
    if (value === null || value === undefined) return '—';
    return String(value).replace('.', ',') + (Number(value) === 1 ? ' dia' : ' dias');
  }

  function bar(count, max, color) {
    const width = max > 0 ? Math.max(count > 0 ? 3 : 0, Math.round((count * 100) / max)) : 0;
    return '<span class="kb-report-bar"><i style="width:' + width + '%;' + (color ? 'background:' + esc(color) : '') + '"></i></span>';
  }

  function paintReport(data) {
    const box = mainEl().querySelector('.kb-report');
    if (!box) return;
    const totals = data.totals;
    const labels = labelsFor(state.funnel.id);
    const tiles = [
      ['Em andamento', totals.in_progress, money(totals.in_progress_value)],
      ['Atrasados', totals.late, totals.late ? 'prazo vencido' : 'nenhum atraso', totals.late ? 'is-bad' : ''],
      ['Sem responsável', totals.without_agent, 'em andamento', totals.without_agent ? 'is-warn' : ''],
      ['Concluídos no período', totals.finished, money(totals.finished_value)],
      ['Ticket médio', money(totals.average_ticket), 'por ' + labels.item_singular.toLowerCase() + ' concluído'],
      ['Tempo médio até concluir', days(totals.cycle_days), totals.lost ? totals.lost + ' perdido(s) no período' : 'nenhum perdido'],
    ].map((tile) => '<div class="kb-report-tile ' + (tile[3] || '') + '"><span>' + esc(tile[0]) + '</span><strong>' + esc(tile[1]) + '</strong><small>' + esc(tile[2]) + '</small></div>').join('');
    const goal = data.goal;
    const goalPercent = goal.percent === null || goal.percent === undefined ? null : goal.percent;
    const goalHtml = '<section class="kb-report-card kb-report-goal"><header><h3>Meta de ' + esc(monthName(goal.month)) + '</h3>' +
      (state.funnel.can_manage ? '<button type="button" class="kb-btn" data-act="report-goal">' + (goal.target ? 'Alterar meta' : 'Definir meta') + '</button>' : '') + '</header>' +
      (goal.target ? '<p><strong>' + money(goal.reached) + '</strong> de ' + money(goal.target) + ' concluídos (' + goalPercent + '%)</p>' + bar(Math.min(goal.reached, goal.target), goal.target) :
        '<p class="kb-report-muted">Sem meta para este mês. Concluído até agora: ' + money(goal.reached) + '.</p>') + '</section>';
    const maxStage = Math.max(1, ...data.stages.map((stage) => stage.count));
    const stagesHtml = '<section class="kb-report-card"><header><h3>Por etapa</h3><small>em andamento agora</small></header><table class="kb-report-table"><thead><tr><th>Etapa</th><th></th><th class="kb-right">Qtd.</th><th class="kb-right">Valor</th><th class="kb-right">Atrasados</th><th class="kb-right">Parado em média</th></tr></thead><tbody>' +
      data.stages.map((stage) => '<tr><td><i class="kb-report-dot" style="background:' + esc(stage.color) + '"></i>' + esc(stage.name) + (stage.done ? ' <span class="kb-pill">conclusão</span>' : '') + '</td><td class="kb-report-bar-cell">' + (stage.done ? '' : bar(stage.count, maxStage, stage.color)) + '</td>' +
        '<td class="kb-right">' + (stage.done ? '—' : stage.count) + '</td><td class="kb-right">' + (stage.done ? '—' : money(stage.value)) + '</td><td class="kb-right' + (stage.late ? ' kb-report-bad' : '') + '">' + (stage.done ? '—' : stage.late) + '</td><td class="kb-right">' + (stage.done ? '—' : days(stage.waiting_days)) + '</td></tr>').join('') +
      '</tbody></table></section>';
    const maxPriority = Math.max(1, ...data.priorities.map((row) => row.count));
    const prioritiesHtml = '<section class="kb-report-card"><header><h3>Por prioridade</h3></header>' +
      data.priorities.map((row) => '<div class="kb-report-row"><span>' + esc(row.name) + '</span>' + bar(row.count, maxPriority) + '<b>' + row.count + '</b></div>').join('') + '</section>';
    const agentsHtml = '<section class="kb-report-card"><header><h3>Por pessoa</h3></header>' + (data.agents.length ?
      '<div class="kb-report-scroll"><table class="kb-report-table"><thead><tr><th>Pessoa</th><th class="kb-right">Abertos</th><th class="kb-right">Atrasados</th><th class="kb-right">Concluídos</th></tr></thead><tbody>' +
      data.agents.map((row) => '<tr><td>' + esc(row.name) + '</td><td class="kb-right">' + row.in_progress + '</td><td class="kb-right' + (row.late ? ' kb-report-bad' : '') + '">' + row.late + '</td><td class="kb-right">' + row.finished + '</td></tr>').join('') + '</tbody></table></div>' :
      '<p class="kb-report-muted">Nenhum responsável atribuído aos cartões deste período.</p>') + '</section>';
    const checks = data.checklist;
    const checklistHtml = '<section class="kb-report-card"><header><h3>Checklist</h3><small>dos cartões em andamento</small></header>' + (checks.total ?
      '<p><strong>' + checks.done + '</strong> de ' + checks.total + ' tarefas feitas (' + checks.rate + '%)</p>' + bar(checks.done, checks.total) :
      '<p class="kb-report-muted">Nenhuma tarefa de checklist nos cartões em andamento.</p>') + '</section>';
    const productsHtml = !data.products ? '' : '<section class="kb-report-card"><header><h3>Principais produtos e serviços</h3><small>em andamento e concluídos no período</small></header>' + (data.products.length ?
      '<div class="kb-report-scroll"><table class="kb-report-table"><thead><tr><th>Produto ou serviço</th><th class="kb-right">Quantidade</th><th class="kb-right">Cards</th><th class="kb-right">Total</th></tr></thead><tbody>' +
      data.products.map((row) => '<tr><td>' + esc(row.name) + '</td><td class="kb-right">' + quantityText(row.quantity) + '</td><td class="kb-right">' + row.cards + '</td><td class="kb-right">' + money(row.total) + '</td></tr>').join('') + '</tbody></table></div>' :
      '<p class="kb-report-muted">Nenhum card do período tem itens de produto ou serviço.</p>') + '</section>';
    box.innerHTML = '<div class="kb-report-tiles">' + tiles + '</div>' + goalHtml + stagesHtml + productsHtml + agentsHtml + '<div class="kb-report-grid">' + prioritiesHtml + checklistHtml + '</div>';
  }

  function monthName(month) {
    const parts = String(month || '').split('-');
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
    return Number.isNaN(date.getTime()) ? month : date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  async function downloadReport() {
    const headers = authHeaders();
    if (!headers) throw new Error('Sua sessão expirou. Entre novamente.');
    delete headers['Content-Type'];
    headers.Accept = 'text/csv';
    const response = await fetch('/api/v1/accounts/' + accountId() + '/kanban_reports/export?' + reportQuery(), { credentials: 'same-origin', headers });
    if (!response.ok) throw new Error('Não foi possível gerar a planilha.');
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'relatorio-' + state.funnel.name.toLowerCase().replace(/[^a-z0-9]+/gi, '-') + '-' + reportPeriod().from + '.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 4000);
  }

  function openGoalDialog() {
    const goal = reportPeriod().data && reportPeriod().data.goal;
    if (!goal) return;
    openDialog({
      title: 'Meta de ' + monthName(goal.month), submit: 'Salvar', narrow: true,
      body: '<label class="kb-field">Valor concluído esperado no mês<input name="goal" inputmode="decimal" placeholder="R$ 0,00" value="' + (goal.target ? esc(money(goal.target)) : '') + '"></label>' +
        '<p class="kb-report-muted">Conta o valor dos cartões concluídos no mês. Deixe vazio para tirar a meta.</p>',
      onSubmit: async (form) => {
        const text = form.querySelector('[name=goal]').value.trim();
        const data = await api('PATCH', '/kanban_reports/goal', { funnel_id: state.funnel.id, month: goal.month, value: text ? parseMoney(text) : null });
        reportPeriod().data = data;
        paintReport(data);
        toast(text ? 'Meta salva.' : 'Meta retirada.');
      },
    });
  }

  // ---------- Eventos do quadro ----------

  function onRootInput(event) {
    if (event.target.getAttribute('data-field') !== 'search') return;
    state.q = event.target.value;
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(renderContent, 300);
  }

  function onRootChange(event) {
    const field = event.target.getAttribute('data-field');
    if (field === 'report-from' || field === 'report-to') {
      if (!event.target.value) return;
      reportPeriod()[field === 'report-from' ? 'from' : 'to'] = event.target.value;
      renderContent();
      return;
    }
    if (field !== 'funnel') return;
    state.funnel = state.funnels.find((funnel) => funnel.id === Number(event.target.value));
    prefs.funnelId = state.funnel.id;
    prefs.expanded = null;
    savePrefs();
    renderContent();
  }

  function onRootClick(event) {
    if (event.target.closest('[data-stop]')) return;
    const action = event.target.closest('[data-act]');
    if (action) {
      event.preventDefault();
      event.stopPropagation();
      handleAction(action.getAttribute('data-act'), action);
      return;
    }
    const target = event.target.closest('[data-item]');
    if (target) window.location.hash = '#kanban/item/' + target.getAttribute('data-item');
  }

  function columnStageId(element) {
    return Number(element.closest('.kb-column').getAttribute('data-stage'));
  }

  function itemIdFrom(element) {
    return Number(element.closest('[data-item]').getAttribute('data-item'));
  }

  function handleAction(name, element) {
    if (name === 'layout') {
      prefs.layout = element.getAttribute('data-value');
      savePrefs();
      renderBoard();
    } else if (name === 'report-csv') {
      element.disabled = true;
      downloadReport().catch((error) => toast(error.message, 'error')).finally(() => { element.disabled = false; });
    } else if (name === 'report-goal') {
      openGoalDialog();
    } else if (name === 'status-menu') {
      openMenu(element, STATUS_FILTERS.map((entry) => ({ label: entry[1], active: state.status === entry[0], run: () => { state.status = entry[0]; renderBoard(); } })));
    } else if (name === 'top-menu') {
      topMenu(element);
    } else if (name === 'add-item') {
      itemDialog({ stageId: Number(element.getAttribute('data-stage')) || (state.funnel.stages[0] && state.funnel.stages[0].id) });
    } else if (name === 'column-menu') {
      columnMenu(element, columnStageId(element));
    } else if (name === 'load-more') {
      const stageId = columnStageId(element);
      loadColumn(stageId, state.columns[stageId].meta.page + 1);
    } else if (name === 'card-done') {
      finishItem(findItem(itemIdFrom(element)), element);
    } else if (name === 'card-collapse') {
      const id = itemIdFrom(element);
      prefs.collapsed[id] = isCollapsed(id) ? 0 : 1;
      savePrefs();
      paintColumn(columnStageId(element));
    } else if (name === 'card-checklist') {
      pendingCheckFocus = itemIdFrom(element);
      window.location.hash = '#kanban/item/' + pendingCheckFocus;
    } else if (name === 'card-mode') {
      prefs.closedByDefault = !prefs.closedByDefault;
      prefs.collapsed = {};
      savePrefs();
      element.querySelector('span').textContent = prefs.closedByDefault ? 'Fechados' : 'Abertos';
      visibleStages().forEach((stage) => paintColumn(stage.id));
    } else if (name === 'card-menu') {
      cardMenu(element, findItem(itemIdFrom(element)));
    } else if (name === 'card-plus') {
      cardActions(element, findItem(itemIdFrom(element)));
    } else if (name === 'open-chat') {
      openChat(itemIdFrom(element));
    } else if (name === 'card-labels') {
      labelsPopover(element, findItem(itemIdFrom(element)));
    } else if (name === 'list-page') {
      loadList(Number(element.getAttribute('data-value')));
    } else if (name === 'add-column') {
      addBoardColumn();
    } else if (name === 'funnel-archived') {
      showArchivedFunnels();
    } else if (name === 'funnel-default') {
      runFunnel(() => api('POST', '/kanban_funnels/' + funnelIdFrom(element) + '/set_default'), 'Quadro padrão definido');
    } else if (name === 'funnel-duplicate') {
      runFunnel(() => api('POST', '/kanban_funnels/' + funnelIdFrom(element) + '/duplicate'), 'Quadro duplicado');
    } else if (name === 'funnel-delete') {
      deleteFunnel(funnelIdFrom(element));
    } else if (name.indexOf('editor-') === 0) {
      editorAction(name, element);
    }
  }

  function topMenu(anchor) {
    const items = [];
    if (state.funnel.can_manage) items.push({ label: 'Configurar quadro', run: () => { window.location.hash = '#kanban/funis/' + state.funnel.id; } });
    items.push({ label: labelsFor(state.funnel.id).item_plural + ' arquivados', run: showArchivedItems });
    if (productsOn()) items.push({ label: 'Produtos e serviços', hint: state.isAdmin ? 'Catálogo com preços' : 'Consultar catálogo', run: openCatalogDialog });
    if (prefs.expanded) items.push({ label: 'Mostrar todas as colunas', run: () => { prefs.expanded = null; savePrefs(); renderContent(); } });
    state.funnel.stages.filter((stage) => prefs.hidden[stage.id]).forEach((stage) => {
      items.push({ label: 'Mostrar coluna: ' + stage.name, run: () => { delete prefs.hidden[stage.id]; savePrefs(); renderContent(); } });
    });
    openMenu(anchor, items);
  }

  // Catálogo de produtos e serviços: todos consultam, só o administrador altera.
  function openCatalogDialog() {
    let products = [];
    let term = '';
    const layer = openDialog({ title: 'Produtos e serviços', submit: 'Fechar', body: '<div class="kb-catalog" data-catalog><p class="kb-loading">Carregando…</p></div>', onSubmit: async () => {} });
    layer.querySelector('form').classList.add('kb-dialog-wide');
    const box = layer.querySelector('[data-catalog]');
    const fields = '<div class="kb-catalog-add"><label class="kb-field">Nome<input data-new="name" maxlength="120" placeholder="Ex.: Lente multifocal"></label><label class="kb-field">Código<input data-new="code" maxlength="60" placeholder="Opcional"></label>' +
      '<label class="kb-field">Un.<input data-new="unit" maxlength="20" value="un"></label><label class="kb-field">Preço (R$)<input data-new="price" inputmode="decimal" placeholder="0,00"></label><button type="button" class="kb-btn is-primary" data-catalog-act="add">Incluir</button></div>';
    const paint = () => {
      const wanted = term.toLowerCase();
      const shown = products.filter((product) => !wanted || product.name.toLowerCase().indexOf(wanted) !== -1 || String(product.code || '').toLowerCase().indexOf(wanted) !== -1);
      const rows = shown.map((product) => '<tr class="' + (product.active ? '' : 'is-off') + '"><td>' + esc(product.name) + (product.active ? '' : ' <span class="kb-pill">desativado</span>') + '</td><td>' + esc(product.code || '—') + '</td><td>' + esc(product.unit) + '</td><td class="kb-right">' + money(product.price) + '</td>' +
        (state.isAdmin ? '<td class="kb-right kb-nowrap"><button type="button" class="kb-icon-btn is-small" data-catalog-act="edit" data-id="' + product.id + '" aria-label="Alterar ' + esc(product.name) + '">' + icon('edit', 14) + '</button>' +
          (product.active ? '<button type="button" class="kb-icon-btn is-small" data-catalog-act="off" data-id="' + product.id + '" aria-label="Desativar ' + esc(product.name) + '">' + icon('trash', 14) + '</button>' : '<button type="button" class="kb-btn is-small" data-catalog-act="on" data-id="' + product.id + '">Reativar</button>') + '</td>' : '') + '</tr>').join('');
      box.innerHTML = '<label class="kb-field kb-catalog-search"><input type="search" data-catalog-search placeholder="Buscar por nome ou código" value="' + esc(term) + '" aria-label="Buscar no catálogo"></label>' +
        (shown.length ? '<div class="kb-table-scroll"><table class="kb-table kb-lines"><thead><tr><th>Nome</th><th>Código</th><th>Un.</th><th class="kb-right">Preço</th>' + (state.isAdmin ? '<th></th>' : '') + '</tr></thead><tbody>' + rows + '</tbody></table></div>' :
          '<p class="kb-empty-small">' + (products.length ? 'Nada encontrado.' : 'O catálogo está vazio.' + (state.isAdmin ? ' Inclua o primeiro produto ou serviço abaixo.' : ' Peça ao administrador para cadastrar.')) + '</p>') +
        (state.isAdmin ? fields : '');
      const search = box.querySelector('[data-catalog-search]');
      if (search && document.activeElement === document.body) search.focus();
    };
    const load = async () => {
      products = (await api('GET', '/crm_products' + (state.isAdmin ? '?all=1' : ''))).products;
      state.catalog = null;
      paint();
    };
    const save = async (method, path, body) => {
      await api(method, '/crm_products' + path, body);
      await load();
    };
    box.addEventListener('input', (event) => {
      if (!event.target.hasAttribute('data-catalog-search')) return;
      term = event.target.value;
      const position = event.target.selectionStart;
      paint();
      const field = box.querySelector('[data-catalog-search]');
      field.focus();
      field.setSelectionRange(position, position);
    });
    box.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' || !event.target.closest('.kb-catalog-add, [data-catalog-search]')) return;
      event.preventDefault();
      if (event.target.closest('.kb-catalog-add')) box.querySelector('[data-catalog-act=add]').click();
    });
    box.addEventListener('click', (event) => {
      const button = event.target.closest('[data-catalog-act]');
      if (!button) return;
      const action = button.getAttribute('data-catalog-act');
      const product = products.find((entry) => String(entry.id) === button.getAttribute('data-id'));
      if (action === 'add') {
        const value = (name) => box.querySelector('[data-new=' + name + ']').value.trim();
        if (!value('name')) { failed(new Error('Informe o nome.')); return; }
        save('POST', '', { name: value('name'), code: value('code'), unit: value('unit') || 'un', price: parseMoney(value('price')) }).then(() => toast('Incluído no catálogo')).catch(failed);
      } else if (action === 'off') {
        confirmAction('Desativar', '"' + product.name + '" sai da lista de escolha. Pedidos que já usam continuam iguais.', 'Desativar', () => save('DELETE', '/' + product.id));
      } else if (action === 'on') {
        save('PATCH', '/' + product.id, { active: true }).catch(failed);
      } else if (action === 'edit') {
        openDialog({
          title: 'Alterar produto ou serviço', narrow: true,
          body: '<label class="kb-field">Nome<input name="name" maxlength="120" value="' + esc(product.name) + '"></label><div class="kb-grid-2"><label class="kb-field">Código<input name="code" maxlength="60" value="' + esc(product.code || '') + '"></label><label class="kb-field">Unidade<input name="unit" maxlength="20" value="' + esc(product.unit) + '"></label></div>' +
            '<label class="kb-field">Preço (R$)<input name="price" inputmode="decimal" value="' + esc(String(product.price.toFixed(2)).replace('.', ',')) + '"></label><p class="kb-muted">Mudar o preço aqui não altera pedidos já feitos.</p>',
          onSubmit: async (form) => {
            const name = form.querySelector('[name=name]').value.trim();
            if (!name) throw new Error('Informe o nome.');
            await save('PATCH', '/' + product.id, { name, code: form.querySelector('[name=code]').value.trim(), unit: form.querySelector('[name=unit]').value.trim() || 'un', price: parseMoney(form.querySelector('[name=price]').value) });
          },
        });
      }
    });
    load().catch((error) => { box.innerHTML = '<p class="kb-empty-small">' + esc(error.message) + '</p>'; });
  }

  async function showArchivedItems() {
    try {
      const data = await api('GET', '/kanban_items?funnel_id=' + state.funnel.id + '&archived=1&sort=newest');
      const body = data.items.length ? '<div class="kb-archive">' + data.items.map((item) => '<div><span>#' + item.id + ' ' + esc(item.title) + '</span><button type="button" class="kb-btn" data-restore="' + item.id + '">Restaurar</button></div>').join('') + '</div>' : '<p class="kb-empty-small">Nada arquivado neste quadro.</p>';
      const layer = openDialog({ title: 'Arquivados', narrow: true, submit: 'Fechar', body, onSubmit: () => {} });
      layer.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-restore]');
        if (!button) return;
        try {
          await api('POST', '/kanban_items/' + button.getAttribute('data-restore') + '/restore');
          closeDialog(layer);
          toast('Restaurado');
          refreshBoard();
        } catch (error) {
          failed(error);
        }
      });
    } catch (error) {
      failed(error);
    }
  }

  function columnMenu(anchor, stageId) {
    const column = state.columns[stageId];
    const allCollapsed = column && column.items.length && column.items.every((item) => isCollapsed(item.id));
    const stage = stageById(stageId);
    const items = [];
    if (state.funnel.can_manage) items.push({ label: 'Editar coluna', hint: 'Nome, cor e comportamento', run: () => editBoardColumn(stage) });
    items.push({ label: 'Ocultar coluna', run: () => { prefs.hidden[stageId] = 1; prefs.expanded = null; savePrefs(); renderContent(); } });
    items.push({ label: 'Ordenar', run: () => sortMenu(anchor, stageId) });
    items.push({ label: allCollapsed ? 'Expandir cards' : 'Recolher cards', run: () => {
      (column ? column.items : []).forEach((item) => { prefs.collapsed[item.id] = allCollapsed ? 0 : 1; });
      savePrefs();
      paintColumn(stageId);
    } });
    items.push({ label: prefs.expanded === stageId ? 'Recolher coluna' : 'Expandir coluna', run: () => { prefs.expanded = prefs.expanded === stageId ? null : stageId; savePrefs(); renderContent(); } });
    if (state.funnel.can_manage) items.push({ label: 'Excluir coluna', danger: true, run: () => removeBoardColumn(stage) });
    openMenu(anchor, items);
  }

  function sortMenu(anchor, stageId) {
    const current = prefs.sort[stageId] || 'manual';
    window.setTimeout(() => openMenu(anchor, SORTS.map((entry) => ({ label: entry[1], active: current === entry[0], run: () => { prefs.sort[stageId] = entry[0]; savePrefs(); loadColumn(stageId, 1); } }))), 0);
  }

  function cardMenu(anchor, item) {
    if (!item) return;
    openMenu(anchor, [
      { label: 'Abrir', run: () => { window.location.hash = '#kanban/item/' + item.id; } },
      { label: 'Editar', run: () => itemDialog({ item }) },
      { label: 'Mudar Status', run: () => statusDialog(item) },
      { label: 'Mover', run: () => moveDialog(item) },
    ]);
  }

  function cardActions(anchor, item) {
    if (!item) return;
    const items = [{ label: 'Pronto', hint: 'Conclui e tira do quadro', run: () => finishItem(item) }, { label: 'Mover', hint: 'Para outra coluna ou quadro', run: () => moveDialog(item) }];
    if (window.crmSchedule && window.crmSchedule.enabled() && item.contact && item.conversation) {
      items.push({ label: 'Agendar mensagem', hint: 'Pela conversa deste card', run: () => window.crmSchedule.open({ title: item.title, inboxId: item.conversation.inbox_id, contacts: [{ id: item.contact.id, name: item.contact.name }], kanbanItemId: item.id }) });
    }
    if (item.status !== 'won') items.push({ label: 'Marcar como ganho', run: () => setStatus(item, 'won') });
    if (item.status !== 'lost') items.push({ label: 'Marcar como perdido', run: () => setStatus(item, 'lost') });
    if (item.status !== 'open') items.push({ label: 'Reabrir', run: () => setStatus(item, 'open') });
    items.push({ label: 'Arquivar', hint: 'Você pode restaurar depois', danger: true, run: () => deleteItem(item) });
    openMenu(anchor, items);
  }

  function labelsPopover(anchor, item) {
    if (!item) return;
    const options = state.labels.map((label) => ({ value: label.title, label: label.title, color: label.color }));
    openChecklistPopover(anchor, options, item.label_titles, async (values) => {
      try {
        await api('PATCH', '/kanban_items/' + item.id, { label_titles: values });
        afterItemChange(item.id);
      } catch (error) {
        failed(error);
      }
    }, 'Adicionar etiquetas');
  }

  async function setStatus(item, status) {
    try {
      await api('POST', '/kanban_items/' + item.id + '/change_status', { status });
      toast('Status alterado para ' + STATUS[status]);
      afterItemChange(item.id);
    } catch (error) {
      failed(error);
    }
  }

  async function finishItem(item, button) {
    if (!item) return;
    if (button) button.disabled = true;
    try {
      await api('POST', '/kanban_items/' + item.id + '/finish');
      toast('Pronto. Fica registrado no calendário e em Arquivados.');
      if (state.drawer && state.drawer.id === item.id) closeDrawer();
      refreshBoard();
    } catch (error) {
      if (button) button.disabled = false;
      failed(error);
    }
  }

  function deleteItem(item) {
    confirmAction('Arquivar', '"' + item.title + '" sai do quadro, com notas e histórico guardados. Você pode restaurar depois.', 'Arquivar', async () => {
      await api('DELETE', '/kanban_items/' + item.id);
      toast('Arquivado');
      if (state.drawer && state.drawer.id === item.id) closeDrawer();
      refreshBoard();
    });
  }

  function afterItemChange(id) {
    refreshBoard();
    if (state.drawer && state.drawer.id === id) openDrawer(id, true);
  }

  // ---------- Formulários do item ----------

  function funnelOptions(selected) {
    return state.funnels.map((funnel) => '<option value="' + funnel.id + '"' + (funnel.id === selected ? ' selected' : '') + '>' + esc(funnel.name) + '</option>').join('');
  }

  function stageOptions(funnelId, selected) {
    const funnel = state.funnels.find((entry) => entry.id === funnelId);
    return (funnel ? funnel.stages : []).map((stage) => '<option value="' + stage.id + '"' + (stage.id === selected ? ' selected' : '') + '>' + esc(stage.name) + '</option>').join('');
  }

  function bindFunnelStage(form) {
    const funnel = form.querySelector('[name=funnel_id]');
    const stage = form.querySelector('[name=stage_id]');
    funnel.addEventListener('change', () => { stage.innerHTML = stageOptions(Number(funnel.value)); });
  }

  function checkBoxes(name, options, selected) {
    if (!options.length) return '<p class="kb-empty-small">Nenhuma opção cadastrada.</p>';
    return '<div class="kb-check-list is-field">' + options.map((option) => '<label class="kb-check"><input type="checkbox" name="' + name + '" value="' + esc(option.value) + '"' + (selected.indexOf(option.value) !== -1 ? ' checked' : '') + '>' + (option.color ? '<i style="background:' + esc(option.color) + '"></i>' : '') + '<span>' + esc(option.label) + '</span></label>').join('') + '</div>';
  }

  const checked = (form, name) => Array.from(form.querySelectorAll('[name="' + name + '"]:checked')).map((input) => input.value);

  function agentOptions() {
    return state.agents.map((agent) => ({ value: String(agent.id), label: agent.available_name || agent.name }));
  }

  function itemFields(item, stageId) {
    const stage = item ? stageById(item.stage_id) : stageById(stageId);
    const funnelId = item ? item.funnel_id : (stage ? stage.kanban_funnel_id : state.funnel.id) || state.funnel.id;
    const priorities = PRIORITIES.map((entry) => '<option value="' + entry[0] + '"' + ((item ? item.priority : 0) === entry[0] ? ' selected' : '') + '>' + entry[1] + '</option>').join('');
    const selectedAgents = item ? item.agents.map((agent) => String(agent.id)) : [String(currentUserId())];
    const location = item ? '' : '<div class="kb-grid-2"><label class="kb-field">Quadro<select name="funnel_id">' + funnelOptions(funnelId) + '</select></label><label class="kb-field">Coluna<select name="stage_id">' + stageOptions(funnelId, stageId) + '</select></label></div>';
    const contact = item ? '' : '<div class="kb-field kb-contact-field">Contato<input type="search" name="contact_search" autocomplete="off" placeholder="Buscar por nome ou telefone (opcional)"><input type="hidden" name="contact_id"><div class="kb-suggest" hidden></div></div>';
    const description = item ? item.description || '' : '';
    const words = labelsFor(funnelId);
    return location +
      '<label class="kb-field">Título<input name="title" required maxlength="255" placeholder="O que precisa ser feito" value="' + esc(item ? item.title : '') + '"></label>' + contact +
      '<div class="kb-grid-2"><label class="kb-field">' + esc(words.customer) + '<input name="customer_name" maxlength="255" placeholder="Sem cadastro? Escreva aqui" value="' + esc(item ? item.customer_name || '' : '') + '"></label><label class="kb-field">' + esc(words.due) + '<input type="date" name="due_on" value="' + esc(item && item.due_on ? item.due_on : '') + '"></label></div>' +
      '<div class="kb-grid-2"><label class="kb-field">Prioridade<select name="priority">' + priorities + '</select></label><label class="kb-field">Valor (R$)' + (hasProductLines(item) ? ' · soma dos itens' : '') + '<input name="value" inputmode="decimal" placeholder="0,00" value="' + (item && item.value ? esc(String(item.value).replace('.', ',')) : '') + '"' + (hasProductLines(item) ? ' readonly title="Com itens no pedido, o valor é a soma deles"' : '') + '></label></div>' +
      '<label class="kb-field">Descrição<textarea name="description" rows="3" maxlength="5000">' + esc(description) + '</textarea><small class="kb-counter">' + description.length + ' / 5000</small></label>' +
      '<label class="kb-field">Data e hora do agendamento<input type="datetime-local" name="scheduled_at" value="' + esc(toLocalInput(item && item.scheduled_at)) + '"></label>' +
      '<div class="kb-field">Etiquetas' + checkBoxes('labels', state.labels.map((label) => ({ value: label.title, label: label.title, color: label.color })), item ? item.label_titles : []) + '</div>' +
      '<div class="kb-field">Agentes' + checkBoxes('agents', agentOptions(), selectedAgents) + '</div>';
  }

  function currentUserId() {
    const cookie = window.chatwootConfig && window.chatwootConfig.currentUser;
    if (cookie && cookie.id) return cookie.id;
    const me = state.agents.find((agent) => {
      const headers = authHeaders();
      return headers && agent.email === headers.uid;
    });
    return me ? me.id : '';
  }

  function itemPayload(form) {
    const scheduled = form.querySelector('[name=scheduled_at]').value;
    const title = form.querySelector('[name=title]').value.trim();
    if (!title) throw new Error('Informe o título.');
    return {
      title, customer_name: form.querySelector('[name=customer_name]').value.trim(), due_on: form.querySelector('[name=due_on]').value || null, description: form.querySelector('[name=description]').value, priority: Number(form.querySelector('[name=priority]').value),
      value: parseMoney(form.querySelector('[name=value]').value), scheduled_at: scheduled ? new Date(scheduled).toISOString() : null,
      label_titles: checked(form, 'labels'), agent_ids: checked(form, 'agents').map(Number),
    };
  }

  function bindItemForm(form) {
    const description = form.querySelector('[name=description]');
    const counter = form.querySelector('.kb-counter');
    description.addEventListener('input', () => { counter.textContent = description.value.length + ' / 5000'; });
    bindContactSearch(form);
  }

  function bindContactSearch(form) {
    const search = form.querySelector('[name=contact_search]');
    if (!search) return;
    const hidden = form.querySelector('[name=contact_id]');
    const list = form.querySelector('.kb-suggest');
    let timer = 0;
    search.addEventListener('input', () => {
      hidden.value = '';
      window.clearTimeout(timer);
      const term = search.value.trim();
      if (term.length < 2) { list.hidden = true; return; }
      timer = window.setTimeout(async () => {
        try {
          const data = await api('GET', '/contacts/search?q=' + encodeURIComponent(term) + '&page=1');
          const contacts = (data.payload || []).slice(0, 6);
          list.innerHTML = contacts.length ? contacts.map((contact) => '<button type="button" data-contact="' + contact.id + '" data-name="' + esc(contact.name) + '">' + avatar({ name: contact.name, thumbnail: contact.thumbnail }, 24) + '<span>' + esc(contact.name) + '</span><small>' + esc(contact.phone_number || contact.email || '') + '</small></button>').join('') : '<p class="kb-empty-small">Nenhum contato encontrado.</p>';
          list.hidden = false;
        } catch (error) {
          list.hidden = true;
        }
      }, 280);
    });
    list.addEventListener('click', (event) => {
      const button = event.target.closest('[data-contact]');
      if (!button) return;
      hidden.value = button.getAttribute('data-contact');
      search.value = button.getAttribute('data-name');
      list.hidden = true;
    });
  }

  function itemDialog({ item, stageId }) {
    openDialog({
      title: item ? 'Editar' : labelsFor(state.funnel.id).item_singular,
      submit: item ? 'Salvar' : 'Criar',
      body: itemFields(item, stageId),
      onOpen: (form) => { bindItemForm(form); if (!item) bindFunnelStage(form); },
      onSubmit: async (form) => {
        const payload = itemPayload(form);
        if (item) {
          await api('PATCH', '/kanban_items/' + item.id, payload);
          toast('Atualizado');
          afterItemChange(item.id);
        } else {
          const stage = Number(form.querySelector('[name=stage_id]').value);
          if (!stage) throw new Error('Escolha uma coluna.');
          const contact = form.querySelector('[name=contact_id]').value;
          await api('POST', '/kanban_items', Object.assign(payload, { stage_id: stage }, contact ? { contact_id: Number(contact) } : {}));
          toast('Criado');
          refreshBoard();
        }
      },
    });
  }

  function moveDialog(item) {
    openDialog({
      title: 'Mover', narrow: true, submit: 'Mover',
      body: '<label class="kb-field">Quadro<select name="funnel_id">' + funnelOptions(item.funnel_id) + '</select></label><label class="kb-field">Coluna<select name="stage_id">' + stageOptions(item.funnel_id, item.stage_id) + '</select></label>',
      onOpen: bindFunnelStage,
      onSubmit: async (form) => {
        await api('POST', '/kanban_items/' + item.id + '/move', { stage_id: Number(form.querySelector('[name=stage_id]').value) });
        toast('Movido');
        afterItemChange(item.id);
      },
    });
  }

  function statusDialog(item) {
    const radios = Object.keys(STATUS).map((key) => '<label class="kb-check"><input type="radio" name="status" value="' + key + '"' + (item.status === key ? ' checked' : '') + '><span>' + (key === 'open' ? 'Em aberto' : STATUS[key]) + '</span></label>').join('');
    openDialog({
      title: 'Alterar Status', narrow: true, body: '<div class="kb-check-list is-field">' + radios + '</div>',
      onSubmit: async (form) => {
        await api('POST', '/kanban_items/' + item.id + '/change_status', { status: form.querySelector('[name=status]:checked').value });
        afterItemChange(item.id);
      },
    });
  }

  // ---------- Arrastar ----------

  function initSortables() {
    if (!window.Sortable || !root) return;
    root.querySelectorAll('.kb-col-body').forEach((body) => {
      if (body.getAttribute('data-sortable')) return;
      body.setAttribute('data-sortable', '1');
      window.Sortable.create(body, {
        group: 'kb-cards', draggable: '.kb-card', animation: 170, ghostClass: 'kb-ghost', dragClass: 'kb-dragging', forceFallback: true, fallbackTolerance: 4,
        delay: 220, delayOnTouchOnly: true, touchStartThreshold: 6, scroll: true, scrollSensitivity: 70, scrollSpeed: 14, bubbleScroll: true,
        emptyInsertThreshold: 28, filter: 'button, a', preventOnFilter: false, onEnd: onCardDrop,
      });
    });
    const columns = root.querySelector('.kb-columns');
    if (columns && state.funnel.can_manage && !prefs.expanded && !columns.getAttribute('data-sortable')) {
      columns.setAttribute('data-sortable', '1');
      window.Sortable.create(columns, { draggable: '.kb-column', handle: '.kb-col-title h3', animation: 170, ghostClass: 'kb-ghost', forceFallback: true, direction: 'horizontal', onEnd: onColumnDrop });
    }
  }

  async function onCardDrop(event) {
    const id = Number(event.item.getAttribute('data-item'));
    const from = Number(event.from.closest('.kb-column').getAttribute('data-stage'));
    const to = Number(event.to.closest('.kb-column').getAttribute('data-stage'));
    if (from === to && event.oldDraggableIndex === event.newDraggableIndex) return;
    const source = state.columns[from];
    const target = state.columns[to];
    const item = source && source.items.find((entry) => entry.id === id);
    if (!item || !target) return;
    const others = target.items.filter((entry) => entry.id !== id);
    const index = Math.min(event.newDraggableIndex, others.length);
    const previous = others[index - 1];
    const following = others[index];
    let position = 1;
    if (previous && following) position = (previous.position + following.position) / 2;
    else if (previous) position = previous.position + 1024;
    else if (following) position = following.position - 1024;
    const manual = (prefs.sort[to] || 'manual') === 'manual';
    source.items = source.items.filter((entry) => entry.id !== id);
    const stage = stageById(to);
    item.stage_id = to;
    item.stage_name = stage.name;
    item.done_stage = stage.done_stage;
    if (manual) item.position = position;
    others.splice(index, 0, item);
    target.items = others;
    if (from !== to) {
      source.meta.total -= 1;
      source.meta.total_value -= item.value;
      target.meta.total += 1;
      target.meta.total_value += item.value;
      item.stage_entered_at = new Date().toISOString();
    }
    paintColumn(from);
    paintColumn(to);
    try {
      await api('POST', '/kanban_items/' + id + '/move', Object.assign({ stage_id: to }, manual ? { position } : {}));
    } catch (error) {
      failed(error);
      loadColumn(from, 1);
      loadColumn(to, 1);
    }
  }

  function stagesPayload(stages) {
    return stages.map((stage) => ({ id: stage.id, name: stage.name, color: stage.color, description: stage.description, entry_stage: stage.entry_stage, done_stage: stage.done_stage }));
  }

  async function saveBoardStages(stages, moves) {
    const saved = await api('PATCH', '/kanban_funnels/' + state.funnel.id, { stages: stagesPayload(stages), stage_moves: moves || {} });
    state.funnels = state.funnels.map((funnel) => (funnel.id === saved.id ? saved : funnel));
    state.funnel = saved;
  }

  async function onColumnDrop() {
    const visibleIds = Array.from(root.querySelectorAll('.kb-column[data-stage]')).map((element) => Number(element.getAttribute('data-stage')));
    const queue = visibleIds.map(stageById);
    const reordered = state.funnel.stages.map((stage) => (prefs.hidden[stage.id] ? stage : queue.shift()));
    try {
      await saveBoardStages(reordered);
    } catch (error) {
      failed(error);
      renderContent();
    }
  }

  function addBoardColumn() {
    const stage = { name: '', color: STAGE_COLORS[state.funnel.stages.length % STAGE_COLORS.length], description: '', entry_stage: false, done_stage: false };
    stageDialog({
      title: 'Nova coluna', stage, personal: state.funnel.personal,
      apply: async (values) => {
        await saveBoardStages(state.funnel.stages.concat([Object.assign(stage, values)]));
        toast('Coluna criada');
        renderContent();
      },
    });
  }

  function editBoardColumn(stage) {
    stageDialog({
      title: 'Editando coluna: ' + stage.name, stage, personal: state.funnel.personal,
      apply: async (values) => {
        const stages = state.funnel.stages.map((entry) => (entry.id === stage.id ? Object.assign({}, entry, values) : Object.assign({}, entry, values.entry_stage ? { entry_stage: false } : {})));
        await saveBoardStages(stages);
        toast('Coluna atualizada');
        renderBoard();
      },
    });
  }

  async function removeBoardColumn(stage) {
    const others = state.funnel.stages.filter((entry) => entry.id !== stage.id);
    if (!others.length) return toast('O quadro precisa de pelo menos uma coluna.', 'error');
    try {
      const total = await stageCardCount(state.funnel.id, stage.id);
      askStageRemoval(stage, others, total, async (target) => {
        await saveBoardStages(others, target ? { [stage.id]: target } : {});
        toast('Coluna excluída');
        renderBoard();
      });
    } catch (error) {
      failed(error);
    }
    return undefined;
  }

  function onResizeStart(event) {
    const handle = event.target.closest && event.target.closest('.kb-resize');
    if (!handle) return;
    event.preventDefault();
    const column = handle.closest('.kb-column');
    const stageId = column.getAttribute('data-stage');
    const startX = event.clientX;
    const startWidth = column.getBoundingClientRect().width;
    const move = (moveEvent) => {
      const width = Math.min(560, Math.max(240, startWidth + moveEvent.clientX - startX));
      column.style.flexBasis = width + 'px';
      column.style.width = width + 'px';
    };
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      prefs.widths[stageId] = Math.round(column.getBoundingClientRect().width);
      savePrefs();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
  }

  // ---------- Detalhe do item ----------

  function closeDrawerSilently() {
    const layer = document.querySelector('.kb-drawer-layer');
    if (layer) layer.remove();
    state.drawer = null;
  }

  function closeDrawer() {
    closeDrawerSilently();
    if (window.location.hash.indexOf('#kanban/item/') === 0) window.location.hash = '#kanban';
  }

  let pendingCheckFocus = 0;

  async function openDrawer(id, keep) {
    if (!keep || !state.drawer || state.drawer.id !== id) state.drawer = { id, tab: 'info', section: null, item: null, search: '' };
    if (pendingCheckFocus === id) {
      pendingCheckFocus = 0;
      state.drawer.focusCheck = true;
    }
    try {
      const item = await api('GET', '/kanban_items/' + id);
      if (!state.drawer || state.drawer.id !== id) return;
      state.drawer.item = item;
      paintDrawer();
    } catch (error) {
      failed(error);
      closeDrawer();
    }
  }

  function eventText(event) {
    const data = event.data || {};
    if (event.kind === 'created') return 'Criado' + (data.stage ? ' em ' + data.stage : '');
    if (event.kind === 'contact_linked') return 'Contato vinculado: ' + data.name;
    if (event.kind === 'contact_unlinked') return 'Contato desvinculado';
    if (event.kind === 'conversation_linked') return 'Conversa #' + data.display_id + ' vinculada';
    if (event.kind === 'conversation_unlinked') return 'Conversa desvinculada';
    if (event.kind === 'activity_linked') return 'Gerado da atividade: ' + data.title;
    if (event.kind === 'archived') return 'Arquivado';
    if (event.kind === 'restored') return 'Restaurado';
    if (event.kind === 'moved') return 'Movido de ' + data.from + ' para ' + data.to;
    if (event.kind === 'status') return 'Status alterado de ' + STATUS[data.from] + ' para ' + STATUS[data.to];
    if (event.kind === 'agent_added') return agentName(data.agent_id) + ' atribuído';
    if (event.kind === 'agent_removed') return agentName(data.agent_id) + ' removido';
    if (event.kind === 'note_added') return 'Observação adicionada';
    if (event.kind === 'note_removed') return 'Observação removida';
    if (event.kind === 'check_added') return 'Checklist: adicionado "' + data.title + '"';
    if (event.kind === 'check_done') return 'Checklist: concluído "' + data.title + '"';
    if (event.kind === 'check_undone') return 'Checklist: reaberto "' + data.title + '"';
    if (event.kind === 'check_removed') return 'Checklist: removido "' + data.title + '"';
    if (event.kind === 'product_added') return 'Item incluído: ' + quantityText(data.quantity) + ' × ' + data.name;
    if (event.kind === 'product_changed') return 'Item alterado: ' + quantityText(data.quantity) + ' × ' + data.name;
    if (event.kind === 'product_removed') return 'Item removido: ' + data.name;
    return 'Editado';
  }

  function progressHtml(item) {
    const funnel = state.funnels.find((entry) => entry.id === item.funnel_id);
    if (!funnel) return '';
    const currentIndex = funnel.stages.findIndex((stage) => stage.id === item.stage_id);
    return '<div class="kb-progress">' + funnel.stages.map((stage, index) => {
      const seconds = item.stage_seconds[String(stage.id)];
      const stateClass = index === currentIndex ? 'is-current' : (seconds ? 'is-done' : '');
      return '<div class="kb-step ' + stateClass + '"><span class="kb-dot" style="--stage:' + esc(stage.color) + '">' + (seconds && index !== currentIndex ? icon('check', 13) : '') + '</span><strong>' + esc(stage.name) + '</strong><small>' + (seconds ? duration(seconds) : '—') + '</small></div>';
    }).join('') + '</div>';
  }

  function checklistPanel(item) {
    const checks = item.checks || [];
    const done = checks.filter((check) => check.done).length;
    const rate = checks.length ? Math.round((done / checks.length) * 100) : 0;
    const rows = checks.map((check) => '<li class="kb-check-row' + (check.done ? ' is-done' : '') + '"><label><input type="checkbox" data-drawer="check-toggle" data-check="' + check.id + '"' + (check.done ? ' checked' : '') + '><span>' + esc(check.title) + '</span></label><button type="button" class="kb-icon-btn is-small" data-drawer="check-edit" data-check="' + check.id + '" aria-label="Editar item">' + icon('edit', 14) + '</button><button type="button" class="kb-icon-btn is-small" data-drawer="check-delete" data-check="' + check.id + '" aria-label="Remover item">' + icon('trash', 14) + '</button></li>').join('');
    return '<section class="kb-panel"><h4>Checklist' + (checks.length ? ' <small>' + done + ' de ' + checks.length + ' · ' + rate + '%</small>' : '') + '</h4>' +
      (checks.length ? '<div class="kb-checkbar" aria-hidden="true"><i style="width:' + rate + '%"></i></div><ul class="kb-check-rows">' + rows + '</ul>' : '') +
      '<form class="kb-check-form" data-form="check"><input name="title" maxlength="200" placeholder="Adicionar item" aria-label="Novo item do checklist"><button type="submit" class="kb-btn">Adicionar</button></form></section>';
  }

  function quantityText(value) {
    return Number(value || 0).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }

  function productsTab(item) {
    const lines = item.products || [];
    const total = lines.reduce((sum, line) => sum + line.total, 0);
    const rows = lines.map((line) => '<tr><td>' + esc(line.name) + '</td><td class="kb-right">' + quantityText(line.quantity) + ' ' + esc(line.unit) + '</td><td class="kb-right">' + money(line.unit_price) + '</td><td class="kb-right"><strong>' + money(line.total) + '</strong></td>' +
      '<td class="kb-right kb-nowrap"><button type="button" class="kb-icon-btn is-small" data-drawer="product-edit" data-line="' + line.id + '" aria-label="Alterar ' + esc(line.name) + '">' + icon('edit', 14) + '</button><button type="button" class="kb-icon-btn is-small" data-drawer="product-delete" data-line="' + line.id + '" aria-label="Remover ' + esc(line.name) + '">' + icon('trash', 14) + '</button></td></tr>').join('');
    const options = (state.catalog || []).map((product) => '<option value="' + esc(product.name) + '">' + esc((product.code ? product.code + ' · ' : '') + money(product.price) + ' / ' + product.unit) + '</option>').join('');
    return '<section class="kb-panel"><h4>Itens do pedido' + (lines.length ? ' <small>' + lines.length + (lines.length === 1 ? ' item' : ' itens') + '</small>' : '') + '</h4>' +
      (lines.length ? '<div class="kb-table-scroll"><table class="kb-table kb-lines"><thead><tr><th>Produto ou serviço</th><th class="kb-right">Qtd.</th><th class="kb-right">Valor un.</th><th class="kb-right">Total</th><th></th></tr></thead><tbody>' + rows + '</tbody>' +
        '<tfoot><tr><td colspan="3">Total do pedido</td><td class="kb-right"><strong>' + money(total) + '</strong></td><td></td></tr></tfoot></table></div><p class="kb-muted">O valor do card é a soma dos itens.</p>' :
        '<p class="kb-empty-small">Nenhum item ainda. Ao incluir o primeiro, o valor do card passa a ser a soma dos itens.</p>') +
      '<form class="kb-line-form" data-form="product"><label class="kb-field">Produto ou serviço<input name="name" list="kb-catalog" maxlength="120" autocomplete="off" placeholder="Escolha do catálogo ou escreva" required></label><datalist id="kb-catalog">' + options + '</datalist>' +
      '<label class="kb-field">Qtd.<input name="quantity" inputmode="decimal" value="1"></label><label class="kb-field">Un.<input name="unit" maxlength="20" value="un"></label><label class="kb-field">Valor un. (R$)<input name="unit_price" inputmode="decimal" placeholder="0,00"></label>' +
      '<button type="submit" class="kb-btn is-primary">Adicionar</button></form></section>';
  }

  async function loadCatalog() {
    if (state.catalog || state.catalogLoading) return;
    state.catalogLoading = true;
    try {
      state.catalog = (await api('GET', '/crm_products')).products;
      if (state.drawer && state.drawer.tab === 'products') paintDrawer();
    } catch (error) {
      state.catalog = [];
    } finally {
      state.catalogLoading = false;
    }
  }

  function catalogProduct(name) {
    const wanted = String(name || '').trim().toLowerCase();
    return (state.catalog || []).find((product) => product.name.toLowerCase() === wanted);
  }

  async function saveProductLine(method, path, body) {
    await api(method, '/kanban_items/' + state.drawer.id + '/products' + path, body);
    afterItemChange(state.drawer.id);
  }

  function drawerTab(item) {
    const tab = state.drawer.tab;
    if (tab === 'products' && productsOn()) {
      loadCatalog();
      return productsTab(item);
    }
    if (tab === 'notes') {
      return '<form class="kb-note-form" data-form="note"><textarea name="content" rows="3" maxlength="5000" placeholder="Adicione uma observação" required></textarea><div><button type="submit" class="kb-btn is-primary">Adicionar</button></div></form>' +
        (item.notes.length ? item.notes.map((note) => '<article class="kb-note"><header><strong>' + esc(note.user || 'Sistema') + '</strong><small>' + esc(dateTime(note.created_at)) + '</small><span class="kb-grow"></span><button type="button" class="kb-icon-btn is-small" data-drawer="note-delete" data-note="' + note.id + '" aria-label="Remover observação">' + icon('trash', 14) + '</button></header><p>' + esc(note.content) + '</p></article>').join('') : '<p class="kb-empty-small">Sem observações</p>');
    }
    if (tab === 'history') {
      const term = state.drawer.search.toLowerCase();
      const events = item.events.filter((event) => !term || eventText(event).toLowerCase().indexOf(term) !== -1 || String(event.user || '').toLowerCase().indexOf(term) !== -1);
      return '<div class="kb-field"><input type="search" data-drawer-search placeholder="Buscar no histórico..." value="' + esc(state.drawer.search) + '" aria-label="Buscar no histórico"></div><p class="kb-muted">' + events.length + ' resultados</p>' +
        '<ol class="kb-history">' + events.map((event) => '<li><span>' + esc(eventText(event)) + '</span><small>' + esc((event.user ? event.user + ' · ' : '') + dateTime(event.created_at)) + '</small></li>').join('') + '</ol>';
    }
    return '<div class="kb-kpis"><div style="--kpi:var(--ci-green)"><small>' + esc(labelsFor(item.funnel_id).due) + '</small><strong>' + (dueChip(item) || '—') + '</strong></div><div style="--kpi:var(--crm-amber,#e8b44a)"><small>Valor</small><strong>' + money(item.value) + '</strong></div><div style="--kpi:var(--crm-chart-created,#5096cf)"><small>Criado em</small><strong>' + esc(dateOnly(item.created_at)) + '</strong></div></div>' +
      (item.description ? '<section class="kb-panel"><h4>Descrição</h4><p class="kb-pre">' + esc(item.description) + '</p></section>' : '') +
      checklistPanel(item) + '<section class="kb-panel"><h4>Progresso</h4>' + progressHtml(item) + '</section>';
  }

  function accordion(key, title, content) {
    const open = state.drawer.section === key;
    return '<section class="kb-acc"><button type="button" data-drawer="section" data-value="' + key + '" aria-expanded="' + open + '">' + esc(title) + icon('chevron', 16) + '</button>' + (open ? '<div class="kb-acc-body">' + content + '</div>' : '') + '</section>';
  }

  function paintDrawer() {
    const item = state.drawer.item;
    if (!item) return;
    let layer = document.querySelector('.kb-drawer-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'kb-drawer-layer';
      document.body.appendChild(layer);
      layer.addEventListener('mousedown', (event) => { if (event.target === layer) closeDrawer(); });
      layer.addEventListener('click', onDrawerClick);
      layer.addEventListener('submit', onDrawerSubmit);
      layer.addEventListener('input', onDrawerInput);
    }
    const priority = (PRIORITIES.find((entry) => entry[0] === item.priority) || PRIORITIES[0])[1];
    const contact = item.contact;
    const conversation = item.conversation;
    const metrics = '<dl class="kb-metrics"><div><dt>Valor</dt><dd>' + money(item.value) + '</dd></div><div><dt>Tempo na coluna</dt><dd>' + duration((Date.now() - new Date(item.stage_entered_at)) / 1000) + '</dd></div><div><dt>Antiguidade</dt><dd>' + duration((Date.now() - new Date(item.created_at)) / 1000) + '</dd></div><div><dt>Mudanças de coluna</dt><dd>' + item.stage_changes + '</dd></div></dl>';
    const conversationBlock = conversation ? '<p class="kb-muted">' + esc(conversation.inbox || 'Conversa') + ' · #' + conversation.display_id + '</p><div class="kb-inline"><button type="button" class="kb-btn" data-drawer="chat">' + icon('chat', 14) + 'Abrir conversa' + (conversation.unread ? ' (' + conversation.unread + ')' : '') + '</button><button type="button" class="kb-btn" data-drawer="unlink-conversation">Desvincular</button></div>' : '<p class="kb-empty-small">Nenhuma conversa vinculada.</p><button type="button" class="kb-btn" data-drawer="chat">Localizar ou iniciar</button>';
    const profile = contact ? '<p>' + esc(contact.name) + '</p><p class="kb-muted">' + esc(contact.phone || 'Sem telefone') + '</p><div class="kb-inline"><a class="kb-btn" href="/app/accounts/' + accountId() + '/contacts/' + contact.id + '">Abrir contato</a><button type="button" class="kb-btn" data-drawer="link-contact">Trocar</button><button type="button" class="kb-btn" data-drawer="unlink-contact">Desvincular</button></div>' : '<p class="kb-empty-small">Nenhum contato vinculado.</p><button type="button" class="kb-btn" data-drawer="link-contact">Vincular contato</button>';
    const labels = item.label_titles.length ? item.label_titles.map(chip).join('') : '<span class="kb-muted">Sem etiquetas</span>';
    const scroll = layer.querySelector('.kb-drawer-tab');
    const scrollTop = scroll ? scroll.scrollTop : 0;
    layer.innerHTML = '<div class="kb-drawer" role="dialog" aria-modal="true" aria-label="' + esc(item.title) + '"><header class="kb-drawer-head"><h2>' + esc(item.title) + '</h2><span class="kb-status is-' + item.status + '">' + STATUS[item.status] + '</span><span class="kb-pill">' + priority + '</span><small>Atualizado em: ' + esc(dateTime(item.updated_at)) + '</small><span class="kb-grow"></span>' +
      '<button type="button" class="kb-btn" data-drawer="status">Mudar Status</button><button type="button" class="kb-btn" data-drawer="move">Mover</button><button type="button" class="kb-icon-btn" data-drawer="more" aria-label="Mais ações">' + icon('dots', 18) + '</button><button type="button" class="kb-icon-btn" data-drawer="close" aria-label="Fechar">' + icon('close', 18) + '</button></header>' +
      '<div class="kb-drawer-body"><div class="kb-drawer-side"><div class="kb-profile">' + avatar(contact || { name: customerOf(item) || item.title }, 76) + '<h3>' + esc(customerOf(item) || 'Sem contato') + '</h3><p class="kb-muted">' + esc((contact && contact.phone) || '') + '</p></div>' +
      '<section class="kb-side-block"><header><span><i class="kb-live"></i>Agentes atribuídos</span><button type="button" class="kb-icon-btn is-small" data-drawer="agents" aria-label="Gerenciar agentes">' + icon('edit', 14) + '</button></header>' +
      (item.agents.length ? item.agents.map((agent) => '<div class="kb-agent">' + avatar(agent, 26) + '<span>' + esc(agent.name) + '</span></div>').join('') : '<p class="kb-empty-small">Nenhum agente</p>') + '</section>' +
      '<section class="kb-side-block"><header><span>Etiquetas</span><button type="button" class="kb-icon-btn is-small" data-drawer="labels" aria-label="Gerenciar etiquetas">' + icon('tag', 14) + '</button></header><div class="kb-card-labels">' + labels + '</div></section>' +
      '<section class="kb-acc"><button type="button" data-drawer="edit">Editar Item' + icon('chevron', 16) + '</button></section>' + accordion('metrics', 'Métricas', metrics) + accordion('conversation', 'Conversa', conversationBlock) + accordion('profile', 'Perfil', profile) + '</div>' +
      '<div class="kb-drawer-main"><nav class="kb-tabs" role="tablist">' + [['info', 'Resumo']].concat(productsOn() ? [['products', 'Itens' + (item.products && item.products.length ? ' (' + item.products.length + ')' : '')]] : [], [['notes', 'Observações'], ['history', 'Histórico']]).map((entry) => '<button type="button" role="tab" aria-selected="' + (state.drawer.tab === entry[0]) + '" data-drawer="tab" data-value="' + entry[0] + '">' + entry[1] + '</button>').join('') + '</nav><div class="kb-drawer-tab">' + drawerTab(item) + '</div></div></div></div>';
    const nextScroll = layer.querySelector('.kb-drawer-tab');
    if (nextScroll) nextScroll.scrollTop = scrollTop;
    if (state.drawer.focusCheck) {
      state.drawer.focusCheck = false;
      const field = layer.querySelector('[data-form=check] input');
      if (field) field.focus();
    }
  }

  async function saveCheck(method, path, body) {
    await api(method, '/kanban_items/' + state.drawer.id + '/checks' + path, body);
    afterItemChange(state.drawer.id);
  }

  function onDrawerInput(event) {
    const lineForm = event.target.closest('[data-form=product]');
    if (lineForm && event.target.name === 'name') {
      const product = catalogProduct(event.target.value);
      if (product) {
        lineForm.querySelector('[name=unit]').value = product.unit;
        lineForm.querySelector('[name=unit_price]').value = String(product.price.toFixed(2)).replace('.', ',');
      }
      return;
    }
    if (!event.target.hasAttribute('data-drawer-search')) return;
    state.drawer.search = event.target.value;
    const position = event.target.selectionStart;
    paintDrawer();
    const input = document.querySelector('[data-drawer-search]');
    if (input) {
      input.focus();
      input.setSelectionRange(position, position);
    }
  }

  async function onDrawerSubmit(event) {
    const productForm = event.target.closest('[data-form=product]');
    if (productForm) {
      event.preventDefault();
      const name = productForm.querySelector('[name=name]').value.trim();
      const quantity = parseMoney(productForm.querySelector('[name=quantity]').value);
      if (!name) return;
      if (!(quantity > 0)) { failed(new Error('Informe a quantidade.')); return; }
      const product = catalogProduct(name);
      const price = productForm.querySelector('[name=unit_price]').value.trim();
      saveProductLine('POST', '', Object.assign({ name, quantity, unit: productForm.querySelector('[name=unit]').value.trim() || 'un' },
        product ? { crm_product_id: product.id } : {}, price ? { unit_price: parseMoney(price) } : {})).catch(failed);
      return;
    }
    const checkForm = event.target.closest('[data-form=check]');
    if (checkForm) {
      event.preventDefault();
      const title = checkForm.querySelector('input').value.trim();
      if (!title) return;
      state.drawer.focusCheck = true;
      saveCheck('POST', '', { title }).catch(failed);
      return;
    }
    const form = event.target.closest('[data-form=note]');
    if (!form) return;
    event.preventDefault();
    const content = form.querySelector('textarea').value.trim();
    if (!content) return;
    try {
      await api('POST', '/kanban_items/' + state.drawer.id + '/notes', { content });
      openDrawer(state.drawer.id, true);
    } catch (error) {
      failed(error);
    }
  }

  function onDrawerClick(event) {
    const button = event.target.closest('[data-drawer]');
    if (!button) return;
    const action = button.getAttribute('data-drawer');
    const item = state.drawer.item;
    const checkId = button.getAttribute('data-check');
    if (action === 'close') closeDrawer();
    else if (action === 'check-toggle') saveCheck('PATCH', '/' + checkId, { done: button.checked }).catch(failed);
    else if (action === 'check-edit') {
      const check = item.checks.find((entry) => String(entry.id) === checkId);
      openDialog({
        title: 'Editar item', narrow: true,
        body: '<label class="kb-field">Item<input name="title" maxlength="200" value="' + esc(check.title) + '"></label>',
        onSubmit: async (form) => {
          const title = form.querySelector('[name=title]').value.trim();
          if (!title) throw new Error('Informe o item.');
          await saveCheck('PATCH', '/' + checkId, { title });
        },
      });
    } else if (action === 'check-delete') {
      confirmAction('Remover item', 'Este item sai do checklist do card.', 'Remover', () => saveCheck('DELETE', '/' + checkId));
    } else if (action === 'product-edit') {
      const line = item.products.find((entry) => String(entry.id) === button.getAttribute('data-line'));
      openDialog({
        title: 'Alterar item', narrow: true,
        body: '<label class="kb-field">Produto ou serviço<input name="name" maxlength="120" value="' + esc(line.name) + '"></label><div class="kb-grid-2"><label class="kb-field">Quantidade<input name="quantity" inputmode="decimal" value="' + esc(quantityText(line.quantity)) + '"></label>' +
          '<label class="kb-field">Unidade<input name="unit" maxlength="20" value="' + esc(line.unit) + '"></label></div><label class="kb-field">Valor unitário (R$)<input name="unit_price" inputmode="decimal" value="' + esc(String(line.unit_price.toFixed(2)).replace('.', ',')) + '"></label>',
        onSubmit: async (form) => {
          const quantity = parseMoney(form.querySelector('[name=quantity]').value);
          if (!(quantity > 0)) throw new Error('Informe a quantidade.');
          await saveProductLine('PATCH', '/' + line.id, { name: form.querySelector('[name=name]').value.trim(), unit: form.querySelector('[name=unit]').value.trim() || 'un', quantity, unit_price: parseMoney(form.querySelector('[name=unit_price]').value) });
        },
      });
    } else if (action === 'product-delete') {
      const line = item.products.find((entry) => String(entry.id) === button.getAttribute('data-line'));
      const last = item.products.length === 1;
      confirmAction('Remover item', '"' + line.name + '" sai do pedido.' + (last ? ' Era o último item: o valor do card volta a zero e pode ser digitado de novo.' : ' O valor do card é recalculado.'), 'Remover', () => saveProductLine('DELETE', '/' + line.id));
    } else if (action === 'tab') { state.drawer.tab = button.getAttribute('data-value'); paintDrawer(); }
    else if (action === 'section') {
      const key = button.getAttribute('data-value');
      state.drawer.section = state.drawer.section === key ? null : key;
      paintDrawer();
    } else if (action === 'chat') {
      const target = item.id;
      closeDrawer();
      openChat(target);
    } else if (action === 'link-contact') contactDialog(item);
    else if (action === 'unlink-contact') unlinkAction(item, { contact_id: null }, 'O contato deixa de estar vinculado a este card. O cadastro do contato não muda.');
    else if (action === 'unlink-conversation') unlinkAction(item, { conversation_display_id: null }, 'A conversa deixa de estar vinculada a este card. A conversa não é apagada.');
    else if (action === 'status') statusDialog(item);
    else if (action === 'move') moveDialog(item);
    else if (action === 'edit') itemDialog({ item });
    else if (action === 'labels') labelsPopover(button, item);
    else if (action === 'more') {
      event.stopPropagation();
      cardActions(button, item);
    } else if (action === 'agents') {
      event.stopPropagation();
      openChecklistPopover(button, agentOptions(), item.agents.map((agent) => String(agent.id)), async (values) => {
        try {
          await api('PATCH', '/kanban_items/' + item.id, { agent_ids: values.map(Number) });
          afterItemChange(item.id);
        } catch (error) {
          failed(error);
        }
      }, 'Agentes do item');
    } else if (action === 'note-delete') {
      const noteId = button.getAttribute('data-note');
      confirmAction('Remover observação', 'Esta observação será removida. Isso não pode ser desfeito.', 'Remover', async () => {
        await api('DELETE', '/kanban_items/' + item.id + '/notes/' + noteId);
        openDrawer(item.id, true);
      });
    }
    if (action === 'labels') event.stopPropagation();
  }

  // ---------- Conversa lateral ----------

  let chatFrame = null;
  let chatTimer = 0;

  function chatPanel() {
    let panel = document.querySelector('.kb-chat');
    if (panel) return panel;
    panel = document.createElement('section');
    panel.className = 'kb-chat';
    panel.setAttribute('aria-label', 'Conversa');
    panel.innerHTML = '<header class="kb-chat-head"></header><div class="kb-chat-body"><div class="kb-chat-content"></div></div>';
    document.body.appendChild(panel);
    panel.addEventListener('click', onChatClick);
    panel.addEventListener('input', onChatInput);
    return panel;
  }

  function paintChatHead(item, conversation) {
    const name = customerOf(item) || item.title;
    const person = item.contact || { name };
    chatPanel().querySelector('.kb-chat-head').innerHTML = avatar(person, 34) + '<div class="kb-chat-title"><strong>' + esc(name) + '</strong><small>' + esc(conversation ? (conversation.inbox || 'Conversa') + ' · #' + conversation.display_id : item.title) + '</small></div><span class="kb-grow"></span>' +
      (conversation ? '<a class="kb-icon-btn" href="' + conversationUrl(conversation) + '" title="Abrir em tela cheia" aria-label="Abrir em tela cheia" target="_blank" rel="noopener">' + icon('external', 16) + '</a>' : '') +
      '<button type="button" class="kb-icon-btn" data-chat="close" aria-label="Fechar conversa">' + icon('close', 18) + '</button>';
  }

  async function openChat(id) {
    window.clearTimeout(chatTimer);
    const panel = chatPanel();
    document.body.setAttribute('data-kb-chat', 'open');
    panel.querySelector('.kb-chat-head').innerHTML = '<span class="kb-muted">Carregando…</span><span class="kb-grow"></span><button type="button" class="kb-icon-btn" data-chat="close" aria-label="Fechar conversa">' + icon('close', 18) + '</button>';
    panel.classList.remove('has-frame');
    panel.querySelector('.kb-chat-content').innerHTML = '';
    panel.focus();
    try {
      const item = await api('GET', '/kanban_items/' + id);
      state.chat = { id, item };
      paintChatHead(item, item.conversation);
      if (item.conversation) showConversation(item.conversation);
      else paintNoConversation(item);
    } catch (error) {
      failed(error);
      closeChat();
    }
  }

  function showConversation(conversation) {
    const panel = chatPanel();
    const body = panel.querySelector('.kb-chat-body');
    const url = conversationUrl(conversation);
    panel.querySelector('.kb-chat-content').innerHTML = '';
    panel.classList.add('has-frame', 'is-loading');
    if (chatFrame && chatFrame.isConnected && chatFrame.contentWindow) {
      const same = chatFrame.contentWindow.location.pathname === url;
      if (!same) {
        chatFrame.contentWindow.history.pushState({}, '', url);
        chatFrame.contentWindow.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
      }
      waitForConversation();
      return;
    }
    chatFrame = document.createElement('iframe');
    chatFrame.className = 'kb-chat-frame';
    chatFrame.title = 'Conversa';
    chatFrame.setAttribute('allow', 'microphone');
    chatFrame.src = url;
    body.appendChild(chatFrame);
    chatFrame.addEventListener('load', waitForConversation);
  }

  function waitForConversation() {
    const panel = document.querySelector('.kb-chat');
    let tries = 0;
    const check = () => {
      tries += 1;
      let ready = tries > 60;
      try {
        ready = ready || !!chatFrame.contentDocument.querySelector('.conversation-panel');
      } catch (error) {
        ready = true;
      }
      if (ready) panel && panel.classList.remove('is-loading');
      else window.setTimeout(check, 100);
    };
    check();
  }

  function closeChat() {
    const panel = document.querySelector('.kb-chat');
    state.chat = null;
    document.body.removeAttribute('data-kb-chat');
    if (panel) panel.classList.remove('has-frame', 'is-loading');
    // O iframe fica vivo por um tempo para reabrir na hora, depois é descartado para liberar memória.
    window.clearTimeout(chatTimer);
    chatTimer = window.setTimeout(() => {
      if (chatFrame) chatFrame.remove();
      chatFrame = null;
    }, 120000);
  }

  async function paintNoConversation(item) {
    const content = chatPanel().querySelector('.kb-chat-content');
    if (!item.contact) {
      content.innerHTML = '<div class="kb-chat-empty"><h3>Nenhum contato vinculado</h3><p class="kb-muted">Vincule um contato já cadastrado para conversar por aqui.</p><div class="kb-field kb-contact-field"><input type="search" data-chat-search autocomplete="off" placeholder="Buscar por nome ou telefone" aria-label="Buscar contato"><div class="kb-suggest" hidden></div></div></div>';
      return;
    }
    content.innerHTML = '<p class="kb-loading">Procurando conversas…</p>';
    try {
      const [conversations, inboxes] = await Promise.all([
        api('GET', '/contacts/' + item.contact.id + '/conversations'),
        api('GET', '/contacts/' + item.contact.id + '/contactable_inboxes'),
      ]);
      if (!state.chat || state.chat.id !== item.id) return;
      const list = conversations.payload || [];
      const channels = inboxes.payload || [];
      state.chat.channels = channels;
      const existing = list.length ? '<div class="kb-archive">' + list.slice(0, 8).map((entry) => {
        const inbox = state.inboxes.find((candidate) => candidate.id === entry.inbox_id);
        return '<div><span>#' + entry.id + ' · ' + esc(inbox ? inbox.name : 'Conversa') + ' · ' + esc(entry.status) + '</span><button type="button" class="kb-btn" data-chat="link" data-value="' + entry.id + '">Vincular</button></div>';
      }).join('') + '</div>' : '<p class="kb-empty-small">Este contato ainda não tem conversas.</p>';
      const start = channels.length ? '<label class="kb-field">Canal<select data-chat-inbox>' + channels.map((entry, index) => '<option value="' + index + '">' + esc(entry.inbox.name) + '</option>').join('') + '</select></label><button type="button" class="kb-btn is-primary" data-chat="start">Iniciar conversa</button>' : '<p class="kb-empty-small">Nenhum canal disponível para este contato.</p>';
      content.innerHTML = '<div class="kb-chat-empty"><h3>Sem conversa vinculada</h3><p class="kb-muted">Escolha uma conversa existente ou inicie uma nova.</p>' + existing + '<h3>Nova conversa</h3>' + start + '</div>';
    } catch (error) {
      content.innerHTML = '<p class="kb-empty-small">' + esc(error.message) + '</p>';
    }
  }

  let chatSearchTimer = 0;

  function onChatInput(event) {
    if (!event.target.hasAttribute('data-chat-search')) return;
    const term = event.target.value.trim();
    const list = event.target.parentElement.querySelector('.kb-suggest');
    window.clearTimeout(chatSearchTimer);
    if (term.length < 2) {
      list.hidden = true;
      return;
    }
    chatSearchTimer = window.setTimeout(async () => {
      try {
        const data = await api('GET', '/contacts/search?q=' + encodeURIComponent(term) + '&page=1');
        const contacts = (data.payload || []).slice(0, 6);
        list.innerHTML = contacts.length ? contacts.map((contact) => '<button type="button" data-chat="contact" data-value="' + contact.id + '">' + avatar({ name: contact.name, thumbnail: contact.thumbnail }, 24) + '<span>' + esc(contact.name) + '</span><small>' + esc(contact.phone_number || contact.email || '') + '</small></button>').join('') : '<p class="kb-empty-small">Nenhum contato encontrado.</p>';
        list.hidden = false;
      } catch (error) {
        list.hidden = true;
      }
    }, 280);
  }

  async function linkFromChat(payload) {
    const id = state.chat.id;
    try {
      await api('PATCH', '/kanban_items/' + id, payload);
      refreshBoard();
      if (state.drawer && state.drawer.id === id) openDrawer(id, true);
      openChat(id);
    } catch (error) {
      failed(error);
    }
  }

  async function onChatClick(event) {
    const button = event.target.closest('[data-chat]');
    if (!button) return;
    const action = button.getAttribute('data-chat');
    const value = button.getAttribute('data-value');
    if (action === 'close') closeChat();
    else if (action === 'contact') linkFromChat({ contact_id: Number(value) });
    else if (action === 'link') linkFromChat({ conversation_display_id: Number(value) });
    else if (action === 'start') {
      const channel = state.chat.channels[Number(document.querySelector('[data-chat-inbox]').value)];
      button.disabled = true;
      try {
        const created = await api('POST', '/conversations', { inbox_id: channel.inbox.id, contact_id: state.chat.item.contact.id, source_id: channel.source_id });
        await linkFromChat({ conversation_display_id: created.id });
      } catch (error) {
        failed(error);
        button.disabled = false;
      }
    }
  }

  function contactDialog(item) {
    openDialog({
      title: 'Vincular contato', narrow: true, submit: 'Vincular',
      body: '<div class="kb-field kb-contact-field">Contato<input type="search" name="contact_search" autocomplete="off" placeholder="Buscar por nome ou telefone"><input type="hidden" name="contact_id"><div class="kb-suggest" hidden></div></div>',
      onOpen: bindContactSearch,
      onSubmit: async (form) => {
        const contact = form.querySelector('[name=contact_id]').value;
        if (!contact) throw new Error('Escolha um contato da lista.');
        await api('PATCH', '/kanban_items/' + item.id, { contact_id: Number(contact) });
        toast('Contato vinculado');
        afterItemChange(item.id);
      },
    });
  }

  function unlinkAction(item, payload, message) {
    confirmAction('Remover vínculo', message, 'Remover', async () => {
      await api('PATCH', '/kanban_items/' + item.id, payload);
      afterItemChange(item.id);
    });
  }

  // ---------- Quadros ----------

  function funnelIdFrom(element) {
    return Number(element.closest('[data-funnel]').getAttribute('data-funnel'));
  }

  async function runFunnel(action, message) {
    try {
      await action();
      await loadFunnels();
      toast(message);
      renderFunnels();
    } catch (error) {
      failed(error);
    }
  }

  function deleteFunnel(id) {
    const funnel = state.funnels.find((entry) => entry.id === id);
    confirmAction('Arquivar quadro', 'O quadro "' + funnel.name + '" sai da lista. Os cards ficam guardados e você pode restaurar depois.', 'Arquivar', async () => {
      await api('DELETE', '/kanban_funnels/' + id);
      await loadFunnels();
      toast('Quadro arquivado');
      renderFunnels();
    });
  }

  async function showArchivedFunnels() {
    try {
      const funnels = await api('GET', '/kanban_funnels?archived=1');
      const body = funnels.length ? '<div class="kb-archive">' + funnels.map((funnel) => '<div><span>' + esc(funnel.name) + '</span><button type="button" class="kb-btn" data-restore="' + funnel.id + '">Restaurar</button></div>').join('') + '</div>' : '<p class="kb-empty-small">Nenhum quadro arquivado.</p>';
      const layer = openDialog({ title: 'Quadros arquivados', narrow: true, submit: 'Fechar', body, onSubmit: () => {} });
      layer.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-restore]');
        if (!button) return;
        try {
          await api('POST', '/kanban_funnels/' + button.getAttribute('data-restore') + '/restore');
          closeDialog(layer);
          await loadFunnels();
          toast('Quadro restaurado');
          renderFunnels();
        } catch (error) {
          failed(error);
        }
      });
    } catch (error) {
      failed(error);
    }
  }

  function funnelCard(funnel) {
    const tag = funnel.personal ? '<span class="kb-pill">Pessoal</span>' : '<span class="kb-pill">Empresa</span>';
    const manage = funnel.can_manage ?
      (funnel.is_default || funnel.personal || !state.isAdmin ? '' : '<button type="button" class="kb-icon-btn" data-act="funnel-default" title="Definir como padrão" aria-label="Definir como padrão">' + icon('star') + '</button>') +
      '<a class="kb-icon-btn" href="#kanban/funis/' + funnel.id + '" title="Editar" aria-label="Editar">' + icon('edit') + '</a>' : '';
    const archive = funnel.can_manage ? '<button type="button" class="kb-icon-btn is-danger" data-act="funnel-delete" title="Arquivar" aria-label="Arquivar">' + icon('trash') + '</button>' : '';
    return '<article class="kb-funnel" data-funnel="' + funnel.id + '"><header>' + tag + '<span class="kb-status ' + (funnel.active ? 'is-won' : 'is-lost') + '">' + (funnel.active ? 'Ativo' : 'Inativo') + '</span>' + (funnel.is_default ? '<span class="kb-pill">Padrão</span>' : '') + '<span class="kb-grow"></span><small>' + funnel.open_count + ' abertos</small></header><h3>' + esc(funnel.name) + '</h3>' + (funnel.description ? '<p class="kb-muted">' + esc(funnel.description) + '</p>' : '') +
      '<p class="kb-mini-title">Colunas</p><div class="kb-stage-chips">' + funnel.stages.map((stage) => '<span class="kb-stage-chip"><i style="background:' + esc(stage.color) + '"></i>' + esc(stage.name) + '</span>').join('') + '</div>' +
      '<footer>' + manage + '<button type="button" class="kb-icon-btn" data-act="funnel-duplicate" title="Duplicar" aria-label="Duplicar">' + icon('copy') + '</button>' + archive + '</footer></article>';
  }

  function renderFunnels() {
    state.draftFunnel = null;
    const shared = state.funnels.filter((funnel) => !funnel.personal);
    const mine = state.funnels.filter((funnel) => funnel.personal);
    const group = (title, list, hint) => '<section class="kb-group"><h3>' + title + '</h3>' + (list.length ? '<div class="kb-funnels">' + list.map(funnelCard).join('') + '</div>' : '<p class="kb-empty-small">' + hint + '</p>') + '</section>';
    mainEl().innerHTML = '<div class="kb-page"><a class="kb-back" href="#kanban">‹ Voltar ao quadro</a><header class="kb-page-head"><div><h2>Quadros</h2><p class="kb-muted">Organize o trabalho do seu jeito, com as colunas que precisar</p></div><div class="kb-actions"><button type="button" class="kb-btn" data-act="funnel-archived">Arquivados</button><a class="kb-btn is-primary" href="#kanban/funis/novo">' + icon('plus', 14) + 'Novo quadro</a></div></header>' +
      group('Da empresa', shared, state.isAdmin ? 'Crie um quadro compartilhado com a equipe.' : 'Nenhum quadro compartilhado com você.') +
      group('Meus quadros', mine, 'Crie um quadro que só você vê.') + '</div>';
  }

  function renderTemplates() {
    state.draftFunnel = null;
    mainEl().innerHTML = '<div class="kb-page"><a class="kb-back" href="#kanban/funis">‹ Voltar</a><header class="kb-page-head"><div><h2>Novo quadro</h2><p class="kb-muted">Comece de um modelo. Depois você muda tudo: colunas, cores e nomes.</p></div></header><div class="kb-templates">' +
      TEMPLATES.map((template, index) => '<button type="button" class="kb-template" data-act="editor-template" data-index="' + index + '"><strong>' + esc(template.name) + '</strong><span class="kb-stage-chips">' + template.stages.map((stage, position) => '<span class="kb-stage-chip"><i style="background:' + STAGE_COLORS[position % STAGE_COLORS.length] + '"></i>' + esc(stage[0]) + '</span>').join('') + '</span></button>').join('') + '</div></div>';
  }

  function draftFromTemplate(template) {
    return {
      id: null, name: template.key === 'blank' ? '' : template.name, description: '', active: true, quick_message: true, visibility: 'everyone', inbox_ids: [], agent_ids: [],
      personal: !state.isAdmin, can_manage: true, due_soon_days: 2, labels: Object.assign({}, template.labels), stage_moves: {},
      stages: template.stages.map((entry, index) => ({ key: 'n' + index, name: entry[0], color: STAGE_COLORS[index % STAGE_COLORS.length], description: '', entry_stage: false, done_stage: !!entry[1] })),
    };
  }

  function openFunnelEditor(id) {
    if (!id) {
      renderTemplates();
      return;
    }
    const funnel = state.funnels.find((entry) => entry.id === id);
    if (!funnel || !funnel.can_manage) {
      window.location.hash = '#kanban/funis';
      return;
    }
    state.draftFunnel = JSON.parse(JSON.stringify(funnel));
    state.draftFunnel.stage_moves = {};
    state.draftFunnel.stages.forEach((stage) => { stage.key = 's' + stage.id; });
    paintEditor();
  }

  function captureEditor() {
    const draft = state.draftFunnel;
    const page = mainEl().querySelector('.kb-editor');
    if (!draft || !page) return;
    draft.name = page.querySelector('[name=name]').value;
    draft.description = page.querySelector('[name=description]').value;
    draft.active = page.querySelector('[name=active]').checked;
    draft.visibility = page.querySelector('[name=visibility]:checked').value;
    draft.inbox_ids = checked(page, 'inboxes').map(Number);
    draft.agent_ids = checked(page, 'funnel_agents').map(Number);
    draft.due_soon_days = Number(page.querySelector('[name=due_soon_days]').value) || 0;
    LABEL_FIELDS.forEach((field) => { draft.labels[field[0]] = page.querySelector('[name="label_' + field[0] + '"]').value; });
    const scope = page.querySelector('[name=board_scope]:checked');
    if (scope) draft.personal = scope.value === 'personal';
  }

  function paintEditor() {
    const draft = state.draftFunnel;
    const inboxes = state.inboxes.map((inbox) => ({ value: String(inbox.id), label: inbox.name }));
    const agents = state.agents.map((agent) => ({ value: String(agent.id), label: agent.available_name || agent.name }));
    const stages = draft.stages.map((stage, index) => '<div class="kb-stage-row" data-key="' + esc(stage.key) + '"><span class="kb-grip" aria-hidden="true">' + icon('grip') + '</span><i style="background:' + esc(stage.color) + '"></i><div><strong>' + esc(stage.name) + '</strong>' + (stage.entry_stage ? '<span class="kb-pill">Entrada</span>' : '') + (stage.done_stage ? '<span class="kb-pill">Conclui</span>' : '') + (stage.description ? '<small>' + esc(stage.description) + '</small>' : '') + '</div><span class="kb-grow"></span><button type="button" class="kb-icon-btn" data-act="editor-stage" data-index="' + index + '" aria-label="Editar coluna">' + icon('edit') + '</button><button type="button" class="kb-icon-btn is-danger" data-act="editor-remove" data-index="' + index + '" aria-label="Remover coluna">' + icon('trash') + '</button></div>').join('');
    const scope = !draft.id && state.isAdmin ? '<section class="kb-editor-block"><header><h3>Quem usa este quadro</h3></header><label class="kb-check"><input type="radio" name="board_scope" value="shared"' + (draft.personal ? '' : ' checked') + '><span>Toda a empresa</span></label><label class="kb-check"><input type="radio" name="board_scope" value="personal"' + (draft.personal ? ' checked' : '') + '><span>Só eu</span></label></section>' : '';
    const access = draft.personal ? '<input type="hidden" name="visibility" value="everyone" checked><div hidden><input type="radio" name="visibility" value="everyone" checked></div>' :
      '<section class="kb-editor-block"><header><h3>Caixas de entrada</h3></header><p class="kb-muted">Sem seleção, a coluna de entrada aceita conversas de todas as caixas.</p>' + checkBoxes('inboxes', inboxes, draft.inbox_ids.map(String)) + '</section>' +
      '<section class="kb-editor-block"><header><h3>Agentes</h3></header><p class="kb-muted">Sem seleção, todos os agentes têm acesso.</p>' + checkBoxes('funnel_agents', agents, draft.agent_ids.map(String)) + '</section>' +
      '<section class="kb-editor-block"><header><h3>Visibilidade dos cards</h3></header><label class="kb-check"><input type="radio" name="visibility" value="everyone"' + (draft.visibility === 'everyone' ? ' checked' : '') + '><span>Todos com acesso a este quadro</span></label><label class="kb-check"><input type="radio" name="visibility" value="assigned_only"' + (draft.visibility === 'assigned_only' ? ' checked' : '') + '><span>Somente agentes atribuídos ao card</span></label></section>';
    mainEl().innerHTML = '<div class="kb-page kb-editor"><a class="kb-back" href="#kanban/funis">‹ Voltar</a><header class="kb-page-head"><div><h2>' + (draft.id ? 'Editando: ' + esc(draft.name) : 'Novo quadro') + '</h2>' + (draft.updated_at ? '<p class="kb-muted">Atualizado em: ' + esc(dateTime(draft.updated_at)) + '</p>' : '') + '</div><div class="kb-actions"><a class="kb-btn" href="#kanban/funis">Descartar</a><button type="button" class="kb-btn is-primary" data-act="editor-save">Salvar</button></div></header>' +
      '<label class="kb-field">Nome<input name="name" maxlength="120" placeholder="Nome do quadro" value="' + esc(draft.name) + '"></label><label class="kb-field">Descrição<textarea name="description" rows="2" placeholder="Para que serve este quadro">' + esc(draft.description) + '</textarea></label>' +
      '<label class="kb-switch"><input type="checkbox" name="active"' + (draft.active ? ' checked' : '') + '><span></span><div><strong>Quadro ativo</strong><small>Quadros inativos não recebem novos cards.</small></div></label>' + scope +
      '<section class="kb-editor-block"><header><h3>Colunas</h3><span class="kb-pill">' + draft.stages.length + '</span><span class="kb-grow"></span><button type="button" class="kb-btn" data-act="editor-add">' + icon('plus', 14) + 'Nova coluna</button></header><div class="kb-stage-list">' + stages + '</div></section>' +
      '<section class="kb-editor-block"><header><h3>Nomes usados neste quadro</h3></header><p class="kb-muted">Adapte ao seu negócio: pedido, chamado, entrega, projeto ou o que fizer sentido.</p><div class="kb-grid-2">' + LABEL_FIELDS.map((field) => '<label class="kb-field">' + field[1] + '<input name="label_' + field[0] + '" maxlength="40" placeholder="' + esc(DEFAULT_LABELS[field[0]]) + '" value="' + esc(draft.labels[field[0]] || '') + '"></label>').join('') + '</div></section>' +
      '<section class="kb-editor-block"><header><h3>Prazos</h3></header><label class="kb-field">Considerar prazo próximo com antecedência de (dias)<input type="number" name="due_soon_days" min="0" max="365" value="' + Number(draft.due_soon_days) + '"></label></section>' + access + '</div>';
    bindEditorSort();
  }

  function bindEditorSort() {
    const list = mainEl().querySelector('.kb-stage-list');
    if (!list || !window.Sortable) return;
    window.Sortable.create(list, {
      draggable: '.kb-stage-row', handle: '.kb-grip', animation: 160, forceFallback: true, ghostClass: 'kb-ghost',
      onEnd: () => {
        captureEditor();
        const keys = Array.from(list.querySelectorAll('.kb-stage-row')).map((row) => row.getAttribute('data-key'));
        state.draftFunnel.stages.sort((left, right) => keys.indexOf(left.key) - keys.indexOf(right.key));
        paintEditor();
      },
    });
  }

  function stageDialog(options) {
    const stage = options.stage;
    const allowEntry = !options.personal;
    openDialog({
      title: options.title, side: true, submit: 'Aplicar',
      body: '<label class="kb-field">Nome da coluna<input name="stage_name" maxlength="80" placeholder="Nome da coluna" value="' + esc(stage.name) + '"></label>' +
        '<div class="kb-grid-2"><label class="kb-field">Cor<input type="color" name="stage_color" value="' + esc(stage.color) + '"></label><label class="kb-field">Descrição<input name="stage_description" placeholder="Opcional" value="' + esc(stage.description || '') + '"></label></div>' +
        '<label class="kb-switch"><input type="checkbox" name="stage_done"' + (stage.done_stage ? ' checked' : '') + '><span></span><div><strong>Coluna de conclusão</strong><small>Cards nesta coluna aparecem como concluídos, em verde.</small></div></label>' +
        (allowEntry ? '<label class="kb-switch"><input type="checkbox" name="stage_entry"' + (stage.entry_stage ? ' checked' : '') + '><span></span><div><strong>Coluna de entrada</strong><small>Conversas com mensagem nova que ainda não estão neste quadro entram aqui automaticamente.</small></div></label>' : ''),
      onSubmit: (form) => {
        const name = form.querySelector('[name=stage_name]').value.trim();
        if (!name) throw new Error('Informe o nome da coluna.');
        const entry = form.querySelector('[name=stage_entry]');
        return options.apply({
          name, color: form.querySelector('[name=stage_color]').value, description: form.querySelector('[name=stage_description]').value,
          done_stage: form.querySelector('[name=stage_done]').checked, entry_stage: entry ? entry.checked : false,
        });
      },
    });
  }

  async function stageCardCount(funnelId, stageId) {
    const data = await api('GET', '/kanban_items?funnel_id=' + funnelId + '&stage_id=' + stageId + '&page=1');
    return data.meta.total;
  }

  function askStageRemoval(stage, others, total, apply) {
    if (!total) {
      confirmAction('Excluir coluna', 'A coluna "' + stage.name + '" será excluída.', 'Excluir', () => apply(others[0] ? others[0].id : null));
      return;
    }
    openDialog({
      title: 'Excluir coluna', narrow: true, danger: true, submit: 'Mover e excluir',
      body: '<p class="kb-confirm">A coluna "' + esc(stage.name) + '" tem ' + total + (total === 1 ? ' card' : ' cards') + '. Escolha para onde eles vão.</p><label class="kb-field">Mover para<select name="move_to">' + others.map((entry) => '<option value="' + entry.id + '">' + esc(entry.name) + '</option>').join('') + '</select></label>',
      onSubmit: (form) => apply(Number(form.querySelector('[name=move_to]').value)),
    });
  }

  async function removeDraftStage(index) {
    const draft = state.draftFunnel;
    const stage = draft.stages[index];
    if (draft.stages.length === 1) return toast('O quadro precisa de pelo menos uma coluna.', 'error');
    const drop = (target) => {
      if (stage.id && target) draft.stage_moves[stage.id] = target;
      draft.stages.splice(index, 1);
      paintEditor();
    };
    if (!stage.id) return drop(null);
    try {
      const others = draft.stages.filter((entry) => entry !== stage && entry.id);
      const total = await stageCardCount(draft.id, stage.id);
      if (total && !others.length) return toast('Crie e salve outra coluna antes de excluir esta.', 'error');
      askStageRemoval(stage, others, total, drop);
    } catch (error) {
      failed(error);
    }
  }

  async function saveFunnel(button) {
    captureEditor();
    const draft = state.draftFunnel;
    if (!draft.name.trim()) return toast('Informe o nome do quadro.', 'error');
    if (!draft.stages.length) return toast('O quadro precisa de pelo menos uma coluna.', 'error');
    const payload = {
      name: draft.name.trim(), description: draft.description, active: draft.active, visibility: draft.visibility, quick_message: draft.quick_message,
      inbox_ids: draft.inbox_ids, agent_ids: draft.agent_ids, labels: draft.labels, due_soon_days: draft.due_soon_days, personal: !!draft.personal,
      stages: stagesPayload(draft.stages), stage_moves: draft.stage_moves,
    };
    button.disabled = true;
    try {
      const saved = draft.id ? await api('PATCH', '/kanban_funnels/' + draft.id, payload) : await api('POST', '/kanban_funnels', payload);
      await loadFunnels();
      if (!state.funnels.some((funnel) => funnel.id === prefs.funnelId)) {
        prefs.funnelId = saved.id;
        savePrefs();
        state.funnel = state.funnels.find((funnel) => funnel.id === saved.id);
      }
      toast('Quadro salvo');
      window.location.hash = '#kanban/funis';
    } catch (error) {
      failed(error);
    } finally {
      button.disabled = false;
    }
  }

  function editorAction(name, element) {
    const index = Number(element.getAttribute('data-index'));
    if (name === 'editor-template') {
      state.draftFunnel = draftFromTemplate(TEMPLATES[index]);
      paintEditor();
      return undefined;
    }
    if (name === 'editor-save') return saveFunnel(element);
    captureEditor();
    const draft = state.draftFunnel;
    const updateDraft = (stage, isNew) => (values) => {
      Object.assign(stage, values);
      if (values.entry_stage) draft.stages.forEach((entry) => { if (entry !== stage) entry.entry_stage = false; });
      if (isNew) draft.stages.push(stage);
      paintEditor();
    };
    if (name === 'editor-add') {
      const stage = { key: 'n' + Date.now(), name: '', color: STAGE_COLORS[draft.stages.length % STAGE_COLORS.length], description: '', entry_stage: false, done_stage: false };
      stageDialog({ title: 'Nova coluna', stage, personal: draft.personal, apply: updateDraft(stage, true) });
    } else if (name === 'editor-stage') {
      stageDialog({ title: 'Editando coluna: ' + draft.stages[index].name, stage: draft.stages[index], personal: draft.personal, apply: updateDraft(draft.stages[index], false) });
    } else if (name === 'editor-remove') {
      removeDraftStage(index);
    }
    return undefined;
  }

  // ---------- Criar card pela conversa e pelo contato ----------

  const boardChannel = 'BroadcastChannel' in window ? new BroadcastChannel('crm-kanban') : null;

  // Atividade concluída na conversa aberta ao lado do quadro também tira o card da tela.
  window.addEventListener('crm:activity-changed', () => {
    if (boardChannel) boardChannel.postMessage({ type: 'card-created', account: accountId() });
    syncOpenBoard();
  });

  function syncOpenBoard() {
    if (!state.visible) return;
    if (document.querySelector('.sortable-fallback')) {
      window.setTimeout(syncOpenBoard, 1500);
      return;
    }
    refreshBoard();
  }

  if (boardChannel) {
    boardChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'card-created' && event.data.account === accountId()) syncOpenBoard();
    };
  }

  // As cores de prazo dependem do dia em São Paulo: quadro aberto na virada do dia se atualiza sozinho.
  let paintedDay = saoPauloToday();
  window.setInterval(() => {
    const today = saoPauloToday();
    if (today === paintedDay) return;
    paintedDay = today;
    syncOpenBoard();
  }, 60000);

  function cardSource() {
    const path = window.location.pathname;
    const conversation = path.match(/\/conversations\/(\d+)/);
    if (conversation) return { conversationId: conversation[1] };
    const contact = path.match(/\/contacts\/(\d+)/);
    return contact ? { contactId: contact[1] } : null;
  }

  async function cardContext(source) {
    if (source.conversationId) {
      const conversation = await api('GET', '/conversations/' + source.conversationId);
      return { contact: conversation.meta.sender, conversation };
    }
    const [contact, history] = await Promise.all([
      api('GET', '/contacts/' + source.contactId),
      api('GET', '/contacts/' + source.contactId + '/conversations').catch(() => ({ payload: [] })),
    ]);
    const latest = (history.payload || []).slice().sort((a, b) => b.last_activity_at - a.last_activity_at)[0];
    return { contact: contact.payload, conversation: latest || null };
  }

  function linkedContactHtml(context) {
    const contact = context.contact;
    const conversation = context.conversation;
    const inbox = conversation && state.inboxes.find((entry) => entry.id === conversation.inbox_id);
    const check = conversation ? '<label class="kb-check"><input type="checkbox" name="link_conversation" checked><span>Vincular à conversa #' + esc(conversation.id) + (inbox ? ' · ' + esc(inbox.name) : '') + '</span></label>' : '';
    return '<div class="kb-field">Contato<div class="kb-linked">' + avatar({ name: contact.name, thumbnail: contact.thumbnail }, 32) + '<div><strong>' + esc(contact.name || 'Sem nome') + '</strong><small>' + esc(contact.phone_number || contact.email || '') + '</small></div></div>' + check + '</div>';
  }

  function quickCardDialog(context, prefill) {
    const funnel = state.funnel;
    const entry = funnel.stages.find((stage) => stage.entry_stage);
    const priorities = PRIORITIES.map((option) => '<option value="' + option[0] + '"' + (option[0] === prefill.priority ? ' selected' : '') + '>' + option[1] + '</option>').join('');
    const body = '<div class="kb-grid-2"><label class="kb-field">Quadro<select name="funnel_id">' + funnelSelectOptions() + '</select></label><label class="kb-field">Coluna<select name="stage_id">' + stageOptions(funnel.id, entry && entry.id) + '</select></label></div>' +
      '<label class="kb-field">Título<input name="title" required maxlength="255" placeholder="O que precisa ser feito" value="' + esc(prefill.title || '') + '"></label>' + linkedContactHtml(context) +
      '<div class="kb-grid-2"><label class="kb-field"><span data-word="due">' + esc(labelsFor(funnel.id).due) + '</span><input type="date" name="due_on" value="' + esc(prefill.due_on || '') + '"></label><label class="kb-field">Prioridade<select name="priority">' + priorities + '</select></label></div>' +
      '<div class="kb-grid-2"><label class="kb-field">Descrição<textarea name="description" rows="2" maxlength="5000"></textarea></label>' +
      '<label class="kb-field">Observações<textarea name="observation" rows="2" maxlength="5000" placeholder="Fica registrada nas anotações"></textarea></label></div>';
    return openDialog({
      title: 'Criar card', submit: 'Criar', body,
      onOpen: (form) => {
        bindFunnelStage(form);
        const select = form.querySelector('[name=funnel_id]');
        select.addEventListener('change', () => {
          const chosen = state.funnels.find((item) => item.id === Number(select.value));
          const first = chosen && chosen.stages.find((stage) => stage.entry_stage);
          if (first) form.querySelector('[name=stage_id]').value = first.id;
          form.querySelector('[data-word=due]').textContent = labelsFor(Number(select.value)).due;
        });
      },
      onSubmit: async (form) => {
        const value = (name) => form.querySelector('[name=' + name + ']').value;
        if (!value('title').trim()) throw new Error('Informe o título.');
        if (!Number(value('stage_id'))) throw new Error('Escolha uma coluna.');
        const link = form.querySelector('[name=link_conversation]');
        const me = Number(currentUserId());
        const card = await api('POST', '/kanban_items', {
          title: value('title').trim(), stage_id: Number(value('stage_id')), contact_id: context.contact.id,
          conversation_display_id: link && link.checked ? context.conversation.id : null,
          due_on: value('due_on') || null, priority: Number(value('priority')), description: value('description'),
          observation: value('observation'), agent_ids: me ? [me] : [], work_activity_id: prefill.work_activity_id || null,
        });
        if (boardChannel) boardChannel.postMessage({ type: 'card-created', account: accountId(), funnelId: card.funnel_id });
        syncOpenBoard();
        const saved = state.funnels.find((item) => item.id === card.funnel_id);
        toast('Salvo em ' + (saved ? saved.name + ' › ' : '') + card.stage_name);
      },
    });
  }

  async function createCard(source, prefill) {
    try {
      await loadReference();
      if (!state.visible) await loadFunnels();
      const active = state.funnels.filter((funnel) => funnel.active);
      if (!active.length) {
        toast('Crie um quadro no Kanban antes de criar cards.', 'error');
        return;
      }
      if (!state.funnel || !state.funnel.active) state.funnel = active[0];
      quickCardDialog(await cardContext(source), prefill || {}).querySelector('[name=title]').focus();
    } catch (error) {
      failed(error);
    }
  }

  function cardTrigger(modifier) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'kb-card-trigger ' + modifier;
    button.innerHTML = icon('plus', 15) + '<span>Criar card</span>';
    button.addEventListener('click', async () => {
      const source = cardSource();
      if (!source) return;
      button.disabled = true;
      await createCard(source);
      button.disabled = false;
    });
    return button;
  }

  function mountCardTriggers() {
    const path = window.location.pathname;
    if (/\/conversations\/\d+/.test(path)) {
      const actions = document.querySelector('.conversation--actions');
      const group = actions && actions.closest('.list-group');
      const info = group && group.parentElement.querySelector(':scope > .relative > .flex-col');
      if (info && !info.querySelector('.kb-card-trigger')) info.appendChild(cardTrigger('is-panel'));
    } else if (/\/contacts\/\d+/.test(path)) {
      const nav = document.querySelector('main section header nav');
      const row = nav && nav.nextElementSibling;
      if (row && !row.querySelector('.kb-card-trigger')) {
        row.classList.add('kb-card-actions');
        row.prepend(cardTrigger('is-header'));
      }
    }
  }

  // ---------- Alertas de prazo ----------

  const EMBEDDED = window.self !== window.top;
  const reminders = { items: [], unread: 0 };

  function reminderWhen(reminder) {
    const days = dayNumber(reminder.due_on) - dayNumber(saoPauloToday());
    const parts = reminder.due_on.split('-');
    const when = days === 0 ? 'Vence hoje' : (days === 1 ? 'Vence amanhã' : (days < 0 ? 'Venceu em ' + parts[2] + '/' + parts[1] : 'Vence em ' + parts[2] + '/' + parts[1]));
    return (reminder.kind === 'card' ? 'Card · ' : 'Atividade · ') + when;
  }

  function paintBell() {
    document.querySelectorAll('.kb-bell').forEach((bell) => {
      const badge = bell.querySelector('b');
      badge.hidden = !reminders.unread;
      badge.textContent = reminders.unread > 99 ? '99+' : String(reminders.unread);
      bell.setAttribute('aria-label', reminders.unread ? reminders.unread + ' alertas de prazo' : 'Alertas de prazo');
    });
  }

  function notifyNewReminders(items) {
    const key = 'crm-alertas-vistos-' + accountId();
    let seen = 0;
    try { seen = Number(localStorage.getItem(key)) || 0; } catch (error) { return; }
    const fresh = items.filter((item) => !item.read && item.id > seen);
    if (!fresh.length) return;
    try { localStorage.setItem(key, String(Math.max.apply(null, fresh.map((item) => item.id)))); } catch (error) { return; }
    toast(fresh.length === 1 ? reminderWhen(fresh[0]) + ': ' + fresh[0].title : fresh.length + ' alertas de prazo');
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    fresh.slice(0, 3).forEach((item) => new Notification(reminderWhen(item), { body: item.title, tag: 'crm-alerta-' + item.id }));
  }

  async function loadReminders() {
    if (!accountId() || !authHeaders()) return;
    try {
      const data = await api('GET', '/crm_reminders');
      reminders.items = data.items;
      reminders.unread = data.unread;
      paintBell();
      notifyNewReminders(data.items);
    } catch (error) {
      paintBell();
    }
  }

  function goToConversation(displayId) {
    const app = document.querySelector('#app');
    const router = app && app.__vue_app__ && app.__vue_app__.config.globalProperties.$router;
    const path = '/app/accounts/' + accountId() + '/conversations/' + displayId;
    if (router) router.push(path);
    else window.location.assign(path);
  }

  function openReminder(reminder) {
    if (!reminder.read) api('PATCH', '/crm_reminders/' + reminder.id).then(loadReminders).catch(failed);
    if (reminder.kind === 'card') {
      window.location.hash = '#kanban/item/' + reminder.source_id;
    } else if (reminder.conversation_display_id) {
      if (state.visible) close();
      goToConversation(reminder.conversation_display_id);
    }
  }

  function openBell(anchor) {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    const items = reminders.items.slice(0, 15).map((reminder) => ({ label: reminder.title, hint: reminderWhen(reminder), active: !reminder.read, run: () => openReminder(reminder) }));
    if (!items.length) items.push({ label: 'Nenhum alerta de prazo', run: () => {} });
    if (reminders.unread) items.push({ label: 'Marcar todos como lidos', run: () => api('POST', '/crm_reminders/read_all').then(loadReminders).catch(failed) });
    openMenu(anchor, items);
    document.querySelector('.kb-menu').classList.add('kb-bell-menu');
  }

  function bellButton(extra) {
    const bell = document.createElement('button');
    bell.type = 'button';
    bell.className = 'kb-bell ' + extra;
    bell.title = 'Alertas de prazo';
    bell.innerHTML = icon('bell', 20) + '<b hidden></b>';
    bell.addEventListener('click', (event) => {
      event.stopPropagation();
      openBell(bell);
    });
    return bell;
  }

  function mountBell() {
    if (EMBEDDED) return;
    const tema = document.querySelector('[data-crm-tema]');
    if (tema && !tema.parentElement.querySelector('.kb-bell')) {
      tema.parentElement.insertBefore(bellButton(tema.className), tema);
      paintBell();
    }
    const floating = document.querySelector('body > .crm-tema');
    const loose = document.querySelector('body > .kb-bell');
    if (floating && !loose) {
      const rect = floating.getBoundingClientRect();
      const bell = bellButton('is-floating');
      bell.style.top = rect.top + 'px';
      bell.style.right = (window.innerWidth - rect.left + 8) + 'px';
      document.body.appendChild(bell);
      paintBell();
    } else if (!floating && loose) {
      loose.remove();
    }
  }

  if (!EMBEDDED) {
    window.setTimeout(loadReminders, 2500);
    window.setInterval(loadReminders, 300000);
  }

  // ---------- Calculadora ----------

  const CALC_POSITION = 'crm-calc-posicao';
  const calcState = { entry: '0', stored: null, op: null, fresh: true, line: '', repeat: null, error: false };
  const CALC_KEYS = [['%', 'percent'], ['CE', 'ce'], ['C', 'clear'], ['⌫', 'back'], ['¹/x', 'inverse'], ['x²', 'square'], ['√x', 'root'], ['÷', '/'], ['7'], ['8'], ['9'], ['×', '*'], ['4'], ['5'], ['6'], ['−', '-'], ['1'], ['2'], ['3'], ['+', '+'], ['±', 'negate'], ['0'], [',', 'dot'], ['=', 'equals']];
  const CALC_SIGN = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  const calcClean = (value) => Number(value.toPrecision(12));

  function calcFormat(text) {
    if (!/^-?\d+(\.\d*)?$/.test(text)) return Number(text).toLocaleString('pt-BR', { maximumSignificantDigits: 12 });
    const negative = text[0] === '-';
    const parts = (negative ? text.slice(1) : text).split('.');
    const whole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (negative ? '-' : '') + whole + (parts.length > 1 ? ',' + parts[1] : '');
  }

  function calcPaint() {
    const box = document.querySelector('.crm-calc');
    if (!box) return;
    box.querySelector('.crm-calc-line').textContent = calcState.line;
    const output = box.querySelector('.crm-calc-value');
    output.textContent = calcState.error || calcFormat(calcState.entry);
    output.classList.toggle('is-long', output.textContent.length > 13);
  }

  function calcSetResult(value) {
    if (!Number.isFinite(value)) {
      calcState.error = 'Não é possível dividir por zero';
      calcState.stored = null;
      calcState.op = null;
      calcState.fresh = true;
      return false;
    }
    calcState.entry = String(calcClean(value));
    return true;
  }

  function calcCompute(left, op, right) {
    if (op === '+') return left + right;
    if (op === '-') return left - right;
    if (op === '*') return left * right;
    return right === 0 ? Infinity : left / right;
  }

  function calcReset() {
    Object.assign(calcState, { entry: '0', stored: null, op: null, fresh: true, line: '', repeat: null, error: false });
  }

  function calcPress(key) {
    if (calcState.error) calcReset();
    const current = Number(calcState.entry);
    if (/^\d$/.test(key)) {
      calcState.entry = calcState.fresh || calcState.entry === '0' ? key : (calcState.entry.replace(/[-.]/g, '').length >= 15 ? calcState.entry : calcState.entry + key);
      calcState.fresh = false;
    } else if (key === 'dot') {
      if (calcState.fresh) calcState.entry = '0.';
      else if (calcState.entry.indexOf('.') === -1) calcState.entry += '.';
      calcState.fresh = false;
    } else if (key === 'back') {
      if (!calcState.fresh) calcState.entry = calcState.entry.length > 1 && calcState.entry !== '-0' ? calcState.entry.slice(0, -1).replace(/^-$/, '0') : '0';
    } else if (key === 'ce') {
      calcState.entry = '0';
      calcState.fresh = true;
    } else if (key === 'clear') {
      calcReset();
    } else if (key === 'negate') {
      if (calcState.entry !== '0') calcState.entry = calcState.entry[0] === '-' ? calcState.entry.slice(1) : '-' + calcState.entry;
    } else if (key === 'percent') {
      const base = calcState.stored !== null && (calcState.op === '+' || calcState.op === '-') ? calcState.stored : 1;
      calcSetResult((base * current) / 100);
      calcState.fresh = true;
    } else if (key === 'inverse' || key === 'square' || key === 'root') {
      if (key === 'root' && current < 0) calcState.error = 'Entrada inválida';
      else calcSetResult(key === 'inverse' ? (current === 0 ? Infinity : 1 / current) : (key === 'square' ? current * current : Math.sqrt(current)));
      calcState.fresh = true;
    } else if (key === 'equals') {
      if (calcState.op !== null) {
        const right = current;
        const expression = calcFormat(String(calcState.stored)) + ' ' + CALC_SIGN[calcState.op] + ' ' + calcFormat(String(right)) + ' =';
        const operator = calcState.op;
        if (calcSetResult(calcCompute(calcState.stored, operator, right))) {
          calcState.line = expression;
          calcState.repeat = { op: operator, right };
          calcState.stored = null;
          calcState.op = null;
        }
      } else if (calcState.repeat) {
        const expression = calcFormat(calcState.entry) + ' ' + CALC_SIGN[calcState.repeat.op] + ' ' + calcFormat(String(calcState.repeat.right)) + ' =';
        if (calcSetResult(calcCompute(current, calcState.repeat.op, calcState.repeat.right))) calcState.line = expression;
      }
      calcState.fresh = true;
    } else {
      if (calcState.op !== null && !calcState.fresh) {
        if (!calcSetResult(calcCompute(calcState.stored, calcState.op, current))) {
          calcPaint();
          return;
        }
      }
      calcState.stored = Number(calcState.entry);
      calcState.op = key;
      calcState.repeat = null;
      calcState.line = calcFormat(calcState.entry) + ' ' + CALC_SIGN[key];
      calcState.fresh = true;
    }
    calcPaint();
  }

  function calcKeydown(event) {
    const map = { Enter: 'equals', '=': 'equals', ',': 'dot', '.': 'dot', Backspace: 'back', Delete: 'ce', '%': 'percent', '+': '+', '-': '-', '*': '*', '/': '/', x: '*', X: '*' };
    event.stopPropagation();
    if (event.key === 'Escape') {
      closeCalculator();
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const key = /^\d$/.test(event.key) ? event.key : map[event.key];
    if (!key) return;
    event.preventDefault();
    calcPress(key);
  }

  function closeCalculator() {
    const box = document.querySelector('.crm-calc');
    if (box) box.remove();
  }

  function calcPlace(box, left, top) {
    const x = Math.max(4, Math.min(left, window.innerWidth - box.offsetWidth - 4));
    const y = Math.max(4, Math.min(top, window.innerHeight - box.offsetHeight - 4));
    box.style.left = x + 'px';
    box.style.top = y + 'px';
    return [x, y];
  }

  function calcDrag(box, handle) {
    handle.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button')) return;
      const rect = box.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      handle.setPointerCapture(event.pointerId);
      const move = (next) => calcPlace(box, next.clientX - offsetX, next.clientY - offsetY);
      const stop = () => {
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', stop);
        handle.removeEventListener('pointercancel', stop);
        try { localStorage.setItem(CALC_POSITION, JSON.stringify([parseInt(box.style.left, 10), parseInt(box.style.top, 10)])); } catch (error) { return; }
      };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', stop);
      handle.addEventListener('pointercancel', stop);
    });
  }

  function openCalculator() {
    const open = document.querySelector('.crm-calc');
    if (open) {
      open.remove();
      return;
    }
    const box = document.createElement('section');
    box.className = 'crm-calc';
    box.tabIndex = -1;
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Calculadora');
    const canInsert = window.crmModules && window.crmModules.enabled('ferramentas_conversa') && document.querySelector('.reply-box .ProseMirror');
    box.innerHTML = '<header class="crm-calc-head"><span>Calculadora</span>' +
      (canInsert ? '<button type="button" class="crm-calc-insert" data-calc-insert title="Inserir o resultado no campo de digitação">Inserir</button>' : '') +
      '<button type="button" data-calc-close aria-label="Fechar calculadora">' + icon('close', 16) + '</button></header>' +
      '<div class="crm-calc-screen"><p class="crm-calc-line"></p><button type="button" class="crm-calc-value" title="Copiar resultado"></button></div>' +
      '<div class="crm-calc-keys">' + CALC_KEYS.map((entry) => '<button type="button" class="' + (entry[1] === 'equals' ? 'is-equals' : (/^\d$/.test(entry[0]) || entry[0] === '±' || entry[0] === ',' ? 'is-digit' : '')) + '" data-calc="' + esc(entry[1] || entry[0]) + '">' + esc(entry[0]) + '</button>').join('') + '</div>';
    document.body.appendChild(box);
    calcPaint();
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(CALC_POSITION)); } catch (error) { saved = null; }
    calcPlace(box, saved ? saved[0] : window.innerWidth - box.offsetWidth - 380, saved ? saved[1] : 70);
    calcDrag(box, box.querySelector('.crm-calc-head'));
    box.addEventListener('keydown', calcKeydown);
    box.addEventListener('click', (event) => {
      const key = event.target.closest('[data-calc]');
      if (key) calcPress(key.getAttribute('data-calc'));
      else if (event.target.closest('[data-calc-close]')) return closeCalculator();
      else if (event.target.closest('[data-calc-insert]')) {
        if (!calcState.error && window.crmInsertIntoReply && window.crmInsertIntoReply(calcFormat(calcState.entry))) toast('Resultado inserido. Revise e envie.');
        return undefined;
      }
      else if (event.target.closest('.crm-calc-value') && !calcState.error && navigator.clipboard) {
        navigator.clipboard.writeText(calcFormat(calcState.entry)).then(() => toast('Resultado copiado')).catch(() => {});
      }
      box.focus();
      return undefined;
    });
    box.focus();
  }

  // Calculadora com ícone fixo na barra da esquerda, ao lado do botão de tema (pedido do Alex: acesso rápido).
  // Também continua no item "Ferramentas" do menu do perfil, quando o recurso está ligado.
  function calcButton(extra) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'kb-calc-open ' + extra;
    button.title = 'Calculadora';
    button.setAttribute('aria-label', 'Calculadora');
    button.innerHTML = icon('calc', 20);
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!document.querySelector('.crm-calc')) openCalculator();
    });
    return button;
  }

  function mountCalculatorButton() {
    if (EMBEDDED) return;
    const tema = document.querySelector('[data-crm-tema]');
    if (tema && !tema.parentElement.querySelector('.kb-calc-open')) tema.parentElement.insertBefore(calcButton(tema.className), tema);
    const floating = document.querySelector('body > .crm-tema');
    const loose = document.querySelector('body > .kb-calc-open');
    if (floating && !loose) {
      const rect = floating.getBoundingClientRect();
      const button = calcButton('is-floating');
      button.style.top = rect.top + 'px';
      button.style.right = (window.innerWidth - rect.left + 52) + 'px';
      document.body.appendChild(button);
    } else if (!floating && loose) {
      loose.remove();
    }
  }

  // ---------- Altura da caixa de escrever ----------

  const REPLY_HEIGHT = 'crm-altura-resposta';
  const REPLY_MIN = 48;

  function replyLimit() {
    return Math.max(REPLY_MIN, Math.round(window.innerHeight * 0.6));
  }

  function applyReplyHeight(value, save) {
    const height = value ? Math.max(REPLY_MIN, Math.min(value, replyLimit())) : 0;
    if (height) {
      document.documentElement.style.setProperty('--crm-reply-h', height + 'px');
      document.body.setAttribute('data-crm-reply-sized', 'true');
    } else {
      document.body.removeAttribute('data-crm-reply-sized');
    }
    if (save) {
      try {
        if (height) localStorage.setItem(REPLY_HEIGHT, String(height));
        else localStorage.removeItem(REPLY_HEIGHT);
      } catch (error) { return height; }
    }
    return height;
  }

  function currentReplyHeight() {
    const editor = document.querySelector('.reply-box .ProseMirror');
    return editor ? editor.getBoundingClientRect().height : REPLY_MIN;
  }

  function mountReplyGrip() {
    const box = document.querySelector('.reply-box');
    if (!box || box.querySelector(':scope > .crm-reply-grip')) return;
    const grip = document.createElement('div');
    grip.className = 'crm-reply-grip';
    grip.tabIndex = 0;
    grip.title = 'Arraste para aumentar a caixa. Dois cliques voltam ao normal.';
    grip.setAttribute('role', 'separator');
    grip.setAttribute('aria-orientation', 'horizontal');
    grip.setAttribute('aria-label', 'Altura da caixa de escrever');
    box.appendChild(grip);
    grip.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      const startY = event.clientY;
      const startHeight = currentReplyHeight();
      grip.setPointerCapture(event.pointerId);
      const move = (next) => applyReplyHeight(startHeight + startY - next.clientY, false);
      const stop = () => {
        grip.removeEventListener('pointermove', move);
        grip.removeEventListener('pointerup', stop);
        grip.removeEventListener('pointercancel', stop);
        applyReplyHeight(currentReplyHeight(), true);
      };
      grip.addEventListener('pointermove', move);
      grip.addEventListener('pointerup', stop);
      grip.addEventListener('pointercancel', stop);
    });
    grip.addEventListener('dblclick', () => applyReplyHeight(0, true));
    grip.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
      event.preventDefault();
      event.stopPropagation();
      applyReplyHeight(currentReplyHeight() + (event.key === 'ArrowUp' ? 24 : -24), true);
    });
  }

  try {
    const savedHeight = Number(localStorage.getItem(REPLY_HEIGHT));
    if (savedHeight) applyReplyHeight(savedHeight, false);
  } catch (error) { /* sem preferência salva */ }

  // ---------- Faixa de grupos e janela de emojis ----------

  function paintGroupArrows(wrap, row) {
    const overflow = row.scrollWidth - row.clientWidth > 4;
    wrap.querySelectorAll(':scope > .crm-tabs-arrow').forEach((arrow) => {
      const left = arrow.getAttribute('data-side') === 'left';
      arrow.hidden = !overflow || (left ? row.scrollLeft <= 4 : row.scrollLeft + row.clientWidth >= row.scrollWidth - 4);
      arrow.style.top = (row.offsetTop + (row.offsetHeight - arrow.offsetHeight) / 2) + 'px';
    });
  }

  function mountGroupTabs() {
    const wrap = document.querySelector('.conversations-list-wrap');
    const row = wrap && wrap.children[1];
    if (!row || !row.classList.contains('overflow-x-auto')) return;
    if (!row.getAttribute('data-crm-tabs')) {
      row.setAttribute('data-crm-tabs', 'true');
      row.addEventListener('wheel', (event) => {
        if (row.scrollWidth <= row.clientWidth || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
        event.preventDefault();
        row.scrollLeft += event.deltaY;
        paintGroupArrows(wrap, row);
      }, { passive: false });
      row.addEventListener('scroll', () => paintGroupArrows(wrap, row), { passive: true });
      window.addEventListener('resize', () => paintGroupArrows(wrap, row));
    }
    if (!wrap.querySelector(':scope > .crm-tabs-arrow')) {
      [['left', 'Ver grupos anteriores', -1], ['right', 'Ver mais grupos', 1]].forEach((entry) => {
        const arrow = document.createElement('button');
        arrow.type = 'button';
        arrow.className = 'crm-tabs-arrow is-' + entry[0];
        arrow.setAttribute('data-side', entry[0]);
        arrow.title = entry[1];
        arrow.setAttribute('aria-label', entry[1]);
        arrow.innerHTML = icon('chevron', 16);
        arrow.hidden = true;
        arrow.addEventListener('click', () => {
          row.scrollLeft += entry[2] * Math.max(140, row.clientWidth * 0.7);
          paintGroupArrows(wrap, row);
        });
        wrap.appendChild(arrow);
      });
    }
    paintGroupArrows(wrap, row);
  }

  function fitEmojiDialog() {
    const dialog = document.querySelector('.emoji-dialog');
    if (!dialog || dialog.getAttribute('data-crm-fit')) return;
    dialog.setAttribute('data-crm-fit', 'true');
    const box = dialog.getBoundingClientRect();
    // O painel da conversa corta o que passa da borda, então o limite é ele, não a janela.
    const panel = dialog.closest('.conversation-details-wrap');
    const area = panel ? panel.getBoundingClientRect() : { top: 0, left: 0, right: window.innerWidth, bottom: window.innerHeight };
    const limitTop = Math.max(area.top, 0) + 8;
    const limitBottom = Math.min(area.bottom, window.innerHeight) - 8;
    const limitLeft = Math.max(area.left, 0) + 8;
    const limitRight = Math.min(area.right, window.innerWidth) - 8;
    if (box.height > limitBottom - limitTop) dialog.style.maxHeight = (limitBottom - limitTop) + 'px';
    if (box.width > limitRight - limitLeft) dialog.style.maxWidth = (limitRight - limitLeft) + 'px';
    const fitted = dialog.getBoundingClientRect();
    const shiftX = Math.max(limitLeft - fitted.left, Math.min(0, limitRight - fitted.right));
    const shiftY = Math.max(limitTop - fitted.top, Math.min(0, limitBottom - fitted.bottom));
    if (shiftX || shiftY) dialog.style.translate = shiftX + 'px ' + shiftY + 'px';
  }

  let triggerTimer = 0;
  new MutationObserver(() => {
    fitEmojiDialog();
    if (triggerTimer) return;
    triggerTimer = window.setTimeout(() => {
      triggerTimer = 0;
      mountCardTriggers();
      mountBell();
      mountCalculatorButton();
      mountReplyGrip();
      mountGroupTabs();
    }, 300);
  }).observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('hashchange', route);
  // Recurso ligado ou desligado em Configurações → Recursos: o quadro aberto acompanha na hora.
  document.addEventListener('crm:modules', () => {
    if (state.visible && state.view === 'board' && state.funnel) renderBoard();
  });
  window.crmKanban = { open, close, isOpen: () => state.visible, createCard, reloadReminders: loadReminders, confirm: confirmAction, toast, menu: openMenu, dialog: openDialog,
    openCalculator: () => { if (!document.querySelector('.crm-calc')) openCalculator(); } };

  function boot() {
    if (window.location.hash.indexOf('#kanban') === 0 && document.querySelector('#app main')) route();
    else if (window.location.hash.indexOf('#kanban') === 0) window.setTimeout(boot, 300);
  }
  boot();
})();
