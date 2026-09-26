import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "tailwindcss";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const tailwindDir = path.join(root, "node_modules", "tailwindcss");
const [theme, preflight, publicFiles] = await Promise.all([
  readFile(path.join(tailwindDir, "theme.css"), "utf8"),
  readFile(path.join(tailwindDir, "preflight.css"), "utf8"),
  readdir(publicDir),
]);

const candidates = new Set([
  "bg-night/95",
  "object-cover",
  "object-contain",
  "grid",
  "grid-cols-[90px_1fr]",
  "py-4",
]);

for (const filename of publicFiles.filter((name) => name.endsWith(".html"))) {
  const html = await readFile(path.join(publicDir, filename), "utf8");
  for (const match of html.matchAll(/(?:class|className)="([^"]+)"/g)) {
    for (const token of match[1].split(/\s+/)) if (token) candidates.add(token);
  }
  for (const match of html.matchAll(/classList\.(?:add|remove|toggle)\(\s*['"]([^'"]+)['"]/g)) {
    candidates.add(match[1]);
  }
}

const input = `
@layer theme, base, components, utilities;
${theme}
@layer base { ${preflight} }
@theme {
  --color-night: #071014;
  --color-moon: #f2efe7;
  --color-forest: #243a32;
  --color-earth: #a58d70;
  --font-serif: "Yu Mincho", "Hiragino Mincho ProN", serif;
  --font-sans: "Helvetica Neue", "Yu Gothic", sans-serif;
  --tracking-lux: .22em;
}
@tailwind utilities;
`;

const compiler = await compile(input);
const output = compiler.build([...candidates].sort());
await writeFile(path.join(publicDir, "assets", "tailwind-built-v15.css"), output);
console.log(`Built Tailwind CSS with ${candidates.size} candidates.`);
