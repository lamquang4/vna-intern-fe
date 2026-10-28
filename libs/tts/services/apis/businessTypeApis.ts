import { axiosInstance } from "@/libs/core/services/axiosInstance.ts";
import { ApiResponse } from "@/libs/shared/core/models/common.model";
import { BusinessTypeResponse } from "@/libs/shared/tts/models/business-type.model";

const BASE = "/business-types";

export const businessTypeApis = {
  // Lấy tất cả loại hình kinh doanh đang hoạt động
  getAllBusinessTypes: () =>
    axiosInstance
      .get<ApiResponse<BusinessTypeResponse[]>>(BASE)
      .then(({ data }) => data),
};
