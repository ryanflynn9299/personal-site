"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/primitives/Button";
import Link from "next/link";
import Image from "next/image";

{
  /* About Me Snippet - Option 2: Split-Layout with Image */
}
export function AboutMe2() {
  return (
    <section className="py-16 md:py-24 border-t border-slate-800">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
          {/* Image Column */}
          <div className="relative order-first md:order-last">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                // Replace with a professional-looking photo of yourself
                src="/images/6858504.png"
                alt="Placeholder: A professional headshot"
                width={500}
                height={500}
                className="rounded-lg object-cover shadow-2xl shadow-slate-950/50"
              />
            </motion.div>
          </div>

          {/* Text Column */}
          <div className="text-left">
            <h2 className="font-heading text-3xl font-bold text-slate-50 sm:text-4xl">
              Driven by Curiosity and Craft
            </h2>
            {/* TODO: revise this text */}
            <p className="mt-6 text-lg text-slate-300 leading-relaxed">
              I&apos;m a software engineer who thrives on turning complex problems
              into elegant, user-centric solutions. With a foundation in modern
              web technologies and a deep appreciation for clean code, I focus
              on building applications that are both powerful and delightful to
              use.
            </p>
            <p className="mt-4 text-lg text-slate-300 leading-relaxed">
              My goal is to not just write code, but to craft digital
              experiences that make a tangible impact.
            </p>
            <div className="mt-8">
              <Button asChild variant="outline">
                <Link href="/about">More About My Journey</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
