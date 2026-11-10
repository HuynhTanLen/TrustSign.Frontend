"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

/** Ảnh đại diện; chưa có ảnh hoặc ảnh lỗi (URL hết hạn) thì hiện chữ cái đầu của tên. */
export function Avatar({
  name,
  src,
  className,
}: {
  name?: string;
  src?: string | null;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-white font-bold select-none",
        className ?? "h-7 w-7 text-xs",
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- URL ký từ API, không qua tối ưu ảnh của Next
        <img src={src!} alt="" className="h-full w-full object-cover" onError={() => setFailedSrc(src ?? null)} />
      ) : (
        (name?.trim().slice(0, 1).toUpperCase() || "?")
      )}
    </span>
  );
}
