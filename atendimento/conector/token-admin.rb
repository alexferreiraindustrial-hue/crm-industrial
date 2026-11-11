# Imprime "<conta> <token>" do primeiro administrador do Chatwoot (usado por ligar-conector.ps1)
admin_link = AccountUser.where(role: :administrator).order(:id).first
abort('sem administrador') unless admin_link
puts "CONECTOR #{admin_link.account_id} #{admin_link.user.access_token.token}"
