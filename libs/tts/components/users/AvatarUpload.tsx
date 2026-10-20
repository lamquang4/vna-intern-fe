"use client";
import { useEffect, useState, type ChangeEvent } from "react";
import { Camera, X } from "lucide-react";
import { Image } from "@/libs/core/components/ui/Image";
import { Label } from "@/libs/core/components/ui/Label";
import { ALLOWED_IMAGE_MIME_TYPES } from "@/libs/core/constants/limits";
import { Button } from "@/libs/core/components/ui/Button";
import { Input } from "@/libs/core/components/ui/Input";

interface AvatarUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  currentUrl?: string | null;
  disabled?: boolean;
}

function AvatarUpload({
  value,
  onChange,
  currentUrl,
  disabled,
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const imageSrc = previewUrl ?? currentUrl ?? null;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(file);
    e.target.value = "";
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md border border-border py-5">
      <div className="relative">
        <Label
          className={`group relative flex h-[200px] w-[200px] items-center justify-center rounded-full border-2 border-dashed border-border p-3 ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-full bg-muted text-muted-foreground">
            {imageSrc ? (
              <>
                <Image
                  src={imageSrc}
                  alt="avatar"
                  fill
                  unoptimized
                  className="object-cover"
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera size={28} />
                  <p className="font-normal">Đổi ảnh</p>
                </div>
              </>
            ) : (
              <>
                <Camera size={35} />
                <p className="font-normal">Tải ảnh đại diện</p>
              </>
            )}
          </div>

          <Input
            type="file"
            className="sr-only"
            accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
            disabled={disabled}
            onChange={handleChange}
          />
        </Label>

        {value && !disabled && (
          <Button
            type="button"
            variant="danger"
            onClick={() => onChange(null)}
            aria-label="Bỏ ảnh vừa chọn"
            className="absolute right-2 top-2 flex size-8 cursor-pointer items-center justify-center rounded-full shadow-md "
          >
            <X size={20} strokeWidth={2} />
          </Button>
        )}
      </div>

      <div className="space-y-2 text-center text-muted-foreground">
        <p>*.jpeg, *.jpg, *.png</p>
        <p>Kích thước tối đa 5 MB</p>
      </div>
    </div>
  );
}

export default AvatarUpload;
