"use client";

import { useState } from "react";
import type { CmsContent, JourneyStep } from "../../lib/cms/content";
import styles from "./cms.module.css";

const joinLines = (lines: string[]) => lines.join("\n");
const splitLines = (value: string) => value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

export default function CmsEditor({ initialContent }: { initialContent: CmsContent }) {
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const updateStep = (index: number, patch: Partial<JourneyStep>) => {
    setContent((current) => ({
      ...current,
      journey: {
        ...current.journey,
        steps: current.journey.steps.map((step, stepIndex) => stepIndex === index ? { ...step, ...patch } : step),
      },
    }));
  };

  const save = async () => {
    setSaving(true);
    setStatus("保存しています…");
    try {
      const response = await fetch("/api/cms", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(content),
      });
      const result = await response.json() as CmsContent & { error?: string };
      if (!response.ok) throw new Error(result.error || "保存できませんでした。");
      setContent(result);
      setStatus("保存しました。公開ページを再読み込みすると反映されます。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "保存できませんでした。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div><p className={styles.kicker}>SORABE CONTENT MANAGEMENT</p><h1>宙辺 CMS</h1><p>トップページの主要な文章と、1泊のスケジュールを編集できます。</p></div>
        <div className={styles.actions}><a href="/" target="_blank" rel="noreferrer">公開ページを見る ↗</a><button type="button" onClick={save} disabled={saving}>{saving ? "保存中…" : "変更を保存"}</button></div>
      </header>

      <section className={styles.card}>
        <div className={styles.sectionHeading}><span>01</span><div><h2>ファーストビュー</h2><p>サイトを開いて最初に表示される文章です。</p></div></div>
        <label>キャッチコピー<input value={content.hero.tagline} onChange={(event) => setContent({ ...content, hero: { ...content.hero, tagline: event.target.value } })} /></label>
        <label>紹介文 <small>改行したい位置で行を分けてください</small><textarea rows={4} value={joinLines(content.hero.introLines)} onChange={(event) => setContent({ ...content, hero: { ...content.hero, introLines: splitLines(event.target.value) } })} /></label>
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHeading}><span>02</span><div><h2>一泊の過ごし方</h2><p>見出しは1行ごとに入力すると、意図した位置で改行されます。</p></div></div>
        <label>セクション見出し<textarea rows={2} value={joinLines(content.journey.headingLines)} onChange={(event) => setContent({ ...content, journey: { ...content.journey, headingLines: splitLines(event.target.value) } })} /></label>
        <label>セクション説明<textarea rows={4} value={content.journey.intro} onChange={(event) => setContent({ ...content, journey: { ...content.journey, intro: event.target.value } })} /></label>
        <div className={styles.steps}>
          {content.journey.steps.map((step, index) => (
            <fieldset key={index}>
              <legend>{String(index + 1).padStart(2, "0")} / {step.time}</legend>
              <label>時刻<input value={step.time} onChange={(event) => updateStep(index, { time: event.target.value })} /></label>
              <label>タイトル <small>改行したい位置で行を分けてください</small><textarea rows={2} value={joinLines(step.titleLines)} onChange={(event) => updateStep(index, { titleLines: splitLines(event.target.value) })} /></label>
              <label>本文<textarea rows={3} value={step.body} onChange={(event) => updateStep(index, { body: event.target.value })} /></label>
              <label>補足<textarea rows={2} value={step.note} onChange={(event) => updateStep(index, { note: event.target.value })} /></label>
            </fieldset>
          ))}
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHeading}><span>03</span><div><h2>周辺観光</h2><p>「津和野をめぐる」と天文台の紹介文です。</p></div></div>
        <label>セクション見出し<textarea rows={2} value={joinLines(content.tourism.headingLines)} onChange={(event) => setContent({ ...content, tourism: { ...content.tourism, headingLines: splitLines(event.target.value) } })} /></label>
        <div className={styles.columns}>
          <div><h3>津和野</h3><label>タイトル<input value={content.tourism.tsuwanoTitle} onChange={(event) => setContent({ ...content, tourism: { ...content.tourism, tsuwanoTitle: event.target.value } })} /></label><label>本文<textarea rows={4} value={content.tourism.tsuwanoBody} onChange={(event) => setContent({ ...content, tourism: { ...content.tourism, tsuwanoBody: event.target.value } })} /></label></div>
          <div><h3>日原天文台</h3><label>タイトル<input value={content.tourism.observatoryTitle} onChange={(event) => setContent({ ...content, tourism: { ...content.tourism, observatoryTitle: event.target.value } })} /></label><label>本文<textarea rows={4} value={content.tourism.observatoryBody} onChange={(event) => setContent({ ...content, tourism: { ...content.tourism, observatoryBody: event.target.value } })} /></label></div>
        </div>
      </section>

      <footer className={styles.footer}><p role="status" aria-live="polite">{status}</p><button type="button" onClick={save} disabled={saving}>{saving ? "保存中…" : "変更を保存"}</button></footer>
    </main>
  );
}
