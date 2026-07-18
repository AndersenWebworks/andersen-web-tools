import { createHash } from "node:crypto";
import { readFile, realpath } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
}

function hash(value) {
  return createHash("sha256").update(JSON.stringify(stableValue(value))).digest("hex");
}

async function readJsonInside(relativePath, label) {
  if (!relativePath || isAbsolute(relativePath)) throw new Error(`${label} muss ein relativer Projektpfad sein.`);
  const target = resolve(projectRoot, relativePath);
  const pathFromRoot = relative(projectRoot, target);
  if (pathFromRoot === ".." || pathFromRoot.startsWith(`..${sep}`) || isAbsolute(pathFromRoot)) {
    throw new Error(`${label} liegt außerhalb des Projekts.`);
  }
  const realRoot = await realpath(projectRoot);
  const realTarget = await realpath(target);
  const realPathFromRoot = relative(realRoot, realTarget);
  if (realPathFromRoot === ".." || realPathFromRoot.startsWith(`..${sep}`) || isAbsolute(realPathFromRoot)) {
    throw new Error(`${label} löst außerhalb des Projekts auf.`);
  }
  return JSON.parse(await readFile(realTarget, "utf8"));
}

export async function verifyPublicCopyApproval() {
  const config = await readJsonInside("public-copy.config.json", "Konfiguration");
  if (config.version !== 1) throw new Error("Public-Copy-Konfiguration braucht Version 1.");
  const surface = await readJsonInside(config.surface, "Öffentliche Oberfläche");
  const approval = await readJsonInside(config.attestation, "Public-Copy-Freigabe");
  if (surface.version !== 1 || !Array.isArray(surface.pages) || surface.pages.length === 0) {
    throw new Error("Die öffentliche Oberfläche ist leer oder ungültig.");
  }
  const brief = {
    version: 1,
    project: config.project,
    audience: config.audience,
    purpose: config.purpose
  };
  const reviewedSurface = {
    version: 1,
    project: surface.project || config.project,
    pages: surface.pages
  };
  if (approval.version !== 1 || approval.status !== "approved") {
    throw new Error("Die öffentliche Copy besitzt keine gültige semantische Freigabe.");
  }
  if (approval.project !== config.project) throw new Error("Die Freigabe gehört zu einem anderen Projekt.");
  if (approval.briefHash !== hash(brief)) throw new Error("Zielgruppe oder öffentlicher Zweck wurden nach der Freigabe geändert.");
  if (approval.surfaceHash !== hash(reviewedSurface)) throw new Error("Die sichtbare Copy wurde nach der Freigabe geändert.");
  if (approval.pageCount !== surface.pages.length) throw new Error("Die freigegebene Seitenzahl stimmt nicht mehr.");
  return approval;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const approval = await verifyPublicCopyApproval();
  console.log(`Public-Copy-Freigabe gültig: ${approval.pageCount} Seiten, geprüft am ${approval.reviewedAt}`);
}
