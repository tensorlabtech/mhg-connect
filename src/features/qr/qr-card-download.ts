/** html-to-image's final raster step waits for RAF, which can stop in hidden tabs. */
export async function rasterizeCardSvg(
  svgDataUrl: string,
  width: number,
  height: number,
): Promise<string> {
  if (
    ![width, height].every(
      (size) => Number.isFinite(size) && size > 0 && size <= 8192,
    )
  )
    throw new Error("Kích thước ảnh thẻ chưa hợp lệ.");
  const image = new Image();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await new Promise<void>((resolve, reject) => {
      timer = setTimeout(
        () => reject(new Error("Xuất ảnh quá lâu. Hãy thử tải lại.")),
        15_000,
      );
      image.onload = () => resolve();
      image.onerror = () =>
        reject(new Error("Chưa thể tạo ảnh thẻ. Hãy thử lại."));
      image.src = svgDataUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width);
    canvas.height = Math.round(height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Trình duyệt chưa hỗ trợ xuất ảnh thẻ.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } finally {
    clearTimeout(timer);
    image.onload = image.onerror = null;
  }
}

/** A blob URL avoids browser limits on large PNG data URLs. Nothing is uploaded. */
export async function downloadCardPng(dataUrl: string, filename: string) {
  const blob = await (await fetch(dataUrl)).blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  try {
    document.body.append(link);
    link.click();
  } finally {
    link.remove();
    // Do not revoke before the browser has consumed the download.
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }
}
