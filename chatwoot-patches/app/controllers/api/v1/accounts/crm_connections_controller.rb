# CRM Industrial: Configurações > Conexões. Só administrador; QR e chaves não saem do backend sem login.
class Api::V1::Accounts::CrmConnectionsController < Api::V1::Accounts::BaseController
  before_action :check_admin_authorization?
  before_action :fetch_inbox, except: [:index, :create, :set_message_source_id]

  SOURCE_ID_FORMAT = /\A[A-Za-z0-9:_-]{6,128}\z/

  rescue_from Astracalls::Client::Error, Waha::Client::Error do |error|
    render json: { error: error.message }, status: :unprocessable_entity
  end

  def index
    render json: { connections: CrmConnections::Directory.new(Current.account).list }
  end

  def create
    inbox = connector.create(name: params[:name], phone: params[:phone], confirm_duplicate: ActiveModel::Type::Boolean.new.cast(params[:confirm_duplicate]))
    render json: connector.refresh(inbox)
  rescue CrmConnections::AstracallsConnector::Duplicate => e
    render json: { error: 'duplicate', conflicts: e.conflicts }, status: :conflict
  end

  def show
    render json: astracalls? ? connector.refresh(@inbox) : waha_payload
  end

  def reconnect
    astracalls? ? connector.reconnect(@inbox) : waha.restart_session(waha_name)
    head :ok
  end

  def disconnect
    astracalls? ? connector.disconnect(@inbox) : waha.logout_session(waha_name)
    head :ok
  end

  # Conexões WAHA não são excluídas por aqui, para nunca apagar sessões em uso.
  def destroy
    return render(json: { error: 'Conexões WAHA não podem ser excluídas nesta tela' }, status: :forbidden) unless astracalls?

    connector.remove(@inbox)
    head :ok
  end

  # Chamado pelo AstraCalls depois de enviar: liga a mensagem do CRM ao ID dela no WhatsApp,
  # que é o que faz chegar confirmação de leitura, citação e reação. Grava uma única vez.
  def set_message_source_id
    return head(:unprocessable_entity) unless params[:source_id].to_s.match?(SOURCE_ID_FORMAT)

    message = Current.account.messages.where(message_type: :outgoing, source_id: [nil, '']).find(params[:message_id])
    return head(:not_found) unless message.inbox.api? && message.inbox.channel.additional_attributes.to_h['astracalls_session'].present?

    message.update_columns(source_id: params[:source_id].to_s) # rubocop:disable Rails/SkipsModelValidations
    head :ok
  end

  private

  def fetch_inbox
    @inbox = Current.account.inboxes.where(channel_type: 'Channel::Api').find(params[:id])
    @attributes = @inbox.channel.additional_attributes.to_h
    render(json: { error: 'Conexão não encontrada' }, status: :not_found) if @attributes['astracalls_session'].blank? && @attributes['waha_session'].blank?
  end

  def astracalls?
    @attributes['astracalls_session'].present?
  end

  def connector
    @connector ||= CrmConnections::AstracallsConnector.new(account: Current.account, user: Current.user)
  end

  def waha
    @waha ||= Waha::Client.new
  end

  def waha_name
    @attributes['waha_session']
  end

  def waha_payload
    connection = CrmConnections::Directory.new(Current.account).find(@inbox)
    return connection unless connection[:raw_state] == 'SCAN_QR_CODE'

    qr = waha.qr_code(waha_name)
    connection.merge(qr_image: qr.is_a?(Hash) && qr['data'].present? ? "data:#{qr['mimetype']};base64,#{qr['data']}" : nil)
  end
end
