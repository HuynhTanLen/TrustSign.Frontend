"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "link"
  | "inverse";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** `inverse` dùng cho hành động nổi bật trên nền tối (navy panel). */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Hiển thị trạng thái đang xử lý bất đồng bộ và khóa tương tác lặp. */
  isLoading?: boolean;
  /** Văn bản thay thế khi đang loading (nếu bỏ qua sẽ giữ nguyên `children`). */
  loadingText?: React.ReactNode;
  /** Biểu tượng hiển thị bên trái nhãn nút. */
  leftIcon?: React.ReactNode;
  /** Biểu tượng hiển thị bên phải nhãn nút. */
  rightIcon?: React.ReactNode;
  /** Mở rộng toàn bộ chiều ngang khung chứa. */
  fullWidth?: boolean;
}

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-xs gap-1.5 rounded-md",
  md: "h-control px-4 text-sm gap-2 rounded-md",
  lg: "h-12 px-6 text-[15px] gap-2.5 rounded-lg",
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary border-primary text-white shadow-button hover:bg-primary-hover hover:border-primary-hover",
  secondary:
    "bg-surface border-line-strong text-fg shadow-xs hover:bg-strip hover:border-muted/50",
  danger:
    "bg-danger border-danger text-white shadow-button hover:bg-danger-hover hover:border-danger-hover",
  ghost:
    "bg-transparent border-transparent text-fg hover:bg-selected/60",
  link:
    "!h-auto !p-0 bg-transparent border-transparent text-primary underline underline-offset-4 hover:text-primary-hover",
  inverse:
    "bg-white border-white text-primary shadow-sm hover:bg-selected hover:border-selected",
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
      disabled,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const isDisabled = Boolean(disabled || isLoading);

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
          "inline-flex items-center justify-center whitespace-nowrap border font-semibold cursor-pointer select-none",
          "enabled:active:translate-y-px disabled:opacity-55 disabled:cursor-not-allowed",
          sizes[size],
          variants[variant],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <span
            aria-hidden="true"
            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"
          />
        ) : (
          leftIcon && (
            <span aria-hidden="true" className="inline-flex items-center shrink-0 [&_svg]:w-4 [&_svg]:h-4">
              {leftIcon}
            </span>
          )
        )}
        {isLoading && loadingText ? loadingText : children}
        {!isLoading && rightIcon && (
          <span aria-hidden="true" className="inline-flex items-center shrink-0 [&_svg]:w-4 [&_svg]:h-4">
            {rightIcon}
          </span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
