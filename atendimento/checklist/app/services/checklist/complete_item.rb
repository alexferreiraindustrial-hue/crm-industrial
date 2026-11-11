class Checklist::CompleteItem
  def initialize(item:, user:, done:)
    @item = item
    @user = user
    @done = ActiveModel::Type::Boolean.new.cast(done)
  end

  def perform
    @item.user_id ||= @user.id
    @item.due_on ||= Time.zone.today
    @item.done = @done
    @item.done_at = @done ? Time.zone.now : nil
    @item.save!

    record_event if @done
    @item
  end

  private

  def record_event
    @item.account.checklist_completion_events.create!(
      user: @user,
      checklist_item: @item,
      title: @item.title,
      completed_at: @item.done_at || Time.zone.now,
      day: (@item.done_at || Time.zone.now).in_time_zone.to_date
    )
  end
end
