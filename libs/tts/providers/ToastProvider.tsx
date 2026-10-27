"use client";
import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      toastOptions={{
        success: {
          iconTheme: {
            primary: "var(--success)",
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--error)",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
