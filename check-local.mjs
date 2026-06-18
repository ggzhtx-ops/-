import { startServer } from "./server.mjs";

const server = await startServer(8099);

try {
  for (const path of ["/about/", "/recovered-static.css", "/recovered-static.js", "/_astro/about.CNa9RfUh.css"]) {
    const response = await fetch(`http://localhost:8099${path}`);
    console.log(path, response.status, response.headers.get("content-type"));

    if (path === "/about/") {
      const html = await response.text();
      console.log("has recovery css", html.includes("/recovered-static.css"));
      console.log("has recovery js", html.includes("/recovered-static.js"));
      console.log("main module disabled", html.includes('data-disabled-src="/_astro/hoisted.CJiXW_YI.js"'));
    }
  }
} finally {
  server.close();
}
