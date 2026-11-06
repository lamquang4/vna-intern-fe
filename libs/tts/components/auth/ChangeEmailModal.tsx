"use client";
import { Modal } from "@/libs/core/components/ui/Modal";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingInput } from "@/libs/core/components/ui/fields/FloatingInput";
import {
  ChangeEmailData,
  changeEmailSchema,
  VerifyChangeEmailOtpData,
  verifyChangeEmailOtpSchema,
} from "@/libs/shared/tts/schemas/auth.schema";
import {
  useChangeEmail,
  useChangeEmailMe,
  useResendOtp,
  useVerifyChangeEmailOtp,
} from "../../hooks/useAuth";
import OtpField from "../../../core/components/ui/fields/OtpField";

interface Props {
  onClose: () => void;
  userId?: string;
  email: string;
  skipOtp: boolean;
}

function ChangeEmailModal({ onClose, userId, email, skipOtp }: Props) {
  const [step, setStep] = useState<1 | 2>(skipOtp ? 2 : 1);
  const [isOtpExpired, setIsOtpExpired] = useState<boolean>(false);

  const resendOtpMutation = useResendOtp();
  const verifyOtpMutation = useVerifyChangeEmailOtp();
  const changeEmailMeMutation = useChangeEmailMe();
  const changeEmailUserMutation = useChangeEmail(userId ?? "");
  const changeEmailMutation = userId
    ? changeEmailUserMutation
    : changeEmailMeMutation;

  const isSubmitting =
    resendOtpMutation.isPending ||
    verifyOtpMutation.isPending ||
    changeEmailMutation.isPending;

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

  const onSubmitStep1 = (data: VerifyChangeEmailOtpData) => {
    if (isSubmitting || isOtpExpired) return;

    verifyOtpMutation.mutate(
      { email, ...data },
      {
        onSuccess: () => {
          form1.reset();
          setStep(2);
        },
      },
    );
  };

  const onSubmitStep2 = (data: ChangeEmailData) => {
    if (isSubmitting) return;

    changeEmailMutation.mutate(data, {
      onSuccess: () => {
        form2.reset();
        onClose();
      },
    });
  };

  return (
    <Modal
      title="Thay đổi email"
      onClose={onClose}
      className="max-w-[420px]"
      headerClassName="uppercase"
    >
      <form
        className="flex flex-col flex-1 min-h-0"
        onSubmit={
          step === 1
            ? form1.handleSubmit(onSubmitStep1)
            : form2.handleSubmit(onSubmitStep2)
        }
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 items-center">
            {step === 1 ? (
              <>
                <p>Chúng tôi đã gửi mã xác nhận qua email cũ</p>
                <p className="font-medium">{email}</p>
                <p>Bạn vui lòng kiểm tra và điền mã xác thực</p>
              </>
            ) : (
              <p>Vui lòng nhập email mới</p>
            )}
          </div>

          {step === 1 ? (
            <Controller
              name="otpCode"
              control={form1.control}
              render={({ field, fieldState }) => (
                <OtpField
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  onResend={(onSuccess) =>
                    resendOtpMutation.mutate(
                      { email, purpose: "CHANGE_EMAIL" },
                      { onSuccess },
                    )
                  }
                  isResending={resendOtpMutation.isPending}
                  onExpiredChange={setIsOtpExpired}
                />
              )}
            />
          ) : (
            <FloatingInput
              label="Email mới"
              type="text"
              placeholder="Nhập email mới"
              required
              error={form2.formState.errors.newEmail?.message}
              {...form2.register("newEmail")}
            />
          )}

          <div className="flex flex-col items-center justify-center gap-3">
            <Button
              disabled={isSubmitting || (step === 1 && isOtpExpired)}
              type="submit"
              className="w-full rounded-lg px-3.5 py-2 font-medium bg-primary text-white"
            >
              {step === 1 ? "Xác nhận" : "Lưu"}
            </Button>

            <Button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg px-3.5 py-2 font-medium border border-border"
            >
              Hủy bỏ
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default ChangeEmailModal;
