import { axiosInstance } from "@/libs/core/services/axiosInstance.ts";
import type {
  ApiResponse,
  PageResponse,
} from "@/libs/shared/core/models/common.model";
import type {
  AccidentReportDetailResponse,
  AccidentReportResponse,
  AccidentReportSummaryResponse,
  OverallAccidentReportResponse,
  ReviewAccidentReportsRequest,
  UpdateAccidentReportRequest,
} from "@/libs/shared/tts/models/accident-report.model";
import {
  GetAccidentReportsMeParams,
  GetAccidentReportsParams,
} from "@/libs/shared/tts/models/params.model";

const BASE = "/accident-reports";

const toAccidentReportFormData = (
  data: UpdateAccidentReportRequest,
): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined) return;

    if (value === null) {
      if (key !== "stampedReport") formData.append(key, "null");
      return;
    }

    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
};

export const accidentReportApis = {
  // Lấy danh sách phân trang báo cáo TNLĐ (role Sở)
  getAccidentReports: (params?: GetAccidentReportsParams) =>
    axiosInstance
      .get<PageResponse<AccidentReportResponse>>(BASE, { params })
      .then((r) => r.data),

  // Lấy danh sách phân trang báo cáo TNLĐ của tài khoản DN đang đăng nhập
  getAccidentReportsMe: (params?: GetAccidentReportsMeParams) =>
    axiosInstance
      .get<PageResponse<AccidentReportResponse>>(`${BASE}/me`, { params })
      .then((r) => r.data),

  // Cập nhật báo cáo TNLĐ (role Doanh nghiệp)
  updateAccidentReport: (id: string, data: UpdateAccidentReportRequest) =>
    axiosInstance
      .put<ApiResponse<null>>(`${BASE}/${id}`, toAccidentReportFormData(data))
      .then((r) => r.data),

  // Lấy chi tiết báo cáo TNLĐ theo ID
  getAccidentReportDetail: (id: string) =>
    axiosInstance
      .get<ApiResponse<AccidentReportDetailResponse>>(`${BASE}/${id}`)
      .then((r) => r.data),

  // Lấy báo cáo TNLĐ tổng hợp của 1 báo cáo cụ thể
  getAccidentReportSummary: (id: string) =>
    axiosInstance
      .get<ApiResponse<AccidentReportSummaryResponse>>(`${BASE}/${id}/summary`)
      .then((r) => r.data),

  // Lấy báo cáo tổng hợp TNLĐ toàn bộ DN cho role Sở theo năm
  getOverallAccidentReport: (year?: number) =>
    axiosInstance
      .get<
        ApiResponse<OverallAccidentReportResponse>
      >(`${BASE}/summary`, { params: { year } })
      .then((r) => r.data),

  // Duyệt hoặc từ chối báo cáo
  reviewAccidentReport: (data: ReviewAccidentReportsRequest) =>
    axiosInstance
      .put<ApiResponse<null>>(`${BASE}/review`, data)
      .then((r) => r.data),
};
