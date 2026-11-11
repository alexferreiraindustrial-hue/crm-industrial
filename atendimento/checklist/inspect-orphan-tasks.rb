# Inspeção: badge vs board — itens abertos sem dono ou com dono inválido.
account_id = AccountUser.group(:account_id).having('COUNT(*) >= 1').pluck(:account_id).first
account = Account.find(account_id)

open_all = account.checklist_items.where(done: false)
orphans = open_all.where(user_id: nil)
invalid_user = open_all.where.not(user_id: nil).where.not(user_id: account.user_ids)

puts "account_id=#{account.id}"
puts "open_all=#{open_all.count}"
puts "orphans_null_user=#{orphans.count}"
puts "orphans_invalid_user=#{invalid_user.count}"
puts "by_user=#{open_all.group(:user_id).count.inspect}"

(orphans + invalid_user).each do |item|
  puts "orphan id=#{item.id} user_id=#{item.user_id.inspect} title=#{item.title.inspect} due_on=#{item.due_on} list_id=#{item.checklist_list_id}"
end
