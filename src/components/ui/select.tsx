import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: React.ReactNode;
  error?: string;
  helperText?: React.ReactNode;
  options?: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = "",
      containerClassName = "",
      label,
      error,
      helperText,
      options,
      placeholder,
      id,
      children,
      ...props
    },
    ref,
  ) => {
    const autoId = React.useId();
    const selectId = id ?? autoId;
    const messageId = `${selectId}-message`;

    return (
      <div className={cn("group w-full flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label htmlFor={selectId} className="text-[13px] font-semibold text-fg">
            {label}
            {props.required && (
              <span aria-hidden="true" className="text-danger ml-0.5">
                *
              </span>
            )}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || helperText ? messageId : undefined}
            className={cn(
              "w-full h-control appearance-none rounded-lg border bg-surface pl-3.5 pr-9 text-sm font-medium text-fg shadow-xs cursor-pointer",
              "transition-all duration-200",
              "focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-strip disabled:text-muted",
              error
                ? "border-danger focus:border-danger focus:ring-danger/20"
                : "border-line-strong hover:border-muted/60 focus:border-primary focus:ring-primary/15",
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((o) => (
                  <option key={o.value} value={o.value} disabled={o.disabled}>
                    {o.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted transition-transform group-focus-within:rotate-180 group-focus-within:text-primary"
          />
        </div>
        {error && (
          <p id={messageId} role="alert" className="text-xs font-medium text-danger motion-safe:animate-fade-in">
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

Select.displayName = "Select";
