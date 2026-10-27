"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingInput } from "@/libs/core/components/ui/FloatingInput";
import { Overlay } from "@/libs/core/components/ui/Overlay";
import Loading from "@/libs/core/components/ui/Loading";
import {
  OTP_EXPIRE_SECONDS,
  OTP_LENGTH,
  OTP_RESEND_COOLDOWN_SECONDS,
} from "@/libs/core/constants/limits";
import { formatDuration } from "@/libs/core/utils/formatters";
import Link from "next/link";
import {
  ForgotPasswordData,
  forgotPasswordSchema,
  ResetPasswordData,
  resetPasswordSchema,
} from "@/libs/shared/tts/schemas/auth.schema";
import { validateOtpDigit } from "@/libs/core/utils/validators";
import {
  useForgotPassword,
  useResendForgotPasswordOtp,
  useResetPassword,
} from "../../hooks/useAuth";
import AuthLayout from "./AuthLayout";

function ForgotPasswordForm() {
  const [step, setStep] = useState<"step1" | "step2">("step1");
  // Đếm ngược hết hạn OTP
  const [expireEndTime, setExpireEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Đếm ngược cooldown gửi lại OTP
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState<number>(0);

  const forgotPasswordMutation = useForgotPassword();
  const resendOtpMutation = useResendForgotPasswordOtp();
  const resetPasswordMutation = useResetPassword();

  const isSubmitting =
    forgotPasswordMutation.isPending || resetPasswordMutation.isPending;
  const isResendingOtp = resendOtpMutation.isPending;

  const isCooldownActive = cooldownEndTime !== null && cooldownTimeLeft > 0;
  const isOtpExpired = expireEndTime !== null && timeLeft <= 0;

  const form1 = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
    defaultValues: { email: "" },
  });

  const form2 = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      otpCode: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const startOtpTimers = () => {
    const now = Date.now();

    setExpireEndTime(now + OTP_EXPIRE_SECONDS * 1000);
    setTimeLeft(OTP_EXPIRE_SECONDS);

    setCooldownEndTime(now + OTP_RESEND_COOLDOWN_SECONDS * 1000);
    setCooldownTimeLeft(OTP_RESEND_COOLDOWN_SECONDS);
  };

  // Đếm ngược hết hạn OTP
  useEffect(() => {
    if (expireEndTime === null) return;

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.round((expireEndTime - Date.now()) / 1000),
      );
      setTimeLeft(remaining);
      return remaining;
    };

    const timer = setInterval(() => {
      if (tick() <= 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [expireEndTime]);

  // Đếm ngược cooldown gửi lại OTP
  useEffect(() => {
    if (cooldownEndTime === null) return;

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.round((cooldownEndTime - Date.now()) / 1000),
      );
      setCooldownTimeLeft(remaining);
      return remaining;
    };

    const timer = setInterval(() => {
      if (tick() <= 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownEndTime]);

  const email = form2.watch("email");

  const onSubmitStep1 = (data: ForgotPasswordData) => {
    if (isSubmitting) return;

    forgotPasswordMutation.mutate(data, {
      onSuccess: () => {
        form2.setValue("email", data.email);
        form2.setValue("otpCode", "");
        form1.reset();

        startOtpTimers();
        setStep("step2");
      },
    });
  };

  const onSubmitStep2 = (data: ResetPasswordData) => {
    if (isSubmitting || isOtpExpired) return;

    resetPasswordMutation.mutate(data);
  };

  const handleResendOtp = () => {
    if (isCooldownActive || isResendingOtp || !email) return;

    resendOtpMutation.mutate(
      { email },
      {
        onSuccess: () => {
          form2.setValue("otpCode", "");
          startOtpTimers();
        },
      },
    );
  };

  return (
    <>
      <AuthLayout>
        <form
          className="flex flex-col gap-6"
          onSubmit={
            step === "step1"
              ? form1.handleSubmit(onSubmitStep1)
              : form2.handleSubmit(onSubmitStep2)
          }
        >
          <h3 className="text-primary text-center uppercase">Quên mật khẩu</h3>

          <div className="flex flex-col gap-2 items-center">
            {step === "step1" ? (
              <p>Vui lòng nhập email đã đăng ký tài khoản</p>
            ) : (
              <>
                <p>Chúng tôi đã gửi mã xác nhận qua email</p>
                <p className="font-medium">{email}</p>
                <p>Bạn vui lòng kiểm tra và điền mã xác thực</p>
              </>
            )}
          </div>

          {step === "step1" ? (
            <FloatingInput
              label="Email"
              error={form1.formState.errors.email?.message}
              {...form1.register("email")}
            />
          ) : (
            <>
              <FloatingInput
                label="Mật khẩu mới"
                type="password"
                error={form2.formState.errors.newPassword?.message}
                {...form2.register("newPassword")}
              />
              <FloatingInput
                label="Nhập lại mật khẩu mới"
                type="password"
                error={form2.formState.errors.confirmNewPassword?.message}
                {...form2.register("confirmNewPassword")}
              />

              <div className="flex flex-col gap-2">
                <FloatingInput
                  label="OTP"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={OTP_LENGTH}
                  error={form2.formState.errors.otpCode?.message}
                  {...form2.register("otpCode", {
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

                {step === "step2" && (
                  <div className="flex justify-between items-center">
                    <Button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isCooldownActive || isResendingOtp}
                      className={`font-medium transition-all ${
                        !isCooldownActive && !isResendingOtp
                          ? "text-primary cursor-pointer"
                          : "text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      Gửi lại mã
                    </Button>

                    {timeLeft > 0 ? (
                      <span>
                        Hết hạn sau:
                        <span className="ml-1 text-primary font-medium">
                          {formatDuration(timeLeft)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-error font-medium">Đã hết hạn</span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex flex-col gap-3">
            <Button
              disabled={isSubmitting || (step === "step2" && isOtpExpired)}
              type="submit"
              className="w-full font-medium rounded-sm px-2 py-2.5 text-center bg-primary text-white"
            >
              {step === "step1" ? "Gửi xác thực" : "Khôi phục mật khẩu"}
            </Button>

            {step === "step1" && (
              <div className="flex gap-2 justify-center items-center">
                <span>Bạn đã có tài khoản</span>

                <Link href="/" className="text-primary font-medium">
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>
        </form>

        {isSubmitting && (
          <Overlay>
            <Loading size={55} color="white" thickness={8} />
            <h4 className="text-white">Vui lòng chờ trong giây lát ...</h4>
          </Overlay>
        )}
      </AuthLayout>
    </>
  );
}

export default ForgotPasswordForm;
