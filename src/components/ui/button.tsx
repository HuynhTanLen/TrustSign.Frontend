import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** `inverse` is the primary action on the navy top bar. */
  variant?: "primary" | "secondary" | "danger" | "ghost" | "link" | "inverse";
  /** Kept for existing callers; every button is 36px high in the design system. */
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variants = {
  primary: "h-control px-4 bg-primary border-primary text-white hover:bg-primary-hover hover:border-primary-hover",
  secondary: "h-control px-4 bg-surface border-line text-fg hover:bg-page",
  danger: "h-control px-4 bg-danger border-danger text-white hover:bg-danger-hover hover:border-danger-hover",
  ghost: "h-control px-4 bg-transparent border-transparent text-fg hover:bg-page",
  link: "p-0 bg-transparent border-transparent text-primary underline underline-offset-2 hover:text-primary-hover",
  inverse: "h-control px-4 bg-white border-white text-primary hover:bg-selected hover:border-selected",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className = "", variant = "primary", size, isLoading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm font-semibold cursor-pointer select-none enabled:active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
        {...props}
      >
        {isLoading && (
          <span
            aria-hidden="true"
            className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
