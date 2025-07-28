import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
    title: "About Me",
    description: "Beyond the code, here's a little more about who I am.",
};

const aboutPage = {
    title: "About Me",
    description: "Learn more about Ryan Flynn's passions, interests, and professional journey.",
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

export default function AboutPage() {
    return (
        <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="font-heading text-4xl font-bold text-slate-50">About Me</h1>
            <p className="mt-4 text-lg text-slate-300">
                {aboutPage.description}
            </p>

            <div className="mt-16 space-y-24">
                {/* Section 1: Text Left, Image Right */}
                <section className="flex flex-col items-center gap-12 md:flex-row">
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
                </section>

                {/* Section 2: Image Left, Text Right */}
                <section className="flex flex-col items-center gap-12 md:flex-row-reverse">
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
                </section>

                {/* Section 3: Text Left, Image Right */}
                <section className="flex flex-col items-center gap-12 md:flex-row">
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
                </section>
            </div>
        </div>
    );
}