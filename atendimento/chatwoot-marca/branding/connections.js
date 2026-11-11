// Configurações > Conexões: números de WhatsApp pela WAHA. QR e chaves ficam atrás do backend.
(function () {
  if (window.top !== window || window.crmConnections) return;

  var STATES = {
    connected: ['Conectado', 'ok'], pairing: ['Aguardando QR Code', 'wait'], connecting: ['Conectando', 'wait'],
    disconnected: ['Desconectado', 'off'], unavailable: ['Serviço indisponível', 'bad'], error: ['Com erro', 'bad'],
  };
  var PROVIDERS = { waha: 'WAHA' };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function accountId() {
    var match = window.location.pathname.match(/\/accounts\/(\d+)/);
    return match ? match[1] : '';
  }

  function headers() {
    var match = document.cookie.match(/(?:^|;\s*)cw_d_session_info=([^;]*)/);
    var data = match ? JSON.parse(decodeURIComponent(match[1])) : {};
    return { 'access-token': data['access-token'], 'token-type': data['token-type'] || 'Bearer', client: data.client, expiry: data.expiry, uid: data.uid, 'Content-Type': 'application/json', Accept: 'application/json' };
  }

  function api(method, path, body) {
    return fetch('/api/v1/accounts/' + accountId() + '/crm_connections' + path, {
      method: method, credentials: 'same-origin', headers: headers(), body: body ? JSON.stringify(body) : undefined,
    }).then(function (response) {
      return response.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (error) { data = null; }
        if (!response.ok) {
          var failure = new Error((data && data.error) || 'Não foi possível concluir. Tente de novo.');
          failure.data = data;
          failure.status = response.status;
          throw failure;
        }
        return data;
      });
    });
  }

  function showNumber(digits) {
    var value = String(digits || '');
    if (value.length === 13 && value.indexOf('55') === 0) return '+55 ' + value.slice(2, 4) + ' ' + value.slice(4, 9) + '-' + value.slice(9);
    if (value.length === 12 && value.indexOf('55') === 0) return '+55 ' + value.slice(2, 4) + ' ' + value.slice(4, 8) + '-' + value.slice(8);
    return value ? '+' + value : 'Número ainda não identificado';
  }

  function when(value) {
    if (!value) return 'Sem atividade';
    return new Date(typeof value === 'number' ? value * 1000 : value).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  function qrMarkup(data) {
    if (data.qr_image) return '<img src="' + esc(data.qr_image) + '" alt="QR Code de pareamento">';
    if (!data.qr || !window.qrcode) return '';
    var code = window.qrcode(0, 'L');
    code.addData(data.qr);
    code.make();
    return code.createSvgTag({ cellSize: 5, margin: 2, scalable: true });
  }

  function open() {
    var kanban = window.crmKanban;
    if (!kanban || !kanban.dialog) return;
    var pollTimer = 0;
    var alive = true;
    kanban.dialog({
      title: 'Conexões', submit: 'Fechar', body: '<div data-conn-view></div>',
      onSubmit: function () { alive = false; window.clearTimeout(pollTimer); return Promise.resolve(); },
      onOpen: function (form, layer) {
        form.classList.add('crm-view', 'crm-conn');
        var view = form.querySelector('[data-conn-view]');
        var submit = form.querySelector('button[type=submit]');
        submit.type = 'button';
        submit.addEventListener('click', function () { alive = false; window.clearTimeout(pollTimer); layer.remove(); });
        var stopped = function () { return !alive || !layer.isConnected; };

        function paintList() {
          window.clearTimeout(pollTimer);
          view.innerHTML = '<div class="crm-conn-head"><p>Números de WhatsApp conectados ao CRM.</p><button type="button" class="kb-btn is-primary" data-conn="add">Adicionar conexão</button></div><div data-conn-list><p class="crm-view-empty">Carregando...</p></div>';
          api('GET', '').then(function (data) {
            if (stopped()) return;
            var list = view.querySelector('[data-conn-list]');
            if (!list) return;
            var rows = data.connections || [];
            list.innerHTML = rows.length ? rows.map(rowMarkup).join('') : '<p class="crm-view-empty">Nenhuma conexão ainda.</p>';
            view.__rows = rows;
          }).catch(function (error) {
            var list = view.querySelector('[data-conn-list]');
            if (list) list.innerHTML = '<p class="crm-view-empty">' + esc(error.message) + '</p>';
          });
        }

        function rowMarkup(item) {
          var state = STATES[item.state] || STATES.connecting;
          var connected = item.state === 'connected';
          return '<article class="crm-conn-row" data-id="' + item.inbox_id + '"><div class="crm-conn-main"><p><strong>' + esc(item.name) + '</strong><span class="crm-conn-tag" data-provider="' + esc(item.provider) + '">' + esc(PROVIDERS[item.provider] || item.provider) + '</span></p>' +
            '<small>' + esc(showNumber(item.number)) + '</small><small>Última atividade: ' + esc(when(item.last_activity_at)) + ' · Criada em ' + esc(when(item.created_at)) + '</small>' +
            (item.error ? '<small class="crm-conn-error">' + esc(item.error) + '</small>' : '') + '</div>' +
            '<em class="crm-conn-state" data-tone="' + state[1] + '">' + state[0] + '</em><div class="crm-conn-actions">' +
            (connected ? '<button type="button" data-conn="disconnect">Desconectar</button>' : (item.state === 'unavailable' ? '' : '<button type="button" data-conn="reconnect">Reconectar</button>')) +
            '</div></article>';
        }

        function paintPairing(data) {
          window.clearTimeout(pollTimer);
          if (stopped()) return;
          if (data.state === 'connected') {
            view.innerHTML = '<div class="crm-conn-done"><strong>Conectado</strong><p>' + esc(showNumber(data.number)) + '</p>' + (data.error ? '<p class="crm-conn-error">' + esc(data.error) + '</p>' : '') + '<button type="button" class="kb-btn is-primary" data-conn="list">Ver conexões</button></div>';
            return;
          }
          var image = qrMarkup(data);
          var current = view.querySelector('[data-conn-qr]');
          if (!current || view.getAttribute('data-pairing') !== String(data.inbox_id)) {
            view.setAttribute('data-pairing', data.inbox_id);
            view.innerHTML = '<div class="crm-conn-pair"><div class="crm-conn-qr" data-conn-qr></div><div><strong>' + esc(data.name) + '</strong><ol><li>Abra o WhatsApp no celular.</li><li>Toque em Dispositivos conectados.</li><li>Toque em Conectar dispositivo e leia o código.</li></ol><p class="crm-conn-status" role="status" data-conn-status></p><p class="crm-conn-error" data-conn-fail hidden></p><button type="button" class="crm-conn-back" data-conn="list">‹ Voltar às conexões</button></div></div>';
            current = view.querySelector('[data-conn-qr]');
          }
          if (view.__qr !== (data.qr || data.qr_image || '')) {
            view.__qr = data.qr || data.qr_image || '';
            current.innerHTML = image || '<p class="crm-view-empty">Gerando o código...</p>';
          }
          view.querySelector('[data-conn-status]').textContent = (STATES[data.state] || STATES.connecting)[0];
          var fail = view.querySelector('[data-conn-fail]');
          fail.hidden = !data.error;
          fail.textContent = data.error || '';
          pollTimer = window.setTimeout(function () {
            api('GET', '/' + data.inbox_id).then(paintPairing).catch(function () { pollTimer = window.setTimeout(function () { paintPairing(data); }, 4000); });
          }, 2500);
        }

        function rowOf(element) {
          var id = element.closest('[data-id]').getAttribute('data-id');
          return (view.__rows || []).filter(function (item) { return String(item.inbox_id) === id; })[0];
        }

        function reconnect(item, button) {
          button.disabled = true;
          api('POST', '/' + item.inbox_id + '/reconnect').then(function () {
            return api('GET', '/' + item.inbox_id);
          }).then(function (data) {
            view.removeAttribute('data-pairing');
            view.__qr = null;
            paintPairing(data);
          }).catch(function (error) {
            button.disabled = false;
            kanban.toast(error.message, 'error');
          });
        }

        view.addEventListener('click', function (event) {
          var button = event.target.closest('[data-conn]');
          if (!button) return;
          var action = button.getAttribute('data-conn');
          if (action === 'list') paintList();
          if (action === 'add') { alive = false; layer.remove(); window.location.assign('/app/accounts/' + accountId() + '/settings/inboxes/new/whatsapp?provider=waha'); }
          if (action === 'reconnect') reconnect(rowOf(button), button);
          if (action === 'disconnect') {
            var off = rowOf(button);
            kanban.confirm('Desconectar', 'O número de "' + off.name + '" deixa de receber e enviar por esta conexão até ser reconectado.', 'Desconectar', function () {
              return api('POST', '/' + off.inbox_id + '/disconnect').then(paintList);
            });
          }
        });

        paintList();
      },
    });
  }

  window.crmConnections = { open: open };
})();
