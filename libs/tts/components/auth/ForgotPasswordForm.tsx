"use client";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingInput } from "@/libs/core/components/ui/fields/FloatingInput";
import { Overlay } from "@/libs/core/components/ui/Overlay";
import Loading from "@/libs/core/components/ui/Loading";
import Link from "next/link";
import {
  ForgotPasswordData,
  forgotPasswordSchema,
  ResetPasswordData,
  resetPasswordSchema,
} from "@/libs/shared/tts/schemas/auth.schema";
import {
  useResendOtp,
  useResetPassword,
  useSendOtp,
} from "../../hooks/useAuth";
import AuthLayout from "./AuthLayout";
import OtpField from "../../../core/components/ui/fields/OtpField";

function ForgotPasswordForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [isOtpExpired, setIsOtpExpired] = useState<boolean>(false);

  const sendOtpMutation = useSendOtp();
  const resendOtpMutation = useResendOtp();
  const resetPasswordMutation = useResetPassword();

  const isSubmitting =
    resendOtpMutation.isPending ||
    sendOtpMutation.isPending ||
    resetPasswordMutation.isPending;

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

  const email = form2.watch("email");

  const onSubmitStep1 = (data: ForgotPasswordData) => {
    if (isSubmitting) return;

    sendOtpMutation.mutate(
      { email: data.email, purpose: "FORGOT_PASSWORD" },
      {
        onSuccess: (res) => {
          toast.success(res.message || "Đã gửi mã xác thực đến email");
          form2.setValue("email", data.email);
          form2.setValue("otpCode", "");
          form1.reset();
          setStep(2);
        },
      },
    );
  };

  const onSubmitStep2 = (data: ResetPasswordData) => {
    if (isSubmitting || isOtpExpired) return;
    resetPasswordMutation.mutate(data);
  };

  return (
    <AuthLayout>
      <form
        className="flex flex-col gap-6"
        onSubmit={
          step === 1
            ? form1.handleSubmit(onSubmitStep1)
            : form2.handleSubmit(onSubmitStep2)
        }
      >
        <h3 className="text-primary text-center uppercase">Quên mật khẩu</h3>

        <div className="flex flex-col gap-2 items-center">
          {step === 1 ? (
            <p>Vui lòng nhập email đã đăng ký tài khoản</p>
          ) : (
            <>
              <p>Chúng tôi đã gửi mã xác nhận qua email</p>
              <p className="font-medium">{email}</p>
              <p>Bạn vui lòng kiểm tra và điền mã xác thực</p>
            </>
          )}
        </div>

        {step === 1 ? (
          <FloatingInput
            label="Email"
            placeholder="Nhập email"
            error={form1.formState.errors.email?.message}
            {...form1.register("email")}
          />
        ) : (
          <>
            <FloatingInput
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới"
              type="password"
              error={form2.formState.errors.newPassword?.message}
              {...form2.register("newPassword")}
            />
            <FloatingInput
              label="Nhập lại mật khẩu mới"
              placeholder="Nhập lại mật khẩu mới"
              type="password"
              error={form2.formState.errors.confirmNewPassword?.message}
              {...form2.register("confirmNewPassword")}
            />

            <Controller
              name="otpCode"
              control={form2.control}
              render={({ field, fieldState }) => (
                <OtpField
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  onResend={(onSuccess) =>
                    resendOtpMutation.mutate(
                      { email, purpose: "FORGOT_PASSWORD" },
                      { onSuccess },
                    )
                  }
                  isResending={resendOtpMutation.isPending}
                  onExpiredChange={setIsOtpExpired}
                />
              )}
            />
          </>
        )}

        <div className="flex flex-col gap-3">
          <Button
            disabled={isSubmitting || (step === 2 && isOtpExpired)}
            type="submit"
            className="w-full font-medium rounded-sm px-2 py-2.5 text-center bg-primary text-white"
          >
            {step === 1 ? "Gửi xác thực" : "Khôi phục mật khẩu"}
          </Button>

          {step === 1 && (
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
  );
}

export default ForgotPasswordForm;
