"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHasMounted } from "@/lib/hooks/useHasMounted";
import type { ToastProps } from "@/types/components";
import { toastBaseClasses, toastTypeClasses } from "@/constants/ui";

const toastIcons = {
  success: <CheckCircle className="h-6 w-6 text-green-400" />,
  error: <AlertTriangle className="h-6 w-6 text-red-400" />,
  info: <Info className="h-6 w-6 text-sky-400" />,
};

export function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onDismiss,
}: ToastProps) {
  const hasMounted = useHasMounted();

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  if (!hasMounted) {
    return (
      <div className={cn(toastBaseClasses, toastTypeClasses[type], "mt-4")}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">{toastIcons[type]}</div>
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
    </div>
  );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(toastBaseClasses, toastTypeClasses[type], "mt-4")}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">{toastIcons[type]}</div>
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
