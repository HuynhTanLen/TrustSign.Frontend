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
      <div className="w-full flex flex-col gap-2">
        {label && (
          <label htmlFor={selectId} className="text-sm font-semibold text-fg">
            {label} {props.required && <span className="text-danger">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || helperText ? messageId : undefined}
            className={`w-full h-control appearance-none rounded-md border bg-surface pl-3 pr-8 text-sm text-fg cursor-pointer focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-page disabled:text-muted ${
              error
                ? "border-danger focus:border-danger focus:ring-danger"
                : "border-line-strong focus:border-primary focus:ring-primary"
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
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
          />
        </div>
        {error && <p id={messageId} className="text-xs text-danger">{error}</p>}
        {!error && helperText && <p id={messageId} className="text-xs text-muted">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
