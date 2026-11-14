"use client";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/libs/core/components/ui/Modal";
import { Button } from "@/libs/core/components/ui/Button";
import OtpField, { OtpTimers } from "@/libs/core/components/ui/fields/OtpField";
import {
  VerifyRegisterEnterpriseEmailOtpData,
  verifyRegisterEnterpriseEmailOtpSchema,
} from "@/libs/shared/tts/schemas/auth.schema";
import {
  useResendOtp,
  useVerifyRegisterEnterpriseEmailOtp,
} from "@/libs/tts/hooks/useAuth";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  email: string;
  otpTimers?: OtpTimers | null;
  onOtpTimersChange?: (timers: OtpTimers) => void;
}

function RegisterEnterpriseOtpModal({
  onClose,
  onSuccess,
  email,
  otpTimers,
  onOtpTimersChange,
}: Props) {
  const [isOtpExpired, setIsOtpExpired] = useState<boolean>(false);

  const resendOtpMutation = useResendOtp();
  const verifyOtpMutation = useVerifyRegisterEnterpriseEmailOtp();

  const isSubmitting =
    resendOtpMutation.isPending || verifyOtpMutation.isPending;

  const { control, handleSubmit, reset } =
    useForm<VerifyRegisterEnterpriseEmailOtpData>({
      resolver: zodResolver(verifyRegisterEnterpriseEmailOtpSchema),
      mode: "onBlur",
      defaultValues: { otpCode: "" },
    });

  const onSubmit = (data: VerifyRegisterEnterpriseEmailOtpData) => {
    if (isSubmitting || isOtpExpired) return;

    verifyOtpMutation.mutate({ email, otpCode: data.otpCode }, { onSuccess });
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      title="Xác thực email"
      onClose={onClose}
      className="max-w-[420px]"
      headerClassName="uppercase"
    >
      <form
        className="flex flex-col flex-1 min-h-0"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 items-center">
            <p>Chúng tôi đã gửi mã xác thực qua email</p>
            <p className="font-medium">{email}</p>
            <p>Bạn vui lòng kiểm tra và điền mã xác thực</p>
          </div>

          <Controller
            name="otpCode"
            control={control}
            render={({ field, fieldState }) => (
              <OtpField
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                onResend={(onResendSuccess) =>
                  resendOtpMutation.mutate(
                    { email, purpose: "REGISTER_ENTERPRISE" },
                    { onSuccess: onResendSuccess },
                  )
                }
                isResending={resendOtpMutation.isPending}
                onExpiredChange={setIsOtpExpired}
                initialExpireEndTime={otpTimers?.expireEndTime}
                initialCooldownEndTime={otpTimers?.cooldownEndTime}
                onTimersChange={onOtpTimersChange}
              />
            )}
          />

          <div className="flex flex-col items-center justify-center gap-3">
            <Button
              disabled={isSubmitting || isOtpExpired}
              type="submit"
              className="w-full px-3 py-2 rounded-lg font-medium bg-primary text-white"
            >
              Xác nhận
            </Button>

            <Button
              type="button"
              onClick={handleCancel}
              className="w-full text-center rounded-lg px-3 py-2 font-medium border border-border"
            >
              Hủy bỏ
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default RegisterEnterpriseOtpModal;
