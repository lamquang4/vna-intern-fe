import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingInput } from "@/libs/core/components/ui/FloatingInput";
import {
  ChangePasswordData,
  changePasswordSchema,
} from "@/libs/shared/tts/schemas/auth.schema";
import { useChangePassword } from "../../hooks/useAuth";

interface Props {
  onClose: () => void;
}

function ChangePasswordForm({ onClose }: Props) {
  const changePasswordMutation = useChangePassword();

  const isLoading = changePasswordMutation.isPending;

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
    if (isLoading) return;

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

  return (
    <form
      className="flex flex-col flex-1 min-h-0"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6.5 pt-8">
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

          <div className="flex items-center justify-center gap-3">
            <Button
              disabled={isLoading}
              type="submit"
              variant="primary"
              className="w-full rounded-lg px-2 py-2.5 font-medium"
            >
              Lưu
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
    </form>
  );
}

export default ChangePasswordForm;
