"use client";
import { Modal } from "@/libs/core/components/ui/Modal";
import { Controller, useForm, useWatch } from "react-hook-form";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingInput } from "@/libs/core/components/ui/fields/FloatingInput";
import { FloatingSelect } from "@/libs/core/components/ui/fields/FloatingSelect";
import { Funnel, FunnelX } from "lucide-react";
import {
  useGetHCMProvince,
  useGetHCMWards,
} from "@/libs/tts/hooks/useLocation";
import { RoleCode } from "@/libs/shared/tts/models/enums";
import {
  ACCIDENT_REPORT_PERIOD_OPTIONS,
  ACCIDENT_REPORT_STATUS_OPTIONS,
} from "@/libs/core/constants/options";

interface Props {
  onClose: () => void;
  roleCode: RoleCode;
}

const EMPTY_FILTERS = {
  name: "",
  taxCode: "",
  reportPeriod: "",
  status: "",
  province: "",
  ward: "",
};

type Filters = typeof EMPTY_FILTERS;

function AccidentReportFilterModal({ onClose, roleCode }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isEnterprise = roleCode === RoleCode.DOANH_NGHIEP;

  const { register, control, handleSubmit, reset, setValue } = useForm<Filters>(
    {
      defaultValues: {
        name: searchParams.get("name") ?? "",
        taxCode: searchParams.get("taxCode") ?? "",
        reportPeriod: searchParams.get("reportPeriod") ?? "",
        status: searchParams.get("status") ?? "",
        province: searchParams.get("province") ?? "",
        ward: searchParams.get("ward") ?? "",
      },
    },
  );

  const { data: province, isLoading: isFetchingProvince } = useGetHCMProvince();

  const selectedProvince = useWatch({
    control,
    name: "province",
  });

  const wards = useGetHCMWards();

  const provinceOptions = province
    ? [{ value: province.province, label: province.province }]
    : [];

  const wardOptions = (wards ?? []).map((ward) => ({
    value: ward.name,
    label: ward.name,
  }));

  const applyFilters = (values: Filters) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(values).forEach(([key, value]) => {
      if (isEnterprise && (key === "province" || key === "ward")) {
        params.delete(key);
        return;
      }

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
                name="reportPeriod"
                control={control}
                render={({ field }) => (
                  <FloatingSelect
                    label="Kỳ báo cáo"
                    placeholder="Tất cả kỳ báo cáo"
                    options={ACCIDENT_REPORT_PERIOD_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FloatingSelect
                    label="Trạng thái"
                    placeholder="Tất cả trạng thái"
                    options={ACCIDENT_REPORT_STATUS_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {!isEnterprise && (
              <div className="flex gap-[15px] sm:flex-row flex-col">
                <Controller
                  name="province"
                  control={control}
                  render={({ field }) => (
                    <FloatingSelect
                      label="Tỉnh/thành phố"
                      placeholder="Tất cả tỉnh/thành phố"
                      disabled={isFetchingProvince}
                      options={provinceOptions}
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        setValue("ward", "");
                      }}
                    />
                  )}
                />

                <Controller
                  name="ward"
                  control={control}
                  render={({ field }) => (
                    <FloatingSelect
                      label="Phường/xã"
                      placeholder="Tất cả phường/xã"
                      disabled={!selectedProvince}
                      options={wardOptions}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            )}
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

export default AccidentReportFilterModal;
