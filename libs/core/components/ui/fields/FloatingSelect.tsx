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
  searchable?: boolean;
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
  searchable = true,
  error,
}: FloatingSelectProps) {
  return (
    <FloatingFieldset
      label={label}
      required={required}
      error={error}
      disabled={disabled}
    >
      <div className="relative -mt-1">
        <Select
          options={options}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          searchable={searchable}
          error={error}
          className={
            searchable
              ? "w-full rounded-none border-0 bg-transparent px-3 py-1.5 pr-10 focus:border-0"
              : "w-full rounded-none border-0 bg-transparent px-3 py-1.5 focus:border-0"
          }
        />
      </div>
    </FloatingFieldset>
  );
}
