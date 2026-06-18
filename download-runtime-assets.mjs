import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootUrl = "https://lusion.co";
const outDir = dirname(fileURLToPath(import.meta.url));

process.env.HTTP_PROXY = "";
process.env.HTTPS_PROXY = "";
process.env.ALL_PROXY = "";

const textures = [
  "home.webp",
  "home_depth.webp",
  "tunnels/desktop.png",
  "tunnels/tablet.png",
  "LDR_RGB1_0.png",
  "about/fog.png",
  "about/ground_person_shadow.webp",
  "about/person.webp",
  "about/person_light.webp",
  "about/rocks.webp",
  "about/terrain_shadow_light_height.webp",
  "award_gradient.png",
  "flip_texture.png",
  "font.png",
  "reel/desktop.mp4",
  "reel/mobile.mp4",
  "smaa-area.png",
  "smaa-search.png",
  "stickers.png",
  "stickers_low.png",
  "tunnels/astronaut/face.png",
  "tunnels/earth.webp",
  "tunnels/earth_landscape.jpg",
  "tunnels/white_block.webp",
  "tunnels/white_matcap.jpg",
].map((path) => `/assets/textures/${path}`);

const audioIds = [
  "hover_0",
  "hover_1",
  "hover_2",
  "click_0",
  "click_1",
  "focus_0",
  "focus_1",
  "focus_2",
  "glass_broken",
  "page_0",
  "page_1",
  "generic",
  "cinematic_0",
  "cinematic_2",
  "cinematic_3",
  "generic_end",
].map((id) => `/assets/audios/${id}.ogg`);

const aboutModels = [
  "sphere_l",
  "sphere_m",
  "sphere_s",
  "sphere_xs",
  ...Array.from({ length: 8 }, (_, index) => `rock_${index}`),
  ...Array.from({ length: 8 }, (_, index) => `rock_${index}_low`),
  ...Array.from({ length: 8 }, (_, index) => `rock_animation_${index}`),
].map((name) => `/assets/models/about/${name}.buf`);

const otherModels = [
  "/assets/models/plant.buf",
  "/assets/models/home/cross.buf",
  "/assets/models/home/cross_ld.buf",
  "/assets/models/home/line.buf",
].filter(Boolean);

async function download(path) {
  const url = `${rootUrl}${path}`;
  const response = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0 Chrome/126 Safari/537.36" },
  });

  if (!response.ok) {
    console.warn(`missing ${path}: ${response.status}`);
    return { path, status: response.status };
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const target = join(outDir, path.replace(/^\/+/, ""));
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, buffer);
  console.log(`saved ${path}`);
  return { path, bytes: buffer.length };
}

const results = [];
for (const path of [...textures, ...audioIds, "/assets/team/team.json", ...aboutModels, ...otherModels]) {
  results.push(await download(path));
}

const teamResult = results.find((result) => result.path === "/assets/team/team.json" && result.bytes);
if (teamResult) {
  const team = JSON.parse(await import("node:fs/promises").then((fs) => fs.readFile(join(outDir, "assets/team/team.json"), "utf8")));
  for (const member of team) {
    if (member?.id) results.push(await download(`/assets/team/${member.id}.buf`));
  }
}

await writeFile(join(outDir, "runtime-assets.json"), JSON.stringify(results, null, 2));
