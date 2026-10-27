"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { locationApi } from "../services/apis/locationApi";

export const locationKeys = {
  provinces: ["location", "provinces"] as const,
};

export const useGetAllProvinces = () =>
  useQuery({
    queryKey: locationKeys.provinces,
    queryFn: locationApi.getProvinces,
    staleTime: Infinity,
    gcTime: Infinity,
  });

// Lấy tất cả phường/xã, không phụ thuộc tỉnh
export const useGetAllWards = () => {
  const { data: provinces } = useGetAllProvinces();

  return useMemo(
    () => provinces?.flatMap((province) => province.wards) ?? [],
    [provinces],
  );
};

// Lấy danh sách phường/xã theo tỉnh đã chọn
export const useGetWardsByProvince = (provinceName?: string) => {
  const { data: provinces } = useGetAllProvinces();

  return useMemo(
    () => provinces?.find((p) => p.province === provinceName)?.wards ?? [],
    [provinces, provinceName],
  );
};
