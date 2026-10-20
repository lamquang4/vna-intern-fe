export interface WardResponse {
  name: string;
  mergedFrom: string[];
}

export interface ProvinceResponse {
  id: string;
  province: string;
  licensePlates: string[];
  wards: WardResponse[];
}

export interface ProvinceListResponse {
  success: boolean;
  data: ProvinceResponse[];
}
