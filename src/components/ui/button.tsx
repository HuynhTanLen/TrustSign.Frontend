"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "gradient"
  | "danger"
  | "success"
  | "ghost"
  | "link"
  | "inverse";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  glow?: boolean;
  shimmer?: boolean;
}

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-11 px-6 text-sm gap-2.5 rounded-xl font-bold",
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white border border-blue-700/20 shadow-xs hover:bg-blue-700 hover:shadow-md",
  accent:
    "bg-[#1e40af] text-white border border-[#1e40af]/30 shadow-xs hover:bg-[#1e3a8a] hover:shadow-md",
  gradient:
    "bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white border border-blue-800/30 shadow-xs hover:brightness-105 hover:shadow-md",
  secondary:
    "bg-white border-slate-300 text-slate-800 shadow-xs hover:bg-slate-50 hover:border-slate-400 hover:text-blue-700",
  danger:
    "bg-red-600 text-white border border-red-700/20 shadow-xs hover:bg-red-700 hover:shadow-md",
  success:
    "bg-emerald-600 text-white border border-emerald-700/20 shadow-xs hover:bg-emerald-700 hover:shadow-md",
  ghost:
    "bg-transparent border-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-none",
  link:
    "!h-auto !p-0 bg-transparent border-transparent text-blue-600 underline underline-offset-4 hover:text-blue-800 shadow-none",
  inverse:
    "bg-white border border-slate-200 text-slate-900 shadow-sm hover:bg-slate-50 hover:text-blue-700",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      type = "button",
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      glow = false,
      shimmer = true,
      disabled,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const isDisabled = Boolean(disabled || isLoading);

    const shouldShimmer =
      shimmer &&
      (variant === "primary" ||
        variant === "accent" ||
        variant === "gradient" ||
        variant === "danger" ||
        variant === "success");

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={isLoading || undefined}
        onClick={handleClick}
        className={cn(
          "group relative inline-flex items-center justify-center whitespace-nowrap font-semibold select-none",
          "overflow-hidden cursor-pointer transition-all duration-150 ease-out",
          // Tactile & Clean Interactive Feedback (No neon)
          "enabled:hover:-translate-y-0.5 enabled:active:translate-y-0 enabled:active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
          sizes[size],
          variants[variant],
          glow && "ring-2 ring-blue-600/20",
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {/* Subtle Shimmer Light Reflection */}
        {shouldShimmer && !isDisabled && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/15 to-transparent"
          />
        )}

        {/* Content Container */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <span
              aria-hidden="true"
              className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"
            />
          ) : (
            leftIcon && (
              <span
                aria-hidden="true"
                className="inline-flex items-center shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5 [&_svg]:w-4 [&_svg]:h-4"
              >
                {leftIcon}
              </span>
            )
          )}

          {isLoading && loadingText ? (
            <span className="truncate">{loadingText}</span>
          ) : (
            <span className="inline-flex items-center justify-center gap-2 truncate [&_svg]:inline-block [&_svg]:shrink-0 [&_svg]:w-4 [&_svg]:h-4">
              {children}
            </span>
          )}

          {!isLoading && rightIcon && (
            <span
              aria-hidden="true"
              className="inline-flex items-center shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 [&_svg]:w-4 [&_svg]:h-4"
            >
              {rightIcon}
            </span>
          )}
        </span>
      </button>
    );
  },
);

Button.displayName = "Button";
