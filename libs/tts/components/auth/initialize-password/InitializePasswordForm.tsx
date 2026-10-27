import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingInput } from "@/libs/core/components/ui/FloatingInput";
import {
  InitializePasswordData,
  initializePasswordSchema,
} from "@/libs/shared/tts/schemas/auth.schema";
import { useInitializePassword } from "@/libs/tts/hooks/useAuth";
import { Save } from "lucide-react";

interface Props {
  onClose: () => void;
  username: string;
}

function InitializePasswordForm({ onClose, username }: Props) {
  const initializePasswordMutation = useInitializePassword();

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
            type="password"
            required
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex items-center justify-end gap-3">
            <Button
            
              onClick={handleCancel}
              className="rounded-lg px-3.5 py-2 font-medium border border-border"
            >
              Hủy bỏ
            </Button>

            <Button
              disabled={isInitializingPassword}
              type="submit"
              className="rounded-lg px-3.5 py-2 font-medium bg-primary text-white flex items-center gap-2"
            >
              <span>Lưu</span> <Save size={20} />
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default InitializePasswordForm;
