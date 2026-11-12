"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Input } from "./Input";
import { Button } from "./Button";
import { SelectOption } from "../../models/component.model";

export interface SelectProps {
  options: SelectOption[];
  value?: string | number | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string | boolean;
  name?: string;
  className?: string;
  searchable?: boolean;
}

export function Select({
  options,
  value = "",
  onChange,
  onBlur,
  placeholder = "Chọn...",
  disabled,
  error,
  className,
  searchable = true,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [openUpward, setOpenUpward] = useState(false);
  const [dropdownMaxHeight, setDropdownMaxHeight] = useState(240);
  const [dropdownWidth, setDropdownWidth] = useState<number>();
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = open && !disabled;

  const selected = options.find(
    (option) => String(option.value) === String(value),
  );

  const filtered = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return searchable && normalizedKeyword
      ? options.filter((option) =>
          option.label.toLowerCase().includes(normalizedKeyword),
        )
      : options;
  }, [options, keyword, searchable]);

  const closePanel = (shouldBlur = true) => {
    setOpen(false);
    setKeyword("");
    setActiveIndex(-1);

    if (shouldBlur) {
      onBlur?.();
    }
  };

  const handleSelect = (selectedValue: string) => {
    if (disabled) return;

    onChange(selectedValue);
    closePanel();
  };

  const openPanel = () => {
    if (disabled) return;

    const trigger = wrapperRef.current?.firstElementChild;
    if (trigger instanceof HTMLElement) {
      setDropdownWidth(trigger.getBoundingClientRect().width);
    }

    setOpen(true);

    const selectedIndex = filtered.findIndex(
      (option) => String(option.value) === String(value),
    );

    setActiveIndex(selectedIndex);
  };

  // Click bên ngoài để đóng dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        closePanel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Tự động chọn hướng mở dropdown theo không gian màn hình
  useLayoutEffect(() => {
    if (!isOpen || !wrapperRef.current) return;

    const updateDropdownPosition = () => {
      const rect = wrapperRef.current!.getBoundingClientRect();

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      const shouldOpenUpward = spaceBelow < 240 + 8 && spaceAbove > spaceBelow;

      setOpenUpward(shouldOpenUpward);

      const availableHeight = shouldOpenUpward
        ? spaceAbove - 8
        : spaceBelow - 8;

      setDropdownMaxHeight(Math.max(0, Math.min(240, availableHeight)));
    };

    updateDropdownPosition();

    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [isOpen]);

  // Cuộn đến option đang active
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;

    const activeOption = dropdownRef.current?.children[activeIndex] as
      | HTMLElement
      | undefined;

    activeOption?.scrollIntoView({
      block: "nearest",
    });
  }, [isOpen, activeIndex]);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>,
  ) => {
    if (disabled) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();

        if (!isOpen) {
          openPanel();
          return;
        }

        setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
        break;

      case "ArrowUp":
        event.preventDefault();

        if (!isOpen) {
          openPanel();
          return;
        }

        setActiveIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
        break;

      case "Enter":
        if (!isOpen) {
          event.preventDefault();
          openPanel();
          return;
        }

        event.preventDefault();

        if (activeIndex >= 0 && filtered[activeIndex]) {
          handleSelect(String(filtered[activeIndex].value));
        }
        break;

      case "Escape":
        if (isOpen) {
          event.preventDefault();
          closePanel();
        }
        break;
    }
  };

  return (
    // w-full + min-w-0: không cho wrapper bị nội dung dài đẩy rộng ra
    <div ref={wrapperRef} className="relative w-full min-w-0">
      {searchable ? (
        <Input
          ref={inputRef}
          type="text"
          disabled={disabled}
          error={error}
          value={isOpen ? keyword : (selected?.label ?? "")}
          placeholder={placeholder}
          onFocus={openPanel}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            if (disabled) return;

            setKeyword(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          className={twMerge("block w-full px-3 py-1.5 pr-10", className)}
        />
      ) : (
        <Button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (isOpen) {
              closePanel();
            } else {
              openPanel();
            }
          }}
          onKeyDown={handleKeyDown}
          className={twMerge(
            "flex w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left outline-none transition-colors",
            "focus:border-primary disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span
            className={twMerge(
              "min-w-0 truncate",
              !selected && "text-muted-foreground",
            )}
          >
            {selected?.label ?? placeholder}
          </span>

          <ChevronDown
            size={20}
            className={twMerge(
              "shrink-0 text-muted-foreground transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </Button>
      )}

      {searchable && (
        <ChevronDown
          size={20}
          aria-hidden="true"
          className={twMerge(
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2",
            "text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
        />
      )}

      {isOpen && dropdownMaxHeight > 0 && (
        <ul
          ref={dropdownRef}
          role="listbox"
          style={{
            maxHeight: dropdownMaxHeight,
            width: dropdownWidth ?? "100%",
          }}
          className={twMerge(
            "absolute left-0 z-50 min-w-0 max-w-full overflow-x-hidden overflow-y-auto rounded-md border border-border bg-background shadow-md",
            openUpward
              ? "bottom-[calc(100%+0.5rem)]"
              : "top-[calc(100%+0.5rem)]",
          )}
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-center text-muted-foreground">
              Không tìm thấy
            </li>
          ) : (
            filtered.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={String(option.value) === String(value)}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(String(option.value));
                }}
                className={twMerge(
                  "cursor-pointer whitespace-normal px-3 py-2 [overflow-wrap:anywhere]",
                  String(option.value) === String(value)
                    ? "bg-primary text-white"
                    : index === activeIndex
                      ? "bg-muted"
                      : "hover:bg-muted",
                )}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
