# Lista as funcionalidades opcionais (todos veem o que está ligado; só o administrador liga e desliga).
class Api::V1::Accounts::CrmModulesController < Api::V1::Accounts::BaseController
  before_action :require_administrator, only: [:update]

  def index
    render json: { modules: CrmModules.list(Current.account) }
  end

  def update
    return render(json: { error: 'Recurso desconhecido.' }, status: :not_found) unless CrmModules.known?(params[:id])

    CrmModules.set!(Current.account, params[:id], ActiveModel::Type::Boolean.new.cast(params[:enabled]) == true)
    render json: { modules: CrmModules.list(Current.account.reload) }
  end

  private

  def require_administrator
    raise Pundit::NotAuthorizedError unless Current.account_user&.administrator?
  end
end
