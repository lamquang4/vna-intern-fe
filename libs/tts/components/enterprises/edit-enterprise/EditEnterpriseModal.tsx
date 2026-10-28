import { useState } from "react";
import { Modal } from "@/libs/core/components/ui/Modal";
import type {
  UpdateEnterpriseData,
} from "@/libs/shared/tts/schemas/enterprise.schema";
import type {
  EnterpriseDetailResponse,
} from "@/libs/shared/tts/models/enterprise.model";
import { useUpdateEnterprise } from "@/libs/tts/hooks/useEnterprises";
import EnterpriseInfoReview from "../EnterpriseInfoReview";
import EditEnterpriseForm from "./EditEnterpriseForm";

interface Props {
  enterpriseId: string;
  onClose: () => void;
}

function EditEnterpriseModal({ onClose, enterpriseId }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<UpdateEnterpriseData | null>(null);
  const [names, setNames] = useState({
    businessTypeName: "",
    businessIndustryName: "",
  });
  const [existingFiles, setExistingFiles] = useState<
    Pick<EnterpriseDetailResponse, "businessLicense" | "otherDocument">
  >({ businessLicense: null, otherDocument: null });

  const updateEnterpriseMutation = useUpdateEnterprise(enterpriseId);

  const handleContinue = (
    data: UpdateEnterpriseData,
    selectedNames: typeof names,
    files: typeof existingFiles,
  ) => {
    setFormData(data);
    setNames(selectedNames);
    setExistingFiles(files);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleConfirm = async () => {
    if (!formData) return;

    await updateEnterpriseMutation.mutateAsync(formData);
    onClose();
  };

  return (
    <Modal
      title="Chỉnh sửa doanh nghiệp"
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
            businessTypeName={names.businessTypeName}
            businessIndustryName={names.businessIndustryName}
            onBack={handleBack}
            onConfirm={handleConfirm}
            isLoading={updateEnterpriseMutation.isPending}
          />
        )
      )}
    </Modal>
  );
}

export default EditEnterpriseModal;
