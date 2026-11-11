# O que a pessoa que pergunta pode ver, com as mesmas regras das telas:
# conversas e atividades das caixas e times dela (administrador vê a conta toda) e cartões dos quadros que ela vê.
# Também conta as consultas de uma pergunta, para a IA não ficar consultando sem parar.
class CrmAi::Access
  MAX_TOOL_CALLS = 6
  ZONE = 'America/Sao_Paulo'.freeze

  attr_reader :account, :user, :tool_calls

  def initialize(account:, user:, admin:)
    @account = account
    @user = user
    @admin = admin
    @tool_calls = 0
  end

  def admin?
    @admin
  end

  def count_call!
    @tool_calls += 1
    @tool_calls <= MAX_TOOL_CALLS
  end

  def today
    Time.current.in_time_zone(ZONE).to_date
  end

  def conversations
    scope = Conversation.where(account_id: account.id)
    return scope if admin?

    scope.where('conversations.inbox_id IN (:inbox_ids) OR conversations.team_id IN (:team_ids)', inbox_ids: inbox_ids, team_ids: team_ids)
  end

  def work_activities
    scope = WorkActivity.where(account_id: account.id)
    return scope if admin?

    scope.joins(:conversation)
         .where('conversations.inbox_id IN (:inbox_ids) OR conversations.team_id IN (:team_ids)', inbox_ids: inbox_ids, team_ids: team_ids)
  end

  def funnels
    @funnels ||= KanbanFunnel.where(account_id: account.id).not_archived.select { |funnel| funnel.visible_to?(user, admin?) }
  end

  def kanban_items
    scope = KanbanItem.where(account_id: account.id, kanban_funnel_id: funnels.map(&:id), archived_at: nil)
    return scope if admin?

    restricted = funnels.select { |funnel| funnel.visibility == 'assigned_only' }.map(&:id)
    return scope if restricted.empty?

    scope.where.not(kanban_funnel_id: restricted).or(scope.where(id: KanbanItemAgent.where(user_id: user.id).select(:kanban_item_id)))
  end

  private

  def inbox_ids
    user.inboxes.where(account_id: account.id).select(:id)
  end

  def team_ids
    user.teams.where(account_id: account.id).select(:id)
  end
end
