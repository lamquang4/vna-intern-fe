"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingInput } from "@/libs/core/components/ui/FloatingInput";
import { Image } from "@/libs/core/components/ui/Image";
import { Overlay } from "@/libs/core/components/ui/Overlay";
import Loading from "@/libs/core/components/ui/Loading";
import banner from "@/libs/tts/assets/candidate-banner.png";
import logo from "@/libs/tts/assets/logo.png";
import Link from "next/link";
import { Input } from "@/libs/core/components/ui/Input";
import { Label } from "@/libs/core/components/ui/Label";
import { LoginData, loginSchema } from "@/libs/shared/tts/schemas/auth.schema";
import { useLogin } from "../../hooks/useAuth";

function LoginForm() {
  const loginMutation = useLogin();
  const isLoading = loginMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginData) => {
    if (isLoading) return;

    loginMutation.mutate(data, {
      onSuccess: () => {
        reset();
      },
    });
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

                  <h3 className="text-center capitalize">
                    Phần mềm quản lý - tạo lập cơ sở dữ liệu an toàn vệ sinh lao
                    động
                  </h3>
                </div>

                <form
                  className="flex flex-col gap-6"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <h3 className="text-primary uppercase text-center">
                    Đăng nhập
                  </h3>

                  <FloatingInput
                    label="Tên tài khoản"
                    type="text"
                    required
                    error={errors.username?.message}
                    {...register("username")}
                  />

                  <FloatingInput
                    label="Mật khẩu"
                    type="password"
                    required
                    error={errors.password?.message}
                    {...register("password")}
                  />

                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Input
                          id="remember-box"
                          type="checkbox"
                          className="size-4 cursor-pointer accent-primary"
                        />

                        <Label htmlFor="remember-box">Nhớ đăng nhập</Label>
                      </div>

                      <Link
                        href="/forgot-password"
                        className="text-primary font-medium"
                      >
                        Quên mật khẩu
                      </Link>
                    </div>

                    <div className="flex flex-col gap-4">
                      <Button
                        disabled={isLoading}
                        type="submit"
                        variant="primary"
                        className="w-full font-medium rounded-sm px-2 py-2.5 text-center"
                      >
                        Đăng nhập
                      </Button>

                      <Link
                        href="/"
                        className="w-full font-medium rounded-sm px-2 py-2.5 text-center bg-transparent border border-primary text-primary"
                      >
                        Đăng ký tài khoản doanh nghiệp
                      </Link>
                    </div>
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

export default LoginForm;
