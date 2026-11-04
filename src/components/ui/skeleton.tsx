import * as React from "react";
import { cn } from "@/lib/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Hình dạng hiển thị nhanh cho avatar hoặc dòng văn bản. */
  variant?: "rect" | "circle" | "text";
}

export function Skeleton({
  className = "",
  variant = "rect",
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse bg-skeleton",
        variant === "circle" && "rounded-full",
        variant === "text" && "rounded-sm h-4",
        variant === "rect" && "rounded-md",
        className,
      )}
      {...props}
    />
  );
}
