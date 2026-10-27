import { useState } from "react";
import { Modal } from "@/libs/core/components/ui/Modal";
import type { CreateEnterpriseData } from "@/libs/shared/tts/schemas/enterprise.schema";
import { useCreateEnterprise } from "@/libs/tts/hooks/useEnterprises";
import CreateEnterpriseForm from "./CreateEnterpriseForm";
import EnterpriseInfoReview from "../EnterpriseInfoReview";

interface Props {
  onClose: () => void;
}

function CreateEnterpriseModal({ onClose }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<CreateEnterpriseData | null>(null);
  const [names, setNames] = useState({
    businessTypeName: "",
    businessIndustryName: "",
  });

  const createEnterpriseMutation = useCreateEnterprise();

  const handleContinue = (
    data: CreateEnterpriseData,
    selectedNames: typeof names,
  ) => {
    setFormData(data);
    setNames(selectedNames);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleConfirm = async () => {
    if (!formData) return;

    await createEnterpriseMutation.mutateAsync(formData);
    onClose();
  };

  return (
    <Modal
      title="Thêm mới doanh nghiệp"
      headerClassName="uppercase border border-border"
      onClose={onClose}
      className="max-w-[900px] h-[90%]"
    >
      <div className="py-4 flex-wrap flex items-center justify-center lg:gap-8 gap-5">
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
        <CreateEnterpriseForm
          onContinue={handleContinue}
          initialData={formData}
        />
      ) : (
        formData && (
          <EnterpriseInfoReview
            data={formData}
            businessTypeName={names.businessTypeName}
            businessIndustryName={names.businessIndustryName}
            onBack={handleBack}
            onConfirm={handleConfirm}
            isLoading={createEnterpriseMutation.isPending}
          />
        )
      )}
    </Modal>
  );
}

export default CreateEnterpriseModal;
