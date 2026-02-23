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

  const arrowVariants = {
    initial: { x: 0 },
    hover: { x: 4 },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 mb-24">
      {/* Vitae Card */}
      <motion.div
        variants={itemVariants}
        whileHover="hover"
        className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/50 p-8 hover:border-sky-500/50 hover:bg-slate-800 transition-colors duration-300 cursor-pointer"
        onClick={() => window.open(vitae.href, "_self")}
      >
        <div className="relative z-10 flex flex-col h-full pointer-events-none">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform duration-300">
            <FileText className="h-6 w-6" />
          </div>

          <h3 className="mb-3 text-2xl font-bold text-slate-100 font-heading">
            {vitae.title}
          </h3>

          <p className="mb-8 text-slate-400 leading-relaxed flex-grow">
            {vitae.description}
          </p>

          <div className="inline-flex items-center gap-2 text-sky-400 font-semibold group-hover:text-sky-300 transition-colors">
            {vitae.linkText}
            <motion.span
              variants={arrowVariants}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ArrowRight className="h-4 w-4" />
            </motion.span>
          </div>
        </div>

        {/* Background gradient effect */}
        <div className="absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl group-hover:bg-sky-500/20 transition-all duration-500 pointer-events-none" />

        {/* Full card link overlay for accessibility/SEO, distinct from the onClick handler */}
        <Link
          href={vitae.href}
          className="absolute inset-0 z-20"
          aria-label={vitae.title}
        />
      </motion.div>

      {/* Contact Card */}
      <motion.div
        variants={itemVariants}
        whileHover="hover"
        className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/50 p-8 hover:border-blue-500/50 hover:bg-slate-800 transition-colors duration-300 cursor-pointer"
        onClick={() => window.open(contact.href, "_self")}
      >
        <div className="relative z-10 flex flex-col h-full pointer-events-none">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform duration-300">
            <Mail className="h-6 w-6" />
          </div>

          <h3 className="mb-3 text-2xl font-bold text-slate-100 font-heading">
            {contact.title}
          </h3>

          <p className="mb-8 text-slate-400 leading-relaxed flex-grow">
            {contact.description}
          </p>

          <div className="inline-flex items-center gap-2 text-blue-400 font-semibold group-hover:text-blue-300 transition-colors">
            {contact.linkText}
            <motion.span
              variants={arrowVariants}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ArrowRight className="h-4 w-4" />
            </motion.span>
          </div>
        </div>

        {/* Background gradient effect */}
        <div className="absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-all duration-500 pointer-events-none" />

        {/* Full card link overlay */}
        <Link
          href={contact.href}
          className="absolute inset-0 z-20"
          aria-label={contact.title}
        />
      </motion.div>
    </div>
  );
}
