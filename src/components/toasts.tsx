"use client";

import { ToastContainer } from "react-toastify";
import { useTheme } from "next-themes";

export function Toasts() {
  const { resolvedTheme } = useTheme();
  return (
    <ToastContainer
      position="bottom-right"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}