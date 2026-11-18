"use client";
import { useState } from "react";
import { MIME_PDF } from "@/libs/core/constants/limits";
import type { AccidentReportDetailResponse } from "@/libs/shared/tts/models/accident-report.model";
import type { UpdateAccidentReportFormValues } from "@/libs/shared/tts/schemas/accident-report.schema";
import FilePreviewModal from "@/libs/core/components/ui/FilePreviewModal";
import { type PreviewFile } from "@/libs/tts/utils/filePreview";
import type { AccidentReportSummaryResponse } from "@/libs/shared/tts/models/accident-report.model";
import AccidentReportSummaryTable from "./AccidentReportSummaryTable";
import { FloatingTextarea } from "@/libs/core/components/ui/fields/FloatingTextarea";
import { AccidentReportStatus } from "@/libs/shared/tts/models/enums";
import { DocumentRow } from "@/libs/shared/core/models/common.model";
import DocumentsField from "@/libs/core/components/ui/fields/DocumentsField";
import { useFormContext } from "react-hook-form";

interface Props {
  report?: AccidentReportDetailResponse;
  summary?: AccidentReportSummaryResponse;
  disabled?: boolean;
}

function ReportOverviewStep({ report, summary, disabled = false }: Props) {
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);

  const { setValue, watch } = useFormContext<UpdateAccidentReportFormValues>();

  const selectedFile: unknown = watch("stampedReport");
  const stampedReport = report?.stampedReport;
  const selectedFilePreview =
    typeof File !== "undefined" && selectedFile instanceof File
      ? selectedFile
      : typeof FileList !== "undefined" && selectedFile instanceof FileList
        ? selectedFile.item(0)
        : null;
  const currentFile = selectedFilePreview ?? stampedReport ?? null;

  const documents: DocumentRow<PreviewFile, "stampedReport">[] = [
    {
      id: "stampedReport",
      name: "Báo cáo TNLĐ có dấu mộc công ty",
      file: currentFile,
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-10">
        <DocumentsField
          documents={documents}
          accept={`${MIME_PDF},.pdf`}
          onSelect={
            disabled
              ? undefined
              : (_, file) =>
                  setValue("stampedReport", file, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
          }
        />

        {report?.note &&
          (report?.status === AccidentReportStatus.APPROVED ||
            report?.status === AccidentReportStatus.DECLINED) && (
            <FloatingTextarea
              label="Ghi chú"
              required
              minRows={8}
              maxRows={16}
              value={report?.note}
              readOnly
              disabled
            />
          )}

        <AccidentReportSummaryTable summary={summary} />
      </div>

      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </>
  );
}

export default ReportOverviewStep;
