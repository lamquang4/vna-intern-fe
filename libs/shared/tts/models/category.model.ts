import { CategoryType } from "./enums";

// request

// response
export interface CategoryResponse {
  categoryId: string;
  code: CategoryType;
  name: string;
}
