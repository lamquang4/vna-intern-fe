export function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span>{label}:</span>
      <span className="break-words font-medium">{value || "??"}</span>
    </div>
  );
}
