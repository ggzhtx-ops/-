import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const bad = JSON.parse(await readFile("bad-assets.json", "utf8"));
const bases = ["https://lusion.co"];

for (const item of bad) {
  let ok = false;
  for (const base of bases) {
    const url = `${base}${item.path}`;
    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: {
          "user-agent": "Mozilla/5.0",
          accept: "*/*",
        },
      });
      const type = response.headers.get("content-type") || "";
      const buffer = Buffer.from(await response.arrayBuffer());
      const textHead = buffer.subarray(0, 32).toString("utf8");
      if (!response.ok || type.includes("text/html") || textHead.startsWith("<!DOCTYPE") || buffer.length < 16) {
        console.log("bad response", response.status, type, buffer.length, url);
        continue;
      }
      const target = join(".", item.path);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, buffer);
      console.log("downloaded", item.path, buffer.length, type);
      ok = true;
      break;
    } catch (error) {
      console.log("failed", url, error.message);
    }
  }
  if (!ok) console.log("missing", item.path);
}
