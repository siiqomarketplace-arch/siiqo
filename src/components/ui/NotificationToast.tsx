"use client";
import { useEffect } from "react";

export interface Notification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface NotificationToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

export default function NotificationToast({
  notification,
  onClose,
}: NotificationToastProps) {
  useEffect(() => {
    // Auto-dismiss after 3s
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const styles = {
    success: "bg-green-100 text-green-800 border-green-300",
    error: "bg-red-100 text-red-800 border-red-300",
    info: "bg-blue-100 text-blue-800 border-blue-300",
  };

  return (
    <div
      className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-md border ${
        styles[notification.type]
      } animate-slide-in`}
    >
      <div className="flex items-center justify-between space-x-4">
        <span className="text-sm font-medium">{notification.message}</span>
        <button
          onClick={() => onClose(notification.id)}
          className="text-xs hover:opacity-70"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
