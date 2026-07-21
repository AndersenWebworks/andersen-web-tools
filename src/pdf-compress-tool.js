import { PDFDocument, PDFSignature } from "pdf-lib";
import { createQpdfRunner } from "qpdf-run";
import qpdfWorkerUrl from "qpdf-run/worker?url";
import qpdfJsUrl from "qpdf-run/qpdf.js?url";
import qpdfWasmUrl from "qpdf-run/qpdf.wasm?url";
import "./styles.css";
import {
  downloadBlob,
  formatBytes,
  refreshIcons,
  sanitizeFileStem,
  setButtonLoading
} from "./shared.js";
import {
  canvasToBlob,
  destroyPdf,
  openPdf,
  renderPdfPage
} from "./pdf-render.js";

const MAX_FILE_BYTES = 60 * 1024 * 1024;
const MAX_PAGES = 80;

const profiles = {
  balanced: { dpi: 144, quality: 0.72, label: "Ausgewogen" },
  compact: { dpi: 108, quality: 0.58, label: "Möglichst klein" },
  print: { dpi: 192, quality: 0.84, label: "Bessere Qualität" },
  structure: { label: "Struktur erhalten" }
};

const elements = {
  dropzone: document.querySelector("[data-compress-dropzone]"),
  input: document.querySelector("[data-compress-input]"),
  file: document.querySelector("[data-compress-file]"),
  error: document.querySelector("[data-compress-error]"),
  notice: document.querySelector("[data-compress-notice]"),
  modes: document.querySelectorAll("[data-compress-mode]"),
  preview: document.querySelector("[data-compress-preview]"),
  previewEmpty: document.querySelector("[data-compress-preview-empty]"),
  fileName: document.querySelector("[data-compress-file-name]"),
  fileMeta: document.querySelector("[data-compress-file-meta]"),
  pages: document.querySelector("[data-compress-pages]"),
  inputSize: document.querySelector("[data-compress-input-size]"),
  progress: document.querySelector("[data-compress-progress]"),
  reset: document.querySelector("[data-compress-reset]"),
  process: document.querySelector("[data-compress-process]"),
  resultPanel: document.querySelector("[data-compress-result-panel]"),
  resultName: document.querySelector("[data-compress-result-name]"),
  resultMeta: document.querySelector("[data-compress-result-meta]"),
  resultStatus: document.querySelector("[data-compress-result-status]"),
  download: document.querySelector("[data-compress-download]")
};

let sourceFile = null;
let sourceBytes = null;
let previewPdf = null;
let activeProfile = "balanced";
let currentOutput = null;
let compressionTimer = 0;
let compressionRun = 0;

function setError(message = "") {
  elements.error.querySelector("span").textContent = message;
  elements.error.hidden = !message;
}

function setNotice(message = "") {
  elements.notice.querySelector("span").textContent = message;
  elements.notice.hidden = !message;
}

function isPdf(file) {
  return file && (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
}

async function selectFile(file) {
  window.clearTimeout(compressionTimer);
  compressionRun += 1;
  setError();
  setNotice();
  clearResult();

  if (!isPdf(file)) {
    setError("Wähle eine PDF-Datei aus.");
    return;
  }
  if (file.size > MAX_FILE_BYTES) {
    setError("Die PDF ist größer als 60 MB. Teile sie zuerst in kleinere Abschnitte.");
    return;
  }

  await destroyPdf(previewPdf);
  previewPdf = null;
  sourceFile = file;
  sourceBytes = new Uint8Array(await file.arrayBuffer());

  try {
    previewPdf = await openPdf(sourceBytes);
    if (previewPdf.numPages > MAX_PAGES) {
      throw new Error(`Die PDF hat ${previewPdf.numPages} Seiten. Dieses Werkzeug verarbeitet höchstens ${MAX_PAGES} Seiten pro Durchgang.`);
    }

    await renderPdfPage(previewPdf, 1, {
      canvas: elements.preview,
      dpi: 96,
      maxPixels: 4_000_000
    });
    elements.preview.hidden = false;
    elements.previewEmpty.hidden = true;
    elements.file.hidden = false;
    elements.fileName.textContent = file.name;
    elements.fileMeta.textContent = `${previewPdf.numPages} ${previewPdf.numPages === 1 ? "Seite" : "Seiten"} · ${formatBytes(file.size)}`;
    elements.pages.textContent = String(previewPdf.numPages);
    elements.inputSize.textContent = formatBytes(file.size);
    elements.process.disabled = false;
    scheduleCompression();
  } catch (error) {
    await destroyPdf(previewPdf);
    previewPdf = null;
    sourceFile = null;
    sourceBytes = null;
    elements.file.hidden = true;
    elements.preview.hidden = true;
    elements.previewEmpty.hidden = false;
    elements.process.disabled = true;
    setError(error instanceof Error ? error.message : "Die PDF konnte nicht geöffnet werden. Sie ist möglicherweise geschützt oder beschädigt.");
  }
}

function selectProfile(profile) {
  activeProfile = profile;
  elements.modes.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.compressMode === profile));
  });
  clearResult();
  setNotice(profile === "structure"
    ? "Dieser Modus bewahrt Text, Links und Formularfelder. Eine neue Datei wird nur angeboten, wenn sie wirklich kleiner ist."
    : "Das Werkzeug versucht zuerst, die vorhandene PDF zu optimieren. Nur wenn ein Neuaufbau der Seiten stärker spart, werden Textauswahl, Links und Formulare entfernt.");
  scheduleCompression();
}

