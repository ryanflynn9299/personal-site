import type { Metadata } from "next";
import { PoliciesPage } from "@/components/policies/PoliciesPage";
import { loadAllPolicies } from "@/lib/policy-loader";
import { mapTabToPolicyId } from "@/lib/policy-colors";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Policies",
  description:
    "Privacy Policy and Terms of Service for Ryan Flynn's personal website. Review our policies regarding privacy, terms of use, and data handling.",
  path: "/policies",
});

interface PoliciesPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function PoliciesIndexPage({
  searchParams,
}: PoliciesPageProps) {
  const policies = loadAllPolicies();
  const params = await searchParams;
  const tabParam = params.tab || null;
  const initialTab = mapTabToPolicyId(tabParam);

  return <PoliciesPage policies={policies} initialTab={initialTab} />;
}
