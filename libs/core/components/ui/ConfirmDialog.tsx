"use client";
import { CircleAlert } from "lucide-react";
import { Button } from "@/libs/core/components/ui/Button";
import { Modal } from "@/libs/core/components/ui/Modal";

interface ConfirmDialogProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  title,
  description,
  onConfirm,
  onClose,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onClose} className="max-w-[450px]">
      <div className="flex flex-col items-center gap-6">
        <CircleAlert strokeWidth={1.3} size={100} className="text-warning" />

        <p className="text-center">{description}</p>

        <div className="flex w-full items-center justify-center gap-3">
          <Button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="w-full rounded-lg bg-primary px-2 py-2 font-medium text-white"
          >
            {confirmText}
          </Button>

          <Button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="w-full rounded-lg bg-error px-2 py-2 font-medium text-white"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
