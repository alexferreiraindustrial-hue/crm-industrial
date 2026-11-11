class ChecklistItem < ApplicationRecord
  include CrmAttachable

  KINDS = %w[fixed adhoc carry].freeze

  belongs_to :account
  belongs_to :checklist_list
  belongs_to :user, optional: true
  belongs_to :routine, class_name: 'ChecklistRoutine', optional: true, foreign_key: :routine_id
  has_many :completion_events, class_name: 'ChecklistCompletionEvent', dependent: :nullify

  validates :title, presence: true, length: { maximum: 200 }
  validates :kind, inclusion: { in: KINDS }
  validate :same_account_as_list

  before_validation :normalize_title
  before_validation :copy_account_from_list
  before_validation :assign_position, on: :create
  before_save :sync_done_at

  scope :for_user, ->(user) { where(user_id: user.id) }
  scope :open_items, -> { where(done: false) }
  scope :due_on, ->(day) { where(due_on: day) }
  scope :overdue_before, ->(day) { open_items.where('due_on < ?', day) }

  private

  def normalize_title
    self.title = title.to_s.gsub(/[[:cntrl:]]/, '').squish
  end

  def copy_account_from_list
    self.account_id ||= checklist_list&.account_id
  end

  def assign_position
    return if position.to_i.positive?
    return if checklist_list.blank?

    self.position = (checklist_list.checklist_items.maximum(:position) || 0) + 1
  end

  def sync_done_at
    if done?
      self.done_at ||= Time.zone.now
    else
      self.done_at = nil
    end
  end

  def same_account_as_list
    return if checklist_list.blank? || account_id.blank?
    return if checklist_list.account_id == account_id

    errors.add(:account_id, 'must match the list')
  end
end
