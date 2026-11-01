interface InfoItemProps {
  label: string;
  value?: string | number | null;
}

export function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="flex flex-col gap-1">
      <span>{label}:</span>
      <span className="min-h-6 font-medium break-words">{value}</span>
    </div>
  );
}
