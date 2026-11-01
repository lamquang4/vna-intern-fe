"use client";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingInput } from "@/libs/core/components/ui/FloatingInput";
import { FloatingSelect } from "@/libs/core/components/ui/FloatingSelect";
import { Label } from "@/libs/core/components/ui/Label";
import { ChevronLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import ChangeEmailModal from "../auth/change-email/ChangeEmailModal";
import {
  updateMeSchema,
  updateUserSchema,
} from "@/libs/shared/tts/schemas/user.schema";
import AvatarUpload from "./AvatarUpload";
import z from "zod";
import { useGetHCMProvince, useGetHCMWards } from "../../hooks/useLocation";
import { useGetMe, useRequestChangeEmailOtp } from "../../hooks/useAuth";
import {
  useUpdateMe,
  useUpdateUser,
  useGetUserDetail,
} from "../../hooks/useUsers";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useGetAllRoles } from "../../hooks/useRoles";
import { Switch } from "@/libs/core/components/ui/Switch";
import Link from "next/link";
import { GENDER_OPTIONS } from "@/libs/core/constants/options";
import { getRequiredRoleCode } from "@/libs/core/utils/validators";
import { ROLE_ADMIN, ROLE_ENTERPRISE } from "@/libs/core/constants/limits";

interface Props {
  userId: string;
}

