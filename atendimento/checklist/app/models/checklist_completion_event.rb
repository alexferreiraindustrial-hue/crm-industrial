class ChecklistCompletionEvent < ApplicationRecord
  belongs_to :account
  belongs_to :user
  belongs_to :checklist_item, optional: true

  validates :title, presence: true, length: { maximum: 200 }
  validates :completed_at, :day, presence: true

  before_validation :fill_day

  scope :for_user, ->(user) { where(user_id: user.id) }
  scope :on_day, ->(day) { where(day: day) }
  scope :between_days, ->(from_day, to_day) { where(day: from_day..to_day) }

  private

  def fill_day
    self.day ||= completed_at&.in_time_zone&.to_date
  end
end
