'use client';

import React from 'react';
import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';

interface FormattedNumberInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  disabled?: boolean;
  decimal?: boolean;
  className?: string;
  'aria-label'?: string;
}

function formatNumber(value: number | undefined, decimal: boolean) {
  if (value === undefined || Number.isNaN(value)) return '';
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: decimal ? 2 : 0,
  }).format(value);
}

function parseNumber(value: string, decimal: boolean) {
  const normalized = value
    .replace(/\s/g, '')
    .replace(decimal ? /[^\d,.-]/g : /[^\d-]/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.');

  if (!normalized || normalized === '-' || normalized === '.') return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function FormattedNumberInput<T extends FieldValues>({
  name,
  disabled = false,
  decimal = false,
  className,
  'aria-label': ariaLabel,
}: FormattedNumberInputProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div>
          <input
            {...field}
            value={formatNumber(field.value, decimal)}
            type="text"
            inputMode="decimal"
            disabled={disabled}
            aria-label={ariaLabel}
            aria-invalid={fieldState.invalid}
            onChange={(event) => field.onChange(parseNumber(event.target.value, decimal))}
            className={twMerge(
              'h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:cursor-not-allowed',
              fieldState.invalid && 'border-error focus:border-error',
              className
            )}
          />
          {fieldState.error?.message && (
            <p className="mt-1 text-xs text-error">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
}
