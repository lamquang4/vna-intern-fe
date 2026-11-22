"use client";
import { useState } from "react";
import EnterpriseInfoReview from "../EnterpriseInfoReview";
import EditEnterpriseForm, {
  EDIT_ENTERPRISE_FORM_ID,
} from "./EditEnterpriseForm";
import { EnterpriseDetailResponse } from "@/libs/shared/tts/models/enterprise.model";
import {
  UpdateEnterpriseData,
  updateEnterpriseMeSchema,
} from "@/libs/shared/tts/schemas/enterprise.schema";
import {
  useUpdateEnterprise,
  useUpdateEnterpriseMe,
} from "@/libs/tts/hooks/useEnterprises";
import { Overlay } from "@/libs/core/components/ui/Overlay";
import Loading from "@/libs/core/components/ui/Loading";
import { Button } from "@/libs/core/components/ui/Button";
import FormLayout from "../../layout/FormLayout";

interface Props {
  enterpriseId?: string;
}

function EditEnterpriseContainer({ enterpriseId = "" }: Props) {
  const isMePage = !enterpriseId;

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<UpdateEnterpriseData | null>(null);
  const [businessTypeName, setBusinessTypeName] = useState<string>("");
  const [businessIndustryName, setBusinessIndustryName] = useState<string>("");
  const [taxCode, setTaxCode] = useState<string>("");
  const [existingFiles, setExistingFiles] = useState<
    Pick<EnterpriseDetailResponse, "businessLicense" | "otherDocument">
  >({ businessLicense: null, otherDocument: null });
  const [formKey, setFormKey] = useState<number>(0);

  const updateMeMutation = useUpdateEnterpriseMe();
  const updateMutation = useUpdateEnterprise(enterpriseId);

  const isUpdating = updateMeMutation.isPending || updateMutation.isPending;

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

  const handleUpdateSuccess = () => {
    setFormData(null);
    setStep(1);
  };

  const handleConfirm = () => {
    if (!formData || isUpdating) return;

    if (isMePage) {
      updateMeMutation.mutate(updateEnterpriseMeSchema.parse(formData), {
        onSuccess: handleUpdateSuccess,
      });
    } else {
      updateMutation.mutate(formData, {
        onSuccess: handleUpdateSuccess,
      });
    }
  };

  const handleCancel = () => {
    setFormData(null);
    setFormKey((key) => key + 1);
  };

  return (
    <>
      <FormLayout
        title="Chi tiết doanh nghiệp"
        backHref={`${isMePage ? "" : "/enterprises"}`}
        actions={
          <div className="flex items-center justify-center gap-3">
            {step === 1 ? (
              <>
                <Button
                  type="button"
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="rounded-lg px-3 py-2 font-medium border border-border"
                >
                  Hủy bỏ
                </Button>

                <Button
                  type="submit"
                  form={EDIT_ENTERPRISE_FORM_ID}
                  className="rounded-lg px-3 py-2 font-medium bg-primary text-white"
                >
                  Tiếp tục
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  onClick={handleBack}
                  disabled={isUpdating}
                  className="rounded-lg px-3 py-2 font-medium border border-border"
                >
                  Quay lại
                </Button>

                <Button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isUpdating}
                  className="rounded-lg px-3 py-2 font-medium bg-primary text-white"
                >
                  Xác nhận
                </Button>
              </>
            )}
          </div>
        }
      >
        <div className="py-2 flex-wrap flex items-center justify-center lg:gap-8 gap-6">
          <div className="flex gap-2 items-center">
            <div
              className={`size-6.5 rounded-full flex items-center font-medium justify-center ${step === 1 ? "bg-primary text-white" : "bg-muted-foreground/60 text-white"}`}
            >
              1
            </div>
            <span>Thông tin doanh nghiệp</span>
          </div>

          <div className="flex gap-2 items-center">
            <div
              className={`size-6.5 rounded-full flex items-center font-medium justify-center ${step === 2 ? "bg-primary text-white" : "bg-muted-foreground/60 text-white"}`}
            >
              2
            </div>
            <span>Xác nhận đăng ký</span>
          </div>
        </div>

        {step === 1 ? (
          <EditEnterpriseForm
            key={formKey}
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
            />
          )
        )}
      </FormLayout>

      {isUpdating && (
        <Overlay>
          <Loading size={55} color="white" thickness={8} />
          <h4 className="text-white">Vui lòng chờ trong giây lát ...</h4>
        </Overlay>
      )}
    </>
  );
}

export default EditEnterpriseContainer;
