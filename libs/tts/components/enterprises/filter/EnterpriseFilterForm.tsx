"use client";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingInput } from "@/libs/core/components/ui/FloatingInput";
import { FloatingSelect } from "@/libs/core/components/ui/FloatingSelect";
import { Funnel, FunnelX } from "lucide-react";
import { useGetAllBusinessIndustries } from "@/libs/tts/hooks/useBusinessIndustries";
import { useGetAllBusinessTypes } from "@/libs/tts/hooks/useBusinessTypes";
import { useGetAllWards } from "@/libs/tts/hooks/useLocation";

interface Props {
  onClose: () => void;
}

function EnterpriseFilterForm({ onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const wards = useGetAllWards();

  const { data: businessIndustryData } = useGetAllBusinessIndustries();
  const businessIndustries = businessIndustryData?.data;

  const { data: businessTypeData } = useGetAllBusinessTypes();
  const businessTypes = businessTypeData?.data;

  const [filters, setFilters] = useState({
    name: searchParams.get("name") ?? "",
    taxCode: searchParams.get("taxCode") ?? "",
    businessType: searchParams.get("businessType") ?? "",
    businessIndustry: searchParams.get("businessIndustry") ?? "",
    ward: searchParams.get("ward") ?? "",
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
      name: "",
      taxCode: "",
      businessType: "",
      businessIndustry: "",
      ward: "",
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
              label="Tên doanh nghiệp"
              type="text"
              value={filters.name}
              onChange={handleChange("name")}
            />
            <FloatingInput
              label="Mã số thuế"
              type="text"
              value={filters.taxCode}
              onChange={handleChange("taxCode")}
            />
          </div>

          <div className="flex gap-[15px] sm:flex-row flex-col">
            <FloatingSelect
              label="Loại hình kinh doanh"
              value={filters.businessType}
              onChange={handleChange("businessType")}
            >
              <option value="">Tất cả loại hình kinh doanh</option>
              {businessTypes?.map((type) => (
                <option key={type.businessTypeId} value={type.name}>
                  {type.code} {type.name}
                </option>
              ))}
            </FloatingSelect>

            <FloatingSelect
              label="Ngành nghề kinh doanh"
              value={filters.businessIndustry}
              onChange={handleChange("businessIndustry")}
            >
              <option value="">Tất cả ngành nghề kinh doanh</option>
              {businessIndustries?.map((industry) => (
                <option key={industry.businessIndustryId} value={industry.name}>
                  {industry.code} {industry.name}
                </option>
              ))}
            </FloatingSelect>
          </div>

          <div className="flex gap-[15px] sm:flex-row flex-col">
            <FloatingSelect
              label="Phường/xã"
              value={filters.ward}
              onChange={handleChange("ward")}
            >
              <option value="">Tất cả phường/xã</option>

              {wards?.map((ward, index) => (
                <option key={index} value={ward.name}>
                  {ward.name}
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

export default EnterpriseFilterForm;
