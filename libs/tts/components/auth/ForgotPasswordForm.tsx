"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingInput } from "@/libs/core/components/ui/FloatingInput";
import { Image } from "@/libs/core/components/ui/Image";
import { Overlay } from "@/libs/core/components/ui/Overlay";
import Loading from "@/libs/core/components/ui/Loading";
import banner from "@/libs/tts/assets/candidate-banner.png";
import logo from "@/libs/tts/assets/logo.png";
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

  const isLoading =
    forgotPasswordMutation.isPending || resetPasswordMutation.isPending;

  const isLoadingResendOtp = resendOtpMutation.isPending;

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
    if (isLoading) return;

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
    if (isLoading || isOtpExpired) return;

    resetPasswordMutation.mutate(data, {
      onSuccess: () => {
        form2.reset();
      },
    });
  };

  const onResendOtp = () => {
    if (isCooldownActive || isLoadingResendOtp || !email) return;

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
      <section className="bg-background-2 w-full">
        <div className="flex justify-center items-center h-screen">
          <div className="relative max-w-[1100px] w-full h-auto">
            <div className="h-full grid grid-cols-1 md:grid-cols-[6fr_4fr] items-center">
              <div className="hidden md:block">
                <Image
                  src={banner}
                  alt="banner"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>

              <div className="w-full px-4 sm:px-8 bg-white flex flex-col gap-6">
                <div className="flex flex-col gap-8 items-center">
                  <Image
                    src={logo}
                    alt="logo"
                    className="w-[80px]"
                    loading="eager"
                  />
                </div>

                <form
                  className="flex flex-col gap-6"
                  onSubmit={
                    step === "step1"
                      ? form1.handleSubmit(onSubmitStep1)
                      : form2.handleSubmit(onSubmitStep2)
                  }
                >
                  <h3 className="text-primary text-center uppercase">
                    Quên mật khẩu
                  </h3>

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
                        error={
                          form2.formState.errors.confirmNewPassword?.message
                        }
                        {...form2.register("confirmNewPassword")}
                      />
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
                    </>
                  )}

                  <div className="flex flex-col gap-3">
                    {step === "step2" ? (
                      <div className="flex justify-between items-center">
                        <Button
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
                            Hết hạn sau:{" "}
                            <span className="text-primary font-medium">
                              {formatDuration(timeLeft)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-error font-medium">
                            Đã hết hạn
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-center items-center">
                        <span>Bạn đã có tài khoản</span>

                        <Link href="/" className="text-primary font-medium">
                          Đăng nhập
                        </Link>
                      </div>
                    )}

                    <Button
                      disabled={isLoading || (step === "step2" && isOtpExpired)}
                      type="submit"
                      variant="primary"
                      className="w-full font-medium rounded-sm px-2 py-2.5 text-center"
                    >
                      {step === "step1" ? "Gửi xác thực" : "Khôi phục mật khẩu"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isLoading && (
        <Overlay>
          <Loading size={55} color="white" thickness={8} />
          <h4 className="text-white">Vui lòng chờ trong giây lát ...</h4>
        </Overlay>
      )}
    </>
  );
}

export default ForgotPasswordForm;
