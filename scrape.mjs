import { mkdir, writeFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootUrl = "https://lusion.co";
const pageUrl = `${rootUrl}/about`;
const outDir = dirname(fileURLToPath(import.meta.url));

process.env.HTTP_PROXY = "";
process.env.HTTPS_PROXY = "";
process.env.ALL_PROXY = "";

async function saveUrl(url, path) {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
      accept: "*/*",
    },
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  const target = join(outDir, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, buffer);
  return buffer;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function publicPathFromUrl(url) {
  const parsed = new URL(url);
  let path = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
  if (!path) return "index.html";
  const filename = path.split("/").pop() || "";
  if (path.endsWith("/") || !filename.includes(".")) path = `${path.replace(/\/$/, "")}/index.html`;
  return path;
}

function extractUrls(text, sourcePath = "") {
  const isMarkup = /\.(?:html?|xml|svg)$|^$/.test(sourcePath);
  const attrs = isMarkup
    ? [...text.matchAll(/\b(?:src|href|content)=["']([^"']+)["']/gi)].map((m) => m[1])
    : [];
  const srcsets = [...text.matchAll(/\bsrcset=["']([^"']+)["']/gi)]
    .flatMap((m) => m[1].split(","))
    .map((part) => part.trim().split(/\s+/)[0]);
  const cssUrls = [...text.matchAll(/url\((?:"([^"]+)"|'([^']+)'|([^)'"]+))\)/gi)].map((m) => m[1] || m[2] || m[3]);
  const assetStrings = [
    ...text.matchAll(
      /["'`]((?:\.{0,2}\/)?(?:assets|_astro)\/[^"'`?#\s)]+?\.(?:avif|bin|css|exr|gif|glb|gltf|ico|jpg|jpeg|js|json|mp3|mp4|png|svg|webm|webmanifest|webp|woff|woff2|xml))["'`]/gi,
    ),
  ].map((m) => m[1]);

  return unique([...attrs, ...srcsets, ...cssUrls, ...assetStrings])
    .map((value) => value.trim())
    .filter((value) => !value.startsWith("data:") && !value.startsWith("mailto:") && !value.startsWith("tel:"))
    .map((value) => value.replace(/^\.\//, "/").replace(/^\.\.\//, "/"))
    .filter((value) => value.startsWith("/") || value.startsWith("http") || value.startsWith("assets/") || value.startsWith("_astro/"))
    .map((value) => new URL(value, pageUrl).href)
    .filter((url) => new URL(url).origin === rootUrl);
}

const htmlBuffer = await saveUrl(pageUrl, "about/index.html");
const html = htmlBuffer.toString("utf8");

const manifest = [];
const seen = new Set([pageUrl]);
let queue = extractUrls(html, "about/index.html");

while (queue.length > 0) {
  const url = queue.shift();
  if (seen.has(url)) continue;
  seen.add(url);

  const path = publicPathFromUrl(url);
  try {
    const buffer = await saveUrl(url, path);
    manifest.push({ url, path, bytes: buffer.length });
    console.log(`saved ${path}`);

    if (/\.(?:html?|css|js|json|xml|svg|webmanifest)$|\/$/.test(new URL(url).pathname)) {
      for (const nextUrl of extractUrls(buffer.toString("utf8"), path)) {
        if (!seen.has(nextUrl)) queue.push(nextUrl);
      }
    }
  } catch (error) {
    manifest.push({ url, path, error: error.message });
    console.warn(`failed ${url}: ${error.message}`);
  }
}

await writeFile(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));

function localizeHtml(source, prefix) {
  return source
    .replace('<base href="/">', '<base href="./">')
    .replaceAll('href="/', `href="${prefix}`)
    .replaceAll('src="/', `src="${prefix}`)
    .replaceAll("href='/", `href='${prefix}`)
    .replaceAll("src='/", `src='${prefix}`)
    .replaceAll(`${rootUrl}/`, prefix);
}

const sourceHtml = await readFile(join(outDir, "about/index.html"), "utf8");
await writeFile(join(outDir, "index.html"), localizeHtml(sourceHtml, "./"));
await writeFile(join(outDir, "about/index.html"), localizeHtml(sourceHtml, "../"));
console.log(`done: ${manifest.length} linked resources`);
