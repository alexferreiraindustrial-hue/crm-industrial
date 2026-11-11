class ChecklistRoutine < ApplicationRecord
  belongs_to :account
  belongs_to :user

  validates :title, presence: true, length: { maximum: 200 }
  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  scope :enabled, -> { where(enabled: true) }
  scope :for_user, ->(user) { where(user_id: user.id) }

  before_validation :normalize_title
  before_validation :assign_position, on: :create

  private

  def normalize_title
    self.title = title.to_s.gsub(/[[:cntrl:]]/, '').squish
  end

  def assign_position
    return if position.to_i.positive?

    self.position = (account&.checklist_routines&.where(user_id: user_id)&.maximum(:position) || 0) + 1
  end
end
