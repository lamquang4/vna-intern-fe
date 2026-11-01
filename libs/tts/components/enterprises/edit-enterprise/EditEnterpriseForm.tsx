"use client";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import z from "zod";
import { Button } from "@/libs/core/components/ui/Button";
import { ConfirmDialog } from "@/libs/core/components/ui/ConfirmDialog";
import { FloatingInput } from "@/libs/core/components/ui/FloatingInput";
import { FloatingSelect } from "@/libs/core/components/ui/FloatingSelect";
import { useGetAllBusinessIndustries } from "@/libs/tts/hooks/useBusinessIndustries";
import { useGetAllBusinessTypes } from "@/libs/tts/hooks/useBusinessTypes";
import {
  useGetHCMProvince,
  useGetHCMWards,
} from "@/libs/tts/hooks/useLocation";
import {
  UpdateEnterpriseData,
  updateEnterpriseSchema,
} from "@/libs/shared/tts/schemas/enterprise.schema";
import type {
  DocumentField,
  DocumentRow,
  EnterpriseDetailResponse,
} from "@/libs/shared/tts/models/enterprise.model";
import type { PreviewFile } from "@/libs/tts/utils/filePreviewUtil";
import DocumentsField from "../DocumentsField";
import { useGetEnterpriseDetail } from "@/libs/tts/hooks/useEnterprises";

interface Props {
  onContinue: (
    data: UpdateEnterpriseData,
    businessTypeName: string,
    businessIndustryName: string,
    existingFiles: Pick<
      EnterpriseDetailResponse,
      "businessLicense" | "otherDocument"
    >,
    taxCode: string,
  ) => void;
  initialData: UpdateEnterpriseData | null;
  enterpriseId: string;
}

