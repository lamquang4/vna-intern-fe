"use client";
import { Controller, useForm } from "react-hook-form";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingInput } from "@/libs/core/components/ui/FloatingInput";
import { FloatingSelect } from "@/libs/core/components/ui/FloatingSelect";
import { useGetAllRoles } from "../../../hooks/useRoles";
import { Funnel, FunnelX } from "lucide-react";
import { STATUS_OPTIONS } from "@/libs/core/constants/options";

interface Props {
  onClose: () => void;
}

const EMPTY_FILTERS = {
  fullname: "",
  username: "",
  email: "",
  position: "",
  roleName: "",
  isActive: "",
};

type Filters = typeof EMPTY_FILTERS;

function UserFilterForm({ onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data } = useGetAllRoles();
  const roles = data?.data;

  const { register, control, handleSubmit, reset } = useForm<Filters>({
    defaultValues: {
      fullname: searchParams.get("fullname") ?? "",
      username: searchParams.get("username") ?? "",
      email: searchParams.get("email") ?? "",
      position: searchParams.get("position") ?? "",
      roleName: searchParams.get("roleName") ?? "",
      isActive: searchParams.get("isActive") ?? "",
    },
  });

  // ===== Options cho FloatingSelect =====
  const roleOptions = (roles ?? []).map((role) => ({
    value: role.name,
    label: role.name,
  }));

  const applyFilters = (values: Filters) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(values).forEach(([key, value]) => {
      if (value.trim()) params.set(key, value.trim());
      else params.delete(key);
    });
    params.set("page", "1");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    onClose();
  };

  const handleClear = () => {
    reset(EMPTY_FILTERS);
    applyFilters(EMPTY_FILTERS);
  };

  return (
    <form
      className="flex flex-col flex-1 min-h-0"
      onSubmit={handleSubmit(applyFilters)}
    >
      <div className="flex flex-col gap-8 pt-4">
        <div className="flex flex-col gap-6">
          <div className="flex gap-[15px] sm:flex-row flex-col">
            <FloatingInput
              label="Họ tên"
              placeholder="Nhập họ tên"
              type="text"
              {...register("fullname")}
            />
            <FloatingInput
              label="Tài khoản"
              placeholder="Nhập tài khoản"
              type="text"
              {...register("username")}
            />
          </div>

          <div className="flex gap-[15px] sm:flex-row flex-col">
            <FloatingInput
              label="Email"
              placeholder="Nhập email"
              type="text"
              {...register("email")}
            />
            <FloatingInput
              label="Chức danh"
              placeholder="Nhập chức danh"
              type="text"
              {...register("position")}
            />
          </div>

          <div className="flex gap-[15px] sm:flex-row flex-col">
            <Controller
              name="roleName"
              control={control}
              render={({ field }) => (
                <FloatingSelect
                  label="Vai trò"
                  placeholder="Tất cả vai trò"
                  options={roleOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <FloatingSelect
                  label="Trạng thái"
                  placeholder="Tất cả trạng thái"
                  options={STATUS_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            onClick={handleClear}
            className="rounded-lg bg-error px-3 py-2.5 font-medium text-white flex items-center gap-2"
          >
            <FunnelX size={20} /> <span>Xóa bộ lọc</span>
          </Button>

          <Button
            type="submit"
            className="rounded-lg bg-primary px-3 py-2.5 font-medium text-white flex items-center gap-2"
          >
            <Funnel size={20} /> <span>Áp dụng</span>
          </Button>
        </div>
      </div>
    </form>
  );
}

export default UserFilterForm;
