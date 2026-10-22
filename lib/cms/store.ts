import { env } from "cloudflare:workers";
import { defaultCmsContent, normalizeCmsContent, type CmsContent } from "./content";

const CONTENT_KEY = "cms/site-content.json";

function bucket(): R2Bucket | null {
  try {
    return (env as unknown as { BUCKET?: R2Bucket }).BUCKET ?? null;
  } catch {
    return null;
  }
}

export async function getCmsContent(): Promise<CmsContent> {
  const storage = bucket();
  if (!storage) return defaultCmsContent;
  const object = await storage.get(CONTENT_KEY);
  if (!object) return defaultCmsContent;
  try {
    return normalizeCmsContent(await object.json());
  } catch {
    return defaultCmsContent;
  }
}

export async function saveCmsContent(value: unknown): Promise<CmsContent> {
  const storage = bucket();
  if (!storage) throw new Error("CMS storage is not available.");
  const content = normalizeCmsContent({
    ...(value && typeof value === "object" ? value : {}),
    updatedAt: new Date().toISOString(),
  });
  await storage.put(CONTENT_KEY, JSON.stringify(content), {
    httpMetadata: { contentType: "application/json; charset=utf-8" },
  });
  return content;
}
