# CRM Industrial: aplica a marca sobre o Chatwoot CE ja compilado (roda no build da imagem).
# Falha se algum ponto de encaixe sumir numa versao nova, para revisarmos.
require 'json'
require 'fileutils'

NAME = 'BRUNA LOGISTICA CRM'.freeze
ASSETS = '/app/public/vite/assets'.freeze
BRAND_BLUE = /#2781f6/i
BRAND_GREEN = '#00a884'.freeze
BLUE_9_TRIPLET = '39 129 246'.freeze
GREEN_9_TRIPLET = '0 168 132'.freeze
# "Chatwoot" como palavra de frase (antes: espaco, aspas, > ou parentese; depois: pontuacao ou fim de frase).
# Nomes tecnicos (chatwootSDK, chatwoot.com, latestChatwootVersion, Chatwoot.algo) nao casam.
PRODUCT_WORD = /(?<=[\s>("' ])Chatwoot(?=[\s,!?:;<)"' ]|\.(?![A-Za-z0-9_$])|\z)/

def fail_build(message)
  abort("CRM Industrial: ponto de encaixe nao encontrado: #{message}")
end

def rewrite(path)
  content = File.read(path, encoding: 'UTF-8')
  updated = yield(content)
  return false if updated == content

  File.write(path, updated)
  true
end

# 1. Cor da marca compilada direto no CSS/JS (classes n-brand, foco, links)
colored = Dir.glob("#{ASSETS}/*.{css,js}").count do |file|
  rewrite(file) { |text| text.gsub(BRAND_BLUE, BRAND_GREEN).gsub(BLUE_9_TRIPLET, GREEN_9_TRIPLET) }
end
fail_build('cor #2781F6 nos assets') if colored.zero?

# 2. Nome do produto nas frases: telas (JS compilado), traducoes do servidor e e-mails
renamed = Dir.glob("#{ASSETS}/*.js").count { |file| rewrite(file) { |text| text.gsub(PRODUCT_WORD, NAME) } }
fail_build('textos com Chatwoot no JS') if renamed.zero?
# Concordancia em portugues para o nome masculino "o CRM Industrial"
PT_BR_GRAMMAR = {
  'Bem-vindo a {installationName}' => 'Bem-vindo ao {installationName}',
  'aproveite o máximo de {installationName}' => 'aproveite o máximo do {installationName}',
  'consegue fazer em {installationName}' => 'consegue fazer no {installationName}'
}.freeze
Dir.glob("#{ASSETS}/*.js").each do |file|
  rewrite(file) { |text| PT_BR_GRAMMAR.reduce(text) { |result, (from, to)| result.gsub(from, to) } }
end
server_files = Dir.glob('/app/config/locales/*.yml') + Dir.glob('/app/app/views/**/*.{erb,liquid}')
server_files.each { |file| rewrite(file) { |text| text.gsub(PRODUCT_WORD, NAME) } }

# 3. Painel: folha de tema e cores do navegador (barra do celular, blocos do Windows)
layout = '/app/app/views/layouts/vueapp.html.erb'
anchor = '<%= vite_javascript_tag @application_pack %>'
rewrite(layout) do |html|
  fail_build('vite_javascript_tag no layout') unless html.include?(anchor)
  html.sub(anchor, "#{anchor}
    <link rel=\"stylesheet\" href=\"https://fonts.bunny.net/css?family=inter:400,500,600,700\" />
    <link rel=\"manifest\" href=\"/crm-industrial/manifest.webmanifest\" />
    <meta name=\"theme-color\" content=\"#E6EDEA\" />
    <meta name=\"theme-color\" media=\"(prefers-color-scheme: dark)\" content=\"#06171A\" />
    <link rel=\"stylesheet\" href=\"/crm-industrial/theme.css?v=whatsapp-web-80\" />
    <link rel=\"stylesheet\" href=\"/crm-industrial/theme-v3.css?v=whatsapp-web-80\" />
    <link rel=\"stylesheet\" href=\"/crm-industrial/whatsapp-web.css?v=whatsapp-web-80\" />
    <link rel=\"stylesheet\" href=\"/crm-industrial/kanban.css?v=whatsapp-web-80\" />
    <script src=\"/crm-industrial/reactions.js?v=whatsapp-web-80\" defer></script>
    <script src=\"/crm-industrial/sidebar.js?v=whatsapp-web-80\" defer></script>
    <script src=\"/crm-industrial/sortable.min.js?v=1.15.6\" defer></script>
    <script src=\"/crm-industrial/kanban.js?v=whatsapp-web-80\" defer></script>
    <script src=\"/crm-industrial/qrcode.js?v=whatsapp-web-80\" defer></script>
    <script src=\"/crm-industrial/connections.js?v=whatsapp-web-80\" defer></script>")
      .gsub('content="#1f93ff"', 'content="#00a884"')
      .gsub(/content="#2781f6"/i, 'content="#00a884"')
      .gsub('content="#F76B15"', 'content="#00a884"')
end

# 3b. Avatar do bot tambem empacotado com hash nos assets (chatwoot_bot-XXXX.png)
bot_icon = '/app/public/assets/images/chatwoot_bot.png'
Dir.glob("#{ASSETS}/chatwoot_bot-*.png").each { |file| FileUtils.cp(bot_icon, file) } if File.exist?(bot_icon)

# 4. Manifesto do app instalado
%w[/app/public/manifest.json /app/public/packs/manifest.json].each do |path|
  next unless File.exist?(path)

  manifest = JSON.parse(File.read(path, encoding: 'UTF-8'))
  manifest['name'] = NAME
  manifest['short_name'] = NAME
  manifest['theme_color'] = '#00a884' if manifest.key?('theme_color')
  manifest['background_color'] = '#efeae2' if manifest.key?('background_color')
  File.write(path, JSON.pretty_generate(manifest))
end

puts "CRM Industrial: marca aplicada (cores em #{colored} arquivos, nome em #{renamed} scripts)."
