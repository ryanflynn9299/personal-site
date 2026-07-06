"use client";

import { useEffect } from "react";
import { Home, RefreshCw } from "lucide-react";
import { SpaceThemedStatusPage } from "@/components/common/SpaceThemedStatusPage";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <SpaceThemedStatusPage
      title="Oops! Something went wrong"
      description="A critical system fault interrupted this page. Our crew is on it — try again, or head back to home base."
      actions={[
        {
          label: "Try Again",
          onClick: reset,
          icon: RefreshCw,
        },
        {
          label: "Return to Home Base",
          href: "/",
          variant: "outline",
          icon: Home,
        },
      ]}
    />
  );
}
