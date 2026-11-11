// src/features/labor-accident-report/hooks/useAccidentReportForm.ts
import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  GeneralAccidentSubTab,
  LaborAccidentReportFormValues,
  ReportSectionKey,
} from '@/libs/shared/tts/models/labor-accident.model';
import {
  createEmptyCaseDetail,
  laborAccidentReportSchema,
} from '@/libs/shared/tts/schemas/labor-accident.schema';

export function useLaborAccidentForm(initialData: LaborAccidentReportFormValues) {
  // 1. Quản lý Step hiện tại (Dropdown "Chọn mục báo cáo") & Sub-tab của Mục 1
  const [currentSection, setCurrentSection] = useState<ReportSectionKey>('COMPANY_INFO');
  const [generalSubTab, setGeneralSubTab] = useState<GeneralAccidentSubTab>('SUMMARY');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // 2. Khởi tạo React Hook Form
  const form = useForm<LaborAccidentReportFormValues>({
    resolver: zodResolver(laborAccidentReportSchema),
    defaultValues: initialData,
    mode: 'onChange',
  });

  useEffect(() => {
    if (!initialData.companyInfo.companyName) return;
    form.setValue('companyInfo.companyName', initialData.companyInfo.companyName);
    form.setValue('companyInfo.companyType', initialData.companyInfo.companyType);
    form.setValue('companyInfo.businessSector', initialData.companyInfo.businessSector);
  }, [
    form,
    initialData.companyInfo.companyName,
    initialData.companyInfo.companyType,
    initialData.companyInfo.businessSector,
  ]);

  const {
    control,
    trigger,
    formState: { isDirty },
  } = form;

  // 3. Quản lý mảng động các vụ tai nạn ở Màn 26.3
  const caseDetailsFieldArray = useFieldArray({
    control,
    name: 'generalAccidents.details',
  });
  const { fields, append, remove } = caseDetailsFieldArray;

  // Lắng nghe "Tổng số vụ" ở Tab 1 (Màn 26.2) để tự động sinh số lượng Accordion ở Tab 2 (Màn 26.3)
  const watchedTotalCases = useWatch({
    control,
    name: 'generalAccidents.summary.totalCases',
  });

  useEffect(() => {
    const targetCount = Math.max(0, Number(watchedTotalCases) || 0);
    const currentCount = fields.length;

    if (targetCount > currentCount) {
      const itemsToAdd = Array.from(
        { length: targetCount - currentCount },
        () => createEmptyCaseDetail()
      );
      append(itemsToAdd, { shouldFocus: false });
    } else if (targetCount < currentCount) {
      // Xoá từ cuối mảng lên nếu giảm Tổng số vụ
      const indicesToRemove = Array.from(
        { length: currentCount - targetCount },
        (_, i) => currentCount - 1 - i
      );
      remove(indicesToRemove);
    }
  }, [
    watchedTotalCases,
    fields.length,
    append,
    remove,
  ]);

  // 4. Logic nút "Tiếp tục" (Đi tuần tự: 26.1 -> 26.2 -> 26.3 -> 26.4 -> 26.5)
  const handleNextStep = useCallback(async () => {
    if (currentSection === 'COMPANY_INFO') {
      const isValid = await trigger('companyInfo');
      if (isValid) {
        setCurrentSection('GENERAL_ACCIDENTS');
        setGeneralSubTab('SUMMARY');
      }
      return;
    }

    if (currentSection === 'GENERAL_ACCIDENTS') {
      if (generalSubTab === 'SUMMARY') {
        const isValid = await trigger('generalAccidents.summary');
        if (isValid) {
          // Nếu tổng số vụ > 0 thì qua Tab (2) nhập chi tiết, nếu = 0 thì nhảy qua Mục 2 (26.4)
          if (watchedTotalCases > 0) {
            setGeneralSubTab('DETAILS');
          } else {
            setCurrentSection('ARTICLE_39_ALLOWANCE');
          }
        }
      } else {
        const isValid = await trigger('generalAccidents.details');
        if (isValid) {
          setCurrentSection('ARTICLE_39_ALLOWANCE');
        }
      }
      return;
    }

    if (currentSection === 'ARTICLE_39_ALLOWANCE') {
      const isValid = await trigger('article39Accidents');
      if (isValid) {
        setCurrentSection('OVERVIEW');
      }
    }
  }, [currentSection, generalSubTab, trigger, watchedTotalCases]);

  // 5. Logic nút "Huỷ bỏ" (Hiển thị popup cảnh báo nếu form đã bị chỉnh sửa)
  const handleCancelClick = useCallback((onNavigateBack: () => void) => {
    if (isDirty && initialData.status !== 'ACCEPTED') {
      setIsCancelModalOpen(true);
    } else {
      onNavigateBack();
    }
  }, [isDirty, initialData.status]);

  return {
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
    isReadOnly: initialData.status === 'ACCEPTED', // Màn 26.6 là ReadOnly
  };
}