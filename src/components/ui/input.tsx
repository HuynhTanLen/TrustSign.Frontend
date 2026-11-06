import * as React from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  /** Thành phần phụ hiển thị bên phải nhãn (ví dụ: liên kết "Quên mật khẩu?"). */
  labelRight?: React.ReactNode;
  error?: string;
  helperText?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      containerClassName = "",
      label,
      labelRight,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref,
  ) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    const messageId = `${inputId}-message`;

    return (
      <div className={cn("group w-full flex flex-col gap-1.5", containerClassName)}>
        {(label || labelRight) && (
          <div className="flex items-center justify-between gap-2">
            {label && (
              <label htmlFor={inputId} className="text-[13px] font-semibold text-fg">
                {label}
                {props.required && (
                  <span aria-hidden="true" className="text-danger ml-0.5">
                    *
                  </span>
                )}
              </label>
            )}
            {labelRight && <div className="text-xs">{labelRight}</div>}
          </div>
        )}
        <div className="relative">
          {leftIcon && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted transition-colors group-focus-within:text-primary [&_svg]:w-4 [&_svg]:h-4"
            >
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || helperText ? messageId : undefined}
            className={cn(
              "w-full h-control rounded-lg border bg-surface text-sm text-fg shadow-xs placeholder:text-muted/65",
              "transition-all duration-200",
              "focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-strip disabled:text-muted",
              leftIcon ? "pl-10" : "pl-3.5",
              rightIcon ? "pr-10" : "pr-3.5",
              error
                ? "border-danger focus:border-danger focus:ring-danger/20"
                : "border-line-strong hover:border-muted/60 focus:border-primary focus:ring-primary/15",
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted transition-colors group-focus-within:text-primary [&_svg]:w-4 [&_svg]:h-4">
              {rightIcon}
            </div>
          )}
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

Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  error?: string;
  helperText?: React.ReactNode;
  containerClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", containerClassName = "", label, error, helperText, id, rows = 3, ...props }, ref) => {
    const autoId = React.useId();
    const textareaId = id ?? autoId;
    const messageId = `${textareaId}-message`;

    return (
      <div className={cn("group w-full flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label htmlFor={textareaId} className="text-[13px] font-semibold text-fg">
            {label}
            {props.required && (
              <span aria-hidden="true" className="text-danger ml-0.5">
                *
              </span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || helperText ? messageId : undefined}
          className={cn(
            "w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-fg shadow-xs placeholder:text-muted/65",
            "transition-all duration-200",
            "focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-strip disabled:text-muted",
            error
              ? "border-danger focus:border-danger focus:ring-danger/20"
              : "border-line-strong hover:border-muted/60 focus:border-primary focus:ring-primary/15",
            className,
          )}
          {...props}
        />
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

Textarea.displayName = "Textarea";
