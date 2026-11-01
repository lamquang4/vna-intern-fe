"use client";
import { forwardRef, type ChangeEvent, type FocusEventHandler } from "react";
import DatePicker from "react-datepicker";
import { CalendarDays } from "lucide-react";
import { twMerge } from "tailwind-merge";
import "react-datepicker/dist/react-datepicker.css";
import { Input, type InputProps } from "./Input";
import { formatDateInput } from "../../utils/formatters";

export interface DateFieldProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  error?: InputProps["error"];
  disabled?: boolean;
  className?: string;
  format?: string;
  placeholder?: string;
}

const DateTrigger = forwardRef<HTMLInputElement, InputProps>(
  ({ onChange, ...props }, ref) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const inputType = (e.nativeEvent as InputEvent).inputType ?? "";
      e.target.value = formatDateInput(
        e.target.value,
        inputType.startsWith("delete"),
      );
      onChange?.(e);
    };

    return (
      <Input {...props} ref={ref} inputMode="numeric" onChange={handleChange} />
    );
  },
);
DateTrigger.displayName = "DateTrigger";

export function DateField({
  value,
  onChange,
  onBlur,
  error,
  disabled,
  className,
  format = "dd/MM/yyyy",
  placeholder = "dd/mm/yyyy",
}: DateFieldProps) {
  const handleChange = (date: Date | null) => onChange?.(date);

  return (
    <div className="relative w-full">
      <DatePicker
        selected={value ?? null}
        onChange={handleChange}
        dateFormat={format}
        placeholderText={placeholder}
        strictParsing
        disabled={disabled}
        wrapperClassName="block w-full"
        popperClassName="!z-50"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        customInput={
          <DateTrigger
            error={error}
            onBlur={onBlur}
            className={twMerge(
              "block w-full rounded-md px-3 py-2 pr-10",
              className,
            )}
          />
        }
      />
      <CalendarDays
        size={20}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}
