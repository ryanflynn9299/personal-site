"use client"; // Client component for animations

import Image from "next/image";
import { motion } from "framer-motion";
import { aboutPage, values } from "@/data/about";
import { containerVariants, itemVariants } from "@/constants/animations";
import { AboutCTA } from "@/components/about/AboutCTA";

// --- NEW: The Values Grid Component ---
function ValuesGrid() {
  return (
    <motion.div
      variants={itemVariants}
      className="mt-8 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-3"
    >
      {values.map((value) => (
        <div
          key={value.title}
          className="group flex flex-col items-center text-center md:items-start md:text-left"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-sky-300 transition-colors duration-300 group-hover:border-sky-300/50 group-hover:bg-slate-700">
              <value.icon className="h-6 w-6" />
            </div>
            <h3 className="font-heading text-xl font-semibold leading-tight text-slate-100">
              {value.title}
            </h3>
          </div>
          <p className="mt-2 text-sm text-slate-400">{value.description}</p>
        </div>
      ))}
    </motion.div>
  );
}

{
  /** TODO: 
  - ideas: photo gallery, books read, spotify integration, links, CTA to connect,
  more prominent socials here. */
}
export function AboutPageClient() {
  return (
    <motion.div
      className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h1 className="font-heading text-4xl font-bold text-slate-50">
        About Me
      </h1>
      <p className="mt-4 text-lg text-slate-300">{aboutPage.description}</p>
      {/* UPDATED: The static subtitle <p> tag is replaced with the new ValuesGrid component */}
      <div className="mb-24">
        <ValuesGrid />
      </div>

      <div className="mt-16 space-y-16 mb-16">
        <motion.section
          variants={itemVariants}
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
          <div className="md:w-1/2">
            <Image
              src={aboutPage.sectionOne.image}
              alt="An image from my gallery"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </motion.section>

        {/* Section divider line for between sections */}
        <div className="w-full max-w-lg mx-auto h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

        <motion.section
          variants={itemVariants}
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
          <div className="md:w-1/2">
            <Image
              src={aboutPage.sectionTwo.image}
              alt="An image from my gallery"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </motion.section>
        {/* Place this div between your sections */}
        <div className="w-full max-w-lg mx-auto h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        <motion.section
          variants={itemVariants}
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
          <div className="md:w-1/2">
            <Image
              src={aboutPage.sectionThree.image}
              alt="An image from my gallery"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </motion.section>

        {/* Section divider line for between sections */}
        <div className="w-full max-w-lg mx-auto h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

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
