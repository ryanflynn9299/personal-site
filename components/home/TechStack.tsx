'use client';

import { motion } from 'framer-motion';
import { Code, Database, Cloud, Cog } from 'lucide-react';

const techCategories = [
    {
        name: "Languages & Frameworks",
        icon: Code,
        items: ["TypeScript", "React", "Next.js", "Node.js", "Python", "Go"],
        className: "md:col-span-2 md:row-span-2"
    },
    {
        name: "Databases",
        icon: Database,
        items: ["PostgreSQL", "MongoDB", "Redis"],
        className: "md:col-span-1"
    },
    {
        name: "Cloud & DevOps",
        icon: Cloud,
        items: ["Docker", "AWS", "Nginx", "Vercel"],
        className: "md:col-span-1"
    },
    {
        name: "Tooling",
        icon: Cog,
        items: ["Git", "Directus (CMS)", "Tailwind CSS", "Framer Motion"],
        className: "md:col-span-2"
    }
];

const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.5,
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
};

export function TechStack() {
    return (
        <section className="py-16 md:py-24 border-t border-slate-800 bg-slate-950">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="font-heading text-3xl font-bold text-slate-50 sm:text-4xl">
                        My Tech Stack
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
                        The tools and technologies I use to bring ideas to life.
                    </p>
                </div>
                <motion.div
                    className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3"
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {techCategories.map((category) => (
                        <motion.div
                            key={category.name}
                            className={`rounded-lg border border-slate-700 bg-slate-800 p-6 ${category.className}`}
                            variants={itemVariants}
                        >
                            <div className="flex items-center gap-4">
                                <category.icon className="h-8 w-8 text-sky-300" />
                                <h3 className="font-heading text-xl font-semibold text-slate-50">{category.name}</h3>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {category.items.map((item) => (
                                    <span key={item} className="rounded-md bg-slate-700 px-2.5 py-1 text-sm font-medium text-slate-200">
                    {item}
                  </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}