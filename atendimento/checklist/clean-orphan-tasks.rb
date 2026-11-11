# Remove só tarefas abertas sem dono (user_id nulo). Não mexe em nada mais.
scope = ChecklistItem.where(done: false, user_id: nil)
ids = scope.pluck(:id)
titles = scope.pluck(:id, :title, :account_id)

abort('nenhum órfão aberto') if ids.empty?

deleted = scope.delete_all
puts "deleted=#{deleted}"
titles.each { |id, title, account_id| puts "removed id=#{id} account_id=#{account_id} title=#{title.inspect}" }
puts "remaining_open_null=#{ChecklistItem.where(done: false, user_id: nil).count}"
puts "remaining_open_all=#{ChecklistItem.where(done: false).count}"
