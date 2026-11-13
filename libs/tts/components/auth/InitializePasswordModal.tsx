"use client";
import { Modal } from "@/libs/core/components/ui/Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingInput } from "@/libs/core/components/ui/fields/FloatingInput";
import {
  InitializePasswordData,
  initializePasswordSchema,
} from "@/libs/shared/tts/schemas/auth.schema";
import { useInitializePassword } from "@/libs/tts/hooks/useAuth";

interface Props {
  onClose: () => void;
  username: string;
  userId: string;
}

function InitializePasswordModal({ onClose, username, userId }: Props) {
  const initializePasswordMutation = useInitializePassword(userId);

  const isInitializingPassword = initializePasswordMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InitializePasswordData>({
    resolver: zodResolver(initializePasswordSchema),
    mode: "onBlur",
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = (data: InitializePasswordData) => {
    if (isInitializingPassword) return;

    initializePasswordMutation.mutate(
      {
        password: data.password,
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
    <Modal
      title="Khởi tạo mật khẩu"
      onClose={onClose}
      className="max-w-[420px]"
      headerClassName="bg-primary text-white uppercase"
    >
      <form
        className="flex flex-col flex-1 min-h-0"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <p>
              Khởi tạo mật khẩu cho tài khoản <strong>{username}</strong>
            </p>

            <FloatingInput
              label="Mật khẩu"
              placeholder="Nhập lại mật khẩu"
              type="password"
              required
              error={errors.password?.message}
              {...register("password")}
            />

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                onClick={handleCancel}
                className="rounded-lg px-3 py-2 font-medium border border-border"
              >
                Hủy bỏ
              </Button>

              <Button
                disabled={isInitializingPassword}
                type="submit"
                className="rounded-lg px-3 py-2 font-medium bg-primary text-white"
              >
                Lưu
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default InitializePasswordModal;
