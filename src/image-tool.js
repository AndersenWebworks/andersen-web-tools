import JSZip from "jszip";
import "./styles.css";
import {
  downloadBlob,
  formatBytes,
  refreshIcons,
  sanitizeFileStem,
  setButtonLoading,
  showToast
} from "./shared.js";

const MAX_FILES = 12;
const MAX_FILE_BYTES = 40 * 1024 * 1024;
const MAX_TOTAL_BYTES = 160 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 32_000_000;
const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

const elements = {
  dropzone: document.querySelector("[data-image-dropzone]"),
  input: document.querySelector("[data-image-input]"),
  list: document.querySelector("[data-image-list]"),
  error: document.querySelector("[data-image-error]"),
  format: document.querySelector("[data-image-format]"),
  quality: document.querySelector("[data-image-quality]"),
  qualityValue: document.querySelector("[data-quality-value]"),
  width: document.querySelector("[data-image-width]"),
  height: document.querySelector("[data-image-height]"),
  process: document.querySelector("[data-image-process]"),
  reset: document.querySelector("[data-image-reset]"),
  panel: document.querySelector("[data-image-results-panel]"),
  results: document.querySelector("[data-image-results]"),
  summary: document.querySelector("[data-image-summary]"),
  downloadAll: document.querySelector("[data-image-download-all]"),
  avifOption: document.querySelector("[data-avif-option]")
};

let sourceItems = [];
let outputItems = [];
let itemCounter = 0;

function setError(message = "") {
  const text = elements.error.querySelector("span");
  text.textContent = message;
  elements.error.hidden = !message;
}

function extensionForMime(mime) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/avif") return "avif";
  return "webp";
}

function originalMime(file) {
  return acceptedTypes.has(file.type) ? file.type : "image/webp";
}

function fileStem(name) {
  const lastDot = name.lastIndexOf(".");
  return sanitizeFileStem(lastDot > 0 ? name.slice(0, lastDot) : name);
}

async function imageDimensions(file) {
  if ("createImageBitmap" in window) {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      const dimensions = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return dimensions;
    } catch {
      const bitmap = await createImageBitmap(file);
      const dimensions = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return dimensions;
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function addFiles(fileList) {
  setError();
  const candidates = Array.from(fileList);
  const availableSlots = MAX_FILES - sourceItems.length;
  const selected = candidates.slice(0, Math.max(availableSlots, 0));
  const problems = [];
  let selectedBytes = sourceItems.reduce((total, item) => total + item.file.size, 0);
  let totalLimitReported = false;

  if (candidates.length > availableSlots) problems.push(`Es sind höchstens ${MAX_FILES} Bilder pro Durchgang möglich.`);

  for (const file of selected) {
    if (!acceptedTypes.has(file.type)) {
      problems.push(`${file.name} hat kein unterstütztes Bildformat.`);
      continue;
    }
    if (file.size > MAX_FILE_BYTES) {
      problems.push(`${file.name} ist größer als 40 MB.`);
      continue;
    }
    if (selectedBytes + file.size > MAX_TOTAL_BYTES) {
      if (!totalLimitReported) problems.push("Pro Durchgang sind insgesamt höchstens 160 MB möglich.");
      totalLimitReported = true;
      continue;
    }

    try {
      const dimensions = await imageDimensions(file);
      if (dimensions.width * dimensions.height > MAX_IMAGE_PIXELS) {
        problems.push(`${file.name} hat mehr als 32 Megapixel und ist für die sichere Browser-Verarbeitung zu groß.`);
        continue;
      }
      itemCounter += 1;
      sourceItems.push({
        id: `image-${itemCounter}`,
        file,
        width: dimensions.width,
        height: dimensions.height,
        previewUrl: URL.createObjectURL(file)
      });
      selectedBytes += file.size;
    } catch {
      problems.push(`${file.name} konnte nicht gelesen werden.`);
    }
  }

  renderSourceItems();
  clearOutputs();
  if (problems.length) setError(problems.join(" "));
  elements.input.value = "";
}

function renderSourceItems() {
  elements.list.replaceChildren();

  sourceItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "file-row";
    row.dataset.imageId = item.id;

    const preview = document.createElement("div");
    preview.className = "file-row__preview";
    const image = document.createElement("img");
    image.src = item.previewUrl;
    image.alt = "";
    preview.append(image);

    const meta = document.createElement("div");
    meta.className = "file-row__meta";
    const name = document.createElement("strong");
    name.textContent = item.file.name;
    const details = document.createElement("span");
    details.textContent = `${item.width} × ${item.height} px · ${formatBytes(item.file.size)}`;
    meta.append(name, details);

    const actions = document.createElement("div");
    actions.className = "file-row__actions";
    const remove = document.createElement("button");
    remove.className = "icon-button";
    remove.type = "button";
    remove.title = "Bild aus der Auswahl entfernen";
    remove.setAttribute("aria-label", `${item.file.name} aus der Auswahl entfernen`);
    remove.innerHTML = '<i data-lucide="trash-2"></i>';
    remove.addEventListener("click", () => removeSourceItem(item.id));
    actions.append(remove);

    row.append(preview, meta, actions);
    elements.list.append(row);
  });

  elements.process.disabled = sourceItems.length === 0;
  refreshIcons(elements.list);
}

