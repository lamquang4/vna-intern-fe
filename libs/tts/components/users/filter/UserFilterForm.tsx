"use client";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingInput } from "@/libs/core/components/ui/FloatingInput";
import { FloatingSelect } from "@/libs/core/components/ui/FloatingSelect";
import { useGetAllRoles } from "../../../hooks/useRoles";
import { Funnel, FunnelX } from "lucide-react";

interface Props {
  onClose: () => void;
}

function UserFilterForm({ onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data } = useGetAllRoles();
  const roles = data?.data;

  const [filters, setFilters] = useState({
    fullname: searchParams.get("fullname") ?? "",
    username: searchParams.get("username") ?? "",
    email: searchParams.get("email") ?? "",
    position: searchParams.get("position") ?? "",
    roleName: searchParams.get("roleName") ?? "",
    isActive: searchParams.get("isActive") ?? "",
  });

  const handleChange =
    (key: keyof typeof filters) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  const applyFilters = (values: typeof filters) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(values).forEach(([key, value]) => {
      if (value.trim()) params.set(key, value.trim());
      else params.delete(key);
    });
    params.set("page", "1");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(filters);
  };

  const handleClear = () => {
    const empty = {
      fullname: "",
      username: "",
      email: "",
      position: "",
      roleName: "",
      isActive: "",
    };
    setFilters(empty);
    applyFilters(empty);
  };

  return (
    <form className="flex flex-col flex-1 min-h-0" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-8 pt-4">
        <div className="flex flex-col gap-6">
          <div className="flex gap-[15px] sm:flex-row flex-col">
            <FloatingInput
              label="Họ tên"
              type="text"
              value={filters.fullname}
              onChange={handleChange("fullname")}
            />
            <FloatingInput
              label="Tài khoản"
              type="text"
              value={filters.username}
              onChange={handleChange("username")}
            />
          </div>

          <div className="flex gap-[15px] sm:flex-row flex-col">
            <FloatingInput
              label="Email"
              type="text"
              value={filters.email}
              onChange={handleChange("email")}
            />
            <FloatingInput
              label="Chức danh"
              type="text"
              value={filters.position}
              onChange={handleChange("position")}
            />
          </div>

          <div className="flex gap-[15px] sm:flex-row flex-col">
            <FloatingSelect
              label="Vai trò"
              value={filters.roleName}
              onChange={handleChange("roleName")}
            >
              <option value="">Tất cả vai trò</option>
              {roles?.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </FloatingSelect>

            <FloatingSelect
              label="Trạng thái"
              value={filters.isActive}
              onChange={handleChange("isActive")}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Hoạt động</option>
              <option value="false">Ngừng hoạt động</option>
            </FloatingSelect>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            onClick={handleClear}
            className="rounded-lg bg-error px-3.5 py-2 font-medium text-white flex items-center gap-2"
          >
            <span>Xóa bộ lọc</span> <FunnelX size={20} />
          </Button>

          <Button
            type="submit"
            className="rounded-lg bg-primary px-3.5 py-2 font-medium text-white flex items-center gap-2"
          >
            <span>Áp dụng</span> <Funnel size={20} />
          </Button>
        </div>
      </div>
    </form>
  );
}

export default UserFilterForm;
