import type { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

const variants = {
  primary: "bg-primary text-white",
  danger: "bg-error text-white",
  none: "",
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
}

export function Button({
  variant = "none",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={twMerge(
        "font-normal whitespace-nowrap transition-colors cursor-pointer outline-none",
        "disabled:cursor-not-allowed",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