function scheduleCompression() {
  window.clearTimeout(compressionTimer);
  compressionRun += 1;
  if (!sourceFile || !sourceBytes || !previewPdf) return;
  const scheduledRun = compressionRun;
  compressionTimer = window.setTimeout(() => compressPdf(scheduledRun), 220);
}

async function rebuildWithImages(profile, sourcePdf) {
  const result = await PDFDocument.create();
  result.setCreator("Andersen Web Tools");
  result.setProducer("Andersen Web Tools");

  for (let pageNumber = 1; pageNumber <= sourcePdf.numPages; pageNumber += 1) {
    elements.progress.textContent = `Seite ${pageNumber} von ${sourcePdf.numPages} wird verarbeitet …`;
    const rendered = await renderPdfPage(sourcePdf, pageNumber, {
      dpi: profile.dpi,
      maxPixels: 18_000_000
    });
    const imageBlob = await canvasToBlob(rendered.canvas, "image/jpeg", profile.quality);
    const imageBytes = new Uint8Array(await imageBlob.arrayBuffer());
    const image = await result.embedJpg(imageBytes);
    const page = result.addPage([rendered.baseViewport.width, rendered.baseViewport.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: page.getWidth(),
      height: page.getHeight()
    });
    rendered.canvas.width = 1;
    rendered.canvas.height = 1;
  }

  return result.save({ useObjectStreams: true });
}

async function hasDigitalSignature(bytes) {
  const document = await PDFDocument.load(bytes.slice(), {
    ignoreEncryption: true,
    updateMetadata: false
  });
  return document.getForm().getFields().some((field) => field instanceof PDFSignature);
}

async function createBoundedQpdfRunner() {
  await WebAssembly.compile(new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]));

  const runnerPromise = createQpdfRunner({
    workerUrl: qpdfWorkerUrl,
    qpdfJsUrl,
    wasmUrl: qpdfWasmUrl,
    timeoutMs: 120_000
  });
  let didTimeOut = false;
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      didTimeOut = true;
      reject(new Error("Die PDF-Optimierung konnte nicht gestartet werden."));
    }, 30_000);
  });

  try {
    return await Promise.race([runnerPromise, timeoutPromise]);
  } finally {
    window.clearTimeout(timeoutId);
    if (didTimeOut) {
      runnerPromise.then((runner) => runner.destroy()).catch(() => {});
    }
  }
}

async function optimizeStructure(bytes, { optimizeImages = false } = {}) {
  const runner = await createBoundedQpdfRunner();

  try {
    const inputName = "input.pdf";
    const outputName = "output.pdf";
    const args = [
      "--object-streams=generate",
      "--stream-data=compress",
      "--recompress-flate",
      "--compression-level=9"
    ];
    if (optimizeImages) {
      args.push(
        "--optimize-images",
        "--oi-min-width=96",
        "--oi-min-height=96",
        "--oi-min-area=9216"
      );
    }
    args.push("--", inputName, outputName);

    return await runner.runOne({
      input: bytes,
      inputName,
      outputName,
      args
    });
  } finally {
    await runner.destroy();
  }
}

async function validateCandidate(bytes, sourcePdf) {
  const candidate = await openPdf(bytes);
  try {
    if (candidate.numPages !== sourcePdf.numPages) return false;

    const pagesToCheck = candidate.numPages === 1 ? [1] : [1, candidate.numPages];
    for (const pageNumber of pagesToCheck) {
      const [sourcePage, candidatePage] = await Promise.all([
        sourcePdf.getPage(pageNumber),
        candidate.getPage(pageNumber)
      ]);
      const sourceViewport = sourcePage.getViewport({ scale: 1 });
      const candidateViewport = candidatePage.getViewport({ scale: 1 });
      sourcePage.cleanup();
      candidatePage.cleanup();

      if (Math.abs(sourceViewport.width - candidateViewport.width) > 0.5) return false;
      if (Math.abs(sourceViewport.height - candidateViewport.height) > 0.5) return false;
    }
    return true;
  } finally {
    await destroyPdf(candidate);
  }
}

