"use client";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import z from "zod";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingInput } from "@/libs/core/components/ui/fields/FloatingInput";
import { FloatingSelect } from "@/libs/core/components/ui/fields/FloatingSelect";
import { useGetAllBusinessIndustries } from "@/libs/tts/hooks/useBusinessIndustries";
import { useGetAllBusinessTypes } from "@/libs/tts/hooks/useBusinessTypes";
import {
  useGetHCMProvince,
  useGetHCMWards,
} from "@/libs/tts/hooks/useLocation";
import {
  CreateEnterpriseData,
  createEnterpriseSchema,
} from "@/libs/shared/tts/schemas/enterprise.schema";
import {
  DocumentField,
  DocumentRow,
} from "@/libs/shared/tts/models/enterprise.model";
import DocumentsField from "../DocumentsField";
import { formatTaxCodeInput } from "@/libs/core/utils/formatters";
import { PreviewFile } from "@/libs/tts/utils/filePreviewUtil";

interface Props {
  onContinue: (
    data: CreateEnterpriseData,
    businessTypeName: string,
    businessIndustryName: string,
  ) => void;
  initialData: CreateEnterpriseData | null;
}

function CreateEnterpriseForm({ onContinue, initialData }: Props) {
  const { data: businessIndustryData } = useGetAllBusinessIndustries();
  const businessIndustries = businessIndustryData?.data;

  const { data: businessTypeData } = useGetAllBusinessTypes();
  const businessTypes = businessTypeData?.data;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<
    z.input<typeof createEnterpriseSchema>,
    unknown,
    z.output<typeof createEnterpriseSchema>
  >({
    resolver: zodResolver(createEnterpriseSchema),
    mode: "onBlur",
    defaultValues: initialData ?? {
      name: "",
      licenseIssueDate: "",
      taxCode: "",
      businessTypeId: "",
      businessIndustryId: "",
      province: "",
      ward: "",
      address: "",
      foreignName: "",
      email: "",
      officePhone: "",
      operatingProvince: "",
      operatingWard: "",
      businessLocation: "",
      representative: "",
      representativePhone: "",
      businessLicense: null,
      otherDocument: null,
    },
  });

  const { data: province, isLoading: isFetchingProvince } = useGetHCMProvince();

  const selectedProvince = useWatch({
    control,
    name: "province",
  });
  const selectedOperatingProvince = useWatch({
    control,
    name: "operatingProvince",
  });

  const wards = useGetHCMWards();

  const businessLicense = useWatch({ control, name: "businessLicense" });
  const otherDocument = useWatch({ control, name: "otherDocument" });

  const businessTypeOptions =
    businessTypes?.map((t) => ({
      value: t.businessTypeId,
      label: `${t.code} - ${t.name}`,
    })) ?? [];

  const businessIndustryOptions =
    businessIndustries?.map((i) => ({
      value: i.businessIndustryId,
      label: `${i.code} - ${i.name}`,
    })) ?? [];

  const provinceOptions = province
    ? [{ value: province.province, label: province.province }]
    : [];

  const wardOptions = wards.map((w) => ({ value: w.name, label: w.name }));

  const onSubmit = (data: CreateEnterpriseData) => {
    onContinue(
      data,
      businessTypes?.find((item) => item.businessTypeId === data.businessTypeId)
        ?.name ?? "",
      businessIndustries?.find(
        (item) => item.businessIndustryId === data.businessIndustryId,
      )?.name ?? "",
    );
  };

  const documents: DocumentRow<PreviewFile>[] = [
    {
      id: "businessLicense",
      name: "Giấy phép kinh doanh",
      file: businessLicense ?? null,
    },
    {
      id: "otherDocument",
      name: "Giấy tờ khác",
      file: otherDocument ?? null,
    },
  ];

  const handleSelectDocument = (id: DocumentField, file: File) =>
    setValue(id, file, { shouldDirty: true, shouldValidate: true });

  const handleRemoveDocument = (id: DocumentField) =>
    setValue(id, null, { shouldDirty: true, shouldValidate: true });

  const handleCancel = () => {
    reset();
  };

  return (
    <form
      className="flex flex-col gap-6 w-full"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col gap-[20px] w-full">
        <div className="flex flex-col gap-[20px]">
          <h5>Thông tin doanh nghiệp</h5>

          <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-3">
            <FloatingInput
              label="Tên doanh nghiệp"
              placeholder="Nhập tên doanh nghiệp"
              type="text"
              required
              error={errors.name?.message}
              {...register("name")}
            />

            <FloatingInput
              label="Mã số thuế"
              placeholder="Nhập mã số thuế"
              type="text"
              inputMode="numeric"
              maxLength={14}
              required
              error={errors.taxCode?.message}
              {...register("taxCode", {
                onChange: (e) => {
                  e.target.value = formatTaxCodeInput(e.target.value);
                },
              })}
            />

            <Controller
              name="businessTypeId"
              control={control}
              render={({ field }) => (
                <FloatingSelect
                  required
                  label="Loại hình kinh doanh"
                  placeholder="Chọn loại hình kinh doanh"
                  options={businessTypeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.businessTypeId?.message}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-3">
            <Controller
              name="businessIndustryId"
              control={control}
              render={({ field }) => (
                <FloatingSelect
                  required
                  label="Ngành nghề kinh doanh"
                  placeholder="Chọn ngành nghề kinh doanh"
                  options={businessIndustryOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.businessIndustryId?.message}
                />
              )}
            />

            <Controller
              name="licenseIssueDate"
              control={control}
              render={({ field, fieldState }) => (
                <FloatingInput
                  label="Ngày cấp GPKD"
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

            <Controller
              name="province"
              control={control}
              render={({ field }) => (
                <FloatingSelect
                  required
                  label="Tỉnh/thành phố"
                  placeholder="Chọn tỉnh/thành phố"
                  disabled={isFetchingProvince}
                  options={provinceOptions}
                  value={field.value}
                  onChange={(v) => {
                    field.onChange(v);
                    setValue("ward", "");
                  }}
                  onBlur={field.onBlur}
                  error={errors.province?.message}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-3">
            <Controller
              name="ward"
              control={control}
              render={({ field }) => (
                <FloatingSelect
                  required
                  label="Phường/xã"
                  placeholder="Chọn phường/xã"
                  disabled={!selectedProvince}
                  options={wardOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.ward?.message}
                />
              )}
            />

            <FloatingInput
              label="Địa chỉ"
              placeholder="Nhập địa chỉ"
              type="text"
              error={errors.address?.message}
              {...register("address")}
            />
          </div>
        </div>

        <hr className="border-border border-t" />

        <div className="flex flex-col gap-[20px]">
          <h5>Thông tin liên hệ</h5>

          <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-3">
            <FloatingInput
              label="Tên viết bằng tiếng nước ngoài"
              placeholder="Nhập tên viết bằng tiếng nước ngoài"
              type="text"
              error={errors.foreignName?.message}
              {...register("foreignName")}
            />

            <FloatingInput
              label="Email"
              placeholder="Nhập email"
              type="text"
              required
              error={errors.email?.message}
              {...register("email")}
            />

            <FloatingInput
              label="Số điện thoại cơ quan"
              placeholder="Nhập số điện thoại cơ quan"
              type="text"
              error={errors.officePhone?.message}
              {...register("officePhone")}
            />
          </div>

          <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-3">
            <Controller
              name="operatingProvince"
              control={control}
              render={({ field }) => (
                <FloatingSelect
                  label="Tỉnh/thành phố hoạt động KD"
                  placeholder="Chọn tỉnh/thành phố"
                  disabled={isFetchingProvince}
                  options={provinceOptions}
                  value={field.value}
                  onChange={(v) => {
                    field.onChange(v);
                    setValue("operatingWard", "");
                  }}
                  onBlur={field.onBlur}
                  error={errors.operatingProvince?.message}
                />
              )}
            />

            <Controller
              name="operatingWard"
              control={control}
              render={({ field }) => (
                <FloatingSelect
                  label="Phường/xã hoạt động KD"
                  placeholder="Chọn phường/xã"
                  disabled={!selectedOperatingProvince}
                  options={wardOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.operatingWard?.message}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-3">
            <FloatingInput
              label="Địa chỉ kinh doanh"
              placeholder="Nhập địa chỉ kinh doanh"
              type="text"
              error={errors.businessLocation?.message}
              {...register("businessLocation")}
            />

            <FloatingInput
              label="Người đứng đầu kinh doanh"
              placeholder="Nhập người đứng đầu kinh doanh"
              type="text"
              error={errors.representative?.message}
              {...register("representative")}
            />

            <FloatingInput
              label="SĐT liên hệ người đứng đầu"
              placeholder="Nhập SĐT liên hệ người đứng đầu"
              type="text"
              error={errors.representativePhone?.message}
              {...register("representativePhone")}
            />
          </div>
        </div>

        <hr className="border-border border-t" />

        <div className="flex flex-col gap-[20px]">
          <h5>File đính kèm</h5>
          <DocumentsField
            documents={documents}
            onSelect={handleSelectDocument}
            onRemove={(row) => handleRemoveDocument(row.id)}
          />
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
          type="submit"
          className="rounded-lg px-3.5 py-2 font-medium bg-primary text-white"
        >
          Tiếp tục
        </Button>
      </div>
    </form>
  );
}

export default CreateEnterpriseForm;
