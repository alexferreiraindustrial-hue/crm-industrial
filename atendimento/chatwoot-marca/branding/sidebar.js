(function () {
  var EMBED = window.self !== window.top;
  var MOVE = {
    'Caixa de Entrada': true,
    'Contatos': true,
    'Relatórios': true,
    'Campanhas': true,
    'Central de Ajuda': true,
  };

  function accountBase() {
    var match = window.location.pathname.match(/\/app\/accounts\/(\d+)/);
    return match ? '/app/accounts/' + match[1] : '';
  }

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

  function itemLabel(item) {
    var titled = item.querySelector('[title]');
    return titled ? (titled.getAttribute('title') || '').trim() : '';
  }

  function link(label, href) {
    return '<a href="' + href + '">' + label + '</a>';
  }

  function extraMarkup(base) {
    return [
      '<li class="crm-sidebar-extra">' + link('Caixa de Entrada', base + '/inbox-view') + '</li>',
      '<li class="crm-sidebar-extra"><details><summary>Contatos</summary>' +
        link('Todos os Contatos', base + '/contacts') +
        link('Ativo', base + '/contacts/active') +
        '</details></li>',
      '<li class="crm-sidebar-extra"><details><summary>Relatórios</summary>' +
        link('Visão geral', base + '/reports/overview') +
        link('Conversas', base + '/reports/conversation') +
        link('CSAT', base + '/reports/csat') +
        link('SLA', base + '/reports/sla') +
        '</details></li>',
      '<li class="crm-sidebar-extra"><details><summary>Campanhas</summary>' +
        link('Chat ao vivo', base + '/campaigns/live_chat') +
        link('SMS', base + '/campaigns/sms') +
        link('WhatsApp', base + '/campaigns/whatsapp') +
        '</details></li>',
      '<li class="crm-sidebar-extra">' + link('Central de Ajuda', base + '/portals') + '</li>',
    ].join('');
  }

  function ensureExtra(list) {
    if (!list || list.querySelector('.crm-sidebar-extra')) return;
    var base = accountBase();
    if (!base) return;
    list.insertAdjacentHTML('afterbegin', extraMarkup(base));
  }

  var conversationsOpen = false;

  function applyConversations(item) {
    if (conversationsOpen) item.removeAttribute('data-crm-conversations-closed');
    else item.setAttribute('data-crm-conversations-closed', 'true');
  }

  document.addEventListener('click', function (event) {
    var kanbanLink = event.target.closest ? event.target.closest('a[href="#kanban"]:not(.crm-kanban a)') : null;
    if (kanbanLink) {
      event.preventDefault();
      document.body.setAttribute('data-crm-more', 'closed');
      if (window.crmKanban) window.crmKanban.open();
      return;
    }
    var calendarLink = event.target.closest ? event.target.closest('a[href="#calendario"]') : null;
    if (calendarLink) {
      event.preventDefault();
      openCalendar();
      return;
    }
    var header = event.target.closest ? event.target.closest('[title="Conversas"]') : null;
    if (header) {
      var item = header.closest('aside nav > ul > li');
      if (item && itemLabel(item) === 'Conversas') {
        conversationsOpen = !conversationsOpen;
        applyConversations(item);
      }
    }
    var paneButton = event.target.closest ? event.target.closest('.crm-checklist-switch button') : null;
    if (paneButton) {
      var checklist = paneButton.closest('[data-crm-checklist]');
      if (checklist) {
        checklist.setAttribute('data-crm-checklist-pane', paneButton.getAttribute('data-pane') || 'tarefas');
      }
    }
    var settingsToggle = event.target.closest ? event.target.closest('[data-crm-settings-toggle]') : null;
    if (settingsToggle) {
      var settingsOpen = document.body.getAttribute('data-crm-settings-nav') === 'open';
      document.body.setAttribute('data-crm-settings-nav', settingsOpen ? 'closed' : 'open');
      return;
    }
    var mobileTab = event.target.closest ? event.target.closest('.crm-mobile-bar a') : null;
    if (mobileTab) {
      var tabName = mobileTab.getAttribute('data-crm-tab');
      var onChecklist = window.location.pathname.indexOf('/task-checklist') !== -1;
      if ((tabName === 'atividades' || tabName === 'checklist') && onChecklist) {
        event.preventDefault();
        document.body.setAttribute('data-crm-more', 'closed');
        var checklistPageNode = checklistPage();
        if (checklistPageNode) {
          checklistPageNode.setAttribute('data-crm-checklist-pane', tabName === 'atividades' ? 'andamento' : 'tarefas');
        }
        if (tabName === 'atividades') history.replaceState(null, '', window.location.pathname + '#atividades');
        else history.replaceState(null, '', window.location.pathname);
        mountMobileBar();
        return;
      }
      if (navigateInApp(event, mobileTab)) {
        document.body.setAttribute('data-crm-more', 'closed');
        return;
      }
    }
    var moreButton =event.target.closest ? event.target.closest('[data-crm-more-button]') : null;
    if (moreButton) {
      event.preventDefault();
      var open = document.body.getAttribute('data-crm-more') === 'open';
      document.body.setAttribute('data-crm-more', open ? 'closed' : 'open');
      return;
    }
    if (!event.target.closest || !event.target.closest('.crm-mobile-more')) {
      if (document.body.getAttribute('data-crm-more') === 'open') {
        document.body.setAttribute('data-crm-more', 'closed');
      }
    }
  }, true);

  function arrange() {
    var root = document.querySelector('aside nav > ul');
    if (!root) return;
    var settingsList = null;
    Array.prototype.forEach.call(root.children, function (item) {
      if (item.tagName !== 'LI') return;
      var label = itemLabel(item);
      if (label === 'Tarefas Cheqlist') item.style.order = '1';
      else if (label === 'Conversas') item.style.order = '2';
      else item.style.order = '3';
      if (MOVE[label]) item.setAttribute('data-crm-sidebar-hidden', 'true');
      if (label === 'Conversas') applyConversations(item);
      if (label === 'Configurações') {
        settingsList = item.querySelector('ul');
      }
    });
    ensureExtra(settingsList);
    document.querySelectorAll('div.fixed').forEach(function (popover) {
      var heading = popover.querySelector('div > div');
      if (!heading || (heading.textContent || '').trim() !== 'Configurações') return;
      ensureExtra(popover.querySelector('ul'));
    });
  }

  function tabBar(node) {
    var current = node;
    var depth = 0;
    while (current && depth < 6) {
      var text = current.textContent || '';
      if (text.indexOf('Minhas') !== -1 && text.indexOf('Não atribuídas') !== -1) return current;
      current = current.parentElement;
      depth += 1;
    }
    return null;
  }

  function preferAllConversations() {
    var tabs = document.querySelectorAll('a, button, li, span');
    for (var i = 0; i < tabs.length; i += 1) {
      var node = tabs[i];
      if ((node.textContent || '').replace(/\s+/g, ' ').trim() !== 'Todos') continue;
      var bar = tabBar(node);
      if (!bar || bar.getAttribute('data-crm-all-set') === '1') continue;
      bar.setAttribute('data-crm-all-set', '1');
      if (node.closest('.active, [aria-selected="true"]')) return;
      node.click();
      return;
    }
  }

  function openConversations() {
    var base = accountBase();
    if (!base) return;
    if (window.location.pathname === base || window.location.pathname === base + '/') {
      window.location.replace(base + '/dashboard');
    }
  }

  // A cada login as barras laterais começam minimizadas, como no WhatsApp Web: barra de ícones fechada,
  // barra do Chatwoot recolhida e painel do contato fechado. Dentro do mesmo login vale o que a pessoa abrir.
  // Cada login gera um "client" novo no cookie de sessão; é ele que marca o login.
  var LOGIN_KEY = 'crm-barras-login';

  function collapseSidebar() {
    if (EMBED) return;
    var headers = authHeaders();
    var id = headers && headers.client ? String(headers.client) + '|' + headers.uid : '';
    if (!id) return;
    var seen = '';
    try { seen = window.localStorage.getItem(LOGIN_KEY) || ''; } catch (error) { return; }
    if (seen === id) return;
    var root = appStore();
    var store = root && root.$store;
    var user = store && store.getters.getCurrentUser;
    if (!user || !user.id) return;
    try {
      window.localStorage.setItem(LOGIN_KEY, id);
      window.localStorage.setItem(MENU_KEY, 'fechado');
    } catch (error) { /* sem armazenamento: fica como está */ }
    applyMenu();
    var ui = user.ui_settings || {};
    if (Number(ui.sidebar_width) > 80 || ui.is_contact_sidebar_open) {
      store.dispatch('updateUISettings', { uiSettings: Object.assign({}, ui, { sidebar_width: 56, is_contact_sidebar_open: false }) });
    }
  }

  var performanceCache = null;
  var performanceSignature = '';
  var performanceRequest = 0;
  var performanceLoading = false;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function checklistPage() {
    if (window.location.pathname.indexOf('/task-checklist') === -1) return null;
    var headings = document.querySelectorAll('h1');
    for (var i = 0; i < headings.length; i += 1) {
      if (/^Tarefas (Cheqlist|e Checklist)$/.test((headings[i].textContent || '').trim())) {
        return headings[i].closest('section');
      }
    }
    return null;
  }

  function checklistSignature(page) {
    var boxes = page.querySelectorAll('input[type="checkbox"]');
    var total = 0;
    var checked = 0;
    for (var i = 0; i < boxes.length; i += 1) {
      if (boxes[i].closest('.crm-performance')) continue;
      total += 1;
      if (boxes[i].checked) checked += 1;
    }
    return total + ':' + checked;
  }

  function weekDelta(current, previous) {
    var delta = current - previous;
    if (delta === 0) return 'igual à semana anterior';
    return delta > 0 ? '+' + delta + ' que a semana anterior' : delta + ' que a semana anterior';
  }

  function barPath(x, width, base, height) {
    var radius = Math.min(4, height, width / 2);
    var top = base - height;
    return 'M' + x + ' ' + base + 'V' + (top + radius) + 'Q' + x + ' ' + top + ' ' + (x + radius) + ' ' + top +
      'H' + (x + width - radius) + 'Q' + (x + width) + ' ' + top + ' ' + (x + width) + ' ' + (top + radius) + 'V' + base + 'Z';
  }

  function ringMarkup(rate, done, total) {
    var radius = 50;
    var circumference = 2 * Math.PI * radius;
    var value = rate > 0
      ? '<circle class="v" cx="60" cy="60" r="' + radius + '" stroke-dasharray="' + ((rate / 100) * circumference).toFixed(1) + ' ' + circumference.toFixed(1) + '" transform="rotate(-90 60 60)"></circle>'
      : '';
    return '<div class="crm-dash-ring" data-tip="' + done + ' de ' + total + ' tarefas concluídas">' +
      '<svg viewBox="0 0 120 120" role="img" aria-label="' + rate + '% das tarefas concluídas">' +
      '<circle class="t" cx="60" cy="60" r="' + radius + '"></circle>' + value + '</svg>' +
      '<div class="c"><b>' + rate + '%</b><span>concluído</span></div></div>';
  }

  function plural(count, one, many) {
    return count + ' ' + (count === 1 ? one : many);
  }

  function weekChartMarkup(items) {
    var names = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    var days = [];
    for (var i = 6; i >= 0; i -= 1) {
      var day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      days.push({ start: day.getTime(), name: names[day.getDay()], date: day.getDate() + '/' + (day.getMonth() + 1), created: 0, done: 0 });
    }
    days.forEach(function (bucket, index) {
      var end = index < 6 ? days[index + 1].start : Infinity;
      items.forEach(function (item) {
        if (item.created >= bucket.start && item.created < end) bucket.created += 1;
        if (item.done && item.updated >= bucket.start && item.updated < end) bucket.done += 1;
      });
    });
    var max = 1;
    days.forEach(function (bucket) { max = Math.max(max, bucket.created, bucket.done); });
    var width = 340;
    var left = 18;
    var base = 104;
    var plot = 92;
    var slot = (width - left) / 7;
    var barWidth = 11;
    var marks = '';
    var labels = '';
    var hits = '';
    days.forEach(function (bucket, index) {
      var center = left + slot * index + slot / 2;
      if (bucket.created) marks += '<path class="created" d="' + barPath(center - barWidth - 1, barWidth, base, Math.max(3, (bucket.created / max) * plot)) + '"></path>';
      if (bucket.done) marks += '<path class="done" d="' + barPath(center + 1, barWidth, base, Math.max(3, (bucket.done / max) * plot)) + '"></path>';
      labels += '<text x="' + center + '" y="120" text-anchor="middle"' + (index === 6 ? ' class="today"' : '') + '>' + (index === 6 ? 'hoje' : bucket.name) + '</text>';
      hits += '<rect class="hit" rx="6" x="' + (left + slot * index + 2) + '" y="6" width="' + (slot - 4) + '" height="' + (base - 6) + '" data-tip="' +
        bucket.name + ', ' + bucket.date + ' · ' + plural(bucket.created, 'criada', 'criadas') + ' · ' + plural(bucket.done, 'concluída', 'concluídas') + '"></rect>';
    });
    var totalCreated = days.reduce(function (sum, bucket) { return sum + bucket.created; }, 0);
    var totalDone = days.reduce(function (sum, bucket) { return sum + bucket.done; }, 0);
    return '<svg class="crm-dash-chart" viewBox="0 0 ' + width + ' 126" role="img" aria-label="Últimos 7 dias: ' + plural(totalCreated, 'tarefa criada', 'tarefas criadas') + ' e ' + plural(totalDone, 'concluída', 'concluídas') + '">' +
      '<line x1="' + left + '" x2="' + width + '" y1="' + (base - plot) + '" y2="' + (base - plot) + '"></line>' +
      '<line x1="' + left + '" x2="' + width + '" y1="' + base + '" y2="' + base + '"></line>' +
      '<text x="0" y="' + (base - plot + 4) + '">' + max + '</text><text x="0" y="' + (base + 4) + '">0</text>' +
      hits + marks + labels + '</svg>';
  }

  function performanceMarkup(lists) {
    var items = [];
    lists.forEach(function (list) {
      (list.items || []).forEach(function (item) {
        items.push({
          id: item.id,
          title: item.title,
          done: item.done,
          listName: list.name,
          created: item.created_at ? Date.parse(item.created_at) : NaN,
          updated: item.updated_at ? Date.parse(item.updated_at) : NaN,
        });
      });
    });
    var open = items.filter(function (item) { return !item.done; });
    var done = items.length - open.length;
    var rate = items.length ? Math.round((done / items.length) * 100) : 0;
    var now = Date.now();
    var week = 7 * 24 * 60 * 60 * 1000;
    var doneNow = 0;
    var donePrevious = 0;
    var dated = false;
    items.forEach(function (item) {
      if (!isNaN(item.created) || !isNaN(item.updated)) dated = true;
      if (!item.done || isNaN(item.updated)) return;
      if (item.updated >= now - week) doneNow += 1;
      else if (item.updated >= now - week * 2 && item.updated < now - week) donePrevious += 1;
    });
    var pending = open.slice(0, 5).map(function (item) {
      return '<div class="crm-performance-row"><span>' + escapeHtml(item.title) +
        '</span><span>' + escapeHtml(item.listName) + '</span></div>';
    }).join('');
    var bars = lists.map(function (list) {
      var total = (list.items || []).length;
      var finished = (list.items || []).filter(function (item) { return item.done; }).length;
      var listRate = total ? Math.round((finished / total) * 100) : 0;
      return '<div class="crm-dash-list" data-tip="' + escapeHtml(list.name) + ': ' + listRate + '%"><p><span>' + escapeHtml(list.name) + '</span><span>' +
        (total ? finished + ' de ' + total : 'sem tarefas') + '</span></p>' +
        '<div class="crm-performance-track"><div class="crm-performance-fill" style="width:' + listRate + '%"></div></div></div>';
    }).join('');
    var weekBlock = dated
      ? weekChartMarkup(items) + '<p class="crm-dash-note">' + plural(doneNow, 'concluída', 'concluídas') + ' em 7 dias, ' + weekDelta(doneNow, donePrevious) + '.</p>'
      : '<p class="crm-performance-empty">O gráfico aparece conforme as tarefas são criadas e concluídas.</p>';
    var today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    var focus = open.length
      ? plural(open.length, 'tarefa para fazer', 'tarefas para fazer')
      : 'Tudo em dia';
    return '<section class="crm-performance" data-open="' + open.length + '">' +
      '<div class="crm-performance-head"><p class="crm-performance-kicker">Andamento</p><p class="crm-performance-label">' +
      escapeHtml(today) + '</p></div><p class="crm-performance-focus">' + focus + '</p>' +
      '<div class="crm-dash-hero">' + ringMarkup(rate, done, items.length) +
      '<dl class="crm-dash-stats"><div><dt>Em aberto</dt><dd>' + open.length + '</dd></div><div><dt>Concluídas</dt><dd>' + done + '</dd></div><div><dt>Listas</dt><dd>' + lists.length + '</dd></div></dl></div>' +
      '<div class="crm-dash-card"><div class="crm-dash-head"><p class="crm-dash-title">Últimos 7 dias</p>' +
      (dated ? '<div class="crm-dash-legend"><span><i class="created"></i>Criadas</span><span><i class="done"></i>Concluídas</span></div>' : '') +
      '</div>' + weekBlock + '</div>' +
      (bars ? '<div class="crm-dash-card"><div class="crm-dash-head"><p class="crm-dash-title">Progresso por lista</p></div>' + bars + '</div>' : '') +
      (pending ? '<div class="crm-dash-card"><div class="crm-dash-head"><p class="crm-dash-title">Pendências</p></div>' + pending + '</div>' : '') +
      '</section>';
  }

  function animateBars(root) {
    var fills = root.querySelectorAll('.crm-performance-fill');
    for (var i = 0; i < fills.length; i += 1) {
      var target = fills[i].style.width;
      fills[i].style.width = '0%';
      (function (fill, width) {
        requestAnimationFrame(function () {
          fill.style.width = width;
        });
      })(fills[i], target);
    }
  }

  function placePerformance(page, html) {
    page.setAttribute('data-crm-checklist', 'true');
    var current = page.querySelectorAll(':scope > .crm-performance');
    for (var i = 0; i < current.length; i += 1) current[i].remove();
    page.insertAdjacentHTML('beforeend', html);
    var panel = page.querySelector(':scope > .crm-performance');
    if (panel) animateBars(panel);
  }

  function checklistMobile() {
    var page = checklistPage();
    if (!page) return;
    var narrow = window.matchMedia('(max-width: 767px)').matches;
    var switcher = page.querySelector(':scope > .crm-checklist-switch');
    if (!narrow) {
      page.removeAttribute('data-crm-checklist-pane');
      if (switcher) switcher.remove();
      return;
    }
    if (!switcher) {
      page.insertAdjacentHTML('afterbegin',
        '<div class="crm-checklist-switch" role="tablist">' +
        '<button type="button" data-pane="tarefas">Tarefas</button>' +
        '<button type="button" data-pane="andamento">Andamento</button></div>');
    }
    if (window.location.hash === '#atividades') {
      page.setAttribute('data-crm-checklist-pane', 'andamento');
    } else if (!page.getAttribute('data-crm-checklist-pane')) {
      page.setAttribute('data-crm-checklist-pane', 'tarefas');
    }
  }

  function markPage() {
    var path = window.location.pathname;
    var module = 'app';
    if (path.indexOf('/task-checklist') !== -1) module = 'checklist';
    else if (path.indexOf('/contacts') !== -1) module = 'contacts';
    else if (path.indexOf('/reports') !== -1) module = 'reports';
    else if (path.indexOf('/campaigns') !== -1) module = 'campaigns';
    else if (path.indexOf('/portals') !== -1) module = 'help';
    else if (path.indexOf('/inbox-view') !== -1 || path.indexOf('/settings/inboxes') !== -1) module = 'inbox';
    else if (path.indexOf('/settings') !== -1) module = 'settings';
    else if (path.indexOf('/dashboard') !== -1 || path.indexOf('/conversations') !== -1) module = 'conversations';
    var shell = module === 'checklist' || module === 'conversations' || module === 'app' ? module : 'settings';
    if (document.body.getAttribute('data-crm-page') !== shell) {
      document.body.setAttribute('data-crm-page', shell);
    }
    if (document.body.getAttribute('data-crm-module') !== module) {
      document.body.setAttribute('data-crm-module', module);
    }
    var view = module === 'checklist' && window.location.hash === '#atividades' ? 'atividades' : 'padrao';
    if (document.body.getAttribute('data-crm-view') !== view) {
      document.body.setAttribute('data-crm-view', view);
    }
  }

  function markActivityDialog() {
    var dialogs = document.querySelectorAll('dialog');
    for (var i = 0; i < dialogs.length; i += 1) {
      var title = dialogs[i].querySelector('h3');
      var text = title ? (title.textContent || '').trim() : '';
      if (text === 'Criar atividade' || text === 'Atividade') {
        dialogs[i].setAttribute('data-crm-activity-dialog', 'true');
        mountDueField(dialogs[i]);
      }
    }
  }

  function mountDueField(dialog) {
    if (!dialog || dialog.querySelector('[data-crm-due]')) return;
    var title = dialog.querySelector('input[type="text"]');
    if (!title || !title.parentElement) return;
    var label = document.createElement('label');
    label.className = 'crm-due';
    label.textContent = 'Prazo';
    var input = document.createElement('input');
    input.type = 'date';
    input.setAttribute('data-crm-due', 'true');
    label.appendChild(input);
    title.parentElement.insertAdjacentElement('afterend', label);
    var makeCard = document.createElement('label');
    makeCard.className = 'crm-make-card';
    makeCard.innerHTML = '<input type="checkbox" data-crm-make-card> <span>Gerar card no Kanban</span>';
    label.insertAdjacentElement('afterend', makeCard);
  }

  // Depois que a atividade é salva, abre o mesmo formulário de card com os dados dela.
  function offerCardFromActivity(data, activityId) {
    var match = window.location.pathname.match(/\/conversations\/(\d+)/);
    if (!match || !window.crmKanban) return;
    var priorities = { low: 1, medium: 2, high: 3 };
    var tries = 0;
    (function whenDialogCloses() {
      if (document.querySelector('dialog[open][data-crm-activity-dialog]') && tries < 40) {
        tries += 1;
        window.setTimeout(whenDialogCloses, 50);
        return;
      }
      window.crmKanban.createCard({ conversationId: match[1] }, { title: data.title, due_on: data.due_on, priority: priorities[data.priority] || 0, work_activity_id: activityId });
    })();
  }

  function loadPerformance(page, signature) {
    var base = accountBase();
    var headers = authHeaders();
    if (!base || !headers) return;
    performanceLoading = true;
    var request = performanceRequest + 1;
    performanceRequest = request;
    var accountId = base.split('/').pop();
    fetch('/api/v1/accounts/' + accountId + '/checklist_lists', {
      credentials: 'same-origin',
      headers: headers,
    }).then(function (response) {
      if (!response.ok) throw new Error('listas');
      return response.json();
    }).then(function (lists) {
      if (request !== performanceRequest) return;
      performanceCache = Array.isArray(lists) ? lists : [];
      performanceSignature = signature;
      performanceLoading = false;
      placePerformance(page, performanceMarkup(performanceCache));
    }).catch(function () {
      if (request !== performanceRequest) return;
      performanceLoading = false;
      placePerformance(page, '<section class="crm-performance"><p class="crm-performance-empty">Não foi possível carregar o desempenho.</p></section>');
    });
  }

  function mountPerformance() {
    var page = checklistPage();
    if (!page) return;
    page.setAttribute('data-crm-checklist', 'true');
    checklistMobile();
    if (performanceLoading) return;
    var signature = checklistSignature(page);
    if (!page.querySelector(':scope > .crm-performance') || signature !== performanceSignature) {
      loadPerformance(page, signature);
    }
  }

  function activityLabel(kind, value) {
    var labels = {
      whatsapp: 'WhatsApp',
      email: 'E-mail',
      other: 'Outro',
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      pending: 'Pendente',
      in_progress: 'Em andamento',
    };
    return labels[kind + ':' + value] || labels[value] || '';
  }

  function activityDate(value) {
    var date = new Date(value);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  }

  function dateOnly(value) {
    var match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return activityDate(value);
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  }

  // Atividades: tela própria, organizada por prazo. Só mostra número que vem de dado registrado.
  var reminders = { filter: 'all', term: '', owner: 'all', priority: 'all', open: [], done: [], loadedAt: 0, loading: false, request: 0, signature: '' };
  try {
    var savedReminderFilters = JSON.parse(window.localStorage.getItem('crm-atividades-filtros') || '{}');
    reminders.owner = savedReminderFilters.owner || 'all';
    reminders.priority = savedReminderFilters.priority || 'all';
  } catch (error) { /* sem armazenamento: começa sem filtro */ }

  function saveReminderFilters() {
    try { window.localStorage.setItem('crm-atividades-filtros', JSON.stringify({ owner: reminders.owner, priority: reminders.priority })); } catch (error) { /* aba privada */ }
  }

  function currentUserId() {
    var store = appStore().$store;
    var user = store && store.getters.getCurrentUser;
    return user ? user.id : null;
  }

  // Responsável e prioridade, junto com a busca.
  function reminderFilterMatches(activity) {
    var owner = activity.assignee && activity.assignee.id;
    if (reminders.owner === 'mine' && owner !== currentUserId()) return false;
    if (reminders.owner === 'none' && owner) return false;
    if (/^\d+$/.test(reminders.owner) && String(owner) !== reminders.owner) return false;
    return reminders.priority === 'all' || activity.priority === reminders.priority;
  }

  function reminderOwnerOptions() {
    var people = {};
    reminders.open.concat(reminders.done).forEach(function (activity) {
      if (activity.assignee && activity.assignee.id) people[activity.assignee.id] = activity.assignee.name;
    });
    var options = [['all', 'Todos os responsáveis'], ['mine', 'Minhas'], ['none', 'Sem responsável']].concat(Object.keys(people).sort(function (a, b) {
      return String(people[a]).localeCompare(String(people[b]));
    }).map(function (id) { return [id, people[id]]; }));
    return options.map(function (option) { return '<option value="' + escapeHtml(option[0]) + '"' + (reminders.owner === String(option[0]) ? ' selected' : '') + '>' + escapeHtml(option[1]) + '</option>'; }).join('');
  }
  var REMINDER_SECTIONS = [['late', 'Atrasados'], ['today', 'Para hoje'], ['next', 'Próximos'], ['none', 'Sem prazo']];

  function spDate(offsetDays) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' })
      .format(new Date(Date.now() + (offsetDays || 0) * 86400000));
  }

  function dayGap(from, to) {
    return Math.round((Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / 86400000);
  }

  function reminderBucket(activity) {
    if (!activity.due_on) return 'none';
    var due = String(activity.due_on).slice(0, 10);
    var today = spDate();
    if (due < today) return 'late';
    return due === today ? 'today' : 'next';
  }

  function reminderDue(activity) {
    if (!activity.due_on) return 'Sem prazo';
    var due = String(activity.due_on).slice(0, 10);
    var gap = dayGap(spDate(), due);
    if (gap === 0) return 'Hoje';
    if (gap === 1) return 'Amanhã';
    return 'Prazo: ' + due.split('-').reverse().join('/');
  }

  function reminderMatches(activity) {
    if (!reminderFilterMatches(activity)) return false;
    var term = reminders.term.trim().toLowerCase();
    if (!term) return true;
    return [activity.title, activity.contact_name, activity.assignee && activity.assignee.name].join(' ').toLowerCase().indexOf(term) !== -1;
  }

  function reminderRow(activity, base, bucket) {
    var priority = activityLabel('', activity.priority);
    var origin = [activityLabel('', activity.origin), activity.contact_name].filter(Boolean).join(' • ');
    var owner = activity.assignee && activity.assignee.name;
    var due = activity.due_on ? String(activity.due_on).slice(0, 10) : '';
    var late = bucket === 'late' ? dayGap(due, spDate()) : 0;
    var href = base + '/conversations/' + encodeURIComponent(activity.conversation_id);
    return '<article class="crm-rem" data-bucket="' + bucket + '" data-priority="' + escapeHtml(activity.priority || '') + '">' +
      '<div class="crm-rem-main"><p class="crm-rem-title" data-rem-files="' + activity.id + '" title="Ver atividade">' + escapeHtml(activity.title) + '</p><p class="crm-rem-meta">' +
      (priority ? '<span class="crm-rem-prio">' + escapeHtml(priority) + '</span>' : '') +
      (origin ? '<span>' + escapeHtml(origin) + '</span>' : '') +
      (owner ? '<span>Responsável: ' + escapeHtml(owner) + '</span>' : '') +
      '<span class="crm-rem-due">' + escapeHtml(bucket === 'done' ? 'Concluído' : reminderDue(activity)) + '</span></p></div>' +
      (late ? '<span class="crm-rem-ring" title="Atrasado há ' + late + (late === 1 ? ' dia' : ' dias') + '">' + late + ' d</span>' : '') +
      '<div class="crm-rem-actions">' +
      (bucket === 'done' ? '<button type="button" data-rem-status="pending" data-id="' + activity.id + '">Reabrir</button>' : '<button type="button" class="is-done" data-rem-status="done" data-id="' + activity.id + '">Concluir</button>') +
      '<a href="' + href + '">Abrir conversa</a>' +
      '<button type="button" class="is-icon crm-clip" data-rem-files="' + activity.id + '" title="' + (activity.attachments_count ? activity.attachments_count + (activity.attachments_count === 1 ? ' anexo' : ' anexos') : 'Anexar arquivo ou print') + '" aria-label="Anexos">' + CLIP_ICON + '<b>' + (activity.attachments_count || '') + '</b></button>' +
      '<button type="button" class="is-icon" data-rem-menu="' + activity.id + '" aria-label="Mais opções">⋯</button></div></article>';
  }

  function reminderCounts() {
    var counts = { late: 0, today: 0, next: 0, none: 0 };
    reminders.open.filter(reminderFilterMatches).forEach(function (activity) { counts[reminderBucket(activity)] += 1; });
    return counts;
  }

  function weekOfDone() {
    var days = [];
    for (var i = 6; i >= 0; i -= 1) days.push({ key: spDate(-i), total: 0 });
    reminders.done.forEach(function (activity) {
      var key = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(activity.updated_at));
      days.forEach(function (day) { if (day.key === key) day.total += 1; });
    });
    return days;
  }

  function sparkline(days) {
    var top = Math.max.apply(null, days.map(function (day) { return day.total; }));
    if (!top) return '<p class="crm-rem-empty">O gráfico aparece quando houver lembretes concluídos.</p>';
    var point = function (day, index) { return [Math.round(8 + (index * 244) / 6), Math.round(66 - (day.total / top) * 52)]; };
    var line = days.map(function (day, index) { return point(day, index).join(','); }).join(' ');
    var dots = days.map(function (day, index) {
      var xy = point(day, index);
      return '<circle cx="' + xy[0] + '" cy="' + xy[1] + '" r="3.5"><title>' + day.key.split('-').reverse().slice(0, 2).join('/') + ': ' + day.total + '</title></circle>';
    }).join('');
    return '<svg class="crm-rem-spark" viewBox="0 0 260 78" role="img" aria-label="Lembretes concluídos nos últimos 7 dias"><polygon points="8,76 ' + line + ' 252,76"></polygon><polyline points="' + line + '"></polyline>' + dots + '</svg>';
  }

  function paintReminders(root) {
    var base = accountBase();
    var counts = reminderCounts();
    var doneWeek = weekOfDone().reduce(function (sum, day) { return sum + day.total; }, 0);
    var pending = reminders.open.filter(reminderFilterMatches).length;
    root.querySelector('[data-rem-sub]').textContent = plural(pending, 'lembrete pendente', 'lembretes pendentes') + ' | ' + counts.today + ' para hoje | ' + plural(counts.late, 'atrasado', 'atrasados');
    var owner = root.querySelector('[data-rem-owner]');
    if (owner) owner.innerHTML = reminderOwnerOptions();
    var chips = [['all', 'Todos', pending], ['late', 'Atrasados', counts.late], ['today', 'Hoje', counts.today], ['next', 'Próximos', counts.next], ['none', 'Sem prazo', counts.none], ['done', 'Concluídos', reminders.done.filter(reminderFilterMatches).length]];
    root.querySelector('[data-rem-chips]').innerHTML = chips.map(function (chip) {
      return '<button type="button" data-rem-filter="' + chip[0] + '" data-tone="' + chip[0] + '" class="' + (reminders.filter === chip[0] ? 'is-on' : '') + '">' + chip[1] + ' (' + chip[2] + ')</button>';
    }).join('');
    var html = '';
    if (reminders.filter === 'done') {
      var finished = reminders.done.filter(reminderMatches);
      html = finished.length ? '<h2 class="crm-rem-section" data-bucket="done">Concluídos nos últimos 14 dias</h2>' + finished.map(function (item) { return reminderRow(item, base, 'done'); }).join('') : '';
    } else {
      REMINDER_SECTIONS.forEach(function (section) {
        if (reminders.filter !== 'all' && reminders.filter !== section[0]) return;
        var rows = reminders.open.filter(function (item) { return reminderBucket(item) === section[0] && reminderMatches(item); })
          .sort(function (a, b) { return String(a.due_on || '').localeCompare(String(b.due_on || '')); });
        if (rows.length) html += '<h2 class="crm-rem-section" data-bucket="' + section[0] + '">' + section[1] + '</h2>' + rows.map(function (item) { return reminderRow(item, base, section[0]); }).join('');
      });
    }
    root.querySelector('[data-rem-list]').innerHTML = html || '<p class="crm-rem-empty is-main">Nenhum lembrete aqui. Eles nascem nas atividades criadas nas conversas.</p>';
    var upcoming = reminders.open.filter(function (item) { return item.due_on && String(item.due_on).slice(0, 10) >= spDate(); })
      .sort(function (a, b) { return String(a.due_on).localeCompare(String(b.due_on)); })[0];
    var stat = function (tone, value, label) { return '<li data-tone="' + tone + '"><i></i><b>' + value + '</b><span>' + label + '</span></li>'; };
    root.querySelector('[data-rem-side]').innerHTML = '<h2>Resumo</h2><ul class="crm-rem-stats">' + stat('late', counts.late, 'Atrasados') + stat('today', counts.today, 'Para hoje') + stat('next', counts.next, 'Próximos') + stat('done', doneWeek, 'Concluídos em 7 dias') + '</ul>' +
      '<div class="crm-rem-next"><p>Próximo lembrete</p>' + (upcoming ? '<strong>' + escapeHtml(upcoming.title) + '</strong><span>' + escapeHtml([reminderDue(upcoming), upcoming.contact_name].filter(Boolean).join(' • ')) + '</span>' : '<span>Nenhum com prazo marcado.</span>') + '</div>' +
      '<div class="crm-rem-chart"><p>Concluídos nos últimos 7 dias</p>' + sparkline(weekOfDone()) + '</div>';
  }

  function changeReminder(root, id, changes) {
    checklistRequest('PATCH', '/work_activities/' + id, changes).then(function () {
      reminders.loadedAt = 0;
      loadReminders(root);
    }).catch(function () {
      if (window.crmKanban && window.crmKanban.toast) window.crmKanban.toast('Não foi possível salvar. Tente de novo.', 'error');
    });
  }

  function reminderMenu(root, anchor, id) {
    if (!window.crmKanban || !window.crmKanban.menu) return;
    var activity = reminders.open.concat(reminders.done).filter(function (item) { return String(item.id) === String(id); })[0];
    if (!activity) return;
    window.crmKanban.menu(anchor, [{ label: 'Alterar prazo', run: function () {
      window.crmKanban.dialog({
        title: 'Alterar prazo', narrow: true, submit: 'Salvar',
        body: '<label class="kb-field">Prazo<input type="date" name="due_on" value="' + escapeHtml(activity.due_on ? String(activity.due_on).slice(0, 10) : '') + '"></label>',
        onSubmit: function (form) {
          return checklistRequest('PATCH', '/work_activities/' + id, { due_on: form.querySelector('[name=due_on]').value || null }).then(function () {
            reminders.loadedAt = 0;
            loadReminders(root);
          });
        },
      });
    } }]);
  }

  function loadReminders(root) {
    if (reminders.loading) return;
    reminders.loading = true;
    var request = reminders.request + 1;
    reminders.request = request;
    Promise.all([checklistRequest('GET', '/work_activities'), checklistRequest('GET', '/work_activities?recent_done=1')]).then(function (results) {
      if (request !== reminders.request) return;
      reminders.loading = false;
      reminders.loadedAt = Date.now();
      var view = document.querySelector('.crm-reminders') || root;
      var signature = JSON.stringify(results);
      if (signature === reminders.signature && view.getAttribute('data-loaded')) return;
      reminders.signature = signature;
      reminders.open = Array.isArray(results[0]) ? results[0] : [];
      reminders.done = Array.isArray(results[1]) ? results[1] : [];
      view.setAttribute('data-loaded', 'true');
      paintReminders(view);
    }).catch(function () {
      reminders.loading = false;
      reminders.loadedAt = Date.now();
      root.querySelector('[data-rem-list]').innerHTML = '<p class="crm-rem-empty is-main">Não foi possível carregar os lembretes.</p>';
    });
  }

  function createRemindersView(page) {
    var root = document.createElement('section');
    root.className = 'crm-reminders';
    root.innerHTML = '<div class="crm-rem-page"><header class="crm-rem-head"><div><h1>Lembretes</h1><p data-rem-sub></p></div>' +
      '<div class="crm-rem-tools"><select class="crm-rem-select" data-rem-owner aria-label="Responsável">' + reminderOwnerOptions() + '</select>' +
      '<select class="crm-rem-select" data-rem-priority aria-label="Prioridade">' + [['all', 'Todas as prioridades'], ['high', 'Prioridade alta'], ['medium', 'Prioridade média'], ['low', 'Prioridade baixa']].map(function (option) {
        return '<option value="' + option[0] + '"' + (reminders.priority === option[0] ? ' selected' : '') + '>' + option[1] + '</option>';
      }).join('') + '</select>' +
      '<label class="crm-rem-search">' + icon('M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z') + '<input type="search" data-rem-search placeholder="Buscar" aria-label="Buscar lembretes"></label></div></header>' +
      '<div class="crm-rem-chips" data-rem-chips></div><div class="crm-rem-list" data-rem-list><p class="crm-rem-empty is-main">Carregando...</p></div></div><aside class="crm-rem-side" data-rem-side></aside>';
    root.addEventListener('input', function (event) {
      if (!event.target.hasAttribute('data-rem-search')) return;
      reminders.term = event.target.value;
      paintReminders(root);
    });
    root.addEventListener('change', function (event) {
      if (event.target.hasAttribute('data-rem-owner')) reminders.owner = event.target.value;
      else if (event.target.hasAttribute('data-rem-priority')) reminders.priority = event.target.value;
      else return;
      saveReminderFilters();
      paintReminders(root);
    });
    root.addEventListener('click', function (event) {
      var filter = event.target.closest('[data-rem-filter]');
      var status = event.target.closest('[data-rem-status]');
      var menu = event.target.closest('[data-rem-menu]');
      var view = event.target.closest('[data-rem-files]');
      if (view) {
        var shown = reminders.open.concat(reminders.done).filter(function (item) { return String(item.id) === view.getAttribute('data-rem-files'); })[0];
        if (shown) {
          openItemView('activity', shown.id, activityView(shown, function (count) {
            if ((shown.attachments_count || 0) === count) return;
            shown.attachments_count = count;
            paintReminders(root);
          }));
        }
      } else if (filter) {
        reminders.filter = filter.getAttribute('data-rem-filter');
        paintReminders(root);
      } else if (status) {
        status.disabled = true;
        changeReminder(root, status.getAttribute('data-id'), { status: status.getAttribute('data-rem-status') });
      } else if (menu) {
        event.stopPropagation();
        reminderMenu(root, menu, menu.getAttribute('data-rem-menu'));
      }
    });
    page.appendChild(root);
    if (reminders.loadedAt && reminders.signature) {
      root.querySelector('[data-rem-search]').value = reminders.term;
      root.setAttribute('data-loaded', 'true');
      paintReminders(root);
    }
    return root;
  }

  function mountActivities() {
    var page = checklistPage();
    if (!page) return;
    var on = window.location.hash === '#atividades';
    if (page.getAttribute('data-crm-reminders') !== (on ? 'on' : 'off')) page.setAttribute('data-crm-reminders', on ? 'on' : 'off');
    if (!on) return;
    var root = page.querySelector(':scope > .crm-reminders') || createRemindersView(page);
    if (Date.now() - reminders.loadedAt >= 15000) loadReminders(root);
  }

  var MATERIAL_ICONS = {"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z":["M240-240 131-131q-14 14-32.5 6.34Q80-132.31 80-152v-668q0-24 18-42t42-18h680q24 0 42 18t18 42v520q0 24-18 42t-42 18H240Zm-26-60h606v-520H140v600l74-80Zm-74 0v-520 520Zm130-99h253q12.75 0 21.38-8.68 8.62-8.67 8.62-21.5 0-12.82-8.62-21.32-8.63-8.5-21.38-8.5H270q-12.75 0-21.37 8.68-8.63 8.67-8.63 21.5 0 12.82 8.63 21.32 8.62 8.5 21.37 8.5Zm0-130h420q12.75 0 21.38-8.68 8.62-8.67 8.62-21.5 0-12.82-8.62-21.32-8.63-8.5-21.38-8.5H270q-12.75 0-21.37 8.68-8.63 8.67-8.63 21.5 0 12.82 8.63 21.32 8.62 8.5 21.37 8.5Zm0-130h420q12.75 0 21.38-8.68 8.62-8.67 8.62-21.5 0-12.82-8.62-21.32-8.63-8.5-21.38-8.5H270q-12.75 0-21.37 8.68-8.63 8.67-8.63 21.5 0 12.82 8.63 21.32 8.62 8.5 21.37 8.5Z","M240-240 131-131q-14 14-32.5 6.34Q80-132.31 80-152v-668q0-24 18-42t42-18h680q24 0 42 18t18 42v520q0 24-18 42t-42 18H240Zm30-159h253q12.75 0 21.38-8.68 8.62-8.67 8.62-21.5 0-12.82-8.62-21.32-8.63-8.5-21.38-8.5H270q-12.75 0-21.37 8.68-8.63 8.67-8.63 21.5 0 12.82 8.63 21.32 8.62 8.5 21.37 8.5Zm0-130h420q12.75 0 21.38-8.68 8.62-8.67 8.62-21.5 0-12.82-8.62-21.32-8.63-8.5-21.38-8.5H270q-12.75 0-21.37 8.68-8.63 8.67-8.63 21.5 0 12.82 8.63 21.32 8.62 8.5 21.37 8.5Zm0-130h420q12.75 0 21.38-8.68 8.62-8.67 8.62-21.5 0-12.82-8.62-21.32-8.63-8.5-21.38-8.5H270q-12.75 0-21.37 8.68-8.63 8.67-8.63 21.5 0 12.82 8.63 21.32 8.62 8.5 21.37 8.5Z"],"M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11":["m222-299 158-158q9-9 21-8.5t21.39 9.5q8.61 9 8.61 21t-9 21L243-235q-9 9-21 9t-21-9L101-335q-9-9-9-21t9-21q9-9 21-8.5t21 8.5l79 78Zm0-320 158-158q9-9 21-8.5t21.39 9.5q8.61 9 8.61 21t-9 21L243-555q-9 9-21 9t-21-9L101-655q-9-9-9-21t9-21q9-9 21-8.5t21 8.5l79 78Zm328 329q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h300q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H550Zm0-320q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h300q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H550Z","m222-299 158-158q9-9 21-8.5t21.39 9.5q8.61 9 8.61 21t-9 21L243-235q-9 9-21 9t-21-9L101-335q-9-9-9-21t9-21q9-9 21-8.5t21 8.5l79 78Zm0-320 158-158q9-9 21-8.5t21.39 9.5q8.61 9 8.61 21t-9 21L243-555q-9 9-21 9t-21-9L101-655q-9-9-9-21t9-21q9-9 21-8.5t21 8.5l79 78Zm328 329q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h300q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H550Zm0-320q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h300q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H550Z"],"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01":["M407-198q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h403q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H407Zm0-252q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h403q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H407Zm0-253q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h403q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H407ZM189-161q-28.05 0-48.02-19Q121-199 121-227.5t19.5-48q19.5-19.5 48-19.5t47.5 19.98q19 19.97 19 48.02 0 27.23-19.39 46.61Q216.23-161 189-161Zm0-252q-28.05 0-48.02-19.68Q121-452.36 121-480t19.98-47.32Q160.95-547 189-547q27.23 0 46.61 19.68Q255-507.64 255-480t-19.39 47.32Q216.23-413 189-413Zm-1-253q-27.64 0-47.32-19.68T121-733q0-27.64 19.68-47.32T188-800q27.64 0 47.32 19.68T255-733q0 27.64-19.68 47.32T188-666Z","M407-198q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h403q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H407Zm0-252q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h403q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H407Zm0-253q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h403q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H407ZM189-161q-28.05 0-48.02-19Q121-199 121-227.5t19.5-48q19.5-19.5 48-19.5t47.5 19.98q19 19.97 19 48.02 0 27.23-19.39 46.61Q216.23-161 189-161Zm0-252q-28.05 0-48.02-19.68Q121-452.36 121-480t19.98-47.32Q160.95-547 189-547q27.23 0 46.61 19.68Q255-507.64 255-480t-19.39 47.32Q216.23-413 189-413Zm-1-253q-27.64 0-47.32-19.68T121-733q0-27.64 19.68-47.32T188-800q27.64 0 47.32 19.68T255-733q0 27.64-19.68 47.32T188-666Z"],"M4 6h16M4 12h16M4 18h16":["M150-240q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h660q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H150Zm0-210q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h660q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H150Zm0-210q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h660q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H150Z","M150-240q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h660q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H150Zm0-210q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h660q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H150Zm0-210q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h660q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H150Z"],"M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 7l-10 7L2 7":["M140-160q-24 0-42-18t-18-42v-520q0-24 18-42t42-18h680q24 0 42 18t18 42v520q0 24-18 42t-42 18H140Zm680-525L496-473q-4 2-7.5 3.5T480-468q-5 0-8.5-1.5T464-473L140-685v465h680v-465ZM480-522l336-218H145l335 218ZM140-685v7-39.32.73V-740v23-.91V-678v-7 465-465Z","M140-160q-24 0-42-18t-18-42v-520q0-24 18-42t42-18h680q24 0 42 18t18 42v520q0 24-18 42t-42 18H140Zm340-308q5 0 8.5-1.5t7.5-3.5l314-205q5-3 7.5-8t2.5-11q0-13-11.5-20.5t-23.5.5L480-522 176-717q-12-8-24-1t-12 20q0 6 3 11.5t7 8.5l314 205q4 2 7.5 3.5t8.5 1.5Z"],"M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 7v7M12 7v4M16 7v9":["M180-120q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h600q24 0 42 18t18 42v600q0 24-18 42t-42 18H180Zm0-60h600v-600H180v600Zm0-600v600-600Zm128.82 97q-12.82 0-21.32 8.62-8.5 8.63-8.5 21.38v346q0 12.75 8.68 21.37 8.67 8.63 21.5 8.63 12.82 0 21.32-8.63 8.5-8.62 8.5-21.37v-346q0-12.75-8.68-21.38-8.67-8.62-21.5-8.62Zm342 0q-12.82 0-21.32 8.62-8.5 8.63-8.5 21.38v266q0 12.75 8.68 21.37 8.67 8.63 21.5 8.63 12.82 0 21.32-8.63 8.5-8.62 8.5-21.37v-266q0-12.75-8.68-21.38-8.67-8.62-21.5-8.62Zm-171 0q-12.82 0-21.32 8.62-8.5 8.63-8.5 21.38v146q0 12.75 8.68 21.37 8.67 8.63 21.5 8.63 12.82 0 21.32-8.63 8.5-8.62 8.5-21.37v-146q0-12.75-8.68-21.38-8.67-8.62-21.5-8.62Z","M180-120q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h600q24 0 42 18t18 42v600q0 24-18 42t-42 18H180Zm128.82-563q-12.82 0-21.32 8.62-8.5 8.63-8.5 21.38v346q0 12.75 8.68 21.37 8.67 8.63 21.5 8.63 12.82 0 21.32-8.63 8.5-8.62 8.5-21.37v-346q0-12.75-8.68-21.38-8.67-8.62-21.5-8.62Zm342 0q-12.82 0-21.32 8.62-8.5 8.63-8.5 21.38v266q0 12.75 8.68 21.37 8.67 8.63 21.5 8.63 12.82 0 21.32-8.63 8.5-8.62 8.5-21.37v-266q0-12.75-8.68-21.38-8.67-8.62-21.5-8.62Zm-171 0q-12.82 0-21.32 8.62-8.5 8.63-8.5 21.38v146q0 12.75 8.68 21.37 8.67 8.63 21.5 8.63 12.82 0 21.32-8.63 8.5-8.62 8.5-21.37v-146q0-12.75-8.68-21.38-8.67-8.62-21.5-8.62Z"],"M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z":["M180-80q-24 0-42-18t-18-42v-620q0-24 18-42t42-18h65v-28q0-13.6 9.2-22.8 9.2-9.2 22.8-9.2 14.02 0 23.51 9.2Q310-861.6 310-848v28h340v-28q0-13.6 9.2-22.8 9.2-9.2 22.8-9.2 14.03 0 23.51 9.2Q715-861.6 715-848v28h65q24 0 42 18t18 42v620q0 24-18 42t-42 18H180Zm0-60h600v-430H180v430Zm0-490h600v-130H180v130Zm0 0v-130 130Zm300 230q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z","M180-80q-24 0-42-18t-18-42v-620q0-24 18-42t42-18h65v-28q0-13.6 9.2-22.8 9.2-9.2 22.8-9.2 14.02 0 23.51 9.2Q310-861.6 310-848v28h340v-28q0-13.6 9.2-22.8 9.2-9.2 22.8-9.2 14.03 0 23.51 9.2Q715-861.6 715-848v28h65q24 0 42 18t18 42v620q0 24-18 42t-42 18H180Zm0-60h600v-430H180v430Zm300-260q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"],"M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.7.9 1.2 1.6 1.4H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z":["M421-80q-14 0-25-9t-13-23l-15-94q-19-7-40-19t-37-25l-86 40q-14 6-28 1.5T155-226L97-330q-8-13-4.5-27t15.5-23l80-59q-2-9-2.5-20.5T185-480q0-9 .5-20.5T188-521l-80-59q-12-9-15.5-23t4.5-27l58-104q8-13 22-17.5t28 1.5l86 40q16-13 37-25t40-18l15-95q2-14 13-23t25-9h118q14 0 25 9t13 23l15 94q19 7 40.5 18.5T669-710l86-40q14-6 27.5-1.5T804-734l59 104q8 13 4.5 27.5T852-580l-80 57q2 10 2.5 21.5t.5 21.5q0 10-.5 21t-2.5 21l80 58q12 8 15.5 22.5T863-330l-58 104q-8 13-22 17.5t-28-1.5l-86-40q-16 13-36.5 25.5T592-206l-15 94q-2 14-13 23t-25 9H421Zm15-60h88l14-112q33-8 62.5-25t53.5-41l106 46 40-72-94-69q4-17 6.5-33.5T715-480q0-17-2-33.5t-7-33.5l94-69-40-72-106 46q-23-26-52-43.5T538-708l-14-112h-88l-14 112q-34 7-63.5 24T306-642l-106-46-40 72 94 69q-4 17-6.5 33.5T245-480q0 17 2.5 33.5T254-413l-94 69 40 72 106-46q24 24 53.5 41t62.5 25l14 112Zm44-210q54 0 92-38t38-92q0-54-38-92t-92-38q-54 0-92 38t-38 92q0 54 38 92t92 38Zm0-130Z","M421-80q-14 0-25-9t-13-23l-15-94q-19-7-40-19t-37-25l-86 40q-14 6-28 1.5T155-226L97-330q-8-13-4.5-27t15.5-23l80-59q-2-9-2.5-20.5T185-480q0-9 .5-20.5T188-521l-80-59q-12-9-15.5-23t4.5-27l58-104q8-13 22-17.5t28 1.5l86 40q16-13 37-25t40-18l15-95q2-14 13-23t25-9h118q14 0 25 9t13 23l15 94q19 7 40.5 18.5T669-710l86-40q14-6 27.5-1.5T804-734l59 104q8 13 4.5 27.5T852-580l-80 57q2 10 2.5 21.5t.5 21.5q0 10-.5 21t-2.5 21l80 58q12 8 15.5 22.5T863-330l-58 104q-8 13-22 17.5t-28-1.5l-86-40q-16 13-36.5 25.5T592-206l-15 94q-2 14-13 23t-25 9H421Zm59-270q54 0 92-38t38-92q0-54-38-92t-92-38q-54 0-92 38t-38 92q0 54 38 92t92 38Z"],"M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z":["M378-329q-108.16 0-183.08-75Q120-479 120-585t75-181q75-75 181.5-75t181 75Q632-691 632-584.85 632-542 618-502q-14 40-42 75l242 240q9 8.56 9 21.78T818-143q-9 9-22.22 9-13.22 0-21.78-9L533-384q-30 26-69.96 40.5Q423.08-329 378-329Zm-1-60q81.25 0 138.13-57.5Q572-504 572-585t-56.87-138.5Q458.25-781 377-781q-82.08 0-139.54 57.5Q180-666 180-585t57.46 138.5Q294.92-389 377-389Z","M378-329q-108.16 0-183.08-75Q120-479 120-585t75-181q75-75 181.5-75t181 75Q632-691 632-584.85 632-542 618-502q-14 40-42 75l242 240q9 8.56 9 21.78T818-143q-9 9-22.22 9-13.22 0-21.78-9L533-384q-30 26-69.96 40.5Q423.08-329 378-329Zm-1-60q81.25 0 138.13-57.5Q572-504 572-585t-56.87-138.5Q458.25-781 377-781q-82.08 0-139.54 57.5Q180-666 180-585t57.46 138.5Q294.92-389 377-389Z"],"M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z":["M180-180h44l472-471-44-44-472 471v44Zm-30 60q-13 0-21.5-8.5T120-150v-73q0-12 5-23.5t13-19.5l557-556q8-8 19-12.5t23-4.5q11 0 22 4.5t20 12.5l44 44q9 9 13 20t4 22q0 11-4.5 22.5T823-694L266-138q-8 8-19.5 13t-23.5 5h-73Zm629-617-41-41 41 41Zm-105 64-22-22 44 44-22-22Z","M180-180h44l472-471-44-44-472 471v44Zm-30 60q-13 0-21.5-8.5T120-150v-73q0-12 5-23.5t13-19.5l557-556q8-8 19-12.5t23-4.5q11 0 22 4.5t20 12.5l44 44q9 9 13 20t4 22q0 11-4.5 22.5T823-694L266-138q-8 8-19.5 13t-23.5 5h-73Zm629-617-41-41 41 41Zm-105 64-22-22 44 44-22-22Z"],"M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6":["M261-120q-24.75 0-42.37-17.63Q201-155.25 201-180v-570h-11q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h158q0-13 8.63-21.5 8.62-8.5 21.37-8.5h204q12.75 0 21.38 8.62Q612-822.75 612-810h158q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5h-11v570q0 24.75-17.62 42.37Q723.75-120 699-120H261Zm438-630H261v570h438v-570ZM397.18-266q12.82 0 21.32-8.63 8.5-8.62 8.5-21.37v-339q0-12.75-8.68-21.38-8.67-8.62-21.5-8.62-12.82 0-21.32 8.62-8.5 8.63-8.5 21.38v339q0 12.75 8.68 21.37 8.67 8.63 21.5 8.63Zm166 0q12.82 0 21.32-8.63 8.5-8.62 8.5-21.37v-339q0-12.75-8.68-21.38-8.67-8.62-21.5-8.62-12.82 0-21.32 8.62-8.5 8.63-8.5 21.38v339q0 12.75 8.68 21.37 8.67 8.63 21.5 8.63ZM261-750v570-570Z","M261-120q-24.75 0-42.37-17.63Q201-155.25 201-180v-570h-11q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h158q0-13 8.63-21.5 8.62-8.5 21.37-8.5h204q12.75 0 21.38 8.62Q612-822.75 612-810h158q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5h-11v570q0 24.75-17.62 42.37Q723.75-120 699-120H261Zm438-630H261v570h438v-570ZM397.18-266q12.82 0 21.32-8.63 8.5-8.62 8.5-21.37v-339q0-12.75-8.68-21.38-8.67-8.62-21.5-8.62-12.82 0-21.32 8.62-8.5 8.63-8.5 21.38v339q0 12.75 8.68 21.37 8.67 8.63 21.5 8.63Zm166 0q12.82 0 21.32-8.63 8.5-8.62 8.5-21.37v-339q0-12.75-8.68-21.38-8.67-8.62-21.5-8.62-12.82 0-21.32 8.62-8.5 8.63-8.5 21.38v339q0 12.75 8.68 21.37 8.67 8.63 21.5 8.63ZM261-750v570-570Z"],"M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4":["M220-80q-24.75 0-42.37-17.63Q160-115.25 160-140v-434q0-24.75 17.63-42.38Q195.25-634 220-634h70v-96q0-78.85 55.61-134.42Q401.21-920 480.11-920q78.89 0 134.39 55.58Q670-808.85 670-730v96h70q24.75 0 42.38 17.62Q800-598.75 800-574v434q0 24.75-17.62 42.37Q764.75-80 740-80H220Zm0-60h520v-434H220v434Zm260.17-140q31.83 0 54.33-22.03T557-355q0-30-22.67-54.5t-54.5-24.5q-31.83 0-54.33 24.5t-22.5 55q0 30.5 22.67 52.5t54.5 22ZM350-634h260v-96q0-54.17-37.88-92.08-37.88-37.92-92-37.92T388-822.08q-38 37.91-38 92.08v96ZM220-140v-434 434Z","M220-80q-24.75 0-42.37-17.63Q160-115.25 160-140v-434q0-24.75 17.63-42.38Q195.25-634 220-634h70v-96q0-78.85 55.61-134.42Q401.21-920 480.11-920q78.89 0 134.39 55.58Q670-808.85 670-730v96h70q24.75 0 42.38 17.62Q800-598.75 800-574v434q0 24.75-17.62 42.37Q764.75-80 740-80H220Zm0-60h520v-434H220v434Zm260.17-140q31.83 0 54.33-22.03T557-355q0-30-22.67-54.5t-54.5-24.5q-31.83 0-54.33 24.5t-22.5 55q0 30.5 22.67 52.5t54.5 22ZM350-634h260v-96q0-54.17-37.88-92.08-37.88-37.92-92-37.92T388-822.08q-38 37.91-38 92.08v96ZM220-140v-434 434Z"],"M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2":["M260-40q-24 0-42-18t-18-42v-760q0-24 18-42t42-18h440q24 0 42 18t18 42v760q0 24-18 42t-42 18H260Zm0-90v30h440v-30H260Zm0-60h440v-580H260v580Zm0-640h440v-30H260v30Zm0 0v-30 30Zm0 700v30-30Z","M260-40q-24 0-42-18t-18-42v-760q0-24 18-42t42-18h440q24 0 42 18t18 42v760q0 24-18 42t-42 18H260Zm0-90v30h440v-30H260Zm0-60h440v-580H260v580Zm0-640h440v-30H260v30Zm0 0v-30 30Zm0 700v30-30Z"]};

  // Material Symbols Rounded (Apache-2.0): traço normal e versão preenchida para o item ativo.
  function icon(path) {
    var material = MATERIAL_ICONS[path];
    if (material) {
      return '<svg class="crm-mi" viewBox="0 -960 960 960" aria-hidden="true"><path class="o" d="' + material[0] + '"></path>' +
        '<path class="f" d="' + material[1] + '"></path></svg>';
    }
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + path + '"></path></svg>';
  }

  function mountMobileBar() {
    var narrow = window.matchMedia('(max-width: 767px)').matches;
    var base = accountBase();
    var conversationOpen = /\/conversations\/[^/]+/.test(window.location.pathname);
    if (document.body.getAttribute('data-crm-conversation-open') !== (conversationOpen ? 'true' : 'false')) {
      document.body.setAttribute('data-crm-conversation-open', conversationOpen ? 'true' : 'false');
    }
    if (EMBED) return;
    var bar = document.querySelector('.crm-mobile-bar');
    var sheet = document.querySelector('.crm-mobile-more');
    var back = document.querySelector('.crm-mobile-back');
    if (!narrow || !base) {
      if (bar) bar.remove();
      if (sheet) sheet.remove();
      if (back) back.remove();
      document.body.removeAttribute('data-crm-mobile');
      document.body.removeAttribute('data-crm-more');
      return;
    }
    if (document.body.getAttribute('data-crm-mobile') !== 'true') {
      document.body.setAttribute('data-crm-mobile', 'true');
    }
    if (!bar) {
      var settings = document.querySelector('aside [title="Configurações"]');
      var settingsHref = settings && settings.closest('a') ? settings.closest('a').getAttribute('href') : base + '/settings';
      var buttons = '<a data-crm-tab="conversas" href="' + base + '/dashboard">' +
        icon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z') +
        '<span>Conversas</span></a>' +
        '<a data-crm-tab="checklist" href="' + base + '/task-checklist">' +
        icon('M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11') +
        '<span>Checklist</span></a>' +
        '<a data-crm-tab="atividades" href="' + base + '/task-checklist#atividades">' +
        icon('M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01') +
        '<span>Atividades</span></a>' +
        '<button type="button" data-crm-more-button="true">' +
        icon('M4 6h16M4 12h16M4 18h16') +
        '<span>Mais</span></button>';
      document.body.insertAdjacentHTML('beforeend', '<nav class="crm-mobile-bar" aria-label="Menu principal">' + buttons + '</nav>');
      document.body.insertAdjacentHTML('beforeend',
        '<div class="crm-mobile-more">' +
        '<a href="' + settingsHref + '">Configurações</a>' +
        '<a href="' + base + '/inbox-view">Caixa de Entrada</a>' +
        '<a href="' + base + '/email" data-crm-email-link="true" style="display:none">Central de E-mail</a>' +
        '<a href="' + base + '/contacts">Contatos</a>' +
        '<a href="#kanban">Kanban</a>' +
        '<a href="#calendario" data-crm-calendar-link="true">Calendário</a>' +
        '<a href="' + base + '/reports/overview">Relatórios</a>' +
        '<a href="' + base + '/campaigns/live_chat">Campanhas</a>' +
        '<a href="' + base + '/portals">Central de Ajuda</a>' +
        '</div>');
    }
    var path = window.location.pathname;
    var checklistPane = document.querySelector('[data-crm-checklist]');
    var activitiesOn = path.indexOf('/task-checklist') !== -1 &&
      (window.location.hash === '#atividades' || (checklistPane && checklistPane.getAttribute('data-crm-checklist-pane') === 'andamento'));
    var tabs = document.querySelectorAll('.crm-mobile-bar a');
    for (var i = 0; i < tabs.length; i += 1) {
      var tab = tabs[i].getAttribute('data-crm-tab');
      var href = (tabs[i].getAttribute('href') || '').split('#')[0];
      var on = false;
      if (tab === 'conversas') on = path.indexOf('/dashboard') !== -1 || path.indexOf('/conversations/') !== -1;
      else if (tab === 'checklist') on = path.indexOf('/task-checklist') !== -1 && !activitiesOn;
      else if (tab === 'atividades') on = activitiesOn;
      else on = href && (path === href || path.indexOf(href + '/') === 0);
      if (on) tabs[i].classList.add('is-on');
      else tabs[i].classList.remove('is-on');
    }
    if (back) back.remove();
  }

  var TEMA_KEY = 'crm-industrial-tema';
  var MENU_KEY = 'crm-industrial-menu-v2';
  var settingsMenuOpen = false;

  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'AA';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function profileBits() {
    var aside = document.querySelector('aside.bg-n-background');
    var name = 'Conta';
    var photo = '';
    if (!aside) return { name: name, photo: photo };
    var image = aside.querySelector('img');
    if (image && image.getAttribute('src')) photo = image.getAttribute('src');
    var leaves = [];
    var nodes = aside.querySelectorAll('div, span');
    for (var i = 0; i < nodes.length; i += 1) {
      if (nodes[i].children.length) continue;
      var text = (nodes[i].textContent || '').trim();
      if (text) leaves.push(text);
    }
    for (var j = 0; j < leaves.length; j += 1) {
      if (leaves[j].indexOf('@') === -1) continue;
      var previous = j > 0 ? leaves[j - 1] : '';
      if (previous && previous.indexOf('@') === -1 && previous.length < 40 && previous !== 'AT') {
        name = previous;
      }
      break;
    }
    return { name: name, photo: photo };
  }

  var railCounts = { conversations: 0, tasks: 0, email: 0, emailConnected: false };

  function refreshRailCounts() {
    var base = accountBase();
    var headers = authHeaders();
    if (EMBED || !base || !headers) return;
    fetch('/api/v1/accounts/' + base.split('/').pop() + '/crm_reminders/summary', {
      credentials: 'same-origin',
      headers: headers,
    }).then(function (response) {
      return response.ok ? response.json() : null;
    }).then(function (data) {
      if (!data) return;
      railCounts.conversations = data.conversations_unread || 0;
      railCounts.tasks = data.tasks_open || 0;
      railCounts.email = data.email_unread || 0;
      railCounts.emailConnected = Boolean(data.email_connected);
      var mobileEmail = document.querySelector('[data-crm-email-link]');
      if (mobileEmail) mobileEmail.style.display = railCounts.emailConnected ? '' : 'none';
      var side = document.querySelector('.crm-side');
      if (side) renderSide(side);
    }).catch(function () {});
  }

  // Funcionalidades opcionais (Configurações → Recursos). Desligada não aparece em lugar nenhum.
  var crmModules = { list: [], loaded: false };
  window.crmModules = {
    enabled: function (key) {
      return crmModules.list.some(function (item) { return item.key === key && item.enabled; });
    },
    reload: function () { return loadCrmModules(); },
  };

  function crmApi(method, path, body) {
    var base = accountBase();
    var headers = authHeaders();
    if (!base || !headers) return Promise.reject(new Error('Sessão não encontrada.'));
    return fetch('/api/v1/accounts/' + base.split('/').pop() + path, {
      method: method, credentials: 'same-origin', headers: headers, body: body ? JSON.stringify(body) : undefined,
    }).then(function (response) {
      if (response.ok) return response.json();
      var fallback = response.status === 401 ? 'Só o administrador pode alterar.' : 'Não foi possível salvar.';
      return response.json().catch(function () { return {}; }).then(function (data) {
        throw new Error(response.status !== 401 && data && typeof data.error === 'string' ? data.error : fallback);
      });
    });
  }

  function loadCrmModules() {
    // Também na conversa aberta dentro do Kanban (EMBED), para o modo apresentação valer lá.
    return crmApi('GET', '/crm_modules').then(function (data) {
      crmModules.list = (data && data.modules) || [];
      crmModules.loaded = true;
      document.dispatchEvent(new CustomEvent('crm:modules'));
      var side = document.querySelector('.crm-side');
      if (side) renderSide(side);
    }).catch(function () {});
  }

  function openModulesPanel() {
    var kanban = window.crmKanban;
    if (!kanban || !kanban.dialog) return;
    var rows = crmModules.list.map(function (item) {
      return '<label class="kb-switch crm-module-row"><input type="checkbox" name="' + escapeHtml(item.key) + '"' + (item.enabled ? ' checked' : '') + '><span></span>' +
        '<div><strong>' + escapeHtml(item.name) + '</strong><small>' + escapeHtml(item.description || '') +
        (item.place ? ' · Aparece em ' + escapeHtml(item.place) : '') + '</small></div></label>';
    }).join('');
    var apiOn = window.crmModules.enabled('api_envio') && currentRole() === 'administrator';
    kanban.dialog({
      title: 'Recursos', submit: 'Salvar', narrow: true,
      extraFoot: apiOn ? '<button type="button" class="kb-btn" data-crm-api-keys>Chaves da API</button>' : '',
      onOpen: function (form, layer) {
        var keys = form.querySelector('[data-crm-api-keys]');
        if (keys) keys.addEventListener('click', function () { layer.remove(); openApiKeysPanel(); });
      },
      body: '<p class="crm-view-empty">Ligue só o que a equipe vai usar. Desligado, o recurso some da tela de todos.</p>' +
        '<div class="crm-module-list">' + rows + '</div>',
      onSubmit: function (form) {
        var changed = crmModules.list.filter(function (item) {
          var input = form.querySelector('input[name="' + item.key + '"]');
          return input && input.checked !== item.enabled;
        });
        return changed.reduce(function (chain, item) {
          return chain.then(function () {
            return crmApi('PATCH', '/crm_modules/' + encodeURIComponent(item.key), { enabled: !item.enabled });
          });
        }, Promise.resolve()).then(function () {
          return loadCrmModules();
        }).then(function () {
          if (changed.length) kanban.toast('Recursos atualizados.');
        });
      },
    });
  }

  // API de envio: chaves para o ERP e o n8n. Só o administrador; a chave completa aparece uma única vez.
  function apiDate(value) {
    if (!value) return '—';
    var date = new Date(value);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function openApiKeysPanel() {
    var kanban = window.crmKanban;
    if (!kanban || !kanban.dialog) return;
    crmApi('GET', '/crm_api_tokens').then(function (data) {
      var inboxes = data.inboxes || [];
      var names = {};
      inboxes.forEach(function (box) { names[box.id] = box.name; });
      var active = (data.tokens || []).filter(function (token) { return !token.revoked_at; });
      var revoked = (data.tokens || []).filter(function (token) { return token.revoked_at; });
      var recent = data.recent || [];
      var row = function (token) {
        var boxes = token.inbox_ids.map(function (id) { return names[id] || ('caixa ' + id); }).join(', ');
        return '<li class="crm-api-key' + (token.revoked_at ? ' is-off' : '') + '"><div><strong>' + escapeHtml(token.name) + '</strong>' +
          '<code>' + escapeHtml(token.hint) + '</code><small>' + escapeHtml(boxes) + ' · até ' + token.per_minute + ' por minuto · criada por ' +
          escapeHtml(token.created_by || '—') + ' em ' + apiDate(token.created_at) + ' · último uso: ' + apiDate(token.last_used_at) +
          (token.revoked_at ? ' · revogada por ' + escapeHtml(token.revoked_by || '—') + ' em ' + apiDate(token.revoked_at) : '') + '</small></div>' +
          (token.revoked_at ? '<span class="kb-pill">revogada</span>' : '<button type="button" class="kb-btn is-small" data-api-revoke="' + token.id + '">Revogar</button>') + '</li>';
      };
      var sent = recent.filter(function (item) { return item.status === 'sent'; }).length;
      var failed = recent.filter(function (item) { return item.status === 'failed'; }).length;
      var url = window.location.origin + '/crm_api/v1/messages';
      var body = '<p class="crm-view-empty">Cada sistema (ERP, n8n) recebe uma chave própria, que só envia pelas caixas marcadas. Revogue quando não usar mais.</p>' +
        (active.length || revoked.length ? '<ul class="crm-api-keys">' + active.concat(revoked).map(row).join('') + '</ul>' : '<p class="kb-empty-small">Nenhuma chave criada.</p>') +
        (recent.length ? '<p class="crm-api-recent">' + (recent.length === 1 ? 'Último pedido: ' : 'Últimos ' + recent.length + ' pedidos: ') +
          sent + (sent === 1 ? ' enviado' : ' enviados') + (failed ? ', ' + failed + ' com falha' : '') + '.</p>' : '') +
        '<fieldset class="crm-api-new"><legend>Nova chave</legend>' +
        '<label class="kb-field">Nome<input name="name" maxlength="80" placeholder="Ex.: ERP da loja" required></label>' +
        '<div class="kb-field">Caixas que a chave pode usar' + (inboxes.length ? '<div class="kb-check-list is-field">' + inboxes.map(function (box) {
          return '<label class="kb-check"><input type="checkbox" name="inbox_ids" value="' + box.id + '"' + (inboxes.length === 1 ? ' checked' : '') + '><span>' + escapeHtml(box.name) + '</span></label>';
        }).join('') + '</div>' : '<p class="kb-empty-small">Nenhuma caixa de WhatsApp conectada.</p>') + '</div>' +
        '<label class="kb-field">Envios por minuto<input name="per_minute" type="number" min="1" max="60" value="30"></label></fieldset>' +
        '<details class="crm-api-help"><summary>Como usar no ERP ou no n8n</summary><p>Faça um POST para <code>' + escapeHtml(url) + '</code> com o cabeçalho <code>Authorization: Bearer</code> + a chave e o corpo em JSON:</p>' +
        '<pre>{ "inbox_id": ' + (inboxes[0] ? inboxes[0].id : 1) + ', "phone": "5512991234567", "name": "Nome do cliente", "content": "Seu pedido está pronto." }</pre>' +
        '<p>Mande também o cabeçalho <code>Idempotency-Key</code> com o número do pedido: se o mesmo pedido chegar duas vezes, a mensagem sai uma vez só. ' +
        'Se o número ainda não for cliente, o CRM cria o contato e a conversa. A mensagem sai como a resposta de um atendente, sem nome na frente.</p></details>';
      var layer = kanban.dialog({
        title: 'Chaves da API', submit: 'Criar chave', body: body,
        onOpen: function (form) {
          form.addEventListener('click', function (event) {
            var revoke = event.target.closest('[data-api-revoke]');
            if (!revoke) return;
            kanban.confirm('Revogar chave', 'O sistema que usa esta chave para de conseguir enviar na hora. Não dá para desfazer.', 'Revogar', function () {
              return crmApi('DELETE', '/crm_api_tokens/' + encodeURIComponent(revoke.getAttribute('data-api-revoke'))).then(function () {
                layer.remove();
                kanban.toast('Chave revogada.');
                openApiKeysPanel();
              });
            });
          });
        },
        onSubmit: function (form) {
          var name = form.querySelector('[name="name"]').value.trim();
          var chosen = Array.prototype.map.call(form.querySelectorAll('[name="inbox_ids"]:checked'), function (input) { return Number(input.value); });
          if (!name) return Promise.reject(new Error('Dê um nome para a chave.'));
          if (!chosen.length) return Promise.reject(new Error('Escolha ao menos uma caixa.'));
          return crmApi('POST', '/crm_api_tokens', { name: name, inbox_ids: chosen, per_minute: Number(form.querySelector('[name="per_minute"]').value) || 30 })
            .then(function (created) { window.setTimeout(function () { showNewApiKey(created); }, 0); });
        },
      });
      layer.querySelector('form').classList.add('kb-dialog-wide');
    }).catch(function (error) {
      if (window.crmKanban) window.crmKanban.toast(error.message || 'Não foi possível abrir as chaves.');
    });
  }

  function showNewApiKey(created) {
    var kanban = window.crmKanban;
    var layer = kanban.dialog({
      title: 'Chave criada', submit: 'Já copiei', narrow: true,
      body: '<p class="crm-view-empty">Copie agora e guarde no sistema que vai usar (ERP ou n8n). Por segurança, ela não aparece de novo: se perder, revogue e crie outra.</p>' +
        '<div class="crm-api-secret"><code aria-label="Chave da API">' + escapeHtml(created.token) + '</code><button type="button" class="kb-btn" data-api-copy>Copiar</button></div>',
      onOpen: function (form) {
        var code = form.querySelector('.crm-api-secret code');
        form.querySelector('[data-api-copy]').addEventListener('click', function () {
          var range = document.createRange();
          range.selectNodeContents(code);
          var selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          var done = function () { kanban.toast('Chave copiada.'); };
          var fallback = function () { document.execCommand('copy'); done(); };
          if (navigator.clipboard) navigator.clipboard.writeText(code.textContent).then(done, fallback);
          else fallback();
        });
      },
      onSubmit: function () {
        created.token = null;
        window.setTimeout(openApiKeysPanel, 0);
        return Promise.resolve();
      },
    });
    layer.querySelector('form').classList.add('crm-api-created');
  }

  // Salas da equipe: botão "Equipe" na linha de filtros da lista de conversas e painel lateral por cima da tela.
  // As mensagens chegam por consulta curta: a cada 4 s com o painel aberto e a contagem a cada 30 s.
  var team = { layer: null, rooms: [], users: [], me: null, admin: false, roomId: null, messages: [], more: false, unread: 0, tick: 0, timer: null, busy: false };
  var TEAM_ROOM_KEY = 'crm-equipe-sala';

  function teamOn() {
    return !EMBED && window.crmModules.enabled('salas_equipe');
  }

  function paintTeamBadge() {
    document.querySelectorAll('[data-crm-team-badge]').forEach(function (badge) {
      badge.textContent = team.unread > 99 ? '99+' : String(team.unread);
      badge.hidden = !team.unread;
    });
  }

  function mountTeamButton() {
    var current = document.querySelector('[data-crm-team-tab]');
    if (!teamOn()) {
      if (current) current.remove();
      return;
    }
    var row = document.querySelector('.conversations-list-wrap [data-crm-tabs]') || document.querySelector('.conversations-list-wrap > .overflow-x-auto');
    if (!row || (current && current.parentNode === row && row.firstElementChild === current)) return;
    if (current) current.remove();
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'crm-team-tab';
    button.setAttribute('data-crm-team-tab', 'true');
    button.title = 'Salas da equipe (chat interno)';
    button.innerHTML = icon('M17 20h5v-2a3 3 0 0 0-5.36-1.86M17 20H7m10 0v-2c0-.66-.13-1.28-.36-1.86M7 20H2v-2a3 3 0 0 1 5.36-1.86M7 20v-2c0-.66.13-1.28.36-1.86m0 0a5 5 0 0 1 9.28 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z') +
      '<span>Equipe</span><b class="crm-team-badge" data-crm-team-badge hidden></b>';
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      openTeam();
    });
    row.insertBefore(button, row.firstChild);
    paintTeamBadge();
  }

  function refreshTeamUnread() {
    if (!teamOn() || document.hidden) return;
    crmApi('GET', '/crm_team_rooms/summary').then(function (data) {
      team.unread = data.total_unread || 0;
      paintTeamBadge();
    }).catch(function () {});
  }

  function teamTime(iso) {
    var date = new Date(iso);
    var today = new Date();
    var time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return date.toDateString() === today.toDateString() ? time : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + time;
  }

  function teamRoom() {
    return team.rooms.filter(function (room) { return room.id === team.roomId; })[0] || null;
  }

  function openTeam() {
    if (team.layer) return;
    var layer = document.createElement('div');
    layer.className = 'crm-team-layer';
    // section e div (não aside e nav): o tema do celular esconde todo aside que tem nav.
    layer.innerHTML = '<section class="crm-team" role="dialog" aria-modal="true" aria-label="Salas da equipe">' +
      '<header class="crm-team-head"><h2>Equipe</h2><span class="crm-grow"></span>' +
      '<button type="button" class="kb-btn is-small" data-team="direct">Conversa direta</button>' +
      '<button type="button" class="kb-btn is-small" data-team="new" hidden>Nova sala</button>' +
      '<button type="button" class="kb-icon-btn" data-team="close" aria-label="Fechar">' + icon('M18 6 6 18M6 6l12 12') + '</button></header>' +
      '<div class="crm-team-body"><div class="crm-team-rooms" data-team-rooms role="navigation" aria-label="Salas"><p class="crm-view-empty">Carregando…</p></div>' +
      '<div class="crm-team-room" data-team-room><p class="crm-view-empty">Escolha uma sala.</p></div></div></section>';
    document.body.appendChild(layer);
    team.layer = layer;
    layer.addEventListener('mousedown', function (event) { if (event.target === layer) closeTeam(); });
    layer.addEventListener('click', teamClick);
    layer.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !document.querySelector('.kb-layer')) closeTeam();
      // No celular o Enter quebra a linha; envia pelo botão.
      if (event.key === 'Enter' && !event.shiftKey && event.target.matches('[data-team-input]') && !window.matchMedia('(pointer: coarse)').matches) {
        event.preventDefault();
        sendTeamMessage();
      }
    });
    loadTeamRooms(true);
    team.timer = window.setInterval(teamPoll, 4000);
  }

  function closeTeam() {
    if (team.timer) window.clearInterval(team.timer);
    team.timer = null;
    if (team.layer) team.layer.remove();
    team.layer = null;
    team.roomId = null;
    refreshTeamUnread();
  }

  function teamPoll() {
    if (!team.layer || document.hidden || team.busy) return;
    team.tick += 1;
    if (team.roomId) loadTeamMessages(false);
    if (team.tick % 4 === 0) loadTeamRooms(false);
  }

  function loadTeamRooms(first) {
    return crmApi('GET', '/crm_team_rooms').then(function (data) {
      team.rooms = data.rooms || [];
      team.users = data.users || [];
      team.me = data.me;
      team.admin = Boolean(data.admin);
      team.unread = data.total_unread || 0;
      // A sala aberta na tela conta como lida: a leitura pode ainda não ter chegado ao servidor.
      var open = team.layer && teamRoom();
      if (open && open.unread) {
        team.unread = Math.max(0, team.unread - open.unread);
        open.unread = 0;
        markTeamRead();
      }
      paintTeamBadge();
      if (!team.layer) return;
      team.layer.querySelector('[data-team="new"]').hidden = !team.admin;
      paintTeamRooms();
      if (!first) return;
      var saved = null;
      try { saved = Number(window.localStorage.getItem(TEAM_ROOM_KEY)); } catch (error) { /* sem armazenamento */ }
      var pick = team.rooms.filter(function (room) { return room.unread; })[0] || team.rooms.filter(function (room) { return room.id === saved; })[0] || team.rooms[0];
      if (pick) selectTeamRoom(pick.id);
      else paintTeamEmpty();
    }).catch(function (error) {
      if (team.layer) team.layer.querySelector('[data-team-rooms]').innerHTML = '<p class="crm-view-empty">' + escapeHtml(error.message) + '</p>';
    });
  }

  function paintTeamEmpty() {
    var box = team.layer && team.layer.querySelector('[data-team-room]');
    if (box) box.innerHTML = '<p class="crm-view-empty">' + (team.admin ? 'Nenhuma sala ainda. Crie a primeira em "Nova sala" ou comece uma conversa direta.' : 'Nenhuma sala ainda. Comece uma conversa direta ou peça ao administrador para criar uma sala.') + '</p>';
  }

  function paintTeamRooms() {
    var nav = team.layer.querySelector('[data-team-rooms]');
    var channels = team.rooms.filter(function (room) { return room.kind === 'channel'; });
    var directs = team.rooms.filter(function (room) { return room.kind === 'direct'; });
    var row = function (room) {
      return '<button type="button" class="crm-team-room-row' + (room.id === team.roomId ? ' is-on' : '') + (room.unread ? ' is-unread' : '') + '" data-team-room-id="' + room.id + '">' +
        '<span class="crm-team-room-name">' + (room.kind === 'channel' ? '# ' : '') + escapeHtml(room.name) + (room.kind === 'channel' && !room.everyone ? ' <i title="Sala restrita">🔒</i>' : '') + '</span>' +
        (room.unread ? '<b>' + room.unread + '</b>' : '') +
        (room.last ? '<small>' + escapeHtml((room.last.author ? room.last.author + ': ' : '') + room.last.text) + '</small>' : '<small>Sem mensagens</small>') + '</button>';
    };
    nav.innerHTML = (channels.length ? '<h3>Salas</h3>' + channels.map(row).join('') : '') +
      (directs.length ? '<h3>Conversas diretas</h3>' + directs.map(row).join('') : '') +
      (team.rooms.length ? '' : '<p class="crm-view-empty">Nenhuma sala.</p>');
  }

  function selectTeamRoom(id) {
    team.roomId = id;
    team.messages = [];
    try { window.localStorage.setItem(TEAM_ROOM_KEY, String(id)); } catch (error) { /* sem armazenamento */ }
    var room = teamRoom();
    var box = team.layer.querySelector('[data-team-room]');
    team.layer.querySelector('.crm-team').classList.add('is-room');
    box.innerHTML = '<header class="crm-team-room-head"><button type="button" class="kb-icon-btn crm-team-back" data-team="back" aria-label="Voltar para as salas">' + icon('M15 18l-6-6 6-6') + '</button>' +
      '<strong>' + (room && room.kind === 'channel' ? '# ' : '') + escapeHtml(room ? room.name : '') + '</strong>' +
      (room && room.kind === 'channel' ? '<small>' + (room.everyone ? 'Todos da conta' : 'Sala restrita') + '</small>' : '<small>Conversa direta</small>') +
      '<span class="crm-grow"></span>' + (team.admin && room && room.kind === 'channel' ? '<button type="button" class="kb-btn is-small" data-team="edit">Alterar sala</button>' : '') + '</header>' +
      '<div class="crm-team-msgs" data-team-msgs><p class="crm-view-empty">Carregando…</p></div>' +
      '<footer class="crm-team-compose"><textarea data-team-input rows="2" maxlength="4000" placeholder="Mensagem para ' + escapeHtml(room ? room.name : 'a sala') +
        (window.matchMedia('(pointer: coarse)').matches ? '' : ' (Enter envia, Shift+Enter quebra linha)') + '"></textarea>' +
      '<button type="button" class="kb-btn is-primary" data-team="send">Enviar</button></footer>';
    paintTeamRooms();
    loadTeamMessages(true);
    var input = box.querySelector('[data-team-input]');
    if (input && window.matchMedia('(min-width: 768px)').matches) input.focus();
  }

  function teamMessageHtml(message) {
    var mine = message.user_id === team.me;
    var canDelete = !message.deleted && (mine || team.admin);
    return '<article class="crm-team-msg' + (mine ? ' is-mine' : '') + '" data-team-msg="' + message.id + '"><div class="crm-team-meta"><strong>' + escapeHtml(mine ? 'Você' : message.author) + '</strong>' +
      '<time>' + teamTime(message.created_at) + '</time>' + (canDelete ? '<button type="button" data-team-delete="' + message.id + '">Apagar</button>' : '') + '</div>' +
      (message.deleted ? '<p class="is-deleted">Mensagem apagada</p>' : '<p>' + escapeHtml(message.content).replace(/\n/g, '<br>') + '</p>') + '</article>';
  }

  function paintTeamMessages(stick) {
    var list = team.layer && team.layer.querySelector('[data-team-msgs]');
    if (!list) return;
    var nearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 80;
    list.innerHTML = (team.more ? '<button type="button" class="crm-team-older" data-team="older">Carregar mensagens anteriores</button>' : '') +
      (team.messages.length ? team.messages.map(teamMessageHtml).join('') : '<p class="crm-view-empty">Nenhuma mensagem ainda. Escreva a primeira.</p>');
    if (stick || nearBottom) list.scrollTop = list.scrollHeight;
  }

  function markTeamRead() {
    var last = team.messages[team.messages.length - 1];
    var room = teamRoom();
    if (!last || !room) return;
    if (room.unread) {
      team.unread = Math.max(0, team.unread - room.unread);
      room.unread = 0;
      paintTeamBadge();
      paintTeamRooms();
    }
    crmApi('POST', '/crm_team_rooms/' + room.id + '/read', { message_id: last.id }).catch(function () {});
  }

  function loadTeamMessages(first) {
    var roomId = team.roomId;
    var last = team.messages[team.messages.length - 1];
    var query = first || !last ? '' : '?after_id=' + last.id;
    team.busy = true;
    return crmApi('GET', '/crm_team_rooms/' + roomId + '/crm_team_messages' + query).then(function (data) {
      if (roomId !== team.roomId) return;
      var rows = data.messages || [];
      if (first) {
        team.messages = rows;
        team.more = Boolean(data.more);
      } else if (rows.length) {
        var known = {};
        team.messages.forEach(function (item) { known[item.id] = true; });
        rows = rows.filter(function (item) { return !known[item.id]; });
        if (!rows.length) return;
        team.messages = team.messages.concat(rows);
      } else {
        return;
      }
      paintTeamMessages(first);
      markTeamRead();
    }).catch(function () {}).then(function () { team.busy = false; });
  }

  function loadOlderTeamMessages() {
    var first = team.messages[0];
    if (!first) return;
    crmApi('GET', '/crm_team_rooms/' + team.roomId + '/crm_team_messages?before_id=' + first.id).then(function (data) {
      var list = team.layer.querySelector('[data-team-msgs]');
      var height = list.scrollHeight;
      team.messages = (data.messages || []).concat(team.messages);
      team.more = Boolean(data.more);
      paintTeamMessages(false);
      list.scrollTop = list.scrollHeight - height;
    }).catch(function () {});
  }

  function sendTeamMessage() {
    var input = team.layer && team.layer.querySelector('[data-team-input]');
    var text = input ? input.value.trim() : '';
    if (!text || !team.roomId || input.disabled) return;
    input.disabled = true;
    crmApi('POST', '/crm_team_rooms/' + team.roomId + '/crm_team_messages', { content: text }).then(function (message) {
      input.value = '';
      if (!team.messages.some(function (item) { return item.id === message.id; })) team.messages.push(message);
      paintTeamMessages(true);
      var room = teamRoom();
      if (room) room.last = { author: 'Você', text: text.slice(0, 90) };
      paintTeamRooms();
    }).catch(function (error) {
      if (window.crmKanban) window.crmKanban.toast(error.message);
    }).then(function () {
      input.disabled = false;
      input.focus();
    });
  }

  function teamMemberChecks(selected) {
    return '<div class="kb-check-list is-field">' + team.users.map(function (user) {
      return '<label class="kb-check"><input type="checkbox" name="member_ids" value="' + user.id + '"' + (selected.indexOf(user.id) !== -1 ? ' checked' : '') + '><span>' + escapeHtml(user.name) + '</span></label>';
    }).join('') + '</div>';
  }

  function openTeamRoomDialog(room) {
    var kanban = window.crmKanban;
    var everyone = room ? room.everyone : true;
    kanban.dialog({
      title: room ? 'Alterar sala' : 'Nova sala', submit: room ? 'Salvar' : 'Criar sala', narrow: true,
      body: '<label class="kb-field">Nome<input name="name" maxlength="60" value="' + escapeHtml(room ? room.name : '') + '" placeholder="Ex.: Produção, Vendas, Laboratório"></label>' +
        '<label class="kb-check"><input type="checkbox" name="everyone"' + (everyone ? ' checked' : '') + '><span>Todos da conta participam</span></label>' +
        '<div class="kb-field" data-team-members' + (everyone ? ' hidden' : '') + '>Quem participa' + teamMemberChecks(room && room.member_ids ? room.member_ids : [team.me]) + '</div>' +
        (room ? '<label class="kb-check"><input type="checkbox" name="archived"><span>Arquivar esta sala (some para todos; as mensagens ficam guardadas)</span></label>' : ''),
      onOpen: function (form) {
        form.querySelector('[name="everyone"]').addEventListener('change', function (event) {
          form.querySelector('[data-team-members]').hidden = event.target.checked;
        });
      },
      onSubmit: function (form) {
        var name = form.querySelector('[name="name"]').value.trim();
        if (!name) return Promise.reject(new Error('Dê um nome para a sala.'));
        var payload = {
          name: name, everyone: form.querySelector('[name="everyone"]').checked,
          member_ids: Array.prototype.map.call(form.querySelectorAll('[name="member_ids"]:checked'), function (input) { return Number(input.value); }),
        };
        if (!payload.everyone && !payload.member_ids.length) return Promise.reject(new Error('Escolha quem participa.'));
        var archive = form.querySelector('[name="archived"]');
        if (archive && archive.checked) payload.archived = true;
        return crmApi(room ? 'PATCH' : 'POST', '/crm_team_rooms' + (room ? '/' + room.id : ''), payload).then(function (data) {
          kanban.toast(payload.archived ? 'Sala arquivada.' : room ? 'Sala alterada.' : 'Sala criada.');
          if (payload.archived) team.roomId = null;
          return loadTeamRooms(false).then(function () {
            if (payload.archived) {
              team.layer.querySelector('.crm-team').classList.remove('is-room');
              paintTeamEmpty();
            } else {
              selectTeamRoom(data.id);
            }
          });
        });
      },
    });
  }

  function openTeamDirectDialog() {
    var kanban = window.crmKanban;
    var people = team.users.filter(function (user) { return user.id !== team.me; });
    var layer = kanban.dialog({
      title: 'Conversa direta', submit: 'Fechar', narrow: true,
      body: people.length ? '<div class="crm-team-people">' + people.map(function (user) {
        return '<button type="button" data-team-person="' + user.id + '">' + escapeHtml(user.name) + '</button>';
      }).join('') + '</div>' : '<p class="crm-view-empty">Não há outras pessoas nesta conta.</p>',
      onOpen: function (form) {
        form.addEventListener('click', function (event) {
          var person = event.target.closest('[data-team-person]');
          if (!person) return;
          crmApi('POST', '/crm_team_rooms/direct', { user_id: Number(person.getAttribute('data-team-person')) }).then(function (data) {
            layer.remove();
            return loadTeamRooms(false).then(function () { selectTeamRoom(data.id); });
          }).catch(function (error) { kanban.toast(error.message); });
        });
      },
      onSubmit: function () { return Promise.resolve(); },
    });
  }

  function teamClick(event) {
    var roomButton = event.target.closest('[data-team-room-id]');
    if (roomButton) return selectTeamRoom(Number(roomButton.getAttribute('data-team-room-id')));
    var remove = event.target.closest('[data-team-delete]');
    if (remove) {
      var id = Number(remove.getAttribute('data-team-delete'));
      return window.crmKanban.confirm('Apagar mensagem', 'A mensagem some para todos da sala.', 'Apagar', function () {
        return crmApi('DELETE', '/crm_team_rooms/' + team.roomId + '/crm_team_messages/' + id).then(function (message) {
          team.messages = team.messages.map(function (item) { return item.id === id ? message : item; });
          paintTeamMessages(false);
        });
      });
    }
    var action = event.target.closest('[data-team]');
    if (!action) return;
    var name = action.getAttribute('data-team');
    if (name === 'close') closeTeam();
    else if (name === 'send') sendTeamMessage();
    else if (name === 'older') loadOlderTeamMessages();
    else if (name === 'new') openTeamRoomDialog(null);
    else if (name === 'edit') openTeamRoomDialog(teamRoom());
    else if (name === 'direct') openTeamDirectDialog();
    else if (name === 'back') team.layer.querySelector('.crm-team').classList.remove('is-room');
  }

  // Dois recursos separados, cada um só aparece se for liberado em Configurações → Recursos:
  // - "PIX na conversa": botão + no campo de digitação, só com o PIX, que envia a cobrança ao cliente depois de confirmar.
  // - "Ferramentas de ajuda": item "Ferramentas" no menu do perfil, com calculadora, conversor e cubagem, e modelos com campos.
  // As mensagens saem pelo caminho de sempre (API de mensagens do Chatwoot e WAHA); nada usa outra conexão.
  var tools = { mode: 'pix', tab: 'calculadora', pix: null, pixCode: '', pixBlob: null, pixKind: null, pixKindManual: false, canned: null, model: null };
  var TOOL_UNITS = {
    peso: { label: 'Peso', units: [['g', 'g', 0.001], ['kg', 'kg', 1], ['t', 't', 1000]] },
    comprimento: { label: 'Comprimento', units: [['mm', 'mm', 0.001], ['cm', 'cm', 0.01], ['m', 'm', 1], ['km', 'km', 1000]] },
    area: { label: 'Área', units: [['cm2', 'cm²', 0.0001], ['m2', 'm²', 1], ['ha', 'ha', 10000]] },
    volume: { label: 'Volume', units: [['ml', 'mL', 0.000001], ['l', 'L', 0.001], ['m3', 'm³', 1]] },
  };

  function pixOn() {
    return window.crmModules.enabled('pix_conversa');
  }

  function helpOn() {
    return window.crmModules.enabled('ferramentas_conversa');
  }

  function toolNumber(value) {
    var text = String(value || '').trim().replace(/\s/g, '');
    if (!text) return NaN;
    if (text.indexOf(',') !== -1) text = text.replace(/\./g, '').replace(',', '.');
    return Number(text);
  }

  function toolFormat(value, digits) {
    return Number(value).toLocaleString('pt-BR', { maximumFractionDigits: digits === undefined ? 6 : digits });
  }

  function toolMoney(value) {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function toolToast(text) {
    if (window.crmKanban && window.crmKanban.toast) window.crmKanban.toast(text);
  }

  // Põe o texto onde está o cursor no campo de digitação (ou no fim), sem enviar. Entra como "colar" de HTML com <br>,
  // que o editor do Chatwoot transforma em quebras de linha simples (como Shift+Enter), e não em parágrafos.
  function insertIntoReply(text) {
    var editor = document.querySelector('.reply-box .ProseMirror');
    if (!editor) {
      toolToast('Abra uma conversa para inserir o texto.');
      return false;
    }
    editor.focus();
    var selection = window.getSelection();
    if (!selection.rangeCount || !editor.contains(selection.anchorNode)) {
      var range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    var lines = String(text).split('\n');
    try {
      var transfer = new DataTransfer();
      transfer.setData('text/plain', lines.join('\n'));
      transfer.setData('text/html', '<p>' + lines.map(escapeHtml).join('<br>') + '</p>');
      var handled = !editor.dispatchEvent(new ClipboardEvent('paste', { clipboardData: transfer, bubbles: true, cancelable: true }));
      if (handled) return true;
    } catch (error) { /* navegador sem colar sintético: segue abaixo */ }
    lines.forEach(function (line, index) {
      if (index) document.execCommand('insertLineBreak');
      if (line) document.execCommand('insertText', false, line);
    });
    return true;
  }
  window.crmInsertIntoReply = insertIntoReply;

  function copyText(text, done) {
    var finish = function () { toolToast(done || 'Copiado.'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(finish, function () { toolToast('Não foi possível copiar.'); });
    } else {
      toolToast('Não foi possível copiar.');
    }
  }

  function mountToolsButton() {
    var current = document.querySelector('[data-crm-tools]');
    var open = document.querySelector('.crm-tools');
    if (open && ((open.getAttribute('data-mode') === 'pix' && !pixOn()) || (open.getAttribute('data-mode') === 'ajuda' && !helpOn()))) closeTools();
    if (!pixOn()) {
      if (current) current.remove();
      return;
    }
    var emoji = document.querySelector('.reply-box .i-ph-smiley-sticker');
    var anchor = emoji && emoji.closest('button');
    if (!anchor || (current && current.previousElementSibling === anchor)) return;
    if (current) current.remove();
    var button = document.createElement('button');
    button.type = 'button';
    button.className = anchor.className + ' crm-tools-open';
    button.setAttribute('data-crm-tools', 'true');
    button.title = 'PIX: gerar e enviar cobrança ao cliente';
    button.setAttribute('aria-label', button.title);
    button.innerHTML = icon('M12 5v14M5 12h14');
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      var open = document.querySelector('.crm-tools');
      if (open && open.getAttribute('data-mode') === 'pix') closeTools();
      else openTools(button, 'pix');
    });
    anchor.parentNode.insertBefore(button, anchor.nextSibling);
  }

  function closeTools() {
    var panel = document.querySelector('.crm-tools');
    if (panel) panel.remove();
  }

  function placeTools(panel, button) {
    var rect = button.getBoundingClientRect();
    var width = Math.min(380, window.innerWidth - 16);
    panel.style.width = width + 'px';
    panel.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)) + 'px';
    panel.style.bottom = Math.max(8, window.innerHeight - rect.top + 8) + 'px';
  }

  function openTools(button, mode) {
    closeTools();
    tools.mode = mode === 'ajuda' ? 'ajuda' : 'pix';
    var panel = document.createElement('section');
    panel.className = 'crm-tools';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('data-mode', tools.mode);
    panel.setAttribute('aria-label', tools.mode === 'pix' ? 'PIX' : 'Ferramentas de ajuda');
    var close = '<button type="button" class="crm-tools-close" data-tool="close" aria-label="Fechar">' + icon('M18 6 6 18M6 6l12 12') + '</button>';
    var head = tools.mode === 'pix' ? '<nav class="crm-tools-tabs"><strong class="crm-tools-title">PIX</strong>' + close + '</nav>' :
      '<nav class="crm-tools-tabs" role="tablist">' + [['calculadora', 'Calculadora'], ['conversor', 'Conversor'], ['modelos', 'Modelos']].map(function (tab) {
        return '<button type="button" role="tab" data-tool-tab="' + tab[0] + '">' + tab[1] + '</button>';
      }).join('') + close + '</nav>';
    panel.innerHTML = head + '<div class="crm-tools-body" data-tool-body></div>';
    document.body.appendChild(panel);
    placeTools(panel, button);
    panel.addEventListener('click', toolsClick);
    panel.addEventListener('input', toolsInput);
    panel.addEventListener('change', toolsInput);
    panel.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        closeTools();
      }
    });
    paintToolTab();
  }

  document.addEventListener('mousedown', function (event) {
    var panel = document.querySelector('.crm-tools');
    if (!panel || panel.contains(event.target) || event.target.closest('[data-crm-tools], .kb-layer, .crm-calc')) return;
    closeTools();
  });

  function paintToolTab() {
    var panel = document.querySelector('.crm-tools');
    if (!panel) return;
    panel.querySelectorAll('[data-tool-tab]').forEach(function (tab) {
      var on = tab.getAttribute('data-tool-tab') === tools.tab;
      tab.classList.toggle('is-on', on);
      tab.setAttribute('aria-selected', String(on));
    });
    var body = panel.querySelector('[data-tool-body]');
    if (tools.mode === 'pix') paintPix(body);
    else if (tools.tab === 'conversor') paintConverter(body);
    else if (tools.tab === 'modelos') paintModels(body);
    else paintCalcTab(body);
  }

  // ---------- PIX ----------
  function pixField(id, value) {
    var text = String(value);
    return id + (text.length < 10 ? '0' : '') + text.length + text;
  }

  function pixCrc16(payload) {
    var crc = 0xFFFF;
    for (var i = 0; i < payload.length; i += 1) {
      crc ^= payload.charCodeAt(i) << 8;
      for (var bit = 0; bit < 8; bit += 1) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
    }
    return ('0000' + crc.toString(16).toUpperCase()).slice(-4);
  }

  function pixAscii(text, max) {
    return String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9 .,\-@/&]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
  }

  // BR Code estático do Banco Central (EMV), conferido com o exemplo oficial do manual do Pix.
  function pixPayload(data) {
    var account = pixField('00', 'br.gov.bcb.pix') + pixField('01', data.key);
    var description = pixAscii(data.description, 99 - account.length - 4);
    if (description) account += pixField('02', description);
    var txid = String(data.txid || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***';
    var amount = Number(data.amount) > 0 ? Number(data.amount).toFixed(2) : '';
    var body = pixField('00', '01') + pixField('26', account) + pixField('52', '0000') + pixField('53', '986') +
      (amount ? pixField('54', amount) : '') + pixField('58', 'BR') + pixField('59', pixAscii(data.name, 25)) +
      pixField('60', pixAscii(data.city, 15)) + pixField('62', pixField('05', txid)) + '6304';
    return body + pixCrc16(body);
  }

  function pixCanvas(payload) {
    if (!window.qrcode) return null;
    var code = window.qrcode(0, 'M');
    code.addData(payload);
    code.make();
    var count = code.getModuleCount();
    var cell = 8;
    var margin = 4;
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = (count + margin * 2) * cell;
    var context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#000000';
    for (var row = 0; row < count; row += 1) {
      for (var col = 0; col < count; col += 1) {
        if (code.isDark(row, col)) context.fillRect((col + margin) * cell, (row + margin) * cell, cell, cell);
      }
    }
    return canvas;
  }

  var PIX_KINDS = [['cpf', 'CPF'], ['cnpj', 'CNPJ'], ['telefone', 'Telefone'], ['email', 'E-mail'], ['aleatoria', 'Chave aleatória']];

  function cpfValid(digits) {
    if (!/^\d{11}$/.test(digits) || /^(\d)\1{10}$/.test(digits)) return false;
    for (var size = 9; size <= 10; size += 1) {
      var sum = 0;
      for (var i = 0; i < size; i += 1) sum += Number(digits[i]) * (size + 1 - i);
      var check = (sum * 10) % 11 % 10;
      if (check !== Number(digits[size])) return false;
    }
    return true;
  }

  // Reconhece o tipo pela chave digitada; a pessoa ainda pode escolher outro tipo nos botões.
  function detectPixKind(value) {
    var text = String(value || '').trim();
    var digits = text.replace(/\D/g, '');
    if (!text) return null;
    if (text.indexOf('@') !== -1) return 'email';
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(text)) return 'aleatoria';
    if (/^\+/.test(text)) return 'telefone';
    if (digits.length === 14) return 'cnpj';
    if (digits.length === 11) return cpfValid(digits) ? 'cpf' : 'telefone';
    if (digits.length === 10 || digits.length === 12 || digits.length === 13) return 'telefone';
    return null;
  }

  function paintPixKinds(panel) {
    panel.querySelectorAll('[data-pix-kind]').forEach(function (chip) {
      chip.classList.toggle('is-on', chip.getAttribute('data-pix-kind') === tools.pixKind);
      chip.setAttribute('aria-pressed', String(chip.getAttribute('data-pix-kind') === tools.pixKind));
    });
  }

  function paintPix(body) {
    if (!tools.pix) {
      body.innerHTML = '<p class="crm-tools-note">Carregando…</p>';
      crmApi('GET', '/crm_pix_settings').then(function (data) {
        tools.pix = data;
        if (tools.mode === 'pix') paintPix(body);
      }).catch(function (error) { body.innerHTML = '<p class="crm-tools-note">' + escapeHtml(error.message) + '</p>'; });
      return;
    }
    var pix = tools.pix;
    if (!pix.configured || pix.editing) {
      if (!pix.admin) {
        body.innerHTML = '<p class="crm-tools-note">A chave PIX da empresa ainda não foi cadastrada. Peça ao administrador.</p>';
        return;
      }
      tools.pixKind = tools.pixKind || pix.kind || null;
      body.innerHTML = '<p class="crm-tools-note">Cadastre uma vez a chave PIX da empresa. Ela aparece no código que o cliente recebe.</p>' +
        '<label class="crm-tools-field">Chave PIX<input data-pix="key" value="' + escapeHtml(pix.key || '') + '" autocomplete="off" placeholder="CPF, CNPJ, telefone, e-mail ou chave aleatória"></label>' +
        '<div class="crm-tools-field">Tipo da chave<div class="crm-tools-chips" role="group" aria-label="Tipo da chave">' + PIX_KINDS.map(function (kind) {
          return '<button type="button" data-pix-kind="' + kind[0] + '">' + kind[1] + '</button>';
        }).join('') + '</div></div>' +
        '<label class="crm-tools-field">Nome do recebedor<input data-pix="name" maxlength="60" value="' + escapeHtml(pix.name || '') + '"></label>' +
        '<label class="crm-tools-field">Cidade<input data-pix="city" maxlength="60" value="' + escapeHtml(pix.city || '') + '"></label>' +
        '<div class="crm-tools-actions">' + (pix.configured ? '<button type="button" class="kb-btn" data-tool="pix-cancel">Cancelar</button>' : '') +
        '<button type="button" class="kb-btn is-primary" data-tool="pix-save">Salvar chave</button></div>';
      paintPixKinds(body);
      return;
    }
    body.innerHTML = '<p class="crm-tools-note">Recebedor: <strong>' + escapeHtml(pix.name) + '</strong> · ' + escapeHtml(pix.key) +
      (pix.admin ? ' <button type="button" class="crm-tools-link" data-tool="pix-edit">Alterar</button>' : '') + '</p>' +
      '<div class="crm-tools-row"><label class="crm-tools-field">Valor (R$)<input data-pix="amount" inputmode="decimal" placeholder="Em branco: o cliente digita"></label>' +
      '<label class="crm-tools-field">Identificador<input data-pix="txid" maxlength="25" placeholder="Opcional"></label></div>' +
      '<label class="crm-tools-field">Descrição<input data-pix="description" maxlength="60" placeholder="Opcional, ex.: Pedido 123"></label>' +
      '<div class="crm-tools-actions"><button type="button" class="kb-btn is-primary" data-tool="pix-make">Gerar PIX</button></div>' +
      '<div class="crm-pix-result" data-pix-result></div>';
  }

  function pixMake(panel) {
    var amountText = panel.querySelector('[data-pix="amount"]').value;
    var amount = amountText.trim() ? toolNumber(amountText) : 0;
    if (amountText.trim() && (!Number.isFinite(amount) || amount <= 0 || amount > 9999999999)) return toolToast('Valor inválido.');
    var description = panel.querySelector('[data-pix="description"]').value.trim();
    var payload = pixPayload({ key: tools.pix.key, name: tools.pix.name, city: tools.pix.city, amount: amount, description: description, txid: panel.querySelector('[data-pix="txid"]').value });
    tools.pixCode = payload;
    tools.pixAmount = amount;
    tools.pixDescription = description;
    var canvas = pixCanvas(payload);
    var result = panel.querySelector('[data-pix-result]');
    result.innerHTML = (canvas ? '<img alt="QR Code do PIX" src="' + canvas.toDataURL('image/png') + '">' : '') +
      '<textarea readonly rows="2" data-pix-code>' + escapeHtml(payload) + '</textarea>' +
      '<div class="crm-tools-actions crm-pix-actions"><button type="button" class="kb-btn" data-tool="pix-copy">Copiar código</button>' +
      '<button type="button" class="kb-btn is-primary" data-tool="pix-send">Enviar PIX</button></div>';
    tools.pixBlob = null;
    tools.pixCanvas = canvas;
    if (canvas && canvas.toBlob) canvas.toBlob(function (blob) { tools.pixBlob = blob; }, 'image/png');
    if (!canvas) result.insertAdjacentHTML('afterbegin', '<p class="crm-tools-note">Não foi possível desenhar o QR Code nesta tela. O PIX vai só com o código Copia e Cola.</p>');
    // Os botões ficam presos no rodapé do painel; ainda assim, rola até o resultado para ele aparecer inteiro.
    var send = result.querySelector('[data-tool="pix-send"]');
    if (send && send.scrollIntoView) send.scrollIntoView({ block: 'nearest' });
  }

  function pixMessage(withQr) {
    return 'PIX para pagamento\n' + (tools.pixAmount ? 'Valor: ' + toolMoney(tools.pixAmount) + '\n' : '') + 'Recebedor: ' + tools.pix.name + '\n' +
      (tools.pixDescription ? 'Referência: ' + tools.pixDescription + '\n' : '') +
      (withQr ? '\nPague lendo o QR Code ou use o código PIX Copia e Cola da próxima mensagem (toque e segure para copiar).'
        : '\nUse o código PIX Copia e Cola da próxima mensagem (toque e segure para copiar).');
  }

  // Imagem do QR pronta para anexar: a que já foi preparada ou, se o clique foi rápido, prepara agora.
  function pixQrBlob() {
    if (tools.pixBlob) return Promise.resolve(tools.pixBlob);
    if (!tools.pixCanvas || !tools.pixCanvas.toBlob) return Promise.resolve(null);
    return new Promise(function (resolve) { tools.pixCanvas.toBlob(function (blob) { resolve(blob); }, 'image/png'); });
  }

  function pixChat() {
    var store = appStore().$store;
    return store && store.getters.getSelectedChat ? store.getters.getSelectedChat : null;
  }

  function postMessage(chatId, body, json) {
    var headers = Object.assign({}, authHeaders());
    if (json) headers['Content-Type'] = 'application/json';
    else delete headers['Content-Type'];
    return fetch('/api/v1/accounts/' + accountBase().split('/').pop() + '/conversations/' + encodeURIComponent(chatId) + '/messages', {
      method: 'POST', credentials: 'same-origin', headers: headers, body: json ? JSON.stringify(body) : body,
    }).then(function (response) {
      if (!response.ok) throw new Error(response.status === 403 || response.status === 401 ? 'Sem permissão para enviar nesta conversa.' : 'Não foi possível enviar.');
      return response.json();
    });
  }

  // Envia em duas mensagens pelo caminho normal: a cobrança com o QR Code e, em seguida, só o código (fácil de copiar no WhatsApp).
  function pixSend() {
    var chat = pixChat();
    if (!chat || !chat.id || !document.querySelector('.reply-box')) return toolToast('Abra a conversa do cliente para enviar.');
    if (!tools.pixCode) return toolToast('Gere o PIX primeiro.');
    var contact = (chat.meta && chat.meta.sender && chat.meta.sender.name) || 'o cliente';
    var hasQr = Boolean(tools.pixCanvas);
    window.crmKanban.dialog({
      title: 'Enviar PIX', submit: 'Enviar PIX', narrow: true,
      body: '<p class="crm-view-empty">Enviar a cobrança' + (tools.pixAmount ? ' de <strong>' + escapeHtml(toolMoney(tools.pixAmount)) + '</strong>' : ' sem valor definido') +
        ' para <strong>' + escapeHtml(contact) + '</strong>? Vão duas mensagens: ' + (hasQr ? 'o QR Code com os dados' : 'os dados da cobrança') +
        ' e, em seguida, o código PIX Copia e Cola.</p>',
      onSubmit: function () {
        return pixQrBlob().then(function (blob) {
          if (!blob) return postMessage(chat.id, { content: pixMessage(false), private: false }, true);
          var form = new FormData();
          form.append('content', pixMessage(true));
          form.append('private', 'false');
          form.append('attachments[]', new File([blob], 'pix-qrcode.png', { type: 'image/png' }));
          return postMessage(chat.id, form, false);
        }).then(function () {
          return postMessage(chat.id, { content: tools.pixCode, private: false }, true);
        }).then(function () {
          toolToast('PIX enviado.');
          closeTools();
        });
      },
    });
    return undefined;
  }

  function pixSave(panel) {
    var value = function (name) { return panel.querySelector('[data-pix="' + name + '"]').value; };
    if (!tools.pixKind) return toolToast('Escolha o tipo da chave.');
    return crmApi('PATCH', '/crm_pix_settings', { kind: tools.pixKind, key: value('key'), name: value('name'), city: value('city') }).then(function (data) {
      tools.pix = data;
      tools.pixKind = null;
      tools.pixKindManual = false;
      toolToast('Chave PIX salva.');
      paintToolTab();
    }).catch(function (error) { toolToast(error.message); });
  }

  // ---------- Conversor ----------
  function paintConverter(body) {
    var kind = tools.unitKind || 'peso';
    var group = TOOL_UNITS[kind];
    var options = function (selected) {
      return group.units.map(function (unit) { return '<option value="' + unit[0] + '"' + (unit[0] === selected ? ' selected' : '') + '>' + unit[1] + '</option>'; }).join('');
    };
    body.innerHTML = '<div class="crm-tools-chips">' + Object.keys(TOOL_UNITS).map(function (key) {
      return '<button type="button" data-unit-kind="' + key + '" class="' + (key === kind ? 'is-on' : '') + '">' + TOOL_UNITS[key].label + '</button>';
    }).join('') + '<button type="button" data-unit-kind="cubagem" class="' + (kind === 'cubagem' ? 'is-on' : '') + '">Cubagem</button></div>' +
      (kind === 'cubagem' ? cubageForm() :
        '<div class="crm-tools-row"><label class="crm-tools-field">Valor<input data-unit="value" inputmode="decimal" value="' + escapeHtml(tools.unitValue || '') + '"></label>' +
        '<label class="crm-tools-field">De<select data-unit="from">' + options(tools.unitFrom || group.units[1 % group.units.length][0]) + '</select></label>' +
        '<label class="crm-tools-field">Para<select data-unit="to">' + options(tools.unitTo || group.units[group.units.length - 1][0]) + '</select></label></div>') +
      '<p class="crm-tools-result" data-unit-result></p>' +
      '<div class="crm-tools-actions"><button type="button" class="kb-btn" data-tool="unit-copy">Copiar</button><button type="button" class="kb-btn is-primary" data-tool="unit-insert">Inserir na conversa</button></div>';
    if (kind !== 'cubagem') {
      var units = group.units.map(function (unit) { return unit[0]; });
      if (units.indexOf(tools.unitFrom) === -1) tools.unitFrom = body.querySelector('[data-unit="from"]').value;
      if (units.indexOf(tools.unitTo) === -1) tools.unitTo = body.querySelector('[data-unit="to"]').value;
    }
    paintUnitResult(body);
  }

  function cubageForm() {
    var c = tools.cubage || {};
    var field = function (name, label, value) {
      return '<label class="crm-tools-field">' + label + '<input data-cube="' + name + '" inputmode="decimal" value="' + escapeHtml(value || '') + '"></label>';
    };
    return '<div class="crm-tools-row">' + field('c', 'Comprimento (cm)', c.c) + field('l', 'Largura (cm)', c.l) + field('a', 'Altura (cm)', c.a) + '</div>' +
      '<div class="crm-tools-row">' + field('q', 'Volumes', c.q || '1') + field('f', 'Fator (kg/m³)', c.f || '300') + '</div>';
  }

  function unitText() {
    if ((tools.unitKind || 'peso') === 'cubagem') {
      var c = tools.cubage || {};
      var dims = ['c', 'l', 'a', 'q', 'f'].map(function (key) { return toolNumber(c[key] || (key === 'q' ? '1' : key === 'f' ? '300' : '')); });
      if (dims.some(function (value) { return !Number.isFinite(value) || value <= 0; })) return '';
      var cubic = (dims[0] * dims[1] * dims[2] / 1000000) * dims[3];
      return 'Cubagem: ' + toolFormat(dims[3], 0) + (dims[3] === 1 ? ' volume' : ' volumes') + ' de ' + toolFormat(dims[0], 2) + ' × ' + toolFormat(dims[1], 2) + ' × ' + toolFormat(dims[2], 2) +
        ' cm = ' + toolFormat(cubic, 4) + ' m³ · peso cubado ' + toolFormat(cubic * dims[4], 2) + ' kg (fator ' + toolFormat(dims[4], 2) + ' kg/m³)';
    }
    var group = TOOL_UNITS[tools.unitKind || 'peso'];
    var value = toolNumber(tools.unitValue);
    var from = group.units.filter(function (unit) { return unit[0] === tools.unitFrom; })[0];
    var to = group.units.filter(function (unit) { return unit[0] === tools.unitTo; })[0];
    if (!Number.isFinite(value) || !from || !to) return '';
    return toolFormat(value) + ' ' + from[1] + ' = ' + toolFormat(value * from[2] / to[2]) + ' ' + to[1];
  }

  function paintUnitResult(body) {
    var result = body.querySelector('[data-unit-result]');
    if (!result) return;
    var text = unitText();
    result.textContent = text || 'Preencha os valores.';
    result.classList.toggle('is-empty', !text);
  }

  // ---------- Modelos com campos (respostas prontas com [[Campo]]) ----------
  function templateFields(content) {
    var seen = [];
    String(content).replace(/\[\[([^\]\n]{1,40})\]\]/g, function (match, name) {
      var clean = name.trim();
      if (clean && seen.indexOf(clean) === -1) seen.push(clean);
      return match;
    });
    return seen;
  }

  function replyVariables() {
    var store = appStore().$store;
    var chat = store && store.getters.getSelectedChat ? store.getters.getSelectedChat : null;
    var contact = (chat && chat.meta && chat.meta.sender) || {};
    var agent = store && store.getters.getCurrentUser ? store.getters.getCurrentUser : {};
    var inbox = chat && store.getters['inboxes/getInbox'] ? store.getters['inboxes/getInbox'](chat.inbox_id) : null;
    var first = function (name) { return String(name || '').trim().split(/\s+/)[0] || ''; };
    var last = function (name) { var parts = String(name || '').trim().split(/\s+/); return parts.length > 1 ? parts[parts.length - 1] : ''; };
    return {
      'contact.name': contact.name, 'contact.first_name': first(contact.name), 'contact.last_name': last(contact.name), 'contact.email': contact.email,
      'contact.phone': contact.phone_number, 'contact.id': contact.id, 'agent.name': agent.available_name || agent.name, 'agent.first_name': first(agent.available_name || agent.name),
      'agent.last_name': last(agent.available_name || agent.name), 'agent.email': agent.email, 'conversation.id': chat && chat.id, 'inbox.name': inbox && inbox.name, 'inbox.id': chat && chat.inbox_id,
    };
  }

  function fillTemplate(content, values) {
    var variables = replyVariables();
    return String(content)
      .replace(/\{\{\s*([a-z_.]+)\s*\}\}/g, function (match, key) { return variables[key] !== undefined && variables[key] !== null ? String(variables[key]) : match; })
      .replace(/\[\[([^\]\n]{1,40})\]\]/g, function (match, name) { var value = values[name.trim()]; return value ? value : ''; })
      .replace(/[ \t]+$/gm, '');
  }

  function paintModels(body) {
    if (!tools.canned) {
      body.innerHTML = '<p class="crm-tools-note">Carregando…</p>';
      crmApi('GET', '/canned_responses').then(function (data) {
        tools.canned = (Array.isArray(data) ? data : data.payload || []).filter(function (item) { return templateFields(item.content).length; });
        if (tools.tab === 'modelos') paintModels(body);
      }).catch(function (error) { body.innerHTML = '<p class="crm-tools-note">' + escapeHtml(error.message) + '</p>'; });
      return;
    }
    if (tools.model) {
      var model = tools.model;
      body.innerHTML = '<p class="crm-tools-note"><button type="button" class="crm-tools-link" data-tool="model-back">← Modelos</button> <strong>' + escapeHtml(model.short_code) + '</strong></p>' +
        templateFields(model.content).map(function (name) {
          return '<label class="crm-tools-field">' + escapeHtml(name) + '<input data-model-field="' + escapeHtml(name) + '" value="' + escapeHtml((tools.modelValues || {})[name] || '') + '"></label>';
        }).join('') +
        '<pre class="crm-tools-preview" data-model-preview></pre>' +
        '<div class="crm-tools-actions"><button type="button" class="kb-btn" data-tool="model-copy">Copiar</button><button type="button" class="kb-btn is-primary" data-tool="model-insert">Inserir na conversa</button></div>';
      body.querySelector('[data-model-preview]').textContent = fillTemplate(model.content, tools.modelValues || {});
      var first = body.querySelector('[data-model-field]');
      if (first) first.focus();
      return;
    }
    if (!tools.canned.length) {
      body.innerHTML = '<p class="crm-tools-note">Nenhum modelo com campos ainda. Crie em <strong>Configurações → Respostas prontas</strong> uma resposta com os campos entre colchetes duplos. Exemplo:</p>' +
        '<pre class="crm-tools-preview">Dados da coleta\nPedido: [[Pedido]]\nTransportadora: [[Transportadora]]\nPlaca: [[Placa]]\nPeso: [[Peso]]\nData: [[Data]]\nHorário: [[Horário]]</pre>' +
        '<p class="crm-tools-note">Variáveis como {{contact.name}} continuam valendo. A resposta também aparece pelo atalho / no campo de digitação.</p>' +
        (currentRole() === 'administrator' ? '<div class="crm-tools-actions"><button type="button" class="kb-btn" data-tool="model-settings">Abrir Respostas prontas</button></div>' : '');
      return;
    }
    body.innerHTML = '<input class="crm-tools-search" data-model-search placeholder="Buscar modelo" value="' + escapeHtml(tools.modelTerm || '') + '">' +
      '<div class="crm-tools-list" data-model-list></div>';
    paintModelList(body);
  }

  function paintModelList(body) {
    var list = body.querySelector('[data-model-list]');
    if (!list) return;
    var term = String(tools.modelTerm || '').toLowerCase();
    var items = tools.canned.filter(function (item) { return !term || (item.short_code + ' ' + item.content).toLowerCase().indexOf(term) !== -1; });
    list.innerHTML = items.length ? items.map(function (item) {
      return '<button type="button" data-model-id="' + item.id + '"><strong>' + escapeHtml(item.short_code) + '</strong><small>' + escapeHtml(templateFields(item.content).join(', ')) + '</small></button>';
    }).join('') : '<p class="crm-tools-note">Nenhum modelo encontrado.</p>';
  }

  function modelText() {
    return tools.model ? fillTemplate(tools.model.content, tools.modelValues || {}) : '';
  }

  // ---------- Calculadora (a que já existe) ----------
  function paintCalcTab(body) {
    body.innerHTML = '<p class="crm-tools-note">Abre a calculadora do CRM. Nela, o botão <strong>Inserir</strong> põe o resultado no campo de digitação.</p>' +
      '<div class="crm-tools-actions"><button type="button" class="kb-btn is-primary" data-tool="calc-open">Abrir calculadora</button></div>';
  }

  function toolsInput(event) {
    var panel = document.querySelector('.crm-tools');
    var target = event.target;
    if (target.hasAttribute('data-unit')) {
      var key = target.getAttribute('data-unit');
      if (key === 'value') tools.unitValue = target.value;
      if (key === 'from') tools.unitFrom = target.value;
      if (key === 'to') tools.unitTo = target.value;
      paintUnitResult(panel);
    } else if (target.hasAttribute('data-cube')) {
      tools.cubage = tools.cubage || {};
      tools.cubage[target.getAttribute('data-cube')] = target.value;
      paintUnitResult(panel);
    } else if (target.hasAttribute('data-model-field')) {
      tools.modelValues = tools.modelValues || {};
      tools.modelValues[target.getAttribute('data-model-field')] = target.value;
      panel.querySelector('[data-model-preview]').textContent = modelText();
    } else if (target.hasAttribute('data-model-search')) {
      tools.modelTerm = target.value;
      paintModelList(panel);
    } else if (event.type === 'input' && target.matches('[data-pix="key"]')) {
      var detected = detectPixKind(target.value);
      if (!tools.pixKindManual && detected) {
        tools.pixKind = detected;
        paintPixKinds(panel);
      }
    } else if (event.type === 'input' && target.matches('[data-pix="amount"], [data-pix="description"], [data-pix="txid"]')) {
      var result = panel.querySelector('[data-pix-result]');
      if (result) result.innerHTML = '';
      tools.pixCode = '';
    }
  }

  function toolsClick(event) {
    var panel = document.querySelector('.crm-tools');
    var tab = event.target.closest('[data-tool-tab]');
    if (tab) {
      tools.tab = tab.getAttribute('data-tool-tab');
      return paintToolTab();
    }
    var pixKind = event.target.closest('[data-pix-kind]');
    if (pixKind) {
      tools.pixKind = pixKind.getAttribute('data-pix-kind');
      tools.pixKindManual = true;
      return paintPixKinds(panel);
    }
    var kind = event.target.closest('[data-unit-kind]');
    if (kind) {
      tools.unitKind = kind.getAttribute('data-unit-kind');
      return paintToolTab();
    }
    var modelButton = event.target.closest('[data-model-id]');
    if (modelButton) {
      tools.model = tools.canned.filter(function (item) { return String(item.id) === modelButton.getAttribute('data-model-id'); })[0];
      tools.modelValues = {};
      return paintToolTab();
    }
    var action = event.target.closest('[data-tool]');
    if (!action) return undefined;
    var name = action.getAttribute('data-tool');
    if (name === 'close') return closeTools();
    if (name === 'pix-save') return pixSave(panel);
    if (name === 'pix-edit') { tools.pix.editing = true; tools.pixKind = tools.pix.kind; tools.pixKindManual = true; return paintToolTab(); }
    if (name === 'pix-cancel') { tools.pix.editing = false; tools.pixKind = null; tools.pixKindManual = false; return paintToolTab(); }
    if (name === 'pix-make') return pixMake(panel);
    if (name === 'pix-copy') return copyText(tools.pixCode, 'Código PIX copiado.');
    if (name === 'pix-send') return pixSend();
    var text = unitText();
    if (name === 'unit-copy') return text ? copyText(text) : toolToast('Preencha os valores.');
    if (name === 'unit-insert') { if (text && insertIntoReply(text)) closeTools(); else if (!text) toolToast('Preencha os valores.'); return undefined; }
    if (name === 'model-back') { tools.model = null; return paintToolTab(); }
    if (name === 'model-copy') return copyText(modelText());
    if (name === 'model-insert') { if (insertIntoReply(modelText())) { toolToast('Modelo inserido. Revise e envie.'); tools.model = null; closeTools(); } return undefined; }
    if (name === 'model-settings') { closeTools(); goTo(accountBase() + '/settings/canned-response/list'); return undefined; }
    if (name === 'calc-open') {
      closeTools();
      if (window.crmKanban && window.crmKanban.openCalculator) window.crmKanban.openCalculator();
    }
    return undefined;
  }

  // Assistente de IA: painel lateral aberto pelo menu do perfil. Só consulta; a conversa fica só nesta tela.
  var ai = { layer: null, turns: [], busy: false, info: null };
  var AI_SUGGESTIONS = ['O que está atrasado hoje?', 'Quantas conversas estão sem responsável?', 'Quais cartões estão parados há mais de uma semana?', 'Quais são as minhas atividades de hoje?'];

  function aiAnswerHtml(text) {
    var base = accountBase();
    return escapeHtml(text)
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^&\w])#(\d{1,9})\b/g, function (match, before, number) {
        return before + '<a href="' + base + '/conversations/' + number + '" data-ai-conv="' + number + '">#' + number + '</a>';
      })
      .replace(/\n/g, '<br>');
  }

  function openAssistant() {
    if (ai.layer) return;
    var layer = document.createElement('div');
    layer.className = 'crm-team-layer';
    layer.innerHTML = '<section class="crm-team crm-ai" role="dialog" aria-modal="true" aria-label="Assistente de IA">' +
      '<header class="crm-team-head"><h2>Assistente</h2><span class="crm-grow"></span>' +
      '<button type="button" class="kb-btn is-small" data-ai="reset">Nova conversa</button>' +
      '<button type="button" class="kb-icon-btn" data-ai="close" aria-label="Fechar">' + icon('M18 6 6 18M6 6l12 12') + '</button></header>' +
      '<p class="crm-ai-note" data-ai-note>Consulta só o que você já vê no CRM e não altera nada. A pergunta e os dados consultados vão para a OpenAI.</p>' +
      '<div class="crm-team-msgs crm-ai-msgs" data-ai-msgs></div>' +
      '<footer class="crm-team-compose"><textarea data-ai-input rows="2" maxlength="1000" placeholder="Pergunte sobre conversas, atividades ou o Kanban"></textarea>' +
      '<button type="button" class="kb-btn is-primary" data-ai="send">Perguntar</button></footer></section>';
    document.body.appendChild(layer);
    ai.layer = layer;
    layer.addEventListener('mousedown', function (event) { if (event.target === layer) closeAssistant(); });
    layer.addEventListener('click', assistantClick);
    layer.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !document.querySelector('.kb-layer')) closeAssistant();
      if (event.key === 'Enter' && !event.shiftKey && event.target.matches('[data-ai-input]') && !window.matchMedia('(pointer: coarse)').matches) {
        event.preventDefault();
        askAssistant();
      }
    });
    paintAssistant();
    crmApi('GET', '/crm_ai_assistant').then(function (data) {
      ai.info = data;
      paintAssistantNote();
    }).catch(function () {});
    var input = layer.querySelector('[data-ai-input]');
    if (window.matchMedia('(min-width: 768px)').matches) input.focus();
  }

  function closeAssistant() {
    if (ai.layer) ai.layer.remove();
    ai.layer = null;
  }

  function paintAssistantNote() {
    var note = ai.layer && ai.layer.querySelector('[data-ai-note]');
    if (!note || !ai.info) return;
    var text = 'Consulta só o que você já vê no CRM e não altera nada. A pergunta e os dados consultados vão para a OpenAI.';
    if (!ai.info.key_configured) text = 'A conta ainda não tem chave da OpenAI. ' + (ai.info.admin ? 'Configure em Configurações → Integrações → OpenAI.' : 'Peça ao administrador para configurar.');
    var budget = ai.info.budget;
    var usd = function (value) { return 'US$ ' + value.toFixed(2).replace('.', ','); };
    var spent = budget && budget.spent_usd > 0 && budget.spent_usd < 0.01 ? 'menos de US$ 0,01' : budget ? usd(budget.spent_usd) : '';
    note.innerHTML = escapeHtml(text) + (budget ? ' <span class="crm-ai-budget">Gasto estimado do mês: ' + spent + ' de ' + usd(budget.limit_usd) +
      ' (' + budget.questions + (budget.questions === 1 ? ' pergunta' : ' perguntas') + ').</span> <button type="button" data-ai="limit">Alterar limite</button>' : '');
  }

  function paintAssistant() {
    var list = ai.layer && ai.layer.querySelector('[data-ai-msgs]');
    if (!list) return;
    if (!ai.turns.length) {
      list.innerHTML = '<div class="crm-ai-start"><p>Exemplos de perguntas:</p>' + AI_SUGGESTIONS.map(function (text) {
        return '<button type="button" data-ai-suggest>' + escapeHtml(text) + '</button>';
      }).join('') + '</div>';
      return;
    }
    list.innerHTML = ai.turns.map(function (turn) {
      if (turn.role === 'user') return '<article class="crm-team-msg is-mine"><p>' + escapeHtml(turn.content).replace(/\n/g, '<br>') + '</p></article>';
      return '<article class="crm-team-msg crm-ai-answer' + (turn.error ? ' is-error' : '') + '"><div class="crm-team-meta"><strong>Assistente</strong></div><p>' + aiAnswerHtml(turn.content) + '</p></article>';
    }).join('') + (ai.busy ? '<article class="crm-team-msg crm-ai-answer is-busy"><p>Consultando…</p></article>' : '');
    list.scrollTop = list.scrollHeight;
  }

  function askAssistant(text) {
    var input = ai.layer && ai.layer.querySelector('[data-ai-input]');
    var question = (text || (input ? input.value : '')).trim();
    if (!question || ai.busy) return;
    var history = ai.turns.filter(function (turn) { return !turn.error; }).slice(-6).map(function (turn) { return { role: turn.role, content: turn.content }; });
    ai.turns.push({ role: 'user', content: question });
    ai.busy = true;
    if (input) input.value = '';
    paintAssistant();
    crmApi('POST', '/crm_ai_assistant/ask', { question: question, history: history }).then(function (data) {
      ai.turns.push({ role: 'assistant', content: data.answer });
    }).catch(function (error) {
      ai.turns.push({ role: 'assistant', content: error.message || 'Não foi possível consultar agora.', error: true });
    }).then(function () {
      ai.busy = false;
      paintAssistant();
      if (ai.info && ai.info.admin) crmApi('GET', '/crm_ai_assistant').then(function (data) { ai.info = data; paintAssistantNote(); }).catch(function () {});
    });
  }

  function openAssistantLimit() {
    var budget = ai.info && ai.info.budget;
    window.crmKanban.dialog({
      title: 'Limite mensal da IA', submit: 'Salvar', narrow: true,
      body: '<p class="crm-view-empty">Quando o gasto estimado do mês chega no limite, o assistente para de responder até o mês virar. É uma estimativa: a cobrança que vale é a da OpenAI.</p>' +
        '<label class="kb-field">Limite por mês (US$)<input name="limit" type="number" min="0" max="200" step="0.5" value="' + (budget ? budget.limit_usd : 5) + '"></label>',
      onSubmit: function (form) {
        return crmApi('PATCH', '/crm_ai_assistant', { monthly_limit_usd: Number(form.querySelector('[name="limit"]').value) }).then(function (data) {
          ai.info.budget = data.budget;
          paintAssistantNote();
          window.crmKanban.toast('Limite atualizado.');
        });
      },
    });
  }

  function assistantClick(event) {
    var conv = event.target.closest('[data-ai-conv]');
    if (conv) {
      event.preventDefault();
      closeAssistant();
      goTo(accountBase() + '/conversations/' + conv.getAttribute('data-ai-conv'));
      return;
    }
    var suggest = event.target.closest('[data-ai-suggest]');
    if (suggest) return askAssistant(suggest.textContent);
    var action = event.target.closest('[data-ai]');
    if (!action) return;
    var name = action.getAttribute('data-ai');
    if (name === 'close') closeAssistant();
    else if (name === 'send') askAssistant();
    else if (name === 'limit') openAssistantLimit();
    else if (name === 'reset') {
      ai.turns = [];
      paintAssistant();
    }
  }

  // Modo apresentação: escolha de cada pessoa, guardada só neste navegador; vale enquanto o recurso estiver ligado.
  var PRESENT_KEY = 'crm-modo-apresentacao';

  function presentationChosen() {
    try { return window.localStorage.getItem(PRESENT_KEY) === '1'; } catch (error) { return false; }
  }

  function setPresentation(on) {
    try {
      if (on) window.localStorage.setItem(PRESENT_KEY, '1');
      else window.localStorage.removeItem(PRESENT_KEY);
    } catch (error) { /* navegador sem armazenamento: vale só nesta página */ }
    applyPresentation(on);
  }

  function applyPresentation(forced) {
    var on = window.crmModules.enabled('modo_apresentacao') && (forced === undefined ? presentationChosen() : forced);
    var pill = document.querySelector('.crm-presenting');
    if (!on) {
      document.body.removeAttribute('data-crm-presenting');
      if (pill) pill.remove();
      return;
    }
    document.body.setAttribute('data-crm-presenting', 'true');
    if (pill || EMBED) return;
    pill = document.createElement('div');
    pill.className = 'crm-presenting';
    pill.setAttribute('role', 'status');
    pill.innerHTML = '<span>Modo apresentação: clientes borrados</span><button type="button">Desligar</button>';
    pill.querySelector('button').onclick = function () { setPresentation(false); };
    document.body.appendChild(pill);
  }

  document.addEventListener('crm:modules', function () { applyPresentation(); });

  // Mensagens agendadas (recurso opcional). Saem pela conversa que o contato já tem na caixa escolhida.
  var SCHEDULE_REPEAT = [['none', 'Não repetir'], ['daily', 'Todo dia'], ['weekly', 'Toda semana'], ['monthly', 'Todo mês']];

  function schedulesOn() {
    return window.crmModules.enabled('mensagens_agendadas');
  }

  function localInput(date) {
    var pad = function (value) { return String(value).padStart(2, '0'); };
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + 'T' + pad(date.getHours()) + ':' + pad(date.getMinutes());
  }

  function whenText(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  function openScheduleDialog(prefill) {
    var kanban = window.crmKanban;
    if (!kanban || !kanban.dialog || !schedulesOn()) return;
    var data = prefill || {};
    var editing = data.id ? data : null;
    var chosen = (data.recipients || data.contacts || []).map(function (contact) { return { id: contact.id, name: contact.name }; });
    var start = data.next_run_at ? new Date(data.next_run_at) : new Date(Date.now() + 3600000);
    if (!data.next_run_at) start.setMinutes(0, 0, 0);
    var repeat = SCHEDULE_REPEAT.map(function (entry) { return '<option value="' + entry[0] + '"' + ((data.recurrence || 'none') === entry[0] ? ' selected' : '') + '>' + entry[1] + '</option>'; }).join('');
    kanban.dialog({
      title: editing ? 'Alterar agendamento' : 'Agendar mensagem', submit: editing ? 'Salvar' : 'Agendar',
      body: '<label class="kb-field">Título<input name="title" maxlength="120" placeholder="Ex.: Aviso de pedido pronto" value="' + escapeHtml(data.title || '') + '"></label>' +
        '<label class="kb-field">Caixa de entrada<select name="inbox_id"><option value="">Carregando…</option></select></label>' +
        '<div class="kb-field">Contatos<div class="crm-sched-chips" data-sched-chips></div><div class="crm-sched-search"><input type="search" data-sched-search autocomplete="off" placeholder="Buscar contato por nome ou telefone" aria-label="Buscar contato"><div class="crm-sched-suggest" data-sched-suggest hidden></div></div></div>' +
        '<div class="kb-grid-2"><label class="kb-field">Data e hora<input type="datetime-local" name="run_at" value="' + localInput(start) + '"></label><label class="kb-field">Repetir<select name="recurrence">' + repeat + '</select></label></div>' +
        '<label class="kb-field" data-sched-ends' + ((data.recurrence || 'none') === 'none' ? ' hidden' : '') + '>Repetir até (opcional)<input type="date" name="ends_on" value="' + escapeHtml(data.ends_on || '') + '"></label>' +
        '<label class="kb-check"><input type="checkbox" name="business_hours"' + (data.business_hours === false ? '' : ' checked') + '><span>Só em horário comercial (segunda a sábado, das 8h às 18h)</span></label>' +
        '<label class="kb-field">Mensagem<textarea name="content" rows="5" maxlength="4000" placeholder="Escreva a mensagem">' + escapeHtml(data.content || '') + '</textarea></label>' +
        '<p class="crm-view-empty">Sai pela conversa que cada contato já tem nesta caixa. Contato sem conversa nela é pulado, e o motivo aparece no Calendário.</p>',
      onOpen: function (form) {
        form.classList.add('crm-sched');
        var chips = form.querySelector('[data-sched-chips]');
        var suggest = form.querySelector('[data-sched-suggest]');
        var search = form.querySelector('[data-sched-search]');
        var timer = 0;
        var paintChips = function () {
          chips.innerHTML = chosen.length ? chosen.map(function (contact) {
            return '<span class="crm-sched-chip">' + escapeHtml(contact.name || ('#' + contact.id)) + '<button type="button" data-sched-remove="' + contact.id + '" aria-label="Tirar ' + escapeHtml(contact.name || '') + '">×</button></span>';
          }).join('') : '<span class="crm-view-empty">Nenhum contato escolhido.</span>';
        };
        paintChips();
        crmApi('GET', '/inboxes').then(function (payload) {
          var boxes = ((payload && payload.payload) || []).filter(function (box) { return box.channel_type !== 'Channel::Email'; });
          var select = form.querySelector('[name=inbox_id]');
          var wanted = String((data.inbox && data.inbox.id) || data.inboxId || '');
          select.innerHTML = boxes.length ? boxes.map(function (box) { return '<option value="' + box.id + '"' + (String(box.id) === wanted ? ' selected' : '') + '>' + escapeHtml(box.name) + '</option>'; }).join('') : '<option value="">Nenhuma caixa disponível</option>';
        }).catch(function () {});
        form.querySelector('[name=recurrence]').addEventListener('change', function (event) {
          form.querySelector('[data-sched-ends]').hidden = event.target.value === 'none';
        });
        search.addEventListener('input', function () {
          window.clearTimeout(timer);
          var term = search.value.trim();
          if (term.length < 2) { suggest.hidden = true; return; }
          timer = window.setTimeout(function () {
            crmApi('GET', '/contacts/search?q=' + encodeURIComponent(term)).then(function (payload) {
              var found = ((payload && payload.payload) || []).slice(0, 8);
              suggest.innerHTML = found.length ? found.map(function (contact) {
                return '<button type="button" data-sched-add="' + contact.id + '" data-name="' + escapeHtml(contact.name || '') + '">' + escapeHtml(contact.name || 'Sem nome') + '<small>' + escapeHtml(contact.phone_number || contact.email || '') + '</small></button>';
              }).join('') : '<p class="crm-view-empty">Nenhum contato encontrado.</p>';
              suggest.hidden = false;
            }).catch(function () {});
          }, 250);
        });
        form.addEventListener('click', function (event) {
          var add = event.target.closest('[data-sched-add]');
          if (add) {
            var id = Number(add.getAttribute('data-sched-add'));
            if (chosen.length >= 50) { kanban.toast('No máximo 50 contatos por agendamento.', 'error'); return; }
            if (!chosen.some(function (contact) { return contact.id === id; })) chosen.push({ id: id, name: add.getAttribute('data-name') });
            search.value = '';
            suggest.hidden = true;
            paintChips();
            return;
          }
          var remove = event.target.closest('[data-sched-remove]');
          if (remove) {
            var gone = Number(remove.getAttribute('data-sched-remove'));
            chosen = chosen.filter(function (contact) { return contact.id !== gone; });
            paintChips();
          }
        });
        search.addEventListener('keydown', function (event) { if (event.key === 'Enter') event.preventDefault(); });
      },
      onSubmit: function (form) {
        var value = function (name) { return form.querySelector('[name=' + name + ']').value; };
        if (!value('title').trim()) return Promise.reject(new Error('Informe o título.'));
        if (!value('content').trim()) return Promise.reject(new Error('Escreva a mensagem.'));
        if (!chosen.length) return Promise.reject(new Error('Escolha pelo menos um contato.'));
        if (!value('inbox_id')) return Promise.reject(new Error('Escolha a caixa de entrada.'));
        if (!value('run_at')) return Promise.reject(new Error('Informe data e hora.'));
        var body = {
          title: value('title').trim(), content: value('content').trim(), inbox_id: Number(value('inbox_id')),
          contact_ids: chosen.map(function (contact) { return contact.id; }), run_at: new Date(value('run_at')).toISOString(),
          recurrence: value('recurrence'), ends_on: value('recurrence') === 'none' ? null : (value('ends_on') || null),
          business_hours: form.querySelector('[name=business_hours]').checked, kanban_item_id: data.kanbanItemId || null,
        };
        return scheduleApi(editing ? 'PATCH' : 'POST', editing ? '/' + editing.id : '', body).then(function () {
          kanban.toast(editing ? 'Agendamento atualizado.' : 'Mensagem agendada.');
          if (document.querySelector('.crm-calendar')) loadCalendar();
        });
      },
    });
  }

  function scheduleApi(method, path, body) {
    var base = accountBase();
    var headers = authHeaders();
    if (!base || !headers) return Promise.reject(new Error('Sessão não encontrada.'));
    return fetch('/api/v1/accounts/' + base.split('/').pop() + '/crm_scheduled_messages' + path, {
      method: method, credentials: 'same-origin', headers: headers, body: body ? JSON.stringify(body) : undefined,
    }).then(function (response) {
      return response.json().catch(function () { return null; }).then(function (data) {
        if (!response.ok) throw new Error((data && data.error) || 'Não foi possível salvar.');
        return data;
      });
    });
  }

  window.crmSchedule = { open: openScheduleDialog, enabled: schedulesOn };

  // Conversas selecionadas: botão "Marcar como lidas" na barra que o Chatwoot já mostra na seleção.
  function mountBulkRead() {
    if (EMBED) return;
    var bars = document.querySelectorAll('.conversations-list-wrap [class*="bg-n-button-color"][class*="rounded-[10px]"]');
    bars.forEach(function (bar) {
      if (bar.querySelector('[data-crm-bulk-read]')) return;
      var clear = Array.prototype.filter.call(bar.querySelectorAll('button'), function (button) { return /limpar|clear/i.test(button.textContent); })[0];
      if (!clear) return;
      var read = clear.cloneNode(true);
      read.setAttribute('data-crm-bulk-read', 'true');
      read.removeAttribute('disabled');
      var label = read.querySelector('span') || read;
      label.textContent = 'Marcar lidas';
      read.title = 'Marcar as conversas selecionadas como lidas';
      read.setAttribute('aria-label', read.title);
      read.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        markSelectedRead(read);
      });
      clear.insertAdjacentElement('afterend', read);
    });
  }

  function markSelectedRead(button) {
    var store = appStore().$store;
    if (!store) return;
    var ids = (store.getters['bulkActions/getSelectedConversationIds'] || []).slice();
    if (!ids.length) return;
    button.disabled = true;
    var queue = ids.slice();
    var failed = 0;
    var next = function () {
      var id = queue.shift();
      if (id === undefined) return Promise.resolve();
      return store.dispatch('markMessagesRead', { id: id }).catch(function () { failed += 1; }).then(next);
    };
    Promise.all([next(), next(), next()]).then(function () {
      store.dispatch('bulkActions/clearSelectedConversationIds');
      refreshRailCounts();
      if (window.crmKanban) window.crmKanban.toast(failed ? (ids.length - failed) + ' marcadas como lidas; ' + failed + ' não foram.' : ids.length + (ids.length === 1 ? ' conversa marcada como lida.' : ' conversas marcadas como lidas.'), failed ? 'error' : undefined);
    });
  }

  // Aviso só para o administrador, só quando algo para de funcionar.
  var QUEUE_NAMES = { email_send: 'de envio de e-mail', email_sync: 'de leitura de e-mail', email_attachments: 'de anexos de e-mail',
    email_backfill: 'de importação de e-mail', default: 'principal', high: 'principal', critical: 'principal', low: 'de rotinas' };

  function healthText(issue) {
    var queue = QUEUE_NAMES[issue.queue] || issue.queue;
    if (issue.kind === 'queue_without_worker') return 'A fila ' + queue + ' tem ' + issue.pending + ' tarefa(s) e nenhum processo trabalhando.';
    if (issue.kind === 'queue_stuck') return 'A fila ' + queue + ' está parada há ' + issue.minutes + ' min (' + issue.pending + ' tarefa(s)).';
    if (issue.kind === 'queue_unreachable') return 'Não foi possível consultar as filas de trabalho.';
    if (issue.kind === 'lid_duplicates') return issue.contacts + ' contato(s) do WhatsApp parece(m) duplicado(s).';
    if (issue.kind === 'whatsapp_down') return 'WhatsApp "' + issue.inbox + '" ' + (WHATSAPP_STATES[issue.status] || 'fora do ar (' + issue.status + ')') + '. As mensagens não estão chegando.';
    if (issue.kind === 'whatsapp_unreachable') return 'Não foi possível consultar o WhatsApp (WAHA). As mensagens podem não estar chegando.';
    return '';
  }

  var WHATSAPP_STATES = {
    SCAN_QR_CODE: 'desconectado: leia o QR Code de novo no celular', STOPPED: 'parado', FAILED: 'com falha na conexão',
    NOT_FOUND: 'sem sessão no WAHA',
  };

  // Filas internas diferentes com o mesmo nome para a equipe ("principal") viram uma linha só, somando as tarefas.
  function mergeQueueIssues(issues) {
    var merged = [];
    var seen = {};
    (issues || []).forEach(function (issue) {
      var queue = QUEUE_NAMES[issue.queue] || issue.queue;
      var key = issue.queue ? issue.kind + '|' + queue : null;
      if (key && seen[key]) {
        seen[key].pending += issue.pending || 0;
        seen[key].minutes = Math.max(seen[key].minutes || 0, issue.minutes || 0);
        return;
      }
      var copy = Object.assign({}, issue);
      if (key) seen[key] = copy;
      merged.push(copy);
    });
    return merged;
  }

  function paintHealth(issues) {
    var box = document.querySelector('.crm-health');
    var texts = mergeQueueIssues(issues).map(healthText).filter(Boolean);
    var signature = texts.join('|');
    var dismissed = '';
    try { dismissed = window.sessionStorage.getItem('crm-health-dismissed') || ''; } catch (error) { dismissed = ''; }
    if (!texts.length || signature === dismissed) {
      if (box) box.remove();
      return;
    }
    if (!box) {
      box = document.createElement('div');
      box.className = 'crm-health';
      box.setAttribute('role', 'status');
      document.body.appendChild(box);
    }
    box.innerHTML = '<span class="crm-health-dot" aria-hidden="true"></span><span>' + texts.map(escapeHtml).join('<br>') + '</span>' +
      '<button type="button" aria-label="Dispensar aviso">×</button>';
    box.querySelector('button').onclick = function () {
      try { window.sessionStorage.setItem('crm-health-dismissed', signature); } catch (error) { /* aba privada */ }
      box.remove();
    };
  }

  function refreshHealth() {
    if (EMBED || currentRole() !== 'administrator') return;
    crmApi('GET', '/crm_health').then(function (data) { paintHealth(data && data.issues); }).catch(function () {});
  }

  function openTaskCount() {
    if (!performanceCache || !checklistPage()) return railCounts.tasks;
    var count = 0;
    performanceCache.forEach(function (list) {
      (list.items || []).forEach(function (item) {
        if (!item.done) count += 1;
      });
    });
    return count;
  }

  function navOn(href) {
    var path = window.location.pathname;
    return path === href || path.indexOf(href + '/') === 0;
  }

  function appStore() {
    var app = document.querySelector('#app');
    return app && app.__vue_app__ ? app.__vue_app__.config.globalProperties : {};
  }

  function currentRole() {
    var store = appStore().$store;
    return store && store.getters.getCurrentRole ? store.getters.getCurrentRole : 'administrator';
  }

  function goTo(path) {
    closeCalendar();
    if (window.crmKanban && window.crmKanban.isOpen()) window.crmKanban.close();
    var router = appStore().$router;
    if (router) router.push(path);
    else window.location.assign(path);
  }

  // Troca de tela sem recarregar o aplicativo inteiro; Ctrl+clique continua abrindo em outra aba.
  function navigateInApp(event, link) {
    var href = link.getAttribute('href') || '';
    var router = appStore().$router;
    if (!router || href.indexOf('/app/') !== 0) return false;
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return false;
    if (!router.resolve(href).matched.length) return false;
    event.preventDefault();
    closeCalendar();
    if (window.crmKanban && window.crmKanban.isOpen()) window.crmKanban.close();
    router.push(href).then(function () {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    return true;
  }

  function signOut() {
    var finish = function () {
      document.cookie = 'cw_d_session_info=; path=/; max-age=0';
      window.location.assign('/app/login');
    };
    var headers = authHeaders();
    if (!headers) {
      finish();
      return;
    }
    fetch('/auth/sign_out', { method: 'DELETE', credentials: 'same-origin', headers: headers }).then(finish, finish);
  }

  function openProfileMenu(anchor) {
    if (!window.crmKanban || !window.crmKanban.menu) return;
    var base = accountBase();
    var store = appStore().$store;
    var user = store && store.getters.getCurrentUser ? store.getters.getCurrentUser : {};
    var items = [{ label: 'Meu perfil', hint: 'Dados, senha e preferências', run: function () { goTo(base + '/profile/settings'); } }];
    if (currentRole() === 'administrator') {
      items.push({ label: 'Configurações da conta', run: function () { goTo(base + '/settings/general'); } });
      items.push({ label: 'Caixas de entrada', hint: 'Canais e WhatsApp', run: function () { goTo(base + '/settings/inboxes'); } });
      items.push({ label: 'Agentes', run: function () { goTo(base + '/settings/agents'); } });
      items.push({ label: 'Relatórios', run: function () { goTo(base + '/reports/overview'); } });
    }
    if (user.type === 'SuperAdmin') items.push({ label: 'Painel do sistema', hint: 'Verificações gerais', run: function () { window.open('/super_admin', '_blank', 'noopener'); } });
    if (window.crmModules.enabled('modo_apresentacao')) {
      var presenting = presentationChosen();
      items.push({ label: presenting ? 'Sair do modo apresentação' : 'Modo apresentação', hint: 'Borra nomes, telefones e mensagens', active: presenting, run: function () { setPresentation(!presenting); } });
    }
    if (window.crmModules.enabled('assistente_ia')) {
      items.push({ label: 'Assistente de IA', hint: 'Pergunte sobre conversas, atividades e Kanban', run: openAssistant });
    }
    if (helpOn()) {
      items.push({ label: 'Ferramentas', hint: 'Calculadora, conversor e cubagem, modelos', run: function () { openTools(anchor, 'ajuda'); } });
    }
    items.push({ label: 'Sair', danger: true, run: signOut });
    window.crmKanban.menu(anchor, items);
  }

  function renderSide(side) {
    var base = accountBase();
    if (!base) return;
    var person = profileBits();
    var openTasks = openTaskCount();
    var path = window.location.pathname;
    var hash = window.location.hash;
    var activitiesOn = path.indexOf('/task-checklist') !== -1 && hash === '#atividades';
    var checklistOn = path.indexOf('/task-checklist') !== -1 && !activitiesOn;
    var chatOn = path.indexOf('/dashboard') !== -1 || path.indexOf('/conversations') !== -1;
    var settingsOn = path.indexOf('/settings') !== -1 || path.indexOf('/contacts') !== -1 ||
      path.indexOf('/reports') !== -1 || path.indexOf('/campaigns') !== -1 ||
      path.indexOf('/portals') !== -1 || path.indexOf('/inbox-view') !== -1;
    var calendarOn = document.body.getAttribute('data-crm-calendar') === 'open';
    var kanbanOn = hash.indexOf('#kanban') === 0;
    if (calendarOn || kanbanOn) {
      activitiesOn = false;
      checklistOn = false;
      chatOn = false;
    }
    var unreadChats = railCounts.conversations;
    var signature = [path, hash, settingsMenuOpen ? '1' : '0', openTasks, unreadChats, railCounts.email, railCounts.emailConnected ? '1' : '0', person.name, person.photo, calendarOn ? '1' : '0', crmModules.list.length].join('|');
    if (side.getAttribute('data-sig') === signature) return;
    side.setAttribute('data-sig', signature);
    var settings = [
      ['Caixa de Entrada', base + '/inbox-view'],
      ['Contatos', base + '/contacts'],
      ['Conectar e-mail', base + '/email'],
      ['Relatórios', base + '/reports/overview'],
      ['Campanhas', base + '/campaigns/live_chat'],
      ['Central de Ajuda', base + '/portals'],
      ['Conta', base + '/settings/general'],
      ['Agentes', base + '/settings/agents'],
      ['Equipes', base + '/settings/teams'],
      ['Etiquetas', base + '/settings/labels'],
      ['Automações', base + '/settings/automation'],
      ['Integrações', base + '/settings/integrations'],
      ['Calendário', '#calendario'],
    ];
    if (currentRole() === 'administrator') settings.push(['Conexões', '#conexoes'], ['E-mail', '#email']);
    if (currentRole() === 'administrator' && crmModules.list.length) settings.push(['Recursos', '#recursos']);
    var settingsHtml = settings.map(function (item) {
      var on = item[1] === '#calendario' ? calendarOn : navOn(item[1]);
      return '<a class="' + (on ? 'on' : '') + '" href="' + item[1] + '">' + item[0] + '</a>';
    }).join('');
    var photo = person.photo
      ? '<img class="photo" src="' + escapeHtml(person.photo) + '" alt="">'
      : '<span class="photo">' + escapeHtml(initials(person.name)) + '</span>';
    side.innerHTML =
      '<div class="logo"><img src="/brand-assets/logo-mark.png?' + BRAND_VERSION + '" alt=""><div><strong>Bruna Logística</strong><small>Logística • Produção • Resultados</small></div><span class="logo-tools"><button type="button" class="crm-fold" data-crm-tema="true" aria-label="Alternar tema"></button><button type="button" class="crm-fold" data-crm-fold="true" aria-label="Recolher menu">' + icon('M15 18l-6-6 6-6') + '</button></span></div>' +
      '<a class="nv' + (checklistOn ? ' on' : '') + '" title="Tarefas e Checklist" href="' + base + '/task-checklist"><span class="ic">' + icon('M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11') + '</span><span class="lbl">Tarefas e Checklist</span>' +
      (openTasks ? '<span class="badge">' + openTasks + '</span>' : '') + '</a>' +
      '<a class="nv' + (activitiesOn ? ' on' : '') + '" title="Atividades" href="' + base + '/task-checklist#atividades"><span class="ic">' + icon('M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01') + '</span><span class="lbl">Atividades</span></a>' +
      '<a class="nv' + (chatOn ? ' on' : '') + '" title="Conversas" href="' + base + '/dashboard"><span class="ic">' + icon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z') + '</span><span class="lbl">Conversas</span>' + (unreadChats ? '<span class="badge">' + (unreadChats > 99 ? '99+' : unreadChats) + '</span>' : '') + '</a>' +
      (!railCounts.emailConnected ? '' : '<a class="nv' + (/\/accounts\/\d+\/email(\/|$)/.test(path) ? ' on' : '') + '" title="Central de E-mail" href="' + base + '/email"><span class="ic">' + icon('M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 7l-10 7L2 7') + '</span><span class="lbl">Central de E-mail</span>' + (railCounts.email ? '<span class="badge">' + (railCounts.email > 99 ? '99+' : railCounts.email) + '</span>' : '') + '</a>') +
      '<a class="nv' + (kanbanOn ? ' on' : '') + '" title="Kanban" href="#kanban"><span class="ic">' + icon('M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 7v7M12 7v4M16 7v9') + '</span><span class="lbl">Kanban</span></a>' +
      '<a class="nv' + (calendarOn ? ' on' : '') + '" title="Calendário" href="#calendario"><span class="ic">' + icon('M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z') + '</span><span class="lbl">Calendário</span></a>' +
      '<button type="button" class="nv' + (settingsOn ? ' on' : '') + '" title="Configurações" data-crm-config="true"><span class="ic">' + icon('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.7.9 1.2 1.6 1.4H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z') + '</span><span class="lbl">Configurações</span><span class="chev">' + icon('M9 18l6-6-6-6') + '</span></button>' +
      '<div class="subnav"' + (settingsMenuOpen ? '' : ' hidden') + '>' + settingsHtml + '</div>' +
      '<div class="sp"></div>' +
      '<button type="button" class="me" data-crm-profile="true">' + photo + '<div><strong>' + escapeHtml(person.name) + '</strong><span>' + (currentRole() === 'administrator' ? 'Administrador' : 'Agente') + '</span></div><span class="chev">' + icon('M6 9l6 6 6-6') + '</span></button>';
  }

  function mountShell() {
    if (EMBED) {
      document.body.classList.add('crm-shell');
      document.body.setAttribute('data-crm-embed', 'true');
      return;
    }
    var wide = window.matchMedia('(min-width: 768px)').matches;
    var aside = document.querySelector('aside.bg-n-background');
    var main = document.querySelector('#app main');
    if (!wide || !aside || !main) {
      document.body.classList.remove('crm-shell');
      var oldSide = document.querySelector('.crm-side');
      var oldTop = document.querySelector('.crm-top');
      if (oldSide) oldSide.remove();
      if (oldTop) oldTop.remove();
      return;
    }
    document.body.classList.add('crm-shell');
    var host = aside.parentElement;
    host.classList.add('crm-row');
    var side = host.querySelector(':scope > .crm-side');
    if (!side) {
      side = document.createElement('aside');
      side.className = 'crm-side';
      side.setAttribute('aria-label', 'Menu principal');
      host.insertBefore(side, aside);
      side.addEventListener('click', function (event) {
        var tema = event.target.closest('[data-crm-tema]');
        if (tema) {
          event.preventDefault();
          localStorage.setItem(TEMA_KEY, document.body.classList.contains('dark') ? 'claro' : 'escuro');
          applyTema();
          return;
        }
        var fold = event.target.closest('[data-crm-fold]');
        if (fold) {
          event.preventDefault();
          var closed = document.body.getAttribute('data-crm-menu') === 'fechado';
          localStorage.setItem(MENU_KEY, closed ? 'aberto' : 'fechado');
          applyMenu();
          return;
        }
        var config = event.target.closest('[data-crm-config]');
        if (config) {
          event.preventDefault();
          if (document.body.getAttribute('data-crm-menu') === 'fechado') {
            localStorage.setItem(MENU_KEY, 'aberto');
            settingsMenuOpen = true;
          } else {
            settingsMenuOpen = !settingsMenuOpen;
          }
          side.removeAttribute('data-sig');
          renderSide(side);
          applyMenu();
          return;
        }
        var link = event.target.closest('a');
        if (link && (link.getAttribute('href') || '') === '#conexoes') {
          event.preventDefault();
          if (window.crmConnections) window.crmConnections.open();
          return;
        }
        if (link && (link.getAttribute('href') || '') === '#email') {
          event.preventDefault();
          openMailPanel();
          return;
        }
        if (link && (link.getAttribute('href') || '') === '#recursos') {
          event.preventDefault();
          openModulesPanel();
          return;
        }
        if (link && (link.getAttribute('href') || '') === '#calendario') {
          event.preventDefault();
          openCalendar();
          return;
        }
        if (link && (link.getAttribute('href') || '').charAt(0) === '#') {
          event.preventDefault();
          return;
        }
        if (link) closeCalendar();
        if (link && navigateInApp(event, link)) return;
        var profile = event.target.closest('[data-crm-profile]');
        if (!profile) return;
        event.stopPropagation();
        openProfileMenu(profile);
      });
    }
    renderSide(side);
    var column = main.parentElement === host ? main : main.parentElement;
    column.classList.add('crm-col');
    var oldTopBar = column.querySelector(':scope > .crm-top');
    if (oldTopBar) oldTopBar.remove();
    applyMenu();
  }

  function mountListSearch() {
    var head = document.querySelector('.conversations-list-wrap > div:first-child');
    var base = accountBase();
    if (!head || !base || head.querySelector('.crm-wa-search')) return;
    head.insertAdjacentHTML('beforeend', '<a class="crm-wa-search" href="' + base + '/search">' +
      icon('M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z') + '<span>Pesquisar conversas</span></a>');
  }

  function applyMenu() {
    var closed = localStorage.getItem(MENU_KEY) !== 'aberto';
    var next = closed ? 'fechado' : 'aberto';
    if (document.body.getAttribute('data-crm-menu') !== next) {
      document.body.setAttribute('data-crm-menu', next);
    }
    var fold = document.querySelector('[data-crm-fold]');
    if (fold) fold.setAttribute('aria-label', closed ? 'Abrir menu' : 'Recolher menu');
  }

  function temaGlyph(dark) {
    var path = dark
      ? 'M12 4v2M12 18v2M5 12H3M21 12h-2M6.2 6.2l1.4 1.4M16.4 16.4l1.4 1.4M6.2 17.8l1.4-1.4M16.4 7.6l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'
      : 'M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 0 0 21 14.5z';
    return icon(path);
  }

  function dressTasks() {
    var page = checklistPage();
    if (!page) return;
    var rows = page.querySelectorAll(':scope > div li');
    for (var i = 0; i < rows.length; i += 1) {
      var row = rows[i];
      var box = row.querySelector('input[type="checkbox"]');
      var done = !!(box && box.checked);
      var chip = row.querySelector('.crm-chip');
      if (!chip) {
        chip = document.createElement('span');
        chip.className = 'crm-chip';
        var remove = row.querySelector('button');
        if (remove) row.insertBefore(chip, remove);
        else row.appendChild(chip);
      }
      var nextClass = 'crm-chip' + (done ? ' is-ok' : ' is-pend');
      var nextLabel = done ? 'Concluída' : 'Pendente';
      if (chip.className !== nextClass) chip.className = nextClass;
      if (chip.textContent !== nextLabel) chip.textContent = nextLabel;
      if (box) dressTaskClip(page, row, box, chip);
    }
    dressTaskEditing(page);
  }

  function checklistRequest(method, path, body) {
    var headers = authHeaders();
    var base = accountBase();
    if (!headers || !base) return Promise.reject(new Error('sessao'));
    return fetch('/api/v1/accounts/' + base.split('/').pop() + path, {
      method: method,
      credentials: 'same-origin',
      headers: Object.assign({}, headers, { 'Content-Type': 'application/json' }),
      body: body ? JSON.stringify(body) : undefined,
    }).then(function (response) {
      if (!response.ok) throw new Error('falha');
      if (method !== 'GET') {
        window.dispatchEvent(new Event('crm:changed'));
        if (path.indexOf('work_activities') !== -1) window.dispatchEvent(new Event('crm:activity-changed'));
      }
      return response.text();
    }).then(function (text) {
      return text ? JSON.parse(text) : null;
    });
  }

  function checklistListButtons(page) {
    return Array.prototype.slice.call(page.querySelectorAll('aside > div > button'));
  }

  // A tela guarda as listas em memória: remonta a rota para mostrar o que acabou de ser salvo.
  function reopenChecklist(listIndex) {
    var app = document.querySelector('#app');
    var router = app && app.__vue_app__ && app.__vue_app__.config.globalProperties.$router;
    if (!router) {
      window.location.reload();
      return;
    }
    var path = window.location.pathname;
    var finish = function () { document.body.removeAttribute('data-crm-refreshing'); };
    document.body.setAttribute('data-crm-refreshing', 'true');
    router.replace(accountBase() + '/profile/settings').then(function () {
      return new Promise(function (resolve) { window.setTimeout(resolve, 60); });
    }).then(function () {
      return router.replace(path);
    }).then(function () {
      var tries = 0;
      (function waitForLists() {
        var page = checklistPage();
        var buttons = page ? checklistListButtons(page) : [];
        if (listIndex < 0 || buttons[listIndex] || tries > 60) {
          if (buttons[listIndex]) buttons[listIndex].click();
          finish();
          return;
        }
        tries += 1;
        window.setTimeout(waitForLists, 50);
      })();
    }).catch(finish);
  }

  function inlineEdit(target, maxLength, save) {
    var original = target.textContent.trim();
    var input = document.createElement('input');
    var finished = false;
    input.type = 'text';
    input.maxLength = maxLength;
    input.value = original;
    input.className = 'crm-inline-edit';
    input.setAttribute('aria-label', 'Editar nome');
    target.style.display = 'none';
    target.parentNode.insertBefore(input, target);
    function close() {
      finished = true;
      input.remove();
      target.style.display = '';
    }
    function commit() {
      if (finished) return;
      var value = input.value.trim();
      if (!value || value === original) {
        close();
        return;
      }
      finished = true;
      input.disabled = true;
      save(value, original, function () {
        input.remove();
        target.style.display = '';
        if (window.crmKanban && window.crmKanban.toast) window.crmKanban.toast('Não foi possível salvar. Atualize a página e tente de novo.', 'error');
      });
    }
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        commit();
      } else if (event.key === 'Escape') {
        close();
      }
    });
    input.addEventListener('blur', commit);
    input.focus();
    input.select();
  }

  function selectedListIndex(page) {
    return checklistListButtons(page).findIndex(function (button) { return button.classList.contains('font-semibold'); });
  }

  function editTask(page, row) {
    var title = row.querySelector('span.flex-1');
    var box = row.querySelector('input[type="checkbox"]');
    if (!title || !box || row.querySelector('.crm-inline-edit')) return;
    inlineEdit(title, 200, function (value, original, fail) {
      var listIndex = selectedListIndex(page);
      var position = Array.prototype.indexOf.call(row.parentNode.children, row);
      checklistRequest('GET', '/checklist_lists').then(function (lists) {
        var list = lists[listIndex];
        var item = list && list.items.filter(function (entry) { return !!entry.done === box.checked; })[position];
        if (!item || item.title !== original) throw new Error('item');
        return checklistRequest('PATCH', '/checklist_items/' + item.id, { title: value });
      }).then(function () { reopenChecklist(listIndex); }).catch(fail);
    });
  }

  function renameList(page, heading) {
    if (heading.parentNode.querySelector('.crm-inline-edit')) return;
    inlineEdit(heading, 120, function (value, original, fail) {
      var listIndex = selectedListIndex(page);
      checklistRequest('GET', '/checklist_lists').then(function (lists) {
        var list = lists[listIndex];
        if (!list || list.name !== original) throw new Error('lista');
        return checklistRequest('PATCH', '/checklist_lists/' + list.id, { name: value });
      }).then(function () { reopenChecklist(listIndex); }).catch(fail);
    });
  }

  function askDeleteList(page, index, name) {
    if (!window.crmKanban || !window.crmKanban.confirm) return;
    window.crmKanban.confirm('Excluir lista', 'A lista "' + name + '" e as demandas dela serão excluídas. Isso não pode ser desfeito.', 'Excluir', function () {
      return checklistRequest('GET', '/checklist_lists').then(function (lists) {
        var list = lists[index];
        if (!list || list.name !== name) throw new Error('A lista mudou. Atualize a página e tente de novo.');
        return checklistRequest('DELETE', '/checklist_lists/' + list.id).then(function () {
          reopenChecklist(lists.length > 1 ? Math.max(index - 1, 0) : -1);
        });
      });
    });
  }

  var taskFilter = { mode: 'all', term: '' };

  function applyTaskFilter(center) {
    var term = taskFilter.term.trim().toLowerCase();
    center.querySelectorAll('li').forEach(function (row) {
      var box = row.querySelector('input[type="checkbox"]');
      if (!box) return;
      var title = row.querySelector('span.flex-1');
      var show = (taskFilter.mode === 'all' || (taskFilter.mode === 'done') === box.checked) && (!term || (title ? title.textContent : '').toLowerCase().indexOf(term) !== -1);
      row.toggleAttribute('data-crm-off', !show);
    });
    center.querySelectorAll('.mt-6').forEach(function (group) {
      group.toggleAttribute('data-crm-off', !group.querySelector('li:not([data-crm-off])'));
    });
  }

  function mountTaskBar(page) {
    var center = page.querySelector(':scope > div.min-w-0');
    var header = center && center.querySelector(':scope > header');
    var bar = center && center.querySelector(':scope > .crm-task-bar');
    if (!header) {
      if (bar) bar.remove();
      return;
    }
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'crm-task-bar';
      bar.innerHTML = '<div class="crm-task-top"><label class="crm-rem-search">' + icon('M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z') + '<input type="search" placeholder="Buscar tarefa" aria-label="Buscar tarefa"></label><button type="button" class="crm-task-new">+ Nova tarefa</button></div><div class="crm-rem-chips" data-task-chips></div>';
      bar.querySelector('input').addEventListener('input', function (event) {
        taskFilter.term = event.target.value;
        applyTaskFilter(center);
      });
      bar.addEventListener('click', function (event) {
        var chip = event.target.closest('[data-task-filter]');
        if (chip) {
          taskFilter.mode = chip.getAttribute('data-task-filter');
          paintTaskChips(center, bar, true);
          applyTaskFilter(center);
        } else if (event.target.closest('.crm-task-new')) {
          var field = center.querySelector(':scope > form input');
          if (field) field.focus();
        }
      });
      center.insertBefore(bar, header);
    }
    paintTaskChips(center, bar, false);
    applyTaskFilter(center);
  }

  function paintTaskChips(center, bar, force) {
    var boxes = Array.prototype.slice.call(center.querySelectorAll('li input[type="checkbox"]'));
    var done = boxes.filter(function (box) { return box.checked; }).length;
    var signature = [boxes.length, done, taskFilter.mode].join('|');
    if (!force && bar.getAttribute('data-sig') === signature) return;
    bar.setAttribute('data-sig', signature);
    bar.querySelector('[data-task-chips]').innerHTML = [['all', 'Todas', boxes.length], ['open', 'Pendentes', boxes.length - done], ['done', 'Concluídas', done]].map(function (chip) {
      return '<button type="button" data-task-filter="' + chip[0] + '" data-tone="' + (chip[0] === 'open' ? 'today' : chip[0]) + '" class="' + (taskFilter.mode === chip[0] ? 'is-on' : '') + '">' + chip[1] + ' (' + chip[2] + ')</button>';
    }).join('');
  }

  function mountListTools(page) {
    var buttons = checklistListButtons(page);
    var holder = buttons.length ? buttons[0].parentElement : null;
    if (!holder) return;
    holder.classList.add('crm-list-grid');
    holder.querySelectorAll(':scope > .crm-list-tools').forEach(function (tools) {
      var previous = tools.previousElementSibling;
      if (!previous || previous.tagName !== 'BUTTON') tools.remove();
    });
    buttons.forEach(function (button) {
      var counts = button.textContent.match(/(\d+)\/(\d+)\s*$/);
      var percent = counts && Number(counts[2]) ? Math.round((Number(counts[1]) / Number(counts[2])) * 100) + '%' : '0%';
      if (button.style.getPropertyValue('--crm-list-p') !== percent) button.style.setProperty('--crm-list-p', percent);
      var next = button.nextElementSibling;
      if (next && next.classList.contains('crm-list-tools')) return;
      var tools = document.createElement('span');
      tools.className = 'crm-list-tools';
      tools.innerHTML = '<button type="button" data-crm-list="rename" title="Renomear lista" aria-label="Renomear lista">' + icon('M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z') + '</button>' +
        '<button type="button" data-crm-list="delete" title="Excluir lista" aria-label="Excluir lista">' + icon('M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6') + '</button>';
      tools.addEventListener('click', function (event) {
        var action = event.target.closest('[data-crm-list]');
        if (!action) return;
        var index = checklistListButtons(page).indexOf(button);
        var name = (button.querySelector('span') || button).textContent.trim();
        if (action.getAttribute('data-crm-list') === 'delete') {
          askDeleteList(page, index, name);
          return;
        }
        button.click();
        window.setTimeout(function () {
          var heading = page.querySelector('h2');
          if (heading) renameList(page, heading);
        }, 120);
      });
      button.insertAdjacentElement('afterend', tools);
    });
  }

  function dressTaskEditing(page) {
    var pageTitle = page.querySelector('h1');
    if (pageTitle && pageTitle.textContent.trim() !== 'Tarefas e Checklist') pageTitle.textContent = 'Tarefas e Checklist';
    var emptyHint = page.querySelector('.m-auto.max-w-sm');
    if (emptyHint && emptyHint.textContent.indexOf('cheqlist') !== -1) emptyHint.textContent = 'Crie uma lista para começar o checklist.';
    mountListTools(page);
    mountTaskBar(page);
    page.querySelectorAll('li').forEach(function (row) {
      var taskBox = row.querySelector('input[type="checkbox"]');
      if (!taskBox || row.querySelector('.crm-task-edit')) return;
      if (!taskBox.checked) {
        var finish = document.createElement('button');
        finish.type = 'button';
        finish.className = 'crm-task-done';
        finish.textContent = 'Concluir';
        finish.addEventListener('click', function () { taskBox.click(); });
        row.insertBefore(finish, row.querySelector('.crm-chip'));
      }
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'crm-task-edit';
      button.textContent = 'Editar';
      button.addEventListener('click', function () { editTask(page, row); });
      var chip = row.querySelector('.crm-chip');
      row.insertBefore(button, chip);
      var title = row.querySelector('span.flex-1');
      if (title) title.addEventListener('dblclick', function () { editTask(page, row); });
    });
    var heading = page.querySelector('h2');
    var headingBar = heading && heading.closest('header');
    var remove = headingBar && headingBar.querySelector(':scope > button');
    if (remove && !remove.parentNode.querySelector('.crm-list-rename')) {
      var rename = document.createElement('button');
      rename.type = 'button';
      rename.className = 'crm-task-edit crm-list-rename';
      rename.textContent = 'Renomear';
      rename.addEventListener('click', function () {
        var current = page.querySelector('h2');
        if (current) renameList(page, current);
      });
      remove.parentNode.insertBefore(rename, remove);
      remove.addEventListener('click', function (event) {
        event.stopImmediatePropagation();
        var current = page.querySelector('h2');
        if (current) askDeleteList(page, selectedListIndex(page), current.textContent.trim());
      }, true);
    }
  }

  function applyTema() {
    var saved = localStorage.getItem(TEMA_KEY) || 'escuro';
    var wantDark = saved !== 'claro';
    if (document.body.classList.contains('dark') !== wantDark) {
      document.body.classList.toggle('dark', wantDark);
    }
    var wide = window.matchMedia('(min-width: 768px)').matches;
    var floating = document.querySelector('body > .crm-tema');
    if (wide) {
      if (floating) floating.remove();
    } else if (!floating) {
      floating = document.createElement('button');
      floating.type = 'button';
      floating.className = 'crm-tema';
      floating.addEventListener('click', function () {
        localStorage.setItem(TEMA_KEY, document.body.classList.contains('dark') ? 'claro' : 'escuro');
        applyTema();
      });
      document.body.appendChild(floating);
    }
    var escuro = document.body.classList.contains('dark');
    var buttons = document.querySelectorAll('.crm-tema, [data-crm-tema]');
    for (var i = 0; i < buttons.length; i += 1) {
      buttons[i].innerHTML = temaGlyph(escuro);
      buttons[i].setAttribute('aria-label', escuro ? 'Usar tema claro' : 'Usar tema escuro');
    }
  }

  var calendarCursor = monthStart(new Date());
  var calendarRequest = 0;
  var FEED_KEY = 'crm-calendario-email';

  function installDuePatch() {
    if (window.__crmDuePatch) return;
    window.__crmDuePatch = true;
    var originalOpen = XMLHttpRequest.prototype.open;
    var originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (method, url) {
      this.__crmMethod = method;
      this.__crmUrl = url;
      return originalOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function (body) {
      var url = String(this.__crmUrl || '');
      var method = String(this.__crmMethod || '').toUpperCase();
      if (method !== 'GET' && url.indexOf('work_activities') !== -1) {
        this.addEventListener('load', function () {
          window.dispatchEvent(new Event('crm:changed'));
          window.dispatchEvent(new Event('crm:activity-changed'));
        });
      }
      var input = document.querySelector('dialog[open] [data-crm-due]');
      if (input && body && url.indexOf('work_activities') !== -1 && url.indexOf('/feed') === -1 && method !== 'GET') {
        try {
          var data = JSON.parse(body);
          data.due_on = input.value || null;
          body = JSON.stringify(data);
          var wantsCard = document.querySelector('dialog[open] [data-crm-make-card]:checked');
          if (wantsCard && method === 'POST') {
            wantsCard.checked = false;
            this.addEventListener('load', function () {
              if (this.status >= 200 && this.status < 300) {
                var saved = {};
                try { saved = JSON.parse(this.responseText) || {}; } catch (parseError) { saved = {}; }
                offerCardFromActivity(data, saved.id);
              }
            });
          }
        } catch (error) {
          body = body;
        }
      }
      return originalSend.call(this, body);
    };
  }

  function isoDate(date) {
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    return date.getFullYear() + '-' + month + '-' + day;
  }

  function monthStart(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  function monthEnd(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  function feedHost() {
    try {
      var raw = localStorage.getItem(FEED_KEY) || '';
      return raw ? new URL(raw).host : '';
    } catch (error) {
      return '';
    }
  }

  function calendarHost() {
    return document.querySelector('.crm-col') || (document.querySelector('#app main') || {}).parentElement || document.body;
  }

  function closeCalendar() {
    if (document.body.getAttribute('data-crm-calendar') !== 'open' && !document.querySelector('.crm-calendar')) return;
    document.body.removeAttribute('data-crm-calendar');
    var panel = document.querySelector('.crm-calendar');
    if (panel) panel.remove();
    var side = document.querySelector('.crm-side');
    if (side) {
      side.removeAttribute('data-sig');
      renderSide(side);
    }
  }

  window.crmCloseCalendar = closeCalendar;

  function openCalendar() {
    if (window.crmKanban && window.crmKanban.isOpen()) window.crmKanban.close();
    document.body.setAttribute('data-crm-calendar', 'open');
    var side = document.querySelector('.crm-side');
    if (side) {
      side.removeAttribute('data-sig');
      renderSide(side);
    }
    mountCalendar();
  }

  var calendarSchedules = null;
  // O que aparece no Calendário; escolha de cada pessoa, guardada no navegador.
  var CALENDAR_KINDS = [['act', 'Atividades'], ['card', 'Cards'], ['sched', 'Agendadas'], ['mail', 'E-mail']];
  var calendarShow = { act: true, card: true, sched: true, mail: true };
  try { Object.assign(calendarShow, JSON.parse(window.localStorage.getItem('crm-calendario-mostrar') || '{}')); } catch (error) { /* sem armazenamento */ }

  function calendarFilters(schedules) {
    return '<div class="crm-cal-filters" role="group" aria-label="Mostrar no calendário"><span>Mostrar:</span>' + CALENDAR_KINDS.filter(function (kind) {
      return kind[0] !== 'sched' || schedules;
    }).map(function (kind) {
      return '<button type="button" data-crm-cal-show="' + kind[0] + '" aria-pressed="' + Boolean(calendarShow[kind[0]]) + '" class="' + (calendarShow[kind[0]] ? 'is-on' : '') + '">' + kind[1] + '</button>';
    }).join('') + '</div>';
  }
  var SCHEDULE_STATUS = { active: 'Agendado', paused: 'Pausado', done: 'Concluído', canceled: 'Cancelado' };
  var DELIVERY_STATUS = { sent: 'enviada(s)', failed: 'com falha', skipped: 'pulada(s)', pending: 'na fila', sending: 'enviando' };

  function scheduleRow(item) {
    var counts = (item.last_run && item.last_run.counts) || {};
    var summary = Object.keys(DELIVERY_STATUS).filter(function (key) { return counts[key]; }).map(function (key) { return counts[key] + ' ' + DELIVERY_STATUS[key]; }).join(', ');
    var reasons = item.last_run && item.last_run.reasons ? Object.keys(item.last_run.reasons).filter(Boolean).map(function (reason) { return reason + ' (' + item.last_run.reasons[reason] + ')'; }).join('; ') : '';
    var open = item.status === 'active' || item.status === 'paused';
    var actions = (open ? '<button type="button" data-crm-sched="edit" data-id="' + item.id + '">Alterar</button>' +
      '<button type="button" data-crm-sched="' + (item.status === 'paused' ? 'resume' : 'pause') + '" data-id="' + item.id + '">' + (item.status === 'paused' ? 'Retomar' : 'Pausar') + '</button>' +
      '<button type="button" data-crm-sched="cancel" data-id="' + item.id + '">Cancelar</button>' : '') +
      (counts.failed ? '<button type="button" data-crm-sched="retry" data-id="' + item.id + '">Reenviar falhas</button>' : '');
    return '<li class="crm-sched-item is-' + item.status + '"><strong>' + escapeHtml(item.title) + '</strong><small>' + SCHEDULE_STATUS[item.status] + (item.next_run_at && open ? ' · ' + whenText(item.next_run_at) : '') +
      ' · ' + item.recipients.length + (item.recipients.length === 1 ? ' contato' : ' contatos') + (item.recurrence !== 'none' ? ' · repete' : '') + '</small>' +
      (summary ? '<small>Último envio: ' + escapeHtml(summary) + '</small>' : '') + (reasons ? '<small class="crm-sched-why">' + escapeHtml(reasons) + '</small>' : '') +
      (actions ? '<div class="crm-sched-actions">' + actions + '</div>' : '') + '</li>';
  }

  function scheduleAction(action, id) {
    var kanban = window.crmKanban;
    if (action === 'new') { openScheduleDialog({}); return; }
    var item = ((calendarSchedules && calendarSchedules.items) || []).filter(function (entry) { return entry.id === id; })[0];
    if (!item || !kanban) return;
    var run = function (method, path, done) {
      return scheduleApi(method, '/' + id + path).then(function (data) {
        kanban.toast(done(data));
        loadCalendar();
      }).catch(function (error) { kanban.toast(error.message, 'error'); });
    };
    if (action === 'show' || action === 'edit') {
      if (item.status === 'active' || item.status === 'paused') openScheduleDialog(item);
      else kanban.toast(item.title + ': ' + SCHEDULE_STATUS[item.status].toLowerCase() + '.');
    } else if (action === 'pause') run('POST', '/pause', function () { return 'Agendamento pausado.'; });
    else if (action === 'resume') {
      kanban.confirm('Retomar', 'O envio volta a valer. Se o horário já passou, sai no próximo minuto' + (item.recurrence !== 'none' ? ' ou na próxima repetição.' : '.'), 'Retomar', function () {
        return run('POST', '/resume', function () { return 'Agendamento retomado.'; });
      });
    } else if (action === 'cancel') {
      kanban.confirm('Cancelar agendamento', '"' + item.title + '" não será mais enviado. O que já saiu continua nas conversas.', 'Cancelar agendamento', function () {
        return run('DELETE', '', function () { return 'Agendamento cancelado.'; });
      });
    } else if (action === 'retry') run('POST', '/retry_failed', function (data) { return (data && data.retried ? data.retried : 0) + ' envio(s) com falha na fila de novo.'; });
  }

  function paintCalendar(root, activities, mailEvents, feedFailed, cards, schedules) {
    var body = root.querySelector('.crm-cal-body');
    if (!body) return;
    var months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    var week = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    var base = accountBase();
    var byDay = {};
    var undated = '';
    var undatedCount = 0;
    var datedCount = 0;
    var lateCount = 0;
    if (!calendarShow.act) activities = activities.filter(function (activity) { return !activity.due_on && activity.status !== 'done'; });
    if (!calendarShow.card) cards = [];
    if (!calendarShow.mail) mailEvents = [];
    if (!calendarShow.sched && schedules) schedules = { items: schedules.items, occurrences: [] };
    activities.forEach(function (activity) {
      var finished = activity.status === 'done';
      if (!activity.due_on && !finished) {
        undatedCount += 1;
        undated +='<li><span>' + escapeHtml(activity.title) + '</span><input type="date" data-crm-cal-due="' + escapeHtml(activity.id) + '" aria-label="Prazo de ' + escapeHtml(activity.title) + '"></li>';
        return;
      }
      var key = activity.due_on ? String(activity.due_on).slice(0, 10) : new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(activity.updated_at));
      if (!byDay[key]) byDay[key] = [];
      if (!finished) {
        if (key < isoDate(new Date())) lateCount += 1;
        datedCount += 1;
      }
      byDay[key].push('<a class="ev act' + (finished ? ' is-done' : '') + '" data-priority="' + escapeHtml(activity.priority || '') + '" title="' + (finished ? 'Concluída: ' : '') + escapeHtml(activity.title) + '" href="' + base + '/conversations/' + encodeURIComponent(activity.conversation_id) + '">' + escapeHtml(activity.title) + '</a>');
    });
    var cardPriorities = ['', 'low', 'medium', 'high'];
    var addCard = function (card, key, prefix) {
      if (!byDay[key]) byDay[key] = [];
      var tag = card.archived ? 'span' : 'a';
      byDay[key].push('<' + tag + ' class="ev act is-card' + (card.done ? ' is-done' : '') + '" data-priority="' + (cardPriorities[card.priority] || '') + '" title="' + (card.done ? 'Concluído: ' : '') + escapeHtml(card.funnel + ': ' + card.title) + '"' + (card.archived ? '' : ' href="#kanban/item/' + encodeURIComponent(card.id) + '"') + '>' + (prefix ? escapeHtml(prefix) + ' ' : '') + escapeHtml(card.title) + '</' + tag + '>');
    };
    (cards || []).forEach(function (card) {
      if (card.due_on) {
        var dueKey = String(card.due_on).slice(0, 10);
        if (!card.done) {
          datedCount += 1;
          if (dueKey < isoDate(new Date())) lateCount += 1;
        }
        addCard(card, dueKey, '');
      } else if (card.done && !card.scheduled_on && card.completed_on) {
        addCard(card, String(card.completed_on).slice(0, 10), '');
      }
      if (card.scheduled_on && card.scheduled_on !== card.due_on) addCard(card, String(card.scheduled_on).slice(0, 10), card.scheduled_time);
    });
    ((schedules && schedules.occurrences) || []).forEach(function (run) {
      var key = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(run.at));
      if (!byDay[key]) byDay[key] = [];
      var time = new Date(run.at).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
      byDay[key].push('<button type="button" class="ev sched' + (run.done ? ' is-done' : '') + '" data-crm-sched="show" data-id="' + run.id + '" title="Mensagem agendada: ' + escapeHtml(run.title) + '">' + time + ' ' + escapeHtml(run.title) + '</button>');
    });
    (mailEvents || []).forEach(function (event) {
      var key = String(event.on).slice(0, 10);
      if (!byDay[key]) byDay[key] = [];
      var when = event.time ? escapeHtml(event.time) + ' ' : '';
      byDay[key].push('<span class="ev mail">' + when + escapeHtml(event.title) + '</span>');
    });
    var first = monthStart(calendarCursor);
    var cursor = new Date(first);
    cursor.setDate(first.getDate() - ((first.getDay() + 6) % 7));
    var today = isoDate(new Date());
    var cells = '';
    for (var i = 0; i < 42; i += 1) {
      var key = isoDate(cursor);
      var items = byDay[key] || [];
      var classes = 'day';
      if (cursor.getMonth() !== first.getMonth()) classes += ' is-out';
      if (key === today) classes += ' is-today';
      cells += '<div class="' + classes + '"><span class="n">' + cursor.getDate() + '</span>' + items.slice(0, 3).join('') + (items.length > 3 ? '<span class="more">+' + (items.length - 3) + '</span>' : '') + '</div>';
      cursor.setDate(cursor.getDate() + 1);
    }
    var host = feedHost();
    var status = feedFailed ? 'Não foi possível ler o calendário do e-mail.' : (host ? 'E-mail conectado: ' + escapeHtml(host) : 'Sem e-mail. Os prazos das atividades aparecem mesmo assim.');
    body.innerHTML =
      '<header><div><h1>Calendário</h1><p>' + status + '</p>' + calendarFilters(schedules) + '</div><div class="nav"><button type="button" data-crm-cal="prev" aria-label="Mês anterior">‹</button><strong>' +
      months[first.getMonth()] + ' ' + first.getFullYear() + '</strong><button type="button" data-crm-cal="next" aria-label="Próximo mês">›</button><button type="button" data-crm-cal="today">Hoje</button>' +
      (schedules ? '<button type="button" class="crm-sched-new" data-crm-sched="new">Agendar mensagem</button>' : '') + '</div></header>' +
      '<div class="sheet"><div class="week">' + week.map(function (day) { return '<span>' + day + '</span>'; }).join('') + '</div><div class="grid">' + cells + '</div></div>' +
      '<aside><div class="crm-cal-stats"><div><b>' + datedCount + '</b><small>com prazo</small></div><div><b' + (lateCount ? ' class="late"' : '') + '>' + lateCount + '</b><small>atrasadas</small></div><div><b>' + undatedCount + '</b><small>sem prazo</small></div></div>' +
      (schedules ? '<div class="crm-sched-list"><h2>Mensagens agendadas</h2>' + (schedules.items.length ? '<ul>' + schedules.items.map(scheduleRow).join('') + '</ul>' : '<p class="empty">Nenhuma mensagem agendada.</p>') + '</div>' : '') +
      '<div><h2>Sem prazo</h2>' + (undated ? '<ul>' + undated + '</ul>' : '<p class="empty">Nenhuma atividade sem prazo.</p>') + '</div><form class="mail"><p>Conectar o calendário do e-mail é opcional. Cole o endereço ICS do Google ou do Outlook.</p><input type="url" name="feed" placeholder="https://calendar.google.com/calendar/ical/..." autocomplete="off" aria-label="Endereço do calendário"><div class="row"><button type="submit">Conectar</button>' +
      (host ? '<button type="button" data-crm-cal="off">Desconectar</button>' : '') + '</div></form></aside>';
  }

  function loadCalendar() {
    var root = document.querySelector('.crm-calendar');
    var headers = authHeaders();
    var base = accountBase();
    if (!root || !headers || !base) return;
    var request = calendarRequest + 1;
    calendarRequest = request;
    var from = isoDate(monthStart(calendarCursor));
    var to = isoDate(monthEnd(calendarCursor));
    var accountId = base.split('/').pop();
    var cards = [];
    var cardsRequest = fetch('/api/v1/accounts/' + accountId + '/kanban_items/calendar?from=' + from + '&to=' + to, {
      credentials: 'same-origin',
      headers: headers,
    }).then(function (response) {
      return response.ok ? response.json() : [];
    }).catch(function () { return []; });
    var schedulesRequest = schedulesOn() ? scheduleApi('GET', '?from=' + from + '&to=' + to).catch(function () { return null; }) : Promise.resolve(null);
    var schedules = null;
    Promise.all([fetch('/api/v1/accounts/' + accountId + '/work_activities?calendar=1&from=' + from + '&to=' + to, {
      credentials: 'same-origin',
      headers: headers,
    }).then(function (response) {
      if (!response.ok) throw new Error('atividades');
      return response.json();
    }), cardsRequest, schedulesRequest]).then(function (results) {
      if (request !== calendarRequest) return;
      var activities = Array.isArray(results[0]) ? results[0] : [];
      cards = Array.isArray(results[1]) ? results[1] : [];
      schedules = results[2];
      calendarSchedules = schedules;
      var feed = '';
      try { feed = localStorage.getItem(FEED_KEY) || ''; } catch (error) { feed = ''; }
      if (!feed) {
        paintCalendar(root, activities, [], false, cards, schedules);
        return;
      }
      fetch('/api/v1/accounts/' + accountId + '/work_activities/feed', {
        method: 'POST',
        credentials: 'same-origin',
        headers: headers,
        body: JSON.stringify({ feed_url: feed, from: from, to: to }),
      }).then(function (response) {
        if (!response.ok) throw new Error('email');
        return response.json();
      }).then(function (payload) {
        if (request !== calendarRequest) return;
        paintCalendar(root, activities, payload.events || [], false, cards, schedules);
      }).catch(function () {
        if (request !== calendarRequest) return;
        paintCalendar(root, activities, [], true, cards, schedules);
      });
    }).catch(function () {
      if (request !== calendarRequest) return;
      var target = root.querySelector('.crm-cal-body');
      if (target) target.innerHTML = '<p class="empty">Não foi possível abrir o calendário.</p>';
    });
  }

  function mountCalendar() {
    if (document.body.getAttribute('data-crm-calendar') !== 'open') return;
    var host = calendarHost();
    if (!host) return;
    var root = host.querySelector(':scope > .crm-calendar');
    if (root) return;
    root = document.createElement('section');
    root.className = 'crm-calendar';
    root.setAttribute('aria-label', 'Calendário');
    root.innerHTML = '<div class="crm-cal-body"></div>';
    var main = host.querySelector(':scope > main') || host.querySelector('main');
    if (main) host.insertBefore(root, main);
    else host.appendChild(root);
    root.addEventListener('click', function (event) {
      var show = event.target.closest('[data-crm-cal-show]');
      if (show) {
        var kind = show.getAttribute('data-crm-cal-show');
        calendarShow[kind] = !calendarShow[kind];
        try { window.localStorage.setItem('crm-calendario-mostrar', JSON.stringify(calendarShow)); } catch (error) { /* aba privada */ }
        loadCalendar();
        return;
      }
      var scheduled = event.target.closest('[data-crm-sched]');
      if (scheduled) {
        scheduleAction(scheduled.getAttribute('data-crm-sched'), Number(scheduled.getAttribute('data-id')));
        return;
      }
      var button = event.target.closest('button');
      if (!button) return;
      var action = button.getAttribute('data-crm-cal');
      if (action === 'prev') calendarCursor.setMonth(calendarCursor.getMonth() - 1);
      else if (action === 'next') calendarCursor.setMonth(calendarCursor.getMonth() + 1);
      else if (action === 'today') calendarCursor = new Date();
      else if (action === 'off') {
        try { localStorage.removeItem(FEED_KEY); } catch (error) { return; }
      } else return;
      if (action === 'today') calendarCursor = monthStart(new Date());
      loadCalendar();
    });
    root.addEventListener('change', function (event) {
      var input = event.target.closest('[data-crm-cal-due]');
      if (!input) return;
      var headers = authHeaders();
      var base = accountBase();
      if (!headers || !base) return;
      fetch('/api/v1/accounts/' + base.split('/').pop() + '/work_activities/' + input.getAttribute('data-crm-cal-due'), {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: headers,
        body: JSON.stringify({ due_on: input.value || null }),
      }).then(function () { loadCalendar(); });
    });
    root.addEventListener('submit', function (event) {
      var form = event.target.closest('form.mail');
      if (!form) return;
      event.preventDefault();
      var value = (form.querySelector('input') || {}).value || '';
      value = value.trim();
      if (!value) return;
      try { localStorage.setItem(FEED_KEY, value); } catch (error) { return; }
      form.querySelector('input').value = '';
      loadCalendar();
    });
    loadCalendar();
  }

  function scan() {
    installDuePatch();
    markPage();
    mountShell();
    mountListSearch();
    applyTema();
    markPage();
    arrange();
    preferAllConversations();
    openConversations();
    collapseSidebar();
    markActivityDialog();
    mountMobileBar();
    mountSettingsNav();
    mountPerformance();
    mountActivities();
    dressTasks();
    mountCalendar();
  }

  function mountSettingsNav() {
    var show = document.body.getAttribute('data-crm-page') === 'settings';
    var main = document.querySelector('#app main');
    var nav = document.querySelector('.crm-settings-nav');
    var toggle = document.querySelector('.crm-settings-toggle');
    if (!show || !main) {
      if (nav) nav.remove();
      if (toggle) toggle.remove();
      return;
    }
    var base = accountBase();
    if (!base) return;
    if (!nav) {
      var groups = [
        ['', [
          ['Caixa de Entrada', base + '/settings/inboxes'],
          ['Contatos', base + '/contacts'],
          ['Relatórios', base + '/reports/overview'],
          ['Campanhas', base + '/campaigns/live_chat'],
          ['Central de Ajuda', base + '/portals'],
        ]],
        ['Conta', [
          ['Conta', base + '/settings/general'],
          ['Agentes', base + '/settings/agents'],
          ['Equipes', base + '/settings/teams'],
          ['Etiquetas', base + '/settings/labels'],
          ['Respostas prontas', base + '/settings/canned-response'],
          ['Automações', base + '/settings/automation'],
          ['Integrações', base + '/settings/integrations'],
        ]],
      ];
      var html = '<button type="button" class="crm-settings-toggle" data-crm-settings-toggle="true">Configurações</button><nav class="crm-settings-nav" aria-label="Grupos de configurações">';
      groups.forEach(function (group) {
        if (group[0]) html += '<p>' + group[0] + '</p>';
        group[1].forEach(function (item) {
          html += '<a href="' + item[1] + '">' + item[0] + '</a>';
        });
      });
      html += '</nav>';
      main.insertAdjacentHTML('afterbegin', html);
    }
    var path = window.location.pathname;
    var links = document.querySelectorAll('.crm-settings-nav a');
    var best = null;
    var bestLength = 0;
    for (var i = 0; i < links.length; i += 1) {
      var href = links[i].getAttribute('href') || '';
      var matches = path === href || path.indexOf(href + '/') === 0;
      if (href === base + '/reports/overview' && path.indexOf('/reports') !== -1) matches = true;
      if (href === base + '/campaigns/live_chat' && path.indexOf('/campaigns') !== -1) matches = true;
      if (matches && href.length > bestLength) {
        best = links[i];
        bestLength = href.length;
      }
    }
    for (var j = 0; j < links.length; j += 1) links[j].classList.remove('is-on');
    if (best) best.classList.add('is-on');
  }

  document.addEventListener('mousemove', function (event) {
    var host = event.target.closest ? event.target.closest('[data-tip]') : null;
    var tip = document.querySelector('body > .crm-tip');
    if (!host) {
      if (tip) tip.remove();
      return;
    }
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'crm-tip';
      document.body.appendChild(tip);
    }
    tip.textContent = host.getAttribute('data-tip');
    tip.style.left = Math.max(8, Math.min(event.clientX + 12, window.innerWidth - tip.offsetWidth - 8)) + 'px';
    tip.style.top = Math.max(8, event.clientY - tip.offsetHeight - 10) + 'px';
  }, { passive: true });

  window.addEventListener('hashchange', function () {
    mountActivities();
    markPage();
    var side = document.querySelector('.crm-side');
    if (side) renderSide(side);
  });

  // Origem das mensagens: o WAHA marca com external_echo o que saiu do celular e escreve o participante no texto em grupos.
  var messagesTimer = 0;

  function selectedChat() {
    var app = document.querySelector('#app');
    var store = app && app.__vue_app__ && app.__vue_app__.config.globalProperties.$store;
    return store ? store.getters.getSelectedChat : null;
  }

  function messageOrigin(message, isGroup) {
    var attributes = message.content_attributes || message.contentAttributes || {};
    if (message.private) return 'private';
    if (message.message_type === 0) return isGroup && String(message.content || '').indexOf('👥') !== 0 ? 'group' : 'contact';
    if (message.message_type !== 1) return '';
    if (attributes.external_echo || attributes.externalEcho) return 'phone';
    return message.sender && message.sender.type === 'user' ? 'agent' : '';
  }

  // Cada nota mantém a própria marca: o Chatwoot tira cadeado, hora e autor da nota quando vem outra em seguida.
  function markPrivate(node, message) {
    var bubble = node.querySelector('.bg-n-solid-amber');
    if (!bubble) return;
    var tag = bubble.querySelector('.crm-private-tag');
    if (!tag) {
      tag = document.createElement('span');
      tag.className = 'crm-private-tag';
      tag.innerHTML = icon('M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4') + '<span></span>';
      bubble.insertBefore(tag, bubble.firstChild);
    }
    var sender = message.sender || {};
    var text = 'Privada' + (sender.available_name || sender.name ? ' · ' + (sender.available_name || sender.name) : '');
    var label = tag.querySelector('span');
    if (label.textContent !== text) label.textContent = text;
  }

  // Em grupo o WAHA escreve "👥 *Nome*" no começo do texto: viram foto ou iniciais no canto e o nome uma vez só.
  var AUTHOR_COLORS = ['#06cf9c', '#53bdeb', '#ffbc38', '#ff7eb6', '#a78bfa', '#ff9a62'];
  var authorPhotos = {};

  // { name: "Clóvis", id: "162822243@lid", key } — o WAHA escreve "👥 *Clóvis (162822243@lid)*"; o número sai do nome.
  function groupAuthor(message) {
    if (message.message_type !== 0 || message.private) return null;
    var found = String(message.content || '').match(/^👥\s*\*([^*\n]+?)(?:\s*\((\d{5,20}@(?:lid|c\.us|s\.whatsapp\.net))\))?\*/);
    if (!found) return null;
    var name = found[1].trim();
    return { name: name, id: found[2] || '', key: found[2] || name };
  }

  function isReactionNotice(message) {
    return /\*(?:Reagiu com\*|Reação removida\*)/.test(String(message.content || '')) ||
      Boolean(message.content_attributes && message.content_attributes.crm_reaction);
  }

  function authorColor(name) {
    var total = 0;
    for (var i = 0; i < name.length; i += 1) total += name.charCodeAt(i);
    return AUTHOR_COLORS[total % AUTHOR_COLORS.length];
  }

  function hideAuthorPrefix(bubble) {
    bubble.querySelectorAll('p').forEach(function (paragraph) {
      if (paragraph.getAttribute('data-crm-prefix') || paragraph.textContent.indexOf('👥') !== 0) return;
      var copy = paragraph.cloneNode(true);
      copy.querySelectorAll('strong, b, em, i, code, br').forEach(function (part) { part.remove(); });
      if (copy.textContent.replace('👥', '').trim() === '') paragraph.setAttribute('data-crm-prefix', 'true');
    });
  }

  function applyAuthorPhoto(avatar, name) {
    var photo = authorPhotos[name];
    if (photo && !avatar.querySelector('img')) {
      var image = document.createElement('img');
      var letters = avatar.textContent;
      image.referrerPolicy = 'no-referrer';
      image.alt = '';
      // Link da foto do WhatsApp vencido: volta para as iniciais.
      image.addEventListener('error', function () { image.remove(); avatar.textContent = letters; });
      image.src = photo;
      avatar.textContent = '';
      avatar.appendChild(image);
    }
  }

  // Foto do WhatsApp pelo número/LID de quem falou (o servidor pede ao WAHA e guarda 12 h), em lotes por conversa.
  var photoQueue = [];
  var photoTimer = 0;

  function paintAuthorPhotos(key) {
    document.querySelectorAll('.crm-group-avatar[data-name]').forEach(function (avatar) {
      if (avatar.getAttribute('data-name') === key) applyAuthorPhoto(avatar, key);
    });
  }

  function flushPhotoQueue() {
    photoTimer = 0;
    var conversation = window.location.pathname.match(/\/conversations\/(\d+)/);
    var ids = photoQueue.splice(0, 30);
    if (!conversation || !ids.length) return;
    var query = '?conversation_id=' + conversation[1] + ids.map(function (id) { return '&ids[]=' + encodeURIComponent(id); }).join('');
    checklistRequest('GET', '/crm_participant_photos' + query).then(function (data) {
      var photos = (data && data.photos) || {};
      Object.keys(photos).forEach(function (id) {
        if (!photos[id]) return;
        authorPhotos[id] = photos[id];
        paintAuthorPhotos(id);
      });
    }).catch(function () {}).then(function () {
      if (photoQueue.length && !photoTimer) photoTimer = window.setTimeout(flushPhotoQueue, 50);
    });
  }

  function lookUpAuthorPhoto(author) {
    if (Object.prototype.hasOwnProperty.call(authorPhotos, author.key)) return;
    authorPhotos[author.key] = '';
    if (author.id) {
      photoQueue.push(author.id);
      if (!photoTimer) photoTimer = window.setTimeout(flushPhotoQueue, 50);
      return;
    }
    lookUpContactPhoto(author.name);
  }

  // Sem número na mensagem: só usa foto quando existe exatamente um contato com esse nome, para não mostrar a pessoa errada.
  function lookUpContactPhoto(name) {
    checklistRequest('GET', '/contacts/search?q=' + encodeURIComponent(name) + '&page=1').then(function (data) {
      var exact = ((data && data.payload) || []).filter(function (contact) {
        return String(contact.name || '').trim().toLowerCase() === name.toLowerCase();
      });
      if (exact.length !== 1 || !exact[0].thumbnail) return;
      authorPhotos[name] = exact[0].thumbnail;
      paintAuthorPhotos(name);
    }).catch(function () {});
  }

  function dressGroupMessage(node, author, sameAsPrevious) {
    var bubble = node.querySelector('.left-bubble');
    if (!bubble) return;
    hideAuthorPrefix(bubble);
    if (node.getAttribute('data-crm-author') !== author.key) node.setAttribute('data-crm-author', author.key);
    var run = sameAsPrevious ? 'next' : 'first';
    if (node.getAttribute('data-crm-run') !== run) node.setAttribute('data-crm-run', run);
    if (!node.querySelector('.crm-group-avatar')) {
      var avatar = document.createElement('span');
      avatar.className = 'crm-group-avatar';
      avatar.title = author.name;
      avatar.setAttribute('data-name', author.key);
      avatar.style.background = authorColor(author.key);
      avatar.textContent = initials(author.name);
      node.appendChild(avatar);
      applyAuthorPhoto(avatar, author.key);
      lookUpAuthorPhoto(author);
    }
    if (!bubble.querySelector('.crm-group-name')) {
      var label = document.createElement('span');
      label.className = 'crm-group-name';
      label.style.color = authorColor(author.key);
      label.textContent = author.name;
      bubble.insertBefore(label, bubble.firstChild);
    }
  }

  function dressMessages() {
    var chat = selectedChat();
    if (!chat || !chat.messages || !chat.messages.length) return;
    var byId = {};
    chat.messages.forEach(function (message) { byId[message.id] = message; });
    var contact = (chat.meta && chat.meta.sender) || {};
    var chatId = String((contact.custom_attributes || {}).waha_whatsapp_chat_id || contact.identifier || '');
    var isGroup = /@g\.us$/.test(chatId);
    var previousAuthor = '';
    document.querySelectorAll('.message-bubble-container[id^="message"]').forEach(function (node) {
      var message = byId[Number(node.id.replace('message', ''))];
      if (!message) return;
      var origin = messageOrigin(message, isGroup);
      if (node.getAttribute('data-crm-origin') !== origin) node.setAttribute('data-crm-origin', origin);
      // Reação vira selo na mensagem reagida (reactions.js) e não quebra a sequência de quem está falando.
      if (isReactionNotice(message)) return;
      var author = groupAuthor(message);
      if (author) dressGroupMessage(node, author, author.key === previousAuthor);
      previousAuthor = author ? author.key : '';
      if (origin === 'private') markPrivate(node, message);
      if (origin !== 'phone' || node.querySelector('.crm-msg-phone')) return;
      var meta = node.querySelector('.right-bubble .text-xs');
      if (!meta) return;
      var mark = document.createElement('span');
      mark.className = 'crm-msg-phone';
      mark.title = 'Enviada pelo celular';
      mark.setAttribute('aria-label', 'Enviada pelo celular');
      mark.innerHTML = icon('M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2');
      meta.insertBefore(mark, meta.firstChild);
    });
  }

  function scheduleMessageDress() {
    if (messagesTimer) return;
    messagesTimer = window.setTimeout(function () {
      messagesTimer = 0;
      dressMessages();
    }, 150);
  }

  // Logo e favicon ficam em cache por um ano: a versão no endereço garante a imagem nova, inclusive quando o Chatwoot troca o favicon.
  var BRAND_VERSION = 'v=bruna2';

  function versionedUrl(url) {
    return url && url.charAt(0) === '/' && url.indexOf('?') === -1 ? url + '?' + BRAND_VERSION : '';
  }

  function freshBrandAssets() {
    document.querySelectorAll('img[src^="/brand-assets/logo"]').forEach(function (image) {
      var next = versionedUrl(image.getAttribute('src'));
      if (next) image.setAttribute('src', next);
    });
    document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]').forEach(function (link) {
      var next = versionedUrl(link.getAttribute('href'));
      if (next) link.setAttribute('href', next);
    });
  }

  new MutationObserver(freshBrandAssets).observe(document.head, { attributes: true, attributeFilter: ['href'], subtree: true });
  freshBrandAssets();

  // Anexos: o clipe fica discreto na linha e o conteúdo abre em uma janela limpa.
  var CLIP_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.4 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>';
  var ATTACH_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv';

  function attachmentsRequest(method, path, body) {
    var headers = authHeaders();
    var base = accountBase();
    if (!headers || !base) return Promise.reject(new Error('Sua sessão expirou. Entre novamente.'));
    // O navegador define sozinho o tipo do envio de arquivo.
    var uploadHeaders = Object.assign({}, headers);
    delete uploadHeaders['Content-Type'];
    return fetch('/api/v1/accounts/' + base.split('/').pop() + '/crm_attachments' + path, {
      method: method, credentials: 'same-origin', headers: uploadHeaders, body: body,
    }).then(function (response) {
      return response.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (error) { data = null; }
        if (!response.ok) throw new Error((data && data.error) || 'Não foi possível concluir. Tente de novo.');
        return data;
      });
    });
  }

  function uploadAttachments(kind, id, files) {
    var body = new FormData();
    body.append('owner_type', kind);
    body.append('owner_id', id);
    Array.prototype.forEach.call(files, function (file) { body.append('files[]', file, file.name); });
    return attachmentsRequest('POST', '', body);
  }

  function fileSize(bytes) {
    return bytes >= 1048576 ? (bytes / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(bytes / 1024)) + ' KB';
  }

  function showPicture(url, name) {
    var layer = document.createElement('div');
    layer.className = 'kb-layer crm-picture';
    layer.innerHTML = '<img src="' + escapeHtml(url) + '" alt="' + escapeHtml(name) + '">';
    layer.addEventListener('click', function () { layer.remove(); });
    document.body.appendChild(layer);
  }

  function openItemView(kind, id, view) {
    var kanban = window.crmKanban;
    if (!kanban || !kanban.dialog) return;
    var files = [];
    var meta = (view.meta || []).filter(Boolean).map(function (part) { return '<span>' + escapeHtml(part) + '</span>'; }).join('');
    kanban.dialog({
      title: view.title, narrow: true, submit: 'Fechar',
      body: (meta ? '<p class="crm-view-meta">' + meta + '</p>' : '') +
        '<div class="crm-view-files" data-view-files><p class="crm-view-empty">Carregando...</p></div>' +
        '<div class="crm-view-add"><button type="button" data-view-add>' + CLIP_ICON + 'Anexar</button><span>ou cole um print aqui (Ctrl+V)</span>' +
        '<input type="file" data-view-input multiple hidden accept="' + ATTACH_ACCEPT + '"></div>',
      onSubmit: function () { return Promise.resolve(); },
      onOpen: function (form, layer) {
        form.classList.add('crm-view');
        var box = form.querySelector('[data-view-files]');
        var input = form.querySelector('[data-view-input]');
        var paint = function () {
          var pictures = files.filter(function (file) { return file.image; });
          var documents = files.filter(function (file) { return !file.image; });
          var remove = function (file) { return '<button type="button" class="crm-view-del" data-view-del="' + file.id + '" aria-label="Remover ' + escapeHtml(file.name) + '" title="Remover">×</button>'; };
          box.innerHTML = (!files.length ? '<p class="crm-view-empty">Nenhum anexo ainda.</p>' : '') +
            (pictures.length ? '<div class="crm-view-pics">' + pictures.map(function (file) {
              return '<div class="crm-view-pic"><button type="button" data-view-pic="' + file.id + '" title="' + escapeHtml(file.name) + '"><img loading="lazy" src="' + escapeHtml(file.url) + '" alt="' + escapeHtml(file.name) + '"></button>' + remove(file) + '</div>';
            }).join('') + '</div>' : '') +
            documents.map(function (file) {
              return '<div class="crm-view-doc"><a href="' + escapeHtml(file.url) + '" target="_blank" rel="noopener">' + CLIP_ICON + '<span>' + escapeHtml(file.name) + '</span><small>' + fileSize(file.size) + '</small></a>' + remove(file) + '</div>';
            }).join('');
          if (view.onCount) view.onCount(files.length);
        };
        var failedWith = function (error) { kanban.toast(error.message, 'error'); };
        var send = function (list) {
          if (!list || !list.length) return;
          box.classList.add('is-busy');
          uploadAttachments(kind, id, list).then(function (result) { files = result; paint(); }).catch(failedWith).then(function () { box.classList.remove('is-busy'); });
        };
        attachmentsRequest('GET', '?owner_type=' + kind + '&owner_id=' + encodeURIComponent(id)).then(function (result) { files = result; paint(); }).catch(failedWith);
        form.addEventListener('click', function (event) {
          if (event.target.closest('[data-view-add]')) { input.click(); return; }
          var picture = event.target.closest('[data-view-pic]');
          if (picture) {
            var shown = files.filter(function (file) { return String(file.id) === picture.getAttribute('data-view-pic'); })[0];
            if (shown) showPicture(shown.url, shown.name);
            return;
          }
          var del = event.target.closest('[data-view-del]');
          if (!del) return;
          var target = files.filter(function (file) { return String(file.id) === del.getAttribute('data-view-del'); })[0];
          if (!target) return;
          kanban.confirm('Remover anexo', '"' + target.name + '" será removido e não poderá ser recuperado.', 'Remover', function () {
            return attachmentsRequest('DELETE', '/' + target.id).then(function () {
              files = files.filter(function (file) { return file !== target; });
              paint();
            });
          });
        });
        input.addEventListener('change', function () { send(input.files); input.value = ''; });
        form.addEventListener('dragover', function (event) { event.preventDefault(); });
        form.addEventListener('drop', function (event) { event.preventDefault(); send(event.dataTransfer.files); });
        var onPaste = function (event) {
          if (!layer.isConnected) { document.removeEventListener('paste', onPaste); return; }
          var pasted = event.clipboardData && event.clipboardData.files;
          if (pasted && pasted.length) { event.preventDefault(); send(pasted); }
        };
        document.addEventListener('paste', onPaste);
      },
    });
  }

  function activityView(activity, onCount) {
    return {
      title: activity.title, onCount: onCount,
      meta: [activityLabel('', activity.priority), activity.contact_name, activity.assignee && activity.assignee.name ? 'Responsável: ' + activity.assignee.name : (activity.assignee_name ? 'Responsável: ' + activity.assignee_name : ''), activity.status === 'done' ? 'Concluída' : (activity.status ? reminderDue(activity) : '')],
    };
  }

  function clipCount(button, count) {
    var badge = button.querySelector('b');
    var text = count ? String(count) : '';
    if (badge.textContent !== text) badge.textContent = text;
    var label = count ? (count === 1 ? '1 anexo' : count + ' anexos') : 'Anexar arquivo ou print';
    if (button.title !== label) { button.title = label; button.setAttribute('aria-label', label); }
  }

  function newClip(onClick) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'crm-clip';
    button.innerHTML = CLIP_ICON + '<b></b>';
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      onClick();
    });
    return button;
  }

  function openTaskView(page, row, box) {
    var title = row.querySelector('span.flex-1');
    var listIndex = selectedListIndex(page);
    var position = Array.prototype.indexOf.call(row.parentNode.children, row);
    checklistRequest('GET', '/checklist_lists').then(function (lists) {
      var list = lists[listIndex];
      var item = list && list.items.filter(function (entry) { return !!entry.done === box.checked; })[position];
      if (!item || !title || item.title !== title.textContent.trim()) throw new Error('item');
      openItemView('task', item.id, {
        title: item.title, meta: [list.name, item.done ? 'Concluída' : 'Pendente'],
        onCount: function (count) {
          var cached = cachedTask(page, row, box);
          if (cached) cached.attachments_count = count;
          var clip = row.querySelector('.crm-clip');
          if (clip) clipCount(clip, count);
        },
      });
    }).catch(function () {
      if (window.crmKanban) window.crmKanban.toast('Atualize a página e tente de novo.', 'error');
    });
  }

  function cachedTask(page, row, box) {
    var list = performanceCache && performanceCache[selectedListIndex(page)];
    var title = row.querySelector('span.flex-1');
    if (!list || !title) return null;
    var item = list.items.filter(function (entry) { return !!entry.done === box.checked; })[Array.prototype.indexOf.call(row.parentNode.children, row)];
    return item && item.title === title.textContent.trim() ? item : null;
  }

  function dressTaskClip(page, row, box, chip) {
    var clip = row.querySelector('.crm-clip');
    if (!clip) {
      clip = newClip(function () { openTaskView(page, row, row.querySelector('input[type="checkbox"]')); });
      row.insertBefore(clip, chip);
    }
    var item = cachedTask(page, row, box);
    clipCount(clip, item ? item.attachments_count || 0 : 0);
  }

  function mountPinClips() {
    var rows = document.querySelectorAll('.conversation-details-wrap .work-activity-pin:not(.work-activity-pin--compact) .work-activity-pin__row');
    if (!rows.length) return;
    var store = appStore().$store;
    var chat = store && store.getters.getSelectedChat;
    var open = ((chat && chat.open_work_activities) || []).filter(function (item) { return item.status !== 'done'; });
    rows.forEach(function (row, index) {
      var activity = open[index];
      if (!activity) return;
      var clip = row.querySelector('.crm-clip');
      if (!clip) {
        clip = newClip(function () {
          var current = JSON.parse(row.getAttribute('data-crm-activity') || 'null');
          if (current) openItemView('activity', current.id, activityView(current));
        });
        row.insertBefore(clip, row.querySelector('.work-activity-pin__done'));
        clipCount(clip, 0);
      }
      var data = JSON.stringify({ id: activity.id, title: activity.title, priority: activity.priority, assignee_name: activity.assignee_name, contact_name: chat.meta && chat.meta.sender && chat.meta.sender.name });
      if (row.getAttribute('data-crm-activity') !== data) row.setAttribute('data-crm-activity', data);
    });
  }

  // E-mail: usa a caixa de entrada de e-mail que o sistema já tem, com os dados de cada provedor prontos.
  var MAIL_PROVIDERS = {
    gmail: { label: 'Gmail', imap: ['imap.gmail.com', 993], smtp: ['smtp.gmail.com', 587, 'starttls'], help: 'No Google, ative a verificação em duas etapas e crie uma senha de app em myaccount.google.com/apppasswords. Use essa senha aqui, não a senha da conta.' },
    hostinger: { label: 'Hostinger', imap: ['imap.hostinger.com', 993], smtp: ['smtp.hostinger.com', 465, 'ssl'], help: 'Use o e-mail e a senha da caixa criada na Hostinger.' },
    yahoo: { label: 'Yahoo', imap: ['imap.mail.yahoo.com', 993], smtp: ['smtp.mail.yahoo.com', 465, 'ssl'], help: 'No Yahoo, gere uma senha de app em Segurança da conta e use essa senha aqui.' },
    microsoft: { label: 'Outlook', oauth: true },
    other: { label: 'Outro', manual: true, help: 'Use os dados de IMAP e SMTP informados pelo seu provedor.' },
  };

  function mailRequest(method, path, body) {
    var headers = authHeaders();
    var base = accountBase();
    if (!headers || !base) return Promise.reject(new Error('Sua sessão expirou. Entre novamente.'));
    return fetch('/api/v1/accounts/' + base.split('/').pop() + path, {
      method: method, credentials: 'same-origin', headers: Object.assign({}, headers, { 'Content-Type': 'application/json' }), body: body ? JSON.stringify(body) : undefined,
    }).then(function (response) {
      return response.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (error) { data = null; }
        if (!response.ok) throw new Error((data && (data.message || data.error)) || 'Não foi possível conectar. Confira os dados.');
        return data;
      });
    });
  }

  function mailChannel(provider, form) {
    var read = function (name) { var field = form.querySelector('[name=' + name + ']'); return field ? field.value.trim() : ''; };
    var email = read('email');
    var password = form.querySelector('[name=password]').value;
    var imap = provider.manual ? [read('imap_host'), Number(read('imap_port'))] : provider.imap;
    var smtp = provider.manual ? [read('smtp_host'), Number(read('smtp_port')), read('smtp_security')] : provider.smtp;
    return {
      email: email,
      imap_enabled: true, imap_address: imap[0], imap_port: imap[1], imap_login: email, imap_password: password, imap_enable_ssl: true, imap_authentication: 'login',
      smtp_enabled: true, smtp_address: smtp[0], smtp_port: smtp[1], smtp_login: email, smtp_password: password, smtp_domain: email.split('@')[1] || '', smtp_authentication: 'login',
      smtp_enable_ssl_tls: smtp[2] === 'ssl', smtp_enable_starttls_auto: smtp[2] === 'starttls', smtp_openssl_verify_mode: 'peer',
    };
  }

  function openMailPanel() {
    var kanban = window.crmKanban;
    if (!kanban || !kanban.dialog) return;
    var base = accountBase();
    var boxes = [];
    var chosen = 'gmail';
    var tabs = Object.keys(MAIL_PROVIDERS).map(function (key) { return '<button type="button" data-mail-provider="' + key + '">' + MAIL_PROVIDERS[key].label + '</button>'; }).join('');
    kanban.dialog({
      title: 'E-mail', submit: 'Conectar',
      body: '<div class="crm-mail-list" data-mail-list><p class="crm-view-empty">Carregando...</p></div>' +
        '<div class="crm-mail-tabs" role="group" aria-label="Provedor">' + tabs + '</div><p class="crm-mail-help" data-mail-help></p>' +
        '<div data-mail-fields><label class="kb-field">E-mail<input type="email" name="email" autocomplete="off" placeholder="nome@empresa.com"></label>' +
        '<label class="kb-field">Senha<input type="password" name="password" autocomplete="new-password"></label>' +
        '<div data-mail-manual hidden><div class="kb-grid-2"><label class="kb-field">Servidor IMAP<input name="imap_host" placeholder="imap.empresa.com"></label><label class="kb-field">Porta IMAP<input name="imap_port" inputmode="numeric" value="993"></label></div>' +
        '<div class="kb-grid-2"><label class="kb-field">Servidor SMTP<input name="smtp_host" placeholder="smtp.empresa.com"></label><label class="kb-field">Porta SMTP<input name="smtp_port" inputmode="numeric" value="587"></label></div>' +
        '<label class="kb-field">Segurança do envio<select name="smtp_security"><option value="starttls">STARTTLS</option><option value="ssl">SSL/TLS</option></select></label></div></div>',
      onOpen: function (form) {
        form.classList.add('crm-mail');
        var list = form.querySelector('[data-mail-list]');
        var submit = form.querySelector('button[type=submit]');
        var select = function (key) {
          chosen = key;
          var provider = MAIL_PROVIDERS[key];
          form.querySelectorAll('[data-mail-provider]').forEach(function (tab) { tab.classList.toggle('is-on', tab.getAttribute('data-mail-provider') === key); });
          form.querySelector('[data-mail-manual]').hidden = !provider.manual;
          form.querySelector('[data-mail-fields]').hidden = !!provider.oauth;
          submit.hidden = !!provider.oauth;
          var help = form.querySelector('[data-mail-help]');
          if (provider.oauth) {
            var config = appStore().$store && appStore().$store.getters['globalConfig/get'];
            help.innerHTML = config && config.azureAppId ? 'A Microsoft usa login próprio. <a href="' + base + '/settings/inboxes/new/email">Entrar com a Microsoft</a>' : 'A Microsoft não aceita senha comum. Para conectar Outlook, falta cadastrar o aplicativo Microsoft no servidor.';
          } else {
            help.textContent = provider.help;
          }
        };
        var paintBoxes = function () {
          list.innerHTML = boxes.length ? boxes.map(function (box) {
            return '<div class="crm-mail-box"><strong>' + escapeHtml(box.name) + '</strong><span>' + escapeHtml(box.email || '') + '</span><em class="' + (box.imap_enabled ? 'is-on' : '') + '">' + (box.imap_enabled ? 'Conectado' : 'Não concluído') + '</em><a href="' + base + '/settings/inboxes/' + box.id + '">Ajustar</a></div>';
          }).join('') : '<p class="crm-view-empty">Nenhum e-mail conectado ainda.</p>';
        };
        var loadBoxes = function () {
          return mailRequest('GET', '/inboxes').then(function (data) {
            boxes = ((data && data.payload) || []).filter(function (box) { return box.channel_type === 'Channel::Email'; });
            paintBoxes();
          });
        };
        form.addEventListener('click', function (event) {
          var tab = event.target.closest('[data-mail-provider]');
          if (tab) select(tab.getAttribute('data-mail-provider'));
        });
        form.__crmMail = { get chosen() { return chosen; }, get boxes() { return boxes; }, reload: loadBoxes };
        select('gmail');
        loadBoxes().catch(function () { list.innerHTML = '<p class="crm-view-empty">Não foi possível listar os e-mails.</p>'; });
      },
      onSubmit: function (form) {
        var state = form.__crmMail;
        var provider = MAIL_PROVIDERS[state.chosen];
        var channel = mailChannel(provider, form);
        if (!/^[^@\s]+@[^@\s]+$/.test(channel.email)) return Promise.reject(new Error('Informe um e-mail válido.'));
        if (!channel.imap_password) return Promise.reject(new Error('Informe a senha.'));
        if (!channel.imap_address || !channel.smtp_address || !channel.imap_port || !channel.smtp_port) return Promise.reject(new Error('Preencha os servidores e as portas.'));
        var existing = state.boxes.filter(function (box) { return (box.email || '').toLowerCase() === channel.email.toLowerCase(); })[0];
        if (existing && existing.imap_enabled) return Promise.reject(new Error('Este e-mail já está conectado.'));
        var ready = existing ? Promise.resolve(existing) : mailRequest('POST', '/inboxes', { name: channel.email, channel: { type: 'email', email: channel.email } });
        return ready.then(function (box) {
          return mailRequest('PATCH', '/inboxes/' + box.id, { channel: channel });
        }).then(function () {
          kanban.toast('E-mail conectado. As mensagens novas chegam em Conversas.');
        });
      },
    });
  }

  // Lista de conversas: cor do contato pela prioridade das atividades abertas e marca de card.
  var contactMarks = { activities: {}, cards: {} };
  var contactMarksLoaded = false;
  var contactMarksTicket = 0;
  var contactMarksTimer = 0;
  var contactPaintTimer = 0;
  var PRIORITY_NAMES = { low: 'baixa', medium: 'média', high: 'alta' };

  function visitConversationRows(visit) {
    var app = document.querySelector('#app');
    var root = app && app.__vue_app__ && app.__vue_app__._container && app.__vue_app__._container._vnode;
    (function walk(vnode) {
      if (!vnode || typeof vnode !== 'object') return;
      if (vnode.component) {
        var chat = vnode.component.props && vnode.component.props.chat;
        if (chat && chat.id && vnode.el && vnode.el.nodeType === 1 && vnode.el.matches('.conversations-list .conversation')) visit(vnode.el, chat);
        walk(vnode.component.subTree);
      }
      if (vnode.suspense) walk(vnode.suspense.activeBranch);
      if (Array.isArray(vnode.children)) vnode.children.forEach(walk);
    })(root);
  }

  function setOrClear(element, name, value) {
    if (value === null || value === '') {
      if (element.hasAttribute(name)) element.removeAttribute(name);
    } else if (element.getAttribute(name) !== value) {
      element.setAttribute(name, value);
    }
  }

  function contactHint(activity, cards) {
    var parts = [];
    if (activity) parts.push('Prioridade ' + PRIORITY_NAMES[activity.priority] + ' · ' + activity.count + (activity.count === 1 ? ' atividade aberta' : ' atividades abertas'));
    if (cards) parts.push((cards.count === 1 ? '1 card no Kanban: ' : cards.count + ' cards no Kanban: ') + cards.titles.join(', '));
    return parts.join(' · ');
  }

  function paintContactMarks() {
    contactPaintTimer = 0;
    visitConversationRows(function (row, chat) {
      var sender = chat.meta && chat.meta.sender;
      var activity = sender ? contactMarks.activities[sender.id] : null;
      var cards = sender ? contactMarks.cards[sender.id] : null;
      setOrClear(row, 'data-crm-prio', activity ? activity.priority : null);
      setOrClear(row, 'data-crm-card', cards ? String(cards.count) : null);
      var name = row.querySelector('.conversation--user');
      if (name) setOrClear(name, 'title', contactHint(activity, cards));
    });
  }

  function loadContactMarks() {
    if (!authHeaders() || !accountBase()) return;
    contactMarksLoaded = true;
    contactMarksTicket += 1;
    var ticket = contactMarksTicket;
    Promise.all([
      checklistRequest('GET', '/work_activities/contact_marks'),
      checklistRequest('GET', '/kanban_items/contact_marks'),
    ]).then(function (results) {
      if (ticket !== contactMarksTicket) return;
      contactMarks = { activities: results[0] || {}, cards: results[1] || {} };
      paintContactMarks();
    }).catch(function () {
      contactMarksLoaded = false;
    });
  }

  function requestContactMarks() {
    window.clearTimeout(contactMarksTimer);
    contactMarksTimer = window.setTimeout(loadContactMarks, 300);
  }

  function scheduleContactMarks() {
    if (!document.querySelector('.conversations-list .conversation')) return;
    if (!contactMarksLoaded) requestContactMarks();
    if (!contactPaintTimer) contactPaintTimer = window.setTimeout(paintContactMarks, 150);
  }

  window.addEventListener('crm:changed', requestContactMarks);

  // Botão direito na conversa: mesmas ações de atividade e card, sem precisar abrir uma mensagem.
  function publishOpenActivity(conversationId, activity) {
    var store = appStore().$store;
    if (!store) return;
    var chat = store.state.conversations.allConversations.filter(function (item) { return Number(item.id) === Number(conversationId); })[0];
    if (!chat) return;
    store.commit('SET_OPEN_WORK_ACTIVITIES', {
      conversationId: Number(conversationId),
      activities: [{
        id: activity.id, message_id: activity.message_id, title: activity.title, origin: activity.origin,
        priority: activity.priority, status: activity.status, assignee_name: activity.assignee ? activity.assignee.name : null,
      }].concat(chat.open_work_activities || []),
    });
  }

  function openConversationActivity(chat) {
    var kanban = window.crmKanban;
    if (!kanban || !kanban.dialog) return;
    var sender = (chat.meta && chat.meta.sender) || {};
    kanban.dialog({
      title: 'Criar atividade', narrow: true, submit: 'Criar atividade',
      body: '<p class="crm-ctx-contact">' + escapeHtml(sender.name || 'Conversa #' + chat.id) + '</p>' +
        '<label class="kb-field">Título<input type="text" name="title" maxlength="200" placeholder="O que precisa ser feito"></label>' +
        '<label class="kb-field">Prioridade<select name="priority"><option value="low">Baixa</option><option value="medium" selected>Média</option><option value="high">Alta</option></select></label>' +
        '<label class="kb-field">Prazo<input type="date" name="due_on"></label>' +
        '<label class="kb-check"><input type="checkbox" name="make_card"><span>Gerar card no Kanban</span></label>' +
        '<label class="crm-ctx-attach">' + CLIP_ICON + '<span data-attach-name>Anexar arquivo ou print</span><input type="file" name="files" multiple hidden accept="' + ATTACH_ACCEPT + '"></label>',
      onOpen: function (form) {
        var picker = form.querySelector('[name=files]');
        picker.addEventListener('change', function () {
          form.querySelector('[data-attach-name]').textContent = picker.files.length === 1 ? picker.files[0].name : picker.files.length ? picker.files.length + ' arquivos' : 'Anexar arquivo ou print';
        });
      },
      onSubmit: function (form) {
        var title = form.querySelector('[name=title]').value.trim();
        var attached = form.querySelector('[name=files]').files;
        if (!title) return Promise.reject(new Error('Escreva o título da atividade.'));
        var priority = form.querySelector('[name=priority]').value;
        var dueOn = form.querySelector('[name=due_on]').value || null;
        var makeCard = form.querySelector('[name=make_card]').checked;
        return checklistRequest('POST', '/conversations/' + chat.id + '/work_activities', { title: title, priority: priority, due_on: dueOn })
          .catch(function () { throw new Error('Não foi possível criar a atividade. Tente de novo.'); })
          .then(function (activity) {
            publishOpenActivity(chat.id, activity);
            kanban.toast('Atividade criada');
            if (attached.length) uploadAttachments('activity', activity.id, attached).catch(function (error) { kanban.toast(error.message, 'error'); });
            if (makeCard) {
              window.setTimeout(function () {
                kanban.createCard({ conversationId: String(chat.id) }, { title: title, due_on: dueOn, priority: { low: 1, medium: 2, high: 3 }[priority], work_activity_id: activity.id });
              }, 0);
            }
          });
      },
    });
  }

  function addConversationActions(chat, tries) {
    var menus = document.querySelectorAll('div.fixed.outline-none.cursor-pointer');
    var menu = menus[menus.length - 1];
    var list = menu && menu.firstElementChild;
    var sample = list && list.querySelector('.menu');
    if (!sample) {
      if (tries < 20) window.setTimeout(function () { addConversationActions(chat, tries + 1); }, 25);
      return;
    }
    if (list.querySelector('[data-crm-ctx]')) return;
    function action(label, path, run) {
      var item = sample.cloneNode(true);
      item.setAttribute('data-crm-ctx', 'true');
      item.querySelectorAll('svg').forEach(function (icon) { icon.remove(); });
      item.querySelector('.menu-label').textContent = label;
      item.insertAdjacentHTML('afterbegin', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + path + '"/></svg>');
      item.addEventListener('click', function (event) {
        event.stopPropagation();
        menu.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
        run();
      });
      return item;
    }
    var divider = document.createElement('hr');
    divider.className = 'm-1 rounded border-b border-n-weak dark:border-n-weak';
    list.insertBefore(divider, list.firstChild);
    list.insertBefore(action('Criar card', 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 7v7M12 7v4M16 7v9', function () {
      if (window.crmKanban) window.crmKanban.createCard({ conversationId: String(chat.id) });
    }), list.firstChild);
    list.insertBefore(action('Criar atividade', 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9', function () {
      openConversationActivity(chat);
    }), list.firstChild);
    var sender = chat.meta && chat.meta.sender;
    if (schedulesOn() && sender && chat.meta.channel !== 'Channel::Email') {
      list.insertBefore(action('Agendar mensagem', 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z', function () {
        openScheduleDialog({ inboxId: chat.inbox_id, contacts: [{ id: sender.id, name: sender.name }] });
      }), list.firstChild);
    }
  }

  document.addEventListener('contextmenu', function (event) {
    var row = event.target.closest && event.target.closest('.conversations-list .conversation');
    if (!row) return;
    var chat = null;
    visitConversationRows(function (element, item) { if (element === row) chat = item; });
    if (chat) window.setTimeout(function () { addConversationActions(chat, 0); }, 0);
  }, true);

  // O Chatwoot escreve "criada • última atividade"; a lista mostra só a última, como no WhatsApp.
  function cleanListTimes() {
    document.querySelectorAll('.conversations-list .conversation .border-line > .absolute div > span').forEach(function (element) {
      var parts = element.textContent.split('•');
      var last = parts[parts.length - 1].trim();
      if (element.getAttribute('data-crm-time') !== last) element.setAttribute('data-crm-time', last);
    });
  }
  window.setInterval(cleanListTimes, 30000);

  var observer = new MutationObserver(function () {
    observer.disconnect();
    try {
      freshBrandAssets();
      cleanListTimes();
      scheduleContactMarks();
      mountPinClips();
      scheduleMessageDress();
      markPage();
      mountShell();
      mountListSearch();
      applyTema();
      markPage();
      arrange();
      preferAllConversations();
      markActivityDialog();
      mountMobileBar();
      mountSettingsNav();
      mountPerformance();
      mountActivities();
      dressTasks();
      mountCalendar();
      mountBulkRead();
      mountTeamButton();
      mountToolsButton();
      collapseSidebar();
    } finally {
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  scan();
  window.setTimeout(refreshRailCounts, 1500);
  window.setInterval(refreshRailCounts, 30000);
  window.setTimeout(loadCrmModules, 1800);
  window.setTimeout(refreshHealth, 4000);
  window.setInterval(refreshHealth, 120000);
  window.setTimeout(refreshTeamUnread, 2500);
  window.setInterval(refreshTeamUnread, 30000);
  document.addEventListener('crm:modules', refreshTeamUnread);
  window.setInterval(function () {
    if (document.querySelector('.conversations-list .conversation')) loadContactMarks();
  }, 30000);
})();

/* Datas e horas no padrão do Brasil. O Chatwoot escreve em inglês em vários lugares ("Nov 9, 8:01 PM",
 * "8:01 PM", "Nov 9, 2026"); aqui o texto já mostrado vira "09/11 20:01", "20:01", "09/11/2026".
 * Só troca textos que são inteiros uma data ou hora, nunca dentro do texto de uma mensagem nem onde se digita. */
(function () {
  'use strict';
  var MONTH_PT = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var WEEK_PT = { sun: 'dom.', mon: 'seg.', tue: 'ter.', wed: 'qua.', thu: 'qui.', fri: 'sex.', sat: 'sáb.' };
  var MONTH_EN = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  var WEEK_EN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  var TIME_ONLY = /^(\d{1,2}):(\d{2})\s?([ap]m)$/i;
  var MONTH_YEAR = /^([a-z]{3,9})\.?\s+(\d{4})$/i;
  // grupos: 1 dia da semana | 2 mês, 3 dia ("Nov 9") | 4 dia, 5 mês ("9 Nov") | 6 ano | 7 separador | 8 hora, 9 minuto, 10 AM/PM
  var FULL = /^(?:([a-z]{3,9}),?\s+)?(?:([a-z]{3,9})\.?\s+(\d{1,2})|(\d{1,2})\s+([a-z]{3,9})\.?)(?:,?\s+(\d{4}))?(?:(,\s*|\s+·\s+|\s+at\s+)(\d{1,2}):(\d{2})\s?([ap]m))?$/i;
  var SKIP = 'script,style,textarea,input,[contenteditable="true"],.ProseMirror,.prose';

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function hour24(h, m, ampm) {
    var hour = parseInt(h, 10) % 12;
    if (/pm/i.test(ampm)) hour += 12;
    return pad(hour) + ':' + m;
  }
  // "Nov", "Nov." e "November" valem; "Mayor" não.
  function wordIndex(word, list) {
    var w = (word || '').toLowerCase();
    if (w === 'sept') return 8;
    for (var i = 0; i < list.length; i += 1) {
      if (list[i] === w || list[i].slice(0, 3) === w) return i;
    }
    return -1;
  }
  function monthNumber(name) { return wordIndex(name, MONTH_EN) + 1; }

  function convert(text) {
    var s = text.trim();
    if (!s || s.length > 40 || !/[a-z]/i.test(s)) return null;
    var m = TIME_ONLY.exec(s);
    if (m) return hour24(m[1], m[2], m[3]);
    m = MONTH_YEAR.exec(s);
    if (m) return monthNumber(m[1]) ? MONTH_PT[monthNumber(m[1]) - 1] + ' de ' + m[2] : null;
    m = FULL.exec(s);
    if (!m) return null;
    var month = monthNumber(m[2] || m[5]);
    var day = parseInt(m[3] || m[4], 10);
    var week = m[1] ? wordIndex(m[1], WEEK_EN) : -1;
    if (!month || day < 1 || day > 31 || (m[1] && week < 0)) return null;
    var out = pad(day) + '/' + pad(month) + (m[6] ? '/' + m[6] : '');
    if (week >= 0) out = WEEK_PT[WEEK_EN[week].slice(0, 3)] + ' ' + out;
    if (m[8]) out += (m[7].indexOf('·') !== -1 ? ' · ' : ' ') + hour24(m[8], m[9], m[10]);
    return out;
  }

  function fixText(node) {
    var parent = node.parentElement;
    if (!parent || parent.closest(SKIP)) return;
    var done = convert(node.nodeValue);
    if (done !== null) {
      var lead = node.nodeValue.match(/^\s*/)[0];
      var tail = node.nodeValue.match(/\s*$/)[0];
      node.nodeValue = lead + done + tail;
    }
  }
  function fixTree(root) {
    if (!root) return;
    if (root.nodeType === 3) { fixText(root); return; }
    if (root.nodeType !== 1 || root.closest(SKIP)) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) fixText(node);
  }

  window.crmDates = { convert: convert };
  var pending = [];
  var scheduled = false;
  function flush() {
    scheduled = false;
    var list = pending;
    pending = [];
    list.forEach(fixTree);
  }
  var observer = new MutationObserver(function (records) {
    records.forEach(function (r) {
      if (r.type === 'characterData') pending.push(r.target);
      else r.addedNodes.forEach(function (n) { pending.push(n); });
    });
    if (!scheduled && pending.length) { scheduled = true; window.requestAnimationFrame(flush); }
  });
  function start() {
    fixTree(document.body);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
