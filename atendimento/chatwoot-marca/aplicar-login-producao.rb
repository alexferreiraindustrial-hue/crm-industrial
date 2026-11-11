# Nome e logo da tela de entrada. Nao altera enderecos da marca.
BRANDING = {
  'INSTALLATION_NAME' => 'BRUNA LOGISTICA CRM',
  'BRAND_NAME' => 'BRUNA LOGISTICA CRM',
  'LOGO' => '/brand-assets/logo.png',
  'LOGO_DARK' => '/brand-assets/logo.png',
  'LOGO_THUMBNAIL' => '/brand-assets/logo-mark.png'
}.freeze

BRANDING.each do |name, value|
  config = InstallationConfig.find_or_initialize_by(name: name)
  config.value = value
  config.save!
end
GlobalConfig.clear_cache
puts "login=#{BRANDING['INSTALLATION_NAME']}"