function EditEnterpriseForm({ onContinue, initialData, enterpriseId }: Props) {
  const [documentToDelete, setDocumentToDelete] =
    useState<DocumentRow<PreviewFile> | null>(null);
  const { data: businessIndustryData } = useGetAllBusinessIndustries();
  const businessIndustries = businessIndustryData?.data;

  const { data: businessTypeData } = useGetAllBusinessTypes();
  const businessTypes = businessTypeData?.data;

  const { data: enterpriseData } = useGetEnterpriseDetail(enterpriseId);
  const enterprise = enterpriseData?.data;

  const serverValues = {
    name: enterprise?.name ?? "",
    licenseIssueDate: enterprise?.licenseIssueDate ?? "",
    businessTypeId: enterprise?.businessTypeId ?? "",
    businessIndustryId: enterprise?.businessIndustryId ?? "",
    province: enterprise?.province ?? "",
    ward: enterprise?.ward ?? "",
    address: enterprise?.address ?? "",
    foreignName: enterprise?.foreignName ?? "",
    email: enterprise?.email ?? "",
    officePhone: enterprise?.officePhone ?? "",
    operatingProvince: enterprise?.operatingProvince ?? "",
    operatingWard: enterprise?.operatingWard ?? "",
    businessLocation: enterprise?.businessLocation ?? "",
    representative: enterprise?.representative ?? "",
    representativePhone: enterprise?.representativePhone ?? "",
  };

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<
    z.input<typeof updateEnterpriseSchema>,
    unknown,
    z.output<typeof updateEnterpriseSchema>
  >({
    resolver: zodResolver(updateEnterpriseSchema),
    mode: "onBlur",
    values: {
      ...serverValues,
      ...initialData,
      businessLicense: initialData?.businessLicense,
      otherDocument: initialData?.otherDocument,
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

  const businessTypeOptions = (businessTypes ?? []).map((type) => ({
    value: type.businessTypeId,
    label: `${type.code} - ${type.name}`,
  }));

  const businessIndustryOptions = (businessIndustries ?? []).map(
    (industry) => ({
      value: industry.businessIndustryId,
      label: `${industry.code} - ${industry.name}`,
    }),
  );

  const provinceOptions = province
    ? [{ value: province.province, label: province.province }]
    : [];

  const wardOptions = wards.map((ward) => ({
    value: ward.name,
    label: ward.name,
  }));

  const onSubmit = (data: UpdateEnterpriseData) => {
    onContinue(
      data,
      businessTypes?.find((item) => item.businessTypeId === data.businessTypeId)
        ?.name ?? "",
      businessIndustries?.find(
        (item) => item.businessIndustryId === data.businessIndustryId,
      )?.name ?? "",
      {
        businessLicense:
          data.businessLicense === undefined
            ? (enterprise?.businessLicense ?? null)
            : null,
        otherDocument:
          data.otherDocument === undefined
            ? (enterprise?.otherDocument ?? null)
            : null,
      },
      enterprise?.taxCode ?? "",
    );
  };

  const documents: DocumentRow<PreviewFile>[] = [
    {
      id: "businessLicense",
      name: "Giấy phép kinh doanh",
      file:
        businessLicense === undefined
          ? (enterprise?.businessLicense ?? null)
          : businessLicense,
    },
    {
      id: "otherDocument",
      name: "Giấy tờ khác",
      file:
        otherDocument === undefined
          ? (enterprise?.otherDocument ?? null)
          : otherDocument,
    },
  ];

  const handleSelectDocument = (id: DocumentField, file: File) => {
    setValue(id, file, { shouldDirty: true, shouldValidate: true });
  };

  const handleConfirmRemoveDocument = () => {
    if (!documentToDelete) return;

    const { id } = documentToDelete;
    setValue(id, null, { shouldDirty: true, shouldValidate: true });
    setDocumentToDelete(null);
  };

  const handleCancel = () => {
    reset(serverValues);
  };

  return (
    <>
      <form
        className="flex flex-col gap-6 w-full"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-[20px] w-full">
          <div className="flex flex-col gap-[30px]">
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
                required
                disabled
                value={enterprise?.taxCode ?? ""}
              />

              <Controller
                name="businessTypeId"
                control={control}
                render={({ field, fieldState }) => (
                  <FloatingSelect
                    required
                    label="Loại hình kinh doanh"
                    placeholder="Chọn loại hình kinh doanh"
                    options={businessTypeOptions}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-3">
              <Controller
                name="businessIndustryId"
                control={control}
                render={({ field, fieldState }) => (
                  <FloatingSelect
                    required
                    label="Ngành nghề kinh doanh"
                    placeholder="Chọn ngành nghề kinh doanh"
                    options={businessIndustryOptions}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
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
                      field.onChange(date ? format(date, "yyyy-MM-dd") : null);
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
                render={({ field, fieldState }) => (
                  <FloatingSelect
                    required
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
            </div>

            <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-3">
              <Controller
                name="ward"
                control={control}
                render={({ field, fieldState }) => (
                  <FloatingSelect
                    required
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

          <div className="flex flex-col gap-[30px]">
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
                render={({ field, fieldState }) => (
                  <FloatingSelect
                    label="Tỉnh/thành phố hoạt động KD"
                    placeholder="Chọn tỉnh/thành phố"
                    disabled={isFetchingProvince}
                    options={provinceOptions}
                    name={field.name}
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                      setValue("operatingWard", "");
                    }}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="operatingWard"
                control={control}
                render={({ field, fieldState }) => (
                  <FloatingSelect
                    label="Phường/xã hoạt động KD"
                    placeholder="Chọn phường/xã"
                    disabled={!selectedOperatingProvince}
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

          <div className="flex flex-col gap-[30px]">
            <h5>File đính kèm</h5>
            <DocumentsField
              documents={documents}
              onSelect={handleSelectDocument}
              onRemove={(row) => setDocumentToDelete(row)}
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

      {documentToDelete && (
        <ConfirmDialog
          title="Xác nhận xóa tài liệu"
          description={`Bạn có chắc chắn muốn xóa ${documentToDelete.name}?`}
          confirmText="Xóa"
          cancelText="Hủy bỏ"
          onConfirm={handleConfirmRemoveDocument}
          onClose={() => setDocumentToDelete(null)}
        />
      )}
    </>
  );
}

export default EditEnterpriseForm;
