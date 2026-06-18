import { readFile, writeFile } from "node:fs/promises";

const files = ["index.html", "about/index.html"];
const version = Date.now().toString();
const recoveryTags = `<link rel="stylesheet" href="/recovered-static.css?v=${version}"><script defer src="/recovered-static.js?v=${version}"></script>`;

for (const file of files) {
  let html = await readFile(file, "utf8");

  html = html.replace(
    /<script type="module" src="\/_astro\/hoisted\.CJiXW_YI\.js(?:\?v=\d+)?"><\/script>/g,
    '<script type="text/plain" data-disabled-src="/_astro/hoisted.CJiXW_YI.js"></script>'
  );

  html = html.replace(/<link rel="stylesheet" href="\/recovered-static\.css\?v=\d+"><script defer src="\/recovered-static\.js\?v=\d+"><\/script>/g, "");

  const cssLink = html.match(/<link rel="stylesheet" href="\/_astro\/about\.CNa9RfUh\.css(?:\?v=\d+)?">/);
  if (cssLink) {
    html = html.replace(cssLink[0], `${cssLink[0]}${recoveryTags}`);
  } else {
    html = html.replace("</head>", `${recoveryTags}</head>`);
  }

  await writeFile(file, html);
}

console.log(`static recovery enabled ${version}`);
