(function () {
  var EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
  var STORAGE_KEY = 'crm-industrial-reactions';

  function readCookie(name) {
    var parts = document.cookie ? document.cookie.split('; ') : [];
    for (var i = 0; i < parts.length; i += 1) {
      if (parts[i].indexOf(name + '=') === 0) {
        return decodeURIComponent(parts[i].slice(name.length + 1));
      }
    }
    return '';
  }

  function authHeaders() {
    var raw = readCookie('cw_d_session_info');
    if (!raw) return null;
    try {
      var data = JSON.parse(raw);
    } catch (error) {
      return null;
    }
    if (!data['access-token'] || !data.uid) return null;
    return {
      'access-token': data['access-token'],
      'token-type': data['token-type'] || 'Bearer',
      client: data.client,
      expiry: data.expiry,
      uid: data.uid,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  function conversationIds() {
    var path = window.location.pathname;
    var account = path.match(/\/accounts\/(\d+)/);
    var conversation = path.match(/\/conversations\/(\d+)/);
    if (!account || !conversation) return null;
    return { accountId: account[1], conversationId: conversation[1] };
  }

  function savedReactions() {
    try {
      return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (error) {
      return {};
    }
  }

  function remember(messageId, emoji) {
    var all = savedReactions();
    if (emoji) all[messageId] = emoji;
    else delete all[messageId];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  function messageBubble(container) {
    return container.querySelector('.left-bubble, .right-bubble');
  }

  // Selo embaixo da mensagem: emojis de quem reagiu (você e os contatos) e, se mais de um, quantos.
  // `entries` é { quem: emoji }. Também aceita um emoji só (reação sua, antes de confirmar).
  function paintBadge(bubble, entries) {
    if (typeof entries === 'string') entries = entries ? { __eu: entries } : {};
    var names = Object.keys(entries || {}).filter(function (who) { return entries[who]; });
    var badge = bubble.querySelector('.crm-reaction-badge');
    if (!names.length) {
      if (badge) badge.remove();
      return;
    }
    var emojis = [];
    names.forEach(function (who) { if (emojis.indexOf(entries[who]) === -1) emojis.push(entries[who]); });
    var text = emojis.slice(0, 3).join('') + (names.length > 1 ? '|' + names.length : '');
    var title = names.map(function (who) { return (who === '__eu' ? 'Você' : who.replace(/\s*\([^)]*@[^)]*\)\s*$/, '')) + ': ' + entries[who]; }).join('\n');
    if (badge && badge.getAttribute('data-value') === text) return;
    var isNew = !badge;
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'crm-reaction-badge';
      bubble.appendChild(badge);
    }
    badge.setAttribute('data-value', text);
    badge.title = title;
    badge.setAttribute('aria-label', 'Reações: ' + title.replace(/\n/g, ', '));
    badge.textContent = emojis.slice(0, 3).join('');
    if (names.length > 1) {
      var count = document.createElement('span');
      count.className = 'crm-reaction-count';
      count.textContent = String(names.length);
      badge.appendChild(count);
    }
    if (!isNew) return;
    badge.classList.remove('crm-reaction-badge');
    void badge.offsetWidth;
    badge.classList.add('crm-reaction-badge');
  }

  // ---------- Reações a partir das mensagens carregadas na tela ----------
  // Reação de contato: registro de atividade com `crm_reaction` (a partir da versão 98) ou, nas antigas,
  // mensagem recebida "*Reagiu com* 👍" respondendo à mensagem reagida. Reação sua: nota privada com `waha_reaction`.
  var REACTION_TEXT = /^(?:👥 \*([^*\n]+)\*[ \t]*\n(?:`[^`\n]*`[ \t]*\n)?\s*)?\*(?:Reagiu com\* (\S+)|Reação removida\*)\s*$/;
  var pendingMine = {};

  function vueStore() {
    var app = document.querySelector('#app');
    try { return app && app.__vue_app__ && app.__vue_app__.config.globalProperties.$store; } catch (error) { return null; }
  }

  function chatMessages() {
    var store = vueStore();
    var chat = null;
    try { chat = store && store.getters.getSelectedChat; } catch (error) { chat = null; }
    return (chat && chat.messages) || [];
  }

  function reactionOf(message) {
    var attrs = message.content_attributes || {};
    if (attrs.crm_reaction) {
      return { target: attrs.crm_reaction.target || attrs.in_reply_to, who: attrs.crm_reaction.who || 'Contato', emoji: attrs.crm_reaction.emoji || '' };
    }
    if (message.private && Object.prototype.hasOwnProperty.call(attrs, 'waha_reaction')) {
      return { target: attrs.in_reply_to, who: '__eu', emoji: attrs.waha_reaction || '' };
    }
    if (message.message_type === 0) {
      var match = REACTION_TEXT.exec(String(message.content || '').trim());
      if (match) return { target: attrs.in_reply_to, who: match[1] || (message.sender && message.sender.name) || 'Contato', emoji: match[2] || '' };
    }
    return null;
  }

  function reactionState() {
    var map = {};
    var hidden = {};
    chatMessages().slice().sort(function (a, b) { return (a.created_at - b.created_at) || (a.id - b.id); }).forEach(function (message) {
      var reaction = reactionOf(message);
      if (!reaction) return;
      hidden[message.id] = true;
      if (!reaction.target) return;
      var entries = map[reaction.target] || (map[reaction.target] = {});
      if (reaction.emoji) entries[reaction.who] = reaction.emoji;
      else delete entries[reaction.who];
    });
    var now = Date.now();
    Object.keys(pendingMine).forEach(function (id) {
      var pending = pendingMine[id];
      var entries = map[id] || (map[id] = {});
      var confirmed = (entries.__eu || '') === pending.emoji;
      if (confirmed || now - pending.at > 20000) { delete pendingMine[id]; return; }
      if (pending.emoji) entries.__eu = pending.emoji;
      else delete entries.__eu;
    });
    return { map: map, hidden: hidden };
  }

  function paintReactions() {
    var state = reactionState();
    document.querySelectorAll('.conversation-panel .message-bubble-container[data-message-id]').forEach(function (container) {
      var id = container.getAttribute('data-message-id');
      if (state.hidden[id]) {
        container.setAttribute('data-crm-reaction-note', '1');
        return;
      }
      var bubble = messageBubble(container);
      if (bubble) paintBadge(bubble, state.map[id] || {});
      var picker = container.querySelector('.crm-reaction-picker');
      var mine = (state.map[id] || {}).__eu || '';
      if (picker) picker.querySelectorAll('button').forEach(function (item) {
        item.setAttribute('aria-pressed', item.textContent === mine ? 'true' : 'false');
      });
    });
  }

  function sendReaction(messageId, emoji) {
    var ids = conversationIds();
    var headers = authHeaders();
    if (!ids || !headers) return Promise.reject(new Error('sem sessao'));
    var url =
      '/api/v1/accounts/' +
      ids.accountId +
      '/conversations/' +
      ids.conversationId +
      '/messages';
    return fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: headers,
      body: JSON.stringify({
        content: '\u200b',
        private: true,
        content_attributes: {
          in_reply_to: Number(messageId),
          waha_reaction: emoji,
        },
      }),
    }).then(function (response) {
      if (!response.ok) throw new Error('reacao');
      return response.json();
    });
  }

  function isReactionNotice(text) {
    var clean = String(text || '').replace(/\*/g, '').replace(/\s+/g, ' ').trim();
    return clean.indexOf('Reagiu com') !== -1 ||
      clean.indexOf('Removeu a reação') !== -1 ||
      clean.indexOf('Reação removida') !== -1 ||
      clean.indexOf('Esta mensagem foi excluída') !== -1;
  }

  function hideReactionNotes() {
    var nodes = document.querySelectorAll('.message-bubble-container');
    for (var i = 0; i < nodes.length; i += 1) {
      if (nodes[i].getAttribute('data-crm-reaction-note') === '1') continue;
      var privateNote = nodes[i].querySelector('.bg-n-solid-amber');
      var text = (privateNote || nodes[i]).textContent || '';
      var sentNotice = text.indexOf('Enviado via API') !== -1 && text.indexOf('Reagiu com') !== -1;
      var invisibleReaction = privateNote && text.indexOf('\u200b') !== -1;
      if (sentNotice || invisibleReaction || (privateNote && isReactionNotice(text))) {
        nodes[i].setAttribute('data-crm-reaction-note', '1');
      }
    }
    var previews = document.querySelectorAll('.conversation span');
    for (var j = 0; j < previews.length; j += 1) {
      if (previews[j].getAttribute('data-crm-reaction-note') === '1') continue;
      var preview = (previews[j].textContent || '').replace(/\s+/g, ' ').trim();
      if (preview === 'Esta mensagem foi excluída' || preview.indexOf('Reagiu com') !== -1 || preview.indexOf('Removeu a reação') !== -1 || preview.indexOf('Reação removida') !== -1) {
        previews[j].setAttribute('data-crm-reaction-note', '1');
      }
    }
  }

  function isCreateControl(button) {
    return (button.textContent || '').indexOf('Criar atividade') !== -1;
  }

  function workControl(container) {
    var buttons = container.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i += 1) {
      var button = buttons[i];
      if (button.closest('[role="dialog"], dialog, .crm-message-tools')) continue;
      if (isCreateControl(button) || button.parentElement.classList.contains('max-w-sm')) return button;
    }
    return null;
  }

  function labelActivityButton(container, control) {
    var trigger = container.querySelector('.crm-activity-trigger');
    if (!trigger || !control) return;
    var label = isCreateControl(control) ? 'Criar atividade' : 'Ver atividade';
    if (trigger.title === label) return;
    trigger.title = label;
    trigger.setAttribute('aria-label', label);
  }

  function buildActivityButton(container) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'crm-activity-trigger';
    button.title = 'Criar atividade';
    button.setAttribute('aria-label', 'Criar atividade');
    button.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><rect x="6" y="6.2" width="12" height="13.2" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 6.2V4.8A1.3 1.3 0 0 1 10.3 3.5h3.4A1.3 1.3 0 0 1 15 4.8v1.4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 10.2v5.2M9.4 12.8h5.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      var target = workControl(container);
      if (target) target.click();
    });
    return button;
  }

  function hideCreateButton(container) {
    var button = workControl(container);
    if (button && isCreateControl(button)) button.classList.add('crm-activity-collapsed');
    return button;
  }

  function attach(container) {
    if (container.getAttribute('data-crm-reaction') === 'ready') {
      var tools = container.querySelector('.crm-message-tools');
      var control = hideCreateButton(container);
      if (tools && control && !tools.querySelector('.crm-activity-trigger')) {
        tools.insertBefore(buildActivityButton(container), tools.firstChild);
      }
      labelActivityButton(container, control);
      return;
    }
    var bubble = messageBubble(container);
    if (!bubble || container.querySelector('.crm-message-tools')) return;
    var messageId = container.getAttribute('data-message-id');
    if (!messageId) return;
    var incoming = bubble.classList.contains('left-bubble');
    var createButton = hideCreateButton(container);
    if (!incoming && !createButton) return;
    container.setAttribute('data-crm-reaction', 'ready');

    var picker = document.createElement('div');
    picker.className = 'crm-reaction-picker';
    picker.setAttribute('role', 'group');
    picker.setAttribute('aria-label', 'Reagir à mensagem');

    EMOJIS.forEach(function (emoji) {
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = emoji;
      button.title = 'Reagir com ' + emoji;
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var current = (reactionState().map[messageId] || {}).__eu || '';
        var next = current === emoji ? '' : emoji;
        pendingMine[messageId] = { emoji: next, at: Date.now() };
        remember(messageId, next);
        paintReactions();
        picker.classList.remove('is-open');
        var openTrigger = container.querySelector('.crm-reaction-trigger');
        if (openTrigger) openTrigger.setAttribute('aria-expanded', 'false');
        sendReaction(messageId, next).catch(function () {
          delete pendingMine[messageId];
          remember(messageId, current);
          paintReactions();
        });
      });
      picker.appendChild(button);
    });

    var tools = document.createElement('div');
    tools.className = 'crm-message-tools';
    if (!incoming) tools.classList.add('is-right');
    if (createButton) tools.appendChild(buildActivityButton(container));

    var trigger = null;
    if (incoming) {
      var anchor = document.createElement('div');
      anchor.className = 'crm-reaction-anchor';
      trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'crm-reaction-trigger';
      trigger.title = 'Reagir';
      trigger.setAttribute('aria-label', 'Reagir');
      trigger.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="10.2" r="1.25" fill="currentColor"/><circle cx="15" cy="10.2" r="1.25" fill="currentColor"/><path d="M8.2 14.2c1 1.5 2.3 2.2 3.8 2.2s2.8-.7 3.8-2.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
      anchor.appendChild(trigger);
      anchor.appendChild(picker);
      tools.appendChild(anchor);
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var open = trigger.getAttribute('aria-expanded') !== 'true';
        document.querySelectorAll('.crm-reaction-picker.is-open').forEach(function (item) {
          item.classList.remove('is-open');
        });
        document.querySelectorAll('.crm-reaction-trigger[aria-expanded="true"]').forEach(function (item) {
          item.setAttribute('aria-expanded', 'false');
        });
        if (!open) return;
        place();
        picker.style.translate = '';
        picker.classList.add('is-open');
        var panel = document.querySelector('.conversation-panel');
        var box = picker.getBoundingClientRect();
        if (panel && box.width) {
          var limits = panel.getBoundingClientRect();
          var shiftX = Math.max(limits.left + 6 - box.left, Math.min(0, limits.right - 6 - box.right));
          var shiftY = Math.max(limits.top + 6 - box.top, Math.min(0, limits.bottom - 6 - box.bottom));
          picker.style.translate = shiftX + 'px ' + shiftY + 'px';
        }
        trigger.setAttribute('aria-expanded', 'true');
      });
    }

    function place() {
      var containerRect = container.getBoundingClientRect();
      var bubbleRect = bubble.getBoundingClientRect();
      var toolHeight = tools.offsetHeight || 40;
      tools.style.top = (bubbleRect.bottom - containerRect.top - toolHeight) + 'px';
      if (bubble.classList.contains('right-bubble')) {
        tools.style.left = 'auto';
        tools.style.right = (containerRect.right - bubbleRect.left + 2) + 'px';
      } else {
        tools.style.right = 'auto';
        tools.style.left = (bubbleRect.right - containerRect.left + 2) + 'px';
      }
    }

    container.appendChild(tools);
    container.addEventListener('mouseenter', place);
    var holdTimer = 0;
    container.addEventListener('pointerdown', function (event) {
      if (event.target.closest('.crm-message-tools')) return;
      window.clearTimeout(holdTimer);
      holdTimer = window.setTimeout(function () {
        container.classList.add('is-held');
        place();
      }, 450);
    });
    container.addEventListener('pointerup', function () { window.clearTimeout(holdTimer); });
    container.addEventListener('pointercancel', function () { window.clearTimeout(holdTimer); });
  }

  function dayKey(text) {
    var raw = String(text || '').toLowerCase();
    var english = raw.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2})/);
    if (english) return english[1].slice(0, 3) + ' ' + Number(english[2]);
    var portuguese = raw.match(/(\d{1,2})\s+de\s+(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)/);
    if (!portuguese) return '';
    var months = { jan: 'jan', fev: 'feb', mar: 'mar', abr: 'apr', mai: 'may', jun: 'jun', jul: 'jul', ago: 'aug', set: 'sep', out: 'oct', nov: 'nov', dez: 'dec' };
    return months[portuguese[2]] + ' ' + Number(portuguese[1]);
  }

  function dayLabel(key) {
    var now = new Date();
    var names = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    var today = names[now.getMonth()] + ' ' + now.getDate();
    var previous = new Date(now.getTime() - 86400000);
    var yesterday = names[previous.getMonth()] + ' ' + previous.getDate();
    if (key === today) return 'Hoje';
    if (key === yesterday) return 'Ontem';
    return key.charAt(0).toUpperCase() + key.slice(1);
  }

  function placeDayChips() {
    var nodes = document.querySelectorAll('.conversation-panel .message-bubble-container');
    var last = '';
    for (var i = 0; i < nodes.length; i += 1) {
      var time = nodes[i].querySelector('.mt-2');
      var key = dayKey(time && time.textContent);
      if (!key) continue;
      var label = dayLabel(key);
      var previous = nodes[i].previousElementSibling;
      if (key === last) {
        if (previous && previous.classList.contains('crm-day-chip')) previous.remove();
        continue;
      }
      last = key;
      if (previous && previous.classList.contains('crm-day-chip')) {
        if (previous.textContent !== label) previous.textContent = label;
        continue;
      }
      var chip = document.createElement('div');
      chip.className = 'crm-day-chip';
      chip.textContent = label;
      nodes[i].parentNode.insertBefore(chip, nodes[i]);
    }
  }

  function scan() {
    hideReactionNotes();
    if (!conversationIds()) return;
    document.querySelectorAll('.message-bubble-container').forEach(attach);
    paintReactions();
    placeDayChips();
  }

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.message-bubble-container.is-held')) {
      document.querySelectorAll('.message-bubble-container.is-held').forEach(function (item) {
        item.classList.remove('is-held');
      });
    }
    if (event.target.closest('.crm-message-tools, .crm-reaction-picker')) return;
    document.querySelectorAll('.crm-reaction-picker.is-open').forEach(function (item) {
      item.classList.remove('is-open');
    });
    document.querySelectorAll('.crm-reaction-trigger[aria-expanded="true"]').forEach(function (item) {
      item.setAttribute('aria-expanded', 'false');
    });
  });

  var observer = new MutationObserver(function () {
    observer.disconnect();
    try {
      scan();
    } finally {
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  scan();
})();
