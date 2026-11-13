"use client";
import { twMerge } from "tailwind-merge";
import { FloatingFieldset } from "./FloatingFieldset";
import { Textarea, TextareaProps } from "../Textarea";

export interface FloatingTextareaProps extends TextareaProps {
  label: string;
  required?: boolean;
}

export function FloatingTextarea({
  label,
  required,
  error,
  disabled,
  className,
  ...props
}: FloatingTextareaProps) {
  return (
    <FloatingFieldset
      label={label}
      required={required}
      error={error}
      disabled={disabled}
    >
      <div className="relative -mt-1">
        <Textarea
          {...props}
          disabled={disabled}
          error={error}
          className={twMerge(
            "-mt-1 block w-full rounded-none border-0 bg-transparent px-3 py-2 focus:border-0",
            className,
          )}
        />
      </div>
    </FloatingFieldset>
  );
}
