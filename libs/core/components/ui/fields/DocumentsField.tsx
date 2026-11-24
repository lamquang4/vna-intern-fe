"use client";
import { useState } from "react";
import { ArrowUpToLine, Eye, Trash } from "lucide-react";
import { Button } from "@/libs/core/components/ui/Button";
import DataTable from "@/libs/core/components/ui/DataTable";
import { Input } from "@/libs/core/components/ui/Input";
import { Label } from "@/libs/core/components/ui/Label";
import { ALLOWED_DOCUMENT_MIME_TYPES } from "@/libs/core/constants/limits";
import type { TableColumn } from "@/libs/core/models/component.model";
import type { DocumentRow } from "@/libs/shared/core/models/common.model";
import {
  getFileName,
  getFileSizeLabel,
  type PreviewFile,
} from "@/libs/tts/utils/filePreview";
import FilePreviewModal from "@/libs/core/components/ui/FilePreviewModal";

const DEFAULT_ACCEPT = ALLOWED_DOCUMENT_MIME_TYPES.join(",");

interface Props<TFile extends PreviewFile, TId extends string> {
  documents: DocumentRow<TFile, TId>[];
  onSelect?: (id: TId, file: File) => void;
  onRemove?: (document: DocumentRow<TFile, TId>) => void;
  accept?: string;
}

function DocumentsField<TFile extends PreviewFile, TId extends string>({
  documents,
  onSelect,
  onRemove,
  accept = DEFAULT_ACCEPT,
}: Props<TFile, TId>) {
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);

  const columns: TableColumn<DocumentRow<TFile, TId>>[] = [
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
              aria-label="Xem trước tệp"
              title="Xem trước tệp"
              onClick={() => setPreviewFile(row.file)}
            >
              <Eye size={22} className="text-muted-foreground" />
            </Button>
          )}

          {onSelect && (
            <Label
              className="relative inline-flex items-center !cursor-pointer"
              title="Chọn tệp"
            >
              <ArrowUpToLine size={22} className="text-success" />
              <Input
                type="file"
                accept={accept}
                aria-label="Chọn tệp"
                className="absolute inset-0 size-full opacity-0"
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  if (file) onSelect(row.id, file);
                  e.currentTarget.value = "";
                }}
              />
            </Label>
          )}

          {onRemove && row.file && (
            <Button
              type="button"
              aria-label="Xóa tệp"
              title="Xóa tệp"
              onClick={() => onRemove(row)}
            >
              <Trash size={22} className="text-error" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={documents}
        getRowId={(row) => row.id}
      />

      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </>
  );
}

export default DocumentsField;
