import type { Metadata } from "next";
import { PoliciesPage } from "@/components/PoliciesPage";
import { loadAllPolicies } from "@/lib/policy-loader";
import { mapTabToPolicyId } from "@/lib/policy-colors";

export const metadata: Metadata = {
  title: "Policies",
  description: "Privacy Policy and Terms of Service for Ryan Flynn's personal website",
};

interface PoliciesPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function PoliciesIndexPage({ searchParams }: PoliciesPageProps) {
  const policies = loadAllPolicies();
  const params = await searchParams;
  const tabParam = params.tab || null;
  const initialTab = mapTabToPolicyId(tabParam);

  return <PoliciesPage policies={policies} initialTab={initialTab} />;
}

