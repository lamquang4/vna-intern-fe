"use client";
import { useState } from "react";
import CreateEnterpriseForm from "./CreateEnterpriseForm";
import EnterpriseInfoReview from "../EnterpriseInfoReview";
import { CreateEnterpriseData } from "@/libs/shared/tts/schemas/enterprise.schema";
import { useCreateEnterprise } from "@/libs/tts/hooks/useEnterprises";
import { useSendOtp } from "@/libs/tts/hooks/useAuth";
import AccountInfoReviewModal from "../AccountInfoReviewModal";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import RegisterEnterpriseOtpModal from "./RegisterEnterpriseOtpModal";
import { Overlay } from "@/libs/core/components/ui/Overlay";
import Loading from "@/libs/core/components/ui/Loading";
import {
  OTP_EXPIRE_SECONDS,
  OTP_RESEND_COOLDOWN_SECONDS,
} from "@/libs/core/constants/limits";
import type { OtpTimers } from "@/libs/core/components/ui/fields/OtpField";

interface StoredOtpTimers extends OtpTimers {
  email: string;
}

function CreateEnterpriseContainer() {
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRegister = pathname === "/register-enterprise";
  const backHref = isPublicRegister ? "/" : "/enterprises";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<CreateEnterpriseData | null>(null);
  const [businessTypeName, setBusinessTypeName] = useState<string>("");
  const [businessIndustryName, setBusinessIndustryName] = useState<string>("");

  const [isOtpModalOpen, setIsOtpModalOpen] = useState<boolean>(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [otpTimers, setOtpTimers] = useState<StoredOtpTimers | null>(null);

  const createEnterpriseMutation = useCreateEnterprise();
  const sendOtpMutation = useSendOtp();

  const isSendingOtp = sendOtpMutation.isPending;
  const isCreating = createEnterpriseMutation.isPending;

  const handleContinue = (
    data: CreateEnterpriseData,
    businessTypeName: string,
    businessIndustryName: string,
  ) => {
    if (isSendingOtp) return;

    setFormData(data);
    setBusinessTypeName(businessTypeName);
    setBusinessIndustryName(businessIndustryName);

    if (!isPublicRegister || (verifiedEmail && verifiedEmail === data.email)) {
      setStep(2);
      return;
    }

    if (
      otpTimers &&
      otpTimers.email === data.email &&
      Date.now() < otpTimers.cooldownEndTime
    ) {
      setIsOtpModalOpen(true);
      return;
    }

    sendOtpMutation.mutate(
      { email: data.email, purpose: "REGISTER_ENTERPRISE" },
      {
        onSuccess: (res) => {
          const now = Date.now();
          setOtpTimers({
            email: data.email,
            expireEndTime: now + OTP_EXPIRE_SECONDS * 1000,
            cooldownEndTime: now + OTP_RESEND_COOLDOWN_SECONDS * 1000,
          });
          toast.success(res.message || "Đã gửi mã xác thực đến email");
          setIsOtpModalOpen(true);
        },
      },
    );
  };

  const handleOtpVerified = () => {
    if (formData) setVerifiedEmail(formData.email);
    // OTP đã dùng, lần sau phải gửi mã mới
    setOtpTimers(null);
    setIsOtpModalOpen(false);
    setStep(2);
  };

  const handleCloseOtpModal = () => {
    setIsOtpModalOpen(false);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleConfirm = () => {
    if (!formData || isCreating) return;

    createEnterpriseMutation.mutate(formData, {
      onSuccess: () => {
        setStep(3);
      },
    });
  };

  const handleCloseAccountModal = () => {
    router.replace(backHref);
  };

  // Chỉ truyền timer cho modal khi nó thuộc đúng email hiện tại
  const activeOtpTimers =
    formData && otpTimers && otpTimers.email === formData.email
      ? {
          expireEndTime: otpTimers.expireEndTime,
          cooldownEndTime: otpTimers.cooldownEndTime,
        }
      : null;

  return (
    <>
      <div className="py-[30px] sm:px-[20px] px-[15px] flex flex-col gap-6 overflow-y-auto">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <h3>
            {isPublicRegister ? "Đăng ký doanh nghiệp" : "Thêm doanh nghiệp"}
          </h3>

          <Link
            href={backHref}
            className="flex items-center font-medium gap-1 text-muted-foreground hover:text-primary px-3 py-2"
          >
            <ChevronLeft size={20} /> <span>Trở về</span>
          </Link>
        </div>

        {step !== 3 && (
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
            isLoading={isCreating}
          />
        )}
      </div>

      {isPublicRegister && isOtpModalOpen && formData && (
        <RegisterEnterpriseOtpModal
          email={formData.email}
          onClose={handleCloseOtpModal}
          onSuccess={handleOtpVerified}
          otpTimers={activeOtpTimers}
          onOtpTimersChange={(timers) =>
            setOtpTimers({ email: formData.email, ...timers })
          }
        />
      )}

      {step === 3 && formData && (
        <AccountInfoReviewModal
          taxCode={formData.taxCode}
          onClose={handleCloseAccountModal}
        />
      )}

      {(isSendingOtp || isCreating) && (
        <Overlay>
          <Loading size={55} color="white" thickness={8} />
          <h4 className="text-white">Vui lòng chờ trong giây lát ...</h4>
        </Overlay>
      )}
    </>
  );
}

export default CreateEnterpriseContainer;
