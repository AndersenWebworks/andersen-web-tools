import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import {
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  writeFile
} from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import JSZip from "jszip";
import { build } from "vite";
import { BASE_PATH, PUBLIC_ROUTES, SITE_URL } from "../site.config.js";
import { writeProductionFiles } from "./postbuild.mjs";
import { writePublicCopySurface } from "./public-copy-surface.mjs";
import { verifyPublicCopyApproval } from "./public-copy-verify.mjs";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(scriptDirectory, "..");
const repositoryRoot = appRoot;
const releasesRoot = resolve(repositoryRoot, "releases");
const pagesOutput = resolve(repositoryRoot, "pages-output");
const execFileAsync = promisify(execFile);

function assertInside(parent, target, label) {
  const pathFromParent = relative(parent, target);
  if (!pathFromParent || pathFromParent.startsWith(`..${sep}`) || pathFromParent === ".." || isAbsolute(pathFromParent)) {
    throw new Error(`${label} liegt außerhalb des vorgesehenen Release-Ordners.`);
  }
}

async function pathExists(target) {
  try {
    await lstat(target);
    return true;
  } catch (error) {
    if (error && error.code === "ENOENT") return false;
    throw error;
  }
}

function comparablePath(target) {
  const normalized = resolve(target);
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

function assertNotRedirected(expectedPath, realPath, label) {
  if (comparablePath(expectedPath) !== comparablePath(realPath)) {
    throw new Error(`${label} wird über einen Link oder Reparse Point umgeleitet.`);
  }
}

function releaseTimestamp(date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Berlin",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }).formatToParts(date).filter((part) => part.type !== "literal").map((part) => [part.type, part.value])
  );
  return `${parts.year}${parts.month}${parts.day}-${parts.hour}${parts.minute}${parts.second}-${String(date.getMilliseconds()).padStart(3, "0")}`;
}