function EditUserForm({ userId }: Props) {
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const editUserSchema = z.union([updateUserSchema, updateMeSchema]);

  const isAccountPage = !userId;

  const { data } = useGetAllRoles();
  const roles = data?.data;

  const meQuery = useGetMe();
  const userDetailQuery = useGetUserDetail(userId);

  const activeQuery = isAccountPage ? meQuery : userDetailQuery;
  const user = activeQuery.data?.data;
  const currentAccount = meQuery.data?.data;
  const isCurrentUser =
    !isAccountPage &&
    !!user?.username &&
    !!currentAccount?.username &&
    user.username === currentAccount.username;
  const canSkipChangeEmailOtp =
    currentAccount?.roleCode === ROLE_ADMIN &&
    user?.roleCode === ROLE_ENTERPRISE;

  const updateMeMutation = useUpdateMe();
  const updateUserMutation = useUpdateUser(userId);
  const updateMutation = isAccountPage ? updateMeMutation : updateUserMutation;

  const requestChangeEmailOtp = useRequestChangeEmailOtp();

  const isUpdating = updateMutation.isPending;
  const isFetchingUser =
    activeQuery.isLoading || (!isAccountPage && meQuery.isLoading);
  const isRequestingOtp = requestChangeEmailOtp.isPending;

  useEffect(() => {
    if (isFetchingUser || isAccountPage) return;

    if (!user) {
      toast.error("Không tìm thấy người dùng");
      router.replace("/users");
      return;
    }
  }, [isFetchingUser, isAccountPage, isCurrentUser, user, router]);

  const { register, control, handleSubmit, setValue, resetField, reset } =
    useForm<
      z.input<typeof editUserSchema>,
      unknown,
      z.output<typeof editUserSchema>
    >({
      resolver: zodResolver(editUserSchema),
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

  const { data: province, isLoading: isFetchingProvince } = useGetHCMProvince();

  const selectedProvince = useWatch({
    control,
    name: "province",
  });

  const wards = useGetHCMWards();

  const requiredRoleCode = getRequiredRoleCode(user?.username ?? "");
  const isRoleLocked = requiredRoleCode !== null;

  const roleOptions = (roles ?? [])
    .filter((role) => !requiredRoleCode || role.role === requiredRoleCode)
    .map((role) => ({
      value: role.id,
      label: role.name,
    }));

  const provinceOptions = province
    ? [{ value: province.province, label: province.province }]
    : [];

  const wardOptions = wards.map((ward) => ({
    value: ward.name,
    label: ward.name,
  }));

  const onSubmit = (data: z.output<typeof editUserSchema>) => {
    if (isUpdating) return;

    if (!isAccountPage && !currentAccount) {
      toast.error("Không thể xác minh tài khoản hiện tại");
      return;
    }

    const handleSuccess = () => {
      resetField("avatar", {
        defaultValue: null,
      });
    };

    if (isAccountPage) {
      const accountData = updateMeSchema.parse(data);
      updateMeMutation.mutate(accountData, {
        onSuccess: handleSuccess,
      });
    } else {
      const userData = updateUserSchema.parse(data);
      updateUserMutation.mutate(userData, {
        onSuccess: () => {
          handleSuccess();
          router.push("/users");
        },
      });
    }
  };

  const handleRequestChangeEmailOtp = () => {
    if (isRequestingOtp || isFetchingUser) {
      return;
    }

    if (canSkipChangeEmailOtp) {
      setModalOpen(true);
      return;
    }

    requestChangeEmailOtp.mutate(undefined, {
      onSuccess: () => {
        setModalOpen(true);
      },
    });
  };

  const handleCancel = () => {
    reset();
  };

  return (
    <>
      <div className="py-[20px] sm:px-[20px] px-[15px] flex flex-col gap-6 overflow-y-auto">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <h3>Chi tiết người dùng</h3>

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
                    currentUrl={user?.avatarUrl}
                    disabled={isFetchingUser}
                    error={fieldState.error?.message}
                  />
                )}
              />

              {!isAccountPage && !isCurrentUser && currentAccount && (
                <Label className="flex w-full cursor-pointer items-center justify-between gap-3">
                  <h5>Kích hoạt</h5>

                  <Switch disabled={isFetchingUser} {...register("isActive")} />
                </Label>
              )}
            </div>

            <div className="p-[15px] rounded-md flex flex-col gap-[20px] w-full border border-border">
              <div className="flex flex-col gap-[20px]">
                <h5>Thông tin cá nhân</h5>

                <div className="grid grid-cols-1 gap-[15px] lg:grid-cols-2">
                  <FloatingInput
                    label="Tên tài khoản"
                    placeholder="Nhập tên tài khoản"
                    type="text"
                    value={user?.username ?? ""}
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
                        placeholder="Nhập họ tên"
                        type="text"
                        required
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-[15px] lg:grid-cols-2">
                  <Controller
                    name="birthDate"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FloatingInput
                        label="Ngày sinh"
                        type="date"
                        dateValue={field.value ? parseISO(field.value) : null}
                        onDateChange={(date) => {
                          field.onChange(
                            date ? format(date, "yyyy-MM-dd") : null,
                          );
                          field.onBlur();
                        }}
                        onBlur={field.onBlur}
                        error={fieldState.error?.message}
                      />
                    )}
                  />

                  <Controller
                    name="gender"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FloatingSelect
                        label="Giới tính"
                        placeholder="Chọn giới tính"
                        options={GENDER_OPTIONS}
                        name={field.name}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-[15px] lg:grid-cols-2">
                  <Controller
                    name="position"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FloatingInput
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Nhập chức danh"
                        label="Chức danh"
                        type="text"
                        error={fieldState.error?.message}
                      />
                    )}
                  />

                  <Controller
                    name="roleId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FloatingSelect
                        required
                        label="Vai trò"
                        placeholder="Chọn vai trò"
                        options={roleOptions}
                        disabled={isRoleLocked}
                        name={field.name}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </div>

                <div className="grid gap-[15px] grid-cols-2">
                  <FloatingInput
                    label="Email"
                    placeholder="Nhập email"
                    type="text"
                    value={user?.email ?? ""}
                    disabled
                  />

                  <Button
                    type="button"
                    className="lg:justify-self-start justify-self-end text-primary font-medium"
                    onClick={handleRequestChangeEmailOtp}
                    disabled={isRequestingOtp || isFetchingUser}
                  >
                    Thay đổi
                  </Button>
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
                        value={field.value ?? ""}
                        onChange={(val) => {
                          field.onChange(val);
                          setValue("ward", null, { shouldValidate: true });
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
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-[15px] lg:grid-cols-2">
                  <Controller
                    name="address"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FloatingInput
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Nhập địa chỉ"
                        label="Địa chỉ"
                        type="text"
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              onClick={handleCancel}
              className="rounded-lg px-3.5 py-2 font-medium border border-border"
            >
              Hủy bỏ
            </Button>

            <Button
              disabled={isFetchingUser}
              type="submit"
              className="rounded-lg px-3.5 py-2 font-medium flex justify-center items-center gap-2 bg-primary text-white"
            >
              <Save size={18} />
              <span>Lưu</span>
            </Button>
          </div>
        </form>
      </div>

      {modalOpen && (
        <ChangeEmailModal
          onClose={() => setModalOpen(false)}
          email={user?.email || ""}
          roleCode={user?.roleCode || ""}
        />
      )}
    </>
  );
}

export default EditUserForm;
