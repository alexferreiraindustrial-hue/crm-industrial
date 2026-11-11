class Api::V1::Accounts::ChecklistBoardsController < Api::V1::Accounts::BaseController
  def show
    authorize ChecklistItem, :index?
    day = params[:day].present? ? Date.parse(params[:day]) : Time.zone.today
    board = Checklist::DayBoard.new(account: Current.account, user: Current.user, day: day).perform
    render json: {
      day: board[:day],
      list_id: board[:list_id],
      pending: board[:pending].map { |item| item_json(item) },
      fixed: board[:fixed].map { |item| item_json(item) },
      adhoc: board[:adhoc].map { |item| item_json(item) },
      done: board[:done].map { |item| item_json(item) },
      routines: board[:routines].map { |item| routine_json(item) }
    }
  rescue ArgumentError
    render_could_not_create_error('Data inválida')
  end

  private

  def item_json(item)
    {
      id: item.id,
      checklist_list_id: item.checklist_list_id,
      title: item.title,
      done: item.done,
      kind: item.kind,
      due_on: item.due_on&.iso8601,
      done_at: item.done_at&.iso8601,
      routine_id: item.routine_id,
      position: item.position,
      attachments_count: item.files_attachments.size,
      created_at: item.created_at.iso8601,
      updated_at: item.updated_at.iso8601
    }
  end

  def routine_json(item)
    {
      id: item.id,
      title: item.title,
      position: item.position,
      enabled: item.enabled
    }
  end
end
