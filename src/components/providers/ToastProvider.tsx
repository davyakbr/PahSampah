"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => {
          const typeStyles = {
            success: "bg-emerald-50/90 text-emerald-800 border-emerald-200/50 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-900/40",
            error: "bg-red-50/90 text-red-800 border-red-200/50 dark:bg-red-950/80 dark:text-red-200 dark:border-red-900/40",
            info: "bg-blue-50/90 text-blue-800 border-blue-200/50 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-900/40",
            warning: "bg-amber-50/90 text-amber-800 border-amber-200/50 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-900/40",
          };

          const Icon = {
            success: CheckCircle,
            error: XCircle,
            info: Info,
            warning: AlertTriangle,
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border glass-effect shadow-xl transition-all duration-300 transform translate-y-0 animate-fade-in-up ${typeStyles[toast.type]}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium flex-grow text-theme">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-theme opacity-70 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
