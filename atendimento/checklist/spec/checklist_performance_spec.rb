require 'rails_helper'

RSpec.describe 'Checklist desempenho dia/mês', type: :request do
  let(:account) { create(:account) }
  let(:agent) { create(:user, account: account, role: :agent) }
  let(:headers) { agent.create_new_auth_token }

  def get_json(path)
    get "/api/v1/accounts/#{account.id}#{path}", headers: headers, as: :json
    expect(response).to have_http_status(:success)
    response.parsed_body
  end

  it 'materializa fixas, registra conclusão e devolve taxas' do
    post "/api/v1/accounts/#{account.id}/checklist_routines",
         headers: headers, params: { title: 'Conferir fretes' }, as: :json
    expect(response).to have_http_status(:success)

    board = get_json("/checklist_board?day=#{Time.zone.today}")
    expect(board['fixed'].map { |item| item['title'] }).to include('Conferir fretes')
    item_id = board['fixed'].first['id']

    patch "/api/v1/accounts/#{account.id}/checklist_items/#{item_id}",
          headers: headers, params: { done: true }, as: :json
    expect(response).to have_http_status(:success)
    expect(response.parsed_body['done_at']).to be_present
    expect(account.checklist_completion_events.where(user_id: agent.id).count).to eq(1)

    stats = get_json("/checklist_stats?on=#{Time.zone.today}&range=day")
    expect(stats['rates']['day']['completed']).to eq(1)
    expect(stats['heatmap'].last['count']).to be >= 1
    expect(stats['streak']).to be >= 1
  end

  it 'mantém pendência de ontem em destaque' do
    list = account.checklist_lists.create!(name: 'Diário', position: 1)
    list.checklist_items.create!(
      account: account, user: agent, title: 'Atrasada', kind: 'adhoc',
      due_on: Time.zone.yesterday, done: false
    )

    board = get_json("/checklist_board?day=#{Time.zone.today}")
    expect(board['pending'].map { |item| item['title'] }).to eq(['Atrasada'])
  end
end
