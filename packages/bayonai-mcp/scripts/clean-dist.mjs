import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const packageRoot = resolve(import.meta.dirname, "..");
const distPath = resolve(packageRoot, "dist");

if (!distPath.startsWith(packageRoot)) {
  throw new Error(`Refusing to remove path outside package root: ${distPath}`);
}

await rm(distPath, { force: true, recursive: true });
