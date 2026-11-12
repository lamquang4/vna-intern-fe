import { axiosInstance } from "@/libs/core/services/axiosInstance.ts";
import type { ApiResponse } from "@/libs/shared/core/models/common.model";
import type { CategoryResponse } from "@/libs/shared/tts/models/category.model";
import { CategoryType } from "@/libs/shared/tts/models/enums";

const BASE = "/categories";

export const categoryApi = {
  // Lấy tất cả danh mục theo type (INJURY_FACTOR | INJURY_TYPE | OCCUPATION)
  getAllCategories: (type: CategoryType) =>
    axiosInstance
      .get<ApiResponse<CategoryResponse[]>>(BASE, {
        params: { type },
      })
      .then((r) => r.data),
};
