import type { Ref, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { twMerge } from "tailwind-merge";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string | boolean;
  wrapperClassName?: string;
  ref?: Ref<HTMLSelectElement>;
}

export function Select({
  children,
  className,
  wrapperClassName,
  error,
  ref,
  ...props
}: SelectProps) {
  return (
    <div className={twMerge("relative w-full", wrapperClassName)}>
      <select
        ref={ref}
        aria-invalid={error ? true : undefined}
        className={twMerge(
          "border border-border bg-background outline-none transition-colors",
          "focus:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-error-icon focus:border-error-icon",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