function removeSourceItem(id) {
  const index = sourceItems.findIndex((item) => item.id === id);
  if (index < 0) return;
  URL.revokeObjectURL(sourceItems[index].previewUrl);
  sourceItems.splice(index, 1);
  renderSourceItems();
  clearOutputs();
}

function clearOutputs() {
  outputItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
  outputItems = [];
  elements.results.replaceChildren();
  elements.summary.replaceChildren();
  elements.panel.hidden = true;
  elements.downloadAll.hidden = true;
}

function resetAll() {
  sourceItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
  sourceItems = [];
  clearOutputs();
  renderSourceItems();
  setError();
  elements.format.value = "original";
  elements.quality.value = "82";
  elements.qualityValue.textContent = "82 %";
  elements.width.value = "2000";
  elements.height.value = "2000";
}

async function loadDrawable(file) {
  if ("createImageBitmap" in window) {
    let bitmap;
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      bitmap = await createImageBitmap(file);
    }
    return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
  }

  const url = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = "async";
  image.src = url;
  await image.decode();
  return {
    source: image,
    width: image.naturalWidth,
    height: image.naturalHeight,
    close: () => URL.revokeObjectURL(url)
  };
}

function targetDimensions(width, height, maxWidth, maxHeight) {
  const widthRatio = maxWidth > 0 ? maxWidth / width : 1;
  const heightRatio = maxHeight > 0 ? maxHeight / height : 1;
  const ratio = Math.min(1, widthRatio, heightRatio);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio))
  };
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Das Bild konnte nicht gespeichert werden."));
      else resolve(blob);
    }, mime, quality);
  });
}

