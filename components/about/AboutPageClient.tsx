"use client"; // Client component for animations

import Image from "next/image";
import { motion } from "framer-motion";
import { aboutPage, values } from "@/data/about";
import { containerVariants, itemVariants } from "@/constants/animations";
import { AboutCTA } from "@/components/about/AboutCTA";
import { useDevControlsStore } from "@/components/common/store/useDevControlsStore";

// --- NEW: The Values Grid Component ---
function ValuesGrid({
  variant = "valuesGridFlat",
}: {
  variant?: "valuesGridFlat" | "valuesGridPremium";
}) {
  const isPremium = variant === "valuesGridPremium";

  return (
    <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-3">
      {values.map((value) => (
        <motion.div
          variants={itemVariants}
          key={value.title}
          className="group flex flex-col items-center text-center md:items-start md:text-left"
        >
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ${
                isPremium
                  ? "border-slate-700 bg-slate-800/50 text-sky-400 group-hover:border-sky-500/50 group-hover:bg-slate-800 group-hover:shadow-lg group-hover:shadow-sky-500/5"
                  : "border-slate-700 bg-slate-800 text-sky-300 group-hover:scale-[1.02] group-hover:border-sky-500/30 group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.4),0_0_30px_rgba(56,189,248,0.15)]"
              }`}
            >
              <value.icon className="h-6 w-6" />
            </div>
            <h3 className="font-heading text-xl font-semibold leading-tight text-slate-100">
              {value.title}
            </h3>
          </div>
          <p className="mt-2 text-sm text-slate-400">{value.description}</p>
        </motion.div>
      ))}
    </div>
  );
}

{
  /** TODO: 
  - ideas: photo gallery, books read, spotify integration, links, CTA to connect,
  more prominent socials here. */
}
export function AboutPageClient() {
  const { selectedAboutValuesGrid } = useDevControlsStore();

  return (
    <motion.div
      className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        variants={itemVariants}
        className="font-heading text-4xl font-bold text-slate-50"
      >
        About Me
      </motion.h1>
      <motion.p variants={itemVariants} className="mt-4 text-lg text-slate-300">
        {aboutPage.description}
      </motion.p>

      {/* Values Grid */}
      <div className="mb-12">
        <ValuesGrid variant={selectedAboutValuesGrid} />
      </div>

      <motion.div
        variants={itemVariants}
        className="my-12 w-full max-w-3xl mx-auto h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"
      />

      <div className="mb-16">
        <motion.section
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center gap-12 md:flex-row"
        >
          <div className="md:w-1/2">
            <h2 className="font-heading text-2xl font-semibold text-slate-100">
              {aboutPage.sectionOne.title}
            </h2>
            <p className="mt-4 text-slate-300">
              {aboutPage.sectionOne.content}
            </p>
          </div>
          <div className="md:w-1/2 overflow-hidden rounded-lg">
            <Image
              src={aboutPage.sectionOne.image}
              alt="An image from my gallery"
              width={600}
              height={400}
              className="rounded-lg shadow-lg w-full h-auto object-cover transition-shadow duration-500 hover:shadow-sky-500/20"
            />
          </div>
        </motion.section>

        {/* Section divider line for between sections */}
        <div className="my-12 w-full max-w-lg mx-auto h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

        <motion.section
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center gap-12 md:flex-row-reverse"
        >
          <div className="md:w-1/2">
            <h2 className="font-heading text-2xl font-semibold text-slate-100">
              {aboutPage.sectionTwo.title}
            </h2>
            <p className="mt-4 text-slate-300">
              {aboutPage.sectionTwo.content}
            </p>
          </div>
          <div className="md:w-1/2 overflow-hidden rounded-lg">
            <Image
              src={aboutPage.sectionTwo.image}
              alt="An image from my gallery"
              width={600}
              height={400}
              className="rounded-lg shadow-lg w-full h-auto object-cover transition-shadow duration-500 hover:shadow-sky-500/20"
            />
          </div>
        </motion.section>
        {/* Place this div between your sections */}
        <div className="my-12 w-full max-w-lg mx-auto h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        <motion.section
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center gap-12 md:flex-row"
        >
          <div className="md:w-1/2">
            <h2 className="font-heading text-2xl font-semibold text-slate-100">
              {aboutPage.sectionThree.title}
            </h2>
            <p className="mt-4 text-slate-300">
              {aboutPage.sectionThree.content}
            </p>
          </div>
          <div className="md:w-1/2 overflow-hidden rounded-lg">
            <Image
              src={aboutPage.sectionThree.image}
              alt="An image from my gallery"
              width={600}
              height={400}
              className="rounded-lg shadow-lg w-full h-auto object-cover transition-shadow duration-500 hover:shadow-sky-500/20"
            />
          </div>
        </motion.section>

        {/* Section divider line for between sections */}
        <div className="my-12 w-full max-w-lg mx-auto h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

        {/* CTA Section */}
        <AboutCTA
          sectionData={{
            vitae: {
              title: aboutPage.ctaSection.vitae.title,
              description: aboutPage.ctaSection.vitae.description,
              linkText: aboutPage.ctaSection.vitae.linkText,
              href: aboutPage.ctaSection.vitae.href,
            },
            contact: {
              title: aboutPage.ctaSection.contact.title,
              description: aboutPage.ctaSection.contact.description,
              linkText: aboutPage.ctaSection.contact.linkText,
              href: aboutPage.ctaSection.contact.href,
            },
          }}
        />
      </div>
    </motion.div>
  );
}
