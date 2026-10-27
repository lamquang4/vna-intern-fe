import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { Overlay } from "./Overlay";
import { Button } from "./Button";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
}

export function Modal({
  title,
  onClose,
  children,
  className,
  headerClassName,
}: ModalProps) {
  return (
    <>
      <Overlay onClose={onClose} className="z-[60]" />

      <div className="pointer-events-none fixed inset-0 z-[65] flex items-center justify-center px-[15px]">
        <div
          className={twMerge(
            "pointer-events-auto relative flex max-h-full w-full max-w-[480px] flex-col overflow-hidden rounded-lg bg-background",
            className,
          )}
        >
          <div
            className={twMerge(
              "flex shrink-0 items-center justify-between py-[15px] px-[20px] text-center",
              headerClassName,
            )}
          >
            <h4>{title}</h4>

            <Button onClick={onClose}>
              <X size={22} />
            </Button>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto py-[20px] px-[20px]">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
