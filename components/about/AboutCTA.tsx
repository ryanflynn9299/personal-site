"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Mail, ArrowRight } from "lucide-react";
import { itemVariants } from "@/constants/animations";

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 mb-24">
      {/* Vitae Card */}
      <motion.div variants={itemVariants} className="flex">
        <Link
          href={vitae.href}
          className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/50 p-8 transition-all duration-300 hover:border-sky-500/50 hover:bg-slate-800 hover:shadow-lg hover:shadow-sky-500/5 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
        >
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-4 flex items-center gap-4">
              <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <FileText className="h-6 w-6" />
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
          <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 transform-gpu rounded-full bg-sky-500/20 opacity-40 blur-3xl transition-all duration-500 ease-out group-hover:scale-150 group-hover:opacity-100" />
        </Link>
      </motion.div>

      {/* Contact Card */}
      <motion.div variants={itemVariants} className="flex">
        <Link
          href={contact.href}
          className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/50 p-8 transition-all duration-300 hover:border-blue-500/50 hover:bg-slate-800 hover:shadow-lg hover:shadow-blue-500/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-4 flex items-center gap-4">
              <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Mail className="h-6 w-6" />
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
          <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 transform-gpu rounded-full bg-blue-500/20 opacity-40 blur-3xl transition-all duration-500 ease-out group-hover:scale-150 group-hover:opacity-100" />
        </Link>
      </motion.div>
    </div>
  );
}
