// libs/tts/components/labor-accidents/CancelReportConfirmModal.tsx
'use client';

import React from 'react';

interface CancelReportConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const CancelReportConfirmModal: React.FC<CancelReportConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-background shadow-lg">
        <div className="border-b border-border bg-muted px-6 py-4 text-center text-sm font-semibold text-foreground">
          Cảnh báo
        </div>
        <div className="p-6 text-center text-sm text-foreground">
          Dữ liệu báo cáo đã nhập sẽ không được lưu lại
        </div>
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Huỷ bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};