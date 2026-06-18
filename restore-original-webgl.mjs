import { readFile, writeFile } from "node:fs/promises";

const files = ["index.html", "about/index.html"];
const version = Date.now().toString();

for (const file of files) {
  let html = await readFile(file, "utf8");

  html = html.replace(/<link rel="stylesheet" href="\/recovered-static\.css\?v=\d+"><script defer src="\/recovered-static\.js\?v=\d+"><\/script>/g, "");
  html = html.replace(
    /<script type="text\/plain" data-disabled-src="\/_astro\/hoisted\.CJiXW_YI\.js"><\/script>/g,
    `<script type="module" src="/_astro/hoisted.CJiXW_YI.js?v=${version}"></script>`
  );
  html = html.replace(/hoisted\.CJiXW_YI\.js(?:\?v=\d+)?/g, `hoisted.CJiXW_YI.js?v=${version}`);
  html = html.replace(/about\.CNa9RfUh\.css(?:\?v=\d+)?/g, `about.CNa9RfUh.css?v=${version}`);

  await writeFile(file, html);
}

console.log(`original WebGL restored ${version}`);
