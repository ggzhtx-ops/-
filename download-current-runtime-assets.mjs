import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const paths = [
  "/assets/models/about/bg_box.buf",
  "/assets/models/about/camera_spline.buf",
  "/assets/models/about/letter_placements.buf",
  "/assets/models/about/logo_text.buf",
  "/assets/models/about/person.buf",
  "/assets/models/about/person_idle.buf",
  "/assets/models/about/terrain.buf",
  "/assets/models/about/terrain_lines.buf",
  "/assets/models/home/line.buf",
  "/assets/textures/home.webp",
  "/assets/textures/home_depth.webp",
  "/assets/textures/stickers.png",
  "/assets/textures/stickers_low.png",
  "/assets/textures/about/fog.png",
  "/assets/textures/about/ground_person_shadow.webp",
  "/assets/textures/about/person.webp",
  "/assets/textures/about/person_light.webp",
  "/assets/textures/about/rocks.webp",
  "/assets/textures/about/terrain_shadow_light_height.webp",
];

for (const path of paths) {
  const url = `https://lusion.co${path}`;
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent": "Mozilla/5.0",
      accept: "*/*",
    },
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  const type = response.headers.get("content-type") || "";
  const head = buffer.subarray(0, 32).toString("utf8");

  if (!response.ok || type.includes("text/html") || head.startsWith("<!DOCTYPE") || buffer.length < 16) {
    console.log("skipped bad response", response.status, type, buffer.length, url);
    continue;
  }

  const target = join(".", path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, buffer);
  console.log("downloaded", path, buffer.length, type);
}
