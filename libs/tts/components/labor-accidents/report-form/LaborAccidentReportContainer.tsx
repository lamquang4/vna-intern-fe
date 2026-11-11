// libs/tts/components/labor-accidents/report-form/LaborAccidentReportContainer.tsx
'use client';

import React, { useMemo } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FormProvider } from 'react-hook-form';
import {
  LaborAccidentReportFormValues,
  MasterAccidentCategoryDto,
  ReportSectionKey,
} from '@/libs/shared/tts/models/labor-accident.model';
import { useLaborAccidentForm } from '@/libs/tts/hooks/useLaborAccidentForm';
import {
  createNewLaborAccidentReport,
  useAccidentCategories,
  useLaborAccidentDetail,
} from '@/libs/tts/hooks/useLaborAccidents';
import { laborAccidentApis } from '@/libs/tts/services/apis/laborAccidentApis';
import toast from 'react-hot-toast';
import { CancelReportConfirmModal } from '../CancelReportConfirmModal';
import { Step1CompanyInfo } from './Step1CompanyInfo';
import { Step2GeneralAccidents } from './Step2GeneralAccidents';
import { Step3Article39 } from './Step3Article39';
import { Step4Overview } from './Step4Overview';
import { useGetAllBusinessIndustries } from '@/libs/tts/hooks/useBusinessIndustries';
import { useGetAllBusinessTypes } from '@/libs/tts/hooks/useBusinessTypes';
import { useGetEnterpriseMe } from '@/libs/tts/hooks/useEnterprises';
import { useGetMe } from '@/libs/tts/hooks/useAuth';
import axios from 'axios';
import type { ErrorResponse } from '@/libs/shared/core/models/common.model';
import { getErrorMessage } from '@/libs/core/utils/errorUtil';

interface LaborAccidentReportFormProps {
  initialData: LaborAccidentReportFormValues;
  categories: MasterAccidentCategoryDto[];
  isCreateMode?: boolean;
  onBackToList: () => void;
  onSaveDraft: (values: LaborAccidentReportFormValues) => Promise<void>;
  onSubmitReport: (values: LaborAccidentReportFormValues) => Promise<void>;
  canEdit?: boolean;
}

const SECTION_OPTIONS: { value: ReportSectionKey; label: string }[] = [
  { value: 'COMPANY_INFO', label: 'Thông tin doanh nghiệp' },
  { value: 'GENERAL_ACCIDENTS', label: '1. Tai nạn lao động' },
  {
    value: 'ARTICLE_39_ALLOWANCE',
    label: '2. Tai nạn lao động được hưởng trợ cấp theo quy định tại Khoản 2 Điều 39 Luật ATVSLĐ',
  },
  { value: 'OVERVIEW', label: 'Xem tổng quan báo cáo tai nạn lao động' },
];

