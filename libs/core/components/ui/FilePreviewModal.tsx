"use client";
import { useEffect, useRef, useState } from "react";
import { Image } from "@/libs/core/components/ui/Image";
import { MIME_DOCX, MIME_PDF } from "@/libs/core/constants/limits";
import { axiosInstance } from "@/libs/core/services/axiosInstance.ts";
import {
  getFileName,
  getMimeType,
  getStoredFileUrl,
  isImageMime,
  isStoredFile,
  type PreviewFile,
} from "@/libs/tts/utils/filePreview";
import toast from "react-hot-toast";
import { Modal } from "@/libs/core/components/ui/Modal";

interface Props {
  file: PreviewFile;
  onClose: () => void;
}

function FilePreviewModal({ file, onClose }: Props) {
  const mime = getMimeType(file);
  const isPdf = mime === MIME_PDF;
  const isDocx = mime === MIME_DOCX;
  const isImage = isImageMime(mime);

  const docxRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const [url, setUrl] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const fail = (message: string) => {
      toast.error(message);
      onCloseRef.current();
    };

    let cancelled = false;
    let objectUrl: string | undefined;
    const docxEl = docxRef.current;

    (async () => {
      try {
        let blob: Blob;

        if (isStoredFile(file)) {
          const { data } = await axiosInstance.get<Blob>(
            getStoredFileUrl(file.url).href,
            { responseType: "blob" },
          );
          blob = new Blob([data], { type: mime });
        } else {
          blob = file;
        }

        if (cancelled) return;

        if (isDocx) {
          const { renderAsync } = await import("docx-preview");
          if (cancelled || !docxEl) return;
          await renderAsync(blob, docxEl, undefined, {
            className: "file-preview-docx",
          });
        } else {
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        }
      } catch {
        if (!cancelled) fail("Không thể tải tệp xem trước.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      docxEl?.replaceChildren();
    };
  }, [file, mime, isDocx]);

  return (
    <Modal
      title={getFileName(file)}
      onClose={onClose}
      className="h-[90%] max-w-[1200px]"
      headerClassName="border-b border-border"
    >
      {isLoading && <p className="text-center">Đang tải bản xem trước...</p>}

      {isPdf && url && (
        <iframe
          src={url}
          className="h-screen w-full"
          title={getFileName(file)}
        />
      )}

      {isImage && url && (
        <div className="flex h-full items-center justify-center overflow-auto">
          <Image
            src={url}
            alt={getFileName(file)}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}

      {isDocx && (
        <div className="h-full overflow-y-auto bg-muted p-4">
          <div ref={docxRef} />
        </div>
      )}
    </Modal>
  );
}

export default FilePreviewModal;
