class Checklist::Stats
  def initialize(account:, user:, on: Date.current, range: 'day')
    @account = account
    @user = user
    @on = on.to_date
    @range = range.to_s
  end

  def perform
    {
      on: @on.iso8601,
      range: @range,
      rates: {
        day: rate_for(@on, @on),
        week: rate_for(@on.beginning_of_week(:monday), @on),
        month: rate_for(@on.beginning_of_month, @on.end_of_month),
        days_7: rate_for(@on - 6, @on),
        days_30: rate_for(@on - 29, @on),
        days_90: rate_for(@on - 89, @on)
      },
      trends: {
        days_7: daily_rates(@on - 6, @on),
        days_30: daily_rates(@on - 29, @on),
        days_90: month_rates(@on - 89, @on)
      },
      heatmap: heatmap(@on - 89, @on),
      streak: streak_ending_on(@on),
      completed_today: events.on_day(@on).count,
      pending_carry: @account.checklist_items.where(user_id: @user.id).open_items.overdue_before(@on).count
    }
  end

  private

  def events
    @account.checklist_completion_events.for_user(@user)
  end

  def items
    @account.checklist_items.where(user_id: @user.id)
  end

  def rate_for(from_day, to_day)
    completed = events.between_days(from_day, to_day).count
    open_due = items.open_items.where(due_on: from_day..to_day).count
    total = completed + open_due
    {
      completed: completed,
      open: open_due,
      total: total,
      rate: total.zero? ? 0 : ((completed.to_f / total) * 100).round
    }
  end

  def daily_rates(from_day, to_day)
    (from_day..to_day).map do |day|
      rate_for(day, day).merge(day: day.iso8601)
    end
  end

  def month_rates(from_day, to_day)
    cursor = from_day.beginning_of_month
    rows = []
    while cursor <= to_day
      end_day = [cursor.end_of_month, to_day].min
      rows << rate_for(cursor, end_day).merge(month: cursor.strftime('%Y-%m'))
      cursor = cursor.next_month.beginning_of_month
    end
    rows
  end

  def heatmap(from_day, to_day)
    counts = events.between_days(from_day, to_day).group(:day).count
    (from_day..to_day).map do |day|
      { day: day.iso8601, count: counts[day].to_i }
    end
  end

  def streak_ending_on(day)
    streak = 0
    cursor = day
    while events.on_day(cursor).exists?
      streak += 1
      cursor -= 1
    end
    streak
  end
end

