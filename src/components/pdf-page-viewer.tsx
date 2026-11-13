"use client";

import * as React from "react";
import * as pdfjsLib from "pdfjs-dist";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

/** Đếm số trang để đặt ô ký vào trang cuối trước khi viewer kịp hiển thị. */
export async function countPdfPages(file: File): Promise<number> {
  const task = pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  try {
    return (await task.promise).numPages;
  } finally {
    void task.destroy();
  }
}

export interface PdfPageViewerProps {
  file: File;
  pageNumber: number;
  onLoaded?: (totalPages: number) => void;
}

export function PdfPageViewer({ file, pageNumber, onLoaded }: PdfPageViewerProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const pdfDocRef = React.useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  const handleLoaded = React.useEffectEvent((pages: number) => {
    onLoaded?.(pages);
  });

  const getPageNumber = React.useEffectEvent(() => pageNumber);

  React.useEffect(() => {
    let cancelled = false;

    const loadDoc = async () => {
      try {
        setLoading(true);
        setError(null);
        const buffer = await file.arrayBuffer();
        if (cancelled) return;
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        pdfDocRef.current = pdf;
        handleLoaded(pdf.numPages);

        const clampedPage = Math.max(1, Math.min(pdf.numPages, getPageNumber()));
        const page = await pdf.getPage(clampedPage);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Viewport scale 1.5 để chữ sắc nét
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = "100%";
        canvas.style.height = "auto";

        await page.render({
          canvasContext: ctx,
          viewport,
          canvas,
        }).promise;

        if (!cancelled) {
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Không thể tải trang PDF");
          setLoading(false);
        }
      }
    };

    loadDoc();

    return () => {
      cancelled = true;
    };
  }, [file]);

  React.useEffect(() => {
    let cancelled = false;
    if (!pdfDocRef.current) return;

    const renderActivePage = async () => {
      try {
        setLoading(true);
        const pdf = pdfDocRef.current!;
        const clampedPage = Math.max(1, Math.min(pdf.numPages, pageNumber));
        const page = await pdf.getPage(clampedPage);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const viewport = page.getViewport({ scale: 1.5 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = "100%";
        canvas.style.height = "auto";

        await page.render({
          canvasContext: ctx,
          viewport,
          canvas,
        }).promise;

        if (!cancelled) {
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Lỗi khi chuyển trang");
          setLoading(false);
        }
      }
    };

    renderActivePage();

    return () => {
      cancelled = true;
    };
  }, [pageNumber]);

  return (
    // Chỉ giữ chiều cao tối thiểu khi chưa có trang: nếu không, trang bị căn giữa và lệch khỏi tọa độ ô ký.
    <div
      className={`relative w-full bg-slate-50 rounded-sm overflow-hidden ${
        loading || error ? "min-h-[780px] flex items-center justify-center" : ""
      }`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10 text-xs font-semibold text-muted">
          Đang tải trang {pageNumber}...
        </div>
      )}
      {error ? (
        <div className="p-6 text-xs text-danger text-center font-medium">{error}</div>
      ) : (
        <canvas ref={canvasRef} className="w-full h-auto block select-none pointer-events-none" />
      )}
    </div>
  );
}
