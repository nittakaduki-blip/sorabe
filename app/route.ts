import sorabeHtml from "../public/sorabe.html?raw";

export async function GET() {
  return new Response(sorabeHtml, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
