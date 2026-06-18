import { readFile, writeFile } from "node:fs/promises";

const files = ["index.html", "about/index.html"];
const version = Date.now().toString();
const fallback = `<script>
window.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    var preloader = document.getElementById("preloader");
    if (preloader) preloader.style.display = "none";
    document.documentElement.classList.add("is-ready");
  }, 8000);
});
</script>`;
const earlyRouteFix = `<script>
if (location.pathname === "/about/about" || location.pathname === "/about/about/") {
  history.replaceState(null, "", "/about/" + location.search + location.hash);
}
</script>`;
const recoveryStyle = `<style>
@keyframes recovered-hide-preloader { to { opacity: 0; visibility: hidden; pointer-events: none; } }
#preloader { animation: recovered-hide-preloader .4s 4s forwards; }
html { background: #000; }
</style>`;
const bodyFallback = `<script>
setTimeout(function () {
  var preloader = document.getElementById("preloader");
  if (preloader) {
    preloader.style.opacity = "0";
    preloader.style.visibility = "hidden";
    preloader.style.pointerEvents = "none";
    preloader.style.display = "none";
  }
  document.documentElement.classList.add("is-ready");
}, 4500);
</script>`;

for (const file of files) {
  let html = await readFile(file, "utf8");
  html = html
    .replace(/about\.CNa9RfUh\.css(?:\?v=\d+)?/g, `about.CNa9RfUh.css?v=${version}`)
    .replace(/hoisted\.CJiXW_YI\.js(?:\?v=\d+)?/g, `hoisted.CJiXW_YI.js?v=${version}`);

  if (!html.includes('location.pathname === "/about/about"')) {
    html = html.replace("<meta name=\"description\"", `${earlyRouteFix}<meta name="description"`);
  }

  if (!html.includes("recovered-hide-preloader")) {
    html = html.replace("</head>", `${recoveryStyle}${fallback}</head>`);
  } else if (!html.includes("DOMContentLoaded\", function ()")) {
    html = html.replace("</head>", `${fallback}</head>`);
  }

  if (!html.includes("preloader.style.visibility")) {
    html = html.replace("</body>", `${bodyFallback}</body>`);
  }

  await writeFile(file, html);
}

console.log(`patched html cache bust ${version}`);
