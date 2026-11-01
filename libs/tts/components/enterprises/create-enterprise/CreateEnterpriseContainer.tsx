"use client";
import { useState } from "react";
import CreateEnterpriseForm from "./CreateEnterpriseForm";
import EnterpriseInfoReview from "../EnterpriseInfoReview";
import { CreateEnterpriseData } from "@/libs/shared/tts/schemas/enterprise.schema";
import { useCreateEnterprise } from "@/libs/tts/hooks/useEnterprises";
import AccountInfoReviewModal from "../account-info-review/AccountInfoReviewModal";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

function CreateEnterpriseContainer() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<CreateEnterpriseData | null>(null);
  const [businessTypeName, setBusinessTypeName] = useState<string>("");
  const [businessIndustryName, setBusinessIndustryName] = useState<string>("");

  const createEnterpriseMutation = useCreateEnterprise();

  const handleContinue = (
    data: CreateEnterpriseData,
    businessTypeName: string,
    businessIndustryName: string,
  ) => {
    setFormData(data);
    setBusinessTypeName(businessTypeName);
    setBusinessIndustryName(businessIndustryName);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleConfirm = () => {
    if (!formData) return;

    createEnterpriseMutation.mutate(formData, {
      onSuccess: () => {
        setStep(3);
      },
    });
  };

  const handleCloseAccountModal = () => {
    router.push("/enterprises");
  };

  return (
    <>
      <div className="py-[30px] sm:px-[20px] px-[15px] flex flex-col gap-6 overflow-y-auto">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <h3>Thêm doanh nghiệp</h3>

          <Link
            href="/enterprises"
            className="flex items-center font-medium gap-1 text-muted-foreground hover:text-primary px-3 py-2"
          >
            <ChevronLeft size={20} /> <span>Trở về</span>
          </Link>
        </div>

        {step !== 3 && (
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
        )}

        {step === 1 && (
          <CreateEnterpriseForm
            onContinue={handleContinue}
            initialData={formData}
          />
        )}

        {(step === 2 || step === 3) && formData && (
          <EnterpriseInfoReview
            data={formData}
            businessTypeName={businessTypeName}
            businessIndustryName={businessIndustryName}
            onBack={handleBack}
            onConfirm={handleConfirm}
            isLoading={createEnterpriseMutation.isPending}
          />
        )}
      </div>

      {step === 3 && formData && (
        <AccountInfoReviewModal
          taxCode={formData.taxCode}
          onClose={handleCloseAccountModal}
        />
      )}
    </>
  );
}

export default CreateEnterpriseContainer;
