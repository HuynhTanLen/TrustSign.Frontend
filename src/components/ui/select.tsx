import * as React from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", label, error, helperText, options, id, children, ...props }, ref) => {
    const autoId = React.useId();
    const selectId = id ?? autoId;
    const messageId = `${selectId}-message`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-[13px] font-semibold text-fg">
            {label} {props.required && <span className="text-danger">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || helperText ? messageId : undefined}
            className={`w-full h-control appearance-none rounded-md border bg-surface pl-3.5 pr-9 text-sm font-medium text-fg shadow-xs cursor-pointer focus:outline-none focus:ring-3 disabled:cursor-not-allowed disabled:bg-strip disabled:text-muted ${
              error
                ? "border-danger focus:border-danger focus:ring-danger/15"
                : "border-line-strong hover:border-muted/60 focus:border-primary focus:ring-primary/15"
            } ${className}`}
            {...props}
          >
            {options
              ? options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
          />
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

Select.displayName = "Select";
