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
  sm: "h-9 px-3.5 text-xs gap-1.5 rounded-sm",
  md: "h-10 px-4 text-sm gap-2 rounded-sm",
  lg: "h-11 px-6 text-sm gap-2.5 rounded-md font-bold",
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#1B4332] text-white border border-[#143326]/30 shadow-xs hover:bg-[#143326] hover:shadow-md",
  accent:
    "bg-[#1B4332] text-white border border-[#143326]/30 shadow-xs hover:bg-[#143326] hover:shadow-md",
  gradient:
    "bg-[#1B4332] text-white border border-[#143326]/30 shadow-xs hover:bg-[#143326] hover:shadow-md",
  secondary:
    "bg-white border-slate-300 text-[#1A2922] shadow-xs hover:bg-[#F5F4EF] hover:border-[#1B4332]/40 hover:text-[#1B4332]",
  danger:
    "bg-[#8C2D2D] text-white border border-[#732323]/30 shadow-xs hover:bg-[#732323] hover:shadow-md",
  success:
    "bg-[#1B4332] text-white border border-[#143326]/30 shadow-xs hover:bg-[#143326] hover:shadow-md",
  ghost:
    "bg-transparent border-transparent text-[#1A2922] hover:bg-[#F5F4EF] hover:text-[#1B4332] shadow-none",
  link:
    "!h-auto !p-0 bg-transparent border-transparent text-[#1B4332] underline underline-offset-4 hover:text-[#143326] shadow-none",
  inverse:
    "bg-white border border-[#E6E4DC] text-[#1A2922] shadow-sm hover:bg-[#F5F4EF] hover:text-[#1B4332]",
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
