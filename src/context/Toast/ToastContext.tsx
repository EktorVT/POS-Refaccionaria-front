import { createContext } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastData {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
}

export interface ShowToastData {
  type: ToastType;
  title?: string;
  message: string;
}

export interface ToastContextValue {
  showToast: (toast: ShowToastData) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined
);
