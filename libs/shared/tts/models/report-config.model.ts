import { AccidentReportPeriod } from "./enums";

export interface ReportPeriodConfigResponse {
  period: AccidentReportPeriod;
  deadlineMonth: number;
  deadlineDay: number;
  requiredFields: string[];
  description?: string | null;
}

export interface ReportDeadlineExtensionResponse {
  year: number;
  period: AccidentReportPeriod;
  deadlineAt: string;
}

export interface ConfigureReportDeadlineRequest {
  period: AccidentReportPeriod;
  year: number;
  deadlineAt: string;
}

export interface ExtendReportDeadlineRequest {
  period: AccidentReportPeriod;
  year: number;
  deadlineAt: string;
  accidentReportId: string;
}
