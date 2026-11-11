require 'rails_helper'

RSpec.describe 'Isolamento de checklist entre colaboradores', type: :request do
  let(:account) { create(:account) }
  let(:agent) { create(:user, account: account, role: :agent) }
  let(:peer) { create(:user, account: account, role: :agent) }
  let(:agent_headers) { agent.create_new_auth_token }
  let(:peer_headers) { peer.create_new_auth_token }
  let!(:list) { account.checklist_lists.create!(name: 'Diário', position: 1) }
  let!(:mine) do
    list.checklist_items.create!(
      account: account, user: agent, title: 'Minha tarefa', kind: 'adhoc',
      due_on: Time.zone.today, done: false
    )
  end
  let!(:theirs) do
    list.checklist_items.create!(
      account: account, user: peer, title: 'Tarefa do colega', kind: 'adhoc',
      due_on: Time.zone.today, done: false
    )
  end

  it 'esconde itens do colega nas listas' do
    get "/api/v1/accounts/#{account.id}/checklist_lists", headers: agent_headers, as: :json
    expect(response).to have_http_status(:success)
    titles = response.parsed_body.flat_map { |row| row['items'].map { |item| item['title'] } }
    expect(titles).to include('Minha tarefa')
    expect(titles).not_to include('Tarefa do colega')
  end

  it 'não deixa concluir item do colega' do
    patch "/api/v1/accounts/#{account.id}/checklist_items/#{theirs.id}",
          headers: agent_headers, params: { done: true }, as: :json
    expect(response).to have_http_status(:not_found)
    expect(theirs.reload.done).to be(false)
  end

  it 'não deixa apagar item do colega' do
    delete "/api/v1/accounts/#{account.id}/checklist_items/#{theirs.id}",
           headers: agent_headers, as: :json
    expect(response).to have_http_status(:not_found)
    expect(ChecklistItem.exists?(theirs.id)).to be(true)
  end

  it 'mantém o quadro e as taxas só do usuário logado' do
    get "/api/v1/accounts/#{account.id}/checklist_board?day=#{Time.zone.today}",
        headers: agent_headers, as: :json
    expect(response).to have_http_status(:success)
    board = response.parsed_body
    titles = (board['pending'] + board['fixed'] + board['adhoc'] + board['done']).map { |item| item['title'] }
    expect(titles).to include('Minha tarefa')
    expect(titles).not_to include('Tarefa do colega')

    list.checklist_items.create!(
      account: account, user: peer, title: 'Feita pelo colega', kind: 'adhoc',
      due_on: Time.zone.today, done: true, done_at: Time.zone.now
    )
    account.checklist_completion_events.create!(
      account: account, user: peer, checklist_item: theirs, day: Time.zone.today, completed_at: Time.zone.now
    )

    get "/api/v1/accounts/#{account.id}/checklist_stats?on=#{Time.zone.today}&range=day",
        headers: agent_headers, as: :json
    expect(response).to have_http_status(:success)
    expect(response.parsed_body['rates']['day']['completed']).to eq(0)
  end

  it 'permite o dono concluir a própria tarefa' do
    patch "/api/v1/accounts/#{account.id}/checklist_items/#{mine.id}",
          headers: agent_headers, params: { done: true }, as: :json
    expect(response).to have_http_status(:success)
    expect(mine.reload.done).to be(true)
    expect(account.checklist_completion_events.where(user_id: agent.id).count).to eq(1)
  end
end
