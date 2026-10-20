import {
  ProvinceListResponse,
  ProvinceResponse,
} from "@/libs/shared/tts/models/location.model";
import axios from "axios";

const URL = "https://vietnamlabs.com/api/vietnamprovince";

export const locationApi = {
  getProvinces: (): Promise<ProvinceResponse[]> =>
    axios.get<ProvinceListResponse>(URL).then((r) => r.data.data),
};
