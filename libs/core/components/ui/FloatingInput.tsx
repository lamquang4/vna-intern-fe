"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Input, type InputProps } from "./Input";
import { Label } from "./Label";
import { Button } from "./Button";

export interface FloatingInputProps extends Omit<InputProps, "placeholder"> {
  label: string;
  required?: boolean;
  containerClassName?: string;
}

export function FloatingInput({
  label,
  required,
  error,
  type = "text",
  className,
  containerClassName,
  disabled,
  ...props
}: FloatingInputProps) {
  const errorMessage = typeof error === "string" ? error : undefined;
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={twMerge("w-full", containerClassName)}>
      <div className="relative">
        <Input
          {...props}
          placeholder=" "
          type={inputType}
          disabled={disabled}
          error={error}
          className={twMerge(
            "peer px-3 py-2 w-full rounded-md",
            isPassword && "pr-12",
            className,
          )}
        />

        <Label
          required={required}
          className={twMerge(
            "pointer-events-none absolute left-2 top-0 -translate-y-1/2",
            "bg-background px-1.5 leading-none whitespace-nowrap",
            "text-muted-foreground transition-colors",
            "peer-focus:text-primary",
            error && "text-error peer-focus:text-error",
          )}
        >
          {label}
        </Label>

        {isPassword && (
          <Button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground"
          >
            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
          </Button>
        )}
      </div>

      {errorMessage && (
        <small className="mt-1 block px-1 text-error">{errorMessage}</small>
      )}
    </div>
  );
}
