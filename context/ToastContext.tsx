"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { AnimatePresence } from "framer-motion";
import { Toast, ToastProps } from "@/components/primitives/Toast";

type ToastOptions = Omit<ToastProps, "id" | "onDismiss">;

interface ToastContextType {
  addToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastCount = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((options: ToastOptions) => {
    const id = toastCount++;
    const newToast: ToastProps = {
      ...options,
      id,
      onDismiss: (id) => removeToast(id),
    };
    setToasts((prevToasts) => [newToast, ...prevToasts]);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <Toaster toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  // Create a user-friendly API
  return {
    toast: {
      success: (title: string, message?: string) =>
        context.addToast({ type: "success", title, message }),
      error: (title: string, message?: string) =>
        context.addToast({ type: "error", title, message }),
      info: (title: string, message?: string) =>
        context.addToast({ type: "info", title, message }),
    },
  };
}

// --- The Toaster Renderer ---
function Toaster({ toasts }: { toasts: ToastProps[] }) {
  return (
    <div className="fixed bottom-0 right-4 z-[100] p-4 sm:bottom-4 sm:right-4 max-h-[50vh]">
      <div className="flex-col w-full max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
