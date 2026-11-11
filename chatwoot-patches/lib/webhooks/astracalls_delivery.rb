# CRM Industrial: a caixa AstraCalls entrega numa rede interna, que o filtro de SSRF recusa.
# Só o caminho de webhook do AstraCalls, no host de ASTRACALLS_INTERNAL_URL, passa sem o filtro.
# Todos os outros webhooks continuam protegidos.
class Webhooks::AstracallsDelivery
  WEBHOOK_PATH = %r{\A/api/sessions/[^/]+/chatwoot/webhook\z}
  # O AstraCalls só responde depois de enviar ao WhatsApp, e a mídia demora mais que o padrão de 5 s.
  READ_TIMEOUT = 60
  # O nome interno pode resolver também em IPv6 sem rota (Docker Desktop); o envio sorteia um endereço.
  RESOLVER = lambda do |hostname|
    addresses = SsrfFilter::DEFAULT_RESOLVER.call(hostname)
    addresses.select(&:ipv4?).presence || addresses
  end

  def self.for(url, webhook_type)
    return unless webhook_type == :api_inbox_webhook

    delivery = new(url)
    delivery if delivery.internal?
  end

  def initialize(url)
    @url = url
  end

  def internal?
    base = URI.parse(ENV.fetch('ASTRACALLS_INTERNAL_URL', ''))
    target = URI.parse(@url)
    base.host.present? && origin(base) == origin(target) && target.path.match?(WEBHOOK_PATH)
  rescue URI::InvalidURIError
    false
  end

  # Os links de anexo saem com FRONTEND_URL; o AstraCalls baixa pelo endereço que ele alcança.
  def payload_for(payload)
    from = ENV.fetch('FRONTEND_URL', '').delete_suffix('/')
    to = ENV.fetch('ASTRACALLS_CHATWOOT_URL', '').delete_suffix('/')
    return payload if from.blank? || to.blank? || from == to

    payload.to_h.deep_dup.with_indifferent_access.tap do |copy|
      Array(copy[:attachments]).each do |attachment|
        url = attachment[:data_url].to_s
        attachment[:data_url] = "#{to}#{url.delete_prefix(from)}" if url.start_with?("#{from}/")
      end
    end
  end

  private

  def origin(uri)
    [uri.scheme, uri.host, uri.port]
  end
end
