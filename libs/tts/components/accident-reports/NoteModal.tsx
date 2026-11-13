"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingTextarea } from "@/libs/core/components/ui/fields/FloatingTextarea";
import { Modal } from "@/libs/core/components/ui/Modal";
import { AccidentReportStatus } from "@/libs/shared/tts/models/enums";
import {
  ReviewNoteData,
  reviewNoteSchema,
} from "@/libs/shared/tts/schemas/accident-report.schema";

interface Props {
  onClose: () => void;
  onSubmit: (note: string) => void;
  count: number;
  isLoading?: boolean;
  status:
    | typeof AccidentReportStatus.APPROVED
    | typeof AccidentReportStatus.DECLINED;
}

function NoteModal({ onClose, onSubmit, count, isLoading, status }: Props) {
  const isApprove = status === AccidentReportStatus.APPROVED;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewNoteData>({
    resolver: zodResolver(reviewNoteSchema),
    mode: "onBlur",
    defaultValues: { note: "" },
  });

  return (
    <Modal
      title={isApprove ? "Duyệt báo cáo" : "Từ chối báo cáo"}
      onClose={onClose}
      className="max-w-[420px]"
      headerClassName={`bg-primary text-white uppercase`}
    >
      <form
        className="flex flex-col flex-1 min-h-0"
        onSubmit={handleSubmit((data) => onSubmit(data.note))}
      >
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <p>
              Ghi chú lý do {isApprove ? "duyệt" : "từ chối"} {count}
              báo cáo đã chọn
            </p>

            <FloatingTextarea
              label="Ghi chú lý do"
              placeholder="Nhập ghi chú lý do"
              required
              minRows={8}
              maxRows={16}
              error={errors.note?.message}
              {...register("note")}
            />

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                onClick={onClose}
                className="rounded-lg px-3 py-2 font-medium border border-border"
              >
                Hủy bỏ
              </Button>

              <Button
                disabled={isLoading}
                type="submit"
                className="rounded-lg px-3 py-2 font-medium bg-primary text-white"
              >
                Lưu
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default NoteModal;
