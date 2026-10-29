"use client";

import * as React from "react";

export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, value, onChange, className = "" }: TabsProps) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = React.useState<{ left: number; width: number } | null>(null);
  const selectedIndex = tabs.findIndex((t) => t.id === value);

  // The underline slides to the selected tab; measured after layout so it follows label widths.
  React.useLayoutEffect(() => {
    const el = refs.current[selectedIndex];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [selectedIndex, tabs]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + tabs.length) % tabs.length;
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" className={`relative flex gap-6 border-b border-line ${className}`}>
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
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`h-row text-sm font-semibold cursor-pointer whitespace-nowrap ${
              selected ? "text-primary" : "text-muted hover:text-fg"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
      {indicator && (
        <span
          aria-hidden="true"
          className="absolute -bottom-px left-0 h-0.5 bg-primary transition-[transform,width] duration-200 ease-out"
          style={{ width: indicator.width, transform: `translateX(${indicator.left}px)` }}
        />
      )}
    </div>
  );
}
