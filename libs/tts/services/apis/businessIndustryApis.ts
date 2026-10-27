import { axiosInstance } from "@/libs/core/services/axiosInstance.ts";
import { ApiResponse } from "@/libs/shared/core/models/common.model";
import { BusinessIndustryResponse } from "@/libs/shared/tts/models/business-industry.model";

const BASE = "/business-industries";

export const businessIndustryApis = {
  // Lấy tất cả ngành nghề kinh doanh cấp 4
  getAllBusinessIndustries: () =>
    axiosInstance
      .get<ApiResponse<BusinessIndustryResponse[]>>(BASE)
      .then(({ data }) => data),
};
