"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Input } from "./Input";
import { FloatingFieldset } from "./FloatingFieldset";

export interface FloatingSelectProps {
  label: string;
  options: { value: string | number; label: string }[];
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
      <FloatingFieldset
        label={label}
        required={required}
        error={error}
        disabled={disabled}
      >
        <div className="relative -mt-1">
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
            className="block w-full rounded-none border-0 bg-transparent px-3 py-2 pr-10 focus:border-0"
          />

          <ChevronDown
            size={20}
            aria-hidden="true"
            className={twMerge(
              "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2",
              "text-muted-foreground transition-transform",
              isOpen && "rotate-180",
            )}
          />

          {isOpen && (
            <ul className="absolute left-0 top-[calc(100%+0.5rem)] z-50 max-h-60 w-full overflow-auto rounded-md border border-border bg-background">
              <li
                onMouseDown={() => handleSelect("")}
                className="cursor-pointer px-3 py-2 hover:bg-muted"
              >
                {placeholder}
              </li>

              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-center">
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
      </FloatingFieldset>
    </div>
  );
}