async function getCompressionCandidates(profileName, profile, bytes, sourcePdf, isCurrent) {
  const candidates = [];
  const canOptimizeImages = profileName === "balanced" || profileName === "compact";

  elements.progress.textContent = "Dokumentstruktur wird optimiert …";
  try {
    candidates.push({
      bytes: await optimizeStructure(bytes, { optimizeImages: canOptimizeImages }),
      kind: "structure"
    });
  } catch (error) {
    if (profileName === "structure") throw error;
  }

  if (!isCurrent()) return [];

  if (profileName !== "structure") {
    elements.progress.textContent = "Bildvariante wird geprüft …";
    try {
      candidates.push({
        bytes: await rebuildWithImages(profile, sourcePdf),
        kind: "raster"
      });
    } catch (error) {
      if (!candidates.length) throw error;
    }
  }

  if (!isCurrent()) return [];

  const validated = [];
  for (const candidate of candidates) {
    try {
      if (await validateCandidate(candidate.bytes, sourcePdf)) validated.push(candidate);
    } catch {
      // A broken candidate is discarded; another valid route may still succeed.
    }
  }
  if (!validated.length && candidates.length) throw new Error("Keine gültige PDF-Ausgabe erzeugt.");
  return validated.sort((first, second) => first.bytes.byteLength - second.bytes.byteLength);
}

function showNoOutput(profile, message) {
  currentOutput = null;
  elements.resultName.textContent = sourceFile.name;
  elements.resultMeta.textContent = `${formatBytes(sourceFile.size)} · ${profile.label}`;
  elements.resultStatus.textContent = message;
  elements.resultStatus.dataset.state = "warning";
  elements.download.hidden = true;
  elements.resultPanel.hidden = false;
  refreshIcons(elements.resultPanel);
  elements.resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function compressPdf(scheduledRun = compressionRun) {
  if (!sourceFile || !sourceBytes || !previewPdf) return;
  const runState = {
    file: sourceFile,
    bytes: sourceBytes,
    pdf: previewPdf,
    profileName: activeProfile,
    profile: profiles[activeProfile]
  };
  const isCurrent = () => scheduledRun === compressionRun;
  setError();
  clearResult();
  elements.progress.textContent = "PDF wird vorbereitet …";
  setButtonLoading(elements.process, true, "PDF wird verkleinert");

  try {
    if (await hasDigitalSignature(runState.bytes)) {
      if (!isCurrent()) return;
      showNoOutput(runState.profile, "Die PDF enthält eine digitale Signatur. Jede Änderung würde sie ungültig machen. Deshalb wurde keine neue Datei erzeugt.");
      return;
    }

    const candidates = await getCompressionCandidates(
      runState.profileName,
      runState.profile,
      runState.bytes,
      runState.pdf,
      isCurrent
    );
    if (!isCurrent()) return;

    const candidate = candidates.find((item) => item.bytes.byteLength < runState.file.size);
    if (!candidate) {
      showNoOutput(runState.profile, "Das Original ist bereits kleiner als die geprüften Varianten. Es wurde keine größere Ersatzdatei erzeugt.");
      return;
    }

    const bytes = candidate.bytes;
    const fileName = `${sanitizeFileStem(runState.file.name.slice(0, -4))}-verkleinert.pdf`;
    const blob = new Blob([bytes], { type: "application/pdf" });
    const savedBytes = runState.file.size - blob.size;
    const savedPercent = runState.file.size > 0 ? Math.round((savedBytes / runState.file.size) * 100) : 0;
    currentOutput = { blob, fileName };

    elements.resultName.textContent = fileName;
    elements.resultMeta.textContent = `${formatBytes(runState.file.size)} → ${formatBytes(blob.size)} · ${runState.profile.label}`;
    elements.resultStatus.textContent = candidate.kind === "structure"
      ? `${formatBytes(savedBytes)} gespart (${savedPercent} % kleiner). Text, Links und Formularfelder bleiben erhalten.`
      : `${formatBytes(savedBytes)} gespart (${savedPercent} % kleiner). Die Seiten wurden als Bilder neu aufgebaut.`;
    elements.resultStatus.dataset.state = "success";
    elements.download.hidden = false;
    elements.resultPanel.hidden = false;
    refreshIcons(elements.resultPanel);
    elements.resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch {
    if (isCurrent()) {
      setError("Die PDF konnte nicht verarbeitet werden. Geschützte, beschädigte oder sehr komplexe Dateien können den Browser überfordern.");
    }
  } finally {
    if (isCurrent()) {
      elements.progress.textContent = "";
      setButtonLoading(elements.process, false);
    }
  }
}

function clearResult() {
  currentOutput = null;
  elements.download.hidden = true;
  elements.resultPanel.hidden = true;
}

async function resetAll() {
  await destroyPdf(previewPdf);
  previewPdf = null;
  sourceFile = null;
  sourceBytes = null;
  elements.input.value = "";
  elements.file.hidden = true;
  elements.preview.hidden = true;
  elements.previewEmpty.hidden = false;
  elements.pages.textContent = "0";
  elements.inputSize.textContent = "0 B";
  elements.process.disabled = true;
  setError();
  clearResult();
  selectProfile("balanced");
}

elements.input.addEventListener("change", () => selectFile(elements.input.files[0]));
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
  selectFile(event.dataTransfer.files[0]);
});
elements.modes.forEach((button) => button.addEventListener("click", () => selectProfile(button.dataset.compressMode)));
elements.process.addEventListener("click", () => compressPdf(compressionRun));
elements.reset.addEventListener("click", resetAll);
elements.download.addEventListener("click", () => {
  if (currentOutput) downloadBlob(currentOutput.blob, currentOutput.fileName);
});

selectProfile("balanced");
refreshIcons();
