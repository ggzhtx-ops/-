import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const roots = ["assets"];
const binaryExtensions = new Set([".buf", ".webp", ".png", ".jpg", ".jpeg", ".mp4", ".ogg", ".woff", ".woff2", ".ico", ".exr"]);

async function walk(dir, files = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path, files);
    else files.push(path);
  }
  return files;
}

function extname(path) {
  const i = path.lastIndexOf(".");
  return i === -1 ? "" : path.slice(i).toLowerCase();
}

const bad = [];
for (const root of roots) {
  for (const file of await walk(root)) {
    if (!binaryExtensions.has(extname(file))) continue;
    const buffer = await readFile(file);
    const head = buffer.subarray(0, 32).toString("utf8");
    const info = await stat(file);
    if (head.startsWith("<!DOCTYPE") || head.startsWith("<html") || head.includes("<!DOCTYPE")) {
      bad.push({ path: `/${relative(".", file).replaceAll("\\", "/")}`, bytes: info.size });
    }
  }
}

const output = JSON.stringify(bad, null, 2);
await writeFile("bad-assets.json", output);
console.log(output);
