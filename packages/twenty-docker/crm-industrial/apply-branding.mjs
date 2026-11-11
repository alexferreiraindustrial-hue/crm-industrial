// CRM Industrial: aplica a marca sobre o front ja compilado da imagem oficial do Twenty.
// Roda no build da imagem (Dockerfile). Falha se algum ponto de encaixe sumir numa versao nova.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const FRONT = '/app/packages/twenty-server/dist/front';
const ASSETS = join(FRONT, 'assets');
const NAME = 'CRM Industrial';
const ICON = '/crm-industrial/icon.svg';

const replaceRequired = (text, search, replacement, label) => {
  if (!text.includes(search)) {
    throw new Error(`Ponto de encaixe nao encontrado: ${label}`);
  }
  return text.split(search).join(replacement);
};

const findAsset = (pattern) => {
  const matches = readdirSync(ASSETS).filter((file) => pattern.test(file));
  if (matches.length === 0) {
    throw new Error(`Asset nao encontrado: ${pattern}`);
  }
  return matches.map((file) => join(ASSETS, file));
};

// 1. index.html: titulo, metatags, icones e tema
const indexPath = join(FRONT, 'index.html');
let html = readFileSync(indexPath, 'utf8');
html = replaceRequired(html, '<title>Twenty</title>', `<title>${NAME}</title>`, 'title');
html = replaceRequired(html, 'content="Twenty"', `content="${NAME}"`, 'og:title');
html = replaceRequired(html, 'content="A modern open-source CRM"', 'content="CRM para o setor industrial"', 'og:description');
html = html.replace(/href="\/images\/icons\/android\/android-launchericon-48-48\.png"/g, `href="${ICON}"`);
html = html.replace('type="image/x-icon"', 'type="image/svg+xml"');
html = html.replace(/<link rel="apple-touch-icon" href="[^"]*" \/>/, `<link rel="apple-touch-icon" href="${ICON}" />`);
html = html.replace(/https:\/\/raw\.githubusercontent\.com\/twentyhq\/twenty\/[^"]*/g, ICON);
html = replaceRequired(html, '</head>', '  <link rel="stylesheet" href="/crm-industrial/theme.css" />\n  </head>', 'head');
writeFileSync(indexPath, html);

// 2. manifest.json: nome do app instalado
const manifestPath = join(FRONT, 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest.name = NAME;
manifest.short_name = NAME;
manifest.icons = [{ src: ICON, sizes: 'any', type: 'image/svg+xml', purpose: 'any' }];
manifest.theme_color = '#1C1F24';
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

// 3. logo padrao do workspace (antes apontava para o site do Twenty)
for (const file of findAsset(/^DefaultWorkspaceLogo-.*\.js$/)) {
  const source = readFileSync(file, 'utf8');
  writeFileSync(
    file,
    replaceRequired(source, 'https://twentyhq.github.io/placeholder-images/workspaces/twenty-logo.png', ICON, 'logo padrao'),
  );
}

// 4. textos em portugues onde "Twenty" e o nome do produto (integracoes e MCP ficam como estao)
const PT_BR_REPLACEMENTS = [
  ['Bem-vindo ao Twenty', `Bem-vindo ao ${NAME}`],
  ['O Twenty funciona melhor com sua equipe', `O ${NAME} funciona melhor com sua equipe`],
  ['Página não encontrada | Twenty', `Página não encontrada | ${NAME}`],
  ['Ao usar o Twenty, você concorda com os', `Ao usar o ${NAME}, você concorda com os`],
  ['Campos do Twenty', `Campos do ${NAME}`],
  ['Modelo usado quando você conversa com o Twenty', `Modelo usado quando você conversa com o ${NAME}`],
  ['contate a equipe Twenty', `contate a equipe do ${NAME}`],
  ['entre em contato com a equipe Twenty', `entre em contato com a equipe do ${NAME}`],
  ['Recarregue as abas abertas do Twenty', `Recarregue as abas abertas do ${NAME}`],
  ['As personalizações feitas na interface do Twenty', `As personalizações feitas na interface do ${NAME}`],
  ['Importe os arquivos anexados para o Twenty', `Importe os arquivos anexados para o ${NAME}`],
  ['O Twenty adiciona as pessoas', `O ${NAME} adiciona as pessoas`],
  ['O Twenty os verifica automaticamente', `O ${NAME} os verifica automaticamente`],
];
for (const file of findAsset(/^pt-BR-.*\.js$/)) {
  let catalog = readFileSync(file, 'utf8');
  for (const [search, replacement] of PT_BR_REPLACEMENTS) {
    catalog = catalog.split(search).join(replacement);
  }
  writeFileSync(file, catalog);
}

console.log('CRM Industrial: marca aplicada.');

// 5. titulo padrao da aba, definido em JavaScript depois que o app carrega
for (const file of findAsset(/^index-.*\.js$/)) {
  let bundle = readFileSync(file, 'utf8');
  if (!bundle.includes('default:return"Twenty"}')) {
    continue;
  }
  bundle = replaceRequired(bundle, 'default:return"Twenty"}', `default:return"${NAME}"}`, 'titulo padrao');
  bundle = bundle.split('(()=>"Twenty")').join(`(()=>"${NAME}")`);
  writeFileSync(file, bundle);
}

console.log('CRM Industrial: titulo aplicado.');
