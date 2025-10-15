"use client";

import * as React from "react";
import { X, CheckCircle, AlertCircle, Info, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TOAST_LIFETIME = 5000; // 5 seconds

export default function ToastProvider() {
  const { toasts, dismiss } = useToast();

  React.useEffect(() => {
    toasts.forEach(toast => {
      const timer = setTimeout(() => {
        dismiss(toast.id);
      }, TOAST_LIFETIME);

      return () => clearTimeout(timer);
    });
  }, [toasts, dismiss]);

  const getToastStyles = (variant: string) => {
    switch (variant) {
      case "destructive":
        return {
          bg: "bg-red-50 border-red-200",
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          titleColor: "text-red-900",
          descColor: "text-red-700",
          closeHover: "hover:bg-red-100",
          progressBg: "bg-red-500",
        };
      case "info":
        return {
          bg: "bg-blue-50 border-blue-200",
          icon: <Info className="w-5 h-5 text-blue-600" />,
          titleColor: "text-blue-900",
          descColor: "text-blue-700",
          closeHover: "hover:bg-blue-100",
          progressBg: "bg-blue-500",
        };
      case "warning":
        return {
          bg: "bg-yellow-50 border-yellow-200",
          icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
          titleColor: "text-yellow-900",
          descColor: "text-yellow-700",
          closeHover: "hover:bg-yellow-100",
          progressBg: "bg-yellow-500",
        };
      default:
        return {
          bg: "bg-green-50 border-green-200",
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          titleColor: "text-green-900",
          descColor: "text-green-700",
          closeHover: "hover:bg-green-100",
          progressBg: "bg-green-500",
        };
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[9999] max-w-sm w-full pointer-events-none">
      {toasts.map(toastItem => {
        const styles = getToastStyles(toastItem.variant || "default");

        return (
          <div
            key={toastItem.id}
            className={`pointer-events-auto w-full rounded-xl shadow-lg border-l-4 ${styles.bg} backdrop-blur-sm transition-all duration-300 ease-out transform translate-x-0 overflow-hidden`}
          >
            <div className="flex items-start gap-3 p-4">
              <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>

              <div className="flex-1 min-w-0">
                {toastItem.title && (
                  <div
                    className={`font-semibold text-sm mb-1 ${styles.titleColor}`}
                  >
                    {toastItem.title}
                  </div>
                )}
                {toastItem.description && (
                  <div className={`text-sm ${styles.descColor}`}>
                    {toastItem.description}
                  </div>
                )}
              </div>

              <button
                onClick={() => dismiss(toastItem.id)}
                type="button"
                className={`flex-shrink-0 rounded-md p-1 transition-colors ${styles.closeHover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400`}
                aria-label="Close notification"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-200/50">
              <div
                className={`h-full ${styles.progressBg} transition-all ease-linear`}
                style={{
                  animation: `shrink ${TOAST_LIFETIME}ms linear forwards`,
                }}
              />
            </div>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
