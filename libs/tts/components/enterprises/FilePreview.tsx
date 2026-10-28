"use client";
import { useEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";
import Image from "next/image";
import { Button } from "@/libs/core/components/ui/Button";
import { Modal } from "@/libs/core/components/ui/Modal";
import { axiosInstance } from "@/libs/core/services/axiosInstance.ts";
import type { FileResponse } from "@/libs/shared/tts/models/enterprise.model";
import {
  getFileName,
  getFileType,
  getMimeType,
  getStoredFileUrl,
  isStoredFile,
} from "@/libs/tts/utils/filePreviewUtil";

interface Props {
  file: File | FileResponse | null;
}

function FilePreview({ file }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const docxContainerRef = useRef<HTMLDivElement>(null);
  const docxStylesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !file) return;

    let cancelled = false;
    let objectUrl: string | null = null;
    const docxContainer = docxContainerRef.current;
    const docxStyles = docxStylesRef.current;

    const renderPreview = async () => {
      setIsLoading(true);
      setError(null);
      setPreviewUrl(null);

      try {
        let content: Blob;

        if (isStoredFile(file)) {
          const url = getStoredFileUrl(file.url);
          const { data } = await axiosInstance.get<Blob>(url.href, {
            responseType: "blob",
          });
          content = new Blob([data], { type: getMimeType(file) });
        } else {
          content = new Blob([file], { type: getMimeType(file) });
        }

        if (cancelled) return;

        const type = getFileType(file);
        if (type === "unsupported") {
          throw new Error("Định dạng tệp này chưa hỗ trợ xem trước.");
        }
        if (type === "doc") {
          throw new Error(
            "Chưa hỗ trợ xem trước Word .doc. Vui lòng lưu tệp thành .docx.",
          );
        }

        objectUrl = URL.createObjectURL(content);

        if (type === "docx") {
          const { renderAsync } = await import("docx-preview");
          if (cancelled) return;
          if (!docxContainer || !docxStyles) return;

          await renderAsync(content, docxContainer, docxStyles, {
            className: "file-preview-docx",
          });
        } else {
          setPreviewUrl(objectUrl);
        }
      } catch (previewError) {
        if (!cancelled) {
          setError(
            previewError instanceof Error
              ? previewError.message
              : "Không thể tải tệp xem trước.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void renderPreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      docxContainer?.replaceChildren();
      docxStyles?.replaceChildren();
    };
  }, [file, isOpen]);

  if (!file) return null;

  const fileType = getFileType(file);

  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)}>
        <Eye size={22} className="text-muted-foreground" />
      </Button>

      {isOpen && (
        <Modal
          title={getFileName(file)}
          onClose={() => setIsOpen(false)}
          className="h-[90%] max-w-[1200px]"
          headerClassName="border-b border-border"
        >
          {isLoading && (
            <p className="text-center">Đang tải bản xem trước...</p>
          )}
          {error && <p className="text-error">{error}</p>}

          {fileType === "pdf" && previewUrl && (
            <iframe
              src={previewUrl}
              className="h-screen w-full"
              title={getFileName(file)}
            />
          )}

          {fileType === "image" && previewUrl && (
            <div className="flex h-full items-center justify-center overflow-auto">
              <Image
                src={previewUrl}
                alt={getFileName(file)}
                width={1200}
                height={900}
                unoptimized
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}

          {fileType === "docx" && !error && (
            <div className="h-full overflow-y-auto bg-muted p-4">
              <div ref={docxStylesRef} />
              <div ref={docxContainerRef} />
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

export default FilePreview;
