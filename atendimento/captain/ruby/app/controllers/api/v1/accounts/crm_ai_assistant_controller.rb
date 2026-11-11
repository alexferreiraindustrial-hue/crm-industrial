# Assistente de IA: perguntar (todos, com o recurso ligado), ver e mudar o limite mensal (administrador).
class Api::V1::Accounts::CrmAiAssistantController < Api::V1::Accounts::BaseController
  include CrmModuleGate

  requires_crm_module :assistente_ia
  before_action :require_administrator, only: [:update]

  def show
    payload = { key_configured: CrmAi::Assistant.api_key_for(Current.account).present?, model: CrmAi::Assistant.model, admin: administrator? }
    payload[:budget] = CrmAi::Budget.new(Current.account).summary if administrator?
    render json: payload
  end

  def update
    CrmAi::Budget.new(Current.account).set_limit!(params[:monthly_limit_usd])
    Rails.logger.info("[CrmAi] limite mensal alterado conta=#{Current.account.id} por=usuario:#{Current.user.id}")
    render json: { budget: CrmAi::Budget.new(Current.account.reload).summary }
  rescue ArgumentError => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  def ask
    assistant = CrmAi::Assistant.new(account: Current.account, user: Current.user, admin: administrator?)
    render json: assistant.ask(params[:question], history: history_param)
  rescue CrmAi::Assistant::Error => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  private

  def history_param
    return [] unless params[:history].is_a?(Array)

    params[:history].map { |turn| turn.permit(:role, :content).to_h }
  end

  def administrator?
    Current.account_user&.administrator? || false
  end

  def require_administrator
    raise Pundit::NotAuthorizedError unless administrator?
  end
end
