import { readFileSync } from "node:fs";
import { join } from "path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function getArtifact(path: string) {
  return JSON.parse(
    readFileSync(join(__dirname, "../artifacts/contracts/" + path), "utf8"),
  );
}
