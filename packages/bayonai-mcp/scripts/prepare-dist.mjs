import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const packageRoot = resolve(import.meta.dirname, "..");

await writeFile(
  resolve(packageRoot, "dist/cjs/package.json"),
  `${JSON.stringify({ type: "commonjs" }, null, 2)}\n`,
);
await writeFile(
  resolve(packageRoot, "dist/esm/package.json"),
  `${JSON.stringify({ type: "module" }, null, 2)}\n`,
);
