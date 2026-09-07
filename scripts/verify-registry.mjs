import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
const version = process.env.RELEASE_VERSION;
if (!/^\d+\.\d+\.\d+$/.test(version ?? ""))
  throw new Error("Invalid release version");
const artifact = `tmp/bayonai-mcp-${version}.tgz`;
const expected =
  "sha512-" +
  createHash("sha512").update(readFileSync(artifact)).digest("base64");
const attempts = readBoundedInteger(
  process.env.REGISTRY_VERIFY_ATTEMPTS,
  5,
  1,
  10,
);
const delayMs = readBoundedInteger(
  process.env.REGISTRY_VERIFY_DELAY_MS,
  3000,
  100,
  60000,
);
let actual;
let lastError = "unknown npm registry error";
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  const probe = spawnSync(
    "npm",
    ["view", `@bayonai/mcp@${version}`, "dist.integrity"],
    { encoding: "utf8" },
  );
  if (probe.status === 0) {
    actual = probe.stdout.trim();
    break;
  }
  lastError = (
    probe.stderr ||
    probe.stdout ||
    `npm exited with status ${probe.status}`
  ).trim();
  if (attempt < attempts)
    await new Promise((resolve) => setTimeout(resolve, delayMs));
}
if (actual === undefined)
  throw new Error(
    `Registry integrity lookup failed after ${attempts} attempts: ${lastError}`,
  );
if (expected !== actual)
  throw new Error(
    `Registry tarball integrity mismatch: expected ${expected}, received ${actual}`,
  );
console.log(`Verified @bayonai/mcp@${version} registry integrity`);

function readBoundedInteger(value, fallback, minimum, maximum) {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum)
    throw new Error(
      `Registry verification setting must be an integer from ${minimum} to ${maximum}`,
    );
  return parsed;
}
