"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { locationApi } from "../services/apis/locationApi";

export const locationKeys = {
  provinces: ["location", "provinces"] as const,
};

export const useProvinces = () =>
  useQuery({
    queryKey: locationKeys.provinces,
    queryFn: locationApi.getProvinces,
    staleTime: Infinity,
    gcTime: Infinity,
  });

// Lấy danh sách phường theo tên tỉnh đã chọn
export const useWards = (provinceName?: string) => {
  const { data: provinces } = useProvinces();

  return useMemo(
    () => provinces?.find((p) => p.province === provinceName)?.wards ?? [],
    [provinces, provinceName],
  );
};
