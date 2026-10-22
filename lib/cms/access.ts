const CMS_OWNER_IDS = new Set(["4e970497-5a77-44de-a9ed-008ab02b24b5"]);

export function cmsAccess(headers: Headers) {
  const userId = headers.get("oai-authenticated-user-id");
  const email = headers.get("oai-authenticated-user-email");
  const localPreview = process.env.NODE_ENV !== "production" && userId === "local_seedy";
  return {
    authenticated: Boolean(userId),
    authorized: Boolean(userId && (CMS_OWNER_IDS.has(userId) || localPreview)),
    email,
  };
}
