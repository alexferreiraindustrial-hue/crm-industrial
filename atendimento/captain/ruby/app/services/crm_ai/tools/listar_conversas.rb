# Lista conversas que a pessoa vê, sem o conteúdo das mensagens.
class CrmAi::Tools::ListarConversas < CrmAi::Tools::Base
  FILTERS = %w[abertas minhas sem_responsavel aguardando pendentes].freeze

  description 'Lista conversas (número, cliente, caixa, situação, responsável, última atividade), sem o texto das mensagens. ' \
              'Para ler o que foi conversado, use ler_conversa com o número.'
  parameter :filtro, description: "Um de: #{FILTERS.join(', ')}. Padrão: abertas", required: false
  parameter :cliente, description: 'Parte do nome do cliente, para procurar', required: false
  parameter :limite, type: :integer, description: 'Quantas trazer, até 10', required: false

  def self.tool_name
    'listar_conversas'
  end

  private

  def run(filtro: nil, cliente: nil, limite: nil)
    scope = filtered(@access.conversations, filtro.to_s)
    scope = scope.joins(:contact).where('contacts.name ILIKE ?', "%#{ActiveRecord::Base.sanitize_sql_like(cliente.to_s.strip)}%") if cliente.present?
    rows = scope.includes(:contact, :inbox, :assignee).order(last_activity_at: :desc).limit(limit_of(limite))
    { total: scope.count, conversas: rows.map { |conversation| row(conversation) } }
  end

  def filtered(scope, filter)
    case filter
    when 'minhas' then scope.where(status: :open, assignee_id: @access.user.id)
    when 'sem_responsavel' then scope.where(status: :open, assignee_id: nil)
    when 'aguardando' then scope.where(status: :open).where.not(waiting_since: nil)
    when 'pendentes' then scope.where(status: :pending)
    else scope.where(status: :open)
    end
  end

  def row(conversation)
    {
      numero: conversation.display_id, cliente: conversation.contact&.name, caixa: conversation.inbox&.name,
      situacao: STATUS[conversation.status], responsavel: conversation.assignee&.available_name,
      ultima_atividade: local_time(conversation.last_activity_at), aguardando_desde: local_time(conversation.waiting_since)
    }.compact
  end
end
