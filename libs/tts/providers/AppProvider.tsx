"use client";
import type { ReactNode } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { QueryProvider } from "./QueryProvider";
import { ToastProvider } from "./ToastProvider";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <NuqsAdapter>
        {children}
        <ToastProvider />
      </NuqsAdapter>
    </QueryProvider>
  );
}
