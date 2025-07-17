import {TechStack} from "@/components/home/TechStack";
import {FinalCTA} from "@/components/home/FinalCTA";
import {AboutMe2} from "@/components/home/AboutMe2";
import {ProjectCarousel} from "@/components/home/ProjectCarousel";
import {HeroSection} from "@/components/home/HeroSection";

/* Unused swappable components */
import {AboutMe1} from "@/components/home/AboutMe1";
import {FeaturedProjects} from "@/components/home/FeaturedProjects";

export default function HomePage() {
    return (
        // Remove the outer container to allow sections to have full-width backgrounds.
        <>
            {/* Hero Section */}
            <HeroSection />

            {/* About Me Snippet - Contained within its own component/section */}
            {/*<AboutMe1 />*/}
            <AboutMe2 />

            {/* The Project Showcase area: either Carousel or Bento-box style */}
            <ProjectCarousel />
            {/*<FeaturedProjects />*/}

            {/* TechStack: A grid of my skills and tooling */}
            <TechStack />

            {/* Latest Blog Posts Placeholder - contains 3-5 blog posts either latest or highly rated */}
            <section className="py-20 md:py-28 border-t border-slate-800">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-center font-heading text-3xl font-bold text-slate-50">
                        From the Blog
                    </h2>
                    <p className="text-center mt-4 text-slate-400">
                        Latest articles and thoughts on technology and development.
                    </p>
                    <div className="mt-12">
                        {/* Placeholder for fetching and displaying latest 3 blog posts */}
                        <p className="text-center text-slate-500">
                            [Under Construction: Latest blog posts will be dynamically loaded here. Check back soon!]
                        </p>
                    </div>
                </div>
            </section>

            {/* A call to connect at the bottom of the home page */}
            <FinalCTA />
        </>
    );
}