import type { PageParams } from "@/libs/shared/core/models/common.model";
import { AccidentReportPeriod } from "./enums";

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

export interface GetAccidentReportsParams extends PageParams {
  name?: string;
  taxCode?: string;
  reportPeriod?: AccidentReportPeriod;
  status?: string;
  province?: string;
  ward?: string;
  year?: number;
}

export interface GetAccidentReportsMeParams extends PageParams {
  name?: string;
  taxCode?: string;
  reportPeriod?: AccidentReportPeriod;
  status?: string;
  year?: number;
}
