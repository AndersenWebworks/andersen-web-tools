import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { BASE_PATH, PUBLIC_ROUTES, SITE_URL } from "./site.config.js";

const root = dirname(fileURLToPath(import.meta.url));

function replaceSiteUrl() {
  return {
    name: "replace-site-values",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        let output = html.split("__SITE_URL__").join(SITE_URL);
        output = output.split('href="/#').join(`href="${BASE_PATH}#`);

        for (const route of PUBLIC_ROUTES) {
          const target = route === "/" ? BASE_PATH : `${BASE_PATH}${route.slice(1)}`;
          output = output.split(`href="${route}"`).join(`href="${target}"`);
        }

        return output;
      }
    }
  };
}

export default defineConfig({
  base: BASE_PATH,
  plugins: [replaceSiteUrl()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        home: resolve(root, "index.html"),
        images: resolve(root, "bilder-komprimieren/index.html"),
        pdf: resolve(root, "pdf-zusammenfuegen/index.html"),
        pdfCompress: resolve(root, "pdf-verkleinern/index.html"),
        heic: resolve(root, "heic-in-jpg/index.html"),
        documentConverter: resolve(root, "jpg-pdf-umwandeln/index.html"),
        pdfSign: resolve(root, "pdf-unterschreiben/index.html"),
        textCounter: resolve(root, "woerter-zeichen-zaehlen/index.html"),
        worktime: resolve(root, "arbeitszeitrechner/index.html"),
        iban: resolve(root, "iban-pruefen-sepa-qr/index.html"),
        qr: resolve(root, "qr-code-erstellen/index.html"),
        contrast: resolve(root, "farbkontrast-pruefen/index.html"),
        meta: resolve(root, "meta-tags-erstellen/index.html"),
        privacy: resolve(root, "datenschutz/index.html"),
        imprint: resolve(root, "impressum/index.html"),
        notFound: resolve(root, "404.html")
      }
    }
  },
  server: {
    port: 4178,
    strictPort: true
  },
  preview: {
    port: 4179,
    strictPort: true
  }
});
