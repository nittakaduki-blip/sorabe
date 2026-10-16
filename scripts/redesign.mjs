import fs from 'node:fs';
const file='public/sorabe.html';
let html=fs.readFileSync(file,'utf8');
if(html.includes('experience-editorial.css'))throw Error('Already applied');
html=html.replace('</head>','<link rel="stylesheet" href="assets/experience-editorial.css">\n</head>');
html=html.replace('<script src="assets/night-experience-v8.js" defer></script>','');
html=html.replaceAll('assets/night-house-sign-v17.png','assets/aerial.webp').replace('type="image/png" fetchpriority','type="image/webp" fetchpriority');
html=html.replaceAll('assets/billiards-guests-corrected-v13.png','assets/billiards.webp').replaceAll('assets/table-tennis-guests-slippers-v12.png','assets/table-tennis-new.webp');
html=html.replaceAll('館内で卓球を楽しむ宿泊者','館内に設置された卓球台').replaceAll('館内でビリヤードを楽しむ宿泊者','森に面したビリヤードスペース').replaceAll('プライベートコテージ宙辺の看板がある、コテージ入口の夜景','森に囲まれた宙辺のコテージと隣接する日原天文台');
html=html.replace(/<div id="site-loader"[\s\S]*?<canvas id="night-dust" aria-hidden="true"><\/canvas>/,'');
html=html.replaceAll('>コンセプト</a>','>宙辺での過ごし方</a>');
const begin=html.indexOf('    <section id="concept"');
const end=html.indexOf('    <section id="facility"',begin);
if(begin<0||end<0)throw Error('Section not found');
const steps=[
 ['15:00','一棟の鍵を開けて、旅のはじまり。','デジタルキーでチェックイン。荷物を置いたら、リビングでひと息。今日の予定は、集まったみんなで決めましょう。','living.webp','大きな窓のある宙辺のリビング','解錠用の暗証番号は、ご予約後にご案内します。'],
 ['16:00','「もう一回」が続く、午後。','卓球の相手を探したり、棚からボードゲームを選んだり。外に出かけない時間も、一緒に楽しむ時間になります。','table-tennis-new.webp','館内の卓球台','卓球・ボードゲーム・プロジェクターは宿泊料金に含まれます。'],
 ['17:30','夕食は、みんなで焼きながら。','好きな食材を持ち寄ってバーベキュー。焼く人、取り分ける人、食べる人。食卓を囲む時間も、旅の思い出に。','bbq.webp','バーベキューを楽しむ様子','BBQグリルは税込5,500円。食材・炭等はご持参ください。写真はバーベキューのイメージです。'],
 ['食後','火を囲んで、話の続きを。','屋外の椅子に腰を下ろし、焚き火を囲んでひと休み。遊んだことや明日の予定を、ゆっくり話す時間に。','bbq-outdoor-new.webp','天文台を望む屋外の椅子と焚き火台','焚き火台は税込5,500円。薪等はご持参ください。天候により利用できない場合があります。'],
 ['夜','望遠鏡の先に、今日の星空。','隣接する日原天文台へ。星を見たあとは、そのまま宙辺へ戻ってくつろげます。帰りの移動を気にせず、夜まで楽しむ旅を。','observatory-night-v17.jpg','星空と日原天文台','観望は天候・開館状況によります。利用条件・料金は天文台へご確認ください。'],
 ['朝 — 10:00','朝はゆっくり、帰り支度。','目を覚ましたら、リビングで昨日の話を。荷物をまとめて、10時にチェックアウト。帰り道に津和野の町をめぐるのもおすすめです。','cottage-interior-new.webp','緑を望む明るい館内','朝食の提供はありません。食事の準備を含め、事前にご確認ください。']
];
const timeline=steps.map(([time,title,copy,img,alt,note],i)=>`<article class="journey-step ${i===4?'journey-night':''}"><figure><img src="assets/${img}" alt="${alt}" loading="lazy" decoding="async"></figure><div class="journey-copy"><p class="journey-time">${time}</p><h3>${title}</h3><p>${copy}</p><small>${note}</small>${i===4?'<a href="https://www.kankou-shimane.com/destination/20995" target="_blank" rel="noopener noreferrer">日原天文台のご利用案内 ↗</a>':''}</div></article>`).join('\n');
html=html.slice(0,begin)+`<aside class="renovation-notice"><strong>施設改修に関するご案内</strong><p>改修に伴い、ご利用いただけるお部屋・人数が変わる場合があります。宿泊をご検討の方は、ご予約前に営業状況をご確認ください。</p><a href="contact.html">営業状況を問い合わせる →</a></aside>
<section id="concept" class="editorial-intro"><p class="eyebrow">宙辺で過ごす、一泊二日</p><h2>集まって、遊んで。<br>星を見て、泊まる。</h2><p>島根県津和野町、日原天文台のすぐ隣。<br>森の中の一棟を、家族や仲間と貸し切って。<br>宙辺での一日を、少し想像してみませんか。</p><a href="#journey">一日の過ごし方を見る ↓</a></section>
<section id="journey" class="journey"><header><p class="eyebrow">過ごし方の一例</p><h2>今日の予定は、<br>みんなと決める。</h2><p>以下はモデルプランです。天文台の開館時間や天候に合わせて、食事・焚き火・観望の順番を調整してください。</p></header>${timeline}<div class="journey-stars" aria-label="宙辺周辺の星空写真"><img src="assets/star-pole-v19.jpg" alt="山の稜線と星空" loading="lazy"><img src="assets/milkyway-sign-v19.jpg" alt="日原天文台と天の川" loading="lazy"></div></section>
`+html.slice(end);
// Preserve all room information and modal functionality while removing duplicate sales blocks.
html=html.replace(/<div class="family-stay__scenes">[\s\S]*?<p class="family-stay__note">/,'<p class="family-stay__note">');
html=html.replaceAll('Airbnbで予約','空室確認・ご予約');
html=html.replace("const BOOKING_URL='https://www.airbnb.jp/rooms/1467763166258402344'","const BOOKING_URL='reservation.html'");
html=html.replace("link.target='_blank';link.rel='noopener'","link.removeAttribute('target');link.removeAttribute('rel')");
// Without JavaScript the same booking destination must remain available.
html=html.replace(/href="https:\/\/www.airbnb.jp\/rooms\/1467763166258402344"([^>]*data-booking)/g,'href="reservation.html"$1');
html=html.replaceAll('http://www.sun-net.jp/~polaris/top.htm','https://www.kankou-shimane.com/destination/20995').replace('公式サイトを確認 ↗','島根県公式のご利用案内 ↗');
const tax=`<section id="furusato" class="furusato"><p class="eyebrow">ふるさと納税で、宙辺へ</p><h2>津和野を応援して、<br>次の旅を宙辺に。</h2><p>宙辺の宿泊補助券が、津和野町の返礼品に掲載されています。寄附前に、利用期限・対象プラン・予約方法・営業状況を各掲載ページでご確認ください。</p><div class="tax-links"><a href="https://www.furusato-tax.jp/product/detail/32501/6667108/40" target="_blank" rel="noopener noreferrer">ふるさとチョイス ↗</a><a href="https://item.rakuten.co.jp/f325015-tsuwano/1648971/" target="_blank" rel="noopener noreferrer">楽天ふるさと納税 ↗</a><a href="https://store.shopping.yahoo.co.jp/y-sf/1648971.html" target="_blank" rel="noopener noreferrer">Yahoo!ショッピング（さとふる） ↗</a></div><small>宿泊補助券の購入だけでは宿泊予約は完了しません。利用希望の旨を施設へお伝えください。</small></section>`;
html=html.replace('    <section id="experience"',tax+'\n    <section id="experience"');
fs.writeFileSync(file,html);
