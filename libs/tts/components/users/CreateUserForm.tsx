"use client";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingInput } from "@/libs/core/components/ui/FloatingInput";
import { FloatingSelect } from "@/libs/core/components/ui/FloatingSelect";
import { Label } from "@/libs/core/components/ui/Label";
import { ChevronLeft, Save } from "lucide-react";
import Link from "next/link";
import AvatarUpload from "./AvatarUpload";
import {
  CreateUserData,
  createUserSchema,
} from "@/libs/shared/tts/schemas/user.schema";
import {
  useGetAllProvinces,
  useGetWardsByProvince,
} from "../../hooks/useLocation";
import { useWatch } from "react-hook-form";
import { useGetAllRoles } from "../../hooks/useRoles";
import { DEFAULT_PASSWORD } from "@/libs/core/constants/limits";
import { useCreateUser } from "../../hooks/useUsers";
import { Switch } from "@/libs/core/components/ui/Switch";

function CreateUserForm() {
  const createUserMutation = useCreateUser();
  const isCreating = createUserMutation.isPending;

  const { data } = useGetAllRoles();
  const roles = data?.data;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<
    z.input<typeof createUserSchema>,
    unknown,
    z.output<typeof createUserSchema>
  >({
    resolver: zodResolver(createUserSchema),
    mode: "onBlur",
    defaultValues: {
      username: "",
      fullname: "",
      password: DEFAULT_PASSWORD,
      email: "",
      birthDate: "",
      gender: "",
      position: "",
      roleId: "",
      province: "",
      ward: "",
      address: "",
      isActive: true,
      avatar: null,
    },
  });

  const { data: provinces = [], isLoading: isFetchingProvinces } =
    useGetAllProvinces();

  const selectedProvince = useWatch({
    control,
    name: "province",
  });

  const wards = useGetWardsByProvince(selectedProvince ?? "");

  const onSubmit = (data: CreateUserData) => {
    if (isCreating) return;

    createUserMutation.mutate(data, {
      onSuccess: () => {
        reset();
      },
    });
  };

  const handleCancel = () => {
    reset();
  };

  return (
    <div className="py-[30px] sm:px-[20px] px-[15px] overflow-y-auto">
      <form
        className="flex flex-col gap-6 w-full"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h3>Thêm người dùng</h3>

        <div className="grid w-full grid-cols-1 gap-[20px] lg:grid-cols-[3fr_7fr]">
          <div className="flex w-full h-fit flex-col gap-6 rounded-md border border-border p-[15px]">
            <Controller
              name="avatar"
              control={control}
              render={({ field, fieldState }) => (
                <AvatarUpload
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isCreating}
                  error={fieldState.error?.message}
                />
              )}
            />

            <Label className="flex w-full cursor-pointer items-center justify-between gap-3">
              <h5>Kích hoạt</h5>

              <Switch disabled={isCreating} {...register("isActive")} />
            </Label>
          </div>

          <div className="p-[15px] rounded-md flex flex-col gap-[20px] w-full border border-border">
            <div className="flex flex-col gap-[30px]">
              <h5>Thông tin cá nhân</h5>

              <div className="flex gap-[15px] sm:flex-row flex-col">
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
              </div>

              <div className="flex gap-[15px] sm:flex-row flex-col">
                <FloatingInput
                  label="Họ tên"
                  type="text"
                  required
                  error={errors.fullname?.message}
                  {...register("fullname")}
                />

                <FloatingInput
                  label="Ngày sinh"
                  type="date"
                  error={errors.birthDate?.message}
                  {...register("birthDate")}
                />
              </div>

              <div className="flex gap-[15px] sm:flex-row flex-col">
                <FloatingSelect
                  label="Giới tính"
                  error={errors.gender?.message}
                  {...register("gender")}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                </FloatingSelect>

                <FloatingInput
                  label="Chức danh"
                  type="text"
                  error={errors.position?.message}
                  {...register("position")}
                />
              </div>

              <div className="flex gap-[15px] sm:flex-row flex-col">
                <FloatingSelect
                  label="Vai trò"
                  required
                  error={errors.roleId?.message}
                  {...register("roleId")}
                >
                  <option value="">Chọn vai trò</option>
                  {roles?.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </FloatingSelect>

                <FloatingInput
                  label="Email"
                  type="email"
                  required
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>
            </div>

            <hr className="border-border border-t" />

            <div className="flex flex-col gap-[30px]">
              <h5>Thông tin liên hệ</h5>

              <div className="flex gap-[15px] sm:flex-row flex-col">
                <FloatingSelect
                  label="Tỉnh/thành phố"
                  disabled={isFetchingProvinces}
                  error={errors.province?.message}
                  {...register("province", {
                    onChange: () => setValue("ward", ""),
                  })}
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.province}>
                      {province.province}
                    </option>
                  ))}
                </FloatingSelect>

                <FloatingSelect
                  label="Phường/xã"
                  disabled={!selectedProvince}
                  error={errors.ward?.message}
                  {...register("ward")}
                >
                  <option value="">Chọn phường/xã</option>
                  {wards.map((ward, index) => (
                    <option key={index} value={ward.name}>
                      {ward.name}
                    </option>
                  ))}
                </FloatingSelect>
              </div>

              <FloatingInput
                label="Địa chỉ"
                type="text"
                error={errors.address?.message}
                {...register("address")}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={handleCancel}
            className="rounded-lg px-3.5 py-2 font-medium border border-border"
          >
            Hủy bỏ
          </Button>

          <Button
            disabled={isCreating}
            type="submit"
            className="rounded-lg px-3.5 py-2 font-medium flex justify-center items-center gap-2 bg-primary text-white"
          >
            <Save size={18} />
            <span>Lưu</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateUserForm;
