# Cartões abertos do Kanban nos quadros que a pessoa vê.
class CrmAi::Tools::ListarCartoes < CrmAi::Tools::Base
  FILTERS = %w[abertos atrasados vencem_hoje parados].freeze
  PRIORITY = { 0 => 'nenhuma', 1 => 'baixa', 2 => 'média', 3 => 'alta' }.freeze
  STALE_DAYS = 7

  description 'Lista cartões abertos do Kanban (título, cliente, quadro, etapa, prazo, prioridade, valor, responsáveis). ' \
              "\"parados\" são os que estão na mesma etapa há mais de #{STALE_DAYS} dias."
  parameter :filtro, description: "Um de: #{FILTERS.join(', ')}. Padrão: abertos", required: false
  parameter :quadro, description: 'Parte do nome do quadro, para filtrar', required: false
  parameter :limite, type: :integer, description: 'Quantos trazer, até 10', required: false

  def self.tool_name
    'listar_cartoes'
  end

  private

  def run(filtro: nil, quadro: nil, limite: nil)
    scope = filtered(@access.kanban_items.where(status: 'open'), filtro.to_s)
    if quadro.present?
      wanted = quadro.to_s.downcase.strip
      scope = scope.where(kanban_funnel_id: @access.funnels.select { |funnel| funnel.name.downcase.include?(wanted) }.map(&:id))
    end
    rows = scope.includes(:kanban_funnel, :kanban_stage, :contact, :agents, :conversation)
                .order(Arel.sql('due_on ASC NULLS LAST'), stage_entered_at: :asc).limit(limit_of(limite))
    { total: scope.count, cartoes: rows.map { |item| row(item) } }
  end

  def filtered(scope, filter)
    today = @access.today
    case filter
    when 'atrasados' then scope.where(due_on: ...today)
    when 'vencem_hoje' then scope.where(due_on: today)
    when 'parados' then scope.where(stage_entered_at: ...STALE_DAYS.days.ago)
    else scope
    end
  end

  def row(item)
    {
      titulo: item.title, cliente: item.customer_name.presence || item.contact&.name, quadro: item.kanban_funnel&.name,
      etapa: item.kanban_stage&.name, prazo: local_date(item.due_on) || 'sem prazo', prioridade: PRIORITY[item.priority],
      na_etapa_desde: local_time(item.stage_entered_at), conversa: item.conversation&.display_id
    }.merge(extras(item)).compact
  end

  def extras(item)
    { valor: (item.value.to_f if item.value.to_f.positive?), responsaveis: item.agents.map(&:available_name).presence }
  end
end
