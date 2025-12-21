"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { PseudoMarkdownRenderer } from "@/components/common/PseudoMarkdownRenderer";
import { getPolicyColorTheme } from "@/lib/policy-colors";
import type { PolicyMetadata } from "@/types/policies";

// Ensure Tailwind generates these classes: text-purple-400 text-sky-400 bg-purple-600/20 bg-sky-600/20 border-purple-500/50 border-sky-500/50

interface Policy {
  id: string;
  name: string;
  metadata: PolicyMetadata;
  content: string;
}

interface PoliciesPageProps {
  policies: Policy[];
  initialTab?: string;
}

export function PoliciesPage({ policies, initialTab }: PoliciesPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contentRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Determine initial active policy
  const getInitialPolicyId = () => {
    if (initialTab) return initialTab;
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const mapping: Record<string, string> = {
        privacy: "privacy-policy",
        terms: "terms-of-service",
      };
      return mapping[tabParam] || policies[0]?.id || "";
    }
    return policies[0]?.id || "";
  };

  const [activePolicyId, setActivePolicyId] = useState(getInitialPolicyId);

  const activePolicy =
    policies.find((p) => p.id === activePolicyId) || policies[0];

  // Get theme colors based on the ACTIVE policy, not individual tabs
  const activeTheme = activePolicy
    ? getPolicyColorTheme(activePolicy.id)
    : getPolicyColorTheme("privacy-policy");

  // Update URL when tab changes
  const handleTabChange = (policyId: string) => {
    setActivePolicyId(policyId);

    // Map policy ID to tab param
    const tabMapping: Record<string, string> = {
      "privacy-policy": "privacy",
      "terms-of-service": "terms",
    };
    const tabParam = tabMapping[policyId];

    if (tabParam) {
      router.push(`/policies?tab=${tabParam}`, { scroll: false });
    } else {
      router.push("/policies", { scroll: false });
    }

    // Scroll to top of content area
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }

    // Focus the newly active tab for accessibility
    const activeTabButton = tabRefs.current.get(policyId);
    if (activeTabButton) {
      activeTabButton.focus();
    }
  };

  // Keyboard navigation for tabs
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let newIndex = currentIndex;

    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      newIndex = (currentIndex + 1) % policies.length;
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      newIndex = (currentIndex - 1 + policies.length) % policies.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      newIndex = policies.length - 1;
    }

    if (newIndex !== currentIndex) {
      handleTabChange(policies[newIndex].id);
    }
  };

  if (!activePolicy) {
    return null;
  }

  return (
    <div className="relative min-h-[calc(100vh-8rem)] bg-slate-900">
      {/* Space-themed background */}
      <div className="absolute inset-0">
        <div className="stars stars-1"></div>
        <div className="stars stars-2"></div>
        <div className="stars stars-3"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-12rem)] lg:h-[calc(100vh-12rem)]">
          {/* Left Column - Tab Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-8">
              <h2 className="font-heading text-xl font-bold text-slate-50 mb-4">
                Policies
              </h2>
              <nav
                className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0"
                role="tablist"
                aria-label="Policy documents"
              >
                {policies.map((policy, index) => {
                  const isActive = activePolicyId === policy.id;

                  // Use the active policy's theme for styling the active tab
                  // This ensures colors match the displayed content
                  const activeTabTheme = isActive ? activeTheme : null;

                  return (
                    <button
                      key={policy.id}
                      ref={(el) => {
                        if (el) {
                          tabRefs.current.set(policy.id, el);
                        } else {
                          tabRefs.current.delete(policy.id);
                        }
                      }}
                      onClick={() => handleTabChange(policy.id)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className={`flex-shrink-0 lg:w-full text-left px-4 py-3 rounded-lg transition-all duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:z-10 ${
                        isActive && activeTabTheme
                          ? `policies-tab-active ${activeTabTheme.text} ${activeTabTheme.bg} border ${activeTabTheme.border} shadow-lg ${activeTabTheme.shadow} ${activeTabTheme.focusRing}`
                          : "bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-slate-50 border border-slate-700/50 focus:ring-slate-500"
                      }`}
                      aria-selected={isActive}
                      role="tab"
                      aria-controls={`policy-content-${policy.id}`}
                      id={`policy-tab-${policy.id}`}
                      tabIndex={isActive ? 0 : -1}
                    >
                      <span className="font-sans font-medium">
                        {policy.name}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Right Column - Document Viewer */}
          <main className="flex-1 min-w-0 flex flex-col min-h-0">
            <div className="pseudo-markdown-editor flex-1 bg-slate-800/60 backdrop-blur-sm rounded-lg border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col min-h-0">
              {/* Document Header */}
              <header className="border-b border-slate-700/50 px-6 py-4 bg-slate-800/80">
                <h1 className="font-sans text-2xl font-bold text-slate-50">
                  {activePolicy.metadata.title}
                </h1>
                <p className="font-sans text-sm text-slate-400 mt-1">
                  Last Updated: {activePolicy.metadata.lastUpdated}
                </p>
              </header>

              {/* Document Content */}
              <div
                ref={contentRef}
                className="flex-1 overflow-y-auto px-6 py-8"
                id={`policy-content-${activePolicyId}`}
                role="tabpanel"
                aria-labelledby={`policy-tab-${activePolicyId}`}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePolicyId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="document-transition"
                  >
                    <PseudoMarkdownRenderer
                      content={activePolicy.content}
                      themeColor={activeTheme}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
