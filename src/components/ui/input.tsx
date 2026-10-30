import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    const messageId = `${inputId}-message`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-semibold text-fg">
            {label} {props.required && <span className="text-danger">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted [&_svg]:w-4 [&_svg]:h-4">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || helperText ? messageId : undefined}
            className={`w-full h-control rounded-md border bg-surface text-sm text-fg shadow-xs placeholder:text-muted/75 focus:outline-none focus:ring-3 disabled:cursor-not-allowed disabled:bg-strip disabled:text-muted ${
              leftIcon ? "pl-10" : "pl-3.5"
            } ${rightIcon ? "pr-10" : "pr-3.5"} ${
              error
                ? "border-danger focus:border-danger focus:ring-danger/15"
                : "border-line-strong hover:border-muted/60 focus:border-primary focus:ring-primary/15"
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted [&_svg]:w-4 [&_svg]:h-4">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={messageId} className="text-xs font-medium text-danger">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={messageId} className="text-xs text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
