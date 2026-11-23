"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, CircleX, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm, type FieldPath } from "react-hook-form";
import { Button } from "@/libs/core/components/ui/Button";
import { Select } from "@/libs/core/components/ui/Select";
import {
  ACCIDENT_REPORT_PERIOD_OPTIONS,
  ACCIDENT_REPORT_STATUS_OPTIONS,
  ACCIDENT_REPORT_STEP_OPTIONS,
} from "@/libs/core/constants/options";
import {
  MAX_ACCIDENT_REPORT_PDF_SIZE,
  MIME_PDF,
} from "@/libs/core/constants/limits";
import type { AccidentStats } from "@/libs/shared/tts/models/accident-report.model";
import {
  AccidentReportPeriod,
  AccidentReportReviewStatus,
  AccidentReportStatus,
  RoleCode,
} from "@/libs/shared/tts/models/enums";
import {
  updateAccidentReportSchema,
  type UpdateAccidentReportData,
  type UpdateAccidentReportFormValues,
} from "@/libs/shared/tts/schemas/accident-report.schema";
import { useGetMe } from "../../../hooks/useAuth";
import {
  useGetAccidentReportDetail,
  useGetAccidentReportSummary,
  useReviewAccidentReport,
  useUpdateAccidentReport,
} from "../../../hooks/useAccidentReports";
import BusinessInfoStep from "./BusinessInfoStep";
import AccidentStatsStep from "./AccidentStatsStep";
import AccidentDetailsStep from "./AccidentDetailsStep";
import ReportOverviewStep from "./ReportOverviewStep";
import toast from "react-hot-toast";
import NoteModal from "../NoteModal";
import { ConfirmDialog } from "@/libs/core/components/ui/ConfirmDialog";
import { Overlay } from "@/libs/core/components/ui/Overlay";
import Loading from "@/libs/core/components/ui/Loading";
import FormLayout from "../../layout/FormLayout";
import { downloadAccidentReportSummaryWord } from "@/libs/tts/utils/accidentReportSummaryWordExport";
import { formatDate } from "@/libs/core/utils/formatters";
import { getStatusClass, getStatusLabel } from "../AccidentReportList";

interface Props {
  accidentReportId: string;
  mode: "edit" | "view";
}

const emptyStats: AccidentStats = {
  totalCases: 0,
  fatalCases: 0,
  totalCasesWithTwoOrMoreVictims: 0,
  totalVictims: 0,
  nonManagedVictims: 0,
  totalFemaleVictims: 0,
  nonManagedFemaleVictims: 0,
  totalFatalVictims: 0,
  nonManagedFatalVictims: 0,
  totalSeverelyInjuredVictims: 0,
  nonManagedSeverelyInjuredVictims: 0,
  medicalExpense: 0,
  salaryExpenseDuringTreatment: 0,
  compensationExpense: 0,
  totalExpense: 0,
  totalDaysOff: 0,
  propertyDamageExpense: 0,
};

const accidentStatsFields: (keyof AccidentStats)[] = [
  "totalCases",
  "fatalCases",
  "totalCasesWithTwoOrMoreVictims",
  "totalVictims",
  "totalFemaleVictims",
  "totalFatalVictims",
  "totalSeverelyInjuredVictims",
  "nonManagedVictims",
  "nonManagedFemaleVictims",
  "nonManagedFatalVictims",
  "nonManagedSeverelyInjuredVictims",
  "medicalExpense",
  "salaryExpenseDuringTreatment",
  "compensationExpense",
  "totalDaysOff",
  "propertyDamageExpense",
];

const accidentDetailFields = [
  "injuryTypeId",
  "injuryFactorId",
  "occupationId",
  ...accidentStatsFields.filter(
    (field) =>
      field !== "totalCases" &&
      field !== "fatalCases" &&
      field !== "totalCasesWithTwoOrMoreVictims",
  ),
];

const lastStep = ACCIDENT_REPORT_STEP_OPTIONS.length - 1;

const WATCHED_PREFIXES = [
  "accidentDetails.",
  "accidentTotals.",
  "subsidizedAccident.",
];

const isWatchedPath = (path: string) =>
  WATCHED_PREFIXES.some((prefix) => path.startsWith(prefix));

