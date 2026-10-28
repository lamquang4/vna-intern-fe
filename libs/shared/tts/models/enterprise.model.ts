// request

//response
// /enterprises?name=&taxCode=&businessType=&businessIndustry=&ward=&isActive=&page=&size=
export interface EnterpriseResponse {
  enterpriseId: string;
  userId: string;
  name: string;
  taxCode: string;
  businessType: string;
  businessIndustry: string;
  ward: string;
  isActive: boolean;
}

export interface FileResponse {
  fileId: string;
  fileName: string; // "giay-phep-kinh-doanh.pdf"
  contentType: string; // "application/pdf", "image/png", ...
  size: number; // bytes
  url: string; // link xem/tải file
}

export interface EnterpriseDetailResponse {
  name: string;
  taxCode: string;
  licenseIssueDate?: string | null;
  businessTypeId: string;
  businessIndustryId: string;
  province: string;
  ward: string;
  address?: string | null;
  foreignName?: string | null;
  email: string;
  officePhone?: string | null;
  operatingProvince?: string | null;
  operatingWard?: string | null;
  businessLocation?: string | null;
  representative?: string | null;
  representativePhone?: string | null;
  businessLicense?: FileResponse | null;
  otherDocument?: FileResponse | null;
}

export interface DeleteEnterpriseRequest {
  enterpriseIds: string[];
}

export interface CreateEnterpriseRequest {
  name: string;
  licenseIssueDate?: string | null;
  taxCode: string;
  businessTypeId: string; // loại hình kinh doanh
  businessIndustryId: string; // ngành nghề kinh doanh
  province: string;
  ward: string;
  address?: string | null;
  foreignName?: string | null;
  email: string;
  officePhone?: string | null;
  operatingProvince?: string | null;
  operatingWard?: string | null;
  businessLocation?: string | null;
  representative?: string | null;
  representativePhone?: string | null;
  businessLicense?: File | null; // Giấy phép kinh doanh
  otherDocument?: File | null; // Giấy tờ khác
}

export interface UpdateEnterpriseRequest {
  name: string;
  licenseIssueDate?: string | null;
  businessTypeId: string; // loại hình kinh doanh
  businessIndustryId: string; // ngành nghề kinh doanh
  province: string;
  ward: string;
  address?: string | null;
  foreignName?: string | null;
  email: string;
  officePhone?: string | null;
  operatingProvince?: string | null;
  operatingWard?: string | null;
  businessLocation?: string | null;
  representative?: string | null;
  representativePhone?: string | null;
  businessLicense?: File | null; // Giấy phép kinh doanh
  otherDocument?: File | null; // Giấy tờ khác
}

export type DocumentField = "businessLicense" | "otherDocument";

export interface DocumentRow<TFile = File> {
  id: DocumentField;
  name: string;
  file: TFile | null;
}
