"use client";
import { format, parseISO } from "date-fns";
import { Button } from "@/libs/core/components/ui/Button";
import type {
  DocumentRow,
  EnterpriseDetailResponse,
} from "@/libs/shared/tts/models/enterprise.model";
import type {
  CreateEnterpriseData,
  UpdateEnterpriseData,
} from "@/libs/shared/tts/schemas/enterprise.schema";
import { type PreviewFile } from "@/libs/tts/utils/filePreview";
import { InfoItem } from "./InfoItem";
import EnterpriseFileField from "./EnterpriseFileField";

interface Props {
  data: CreateEnterpriseData | UpdateEnterpriseData;
  existingFiles?: Pick<
    EnterpriseDetailResponse,
    "businessLicense" | "otherDocument"
  >;
  businessTypeName: string;
  businessIndustryName: string;
  taxCode?: string;
  onBack: () => void;
  onConfirm: () => void | Promise<void>;
  isLoading: boolean;
}

function EnterpriseInfoReview({
  data,
  existingFiles,
  businessTypeName,
  businessIndustryName,
  taxCode,
  onBack,
  onConfirm,
  isLoading,
}: Props) {
  const documents: DocumentRow<PreviewFile>[] = [
    {
      id: "businessLicense",
      name: "Giấy phép kinh doanh",
      file:
        data.businessLicense === undefined
          ? (existingFiles?.businessLicense ?? null)
          : data.businessLicense,
    },
    {
      id: "otherDocument",
      name: "Giấy tờ khác",
      file:
        data.otherDocument === undefined
          ? (existingFiles?.otherDocument ?? null)
          : data.otherDocument,
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-[20px] w-full">
        <div className="flex flex-col gap-[20px]">
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

        <div className="flex flex-col gap-[20px]">
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

        <div className="flex flex-col gap-[20px]">
          <h5>File đính kèm</h5>

          <EnterpriseFileField documents={documents} />
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
