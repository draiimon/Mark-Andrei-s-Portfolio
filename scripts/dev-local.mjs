import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const envFile = path.join(root, ".env");
if (existsSync(envFile)) process.loadEnvFile(envFile);
const env = {
  ...process.env,
  NODE_ENV: "development",
  PORT: process.env.PORT || "3000",
  API_PORT: process.env.API_PORT || "3001",
  BASE_PATH: process.env.BASE_PATH || "/",
  VIEW_COUNTER_IGNORED_IPS: [process.env.VIEW_COUNTER_IGNORED_IPS, "127.0.0.1", "::1"].filter(Boolean).join(","),
};
const apiDir = path.join(root, "artifacts/api-server");
const webDir = path.join(root, "artifacts/mark-andrei-portfolio");
const children = new Set();
let stopping = false;

function start(args, cwd, childEnv = env) {
  const child = spawn(process.execPath, args, { cwd, env: childEnv, stdio: "inherit" });
  children.add(child);
  child.on("error", (error) => {
    console.error(error.message);
    stop(1);
  });
  child.on("exit", () => children.delete(child));
  return child;
}

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = code;
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());

const build = start(["build.mjs"], apiDir);
build.on("exit", (code) => {
  if (stopping) return;
  if (code !== 0) return stop(code || 1);
  const api = start(["--enable-source-maps", "dist/index.mjs"], apiDir, { ...env, PORT: env.API_PORT });
  const webRequire = createRequire(path.join(webDir, "package.json"));
  const vite = path.join(path.dirname(webRequire.resolve("vite/package.json")), "bin/vite.js");
  const web = start([vite, "--host", process.env.HOST || (process.env.REPL_ID ? "0.0.0.0" : "127.0.0.1")], webDir);
  for (const child of [api, web]) child.on("exit", (exitCode) => stop(exitCode || 0));
  console.log(`Local portfolio: http://localhost:${env.PORT} (API: ${env.API_PORT})`);
});
