class Checklist::DayBoard
  DAILY_LIST_NAME = 'Diário'.freeze

  def initialize(account:, user:, day: Date.current)
    @account = account
    @user = user
    @day = day.to_date
  end

  def perform
    list = ensure_daily_list
    materialize_fixed_items(list)
    items = owned_items.includes(:files_attachments).order(:position, :id)

    pending = items.open_items.overdue_before(@day).to_a
    today_open = items.open_items.where(due_on: @day).to_a
    fixed = today_open.select { |item| item.kind == 'fixed' }
    adhoc = today_open.reject { |item| item.kind == 'fixed' }
    done_ids = items.where(done: true, due_on: @day).pluck(:id) +
               items.where(done: true, due_on: nil).where(done_at: @day.all_day).pluck(:id)
    done = items.where(id: done_ids).order(Arel.sql('done_at DESC NULLS LAST'), :id).to_a

    {
      day: @day.iso8601,
      list_id: list.id,
      pending: pending,
      fixed: fixed,
      adhoc: adhoc,
      done: done,
      routines: @account.checklist_routines.for_user(@user).order(:position, :id)
    }
  end

  private

  def ensure_daily_list
    @account.checklist_lists.find_or_create_by!(name: DAILY_LIST_NAME) do |list|
      list.position = (@account.checklist_lists.maximum(:position) || 0) + 1
    end
  end

  def materialize_fixed_items(list)
    @account.checklist_routines.enabled.for_user(@user).find_each do |routine|
      list.checklist_items.find_or_create_by!(routine_id: routine.id, due_on: @day, user_id: @user.id) do |item|
        item.account = @account
        item.title = routine.title
        item.kind = 'fixed'
        item.done = false
        item.position = routine.position
      end
    end
  end

  def owned_items
    @account.checklist_items.where(user_id: @user.id)
  end
end
