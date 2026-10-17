"use client";
import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      toastOptions={{
        success: {
          style: {
            background: "var(--success-background)",
            color: "var(--success-foreground)",
          },
          iconTheme: {
            primary: "var(--success)",
            secondary: "#fff",
          },
        },
        error: {
          style: {
            background: "var(--error-background)",
            color: "var(--error-foreground)",
          },
          iconTheme: {
            primary: "var(--error)",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
