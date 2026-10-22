import sorabeHtml from "../public/sorabe.html?raw";
import { getCmsContent } from "../lib/cms/store";

export async function GET() {
  const content = await getCmsContent();
  const safeJson = JSON.stringify(content).replaceAll("<", "\\u003c");
  const cmsPayload = `<script id="cms-content-json" type="application/json">${safeJson}</script><script src="/assets/cms-runtime.js" defer></script>`;
  const html = sorabeHtml.replace("</body>", `${cmsPayload}</body>`);
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-cache",
    },
  });
}
