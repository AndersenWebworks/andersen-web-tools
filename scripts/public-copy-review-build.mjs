import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "vite";
import { writeProductionFiles } from "./postbuild.mjs";
import { writePublicCopySurface } from "./public-copy-surface.mjs";

const outputDirectory = resolve(".clautz", "review-builds", String(Date.now()));
await mkdir(outputDirectory, { recursive: true });
await build({
  configFile: resolve("vite.config.js"),
  build: {
    outDir: outputDirectory,
    emptyOutDir: false
  }
});
await writeProductionFiles(outputDirectory);
const surface = await writePublicCopySurface(outputDirectory);
console.log(`Öffentliche Copy-Fläche vorbereitet: ${surface.pages.length} Seiten.`);
