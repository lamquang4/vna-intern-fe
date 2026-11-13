"use client";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import z from "zod";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingInput } from "@/libs/core/components/ui/fields/FloatingInput";
import { FloatingSelect } from "@/libs/core/components/ui/fields/FloatingSelect";
import { Label } from "@/libs/core/components/ui/Label";
import { ChevronLeft } from "lucide-react";
import AvatarUpload from "./AvatarUpload";
import {
  CreateUserData,
  createUserSchema,
} from "@/libs/shared/tts/schemas/user.schema";
import { useGetHCMProvince, useGetHCMWards } from "../../hooks/useLocation";
import { useWatch } from "react-hook-form";
import { useGetAllRoles } from "../../hooks/useRoles";
import { DEFAULT_PASSWORD } from "@/libs/core/constants/limits";
import { useCreateUser } from "../../hooks/useUsers";
import { Switch } from "@/libs/core/components/ui/Switch";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GENDER_OPTIONS } from "@/libs/core/constants/options";
import { RoleCode } from "@/libs/shared/tts/models/enums";

function CreateUserForm() {
  const router = useRouter();

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

  const { data: province, isLoading: isFetchingProvince } = useGetHCMProvince();

  const selectedProvince = useWatch({
    control,
    name: "province",
  });

  const wards = useGetHCMWards();

  const roleOptions = (roles ?? [])
    .filter((role) => role.code !== RoleCode.DOANH_NGHIEP)
    .map((role) => ({
      value: role.roleId,
      label: role.name,
    }));

  const provinceOptions = province
    ? [{ value: province.province, label: province.province }]
    : [];

  const wardOptions = wards.map((ward) => ({
    value: ward.name,
    label: ward.name,
  }));

  const onSubmit = (data: CreateUserData) => {
    if (isCreating) return;

    createUserMutation.mutate(data, {
      onSuccess: () => {
        reset();
        router.push("/users");
      },
    });
  };

  const handleCancel = () => {
    reset();
  };

  return (
    <div className="py-[20px] sm:px-[20px] px-[15px] flex flex-col gap-6 overflow-y-auto">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <h3>Thêm người dùng</h3>

        <Link
          href="/users"
          className="flex items-center font-medium gap-1 text-muted-foreground hover:text-primary px-3 py-2"
        >
          <ChevronLeft size={20} /> <span>Trở về</span>
        </Link>
      </div>

      <form
        className="flex flex-col gap-6 w-full"
        onSubmit={handleSubmit(onSubmit)}
      >
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
            <div className="flex flex-col gap-[20px]">
              <h5>Thông tin cá nhân</h5>

              <div className="grid grid-cols-1 gap-[15px] lg:grid-cols-2">
                <FloatingInput
                  label="Tên tài khoản"
                  placeholder="Nhập tên tài khoản"
                  type="text"
                  required
                  error={errors.username?.message}
                  {...register("username")}
                />

                <FloatingInput
                  label="Mật khẩu"
                  placeholder="Nhập mật khẩu"
                  type="password"
                  required
                  error={errors.password?.message}
                  {...register("password")}
                />
              </div>

              <div className="grid grid-cols-1 gap-[15px] lg:grid-cols-2">
                <FloatingInput
                  label="Họ tên"
                  placeholder="Nhập họ tên"
                  type="text"
                  required
                  error={errors.fullname?.message}
                  {...register("fullname")}
                />

                <Controller
                  name="birthDate"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FloatingInput
                      label="Ngày sinh"
                      type="date"
                      dateValue={field.value ? parseISO(field.value) : null}
                      onDateChange={(date) => {
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                        field.onBlur();
                      }}
                      onBlur={field.onBlur}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-[15px] lg:grid-cols-2">
                <Controller
                  name="gender"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FloatingSelect
                      label="Giới tính"
                      placeholder="Chọn giới tính"
                      options={GENDER_OPTIONS}
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                <FloatingInput
                  label="Chức danh"
                  type="text"
                  error={errors.position?.message}
                  {...register("position")}
                />
              </div>

              <div className="grid grid-cols-1 gap-[15px] lg:grid-cols-2">
                <Controller
                  name="roleId"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FloatingSelect
                      required
                      label="Vai trò"
                      placeholder="Chọn vai trò"
                      options={roleOptions}
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                <FloatingInput
                  label="Email"
                  placeholder="Nhập email"
                  type="email"
                  required
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>
            </div>

            <hr className="border-border border-t" />

            <div className="flex flex-col gap-[20px]">
              <h5>Thông tin liên hệ</h5>

              <div className="grid grid-cols-1 gap-[15px] lg:grid-cols-2">
                <Controller
                  name="province"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FloatingSelect
                      label="Tỉnh/thành phố"
                      placeholder="Chọn tỉnh/thành phố"
                      disabled={isFetchingProvince}
                      options={provinceOptions}
                      name={field.name}
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        setValue("ward", "");
                      }}
                      onBlur={field.onBlur}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  name="ward"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FloatingSelect
                      label="Phường/xã"
                      placeholder="Chọn phường/xã"
                      disabled={!selectedProvince}
                      options={wardOptions}
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-[15px] lg:grid-cols-2">
                <FloatingInput
                  label="Địa chỉ"
                  placeholder="Nhập địa chỉ"
                  type="text"
                  error={errors.address?.message}
                  {...register("address")}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            onClick={handleCancel}
            className="rounded-lg px-3 py-2 font-medium border border-border"
          >
            Hủy bỏ
          </Button>

          <Button
            disabled={isCreating}
            type="submit"
            className="rounded-lg px-3 py-2 font-medium bg-primary text-white"
          >
            Lưu
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateUserForm;
