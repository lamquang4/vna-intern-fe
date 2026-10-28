import { axiosInstance } from "@/libs/core/services/axiosInstance.ts";
import {
  ApiResponse,
  PageResponse,
} from "@/libs/shared/core/models/common.model";
import {
  CreateEnterpriseRequest,
  DeleteEnterpriseRequest,
  EnterpriseDetailResponse,
  EnterpriseResponse,
  UpdateEnterpriseRequest,
} from "@/libs/shared/tts/models/enterprise.model";
import { GetEnterprisesParams } from "@/libs/shared/tts/models/params.model";

const BASE = "/enterprises";

const toEnterpriseFormData = (
  data: CreateEnterpriseRequest | UpdateEnterpriseRequest,
): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
};

export const enterpriseApis = {
  getEnterprises: (params?: GetEnterprisesParams) =>
    axiosInstance
      .get<PageResponse<EnterpriseResponse>>(BASE, { params })
      .then(({ data }) => data),

  getEnterpriseDetail: (enterpriseId: string) =>
    axiosInstance
      .get<ApiResponse<EnterpriseDetailResponse>>(`${BASE}/${enterpriseId}`)
      .then(({ data }) => data),

  deleteEnterprises: (data: DeleteEnterpriseRequest) =>
    axiosInstance
      .delete<ApiResponse<null>>(BASE, { data })
      .then(({ data }) => data),

  createEnterprise: (data: CreateEnterpriseRequest) =>
    axiosInstance
      .post<ApiResponse<null>>(BASE, toEnterpriseFormData(data))
      .then(({ data }) => data),

  updateEnterprise: (enterpriseId: string, data: UpdateEnterpriseRequest) =>
    axiosInstance
      .put<ApiResponse<null>>(
        `${BASE}/${enterpriseId}`,
        toEnterpriseFormData(data),
      )
      .then(({ data }) => data),
};
