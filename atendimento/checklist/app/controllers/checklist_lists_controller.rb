class Api::V1::Accounts::ChecklistListsController < Api::V1::Accounts::BaseController
  before_action :checklist_list, only: [:update, :destroy]

  def index
    authorize ChecklistList
    lists = Current.account.checklist_lists.includes(checklist_items: :files_attachments).order(:position, :id)
    render json: lists.map { |list| list_json(list, mine_only: true) }
  end


  def create
    authorize ChecklistList
    list = Current.account.checklist_lists.create!(name: params[:name])
    render json: list_json(list, mine_only: true)
  end

  def update
    authorize @checklist_list
    @checklist_list.update!(name: params[:name]) if params.key?(:name)
    render json: list_json(@checklist_list, mine_only: true)
  end

  def destroy
    authorize @checklist_list
    @checklist_list.destroy!
    head :ok
  end

  private

  def checklist_list
    @checklist_list = Current.account.checklist_lists.find(params[:id])
  end

  def list_json(list, mine_only: false)
    items = list.checklist_items
    items = items.select { |item| item.user_id == Current.user.id } if mine_only
    items = items.sort_by { |item| [item.position, item.id] }
    {
      id: list.id,
      name: list.name,
      position: list.position,
      items: items.map { |item| item_json(item) }
    }
  end

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
end

