#!/bin/bash
set -eu
cd /tmp/bruna-login
C=crm-industrial-chatwoot-1
docker cp reactions.js "$C:/app/public/crm-industrial/reactions.js"
docker cp sidebar.js "$C:/app/public/crm-industrial/sidebar.js"
docker cp visual.css "$C:/tmp/visual.css"
docker cp manifest.webmanifest "$C:/app/public/crm-industrial/manifest.webmanifest"
docker cp checklist_lists_controller.rb "$C:/app/app/controllers/api/v1/accounts/checklist_lists_controller.rb"
docker cp checklist_items_controller.rb "$C:/app/app/controllers/api/v1/accounts/checklist_items_controller.rb"
docker cp work_activities_controller.rb "$C:/app/app/controllers/api/v1/accounts/work_activities_controller.rb"
docker cp _work_activity.json.jbuilder "$C:/app/app/views/api/v1/accounts/work_activities/_work_activity.json.jbuilder"
docker cp "$C:/app/config/routes.rb" /tmp/bruna-login/routes.rb
python3 - <<'PY'
from pathlib import Path
path = Path('/tmp/bruna-login/routes.rb')
text = path.read_text()
old = 'resources :work_activities, only: [:update]'
new = 'resources :work_activities, only: [:index, :update]'
if old in text:
    path.write_text(text.replace(old, new, 1))
elif new not in text:
    raise SystemExit('routes anchor missing')
PY
docker cp /tmp/bruna-login/routes.rb "$C:/app/config/routes.rb"
docker cp "$C:/app/public/crm-industrial/theme.css" /tmp/bruna-login/theme.css
python3 - <<'PY'
from pathlib import Path
theme_path = Path('/tmp/bruna-login/theme.css')
visual = Path('/tmp/bruna-login/visual.css').read_text()
theme = theme_path.read_text()
start = '/* Visual novembro 2026 */'
end = '/* /Visual novembro 2026 */'
block = start + '\n' + visual.rstrip() + '\n' + end + '\n'
if start in theme and end in theme:
    pre = theme.split(start, 1)[0]
    post = theme.split(end, 1)[1]
    theme = pre + block + post.lstrip('\n')
else:
    theme = theme.rstrip() + '\n\n' + block
theme_path.write_text(theme)
PY
docker cp /tmp/bruna-login/theme.css "$C:/app/public/crm-industrial/theme.css"
docker cp "$C:/app/app/views/layouts/vueapp.html.erb" /tmp/bruna-login/vueapp.html.erb
python3 - <<'PY'
from pathlib import Path
path = Path('/tmp/bruna-login/vueapp.html.erb')
text = path.read_text()
if 'manifest.webmanifest' not in text:
    marker = 'theme.css'
    index = text.find(marker)
    if index == -1:
        raise SystemExit('theme.css ausente')
    line_start = text.rfind('\n', 0, index) + 1
    extra = (
        '    <link rel="manifest" href="/crm-industrial/manifest.webmanifest" />\n'
        '    <meta name="theme-color" content="#E6EDEA" />\n'
        '    <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#06171A" />\n'
    )
    text = text[:line_start] + extra + text[line_start:]
if 'fonts.bunny.net' not in text:
    marker = 'theme.css'
    index = text.find(marker)
    if index == -1:
        raise SystemExit('theme.css ausente')
    line_start = text.rfind('\n', 0, index) + 1
    font = '    <link rel="stylesheet" href="https://fonts.bunny.net/css?family=inter:400,500,600,700" />\n'
    text = text[:line_start] + font + text[line_start:]
if 'sidebar.js' not in text:
    marker = 'reactions.js'
    index = text.find(marker)
    if index == -1:
        raise SystemExit('reactions.js ausente')
    line_end = text.find('\n', index)
    script = '\n    <script src="/crm-industrial/sidebar.js?v=whatsapp-web-71" defer></script>'
    text = text[:line_end] + script + text[line_end:]
if 'theme-v3.css' not in text:
    marker = 'theme.css'
    index = text.find(marker)
    if index == -1:
        raise SystemExit('theme.css ausente')
    line_end = text.find('\n', index)
    link = '\n    <link rel="stylesheet" href="/crm-industrial/theme-v3.css?v=whatsapp-web-71" />'
    text = text[:line_end] + link + text[line_end:]
path.write_text(text)
PY
sed -i -E 's/whatsapp-web-[0-9]+/whatsapp-web-71/g' /tmp/bruna-login/vueapp.html.erb
docker cp /tmp/bruna-login/vueapp.html.erb "$C:/app/app/views/layouts/vueapp.html.erb"
docker restart "$C"
echo restarted
