import type { Ref, SelectHTMLAttributes } from "react";
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
          "disabled:cursor-not-allowed",
          error && "border-error focus:border-error",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
