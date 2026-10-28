"use client";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Button } from "@/libs/core/components/ui/Button";
import { FloatingInput } from "@/libs/core/components/ui/FloatingInput";
import { FloatingSelect } from "@/libs/core/components/ui/FloatingSelect";
import { useGetAllBusinessIndustries } from "@/libs/tts/hooks/useBusinessIndustries";
import { useGetAllBusinessTypes } from "@/libs/tts/hooks/useBusinessTypes";
import {
  useGetAllProvinces,
  useGetWardsByProvince,
} from "@/libs/tts/hooks/useLocation";
import {
  CreateEnterpriseData,
  createEnterpriseSchema,
} from "@/libs/shared/tts/schemas/enterprise.schema";
import { ArrowUpToLine, Trash } from "lucide-react";
import type { TableColumn } from "@/libs/core/models/component.model";
import DataTable from "@/libs/core/components/ui/DataTable";
import { ALLOWED_DOCUMENT_MIME_TYPES } from "@/libs/core/constants/limits";
import { DocumentRow } from "@/libs/shared/tts/models/enterprise.model";
import { FileUpload } from "../FileUpload";
import FilePreview from "../FilePreview";

interface Props {
  onContinue: (
    data: CreateEnterpriseData,
    names: {
      businessTypeName: string;
      businessIndustryName: string;
    },
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

  const { data: provinces = [], isLoading: isFetchingProvinces } =
    useGetAllProvinces();

  const selectedProvince = useWatch({
    control,
    name: "province",
  });
  const selectedOperatingProvince = useWatch({
    control,
    name: "operatingProvince",
  });

  const wards = useGetWardsByProvince(selectedProvince ?? "");
  const operatingWards = useGetWardsByProvince(selectedOperatingProvince ?? "");

  const businessLicense = useWatch({ control, name: "businessLicense" });
  const otherDocument = useWatch({ control, name: "otherDocument" });

  const onSubmit = (data: CreateEnterpriseData) => {
    onContinue(data, {
      businessTypeName:
        businessTypes?.find(
          (item) => item.businessTypeId === data.businessTypeId,
        )?.name ?? "—",

      businessIndustryName:
        businessIndustries?.find(
          (item) => item.businessIndustryId === data.businessIndustryId,
        )?.name ?? "—",
    });
  };

  const documents: DocumentRow[] = [
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

  const handleSelectDocument = (id: DocumentRow["id"], file: File) =>
    setValue(id, file, { shouldDirty: true, shouldValidate: true });

  const handleRemoveDocument = (id: DocumentRow["id"]) =>
    setValue(id, null, { shouldDirty: true, shouldValidate: true });

  const columns: TableColumn<DocumentRow>[] = [
    { key: "name", header: "Loại tài liệu", cell: (row) => row.name },
    {
      key: "fileName",
      header: "Tên file",
      cell: (row) => row.file?.name ?? "Chưa chọn tệp",
    },
    {
      key: "fileInfo",
      header: "Dung lượng",
      cell: (row) =>
        row.file ? `${(row.file.size / 1024).toFixed(1)} KB` : "",
    },
    {
      key: "actions",
      header: "Hành động",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <FilePreview file={row.file} />

          <FileUpload
            accept={ALLOWED_DOCUMENT_MIME_TYPES.join(",")}
            onSelect={(file) => handleSelectDocument(row.id, file)}
          >
            <ArrowUpToLine size={22} className="text-success" />
          </FileUpload>

          {row.file && (
            <Button
              type="button"
              disabled={!row.file}
              onClick={() => handleRemoveDocument(row.id)}
            >
              <Trash size={22} className="text-error" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleCancel = () => {
    reset();
  };

  return (
    <form
      className="flex flex-col gap-6 w-full"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col gap-[20px] w-full">
        <div className="flex flex-col gap-[30px]">
          <h5>Thông tin doanh nghiệp</h5>

          <div className="flex gap-[15px] sm:flex-row flex-col">
            <FloatingInput
              label="Tên doanh nghiệp"
              type="text"
              required
              error={errors.name?.message}
              {...register("name")}
            />

            <FloatingInput
              label="Mã số thuế"
              type="text"
              required
              error={errors.taxCode?.message}
              {...register("taxCode")}
            />

            <FloatingSelect
              required
              label="Loại hình kinh doanh"
              error={errors.businessTypeId?.message}
              {...register("businessTypeId")}
            >
              <option value="">Tất cả loại hình kinh doanh</option>
              {businessTypes?.map((type) => (
                <option key={type.businessTypeId} value={type.businessTypeId}>
                  {type.code} {type.name}
                </option>
              ))}
            </FloatingSelect>
          </div>

          <div className="flex gap-[15px] sm:flex-row flex-col">
            <FloatingSelect
              label="Ngành nghề kinh doanh"
              error={errors.businessIndustryId?.message}
              {...register("businessIndustryId")}
              required
            >
              <option value="">Tất cả ngành nghề kinh doanh</option>
              {businessIndustries?.map((industry) => (
                <option
                  key={industry.businessIndustryId}
                  value={industry.businessIndustryId}
                >
                  {industry.code} {industry.name}
                </option>
              ))}
            </FloatingSelect>

            <FloatingInput
              label="Ngày cấp GPKD"
              type="date"
              error={errors.licenseIssueDate?.message}
              {...register("licenseIssueDate")}
            />

            <FloatingSelect
              required
              label="Tỉnh/thành phố"
              disabled={isFetchingProvinces}
              error={errors.province?.message}
              {...register("province", {
                onChange: () => setValue("ward", ""),
              })}
            >
              <option value="">Chọn tỉnh/thành phố</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.province}>
                  {province.province}
                </option>
              ))}
            </FloatingSelect>
          </div>

          <div className="flex gap-[15px] sm:flex-row flex-col">
            <FloatingSelect
              required
              label="Phường/xã"
              disabled={!selectedProvince}
              error={errors.ward?.message}
              {...register("ward")}
            >
              <option value="">Chọn phường/xã</option>
              {wards.map((ward) => (
                <option key={ward.name} value={ward.name}>
                  {ward.name}
                </option>
              ))}
            </FloatingSelect>

            <FloatingInput
              label="Địa chỉ"
              type="text"
              error={errors.address?.message}
              {...register("address")}
            />
          </div>
        </div>

        <hr className="border-border border-t" />

        <div className="flex flex-col gap-[30px]">
          <h5>Thông tin liên hệ</h5>

          <div className="flex gap-[15px] sm:flex-row flex-col">
            <FloatingInput
              label="Tên viết bằng tiếng nước ngoài"
              type="text"
              error={errors.foreignName?.message}
              {...register("foreignName")}
            />

            <FloatingInput
              label="Email"
              type="text"
              required
              error={errors.email?.message}
              {...register("email")}
            />

            <FloatingInput
              label="Số điện thoại cơ quan"
              type="text"
              error={errors.officePhone?.message}
              {...register("officePhone")}
            />
          </div>

          <div className="flex gap-[15px] sm:flex-row flex-col">
            <FloatingSelect
              label="Tỉnh/thành phố hoạt động KD"
              disabled={isFetchingProvinces}
              error={errors.operatingProvince?.message}
              {...register("operatingProvince", {
                onChange: () => setValue("operatingWard", ""),
              })}
            >
              <option value="">Chọn tỉnh/thành phố</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.province}>
                  {province.province}
                </option>
              ))}
            </FloatingSelect>

            <FloatingSelect
              label="Phường/xã hoạt động KD"
              disabled={!selectedOperatingProvince}
              error={errors.operatingWard?.message}
              {...register("operatingWard")}
            >
              <option value="">Chọn phường/xã</option>
              {operatingWards.map((ward) => (
                <option key={ward.name} value={ward.name}>
                  {ward.name}
                </option>
              ))}
            </FloatingSelect>
          </div>

          <div className="flex gap-[15px] sm:flex-row flex-col">
            <FloatingInput
              label="Địa chỉ kinh doanh"
              type="text"
              error={errors.businessLocation?.message}
              {...register("businessLocation")}
            />

            <FloatingInput
              label="Người đứng đầu kinh doanh"
              type="text"
              error={errors.representative?.message}
              {...register("representative")}
            />

            <FloatingInput
              label="SĐT liên hệ người đứng đầu"
              type="text"
              error={errors.representativePhone?.message}
              {...register("representativePhone")}
            />
          </div>
        </div>

        <hr className="border-border border-t" />

        <div className="flex flex-col gap-[30px]">
          <h5>File đính kèm</h5>
          <DataTable
            columns={columns}
            data={documents}
            getRowId={(row) => row.id}
          />
          {documents.map((document) => {
            const error = errors[document.id]?.message;
            return error ? (
              <p key={document.id} className="text-error">
                {document.name}: {error}
              </p>
            ) : null;
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button
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
