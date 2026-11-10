/** Cắt vuông ở giữa và thu về size×size JPEG; giảm chất lượng dần cho tới khi vừa giới hạn byte của máy chủ. */
export async function resizeToSquareJpeg(file: File, size = 256, maxBytes = 120 * 1024): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const side = Math.min(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Trình duyệt không hỗ trợ xử lý ảnh.");
    ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);

    for (let quality = 0.9; quality >= 0.4; quality -= 0.1) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= maxBytes) return blob;
    }
    throw new Error("Không thu nhỏ được ảnh xuống dưới 128 KB.");
  } finally {
    bitmap.close();
  }
}
