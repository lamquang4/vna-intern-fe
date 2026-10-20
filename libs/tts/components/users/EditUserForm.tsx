"use client";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingInput } from "@/libs/core/components/ui/FloatingInput";
import { FloatingSelect } from "@/libs/core/components/ui/FloatingSelect";
import { Input } from "@/libs/core/components/ui/Input";
import { Label } from "@/libs/core/components/ui/Label";
import { Save } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ChangeEmailModal from "../change-email/ChangeEmailModal";
import {
  UpdateUserData,
  updateUserSchema,
} from "@/libs/shared/tts/schemas/user.schema";
import AvatarUpload from "./AvatarUpload";
import z from "zod";
import { useProvinces, useWards } from "../../hooks/useLocation";
import { useMe } from "../../hooks/useAuth";
import {
  useUpdateMe,
  useUpdateUser,
  useUserDetail,
} from "../../hooks/useUsers";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useGetAllRoles } from "../../hooks/useRoles";

interface Props {
  userId?: string;
}

function EditUserForm({ userId }: Props) {
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const isAccountPage = !userId;

  const { data } = useGetAllRoles();
  const roles = data?.data;

  const meQuery = useMe({ enabled: isAccountPage });
  const userDetailQuery = useUserDetail(userId ?? "");

  const activeQuery = isAccountPage ? meQuery : userDetailQuery;
  const user = activeQuery.data?.data;

  const updateMeMutation = useUpdateMe();
  const updateUserMutation = useUpdateUser(userId ?? "");
  const updateMutation = isAccountPage ? updateMeMutation : updateUserMutation;

  const isLoading = updateMutation.isPending;
  const isLoadingUser = activeQuery.isLoading;

  useEffect(() => {
    if (isLoadingUser || isAccountPage) return;

    if (!user) {
      toast.error("Không tìm thấy người dùng");
      router.replace("/users");
    }
  }, [isLoadingUser, isAccountPage, user, router]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<
    z.input<typeof updateUserSchema>,
    unknown,
    z.output<typeof updateUserSchema>
  >({
    resolver: zodResolver(updateUserSchema),
    mode: "onBlur",
    values: {
      fullname: user?.fullname ?? "",
      birthDate: user?.birthDate ?? null,
      gender:
        user?.gender === "FEMALE" || user?.gender === "MALE"
          ? user.gender
          : null,
      position: user?.position ?? null,
      roleId: user?.roleId ?? "",
      province: user?.province ?? null,
      ward: user?.ward ?? null,
      address: user?.address ?? null,
      isActive: user?.isActive ?? false,
      avatar: null,
    },
  });

  const { data: provinces = [], isLoading: isLoadingProvinces } =
    useProvinces();

  const selectedProvince = useWatch({
    control,
    name: "province",
  });

  const wards = useWards(selectedProvince ?? "");

  const onSubmit = async (data: UpdateUserData) => {
    if (isLoading) return;

    updateMutation.mutate(data);
  };

  return (
    <>
      <div className="py-[30px] sm:px-[20px] px-[15px] overflow-y-auto">
        <form
          className="flex flex-col gap-6 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h3>Chi tiết người dùng</h3>

          <div className="grid w-full grid-cols-1 gap-[20px] lg:grid-cols-[3fr_7fr]">
            <div className="flex w-full h-fit flex-col gap-6 rounded-md border border-border p-[15px]">
              <Controller
                name="avatar"
                control={control}
                render={({ field }) => (
                  <AvatarUpload
                    value={field.value}
                    onChange={field.onChange}
                    currentUrl={user?.avatarUrl}
                    disabled={isSubmitting}
                  />
                )}
              />

              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Label className="flex w-full cursor-pointer items-center justify-between gap-3">
                    <h5>Kích hoạt</h5>

                    <span className="relative inline-flex">
                      <Input
                        type="checkbox"
                        role="switch"
                        checked={field.value}
                        onChange={(event) =>
                          field.onChange(event.target.checked)
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        disabled={isSubmitting}
                        className="peer sr-only"
                      />

                      <span className="h-6 w-12 rounded-full bg-primary/50 transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-disabled:opacity-50" />

                      <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-6" />
                    </span>
                  </Label>
                )}
              />
            </div>

            <div className="p-[15px] rounded-md flex flex-col gap-[20px] w-full border border-border">
              <div className="flex flex-col gap-[25px]">
                <h5>Thông tin cá nhân</h5>

                <div className="flex gap-[15px] sm:flex-row flex-col">
                  <FloatingInput
                    label="Tên tài khoản"
                    type="text"
                    value={user?.username}
                    required
                    disabled
                  />

                  <Controller
                    name="fullname"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FloatingInput
                        {...field}
                        label="Họ tên"
                        type="text"
                        required
                        error={fieldState.error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </div>

                <div className="flex gap-[15px] sm:flex-row flex-col">
                  <Controller
                    name="birthDate"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FloatingInput
                        {...field}
                        value={field.value ?? ""}
                        label="Ngày sinh"
                        type="date"
                        error={fieldState.error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />

                  <Controller
                    name="gender"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FloatingSelect
                        {...field}
                        value={field.value ?? ""}
                        label="Giới tính"
                        error={fieldState.error?.message}
                        disabled={isSubmitting}
                      >
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                      </FloatingSelect>
                    )}
                  />
                </div>

                <div className="flex gap-[15px] sm:flex-row flex-col">
                  <Controller
                    name="position"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FloatingInput
                        {...field}
                        value={field.value ?? ""}
                        label="Chức danh"
                        type="text"
                        error={fieldState.error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />

                  <Controller
                    name="roleId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FloatingSelect
                        {...field}
                        value={field.value ?? ""}
                        label="Vai trò"
                        required
                        error={fieldState.error?.message}
                        disabled={isSubmitting}
                      >
                        {roles?.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </FloatingSelect>
                    )}
                  />
                </div>

                <div className="flex gap-[15px] items-center">
                  <FloatingInput
                    label="Email"
                    type="text"
                    value={user?.email}
                    disabled
                    containerClassName="flex-1"
                  />

                  <div className="lg:flex-1">
                    <Button
                      type="button"
                      className="text-primary font-medium"
                      onClick={() => setModalOpen(true)}
                    >
                      Thay đổi
                    </Button>
                  </div>
                </div>
              </div>

              <hr className="border-border border-t" />

              <div className="flex flex-col gap-[25px]">
                <h5>Thông tin liên hệ</h5>

                <div className="flex gap-[15px] sm:flex-row flex-col">
                  <Controller
                    name="province"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FloatingSelect
                        {...field}
                        value={field.value ?? ""}
                        label="Tỉnh/thành phố"
                        error={fieldState.error?.message}
                        disabled={isSubmitting || isLoadingProvinces}
                        onChange={(event) => {
                          field.onChange(event);
                          setValue("ward", null, { shouldValidate: true });
                        }}
                      >
                        <option value="">Chọn tỉnh/thành phố</option>

                        {provinces.map((province) => (
                          <option key={province.id} value={province.province}>
                            {province.province}
                          </option>
                        ))}
                      </FloatingSelect>
                    )}
                  />

                  <Controller
                    name="ward"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FloatingSelect
                        {...field}
                        value={field.value ?? ""}
                        label="Phường/xã"
                        error={fieldState.error?.message}
                        disabled={isSubmitting || !selectedProvince}
                      >
                        <option value="">Chọn phường/xã</option>

                        {wards.map((ward) => (
                          <option key={ward.name} value={ward.name}>
                            {ward.name}
                          </option>
                        ))}
                      </FloatingSelect>
                    )}
                  />
                </div>

                <Controller
                  name="address"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FloatingInput
                      {...field}
                      value={field.value ?? ""}
                      label="Địa chỉ"
                      type="text"
                      error={fieldState.error?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              disabled={isLoading}
              type="submit"
              variant="primary"
              className="w-[70px] rounded-lg py-2.5 font-medium flex justify-center items-center gap-2"
            >
              <Save size={20} />
              <span>Lưu</span>
            </Button>

            <Link
              href="/users"
              className="w-[70px] font-medium text-white py-2.5 bg-error text-center rounded-lg"
            >
              Trở về
            </Link>
          </div>
        </form>
      </div>

      {modalOpen && <ChangeEmailModal onClose={() => setModalOpen(false)} />}
    </>
  );
}

export default EditUserForm;
