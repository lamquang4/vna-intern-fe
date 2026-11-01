import {
  ProvinceListResponse,
  ProvinceResponse,
} from "@/libs/shared/tts/models/location.model";
import axios from "axios";

const URL = "https://vietnamlabs.com/api/vietnamprovince";
const HO_CHI_MINH_PROVINCE = "Hồ Chí Minh";

export const locationApi = {
  getHoChiMinhProvince: (): Promise<ProvinceResponse> =>
    axios
      .get<ProvinceListResponse>(URL)
      .then((r) => {
        const province = r.data.data.find(
          (item) => item.province === HO_CHI_MINH_PROVINCE,
        );

        if (!province) {
          throw new Error(
            `Không tìm thấy dữ liệu tỉnh/thành phố ${HO_CHI_MINH_PROVINCE}.`,
          );
        }

        return province;
      }),
};
