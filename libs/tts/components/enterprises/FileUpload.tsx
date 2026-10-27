"use client";
import type { ReactNode } from "react";
import { Label } from "@/libs/core/components/ui/Label";
import { Input } from "@/libs/core/components/ui/Input";

interface Props {
  accept: string;
  onSelect: (file: File) => void;
  disabled?: boolean;
  children: ReactNode;
}

export function FileUpload({
  accept,
  onSelect,
  disabled = false,
  children,
}: Props) {
  return (
    <Label
      className={`relative inline-flex items-center ${
        disabled ? "cursor-not-allowed" : "!cursor-pointer"
      }`}
    >
      {children}
      <Input
        type="file"
        accept={accept}
        disabled={disabled}
        className="absolute inset-0 size-full opacity-0 disabled:cursor-not-allowed"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (file) onSelect(file);
          e.currentTarget.value = "";
        }}
      />
    </Label>
  );
}
