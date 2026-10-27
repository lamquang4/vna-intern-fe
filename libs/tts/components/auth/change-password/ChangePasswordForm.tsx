import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingInput } from "@/libs/core/components/ui/FloatingInput";
import {
  ChangePasswordData,
  changePasswordSchema,
} from "@/libs/shared/tts/schemas/auth.schema";
import { useChangePassword } from "../../../hooks/useAuth";

interface Props {
  onClose: () => void;
}

function ChangePasswordForm({ onClose }: Props) {
  const changePasswordMutation = useChangePassword();

  const isChangingPassword = changePasswordMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onBlur",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = (data: ChangePasswordData) => {
    if (isChangingPassword) return;

    changePasswordMutation.mutate(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  const handleCancel = () => {
    reset();
  };

  return (
    <form
      className="flex flex-col flex-1 min-h-0"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col gap-8 pt-4">
        <div className="flex flex-col gap-6">
          <FloatingInput
            label="Mật khẩu cũ"
            type="password"
            required
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />

          <FloatingInput
            label="Mật khẩu mới"
            type="password"
            required
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />

          <FloatingInput
            label="Nhập lại mật khẩu mới"
            type="password"
            required
            error={errors.confirmNewPassword?.message}
            {...register("confirmNewPassword")}
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            disabled={isChangingPassword}
            onClick={handleCancel}
            className="rounded-lg px-3.5 py-2 font-medium border border-border"
          >
            Hủy bỏ
          </Button>

          <Button
            disabled={isChangingPassword}
            type="submit"
            className="rounded-lg px-3.5 py-2 font-medium bg-primary text-white"
          >
            Áp dụng
          </Button>
        </div>
      </div>
    </form>
  );
}

export default ChangePasswordForm;
