import type { Metadata } from 'next';
import './globals.css';

const siteUrl = 'https://nittakaduki-blip.github.io/sorabe/';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: '宙辺 -SORABE-｜日原天文台に隣接する一棟貸切宿',
  description: '島根県津和野町、日原天文台に隣接する一日一組限定のプライベート貸切コテージ。',
  openGraph: {
    title: '宙辺 -SORABE-',
    description: '宇宙のほとりで、眠る。一日一組限定のプライベート貸切コテージ。',
    url: siteUrl,
    siteName: '宙辺 -SORABE-',
    images: [{ url: 'assets/og-sorabe.jpg', width: 1200, height: 630 }],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: '宙辺 -SORABE-', description: '宇宙のほとりで、眠る。一日一組限定のプライベート貸切コテージ。', images: ['assets/og-sorabe.jpg'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}

