export async function decodeImage(blob) {
  if ("createImageBitmap" in window) {
    try {
      const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });
      return {
        close: () => bitmap.close(),
        height: bitmap.height,
        source: bitmap,
        width: bitmap.width
      };
    } catch {
      try {
        const bitmap = await createImageBitmap(blob);
        return {
          close: () => bitmap.close(),
          height: bitmap.height,
          source: bitmap,
          width: bitmap.width
        };
      } catch {
        // Ältere Browser erhalten darunter den Image-Fallback.
      }
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => resolve({
      close: () => URL.revokeObjectURL(url),
      height: image.naturalHeight,
      source: image,
      width: image.naturalWidth
    });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Das Bild konnte nicht gelesen werden."));
    };
    image.src = url;
  });
}

export function limitedDimensions(width, height, maxWidth = 0, maxPixels = 24_000_000) {
  let scale = 1;
  if (maxWidth > 0 && width > maxWidth) scale = maxWidth / width;
  const scaledPixels = width * height * scale * scale;
  if (scaledPixels > maxPixels) scale *= Math.sqrt(maxPixels / scaledPixels);
  return {
    height: Math.max(1, Math.round(height * scale)),
    width: Math.max(1, Math.round(width * scale))
  };
}

export function imageCanvasBlob(canvas, type = "image/jpeg", quality = 0.9) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Der Browser konnte die Bilddatei nicht speichern."));
    }, type, quality);
  });
}

export async function redrawImage(blob, options = {}) {
  const decoded = await decodeImage(blob);
  try {
    const dimensions = limitedDimensions(
      decoded.width,
      decoded.height,
      Number(options.maxWidth) || 0,
      Number(options.maxPixels) || 24_000_000
    );
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext("2d", { alpha: options.type === "image/png" });
    if (options.type !== "image/png") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);
    const output = await imageCanvasBlob(canvas, options.type || "image/jpeg", Number(options.quality) || 0.9);
    return {
      blob: output,
      height: dimensions.height,
      width: dimensions.width
    };
  } finally {
    decoded.close();
  }
}
