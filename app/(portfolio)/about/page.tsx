'use client'; // This must be a client component for animations

import type { Metadata } from "next";
import Image from "next/image";
import {motion, Variants} from 'framer-motion';
import {Code, BookOpen, Users, type LucideProps, GitBranch} from 'lucide-react';


// TODO - Uncomment and set metadata for the About page
// export const metadata: Metadata = {
//     title: "About Me",
//     description: "Beyond the code, here's a little more about who I am.",
// };

const aboutPage = {
    title: "About Me",
    description: "Learn more about my values, background and interests.",
    sectionOne: {
            title: "My Philosophy",
            content: "I believe in the power of technology to solve real-world problems. My approach " +
                "to software development is rooted in craftsmanship, continuous learning, and a deep " +
                "commitment to user-centric design. I strive to write code that is not only functional " +
                "but also clean, maintainable, and elegant. A lifelong learning zealot, I struggle to " +
                "satiate my desire to learn every software tool out there.",
            image: "https://placehold.co/600x400/0f172a/7dd3fc", // Placeholder
        },
    sectionTwo: {
            title: "Interests & Hobbies",
            content: "When I'm not at my keyboard, you can find me exploring the great outdoors, " +
                "shredding the ski slopes, or finding new eats around New England. I'm endlessly " +
                "curious about the world and love to travel the world, from Canada and California " +
                "to Chile and Antarctica. Recently, I've read some interesting books like Zero to One by Peter Thiel and The Pragmatic Programmer by Andrew Hunt and David Thomas, which have inspired me to think differently about technology and software development. ",
            image: "https://placehold.co/600x400/0f172a/e2e8f0", // Placeholder
        },
    sectionThree: {
        title: "Project Work",
        content: "My project work stems from a strong drive to solve practical problems with technology. I enjoy taking on exploratory projects that let me delve into new concepts and emerging tech, always aiming to build effective solutions. " +
            "I sometimes leverage Large Language Models (LLMs) in my work, primarily for exploring new topics, surmounting blockages on complex topics, and significantly accelerating development cycles. I focus on applying these tools strategically to improve problem-solving and efficiency within my projects. " +
            "No matter the project or the tools I'm using, I stick to industry-standard tools and robust coding practices. I write code that is clean, maintainable, and performs well, making sure that all my projects, even the most experimental ones, are built on a solid and professional foundation.",
        image: "https://placehold.co/600x400/0f172a/7dd3fc", // Placeholder
    }
};

// Animation variants for the container and its children
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2, // This creates the sequential delay
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
};

const values = [
    {
        icon: Code,
        title: "Craftsmanship",
        description: "A commitment to writing clean, elegant, and maintainable code."
    },
    {
        icon: BookOpen,
        title: "Continuous Learning",
        description: "Driven by a passion for exploring new technologies and methodologies."
    },
    {
        icon: Users,
        title: "User-Focused",
        description: "Building applications that provide real-world value and a great user experience."
    }
];

// --- NEW: The Values Grid Component ---
function ValuesGrid() {
    return (
        <motion.div variants={itemVariants} className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-3">
            {values.map((value) => (
                <div key={value.title} className="group flex flex-col items-center text-center md:items-start md:text-left">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-sky-300 transition-colors duration-300 group-hover:border-sky-300/50 group-hover:bg-slate-700">
                            <value.icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-heading text-xl font-semibold leading-tight text-slate-100">
                            {value.title}
                        </h3>
                    </div>
                    <p className="mt-4 text-sm text-slate-400">{value.description}</p>
                </div>
            ))}
        </motion.div>
    );
}

export default function AboutPage() {
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
            <p className="mt-4 text-lg text-slate-300">
                {aboutPage.description}
            </p>
            {/* UPDATED: The static subtitle <p> tag is replaced with the new ValuesGrid component */}
            <div className="mb-24">
                <ValuesGrid/>
            </div>


            <div className="mt-16 space-y-24 mb-16">
                <motion.section variants={itemVariants} className="flex flex-col items-center gap-12 md:flex-row">
                    <div className="md:w-1/2">
                        <h2 className="font-heading text-2xl font-semibold text-slate-100">{aboutPage.sectionOne.title}</h2>
                        <p className="mt-4 text-slate-300">
                            {aboutPage.sectionOne.content}
                        </p>
                    </div>
                    <div className="md:w-1/2">
                        <Image
                            src={aboutPage.sectionOne.image}
                            alt="A symbolic image of a development philosophy"
                            width={600}
                            height={400}
                            className="rounded-lg shadow-lg"
                        />
                    </div>
                </motion.section>

                {/* Section divider line for between sections */}
                <div className="w-full max-w-lg mx-auto h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"/>

                <motion.section variants={itemVariants}
                                className="flex flex-col items-center gap-12 md:flex-row-reverse">
                    <div className="md:w-1/2">
                        <h2 className="font-heading text-2xl font-semibold text-slate-100">{aboutPage.sectionTwo.title}</h2>
                        <p className="mt-4 text-slate-300">
                            {aboutPage.sectionTwo.content}
                        </p>
                    </div>
                    <div className="md:w-1/2">
                        <Image
                            src={aboutPage.sectionTwo.image}
                            alt="A photo representing hobbies like hiking or photography"
                            width={600}
                            height={400}
                            className="rounded-lg shadow-lg"
                        />
                    </div>
                </motion.section>
                {/* Place this div between your sections */}
                <div
                    className="w-full max-w-lg mx-auto h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"/>
                <motion.section variants={itemVariants} className="flex flex-col items-center gap-12 md:flex-row">
                    <div className="md:w-1/2">
                        <h2 className="font-heading text-2xl font-semibold text-slate-100">{aboutPage.sectionThree.title}</h2>
                        <p className="mt-4 text-slate-300">
                            {aboutPage.sectionThree.content}
                        </p>
                    </div>
                    <div className="md:w-1/2">
                        <Image
                            src={aboutPage.sectionThree.image}
                            alt="A symbolic image of a development philosophy"
                            width={600}
                            height={400}
                            className="rounded-lg shadow-lg"
                        />
                    </div>
                </motion.section>
            </div>
        </motion.div>
    );
}