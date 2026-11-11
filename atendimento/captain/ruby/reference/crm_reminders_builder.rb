# Cria os alertas de prazo: um dia antes e no dia, sempre pelo calendário de São Paulo.
# O índice único garante que rodar de novo não repete o aviso.
class CrmRemindersBuilder
  ZONE = 'America/Sao_Paulo'.freeze
  FIRST_HOUR = 8

  def self.call(now: Time.current)
    local = now.in_time_zone(ZONE)
    return 0 if local.hour < FIRST_HOUR

    new(local.to_date).call
  end

  def initialize(today)
    @today = today
    @tomorrow = today + 1
  end

  def call
    rows = kanban_rows + activity_rows
    return 0 if rows.empty?

    CrmReminder.insert_all(rows, unique_by: 'index_crm_reminders_unique_delivery').length
  end

  private

  def stage_for(due_on)
    due_on == @today ? 'due_day' : 'day_before'
  end

  def row(account_id, user_id, source, due_on)
    now = Time.current
    { account_id: account_id, user_id: user_id, source_type: source.class.name, source_id: source.id, stage: stage_for(due_on), due_on: due_on,
      created_at: now, updated_at: now }
  end

  def admin_ids(account_id)
    @admins ||= AccountUser.where(role: :administrator).pluck(:account_id, :user_id).group_by(&:first).transform_values { |pairs| pairs.map(&:last) }
    @admins.fetch(account_id, [])
  end

  def members(account_id)
    @members ||= AccountUser.pluck(:account_id, :user_id).group_by(&:first).transform_values { |pairs| pairs.map(&:last) }
    @members.fetch(account_id, [])
  end

  def kanban_scope
    KanbanItem.where(status: 'open', archived_at: nil, due_on: [@today, @tomorrow])
              .joins(:kanban_stage, :kanban_funnel)
              .where(kanban_stages: { done_stage: false }, kanban_funnels: { archived_at: nil })
              .includes(:kanban_funnel, :kanban_item_agents)
  end

  def kanban_rows
    kanban_scope.flat_map do |item|
      kanban_recipients(item).map { |user_id| row(item.account_id, user_id, item, item.due_on) }
    end
  end

  def kanban_recipients(item)
    funnel = item.kanban_funnel
    return [funnel.owner_id] if funnel.personal?

    assigned = item.kanban_item_agents.map(&:user_id)
    candidates = assigned.presence || [item.creator_id].compact
    admins = admin_ids(item.account_id)
    candidates.select do |user_id|
      members(item.account_id).include?(user_id) &&
        (admins.include?(user_id) || (funnel.accessible_by?(user_id) && (funnel.visibility != 'assigned_only' || assigned.include?(user_id))))
    end
  end

  def activity_rows
    WorkActivity.where(due_on: [@today, @tomorrow]).where.not(status: 'done').filter_map do |activity|
      user_id = activity.assignee_id || activity.created_by_id
      row(activity.account_id, user_id, activity, activity.due_on) if user_id && members(activity.account_id).include?(user_id)
    end
  end
end
