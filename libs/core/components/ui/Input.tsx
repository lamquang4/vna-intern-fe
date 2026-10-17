import type { InputHTMLAttributes, Ref } from "react";
import { twMerge } from "tailwind-merge";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string | boolean;
  ref?: Ref<HTMLInputElement>;
}

export function Input({ className, error, ref, ...props }: InputProps) {
  return (
    <input
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
    />
  );
}
