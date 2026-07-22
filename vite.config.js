import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "parse5";
import { defineConfig } from "vite";
import { BASE_PATH, PUBLIC_ROUTES, SITE_URL } from "./site.config.js";
import { renderStaticToolGuide } from "./src/public-content.js";
import { renderSiteNavigation } from "./src/site-navigation.js";
import { browserToolBySlug } from "./src/tool-catalog.js";

const root = dirname(fileURLToPath(import.meta.url));

function findNavigation(node) {
  if (node.tagName === "nav" && (node.attrs || []).some((attribute) => attribute.name === "data-navigation")) {
    return node;
  }
  for (const child of node.childNodes || []) {
    const navigation = findNavigation(child);
    if (navigation) return navigation;
  }
  return null;
}

function replaceNavigation(html, path) {
  const document = parse(html, { sourceCodeLocationInfo: true });
  const navigation = findNavigation(document);
  const location = navigation?.sourceCodeLocation;
  if (!location && String(path || "").endsWith("/404.html")) return html;
  if (!location) throw new Error(`Die Hauptnavigation fehlt in ${path || "einer HTML-Datei"}.`);
  const markup = renderSiteNavigation(path, BASE_PATH);
  return `${html.slice(0, location.startOffset)}${markup}${html.slice(location.endOffset)}`;
}

function enrichPublicPages() {
  return {
    name: "enrich-public-pages",
    transformIndexHtml: {
      order: "pre",
      handler(html, context) {
        let output = html
          .split('href="/#werkzeuge"').join('href="/alle-werkzeuge/"')
          .split("</head>").join(`  <link rel="alternate" type="application/json" title="Werkzeugkatalog" href="${BASE_PATH}werkzeuge.json">\n  </head>`);

        output = replaceNavigation(output, context.path);

        const pathSegments = String(context.path || "").split("/").filter(Boolean);
        const tool = browserToolBySlug.get(pathSegments[0]);
        if (tool && output.includes("</main>")) {
          output = output.split("</main>").join(`${renderStaticToolGuide(tool, BASE_PATH)}\n    </main>`);
        }
        return output;
      }
    }
  };
}

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
  plugins: [enrichPublicPages(), replaceSiteUrl()],
  build: {
    cssCodeSplit: false,
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        home: resolve(root, "index.html"),
        allTools: resolve(root, "alle-werkzeuge/index.html"),
        calculators: resolve(root, "rechner/index.html"),
        calculatorTemplate: resolve(root, "rechner/werkzeug/index.html"),
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
