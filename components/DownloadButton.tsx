"use client";

import { Button } from "@/components/primitives/Button";
import { Download } from "lucide-react";
import { trackDownload } from "@/components/Matomo";

interface DownloadButtonProps {
  href: string;
  download?: string;
  children: React.ReactNode;
}

export function DownloadButton({
  href,
  download,
  children,
}: DownloadButtonProps) {
  const handleClick = () => {
    // Extract filename from href or download prop
    const fileName = download || href.split("/").pop() || "file";
    trackDownload(fileName, "PDF");
  };

  return (
    <Button asChild>
      <a href={href} download={download} onClick={handleClick}>
        {children}
      </a>
    </Button>
  );
}