const LaborAccidentReportForm: React.FC<LaborAccidentReportFormProps> = ({
  initialData,
  categories,
  isCreateMode = false,
  onBackToList,
  onSaveDraft,
  onSubmitReport,
  canEdit = true,
}) => {
  const {
    form,
    caseDetailsFieldArray,
    currentSection,
    setCurrentSection,
    generalSubTab,
    setGeneralSubTab,
    isCancelModalOpen,
    setIsCancelModalOpen,
    handleNextStep,
    handleCancelClick,
    isReadOnly,
  } = useLaborAccidentForm(initialData);

  const activeSection = isReadOnly || !canEdit ? 'OVERVIEW' : currentSection;

  const handlePrint = () => {
    window.print();
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmitReport, () => {
          toast.error('Thông tin báo cáo chưa hợp lệ. Vui lòng kiểm tra các trường bắt buộc.');
        })}
        className="min-h-full bg-background"
      >
        {/* TOP HEADER BAR */}
        <div className="flex items-center justify-between gap-4 border-b border-border bg-background px-6 py-4 shadow-sm print:hidden print:p-0">
          <h2 className="text-base font-semibold text-foreground">Báo cáo định kỳ Tai nạn lao động</h2>

          <div className="flex items-center space-x-3">
            {activeSection !== 'OVERVIEW' && (
              <>
                <input
                  type="text"
                  disabled
                  value={initialData.reportYear}
                  className="h-10 w-24 rounded-md border border-border bg-muted px-3 text-center text-sm text-muted-foreground"
                />
                {isCreateMode && (
                  <select
                    aria-label="Kỳ báo cáo"
                    {...form.register('reportPeriod')}
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                  >
                    <option value="SIX_MONTHS">6 tháng</option>
                    <option value="FULL_YEAR">Cả năm</option>
                  </select>
                )}
              </>
            )}

            <button
              type="button"
              onClick={() => handleCancelClick(onBackToList)}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Huỷ bỏ
            </button>

            {activeSection !== 'OVERVIEW' && !isReadOnly && (
              <>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-1 rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted"
                >
                  <span>›</span>
                  <span>Tiếp tục</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSaveDraft(form.getValues())}
                  className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                >
                  Lưu
                </button>
              </>
            )}

            {activeSection === 'OVERVIEW' && (
              <>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted"
                >
                  In báo cáo
                </button>
                {!isReadOnly && canEdit && (
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                  >
                    Gửi báo cáo
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* DROPDOWN CHỌN MỤC BÁO CÁO */}
        {!isReadOnly && (
          <div className="border-b border-border px-6 py-5 print:hidden">
            <div className="max-w-md relative">
              <label className="absolute -top-2 left-2.5 bg-background px-1 text-xs text-muted-foreground">
                Chọn mục báo cáo
              </label>
              <select
                value={currentSection}
                onChange={(e) => setCurrentSection(e.target.value as ReportSectionKey)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:cursor-not-allowed"
              >
                {SECTION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* NỘI DUNG TỪNG BƯỚC */}
        <div className="p-6 print:p-0">
          {activeSection === 'COMPANY_INFO' && (
            <Step1CompanyInfo disabled={isReadOnly || !canEdit} />
          )}

          {activeSection === 'GENERAL_ACCIDENTS' && (
            <Step2GeneralAccidents
              activeSubTab={generalSubTab}
              onChangeSubTab={setGeneralSubTab}
              fieldArray={caseDetailsFieldArray}
              categories={categories}
              disabled={isReadOnly || !canEdit}
            />
          )}

          {activeSection === 'ARTICLE_39_ALLOWANCE' && <Step3Article39 disabled={isReadOnly || !canEdit} />}

          {activeSection === 'OVERVIEW' && (
            <Step4Overview categories={categories} isReadOnly={isReadOnly || !canEdit} />
          )}
        </div>

        {/* MODAL CẢNH BÁO HUỶ BỎ */}
        <CancelReportConfirmModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={() => {
            setIsCancelModalOpen(false);
            onBackToList();
          }}
        />
      </form>
    </FormProvider>
  );
};

function getBackUrl(searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return query ? `/labor-accidents?${query}` : '/labor-accidents';
}

export const LaborAccidentReportContainer: React.FC = () => {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCreateMode = pathname.endsWith('/new');
  const reportId = isCreateMode ? undefined : params.id;
  const backUrl = getBackUrl(searchParams);
  const reportYear = Number(searchParams.get('year')) || new Date().getFullYear();
  const reportPeriod =
    searchParams.get('period') === 'SIX_MONTHS' ? ('SIX_MONTHS' as const) : ('FULL_YEAR' as const);
  const { data: accountData } = useGetMe();
  const role = accountData?.data.roleCode;
  const canEdit = role === 'DOANH_NGHIEP';
  const newReport = useMemo(
    () => createNewLaborAccidentReport(reportYear, reportPeriod),
    [reportYear, reportPeriod]
  );
  const { data: enterpriseData, isLoading: isEnterpriseLoading, isError: isEnterpriseError } =
    useGetEnterpriseMe(isCreateMode);
  const {
    data: businessTypesData,
    isLoading: isBusinessTypesLoading,
    isError: isBusinessTypesError,
  } = useGetAllBusinessTypes();
  const {
    data: businessIndustriesData,
    isLoading: isBusinessIndustriesLoading,
    isError: isBusinessIndustriesError,
  } = useGetAllBusinessIndustries();

  const {
    data: detailData,
    isLoading: isReportLoading,
    isError: isReportError,
  } = useLaborAccidentDetail(reportId);
  const {
    data: categories = [],
    isLoading: areCategoriesLoading,
    isError: areCategoriesError,
  } = useAccidentCategories();

  const enterprise = enterpriseData?.data;
  const businessTypeName =
    businessTypesData?.data?.find(
      (item) => item.businessTypeId === enterprise?.businessTypeId
    )?.name ?? enterprise?.businessTypeId ?? '';
  const businessIndustryName =
    businessIndustriesData?.data?.find(
      (item) => item.businessIndustryId === enterprise?.businessIndustryId
    )?.name ?? enterprise?.businessIndustryId ?? '';
  const reportWithReferenceNames = detailData
    ? {
        ...detailData,
        companyInfo: {
          ...detailData.companyInfo,
          companyType:
            businessTypesData?.data?.find(
              (item) => item.businessTypeId === detailData.companyInfo.companyType,
            )?.name ?? detailData.companyInfo.companyType,
          businessSector:
            businessIndustriesData?.data?.find(
              (item) => item.businessIndustryId === detailData.companyInfo.businessSector,
            )?.name ?? detailData.companyInfo.businessSector,
        },
      }
    : undefined;
  const initialData = isCreateMode
    ? {
        ...newReport,
        companyInfo: {
          ...newReport.companyInfo,
          companyName: enterprise?.name ?? '',
          companyType: businessTypeName,
          businessSector: businessIndustryName,
        },
      }
    : reportWithReferenceNames;

  if (
    (!isCreateMode && isReportLoading) ||
    areCategoriesLoading ||
    isBusinessTypesLoading ||
    isBusinessIndustriesLoading ||
    (isCreateMode && isEnterpriseLoading) ||
    !role
  ) {
    return <div className="p-6 text-sm text-muted-foreground">Đang tải báo cáo...</div>;
  }

  if (
    (!isCreateMode && isReportError) ||
    areCategoriesError ||
    isBusinessTypesError ||
    isBusinessIndustriesError ||
    (isCreateMode && isEnterpriseError) ||
    !initialData
  ) {
    return (
      <div className="p-6 text-sm text-error">
        Không thể tải dữ liệu báo cáo. Vui lòng thử lại.
      </div>
    );
  }

  const handleBackToList = () => {
    router.push(backUrl);
  };

  const handleSaveDraft = async (values: LaborAccidentReportFormValues) => {
    try {
      const id =
        reportId ??
        (await laborAccidentApis.getReportId(reportYear, values.reportPeriod, role ?? ''));
      if (!id) {
        throw new Error('Không xác định được mã báo cáo');
      }
      await laborAccidentApis.updateReport(id, values);
      toast.success('Đã lưu báo cáo nháp');
      router.push(backUrl);
    } catch (error) {
      toast.error(
        axios.isAxiosError<ErrorResponse>(error)
          ? getErrorMessage(error, 'Không thể lưu báo cáo nháp. Vui lòng thử lại.')
          : error instanceof Error
            ? error.message
            : 'Không thể lưu báo cáo nháp. Vui lòng thử lại.',
      );
    }
  };

  const handleSubmitReport = async (values: LaborAccidentReportFormValues) => {
    try {
      const id =
        reportId ??
        (await laborAccidentApis.getReportId(reportYear, values.reportPeriod, role ?? ''));
      if (!id) {
        throw new Error('Không xác định được mã báo cáo');
      }
      if (!values.attachmentFile) {
        throw new Error('Vui lòng đính kèm báo cáo PDF có dấu mộc');
      }
      await laborAccidentApis.updateReport(id, values, true);
      toast.success('Đã gửi báo cáo');
      router.push(backUrl);
    } catch (error) {
      toast.error(
        axios.isAxiosError<ErrorResponse>(error)
          ? getErrorMessage(error, 'Không thể gửi báo cáo. Vui lòng thử lại.')
          : error instanceof Error
            ? error.message
            : 'Không thể gửi báo cáo. Vui lòng thử lại.',
      );
    }
  };

  return (
    <LaborAccidentReportForm
      initialData={initialData}
      categories={categories}
      isCreateMode={isCreateMode}
      onBackToList={handleBackToList}
      onSaveDraft={handleSaveDraft}
      onSubmitReport={handleSubmitReport}
      canEdit={canEdit}
    />
  );
};

export default LaborAccidentReportContainer;