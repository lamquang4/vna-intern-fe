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

interface LaborAccidentReportFormProps {
  initialData: LaborAccidentReportFormValues;
  categories: MasterAccidentCategoryDto[];
  isCreateMode?: boolean;
  onBackToList: () => void;
  onSaveDraft: (values: LaborAccidentReportFormValues) => Promise<void>;
  onSubmitReport: (values: LaborAccidentReportFormValues) => Promise<void>;
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

  const activeSection = isReadOnly ? 'OVERVIEW' : currentSection;

  const handlePrint = () => {
    window.print();
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmitReport)} className="min-h-full bg-background">
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
                {!isReadOnly && (
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
            <Step1CompanyInfo disabled={isReadOnly} />
          )}

          {activeSection === 'GENERAL_ACCIDENTS' && (
            <Step2GeneralAccidents
              activeSubTab={generalSubTab}
              onChangeSubTab={setGeneralSubTab}
              fieldArray={caseDetailsFieldArray}
              categories={categories}
              disabled={isReadOnly}
            />
          )}

          {activeSection === 'ARTICLE_39_ALLOWANCE' && <Step3Article39 disabled={isReadOnly} />}

          {activeSection === 'OVERVIEW' && (
            <Step4Overview categories={categories} isReadOnly={isReadOnly} />
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
  const newReport = useMemo(
    () => createNewLaborAccidentReport(reportYear, reportPeriod),
    [reportYear, reportPeriod]
  );
  const { data: enterpriseData, isLoading: isEnterpriseLoading, isError: isEnterpriseError } =
    useGetEnterpriseMe(isCreateMode);
  const { data: businessTypesData } = useGetAllBusinessTypes();
  const { data: businessIndustriesData } = useGetAllBusinessIndustries();

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
    : detailData;

  if ((!isCreateMode && isReportLoading) || areCategoriesLoading || (isCreateMode && isEnterpriseLoading)) {
    return <div className="p-6 text-sm text-muted-foreground">Đang tải báo cáo...</div>;
  }

  if (
    (!isCreateMode && isReportError) ||
    areCategoriesError ||
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
      if (isCreateMode) {
        await laborAccidentApis.createDraftReport(values);
      } else if (reportId) {
        await laborAccidentApis.saveDraftReport(reportId, values);
      } else {
        throw new Error('Không xác định được mã báo cáo');
      }
      toast.success('Đã lưu báo cáo nháp');
      router.push(backUrl);
    } catch {
      toast.error('Không thể lưu báo cáo nháp. Vui lòng thử lại.');
    }
  };

  const handleSubmitReport = async (values: LaborAccidentReportFormValues) => {
    try {
      let id = reportId;
      if (isCreateMode) {
        const created = await laborAccidentApis.createDraftReport(values);
        id = created.id;
      }
      if (!id) {
        throw new Error('Không xác định được mã báo cáo');
      }
      await laborAccidentApis.submitReport(id, values);
      toast.success('Đã gửi báo cáo');
      router.push(backUrl);
    } catch {
      toast.error('Không thể gửi báo cáo. Vui lòng thử lại.');
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
    />
  );
};

export default LaborAccidentReportContainer;