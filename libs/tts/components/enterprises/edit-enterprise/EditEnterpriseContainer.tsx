"use client";
import { useState } from "react";
import EnterpriseInfoReview from "../EnterpriseInfoReview";
import EditEnterpriseForm from "./EditEnterpriseForm";
import { EnterpriseDetailResponse } from "@/libs/shared/tts/models/enterprise.model";
import { UpdateEnterpriseData } from "@/libs/shared/tts/schemas/enterprise.schema";
import { useUpdateEnterprise } from "@/libs/tts/hooks/useEnterprises";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface Props {
  enterpriseId: string;
}

function EditEnterpriseContainer({ enterpriseId }: Props) {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<UpdateEnterpriseData | null>(null);
  const [businessTypeName, setBusinessTypeName] = useState<string>("");
  const [businessIndustryName, setBusinessIndustryName] = useState<string>("");
  const [taxCode, setTaxCode] = useState<string>("");
  const [existingFiles, setExistingFiles] = useState<
    Pick<EnterpriseDetailResponse, "businessLicense" | "otherDocument">
  >({ businessLicense: null, otherDocument: null });

  const updateEnterpriseMutation = useUpdateEnterprise(enterpriseId);

  const handleContinue = (
    data: UpdateEnterpriseData,
    businessTypeName: string,
    businessIndustryName: string,
    files: typeof existingFiles,
    selectedTaxCode: string,
  ) => {
    setFormData(data);
    setBusinessTypeName(businessTypeName);
    setBusinessIndustryName(businessIndustryName);
    setExistingFiles(files);
    setTaxCode(selectedTaxCode);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleConfirm = () => {
    if (!formData) return;

    updateEnterpriseMutation.mutate(formData, {
      onSuccess: () => router.push("/enterprises"),
    });
  };
  return (
    <div className="py-[30px] sm:px-[20px] px-[15px] flex flex-col gap-6 overflow-y-auto">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <h3>Chi tiết doanh nghiệp</h3>

        <Link
          href="/enterprises"
          className="flex items-center font-medium gap-1 text-muted-foreground hover:text-primary px-3 py-2"
        >
          <ChevronLeft size={20} /> <span>Trở về</span>
        </Link>
      </div>

      <div className="py-2 flex-wrap flex items-center justify-center lg:gap-8 gap-6">
        <div className="flex gap-2 items-center">
          <div
            className={`size-6.5 rounded-full flex items-center justify-center ${step === 1 ? "bg-primary text-white" : "bg-muted-foreground text-white"}`}
          >
            1
          </div>
          <span>Thông tin doanh nghiệp</span>
        </div>

        <div className="flex gap-2 items-center">
          <div
            className={`size-6.5 rounded-full flex items-center justify-center ${step === 2 ? "bg-primary text-white" : "bg-muted-foreground text-white"}`}
          >
            2
          </div>
          <span>Xác nhận đăng ký</span>
        </div>
      </div>

      {step === 1 ? (
        <EditEnterpriseForm
          onContinue={handleContinue}
          initialData={formData}
          enterpriseId={enterpriseId}
        />
      ) : (
        formData && (
          <EnterpriseInfoReview
            data={formData}
            existingFiles={existingFiles}
            businessTypeName={businessTypeName}
            businessIndustryName={businessIndustryName}
            taxCode={taxCode}
            onBack={handleBack}
            onConfirm={handleConfirm}
            isLoading={updateEnterpriseMutation.isPending}
          />
        )
      )}
    </div>
  );
}

export default EditEnterpriseContainer;
