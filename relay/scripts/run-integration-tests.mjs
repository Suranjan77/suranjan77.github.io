#!/usr/bin/env node
/**
 * Starts the relay in Cloudflare's local runtime (wrangler dev), runs the
 * integration tests against it, then stops it. The teacher's grace period is
 * shortened to two seconds so the expiry test does not wait fifteen minutes.
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const port = 8788;
const relay = spawn(
  "npx",
  [
    "wrangler", "dev", "--port", String(port), "--ip", "127.0.0.1",
    "--var", "ALLOWED_ORIGINS:http://localhost:3000",
    "--var", "HOST_GRACE_SECONDS:2",
    "--var", "ROOM_JURISDICTION:none",
  ],
  { stdio: ["ignore", "pipe", "pipe"], detached: true, env: { ...process.env, WRANGLER_SEND_METRICS: "false" } },
);
let output = "";
relay.stdout.on("data", (chunk) => { output += chunk; });
relay.stderr.on("data", (chunk) => { output += chunk; });

function stop() {
  try { process.kill(-relay.pid, "SIGTERM"); } catch { /* already stopped */ }
}

let ready = false;
for (let attempt = 0; attempt < 120 && !ready; attempt += 1) {
  try {
    ready = (await fetch(`http://127.0.0.1:${port}/health`)).ok;
  } catch {
    await sleep(500);
  }
}
if (!ready) {
  stop();
  console.error(output);
  console.error("The relay did not start.");
  process.exit(1);
}

const tests = spawn(process.execPath, ["test/relay.test.mjs"], {
  stdio: "inherit",
  env: { ...process.env, RELAY_URL: `ws://127.0.0.1:${port}` },
});
tests.on("exit", (code) => {
  stop();
  process.exit(code ?? 1);
});
