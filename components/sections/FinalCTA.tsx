"use client";

import Link from "next/link";
import { Button } from "@/components/primitives/Button";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { motion } from "framer-motion";
import { useHasMounted } from "@/lib/hooks/useHasMounted";

export function FinalCTA() {
  const hasMounted = useHasMounted();

  if (!hasMounted) {
    return (
      <section className="py-16 md:py-24 border-t border-slate-800">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeader
            title="Let's Build Something Together"
            subtitle="I'm always open to discussing new projects, creative ideas, or opportunities to be part of an ambitious vision."
            titleClassName="tracking-tight"
          />
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      className="py-16 md:py-24 border-t border-slate-800"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7 }}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <SectionHeader
          title="Let's Build Something Together"
          subtitle="I'm always open to discussing new projects, creative ideas, or opportunities to be part of an ambitious vision."
          titleClassName="tracking-tight"
        />
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
