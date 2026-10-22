import { getCmsContent } from "../../../lib/cms/store";

export async function GET() {
  return Response.json(await getCmsContent(), {
    headers: { "cache-control": "no-cache" },
  });
}
