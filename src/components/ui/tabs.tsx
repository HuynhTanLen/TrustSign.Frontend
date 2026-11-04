"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
  className?: string;
}

export function Tabs({
  tabs,
  value,
  onChange,
  ariaLabel = "Chuyển đổi mục hiển thị",
  className = "",
}: TabsProps) {
  const listRef = React.useRef<HTMLDivElement>(null);
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = React.useState<{ left: number; width: number } | null>(null);
  const selectedIndex = tabs.findIndex((t) => t.id === value);

  const updateIndicator = React.useCallback(() => {
    const el = refs.current[selectedIndex];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    } else {
      setIndicator(null);
    }
  }, [selectedIndex]);

  React.useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator, tabs]);

  React.useEffect(() => {
    const container = listRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => updateIndicator());
    observer.observe(container);
    return () => observer.disconnect();
  }, [updateIndicator]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const enabledIndices = tabs
      .map((t, idx) => (t.disabled ? -1 : idx))
      .filter((idx) => idx !== -1);
    if (enabledIndices.length === 0) return;

    const currentPos = enabledIndices.indexOf(index);
    let targetIndex: number | null = null;

    if (e.key === "ArrowRight") {
      targetIndex = enabledIndices[(currentPos + 1) % enabledIndices.length];
    } else if (e.key === "ArrowLeft") {
      targetIndex =
        enabledIndices[(currentPos - 1 + enabledIndices.length) % enabledIndices.length];
    } else if (e.key === "Home") {
      targetIndex = enabledIndices[0];
    } else if (e.key === "End") {
      targetIndex = enabledIndices[enabledIndices.length - 1];
    }

    if (targetIndex !== null) {
      e.preventDefault();
      onChange(tabs[targetIndex].id);
      refs.current[targetIndex]?.focus();
    }
  };

  if (tabs.length === 0) return null;

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "relative flex items-center gap-6 border-b border-line overflow-x-auto",
        className,
      )}
    >
      {tabs.map((tab, i) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            disabled={tab.disabled}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => !tab.disabled && onChange(tab.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "inline-flex items-center gap-2 h-11 px-1 text-sm font-semibold cursor-pointer whitespace-nowrap select-none",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              selected ? "text-primary" : "text-muted hover:text-fg",
            )}
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span
                className={cn(
                  "inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-xs font-semibold tabular-nums",
                  selected
                    ? "bg-selected text-primary"
                    : "bg-strip text-muted border border-line",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
      {indicator && (
        <span
          aria-hidden="true"
          className="absolute -bottom-px left-0 h-[2.5px] rounded-t-full bg-primary transition-[transform,width] duration-200 ease-out pointer-events-none"
          style={{ width: indicator.width, transform: `translateX(${indicator.left}px)` }}
        />
      )}
    </div>
  );
}
