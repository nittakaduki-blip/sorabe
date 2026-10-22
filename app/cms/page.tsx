import { headers } from "next/headers";
import Link from "next/link";
import { cmsAccess } from "../../lib/cms/access";
import { getCmsContent } from "../../lib/cms/store";
import CmsEditor from "./CmsEditor";
import styles from "./cms.module.css";

export const dynamic = "force-dynamic";

export default async function CmsPage() {
  const requestHeaders = await headers();
  const access = cmsAccess(requestHeaders);

  if (!access.authenticated) {
    return <main className={styles.gate}><p className={styles.kicker}>SORABE CONTENT MANAGEMENT</p><h1>宙辺 CMS</h1><p>編集するには、管理者アカウントでログインしてください。</p><a href="/signin-with-chatgpt?return_to=%2Fcms">管理者としてログイン</a></main>;
  }
  if (!access.authorized) {
    return <main className={styles.gate}><p className={styles.kicker}>SORABE CONTENT MANAGEMENT</p><h1>アクセスできません</h1><p>{access.email || "現在のアカウント"} には、このサイトを編集する権限がありません。</p><Link href="/">公開ページへ戻る</Link></main>;
  }

  return <CmsEditor initialContent={await getCmsContent()} />;
}
