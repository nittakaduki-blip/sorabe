import { cmsAccess } from "../../../lib/cms/access";
import { getCmsContent, saveCmsContent } from "../../../lib/cms/store";

function denied(headers: Headers) {
  const access = cmsAccess(headers);
  if (!access.authenticated) return Response.json({ error: "ログインが必要です。" }, { status: 401 });
  if (!access.authorized) return Response.json({ error: "この管理画面を編集する権限がありません。" }, { status: 403 });
  return null;
}

export async function GET(request: Request) {
  const rejection = denied(request.headers);
  if (rejection) return rejection;
  return Response.json(await getCmsContent(), { headers: { "cache-control": "no-store" } });
}

export async function PUT(request: Request) {
  const rejection = denied(request.headers);
  if (rejection) return rejection;
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 128_000) return Response.json({ error: "送信内容が大きすぎます。" }, { status: 413 });
  try {
    const content = await saveCmsContent(await request.json());
    return Response.json(content, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("CMS save failed", error);
    return Response.json({ error: "保存できませんでした。時間をおいて再度お試しください。" }, { status: 500 });
  }
}
