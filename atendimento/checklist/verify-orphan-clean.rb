puts "open_null=#{ChecklistItem.where(done: false, user_id: nil).count}"
puts "open_by_account=#{ChecklistItem.where(done: false).group(:account_id).count.inspect}"
puts "open_by_user=#{ChecklistItem.where(done: false).group(:user_id).count.inspect}"
ChecklistItem.where(done: false).order(:id).each do |item|
  puts "open id=#{item.id} account=#{item.account_id} user=#{item.user_id} title=#{item.title.inspect}"
end