async function processOne(item, settings) {
  const drawable = await loadDrawable(item.file);
  try {
    const dimensions = targetDimensions(drawable.width, drawable.height, settings.maxWidth, settings.maxHeight);
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext("2d", { alpha: settings.mime !== "image/jpeg" });
    if (!context) throw new Error("Die Bildverarbeitung wird von diesem Browser nicht unterstützt.");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    if (settings.mime === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(drawable.source, 0, 0, canvas.width, canvas.height);
    const blob = await canvasToBlob(canvas, settings.mime, settings.quality);
    if (settings.mime === "image/avif" && blob.type !== "image/avif") throw new Error("Dieser Browser kann keine AVIF-Dateien erzeugen.");
    const extension = extensionForMime(settings.mime);
    return {
      source: item,
      blob,
      width: dimensions.width,
      height: dimensions.height,
      fileName: `${fileStem(item.file.name)}-optimiert.${extension}`,
      previewUrl: URL.createObjectURL(blob)
    };
  } finally {
    drawable.close();
  }
}

async function processImages() {
  if (!sourceItems.length) return;
  setError();
  clearOutputs();
  const maxWidth = Number(elements.width.value);
  const maxHeight = Number(elements.height.value);
  if (!Number.isFinite(maxWidth) || !Number.isFinite(maxHeight) || maxWidth < 1 || maxHeight < 1 || maxWidth > 12000 || maxHeight > 12000) {
    setError("Breite und Höhe müssen zwischen 1 und 12.000 Pixeln liegen.");
    return;
  }

  const chosenFormat = elements.format.value;
  const quality = Number(elements.quality.value) / 100;
  setButtonLoading(elements.process, true, "Bilder werden verarbeitet");

  try {
    for (const item of sourceItems) {
      const mime = chosenFormat === "original" ? originalMime(item.file) : chosenFormat;
      const output = await processOne(item, { mime, quality, maxWidth, maxHeight });
      outputItems.push(output);
    }
    renderOutputs();
    elements.panel.hidden = false;
    elements.panel.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    clearOutputs();
    setError(error instanceof Error ? error.message : "Die Bilder konnten nicht verarbeitet werden.");
  } finally {
    setButtonLoading(elements.process, false);
  }
}

function renderOutputs() {
  elements.results.replaceChildren();
  let originalBytes = 0;
  let outputBytes = 0;

  outputItems.forEach((item) => {
    originalBytes += item.source.file.size;
    outputBytes += item.blob.size;
    const row = document.createElement("div");
    row.className = "result-row";

    const preview = document.createElement("div");
    preview.className = "file-row__preview";
    const image = document.createElement("img");
    image.src = item.previewUrl;
    image.alt = "";
    preview.append(image);

    const meta = document.createElement("div");
    meta.className = "file-row__meta";
    const name = document.createElement("strong");
    name.textContent = item.fileName;
    const delta = item.source.file.size > 0 ? Math.round((1 - item.blob.size / item.source.file.size) * 100) : 0;
    const details = document.createElement("span");
    details.textContent = `${item.width} × ${item.height} px · ${formatBytes(item.blob.size)} · ${delta >= 0 ? `${delta} % kleiner` : `${Math.abs(delta)} % größer`}`;
    meta.append(name, details);

    const actions = document.createElement("div");
    actions.className = "file-row__actions";
    const download = document.createElement("button");
    download.className = "button button--secondary";
    download.type = "button";
    download.innerHTML = '<i data-lucide="download"></i><span>Herunterladen</span>';
    download.addEventListener("click", () => downloadBlob(item.blob, item.fileName));
    actions.append(download);

    row.append(preview, meta, actions);
    elements.results.append(row);
  });

  const difference = originalBytes - outputBytes;
  const savedPercent = originalBytes > 0 ? Math.round((difference / originalBytes) * 100) : 0;
  elements.summary.innerHTML = `
    <div class="summary-item"><span>Vorher</span><strong>${formatBytes(originalBytes)}</strong></div>
    <div class="summary-item"><span>Nachher</span><strong>${formatBytes(outputBytes)}</strong></div>
    <div class="summary-item"><span>${difference >= 0 ? "Gespart" : "Mehr"}</span><strong>${formatBytes(Math.abs(difference))} · ${Math.abs(savedPercent)} %</strong></div>
  `;
  elements.downloadAll.hidden = outputItems.length < 2;
  refreshIcons(elements.panel);
}

async function downloadAll() {
  if (outputItems.length < 2) return;
  setButtonLoading(elements.downloadAll, true, "ZIP wird erstellt");
  try {
    const zip = new JSZip();
    outputItems.forEach((item) => zip.file(item.fileName, item.blob));
    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
    downloadBlob(blob, "optimierte-bilder.zip");
  } catch {
    showToast("Die ZIP-Datei konnte nicht erstellt werden.", "error");
  } finally {
    setButtonLoading(elements.downloadAll, false);
  }
}

async function detectAvifSupport() {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  try {
    const blob = await canvasToBlob(canvas, "image/avif", 0.8);
    if (blob.type !== "image/avif") throw new Error("unsupported");
  } catch {
    elements.avifOption.disabled = true;
    elements.avifOption.textContent = "AVIF (hier nicht verfügbar)";
  }
}

elements.input.addEventListener("change", () => addFiles(elements.input.files));
elements.dropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  elements.dropzone.dataset.active = "true";
});
elements.dropzone.addEventListener("dragleave", () => {
  elements.dropzone.dataset.active = "false";
});
elements.dropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  elements.dropzone.dataset.active = "false";
  addFiles(event.dataTransfer.files);
});
elements.quality.addEventListener("input", () => {
  elements.qualityValue.textContent = `${elements.quality.value} %`;
});
elements.process.addEventListener("click", processImages);
elements.reset.addEventListener("click", resetAll);
elements.downloadAll.addEventListener("click", downloadAll);
window.addEventListener("beforeunload", () => {
  sourceItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
  outputItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
});

detectAvifSupport();