async function collectFiles(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = resolve(current, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Release enthält einen nicht erlaubten Link: ${entry.name}`);
    if (entry.isDirectory()) files.push(...await collectFiles(root, absolutePath));
    else if (entry.isFile()) {
      files.push({
        absolutePath,
        relativePath: relative(root, absolutePath).split(sep).join("/")
      });
    }
  }

  return files.sort((first, second) => first.relativePath.localeCompare(second.relativePath, "de"));
}

async function verifyRelease(siteDirectory, files) {
  const fileNames = new Set(files.map((file) => file.relativePath));
  const requiredFiles = new Set([
    ".htaccess",
    ".nojekyll",
    "404.html",
    "favicon.svg",
    "index.html",
    "llms.txt",
    "robots.txt",
    "site.webmanifest",
    "sitemap.xml",
    "werkzeuge.json"
  ]);

  PUBLIC_ROUTES.filter((route) => route !== "/").forEach((route) => {
    requiredFiles.add(`${route.slice(1)}index.html`);
  });

  const missingFiles = [...requiredFiles].filter((fileName) => !fileNames.has(fileName));
  if (missingFiles.length) throw new Error(`Release ist unvollständig: ${missingFiles.join(", ")}`);

  const textFileExtensions = [".html", ".txt", ".xml"];
  const textFiles = files.filter((file) => textFileExtensions.some((extension) => file.relativePath.endsWith(extension)));
  for (const file of textFiles) {
    const content = await readFile(file.absolutePath, "utf8");
    if (content.includes("__SITE_URL__")) {
      throw new Error(`Nicht ersetzter URL-Platzhalter in ${file.relativePath}.`);
    }

    if (file.relativePath.endsWith(".html") && BASE_PATH !== "/") {
      if (content.includes('href="/#')) throw new Error(`Unscoped Startseitenanker in ${file.relativePath}.`);
      for (const route of PUBLIC_ROUTES) {
        if (content.includes(`href="${route}"`)) {
          throw new Error(`Unscoped interner Link ${route} in ${file.relativePath}.`);
        }
      }
    }
  }

  const robots = await readFile(resolve(siteDirectory, "robots.txt"), "utf8");
  if (!robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) throw new Error("robots.txt verweist nicht auf die Produktions-Sitemap.");

  const sitemap = await readFile(resolve(siteDirectory, "sitemap.xml"), "utf8");
  for (const route of PUBLIC_ROUTES) {
    if (!sitemap.includes(`<loc>${SITE_URL}${route}</loc>`)) throw new Error(`Sitemap enthält die Route ${route} nicht.`);
  }
}

async function packageRelease(files, zipPath) {
  const archive = new JSZip();
  let totalBytes = 0;

  for (const file of files) {
    const content = await readFile(file.absolutePath);
    totalBytes += content.byteLength;
    archive.file(file.relativePath, content);
  }

  const zipBuffer = await archive.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 }
  });
  await writeFile(zipPath, zipBuffer, { flag: "wx" });
  return {
    totalBytes,
    zipBytes: zipBuffer.byteLength,
    zipSha256: createHash("sha256").update(zipBuffer).digest("hex")
  };
}

async function readSourceState() {
  const commitResult = await execFileAsync("git", ["rev-parse", "HEAD"], { cwd: repositoryRoot, windowsHide: true });
  const statusResult = await execFileAsync("git", ["status", "--porcelain=v1"], { cwd: repositoryRoot, windowsHide: true });
  return {
    commit: commitResult.stdout.trim(),
    dirty: Boolean(statusResult.stdout.trim())
  };
}

const packageData = JSON.parse(await readFile(resolve(appRoot, "package.json"), "utf8"));
const builtAt = new Date();
const releaseId = `andersen-web-tools-v${packageData.version}-${releaseTimestamp(builtAt)}`;
const releaseDirectory = resolve(releasesRoot, releaseId);
const siteDirectory = resolve(releaseDirectory, "site");
const zipPath = resolve(releaseDirectory, `${releaseId}.zip`);
const manifestPath = resolve(releaseDirectory, "release.json");

const pagesMode = process.argv.includes("--pages");
const repositoryRealPath = await realpath(repositoryRoot);
assertNotRedirected(repositoryRoot, repositoryRealPath, "Repository-Wurzel");

if (pagesMode) {
  assertInside(repositoryRoot, pagesOutput, "GitHub-Pages-Ziel");
  if (await pathExists(pagesOutput)) throw new Error(`GitHub-Pages-Ziel existiert bereits: ${pagesOutput}`);

  await build({
    configFile: resolve(appRoot, "vite.config.js"),
    build: {
      outDir: pagesOutput,
      emptyOutDir: false
    }
  });
  await writeProductionFiles(pagesOutput);

  const pagesRealPath = await realpath(pagesOutput);
  assertNotRedirected(pagesOutput, pagesRealPath, "GitHub-Pages-Ziel");
  assertInside(repositoryRealPath, pagesRealPath, "Aufgelöstes GitHub-Pages-Ziel");

  const files = await collectFiles(pagesOutput);
  await verifyRelease(pagesOutput, files);
  await writePublicCopySurface(pagesOutput);
  await verifyPublicCopyApproval();
  console.log([
    "GitHub-Pages-Ausgabe erstellt.",
    `Webroot: ${pagesOutput}`,
    `Dateien: ${files.length}`
  ].join("\n"));
  process.exit(0);
}

assertInside(repositoryRoot, releasesRoot, "Release-Basis");
assertInside(releasesRoot, releaseDirectory, "Release-Ziel");

await mkdir(releasesRoot, { recursive: true });
const releasesRealPath = await realpath(releasesRoot);
assertNotRedirected(releasesRoot, releasesRealPath, "Release-Basis");
assertInside(repositoryRealPath, releasesRealPath, "Aufgelöste Release-Basis");

if (await pathExists(releaseDirectory)) throw new Error(`Release-Ziel existiert bereits: ${releaseDirectory}`);
await mkdir(siteDirectory, { recursive: true });
const releaseRealPath = await realpath(releaseDirectory);
assertNotRedirected(releaseDirectory, releaseRealPath, "Release-Ziel");
assertInside(releasesRealPath, releaseRealPath, "Aufgelöstes Release-Ziel");

await build({
  configFile: resolve(appRoot, "vite.config.js"),
  build: {
    outDir: siteDirectory,
    emptyOutDir: false
  }
});
await writeProductionFiles(siteDirectory);

const files = await collectFiles(siteDirectory);
await verifyRelease(siteDirectory, files);
await writePublicCopySurface(siteDirectory);
await verifyPublicCopyApproval();
const archive = await packageRelease(files, zipPath);
const source = await readSourceState();

const manifest = {
  releaseId,
  version: packageData.version,
  builtAt: builtAt.toISOString(),
  sourceCommit: source.commit,
  sourceDirty: source.dirty,
  siteUrl: SITE_URL,
  webroot: "site/",
  archive: `${releaseId}.zip`,
  fileCount: files.length,
  sourceBytes: archive.totalBytes,
  archiveBytes: archive.zipBytes,
  archiveSha256: archive.zipSha256
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx" });

console.log([
  `Release erstellt: ${releaseId}`,
  `Webroot: ${siteDirectory}`,
  `Archiv: ${zipPath}`,
  `Dateien: ${files.length}`,
  `SHA-256: ${archive.zipSha256}`
].join("\n"));
