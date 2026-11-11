class CrmRemindersJob < ApplicationJob
  queue_as :scheduled_jobs

  def perform
    CrmRemindersBuilder.call
  end
end
