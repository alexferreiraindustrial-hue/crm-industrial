# Atividades (lembretes) que a pessoa vê, com prazo e responsável.
class CrmAi::Tools::ListarAtividades < CrmAi::Tools::Base
  FILTERS = %w[pendentes atrasadas hoje proximas sem_prazo].freeze
  PRIORITY = { 'low' => 'baixa', 'medium' => 'média', 'high' => 'alta' }.freeze

  description 'Lista atividades não concluídas (título, prioridade, prazo, responsável, número da conversa).'
  parameter :filtro, description: "Um de: #{FILTERS.join(', ')}. Padrão: pendentes", required: false
  parameter :responsavel, description: 'minhas (só as da pessoa que pergunta) ou todas. Padrão: todas', required: false
  parameter :limite, type: :integer, description: 'Quantas trazer, até 10', required: false

  def self.tool_name
    'listar_atividades'
  end

  private

  def run(filtro: nil, responsavel: nil, limite: nil)
    scope = filtered(@access.work_activities.where.not(status: 'done'), filtro.to_s)
    scope = scope.where(assignee_id: @access.user.id) if responsavel.to_s == 'minhas'
    rows = scope.includes(:assignee, :conversation).order(Arel.sql('due_on ASC NULLS LAST'), created_at: :desc).limit(limit_of(limite))
    { total: scope.count, atividades: rows.map { |activity| row(activity) } }
  end

  def filtered(scope, filter)
    today = @access.today
    case filter
    when 'atrasadas' then scope.where(due_on: ...today)
    when 'hoje' then scope.where(due_on: today)
    when 'proximas' then scope.where(due_on: (today + 1)..)
    when 'sem_prazo' then scope.where(due_on: nil)
    else scope
    end
  end

  def row(activity)
    {
      titulo: activity.title, prioridade: PRIORITY[activity.priority], prazo: local_date(activity.due_on) || 'sem prazo',
      responsavel: activity.assignee&.available_name || 'sem responsável', conversa: activity.conversation&.display_id
    }.compact
  end
end
