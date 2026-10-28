import type { FileResponse } from "@/libs/shared/tts/models/enterprise.model";

export type PreviewFile = File | FileResponse;

export type PreviewFileType = "doc" | "docx" | "pdf" | "image" | "unsupported";

export const isStoredFile = (file: PreviewFile): file is FileResponse =>
  "fileId" in file;

export const getFileName = (file: PreviewFile) =>
  isStoredFile(file) ? file.fileName : file.name;

export const getFileType = (file: PreviewFile): PreviewFileType => {
  const fileName = getFileName(file).toLowerCase();
  const contentType = isStoredFile(file) ? file.contentType : file.type;

  if (fileName.endsWith(".doc")) return "doc";
  if (
    fileName.endsWith(".docx") ||
    contentType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docx";
  }
  if (contentType === "application/pdf" || fileName.endsWith(".pdf")) {
    return "pdf";
  }
  if (
    contentType.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(fileName)
  ) {
    return "image";
  }
  return "unsupported";
};

export const getMimeType = (file: PreviewFile) => {
  const contentType = isStoredFile(file) ? file.contentType : file.type;
  if (contentType && contentType !== "application/octet-stream") {
    return contentType;
  }

  const fileName = getFileName(file).toLowerCase();
  if (fileName.endsWith(".pdf")) return "application/pdf";
  if (fileName.endsWith(".png")) return "image/png";
  if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (fileName.endsWith(".gif")) return "image/gif";
  if (fileName.endsWith(".webp")) return "image/webp";
  if (fileName.endsWith(".bmp")) return "image/bmp";
  if (fileName.endsWith(".svg")) return "image/svg+xml";
  return contentType;
};

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
