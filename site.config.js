import { calculatorRoutes } from "./src/calculator-catalog.js";

export const SITE_NAME = "Andersen Web Tools";
const DEFAULT_SITE_URL = "https://andersenwebworks.github.io/andersen-web-tools";

function removeTrailingSlashes(value) {
  let normalized = value;
  while (normalized.endsWith("/")) normalized = normalized.slice(0, -1);
  return normalized;
}

function normalizeBasePath(value) {
  let normalized = value.trim();
  if (!normalized.startsWith("/")) normalized = `/${normalized}`;
  while (normalized.includes("//")) normalized = normalized.split("//").join("/");
  if (!normalized.endsWith("/")) normalized += "/";

  const unsafeSegment = normalized.split("/").some((segment) => segment === ".." || segment === ".");
  if (unsafeSegment) throw new Error("BASE_PATH enthält ein unzulässiges Pfadsegment.");
  return normalized;
}

const configuredSiteUrl = process.env.SITE_URL || DEFAULT_SITE_URL;
export const SITE_URL = removeTrailingSlashes(configuredSiteUrl.trim());
export const BASE_PATH = normalizeBasePath(process.env.BASE_PATH || new URL(`${SITE_URL}/`).pathname);

export const PUBLIC_ROUTES = [
  "/",
  "/rechner/",
  "/bilder-komprimieren/",
  "/pdf-zusammenfuegen/",
  "/pdf-verkleinern/",
  "/heic-in-jpg/",
  "/jpg-pdf-umwandeln/",
  "/pdf-unterschreiben/",
  "/woerter-zeichen-zaehlen/",
  "/arbeitszeitrechner/",
  "/iban-pruefen-sepa-qr/",
  "/qr-code-erstellen/",
  "/farbkontrast-pruefen/",
  "/meta-tags-erstellen/",
  ...calculatorRoutes,
  "/datenschutz/",
  "/impressum/"
];
