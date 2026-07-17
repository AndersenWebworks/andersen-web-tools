import * as pdfjs from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const DEFAULT_MAX_PIXELS = 18_000_000;

export function openPdf(data) {
  const bytes = data instanceof Uint8Array ? data.slice() : new Uint8Array(data.slice(0));
  return pdfjs.getDocument({ data: bytes }).promise;
}

export async function renderPdfPage(pdf, pageNumber, options = {}) {
  const page = await pdf.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const requestedDpi = Number(options.dpi) || 144;
  const maxPixels = Number(options.maxPixels) || DEFAULT_MAX_PIXELS;
  let scale = requestedDpi / 72;
  const requestedPixels = baseViewport.width * baseViewport.height * scale * scale;

  if (requestedPixels > maxPixels) {
    scale *= Math.sqrt(maxPixels / requestedPixels);
  }

  const viewport = page.getViewport({ scale });
  const canvas = options.canvas || document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(viewport.width));
  canvas.height = Math.max(1, Math.ceil(viewport.height));
  const context = canvas.getContext("2d", { alpha: false });
  context.fillStyle = options.background || "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport }).promise;

  return {
    baseViewport,
    canvas,
    page,
    scale,
    viewport
  };
}

export function canvasToBlob(canvas, type = "image/jpeg", quality = 0.8) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Der Browser konnte keine Bilddatei erzeugen."));
    }, type, quality);
  });
}

export async function destroyPdf(pdf) {
  if (!pdf) return;
  try {
    await pdf.destroy();
  } catch {
    // Eine bereits geschlossene Vorschau braucht keine weitere Behandlung.
  }
}
