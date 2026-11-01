"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { locationApi } from "../services/apis/locationApi";

export const locationKeys = {
  hcmProvince: ["location", "province", "hcm"] as const,
};

export const useGetHCMProvince = () =>
  useQuery({
    queryKey: locationKeys.hcmProvince,
    queryFn: locationApi.getHoChiMinhProvince,
    staleTime: Infinity,
    gcTime: Infinity,
  });

export const useGetHCMWards = () => {
  const { data: province } = useGetHCMProvince();

  return useMemo(() => province?.wards ?? [], [province]);
};

