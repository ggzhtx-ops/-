import { readFile } from "node:fs/promises";

const js = await readFile("_astro/hoisted.CJiXW_YI.js", "utf8");
const matches = [
  ...js.matchAll(/(["'`])([^"'`]{0,180}?(?:assets|smaa|\.ogg|\.png|\.webp|\.glb|\.exr|\.bin|TEXTURE_PATH|AUDIO_PATH)[^"'`]{0,180}?)\1/g),
].map((match) => match[2]);

console.log([...new Set(matches)].sort().join("\n"));

console.log("\n--- file literals ---");
const files = [...js.matchAll(/(["'])([^"']+?\.(?:glb|bin|exr|webp|png|jpe?g|ogg|mp4))\1/g)].map((match) => match[2]);
console.log([...new Set(files)].sort().join("\n"));
