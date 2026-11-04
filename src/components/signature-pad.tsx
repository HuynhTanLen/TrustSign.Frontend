"use client";

import * as React from "react";
import { Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SIGNATURE_CANVAS = { width: 560, height: 200 };
const CANVAS_W = SIGNATURE_CANVAS.width;
const CANVAS_H = SIGNATURE_CANVAS.height;

/** Khung vẽ chữ ký tay bằng chuột hoặc cảm ứng; xuất ra chuỗi ảnh PNG nền trong suốt. */
export function SignaturePad({
  ink,
  onChange,
}: {
  ink: string;
  onChange: (png: string | null) => void;
}) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const drawing = React.useRef(false);
  const [hasStroke, setHasStroke] = React.useState(false);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const width = r.width || 1;
    const height = r.height || 1;
    return {
      x: ((e.clientX - r.left) / width) * CANVAS_W,
      y: ((e.clientY - r.top) / height) * CANVAS_H,
    };
  };

  const clear = () => {
    ref.current?.getContext("2d")?.clearRect(0, 0, CANVAS_W, CANVAS_H);
    setHasStroke(false);
    onChange(null);
  };

  const finishStroke = (canvas: HTMLCanvasElement) => {
    if (!drawing.current) return;
    drawing.current = false;
    setHasStroke(true);
    onChange(canvas.toDataURL("image/png"));
  };

  return (
    <div className="flex flex-col gap-2">
      <canvas
        ref={ref}
        width={CANVAS_W}
        height={CANVAS_H}
        role="img"
        aria-label="Khung vẽ chữ ký tay"
        className="w-full aspect-[56/20] rounded-md border border-line-strong transparent-checkerboard touch-none cursor-crosshair"
        onPointerDown={(e) => {
          const ctx = e.currentTarget.getContext("2d");
          if (!ctx) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drawing.current = true;
          const p = point(e);
          ctx.strokeStyle = ink;
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = e.currentTarget.getContext("2d");
          const p = point(e);
          ctx?.lineTo(p.x, p.y);
          ctx?.stroke();
        }}
        onPointerUp={(e) => finishStroke(e.currentTarget)}
        onPointerCancel={(e) => finishStroke(e.currentTarget)}
      />
      <div className="flex justify-between items-center gap-2">
        <span className="text-xs text-muted">Ký bằng chuột hoặc ngón tay trong khung.</span>
        <Button variant="ghost" size="sm" onClick={clear} disabled={!hasStroke}>
          <Eraser className="w-4 h-4" aria-hidden="true" />
          Xóa nét
        </Button>
      </div>
    </div>
  );
}
