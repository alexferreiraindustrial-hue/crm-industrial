class Api::V1::Accounts::ChecklistItemsController < Api::V1::Accounts::BaseController
  before_action :checklist_list, only: [:create]
  before_action :checklist_item, only: [:update, :destroy]

  def create
    authorize ChecklistItem
    item = @checklist_list.checklist_items.create!(
      title: params[:title],
      account: Current.account,
      user: Current.user,
      kind: params[:kind].presence_in(ChecklistItem::KINDS) || 'adhoc',
      due_on: params[:due_on].present? ? Date.parse(params[:due_on]) : Time.zone.today
    )
    render json: item_json(item)
  rescue ArgumentError
    render_could_not_create_error('Data inválida')
  end

  def update
    authorize @checklist_item
    if params.key?(:done)
      item = Checklist::CompleteItem.new(item: @checklist_item, user: Current.user, done: params[:done]).perform
      render json: item_json(item)
      return
    end

    attrs = item_params.to_h
    attrs[:due_on] = Date.parse(attrs[:due_on]) if attrs[:due_on].present?
    @checklist_item.update!(attrs)
    render json: item_json(@checklist_item)
  rescue ArgumentError
    render_could_not_create_error('Data inválida')
  end

  def destroy
    authorize @checklist_item
    @checklist_item.destroy!
    head :ok
  end

  private

  def checklist_list
    @checklist_list = Current.account.checklist_lists.find(params[:checklist_list_id])
  end

  def checklist_item
    @checklist_item = Current.account.checklist_items.where(user_id: Current.user.id).find(params[:id])
  end

  def item_params
    params.permit(:title, :position, :due_on, :kind)
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
      created_at: item.created_at.iso8601,
      updated_at: item.updated_at.iso8601
    }
  end
end
