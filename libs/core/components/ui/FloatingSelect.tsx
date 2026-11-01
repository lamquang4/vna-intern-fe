"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Label } from "./Label";
import { Input } from "./Input";

export interface FloatingSelectProps {
  label: string;
  options: {
    value: string | number;
    label: string;
  }[];
  value?: string | number | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  placeholder?: string;
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
  name,
  placeholder = "Chọn...",
  required,
  disabled,
  error,
}: FloatingSelectProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = open && !disabled;

  const selected = options.find((o) => String(o.value) === String(value));

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return k
      ? options.filter((o) => o.label.toLowerCase().includes(k))
      : options;
  }, [options, keyword]);

  const closePanel = () => {
    setOpen(false);
    setKeyword("");
    onBlur?.();
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setKeyword("");
        onBlur?.();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onBlur]);

  useEffect(() => {
    if (disabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
      setKeyword("");
    }
  }, [disabled]);

  const handleSelect = (val: string) => {
    if (disabled) return;
    onChange(val);
    closePanel();
  };

  return (
    <div className="w-full" ref={wrapperRef}>
      <div className="group relative">
        <Input
          ref={inputRef}
          name={name}
          type="text"
          autoComplete="off"
          tabIndex={disabled ? -1 : undefined}
          disabled={disabled}
          readOnly={disabled}
          error={error}
          value={isOpen ? keyword : (selected?.label ?? "")}
          placeholder={isOpen ? "Tìm kiếm..." : placeholder}
          onFocus={() => {
            if (!disabled) setOpen(true);
          }}
          onChange={(e) => {
            if (disabled) return;
            setKeyword(e.target.value);
            setOpen(true);
          }}
          className="w-full rounded-md px-3 py-2 pr-10"
        />

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

        <ChevronDown
          size={20}
          aria-hidden="true"
          className={twMerge(
            "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2",
            "text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
        />

        {isOpen && (
          <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-background">
            <li
              onMouseDown={() => handleSelect("")}
              className="cursor-pointer px-3 py-2 hover:bg-muted"
            >
              {placeholder}
            </li>

            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-center text-error">
                Không tìm thấy kết quả
              </li>
            ) : (
              filtered.map((o) => (
                <li
                  key={o.value}
                  onMouseDown={() => handleSelect(String(o.value))}
                  className={twMerge(
                    "cursor-pointer px-3 py-2",
                    String(o.value) === String(value)
                      ? "bg-primary text-white"
                      : "hover:bg-muted",
                  )}
                >
                  {o.label}
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {error && <small className="mt-1 block text-error">{error}</small>}
    </div>
  );
}
