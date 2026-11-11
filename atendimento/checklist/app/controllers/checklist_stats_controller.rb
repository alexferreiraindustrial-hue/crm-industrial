class Api::V1::Accounts::ChecklistStatsController < Api::V1::Accounts::BaseController
  def show
    authorize ChecklistItem, :index?
    on = params[:on].present? ? Date.parse(params[:on]) : Time.zone.today
    range = params[:range].presence_in(%w[day month]) || 'day'
    render json: Checklist::Stats.new(account: Current.account, user: Current.user, on: on, range: range).perform
  rescue ArgumentError
    render_could_not_create_error('Data inválida')
  end
end
