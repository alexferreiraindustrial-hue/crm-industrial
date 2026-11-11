# CRM Industrial: grava nome e links da marca nas configuracoes da instalacao do Chatwoot CE.
# Uso: aplicar-marca.ps1 (copia este arquivo para o container e roda com rails runner).
BRANDING = {
  'INSTALLATION_NAME' => 'BRUNA LOGISTICA CRM',
  'BRAND_NAME' => 'BRUNA LOGISTICA CRM',
  'BRAND_URL' => 'http://localhost:3020',
  'WIDGET_BRAND_URL' => 'http://localhost:3020',
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
puts "BRUNA LOGISTICA CRM: #{BRANDING.size} configuracoes de marca gravadas."
