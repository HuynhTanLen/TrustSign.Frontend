import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", isLoading = false, disabled, children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.99]";

    const variants = {
      primary:
        "bg-primary hover:bg-primary-hover text-white shadow-sm shadow-indigo-500/15 focus:ring-primary/30 border border-primary",
      secondary:
        "bg-surface hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 shadow-2xs focus:ring-slate-200",
      danger:
        "bg-danger hover:bg-red-700 text-white shadow-sm shadow-red-500/15 focus:ring-danger/30 border border-danger",
      ghost:
        "bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900 focus:ring-slate-200",
      link:
        "bg-transparent text-primary hover:text-primary-hover hover:underline p-0 h-auto font-semibold focus:ring-0",
    };

    const sizes = {
      sm: "h-10 px-4 text-sm gap-2 rounded-lg",
      md: "h-11 px-5 text-sm gap-2 rounded-xl",
      lg: "h-12 px-7 text-base gap-2.5 rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${base} ${variants[variant]} ${variant !== "link" ? sizes[size] : ""} ${className}`}
        {...props}
      >
        {isLoading && (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
