import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { startServer } from "./server.mjs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const out = new URL("./headless-about.png", import.meta.url).pathname;
const userDataDir = join(tmpdir(), `lusion-check-${Date.now()}`);

await mkdir(userDataDir, { recursive: true });
const server = await startServer(8099);

const args = [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  `--user-data-dir=${userDataDir}`,
  "--window-size=1440,1100",
  "--virtual-time-budget=12000",
  `--screenshot=${out}`,
  "http://localhost:8099/about/",
];

const child = spawn(chrome, args, { stdio: ["ignore", "pipe", "pipe"] });
let stdout = "";
let stderr = "";
child.stdout.on("data", (chunk) => (stdout += chunk));
child.stderr.on("data", (chunk) => (stderr += chunk));

const code = await new Promise((resolve) => child.on("exit", resolve));
await new Promise((resolve) => server.close(resolve));
await rm(userDataDir, { recursive: true, force: true });

console.log(JSON.stringify({ code, out, stdout, stderr }, null, 2));