const collectErrorPaths = (errors: unknown, prefix = ""): string[] => {
  if (!errors || typeof errors !== "object") return [];
  const node = errors as Record<string, unknown>;
  if (typeof node.message === "string" && "type" in node) {
    return prefix ? [prefix] : [];
  }
  return Object.entries(node).flatMap(([key, value]) =>
    key === "ref"
      ? []
      : collectErrorPaths(value, prefix ? `${prefix}.${key}` : key),
  );
};

function EditAccidentReportContainer({ accidentReportId, mode }: Props) {
  const router = useRouter();

  const [confirmStatus, setConfirmStatus] =
    useState<AccidentReportReviewStatus | null>(null);
  const [reviewStatus, setReviewStatus] =
    useState<AccidentReportReviewStatus | null>(null);
  const [isExportingReport, setIsExportingReport] = useState<boolean>(false);

  const reportQuery = useGetAccidentReportDetail(accidentReportId);
  const report = reportQuery.data?.data;
  const accidentReportsPath = `/accident-reports?year=${report?.year ?? new Date().getFullYear()}`;
  const isFetchingReport = reportQuery.isLoading;

  const reviewMutation = useReviewAccidentReport();
  const isReviewing = reviewMutation.isPending;

  const { data: currentAccount, isLoading: isLoadingAccount } = useGetMe();

  const isRoleSo = currentAccount?.data.roleCode === RoleCode.SO;
  const isRoleDN = currentAccount?.data.roleCode === RoleCode.DOANH_NGHIEP;
  const isAccepted = report?.status === AccidentReportStatus.ACCEPTED;
  const isDeclined = report?.status === AccidentReportStatus.DECLINED;
  const isViewOnly =
    !!report &&
    (
      [
        AccidentReportStatus.ACCEPTED,
        AccidentReportStatus.APPROVED,
        AccidentReportStatus.EXPIRED,
      ] as AccidentReportStatus[]
    ).includes(report.status);

  const canEdit =
    mode === "edit" && !isLoadingAccount && isRoleDN && !!report && !isViewOnly;

  const canApprove = isRoleSo && (isAccepted || isDeclined);

  const canDecline = isRoleSo && isAccepted;
  const canReview = canApprove || canDecline;

  const isReadOnly = !canEdit;
  const canNavigateSteps = mode === "edit" && canEdit;

  const [currentStep, setCurrentStep] = useState(
    mode === "view" ? lastStep : 0,
  );
  const activeStep = isRoleSo || isViewOnly ? lastStep : currentStep;
  const summaryQuery = useGetAccidentReportSummary(
    accidentReportId,
    activeStep === lastStep,
  );
  const summary = summaryQuery.data?.data;
  const updateMutation = useUpdateAccidentReport(accidentReportId);

  const isUpdating = updateMutation.isPending;

  const getStepFields = (
    step: number,
  ): FieldPath<UpdateAccidentReportFormValues>[] => {
    switch (step) {
      case 0:
        return ["totalEmployees", "femaleEmployees", "totalSalaryFund"];
      case 1:
      case 3: {
        const type = step === 1 ? "accidentTotals" : "subsidizedAccident";
        return accidentStatsFields.map(
          (field) =>
            `${type}.${field}` as FieldPath<UpdateAccidentReportFormValues>,
        );
      }
      case 2:
        return (form.getValues("accidentDetails") ?? []).flatMap((_, index) =>
          accidentDetailFields.map(
            (field) =>
              `accidentDetails.${index}.${field}` as FieldPath<UpdateAccidentReportFormValues>,
          ),
        );
      default:
        return ["stampedReport"];
    }
  };

  const getPeriodLabel = (period: AccidentReportPeriod) =>
    ACCIDENT_REPORT_PERIOD_OPTIONS.find((o) => o.value === period)?.label ??
    period;

  const form = useForm<
    UpdateAccidentReportFormValues,
    unknown,
    UpdateAccidentReportData
  >({
    resolver: zodResolver(updateAccidentReportSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    values: {
      totalEmployees: report?.totalEmployees ?? null,
      femaleEmployees: report?.femaleEmployees ?? null,
      totalSalaryFund: report?.totalSalaryFund ?? null,
      accidentTotals: report?.accidentTotals ?? { ...emptyStats },
      accidentDetails: report?.accidentDetails ?? [],
      subsidizedAccident: report?.subsidizedAccident ?? { ...emptyStats },
      stampedReport: null,
    },
  });
  const stampedReport = form.watch("stampedReport");
  const hasValidNewStampedReport =
    typeof File !== "undefined" &&
    stampedReport instanceof File &&
    stampedReport.type === MIME_PDF &&
    stampedReport.size <= MAX_ACCIDENT_REPORT_PDF_SIZE;

  // Luôn giữ bản errors mới nhất để dùng trong subscription bên dưới
  const { errors } = form.formState;
  const errorsRef = useRef(errors);
  useEffect(() => {
    errorsRef.current = errors;
  }, [errors]);

  // Khi sửa 1 ô số liệu: validate lại các ô đang có lỗi để lỗi tự mất/cập nhật,
  // không cần focus vào đúng ô đó nữa (mode "onBlur" chỉ validate ô vừa blur).
  useEffect(() => {
    const subscription = form.watch((_values, { name }) => {
      if (!name || !isWatchedPath(name)) return;

      const errorPaths = collectErrorPaths(errorsRef.current).filter(
        isWatchedPath,
      );
      if (errorPaths.length === 0) return;

      const paths = new Set(errorPaths);

      // Sửa ô chi tiết thứ n: tính lại cùng trường ở mọi dòng chi tiết nếu
      // trường đó đang có lỗi (vì lỗi "tổng lệch" nằm ở dòng chi tiết cuối)
      if (name.startsWith("accidentDetails.")) {
        const key = name.split(".")[2];
        if (key && errorPaths.some((path) => path.endsWith(`.${key}`))) {
          (form.getValues("accidentDetails") ?? []).forEach((_, index) =>
            paths.add(`accidentDetails.${index}.${key}`),
          );
        }
      }

      void form.trigger([
        ...paths,
      ] as FieldPath<UpdateAccidentReportFormValues>[]);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (isFetchingReport || report) return;

    toast.error("Không tìm thấy báo cáo TNLĐ");
    router.replace(accidentReportsPath);
  }, [accidentReportsPath, isFetchingReport, report, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentStep(mode === "view" ? lastStep : 0);
  }, [mode]);

  useEffect(() => {
    if (
      mode === "edit" &&
      (isRoleSo || (!isFetchingReport && isRoleDN && isViewOnly))
    ) {
      router.replace(`/accident-reports/${accidentReportId}?mode=view`);
    }
  }, [
    accidentReportId,
    isFetchingReport,
    isViewOnly,
    isRoleDN,
    isRoleSo,
    mode,
    router,
  ]);

  const isReviewAllowed = (status: AccidentReportReviewStatus) =>
    status === AccidentReportReviewStatus.APPROVED ? canApprove : canDecline;

  const handleConfirmDialogReview = (status: AccidentReportReviewStatus) => {
    if (isReviewing) return;

    if (!isReviewAllowed(status)) {
      toast.error(
        status === AccidentReportReviewStatus.APPROVED
          ? "Chỉ được duyệt báo cáo có trạng thái đã tiếp nhận hoặc đã từ chối"
          : "Chỉ được từ chối báo cáo có trạng thái đã tiếp nhận",
      );
      return;
    }

    setConfirmStatus(status);
  };

  const submitReview = (status: AccidentReportReviewStatus, note?: string) => {
    if (isReviewing || !isReviewAllowed(status)) return;

    reviewMutation.mutate(
      {
        accidentReportIds: [accidentReportId],
        status,
        note,
      },
      {
        onSuccess: () => {
          setReviewStatus(null);
          router.replace(accidentReportsPath);
        },
      },
    );
  };

  const handleConfirmReview = () => {
    if (!confirmStatus) return;

    if (confirmStatus === AccidentReportReviewStatus.APPROVED) {
      submitReview(confirmStatus);
    } else {
      setReviewStatus(confirmStatus);
    }

    setConfirmStatus(null);
  };

  const handleReviewAccidentReport = (note: string) => {
    if (!reviewStatus) return;
    submitReview(reviewStatus, note);
  };

  const goToNextStep = async () => {
    if (activeStep >= lastStep || isUpdating) return;

    const activeStepFields = getStepFields(activeStep);
    const isValid =
      activeStepFields.length === 0 || (await form.trigger(activeStepFields));
    if (isValid) setCurrentStep(activeStep + 1);
  };

  const goToPreviousStep = () => {
    if (activeStep > 0 && !isUpdating) setCurrentStep(activeStep - 1);
  };

  const saveCurrentStep = async () => {
    if (!canEdit) return;

    if (isUpdating) return;

    if (activeStep === lastStep && !hasValidNewStampedReport) {
      form.setError("stampedReport", {
        type: "validate",
        message: "Vui lòng đính kèm tệp PDF hợp lệ trước khi lưu",
      });
      return;
    }

    if (activeStep < lastStep) {
      const activeStepFields = getStepFields(activeStep);
      const isValid =
        activeStepFields.length === 0 || (await form.trigger(activeStepFields));
      if (!isValid) return;
    }

    const values = form.getValues();
    const payload: UpdateAccidentReportFormValues = {};
    if (activeStep >= 0) {
      payload.totalEmployees = values.totalEmployees;
      payload.femaleEmployees = values.femaleEmployees;
      payload.totalSalaryFund = values.totalSalaryFund;
    }
    if (activeStep >= 1) payload.accidentTotals = values.accidentTotals;
    if (activeStep >= 2) payload.accidentDetails = values.accidentDetails;
    if (activeStep >= 3) payload.subsidizedAccident = values.subsidizedAccident;
    if (activeStep >= lastStep) {
      const stampedReport: unknown = values.stampedReport;
      if (
        typeof FileList !== "undefined" &&
        stampedReport instanceof FileList
      ) {
        payload.stampedReport = stampedReport.item(0);
      } else if (
        stampedReport === null ||
        stampedReport === undefined ||
        (typeof File !== "undefined" && stampedReport instanceof File)
      ) {
        payload.stampedReport = stampedReport;
      } else {
        form.setError("stampedReport", {
          type: "validate",
          message: "Vui lòng chọn tệp PDF hợp lệ",
        });
        return;
      }
    }

    const result = updateAccidentReportSchema.safeParse(payload);
    if (!result.success) {
      let firstInvalidStep = lastStep;

      for (const issue of result.error.issues) {
        const field = issue.path.join(
          ".",
        ) as FieldPath<UpdateAccidentReportFormValues>;

        const topLevelField = issue.path[0];
        const invalidStep =
          topLevelField === "totalEmployees" ||
          topLevelField === "femaleEmployees" ||
          topLevelField === "totalSalaryFund"
            ? 0
            : topLevelField === "accidentTotals"
              ? 1
              : topLevelField === "accidentDetails"
                ? 2
                : topLevelField === "subsidizedAccident"
                  ? 3
                  : lastStep;
        firstInvalidStep = Math.min(firstInvalidStep, invalidStep);

        if (!field) {
          toast.error(issue.message);
          continue;
        }
        form.setError(field, {
          type: "validate",
          message: issue.message,
        });
      }
      if (firstInvalidStep !== activeStep) setCurrentStep(firstInvalidStep);
      return;
    }

    updateMutation.mutate(result.data, {
      onSuccess: () => {
        if (activeStep === lastStep) {
          router.replace(accidentReportsPath);
          return;
        }
        form.reset(form.getValues());
      },
    });
  };

  const handlePrintReport = async () => {
    if (!report || !summary) {
      toast.error("Chưa có dữ liệu báo cáo để tải Word");
      return;
    }

    setIsExportingReport(true);

    try {
      await downloadAccidentReportSummaryWord(report, summary);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xuất báo cáo Word",
      );
    } finally {
      setIsExportingReport(false);
    }
  };

  return (
    <>
      <FormLayout
        title={
          <>
            Báo cáo TNLĐ - Kỳ báo cáo{" "}
            {report ? getPeriodLabel(report.reportPeriod) : ""} - Năm{" "}
            {report?.year}
          </>
        }
        backHref={accidentReportsPath}
        others={
          <>
            {report &&
              (report?.status === AccidentReportStatus.APPROVED ||
                report?.status === AccidentReportStatus.DECLINED) && (
                <div className="flex flex-wrap items-center gap-5">
                  <span
                    className={`rounded-md px-3 py-1.5 font-normal ${getStatusClass(report.status)}`}
                  >
                    {getStatusLabel(report.status)}
                  </span>

                  {report.submittedAt && (
                    <span>
                      Ngày nộp:{" "}
                      <strong>{formatDate(report.submittedAt)}</strong>
                    </span>
                  )}

                  {report.reviewedAt && (
                    <span>
                      Ngày duyệt:{" "}
                      <strong>{formatDate(report.reviewedAt)}</strong>
                    </span>
                  )}
                </div>
              )}
          </>
        }
        actions={
          <div className="flex items-center justify-center gap-3">
            {canNavigateSteps && activeStep > 0 && (
              <Button
                type="button"
                onClick={goToPreviousStep}
                disabled={isUpdating}
                className="rounded-md border border-primary px-3 py-2 text-primary"
              >
                Quay lại
              </Button>
            )}

            {canEdit && (
              <Button
                type="button"
                onClick={saveCurrentStep}
                disabled={
                  isUpdating ||
                  (activeStep === lastStep && !hasValidNewStampedReport)
                }
                className="rounded-md bg-primary px-3 py-2 text-white"
              >
                {activeStep === lastStep ? "Gửi báo cáo" : "Lưu"}
              </Button>
            )}

            {canReview && (
              <>
                {canApprove && (
                  <Button
                    type="button"
                    onClick={() =>
                      handleConfirmDialogReview(
                        AccidentReportReviewStatus.APPROVED,
                      )
                    }
                    disabled={isReviewing}
                    className="flex items-center gap-2 rounded-md bg-success px-3 py-2 font-medium text-white"
                  >
                    <CircleCheck size={18} />
                    <span>Duyệt</span>
                  </Button>
                )}

                {canDecline && (
                  <Button
                    type="button"
                    onClick={() =>
                      handleConfirmDialogReview(
                        AccidentReportReviewStatus.DECLINED,
                      )
                    }
                    disabled={isReviewing}
                    className="flex items-center gap-2 rounded-md bg-error px-3 py-2 font-medium text-white"
                  >
                    <CircleX size={18} />
                    <span>Từ chối</span>
                  </Button>
                )}
              </>
            )}

            {activeStep === lastStep && (
              <Button
                type="button"
                onClick={handlePrintReport}
                disabled={
                  isExportingReport || summaryQuery.isLoading || !summary
                }
                className="flex items-center gap-2 rounded-md border border-primary px-3 py-2 text-primary"
              >
                <Printer size={18} />
                <span>In báo cáo</span>
              </Button>
            )}

            {canNavigateSteps && activeStep < lastStep && (
              <Button
                type="button"
                onClick={goToNextStep}
                disabled={isUpdating}
                className="rounded-md border border-primary px-3 py-2 text-primary"
              >
                Tiếp tục
              </Button>
            )}
          </div>
        }
      >
        {canNavigateSteps && (
          <Select
            options={ACCIDENT_REPORT_STEP_OPTIONS}
            value={String(activeStep)}
            onChange={(value) => setCurrentStep(Number(value))}
            disabled={isUpdating}
            searchable={false}
          />
        )}

        <FormProvider {...form}>
          <form onSubmit={(event) => event.preventDefault()}>
            {canEdit && (
              <div className="flex w-full flex-col gap-[20px]">
                {activeStep === 0 && (
                  <BusinessInfoStep
                    companyName={report?.companyName}
                    businessIndustryName={report?.businessIndustryName}
                    businessTypeName={report?.businessTypeName}
                  />
                )}
                {activeStep === 1 && (
                  <AccidentStatsStep prefix="accidentTotals" />
                )}
                {activeStep === 2 && <AccidentDetailsStep />}
                {activeStep === 3 && (
                  <AccidentStatsStep prefix="subsidizedAccident" />
                )}
              </div>
            )}

            {activeStep === lastStep && (
              <ReportOverviewStep
                report={report}
                summary={summary}
                disabled={isReadOnly || isUpdating}
              />
            )}
          </form>
        </FormProvider>
      </FormLayout>

      {confirmStatus && (
        <ConfirmDialog
          title={
            confirmStatus === AccidentReportReviewStatus.APPROVED
              ? "Xác nhận duyệt báo cáo"
              : "Xác nhận từ chối báo cáo"
          }
          description={`Bạn có chắc chắn muốn ${
            confirmStatus === AccidentReportReviewStatus.APPROVED
              ? "duyệt"
              : "từ chối"
          } báo cáo này?`}
          confirmText="Xác nhận"
          cancelText="Hủy bỏ"
          onConfirm={handleConfirmReview}
          onClose={() => setConfirmStatus(null)}
        />
      )}

      {reviewStatus && (
        <NoteModal
          count={1}
          isLoading={isReviewing}
          onSubmit={handleReviewAccidentReport}
          onClose={() => setReviewStatus(null)}
        />
      )}

      {isUpdating && (
        <Overlay>
          <Loading size={55} color="white" thickness={8} />
          <h4 className="text-white">Vui lòng chờ trong giây lát ...</h4>
        </Overlay>
      )}
    </>
  );
}

export default EditAccidentReportContainer;
