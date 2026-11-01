export function formatDuration(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function formatDateInput(raw: string, isDeleting = false): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const out = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean)
    .join("/");

  const needSlash = !isDeleting && (digits.length === 2 || digits.length === 4);
  return needSlash ? `${out}/` : out;
}

export function formatTaxCodeInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 13);
  return digits.length > 10
    ? `${digits.slice(0, 10)}-${digits.slice(10)}`
    : digits;
}
