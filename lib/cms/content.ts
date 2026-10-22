export type JourneyStep = {
  time: string;
  titleLines: string[];
  body: string;
  note: string;
};

export type CmsContent = {
  hero: {
    tagline: string;
    introLines: string[];
  };
  journey: {
    headingLines: string[];
    intro: string;
    steps: JourneyStep[];
  };
  tourism: {
    headingLines: string[];
    tsuwanoTitle: string;
    tsuwanoBody: string;
    observatoryTitle: string;
    observatoryBody: string;
  };
  updatedAt: string | null;
};

export const defaultCmsContent: CmsContent = {
  hero: {
    tagline: "星を待つ時間まで、思い出になる。",
    introLines: [
      "日原天文台に隣接する、一棟貸しの宿。",
      "気の合う人と食卓を囲み、夜空を見上げる。",
      "宙辺で過ごす、いつもと少し違う一泊。",
    ],
  },
  journey: {
    headingLines: ["今日の予定は、", "みんなと決める。"],
    intro: "現在利用できる設備を中心にしたモデルプランです。天文台の開館時間や天候に合わせて、食事・焚き火・観望の順番を調整してください。宿泊日の設備・人数制限は予約前にご確認ください。",
    steps: [
      { time: "15:00 ごろ", titleLines: ["一棟の鍵を開けて、", "旅のはじまり。"], body: "デジタルキーでチェックイン。荷物を置いたら、リビングでひと息。今日の予定は、集まったみんなで決めましょう。", note: "解錠用の暗証番号は、ご予約後にご案内します。チェックイン時刻はプランでご確認ください。" },
      { time: "16:00 — 18:30", titleLines: ["夕暮れまで、", "津和野をめぐる。"], body: "城下町を歩き、気になる店や景色に立ち寄る。宿へ戻る時間を決めたら、それぞれのペースで津和野の町を楽しみましょう。", note: "各施設の開館時間・休館日は、お出かけ前にご確認ください。" },
      { time: "18:30 — 20:00", titleLines: ["宿に戻ったら、", "みんなで夕食を。"], body: "好きな食材を持ち寄って、焼く人、取り分ける人、食べる人。食卓を囲む時間も、旅の思い出に。", note: "BBQグリルは税込5,500円。食材・炭等はご持参ください。写真はバーベキューのイメージです。" },
      { time: "20:00 — 21:00", titleLines: ["食後は、火を囲んで", "話の続きを。"], body: "屋外の椅子に腰を下ろし、焚き火を囲んでひと休み。今日見つけた景色や明日の予定を、ゆっくり話す時間に。", note: "焚き火台は税込5,500円。薪等はご持参ください。天候により利用できない場合があります。" },
      { time: "21:00 — 22:00", titleLines: ["望遠鏡の先に、", "今日の星空。"], body: "隣接する日原天文台へ。宿のすぐそばで、夜空を見上げる時間を楽しめます。", note: "観望は天候・開館状況によります。利用条件・料金は天文台へご確認ください。" },
      { time: "22:00 ごろ", titleLines: ["星を見たあとは、", "館内でもうひと遊び。"], body: "宙辺へ戻ったら、卓球やビリヤードを。夜の続きを、室内で気兼ねなく楽しめます。", note: "卓球は宿泊料金に含まれます。ビリヤードは有料の室内オプションです。" },
      { time: "朝 — 10:00", titleLines: ["朝はゆっくり、", "帰り支度。"], body: "目を覚ましたら、リビングで昨日の話を。荷物をまとめて、10時にチェックアウト。帰り道に津和野の町をめぐるのもおすすめです。", note: "朝食の提供はありません。食事の準備を含め、事前にご確認ください。" },
    ],
  },
  tourism: {
    headingLines: ["宙辺から、", "津和野をめぐる。"],
    tsuwanoTitle: "津和野をめぐる",
    tsuwanoBody: "城下町の散策や周辺観光を楽しんだあと、一棟貸切の宙辺でゆっくりとお過ごしください。",
    observatoryTitle: "日原天文台",
    observatoryBody: "宙辺に隣接する天文台です。休館日・開館時間・観望内容は公式サイトでご確認ください。",
  },
  updatedAt: null,
};

const cleanText = (value: unknown, fallback: string, max = 600) =>
  typeof value === "string" ? value.trim().slice(0, max) || fallback : fallback;

const cleanLines = (value: unknown, fallback: string[], maxLines = 3) => {
  if (!Array.isArray(value)) return fallback;
  const lines = value
    .filter((line): line is string => typeof line === "string")
    .map((line) => line.trim().slice(0, 90))
    .filter(Boolean)
    .slice(0, maxLines);
  return lines.length ? lines : fallback;
};

export function normalizeCmsContent(value: unknown): CmsContent {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const hero = input.hero && typeof input.hero === "object" ? input.hero as Record<string, unknown> : {};
  const journey = input.journey && typeof input.journey === "object" ? input.journey as Record<string, unknown> : {};
  const tourism = input.tourism && typeof input.tourism === "object" ? input.tourism as Record<string, unknown> : {};
  const rawSteps = Array.isArray(journey.steps) ? journey.steps : [];

  return {
    hero: {
      tagline: cleanText(hero.tagline, defaultCmsContent.hero.tagline, 100),
      introLines: cleanLines(hero.introLines, defaultCmsContent.hero.introLines),
    },
    journey: {
      headingLines: cleanLines(journey.headingLines, defaultCmsContent.journey.headingLines, 2),
      intro: cleanText(journey.intro, defaultCmsContent.journey.intro),
      steps: defaultCmsContent.journey.steps.map((fallback, index) => {
        const step = rawSteps[index] && typeof rawSteps[index] === "object" ? rawSteps[index] as Record<string, unknown> : {};
        return {
          time: cleanText(step.time, fallback.time, 40),
          titleLines: cleanLines(step.titleLines, fallback.titleLines, 2),
          body: cleanText(step.body, fallback.body),
          note: cleanText(step.note, fallback.note),
        };
      }),
    },
    tourism: {
      headingLines: cleanLines(tourism.headingLines, defaultCmsContent.tourism.headingLines, 2),
      tsuwanoTitle: cleanText(tourism.tsuwanoTitle, defaultCmsContent.tourism.tsuwanoTitle, 80),
      tsuwanoBody: cleanText(tourism.tsuwanoBody, defaultCmsContent.tourism.tsuwanoBody),
      observatoryTitle: cleanText(tourism.observatoryTitle, defaultCmsContent.tourism.observatoryTitle, 80),
      observatoryBody: cleanText(tourism.observatoryBody, defaultCmsContent.tourism.observatoryBody),
    },
    updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : null,
  };
}
