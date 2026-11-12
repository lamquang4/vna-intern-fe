"use client";

import { FloatingFieldset } from "./FloatingFieldset";
import { Select } from "../Select";

export interface FloatingSelectProps {
  label: string;
  options: { value: string | number; label: string }[];
  value?: string | number | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export function FloatingSelect({
  label,
  options,
  value = "",
  onChange,
  onBlur,
  placeholder,
  required,
  disabled,
  error,
}: FloatingSelectProps) {
  return (
    <FloatingFieldset
      label={label}
      required={required}
      error={error}
      disabled={disabled}
    >
      <Select
        options={options}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        className="rounded-none border-0 bg-transparent focus:border-0"
      />
    </FloatingFieldset>
  );
}
