import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function AboutMe1() {
  return (
    <section className="py-16 md:py-24 border-t border-slate-800">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-heading text-3xl font-bold text-slate-50 sm:text-4xl">
          Driven by Curiosity and Craft
        </h2>
        <p className="mt-6 text-lg text-slate-300 leading-relaxed">
          I'm a software engineer who thrives on turning complex problems into
          elegant, user-centric solutions. With a foundation in modern web
          technologies and a deep appreciation for clean code, I focus on
          building applications that are both powerful and delightful to use. My
          goal is to not just write code, but to craft experiences.
        </p>
        <div className="mt-8">
          <Button asChild variant="outline">
            <Link href="/about">More About My Journey</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
