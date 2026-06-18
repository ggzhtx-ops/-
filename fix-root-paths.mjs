import { readFile, writeFile } from "node:fs/promises";

const files = ["index.html", "about/index.html"];
const version = Date.now().toString();

for (const file of files) {
  let html = await readFile(file, "utf8");

  html = html
    .replace(/<base href="[^"]*">/g, '<base href="/">')
    .replace(/href="\.\.\/_astro\//g, 'href="/_astro/')
    .replace(/src="\.\.\/_astro\//g, 'src="/_astro/')
    .replace(/href="\.\/_astro\//g, 'href="/_astro/')
    .replace(/src="\.\/_astro\//g, 'src="/_astro/')
    .replace(/href="\.\.\/assets\//g, 'href="/assets/')
    .replace(/src="\.\.\/assets\//g, 'src="/assets/')
    .replace(/href="\.\/assets\//g, 'href="/assets/')
    .replace(/src="\.\/assets\//g, 'src="/assets/')
    .replace(/content="\.\.\/assets\//g, 'content="/assets/')
    .replace(/content="\.\/assets\//g, 'content="/assets/')
    .replace(/href="\.\.\/sitemap-index\.xml"/g, 'href="/sitemap-index.xml"')
    .replace(/href="\.\/sitemap-index\.xml"/g, 'href="/sitemap-index.xml"')
    .replace(/href="\.\.\/about\/?"/g, 'href="/about"')
    .replace(/href="\.\/about\/?"/g, 'href="/about"')
    .replace(/href="\.\.\/projects\/?"/g, 'href="/projects"')
    .replace(/href="\.\/projects\/?"/g, 'href="/projects"')
    .replace(/href="\.\.\/"/g, 'href="/"')
    .replace(/href="\.\/"/g, 'href="/"')
    .replace(/about\.CNa9RfUh\.css(?:\?v=\d+)?/g, `about.CNa9RfUh.css?v=${version}`)
    .replace(/hoisted\.CJiXW_YI\.js(?:\?v=\d+)?/g, `hoisted.CJiXW_YI.js?v=${version}`);

  await writeFile(file, html);
}

console.log(`fixed root paths ${version}`);
