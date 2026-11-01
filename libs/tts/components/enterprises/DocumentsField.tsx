"use client";

import { useState } from "react";
import { ArrowUpToLine, Eye, Trash } from "lucide-react";
import { Button } from "@/libs/core/components/ui/Button";
import DataTable from "@/libs/core/components/ui/DataTable";
import { Input } from "@/libs/core/components/ui/Input";
import { Label } from "@/libs/core/components/ui/Label";
import { ALLOWED_DOCUMENT_MIME_TYPES } from "@/libs/core/constants/limits";
import type { TableColumn } from "@/libs/core/models/component.model";
import type {
  DocumentField,
  DocumentRow,
} from "@/libs/shared/tts/models/enterprise.model";
import {
  getFileName,
  getFileSizeLabel,
  type PreviewFile,
} from "@/libs/tts/utils/filePreviewUtil";
import FilePreviewContentModal from "./FilePreviewContentModal";

interface Props<TFile extends PreviewFile> {
  documents: DocumentRow<TFile>[];
  onSelect?: (id: DocumentField, file: File) => void;
  onRemove?: (document: DocumentRow<TFile>) => void;
}

function DocumentsField<TFile extends PreviewFile>({
  documents,
  onSelect,
  onRemove,
}: Props<TFile>) {
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);

  const columns: TableColumn<DocumentRow<TFile>>[] = [
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
            <Button type="button" onClick={() => setPreviewFile(row.file)}>
              <Eye size={22} className="text-muted-foreground" />
            </Button>
          )}

          {onSelect && (
            <Label className="relative inline-flex items-center !cursor-pointer">
              <ArrowUpToLine size={22} className="text-success" />
              <Input
                type="file"
                accept={ALLOWED_DOCUMENT_MIME_TYPES.join(",")}
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
            <Button type="button" onClick={() => onRemove(row)}>
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
        <FilePreviewContentModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </>
  );
}

export default DocumentsField;
