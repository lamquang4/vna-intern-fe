// components/OtpField.tsx
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingInput } from "@/libs/core/components/ui/fields/FloatingInput";
import {
  OTP_EXPIRE_SECONDS,
  OTP_LENGTH,
  OTP_RESEND_COOLDOWN_SECONDS,
} from "@/libs/core/constants/limits";
import { formatDuration } from "@/libs/core/utils/formatters";

interface Props {
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  onResend: (onSuccess: () => void) => void;
  isResending?: boolean;
  onExpiredChange?: (expired: boolean) => void;
}

function OtpField({
  name,
  value,
  onChange,
  onBlur,
  error,
  onResend,
  isResending = false,
  onExpiredChange,
}: Props) {
  // Đếm ngược hết hạn OTP (bắt đầu ngay khi mount)
  const [expireEndTime, setExpireEndTime] = useState<number>(
    () => Date.now() + OTP_EXPIRE_SECONDS * 1000,
  );
  const [expireTimeLeft, setExpireTimeLeft] =
    useState<number>(OTP_EXPIRE_SECONDS);

  // Đếm ngược cooldown gửi lại OTP
  const [cooldownEndTime, setCooldownEndTime] = useState<number>(
    () => Date.now() + OTP_RESEND_COOLDOWN_SECONDS * 1000,
  );
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState<number>(
    OTP_RESEND_COOLDOWN_SECONDS,
  );

  const isOtpExpired = expireTimeLeft <= 0;
  const isCooldownActive = cooldownTimeLeft > 0;
  const canResend = !isCooldownActive && !isResending;

  // Timer hết hạn OTP
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((expireEndTime - Date.now()) / 1000),
      );
      setExpireTimeLeft(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [expireEndTime]);

  // Timer cooldown gửi lại OTP
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((cooldownEndTime - Date.now()) / 1000),
      );
      setCooldownTimeLeft(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownEndTime]);

  useEffect(() => {
    onExpiredChange?.(isOtpExpired);
  }, [isOtpExpired, onExpiredChange]);

  const startTimers = () => {
    const now = Date.now();

    setExpireEndTime(now + OTP_EXPIRE_SECONDS * 1000);
    setExpireTimeLeft(OTP_EXPIRE_SECONDS);

    setCooldownEndTime(now + OTP_RESEND_COOLDOWN_SECONDS * 1000);
    setCooldownTimeLeft(OTP_RESEND_COOLDOWN_SECONDS);
  };

  const handleResend = () => {
    if (!canResend) return;
    onResend(() => {
      onChange("");
      startTimers();
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <FloatingInput
        name={name}
        label="OTP"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="Nhập mã otp"
        maxLength={OTP_LENGTH}
        value={value}
        onChange={(e) =>
          onChange(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))
        }
        onBlur={onBlur}
        error={error}
      />

      <div className="flex justify-between items-center">
        <Button
          type="button"
          onClick={handleResend}
          disabled={!canResend}
          className={`transition-all ${
            canResend
              ? "text-primary cursor-pointer"
              : "text-muted-foreground cursor-not-allowed"
          }`}
        >
          Gửi lại
          {isCooldownActive && ` (${cooldownTimeLeft}s)`}
        </Button>

        {!isOtpExpired ? (
          <span>
            Mã hết hạn sau:
            <span className="ml-1 font-medium text-primary">
              {formatDuration(expireTimeLeft)}
            </span>
          </span>
        ) : (
          <span className="text-error font-medium">Đã hết hạn</span>
        )}
      </div>
    </div>
  );
}

export default OtpField;
