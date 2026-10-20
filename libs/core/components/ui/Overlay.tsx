interface OverlayProps {
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function Overlay({ onClose, children, className = "" }: OverlayProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${className}`}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}
