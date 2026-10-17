import type { LabelHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ children, required, className, ...props }: LabelProps) {
  return (
    <label className={twMerge("font-normal", className)} {...props}>
      {children}
      {required && (
        <span aria-hidden="true" className="ml-1 text-error">
          *
        </span>
      )}
    </label>
  );
}
