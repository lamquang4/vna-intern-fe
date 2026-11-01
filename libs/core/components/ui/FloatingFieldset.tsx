import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export interface FloatingFieldsetProps {
  label: string;
  required?: boolean;
  error?: string | boolean;
  disabled?: boolean;
  children: ReactNode;
}

export function FloatingFieldset({
  label,
  required,
  error,
  disabled,
  children,
}: FloatingFieldsetProps) {
  const errorMessage = typeof error === "string" ? error : undefined;

  return (
    <div className="w-full">
      <fieldset
        disabled={disabled}
        className={twMerge(
          "group relative min-w-0 rounded-md border border-border px-0 pb-1 transition-colors",
          "focus-within:border-primary",
          error && "border-error focus-within:border-error",
        )}
      >
        <legend
          className={twMerge(
            "ml-2 px-1 leading-4 whitespace-nowrap transition-colors",
            error
              ? "text-error"
              : "text-muted-foreground group-focus-within:text-primary",
          )}
        >
          {label}
          {required && (
            <span aria-hidden="true" className="ml-1 text-error">
              *
            </span>
          )}
        </legend>

        {children}
      </fieldset>

      {errorMessage && (
        <small className="mt-1 block text-error">{errorMessage}</small>
      )}
    </div>
  );
}
