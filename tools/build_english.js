// Build English pages from the Japanese source and the translation table.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');
const pairs = fs.readFileSync(path.join(root, 'translations', 'en.tsv'), 'utf8').split(/\r?\n/)
  .filter(line => line && !line.startsWith('#'))
  .map(line => { const tab = line.indexOf('\t'); return [line.slice(0, tab), line.slice(tab + 1)]; })
  .sort((a, b) => b[0].length - a[0].length);
const pages = ['sorabe', 'reservation', 'contact', 'legal', 'privacy', 'terms', 'chillnn'];
const url = 'https://sorabe-tsuwano.github.io/';
for (const page of pages) {
  let html = fs.readFileSync(path.join(pub, `${page}.html`), 'utf8');
  html = html.replace('lang="ja"', 'lang="en"');
  html = html.replaceAll('https://nittakaduki-blip.github.io/sorabe/', url);
  for (const [ja, en] of pairs) html = html.replaceAll(ja, en);
  for (const route of ['reservation', 'contact', 'legal', 'privacy', 'terms', 'chillnn']) {
    html = html.replaceAll(`href="${route}.html"`, `href="${route}-en.html"`);
    html = html.replaceAll(`'${route}.html'`, `'${route}-en.html'`);
  }
  html = html.replaceAll('href="./"', 'href="en.html"');
  html = html.replaceAll('href="/#furusato"', 'href="en.html#furusato"');
  const englishAddress = '801-8 Makurase, Tsuwano, Kanoashi District, Shimane, Japan';
  html = html.replaceAll(`query=${englishAddress}`, `query=${encodeURIComponent(englishAddress)}`);
  html = html.replaceAll(`q=${englishAddress}`, `q=${encodeURIComponent(englishAddress)}`);
  if (page === 'sorabe') {
    html = html.replace('content="ja_JP"', 'content="en_US"');
    html = html.replace('href="https://sorabe-tsuwano.github.io/"', 'href="https://sorabe-tsuwano.github.io/en.html"');
    html = html.replaceAll('content="https://sorabe-tsuwano.github.io/"', 'content="https://sorabe-tsuwano.github.io/en.html"');
    html = html.replace('"url":"https://sorabe-tsuwano.github.io/"', '"url":"https://sorabe-tsuwano.github.io/en.html"');
    html = html.replace('href="en.html" lang="en" aria-label="View English site"', 'href="index.html" lang="ja" aria-label="View Japanese site"');
    html = html.replace('>EN</a>', '>JP</a>');
    html = html.replace('href="en.html" lang="en">English / EN</a>', 'href="index.html" lang="ja">Japanese / JP</a>');
    html = html.replace('hreflang="en" href="https://sorabe-tsuwano.github.io/en.html"', 'hreflang="ja" href="https://sorabe-tsuwano.github.io/"');
    html = html.replace('<span class="booking-long">Check availability and plans</span>', '<span class="booking-long">Book your stay</span>');
    html = html.replace("url:'https://sorabe-tsuwano.github.io/'", "url:'https://sorabe-tsuwano.github.io/en.html'");
    html = html.replace('<small class="mt-1 text-[8px] tracking-[.5em]">SORABE</small>', '<small class="mt-1 text-[8px] tracking-[.5em]">TSUWANO</small>');
    html = html.replace('<p class="mt-5 text-xs tracking-[.65em]">SORABE</p>', '<p class="mt-5 text-xs tracking-[.65em]">TSUWANO</p>');
    html = html.replace('</head>', '<style>html[lang="en"] .journey-title-line{white-space:normal}html[lang="en"] #facility .whitespace-nowrap{white-space:normal}html[lang="en"] .journey-copy{max-width:520px}@media(min-width:1280px){html[lang="en"] #header>nav{gap:.7rem;font-size:10px;letter-spacing:.08em}html[lang="en"] #header .header-actions{gap:.5rem}html[lang="en"] #header [data-booking]{padding:.75rem 1rem}html[lang="en"] #header .instagram-label{display:none}}</style></head>');
  } else {
    html = html.replace(/(<nav class="page-utility"[^>]*>)/, `$1<a href="${page}.html" lang="ja">Japanese / JP</a>`);
    html = html.replace(`https://sorabe-tsuwano.github.io/${page}.html`, `https://sorabe-tsuwano.github.io/${page}-en.html`);
    html = html.replace('rel="canonical"', `rel="alternate" hreflang="ja" href="${url}${page}.html"><link rel="canonical"`);
  }
  if (page === 'chillnn') html = html.replace('</main>', '<p><a href="chillnn.html" lang="ja">Japanese / JP</a></p></main>');
  html = html.replaceAll('subject=SORABEContact', 'subject=SORABE%20inquiry');
  html = html.replaceAll('<small class="font-sans text-[9px]">SORABE</small>', '<small class="font-sans text-[9px]">TSUWANO</small>');
  html = html.replace(/[ \t]+(?=\r?$)/gm, '').trimEnd() + '\n';
  const destination = path.join(pub, page === 'sorabe' ? 'en.html' : `${page}-en.html`);
  fs.writeFileSync(destination, html);
  console.log(path.relative(root, destination));
}
fs.copyFileSync(path.join(pub, 'sorabe.html'), path.join(pub, 'index.html'));
