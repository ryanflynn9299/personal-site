// Server Component - can use Client Components (MagicBento4) as children
import { MagicBento4 } from "@/components/sections/MagicBento4";

// An advanced component combining the animations of TechStack2 with the
// thematic styling, proportions, and interactive grid logic of TechStack3.
export function TechStack4() {
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
        <MagicBento4 />
      </div>
    </section>
  );
}
