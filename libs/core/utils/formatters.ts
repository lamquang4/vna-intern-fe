import { format, isValid, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

export function formatDuration(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function formatDateTyping(raw: string, isDeleting = false): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const out = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean)
    .join("/");

  const needSlash = !isDeleting && (digits.length === 2 || digits.length === 4);
  return needSlash ? `${out}/` : out;
}

export function formatTaxCode(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 13);
  return digits.length > 10
    ? `${digits.slice(0, 10)}-${digits.slice(10)}`
    : digits;
}

export function formatThousands(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parseThousands(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  if (typeof raw !== "string") return null;

  const digits = raw.replace(/\D/g, "");
  return digits === "" ? null : Number(digits);
}

export function formatDate(value?: string | null): string {
  if (!value) return "";

  const date = parseISO(value);

  return isValid(date) ? format(date, "dd/MM/yyyy", { locale: vi }) : "";
}

export const formatNumber = (value?: number | null) =>
  new Intl.NumberFormat("vi-VN").format(value ?? 0);

export const formatCellValue = (value: unknown) =>
  typeof value === "string"
    ? value
    : formatNumber(value as number | null | undefined);
