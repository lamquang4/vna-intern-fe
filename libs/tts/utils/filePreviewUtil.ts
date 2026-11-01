import type { FileResponse } from "@/libs/shared/tts/models/enterprise.model";
import { ALLOWED_IMAGE_MIME_TYPES } from "@/libs/core/constants/limits";

export type PreviewFile = File | FileResponse;

export const isStoredFile = (file: PreviewFile): file is FileResponse =>
  "fileId" in file;

export const getFileName = (file: PreviewFile) =>
  isStoredFile(file) ? file.fileName : file.name;

export const getMimeType = (file: PreviewFile) =>
  isStoredFile(file) ? file.contentType : file.type;

export const isImageMime = (mime: string) =>
  ALLOWED_IMAGE_MIME_TYPES.includes(mime);

export const getFileSizeLabel = (file: PreviewFile) =>
  `${(file.size / 1024).toFixed(1)} KB`;

export const getStoredFileUrl = (fileUrl: string) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const url = new URL(fileUrl, backendUrl);

  if (!backendUrl) return url;

  const backendOrigin = new URL(backendUrl).origin;
  if (url.origin === window.location.origin) {
    return new URL(`${url.pathname}${url.search}${url.hash}`, backendOrigin);
  }

  return url;
};
