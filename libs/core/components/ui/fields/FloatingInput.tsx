"use client";
import { useState, type ChangeEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { formatThousands as formatThousandsValue } from "@/libs/core/utils/formatters";
import { Input, type InputProps } from "../Input";
import { Button } from "../Button";
import { DateField } from "./DateField";
import { FloatingFieldset } from "./FloatingFieldset";

export interface FloatingInputProps extends InputProps {
  label: string;
  required?: boolean;
  dateValue?: Date | null;
  onDateChange?: (date: Date | null) => void;
  dateFormat?: string;
  formatThousands?: boolean;
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
  formatThousands = false,
  ref,
  onChange,
  ...props
}: FloatingInputProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const isPassword = type === "password";
  const inputType = formatThousands
    ? "text"
    : isPassword && showPassword
      ? "text"
      : type;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (formatThousands) {
      const input = event.currentTarget;
      const cursorPosition = input.selectionStart ?? input.value.length;
      const digitsBeforeCursor = input.value
        .slice(0, cursorPosition)
        .replace(/\D/g, "").length;
      input.value = formatThousandsValue(input.value);

      let formattedCursorPosition = 0;
      let digitsFound = 0;
      while (
        formattedCursorPosition < input.value.length &&
        digitsFound < digitsBeforeCursor
      ) {
        if (/\d/.test(input.value[formattedCursorPosition])) digitsFound += 1;
        formattedCursorPosition += 1;
      }
      input.setSelectionRange(
        formattedCursorPosition,
        formattedCursorPosition,
      );
    }

    onChange?.(event);
  };

  return (
    <FloatingFieldset
      label={label}
      required={required}
      error={error}
      disabled={disabled}
    >
      <div className="relative -mt-1">
        {type === "date" ? (
          <DateField
            value={dateValue}
            onChange={onDateChange}
            onBlur={props.onBlur}
            error={error}
            disabled={disabled}
            format={dateFormat}
            placeholder={placeholder.trim() || undefined}
            className={twMerge(
              "rounded-none border-0 bg-transparent focus:border-0",
            )}
          />
        ) : (
          <Input
            {...props}
            ref={(element) => {
              if (typeof ref === "function") ref(element);
              else if (ref) ref.current = element;
              if (formatThousands && element) {
                element.value = formatThousandsValue(element.value);
              }
            }}
            placeholder={placeholder}
            type={inputType}
            inputMode={formatThousands ? "numeric" : props.inputMode}
            disabled={disabled}
            error={error}
            onChange={handleChange}
            className={twMerge(
              "block w-full rounded-none border-0 bg-transparent px-3 py-1.5 focus:border-0",
              isPassword && "pr-10",
            )}
          />
        )}

        {isPassword && (
          <Button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground"
          >
            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
          </Button>
        )}
      </div>
    </FloatingFieldset>
  );
}
