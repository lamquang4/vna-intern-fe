"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Input, type InputProps } from "./Input";
import { Label } from "./Label";
import { Button } from "./Button";
import { DateField } from "./DateField";

export interface FloatingInputProps extends InputProps {
  label: string;
  required?: boolean;
  dateValue?: Date | null;
  onDateChange?: (date: Date | null) => void;
  dateFormat?: string;
}

export function FloatingInput({
  label,
  required,
  error,
  type = "text",
  disabled,
  placeholder = " ",
  dateValue,
  onDateChange,
  dateFormat,
  ...props
}: FloatingInputProps) {
  const errorMessage = typeof error === "string" ? error : undefined;
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={twMerge("w-full")}>
      <div className="group relative">
        {type === "date" ? (
          <DateField
            value={dateValue}
            onChange={onDateChange}
            error={error}
            disabled={disabled}
            format={dateFormat}
            placeholder={placeholder.trim() || undefined}
          />
        ) : (
          <Input
            {...props}
            placeholder={placeholder}
            type={inputType}
            disabled={disabled}
            error={error}
            className={twMerge(
              "px-3 py-2 w-full rounded-md",
              isPassword && "pr-12",
            )}
          />
        )}

        <Label
          required={required}
          error={!!error}
          className={twMerge(
            "pointer-events-none absolute left-2 top-0 -translate-y-1/2",
            "bg-background px-1.5 leading-none whitespace-nowrap transition-colors",
            error
              ? "text-error"
              : "text-muted-foreground group-focus-within:text-primary",
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
        <small className="mt-1 block text-error">{errorMessage}</small>
      )}
    </div>
  );
}
