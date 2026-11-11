# Recusa o uso de uma funcionalidade opcional que o administrador deixou desligada.
#   include CrmModuleGate
#   requires_crm_module :mensagens_agendadas
module CrmModuleGate
  extend ActiveSupport::Concern

  class_methods do
    def requires_crm_module(key, **)
      before_action(**) { ensure_crm_module!(key) }
    end
  end

  private

  def ensure_crm_module!(key)
    return if CrmModules.enabled?(Current.account, key)

    render json: { error: 'Recurso desligado em Configurações → Recursos.' }, status: :forbidden
  end
end
