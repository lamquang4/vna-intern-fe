"use client";

import { useState } from "react";
import { ArrowUpToLine, Eye } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { Button } from "@/libs/core/components/ui/Button";
import DataTable from "@/libs/core/components/ui/DataTable";
import { Input } from "@/libs/core/components/ui/Input";
import { Label } from "@/libs/core/components/ui/Label";
import { MIME_PDF } from "@/libs/core/constants/limits";
import type { TableColumn } from "@/libs/core/models/component.model";
import type { AccidentReportDetailResponse } from "@/libs/shared/tts/models/accident-report.model";
import type { UpdateAccidentReportFormValues } from "@/libs/shared/tts/schemas/accident-report.schema";
import FilePreviewModal from "@/libs/tts/components/enterprises/FilePreviewModal";
import {
  getFileName,
  getFileSizeLabel,
  type PreviewFile,
} from "@/libs/tts/utils/filePreview";
import type { AccidentReportSummaryResponse } from "@/libs/shared/tts/models/accident-report.model";
import AccidentReportSummaryTable from "./AccidentReportSummaryTable";

interface StampedReportRow {
  id: string;
  name: string;
  file: PreviewFile | null;
}

interface Props {
  report?: AccidentReportDetailResponse;
  summary?: AccidentReportSummaryResponse;
  disabled?: boolean;
}

function ReportOverviewStep({ report, summary, disabled = false }: Props) {
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);
  const { control, watch } = useFormContext<UpdateAccidentReportFormValues>();
  const selectedFile: unknown = watch("stampedReport");
  const stampedReport = report?.stampedReport;
  const selectedFilePreview =
    typeof File !== "undefined" && selectedFile instanceof File
      ? selectedFile
      : typeof FileList !== "undefined" && selectedFile instanceof FileList
        ? selectedFile.item(0)
        : null;
  const currentFile = selectedFilePreview ?? stampedReport ?? null;

  const documents: StampedReportRow[] = [
    {
      id: "stampedReport",
      name: "Báo cáo TNLĐ có dấu mộc công ty",
      file: currentFile,
    },
  ];

  const columns: TableColumn<StampedReportRow>[] = [
    { key: "name", header: "Loại tài liệu", cell: (row) => row.name },
    {
      key: "fileName",
      header: "Tên file",
      cell: (row) => (row.file ? getFileName(row.file) : "Chưa chọn tệp"),
    },
    {
      key: "fileInfo",
      header: "Dung lượng",
      cell: (row) => (row.file ? getFileSizeLabel(row.file) : ""),
    },
    {
      key: "actions",
      header: "Hành động",
      cell: (row) => (
        <div className="flex items-center gap-3">
          {row.file && (
            <Button
              type="button"
              onClick={() => setPreviewFile(row.file)}
              aria-label="Xem trước tệp"
            >
              <Eye size={22} className="text-muted-foreground" />
            </Button>
          )}
          {!disabled && (
            <Label className="relative inline-flex cursor-pointer items-center">
              <ArrowUpToLine size={22} className="text-success" />
              <Controller
                control={control}
                name="stampedReport"
                render={({ field }) => (
                  <Input
                    id="stampedReport"
                    name={field.name}
                    ref={field.ref}
                    type="file"
                    accept={`${MIME_PDF},.pdf`}
                    disabled={disabled}
                    className="absolute inset-0 size-full opacity-0"
                    onBlur={field.onBlur}
                    onChange={(event) => {
                      field.onChange(event.currentTarget.files?.[0] ?? null);
                      event.currentTarget.value = "";
                    }}
                  />
                )}
              />
            </Label>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-10">
        <DataTable
          columns={columns}
          data={documents}
          getRowId={(row) => row.id}
        />

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
