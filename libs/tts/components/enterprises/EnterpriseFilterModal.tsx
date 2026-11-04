"use client";
import { Modal } from "@/libs/core/components/ui/Modal";
import { Controller, useForm } from "react-hook-form";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingInput } from "@/libs/core/components/ui/fields/FloatingInput";
import { FloatingSelect } from "@/libs/core/components/ui/fields/FloatingSelect";
import { Funnel, FunnelX } from "lucide-react";
import { useGetAllBusinessIndustries } from "@/libs/tts/hooks/useBusinessIndustries";
import { useGetAllBusinessTypes } from "@/libs/tts/hooks/useBusinessTypes";
import { useGetHCMWards } from "@/libs/tts/hooks/useLocation";
import { STATUS_OPTIONS } from "@/libs/core/constants/options";

interface Props {
  onClose: () => void;
}

const EMPTY_FILTERS = {
  name: "",
  taxCode: "",
  businessType: "",
  businessIndustry: "",
  ward: "",
  isActive: "",
};

type Filters = typeof EMPTY_FILTERS;

interface Props {
  onClose: () => void;
}

function EnterpriseFilterModal({ onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const wards = useGetHCMWards();

  const { data: businessIndustryData } = useGetAllBusinessIndustries();
  const businessIndustries = businessIndustryData?.data;

  const { data: businessTypeData } = useGetAllBusinessTypes();
  const businessTypes = businessTypeData?.data;

  const { register, control, handleSubmit, reset } = useForm<Filters>({
    defaultValues: {
      name: searchParams.get("name") ?? "",
      taxCode: searchParams.get("taxCode") ?? "",
      businessType: searchParams.get("businessType") ?? "",
      businessIndustry: searchParams.get("businessIndustry") ?? "",
      ward: searchParams.get("ward") ?? "",
      isActive: searchParams.get("isActive") ?? "",
    },
  });

  const businessTypeOptions = (businessTypes ?? []).map((type) => ({
    value: type.name,
    label: `${type.code} - ${type.name}`,
  }));

  const businessIndustryOptions = (businessIndustries ?? []).map(
    (industry) => ({
      value: industry.name,
      label: `${industry.code} - ${industry.name}`,
    }),
  );

  const wardOptions = (wards ?? []).map((ward) => ({
    value: ward.name,
    label: ward.name,
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
    <Modal
      title="Bộ lọc"
      headerClassName="uppercase border border-border"
      onClose={onClose}
      className="max-w-[600px]"
    >
      <form
        className="flex flex-col flex-1 min-h-0"
        onSubmit={handleSubmit(applyFilters)}
      >
        <div className="flex flex-col gap-8 pt-4">
          <div className="flex flex-col gap-6">
            <div className="flex gap-[15px] sm:flex-row flex-col">
              <FloatingInput
                label="Tên doanh nghiệp"
                placeholder="Nhập tên doanh nghiệp"
                type="text"
                {...register("name")}
              />

              <FloatingInput
                label="Mã số thuế"
                placeholder="Nhập mã số thuế"
                type="text"
                {...register("taxCode")}
              />
            </div>

            <div className="flex gap-[15px] sm:flex-row flex-col">
              <Controller
                name="businessType"
                control={control}
                render={({ field }) => (
                  <FloatingSelect
                    label="Loại hình kinh doanh"
                    placeholder="Tất cả loại hình kinh doanh"
                    options={businessTypeOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <Controller
                name="businessIndustry"
                control={control}
                render={({ field }) => (
                  <FloatingSelect
                    label="Ngành nghề kinh doanh"
                    placeholder="Tất cả ngành nghề kinh doanh"
                    options={businessIndustryOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="flex gap-[15px] sm:flex-row flex-col">
              <Controller
                name="ward"
                control={control}
                render={({ field }) => (
                  <FloatingSelect
                    label="Phường/xã"
                    placeholder="Tất cả phường/xã"
                    options={wardOptions}
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
    </Modal>
  );
}

export default EnterpriseFilterModal;
