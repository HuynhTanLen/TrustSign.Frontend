import * as React from "react";

export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-[4px] bg-[#e1e4e8] ${className}`}
      {...props}
    />
  );
}
