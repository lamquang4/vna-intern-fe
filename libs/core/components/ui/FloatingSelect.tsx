"use client";
import { ChevronDown } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Select, type SelectProps } from "./Select";
import { Label } from "./Label";

export interface FloatingSelectProps extends SelectProps {
  label: string;
  required?: boolean;
  containerClassName?: string;
}

export function FloatingSelect({
  label,
  required,
  error,
  className,
  containerClassName,
  disabled,
  children,
  ...props
}: FloatingSelectProps) {
  const errorMessage = typeof error === "string" ? error : undefined;

  return (
    <div className={twMerge("w-full", containerClassName)}>
      <div className="group relative">
        <Select
          {...props}
          disabled={disabled}
          error={error}
          className={twMerge(
            "peer w-full appearance-none rounded-md px-3 py-2 pr-10",
            className,
          )}
        >
          {children}
        </Select>

        <Label
          required={required}
          className={twMerge(
            "pointer-events-none absolute left-2 top-0 -translate-y-1/2",
            "bg-background px-1.5 leading-none whitespace-nowrap",
            "text-muted-foreground transition-colors",
            "group-focus-within:text-primary",
            error && "text-error group-focus-within:text-error",
          )}
        >
          {label}
        </Label>

        <ChevronDown
          size={20}
          aria-hidden="true"
          className={twMerge(
            "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2",
            "text-muted-foreground",
            disabled && "opacity-50",
          )}
        />
      </div>

      {errorMessage && (
        <small className="mt-1 block px-1 text-error">{errorMessage}</small>
      )}
    </div>
  );
}
