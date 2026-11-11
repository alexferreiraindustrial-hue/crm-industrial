class Api::V1::Accounts::ChecklistRoutinesController < Api::V1::Accounts::BaseController
  before_action :routine, only: [:update, :destroy]

  def index
    authorize ChecklistRoutine
    routines = Current.account.checklist_routines.for_user(Current.user).order(:position, :id)
    render json: routines.map { |item| routine_json(item) }
  end

  def create
    authorize ChecklistRoutine
    item = Current.account.checklist_routines.create!(
      user: Current.user,
      title: params[:title],
      enabled: params.key?(:enabled) ? ActiveModel::Type::Boolean.new.cast(params[:enabled]) : true
    )
    render json: routine_json(item)
  end

  def update
    authorize @routine
    attrs = {}
    attrs[:title] = params[:title] if params.key?(:title)
    attrs[:enabled] = ActiveModel::Type::Boolean.new.cast(params[:enabled]) if params.key?(:enabled)
    attrs[:position] = params[:position] if params.key?(:position)
    @routine.update!(attrs)
    render json: routine_json(@routine)
  end

  def destroy
    authorize @routine
    @routine.destroy!
    head :ok
  end

  private

  def routine
    @routine = Current.account.checklist_routines.for_user(Current.user).find(params[:id])
  end

  def routine_json(item)
    {
      id: item.id,
      title: item.title,
      position: item.position,
      enabled: item.enabled,
      created_at: item.created_at.iso8601,
      updated_at: item.updated_at.iso8601
    }
  end
end
