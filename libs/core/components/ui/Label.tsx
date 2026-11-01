import type { LabelHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  error?: boolean;
}

export function Label({
  children,
  required,
  error,
  className,
  ...props
}: LabelProps) {
  return (
    <label
      {...props}
      className={twMerge(
        "font-normal",
        error && "text-error group-focus-within:text-error",
        className,
      )}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="ml-1 text-error">
          *
        </span>
      )}
    </label>
  );
}
