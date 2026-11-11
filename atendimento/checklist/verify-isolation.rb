# Verificação de isolamento entre colaboradores (rails runner).
account_id = AccountUser.group(:account_id).having('COUNT(*) >= 2').pluck(:account_id).first
abort('sem conta com 2 usuários') unless account_id

account = Account.find(account_id)
agents = account.users.order(:id).limit(2).to_a
abort('precisa de 2 usuários na conta') if agents.size < 2

agent, peer = agents
list = account.checklist_lists.order(:id).first || account.checklist_lists.create!(name: 'Isolamento', position: 99)

mine = list.checklist_items.create!(
  account: account, user: agent, title: "iso-mine-#{SecureRandom.hex(3)}",
  kind: 'adhoc', due_on: Time.zone.today, done: false
)
theirs = list.checklist_items.create!(
  account: account, user: peer, title: "iso-peer-#{SecureRandom.hex(3)}",
  kind: 'adhoc', due_on: Time.zone.today, done: false
)

results = {}

# Chatwoot Current é ActiveSupport::CurrentAttributes com atributos account/user.
Current.reset
Current.account = account
Current.user = agent

visible = list.checklist_items.reload.select { |item| item.user_id == Current.user.id }.map(&:title)
results[:lists_hide_peer] = visible.include?(mine.title) && !visible.include?(theirs.title)

found = account.checklist_items.where(user_id: Current.user.id).find_by(id: theirs.id)
results[:item_find_blocks_peer] = found.nil?

board = Checklist::DayBoard.new(account: account, user: agent, day: Time.zone.today).perform
titles = (board[:pending] + board[:fixed] + board[:adhoc] + board[:done]).map(&:title)
results[:board_hides_peer] = titles.include?(mine.title) && !titles.include?(theirs.title)

before = Checklist::Stats.new(account: account, user: agent, on: Time.zone.today).perform[:rates][:day][:completed]
  peer_event = account.checklist_completion_events.create!(
    account: account, user: peer, checklist_item: theirs, title: theirs.title,
    day: Time.zone.today, completed_at: Time.zone.now
  )
after = Checklist::Stats.new(account: account, user: agent, on: Time.zone.today).perform[:rates][:day][:completed]
results[:stats_ignore_peer_events] = after == before

own = account.checklist_items.where(user_id: Current.user.id).find(mine.id)
Checklist::CompleteItem.new(item: own, user: agent, done: true).perform
results[:owner_can_complete] = own.reload.done?

# Request-level: update/destroy do colega deve 404 via finder do controller.
controller_scope = account.checklist_items.where(user_id: agent.id)
results[:controller_find_peer_404] = controller_scope.find_by(id: theirs.id).nil?
results[:controller_find_own_ok] = controller_scope.find_by(id: mine.id).present?

Current.reset

peer_event.destroy!
account.checklist_completion_events.where(checklist_item_id: [mine.id, theirs.id]).delete_all
mine.destroy!
theirs.destroy!

failed = results.reject { |_key, ok| ok }.keys
puts "isolation=#{results.inspect}"
puts failed.empty? ? 'PASS' : "FAIL:#{failed.join(',')}"
exit(failed.empty? ? 0 : 1)
