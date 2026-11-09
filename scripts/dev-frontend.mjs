import { spawn, spawnSync } from "node:child_process";

const nodeArgs = ["--import", "tsx", "script/generate-static-api.ts", "--frontend"];
const prepare = spawnSync(process.execPath, nodeArgs, {
  stdio: "inherit",
  cwd: process.cwd(),
});

if (prepare.status !== 0) {
  process.exit(prepare.status ?? 1);
}

const viteBin = process.platform === "win32"
  ? "node_modules/.bin/vite.cmd"
  : "node_modules/.bin/vite";

const vite = spawn(viteBin, ["--host", "0.0.0.0", "--port", "5173"], {
  stdio: "inherit",
  cwd: process.cwd(),
  env: {
    ...process.env,
    VITE_STATIC_SITE: "true",
  },
});

const stop = (signal) => vite.kill(signal);
process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));

vite.on("exit", (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0));
});
