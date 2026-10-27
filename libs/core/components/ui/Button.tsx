import type { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ type = "button", className, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={twMerge(
        "font-normal whitespace-nowrap transition-colors cursor-pointer outline-none",
        "disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}
