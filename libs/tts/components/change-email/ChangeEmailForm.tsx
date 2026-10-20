"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingInput } from "@/libs/core/components/ui/FloatingInput";
import {
  OTP_EXPIRE_SECONDS,
  OTP_LENGTH,
  OTP_RESEND_COOLDOWN_SECONDS,
} from "@/libs/core/constants/limits";
import { formatDuration } from "@/libs/core/utils/formatters";
import { useEffect, useState } from "react";
import {
  ChangeEmailData,
  changeEmailSchema,
  VerifyChangeEmailOtpData,
  verifyChangeEmailOtpSchema,
} from "@/libs/shared/tts/schemas/auth.schema";
import { validateOtpDigit } from "@/libs/core/utils/validators";
import {
  useChangeEmail,
  useMe,
  useRequestChangeEmailOtp,
  useVerifyChangeEmailOtp,
} from "../../hooks/useAuth";

interface Props {
  onClose: () => void;
}

function ChangeEmailForm({ onClose }: Props) {
  const [step, setStep] = useState<"step1" | "step2">("step1");

  // Đếm ngược hết hạn OTP
  const [expireEndTime, setExpireEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Đếm ngược cooldown gửi lại OTP
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState<number>(0);

  const requestOtpMutation = useRequestChangeEmailOtp();
  const verifyOtpMutation = useVerifyChangeEmailOtp();
  const changeEmailMutation = useChangeEmail();

  const { data } = useMe();
  const account = data?.data;

  const email = account?.email;

  const isLoading =
    requestOtpMutation.isPending ||
    verifyOtpMutation.isPending ||
    changeEmailMutation.isPending;

  const isLoadingResendOtp = requestOtpMutation.isPending;

  const isCooldownActive = cooldownEndTime !== null && cooldownTimeLeft > 0;
  const isOtpExpired = expireEndTime !== null && timeLeft <= 0;

  const form1 = useForm<VerifyChangeEmailOtpData>({
    resolver: zodResolver(verifyChangeEmailOtpSchema),
    mode: "onBlur",
    defaultValues: { otpCode: "" },
  });

  const form2 = useForm<ChangeEmailData>({
    resolver: zodResolver(changeEmailSchema),
    mode: "onBlur",
    defaultValues: { newEmail: "" },
  });

  const startOtpTimers = () => {
    const now = Date.now();

    setExpireEndTime(now + OTP_EXPIRE_SECONDS * 1000);
    setTimeLeft(OTP_EXPIRE_SECONDS);

    setCooldownEndTime(now + OTP_RESEND_COOLDOWN_SECONDS * 1000);
    setCooldownTimeLeft(OTP_RESEND_COOLDOWN_SECONDS);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startOtpTimers();
  }, []);

  // Đếm ngược hết hạn OTP
  useEffect(() => {
    if (expireEndTime === null) return;

    const timer = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.round((expireEndTime - Date.now()) / 1000),
      );
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [expireEndTime]);

  // Đếm ngược cooldown gửi lại OTP
  useEffect(() => {
    if (cooldownEndTime === null) return;

    const timer = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.round((cooldownEndTime - Date.now()) / 1000),
      );
      setCooldownTimeLeft(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownEndTime]);

  const onSubmitStep1 = (data: VerifyChangeEmailOtpData) => {
    if (isLoading || isOtpExpired) return;

    verifyOtpMutation.mutate(data, {
      onSuccess: () => {
        form1.reset();
        setStep("step2");
      },
    });
  };

  const onSubmitStep2 = (data: ChangeEmailData) => {
    if (isLoading) return;

    changeEmailMutation.mutate(data, {
      onSuccess: () => {
        form2.reset();
        onClose();
      },
    });
  };

  const onResendOtp = () => {
    if (isCooldownActive || isLoadingResendOtp) return;

    requestOtpMutation.mutate(undefined, {
      onSuccess: () => {
        form1.setValue("otpCode", "");
        startOtpTimers();
      },
    });
  };

  return (
    <form
      className="flex flex-col flex-1 min-h-0"
      onSubmit={
        step === "step1"
          ? form1.handleSubmit(onSubmitStep1)
          : form2.handleSubmit(onSubmitStep2)
      }
    >
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 items-center">
            {step === "step1" ? (
              <>
                <p>Chúng tôi đã gửi mã xác nhận qua email cũ</p>
                <p className="font-medium">{email}</p>
                <p>Bạn vui lòng kiểm tra và điền mã xác thực</p>
              </>
            ) : (
              <p>Vui lòng nhập email mới</p>
            )}
          </div>

          {step === "step1" ? (
            <FloatingInput
              label="OTP"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={OTP_LENGTH}
              error={form1.formState.errors.otpCode?.message}
              {...form1.register("otpCode", {
                onChange: (e) => {
                  const value = e.target.value;

                  if (!validateOtpDigit(value)) {
                    e.target.value = value
                      .replace(/\D/g, "")
                      .slice(0, OTP_LENGTH);
                  }
                },
              })}
            />
          ) : (
            <FloatingInput
              label="Email mới"
              type="text"
              required
              error={form2.formState.errors.newEmail?.message}
              {...form2.register("newEmail")}
            />
          )}

          <div className="flex flex-col gap-3">
            {step === "step1" && (
              <div className="flex justify-between items-center">
                <Button
                  form={step === "step1" ? "form1" : "form2"}
                  type="button"
                  onClick={onResendOtp}
                  disabled={isCooldownActive || isLoadingResendOtp}
                  className={`font-medium transition-all ${
                    !isCooldownActive && !isLoadingResendOtp
                      ? "text-primary cursor-pointer"
                      : "text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  Gửi lại mã
                </Button>

                {timeLeft > 0 ? (
                  <span>
                    Hết hạn sau:
                    <span className="text-primary font-medium">
                      {formatDuration(timeLeft)}
                    </span>
                  </span>
                ) : (
                  <span className="text-error font-medium">Đã hết hạn</span>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <Button
                disabled={isLoading || (step === "step1" && isOtpExpired)}
                type="submit"
                variant="primary"
                className="w-full rounded-lg px-2 py-2.5 font-medium"
              >
                {step === "step1" ? "Xác nhận" : "Lưu"}
              </Button>

              <Button
                variant="danger"
                onClick={onClose}
                className="w-full rounded-lg px-2 py-2.5 font-medium"
              >
                Hủy bỏ
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default ChangeEmailForm;
