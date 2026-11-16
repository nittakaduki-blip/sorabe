import { cpSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const publicDirectory = fileURLToPath(new URL("../public/", import.meta.url));
const outputDirectory = fileURLToPath(new URL("../dist/", import.meta.url));

rmSync(outputDirectory, { recursive: true, force: true });
mkdirSync(outputDirectory, { recursive: true });
cpSync(publicDirectory, outputDirectory, { recursive: true });
cpSync(
  fileURLToPath(new URL("../public/sorabe.html", import.meta.url)),
  fileURLToPath(new URL("../dist/index.html", import.meta.url)),
);
