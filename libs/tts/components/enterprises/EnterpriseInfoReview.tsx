"use client";
import { Eye } from "lucide-react";
import { Button } from "@/libs/core/components/ui/Button";
import type {
  CreateEnterpriseData,
  UpdateEnterpriseData,
} from "@/libs/shared/tts/schemas/enterprise.schema";
import type { DocumentRow } from "@/libs/shared/tts/models/enterprise.model";
import type { TableColumn } from "@/libs/core/models/component.model";
import DataTable from "@/libs/core/components/ui/DataTable";
import { InfoItem } from "@/libs/core/components/ui/InfoItem";
import { format, parseISO } from "date-fns";

interface Props {
  data: CreateEnterpriseData | UpdateEnterpriseData;
  businessTypeName: string;
  businessIndustryName: string;
  taxCode?: string;
  onBack: () => void;
  onConfirm: () => void | Promise<void>;
  isLoading: boolean;
}

function EnterpriseInfoReview({
  data,
  businessTypeName,
  businessIndustryName,
  taxCode,
  onBack,
  onConfirm,
  isLoading,
}: Props) {
  const handlePreview = (file: File | null) => {
    if (!file) return;

    const url = URL.createObjectURL(file);

    window.open(url, "_blank", "noopener,noreferrer");

    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const documents: DocumentRow[] = [
    {
      id: "businessLicense",
      name: "Giấy phép kinh doanh",
      file: data.businessLicense ?? null,
    },
    {
      id: "otherDocument",
      name: "Giấy tờ khác",
      file: data.otherDocument ?? null,
    },
  ];

  const columns: TableColumn<DocumentRow>[] = [
    {
      key: "name",
      header: "Loại tài liệu",
      cell: (row) => row.name,
    },
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
          <Button
            type="button"
            disabled={!row.file}
            onClick={() => handlePreview(row.file)}
          >
            <Eye size={22} className="text-muted-foreground" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-[20px] w-full">
        <div className="flex flex-col gap-[30px]">
          <h5>Thông tin doanh nghiệp</h5>

          <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="Tên doanh nghiệp" value={data.name} />
            <InfoItem
              label="Mã số thuế"
              value={taxCode ?? ("taxCode" in data ? data.taxCode : undefined)}
            />
            <InfoItem label="Loại hình kinh doanh" value={businessTypeName} />

            <InfoItem
              label="Ngành nghề kinh doanh"
              value={businessIndustryName}
            />
            <InfoItem
              label="Ngày cấp GPKD"
              value={
                data.licenseIssueDate &&
                format(parseISO(data.licenseIssueDate), "dd/MM/yyyy")
              }
            />
            <InfoItem label="Tỉnh/thành phố" value={data.province} />

            <InfoItem label="Phường/xã" value={data.ward} />
            <InfoItem label="Địa chỉ" value={data.address} />
          </div>
        </div>

        <hr className="border-border border-t" />

        <div className="flex flex-col gap-[30px]">
          <h5>Thông tin liên hệ</h5>

          <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Tên viết bằng tiếng nước ngoài"
              value={data.foreignName}
            />
            <InfoItem label="Email" value={data.email} />
            <InfoItem label="Số điện thoại cơ quan" value={data.officePhone} />

            <InfoItem
              label="Tỉnh/thành phố hoạt động KD"
              value={data.operatingProvince}
            />
            <InfoItem
              label="Phường/xã hoạt động KD"
              value={data.operatingWard}
            />
            <InfoItem
              label="Địa chỉ kinh doanh"
              value={data.businessLocation}
            />

            <InfoItem
              label="Người đứng đầu kinh doanh"
              value={data.representative}
            />
            <InfoItem
              label="SĐT liên hệ người đứng đầu"
              value={data.representativePhone}
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
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="rounded-lg px-3.5 py-2 font-medium border border-border"
        >
          Trở về
        </Button>

        <Button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="rounded-lg px-3.5 py-2 font-medium bg-primary text-white"
        >
          Xác nhận
        </Button>
      </div>
    </div>
  );
}

export default EnterpriseInfoReview;
