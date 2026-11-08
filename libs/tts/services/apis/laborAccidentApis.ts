// libs/tts/services/apis/laborAccidentApis.ts
import { axiosInstance } from '@/libs/core/services/axiosInstance.ts'; // Hoặc đường dẫn alias trong tsconfig.json của bạn
import {
  LaborAccidentReportFormValues,
  MasterAccidentCategoryDto,
  ReportListItemDto,
} from '@/libs/shared/tts/models/labor-accident.model';

export const laborAccidentApis = {
  // Lấy danh sách báo cáo định kỳ (Màn 26)
  getReportsByYear: async (year: number): Promise<ReportListItemDto[]> => {
    const res = await axiosInstance.get('/labor-accident-reports', { params: { year } });
    return res.data;
  },

  // Lấy chi tiết 1 báo cáo theo ID (Màn 26.1 -> 26.6)
  getReportDetail: async (id: string): Promise<LaborAccidentReportFormValues> => {
    const res = await axiosInstance.get(`/labor-accident-reports/${id}`);
    return res.data;
  },

  // Lấy danh mục Nguyên nhân, Yếu tố chấn thương, Nghề nghiệp (Màn 26.3 & 26.5)
  getMasterCategories: async (): Promise<MasterAccidentCategoryDto[]> => {
    const res = await axiosInstance.get('/labor-accident-categories');
    return res.data;
  },

  createDraftReport: async (
    payload: LaborAccidentReportFormValues
  ): Promise<LaborAccidentReportFormValues> => {
    const res = await axiosInstance.post('/labor-accident-reports/draft', payload);
    return res.data;
  },

  // Lưu nháp báo cáo (Nút "Lưu")
  saveDraftReport: async (id: string, payload: LaborAccidentReportFormValues) => {
    const res = await axiosInstance.put(`/labor-accident-reports/${id}/draft`, payload);
    return res.data;
  },

  // Gửi báo cáo chính thức (Nút "Gửi báo cáo" ở Màn 26.5)
  submitReport: async (id: string, payload: LaborAccidentReportFormValues) => {
    const res = await axiosInstance.post(`/labor-accident-reports/${id}/submit`, payload);
    return res.data;
  },
};