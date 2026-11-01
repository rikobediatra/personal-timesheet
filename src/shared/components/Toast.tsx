"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Icon } from "./Icon";

type ToastPayload = {
  title: string;
  description: string;
  icon?: string;
};

type ToastContextValue = {
  showToast: (title: string, description: string, icon?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const [visible, setVisible] = useState(false);

  const showToast = useCallback(
    (title: string, description: string, icon = "check_circle") => {
      setToast({ title, description, icon });
      setVisible(true);
      window.setTimeout(() => {
        setVisible(false);
      }, 3500);
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className={`pointer-events-none fixed right-8 bottom-6 z-50 flex items-center gap-space-sm rounded-lg bg-primary px-4 py-3 text-on-primary shadow-xl transition-all duration-300 ${
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-24 opacity-0"
        }`}
        role="status"
        aria-live="polite"
      >
        <Icon
          name={toast?.icon ?? "check_circle"}
          className="text-[20px] text-tertiary-fixed"
        />
        <div className="flex flex-col">
          <span className="font-label-lg text-label-lg font-semibold">
            {toast?.title ?? ""}
          </span>
          <span className="font-body-sm text-body-sm text-on-primary-container">
            {toast?.description ?? ""}
          </span>
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
