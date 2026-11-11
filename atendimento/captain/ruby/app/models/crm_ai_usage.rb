# Uma pergunta feita à IA: quem, quando, modelo, tokens e custo estimado. Sem o texto.
class CrmAiUsage < ApplicationRecord
  STATUSES = %w[ok error].freeze

  belongs_to :account
  belongs_to :user, optional: true

  validates :status, inclusion: { in: STATUSES }

  scope :this_month, -> { where(created_at: Time.current.in_time_zone(CrmAi::Budget::ZONE).beginning_of_month..) }
end
