"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  id: number;
  type: "success" | "error" | "info";
  title: string;
  message?: string;
  duration?: number;
  onDismiss: (id: number) => void;
}

const icons = {
  success: <CheckCircle className="h-6 w-6 text-green-400" />,
  error: <AlertTriangle className="h-6 w-6 text-red-400" />,
  info: <Info className="h-6 w-6 text-sky-400" />,
};

const baseClasses =
  "relative w-full overflow-hidden rounded-lg border p-4 shadow-lg backdrop-blur-md";
const typeClasses = {
  success: "border-green-500/50 bg-green-500/10 text-green-200",
  error: "border-red-500/50 bg-red-500/10 text-red-200",
  info: "border-sky-500/50 bg-sky-500/10 text-sky-200",
};

export function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onDismiss,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(baseClasses, typeClasses[type], "mt-4")}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="flex-1">
          <p className="font-semibold text-slate-50">{title}</p>
          {message && <p className="mt-1 text-sm text-slate-300">{message}</p>}
        </div>
        <button
          onClick={() => onDismiss(id)}
          className="flex-shrink-0 text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
}
