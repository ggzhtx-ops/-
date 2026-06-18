import { readFile } from "node:fs/promises";

const js = await readFile("_astro/hoisted.CJiXW_YI.js", "utf8");
const re = /["'`]([^"'`]+?\.(?:buf|webp|png|jpg|exr|mp4|ogg))["'`]/g;
const paths = new Set();
let match;

while ((match = re.exec(js))) {
  paths.add(match[1]);
}

console.log(
  [...paths]
    .filter((path) => /rock|home|stickers|about|models|textures|sphere|line|cross/.test(path))
    .sort()
    .join("\n")
);
