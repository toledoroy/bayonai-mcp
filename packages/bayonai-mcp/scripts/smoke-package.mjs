import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(packageRoot, "../..");
const packageManager = JSON.parse(
  readFileSync(resolve(repoRoot, "package.json"), "utf8"),
).packageManager;
const tmpRoot = resolve(repoRoot, "tmp");
const consumerDir = resolve(tmpRoot, "mcp-package-consumer");
const packageVersion = JSON.parse(
  readFileSync(resolve(packageRoot, "package.json"), "utf8"),
).version;
const tarballPath = resolve(tmpRoot, `bayonai-mcp-${packageVersion}.tgz`);

if (!consumerDir.startsWith(tmpRoot)) {
  throw new Error(
    `Refusing to use consumer directory outside tmp: ${consumerDir}`,
  );
}

rmSync(consumerDir, { force: true, recursive: true });
mkdirSync(consumerDir, { recursive: true });
writeFileSync(
  resolve(consumerDir, "package.json"),
  `${JSON.stringify({ name: "mcp-package-consumer", private: true }, null, 2)}\n`,
);

// The smoke command runs after an explicit package build. Skipping lifecycle
// scripts keeps the consumer check independent from the caller's pnpm shim.
runPackageManager(
  ["--config.ignore-scripts=true", "pack", "--pack-destination", "../../tmp"],
  packageRoot,
);
runNpm(["install", tarballPath], consumerDir);
execFileSync(
  "node",
  [
    "--input-type=module",
    "--eval",
    `
      import * as esm from "@bayonai/mcp";
      import { createRequire } from "node:module";
      const require = createRequire(import.meta.url);
      const cjs = require("@bayonai/mcp");
      const verifier = "a".repeat(64);
      const challenge = esm.buildPkceChallenge(verifier);
      if (!esm.verifyPkceChallenge({ challenge, method: "S256", verifier })) {
        throw new Error("ESM PKCE verification failed");
      }
      if (cjs.getOAuthAuthorizationServerMetadata({ serviceUrl: "https://bounded.example/api", scopes: ["bounded.read"] }).issuer !== "https://bounded.example/api") {
        throw new Error("CJS metadata import failed");
      }
      const discovery = esm.createMcpServerDiscovery({
        capabilities: { tools: {} },
        serverInfo: { name: "consumer", version: "1.0.0" },
      });
      if (discovery.supportedVersions[0] !== "2026-07-28") {
        throw new Error("ESM stateless discovery export failed");
      }
      if (!cjs.MCP_READ_ONLY_CLOSED_WORLD_TOOL_ANNOTATIONS.readOnlyHint) {
        throw new Error("CJS safety annotation export failed");
      }
      console.log("CJS and ESM package smoke passed");
    `,
  ],
  {
    cwd: consumerDir,
    stdio: "inherit",
  },
);

function runPackageManager(args, cwd) {
  if (process.platform === "win32") {
    execFileSync(
      "cmd.exe",
      ["/d", "/s", "/c", ["corepack", packageManager, ...args].join(" ")],
      {
        cwd,
        stdio: "inherit",
      },
    );
    return;
  }

  execFileSync("corepack", [packageManager, ...args], {
    cwd,
    stdio: "inherit",
  });
}

function runNpm(args, cwd) {
  if (process.platform === "win32") {
    execFileSync("cmd.exe", ["/d", "/s", "/c", ["npm", ...args].join(" ")], {
      cwd,
      stdio: "inherit",
    });
    return;
  }

  execFileSync("npm", args, {
    cwd,
    stdio: "inherit",
  });
}
