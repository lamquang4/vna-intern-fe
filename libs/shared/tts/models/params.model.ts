import type { PageParams } from "@/libs/shared/core/models/common.model";

export interface GetUsersParams extends PageParams {
  fullname?: string;
  username?: string;
  email?: string;
  roleName?: string;
  position?: string;
  isActive?: boolean;
}

export interface GetEnterprisesParams extends PageParams {
  name?: string;
  taxCode?: string;
  businessType?: string;
  businessIndustry?: string;
  ward?: string;
  isActive?: boolean;
}
