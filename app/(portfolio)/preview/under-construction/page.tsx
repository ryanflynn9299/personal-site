import type { Metadata } from "next";
import { UnderConstructionPage } from "@/components/common/UnderConstructionPage";
import { PREVIEW_UNDER_CONSTRUCTION_ROUTE } from "@/lib/dev-tooling/preview-routes";

export const metadata: Metadata = {
  title: "Under Construction (Preview)",
  description: "Dev-only preview of the under construction placeholder page.",
  robots: { index: false, follow: false },
  alternates: { canonical: PREVIEW_UNDER_CONSTRUCTION_ROUTE },
};

export default function PreviewUnderConstructionPage() {
  return <UnderConstructionPage />;
}
