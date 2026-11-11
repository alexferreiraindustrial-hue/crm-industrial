# frozen_string_literal: true

accounts = Account.order(:id).map { |account| [account.id, account.name, account.locale, account.status] }
puts accounts.map { |row| row.join("\t") }.join("\n")

name = 'Brunalogistica'
account = Account.where('LOWER(name) = ?', name.downcase).first
if account
  puts "exists\t#{account.id}"
else
  source = Account.order(:id).first
  account = Account.create!(name: name, locale: source&.locale || 'pt_BR')
  puts "created\t#{account.id}"
end

user = User.find_by(type: 'SuperAdmin') || User.order(:id).first
raise 'sem usuario' if user.nil?

membership = AccountUser.find_by(account_id: account.id, user_id: user.id)
if membership
  puts "linked\t#{user.id}\t#{membership.role}"
else
  AccountUser.create!(account_id: account.id, user_id: user.id, role: :administrator)
  puts "linked\t#{user.id}\tadministrator"
end
