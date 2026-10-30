import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** `inverse` dùng cho hành động nổi bật trên nền tối (navy panel). */
  variant?: "primary" | "secondary" | "danger" | "ghost" | "link" | "inverse";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const sizes = {
  sm: "h-9 px-3.5 text-xs gap-1.5 rounded-md",
  md: "h-control px-4 text-sm gap-2 rounded-md",
  lg: "h-12 px-6 text-[15px] gap-2.5 rounded-lg",
};

const variants = {
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
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center whitespace-nowrap border font-semibold cursor-pointer select-none enabled:active:translate-y-px disabled:opacity-55 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`}
        {...props}
      >
        {isLoading && (
          <span
            aria-hidden="true"
            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"
          />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
