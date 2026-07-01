"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Mail, ArrowRight } from "lucide-react";
import { itemVariants, containerVariants } from "@/constants/animations";
import { useDevControlsStore } from "@/components/common/store/useDevControlsStore";

interface CTASectionData {
  title: string;
  description: string;
  linkText: string;
  href: string;
}

interface AboutCTAProps {
  sectionData: {
    vitae: CTASectionData;
    contact: CTASectionData;
  };
}

export function AboutCTA({ sectionData }: AboutCTAProps) {
  const { vitae, contact } = sectionData;
  const { selectedAboutCTA } = useDevControlsStore();

  const isPremium = selectedAboutCTA === "ctaPremium";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 mb-24"
    >
      {/* Vitae Card */}
      <motion.div variants={itemVariants} className="flex">
        <Link
          href={vitae.href}
          className={`group relative flex w-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500/50 p-6 sm:p-8 ${
            isPremium
              ? "border-slate-700 bg-slate-800/50 hover:border-sky-500/50 hover:bg-slate-800 hover:shadow-lg hover:shadow-sky-500/5"
              : "border-slate-700 bg-slate-800 hover:scale-[1.02] hover:border-sky-500/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4),0_0_30px_rgba(56,189,248,0.15)]"
          }`}
        >
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-4 flex items-center gap-4">
              <div
                className={`flex shrink-0 items-center justify-center transition-transform duration-300 ${
                  isPremium
                    ? "inline-flex h-12 w-12 rounded-lg bg-sky-500/10 text-sky-400 group-hover:scale-110 group-hover:-rotate-3"
                    : "text-sky-300 group-hover:text-sky-400"
                }`}
              >
                <FileText className={`h-6 w-6 ${!isPremium && "h-8 w-8"}`} />
              </div>
              <h3 className="font-heading text-2xl font-bold text-slate-100">
                {vitae.title}
              </h3>
            </div>

            <p className="mb-8 flex-grow leading-relaxed text-slate-400">
              {vitae.description}
            </p>

            <div className="inline-flex items-center gap-2 font-semibold text-sky-400 transition-colors duration-300 group-hover:text-sky-300">
              {vitae.linkText}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-sky-300" />
            </div>
          </div>

          {/* Background gradient effect */}
          {isPremium && (
            <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 transform-gpu rounded-full bg-sky-500/20 opacity-40 blur-3xl transition-all duration-500 ease-out group-hover:scale-150 group-hover:opacity-100" />
          )}
        </Link>
      </motion.div>

      {/* Contact Card */}
      <motion.div variants={itemVariants} className="flex">
        <Link
          href={contact.href}
          className={`group relative flex w-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 p-6 sm:p-8 ${
            isPremium
              ? "border-slate-700 bg-slate-800/50 hover:border-blue-500/50 hover:bg-slate-800 hover:shadow-lg hover:shadow-blue-500/5"
              : "border-slate-700 bg-slate-800 hover:scale-[1.02] hover:border-blue-500/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4),0_0_30px_rgba(59,130,246,0.15)]"
          }`}
        >
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-4 flex items-center gap-4">
              <div
                className={`flex shrink-0 items-center justify-center transition-transform duration-300 ${
                  isPremium
                    ? "inline-flex h-12 w-12 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 group-hover:rotate-3"
                    : "text-blue-300 group-hover:text-blue-400"
                }`}
              >
                <Mail className={`h-6 w-6 ${!isPremium && "h-8 w-8"}`} />
              </div>
              <h3 className="font-heading text-2xl font-bold text-slate-100">
                {contact.title}
              </h3>
            </div>

            <p className="mb-8 flex-grow leading-relaxed text-slate-400">
              {contact.description}
            </p>

            <div className="inline-flex items-center gap-2 font-semibold text-blue-400 transition-colors duration-300 group-hover:text-blue-300">
              {contact.linkText}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-300" />
            </div>
          </div>

          {/* Background gradient effect */}
          {isPremium && (
            <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 transform-gpu rounded-full bg-blue-500/20 opacity-40 blur-3xl transition-all duration-500 ease-out group-hover:scale-150 group-hover:opacity-100" />
          )}
        </Link>
      </motion.div>
    </motion.div>
  );
}
