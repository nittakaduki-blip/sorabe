import fs from 'node:fs';
let r=fs.readFileSync('public/reservation.html','utf8');
r=r.replace('<div class="mt-14 grid','<section style="margin-top:40px;padding:28px;border:1px solid #ffffff40"><p>新しい予約窓口</p><h2 style="font-size:24px;margin:12px 0">CHILLNN — 予約準備中</h2><p style="line-height:2">CHILLNNの受付開始まで、既存の窓口から空室・営業状況をお問い合わせください。</p><a href="chillnn.html" style="display:inline-block;margin-top:18px;text-decoration:underline">準備状況とお問い合わせ先 →</a></section><div class="mt-14 grid');
fs.writeFileSync('public/reservation.html',r);
let h=fs.readFileSync('public/sorabe.html','utf8');
h=h.replace('<span class="booking-short">予約</span>','<span class="booking-short">予約</span>');
// Keep official social links only; no placeholder or invented X/Facebook accounts.
h=h.replace('空室・料金を確認して予約へ','予約方法・CHILLNNの準備状況を見る');
fs.writeFileSync('public/sorabe.html',h);
