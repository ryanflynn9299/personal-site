import Link from "next/link";
import { Button } from "@/components/primitives/Button";

export function FinalCTA() {
  return (
    <section className="border-t border-slate-800 py-16 motion-safe:animate-fade-in md:py-24">
      <div className="container mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          Let&apos;s Build Something Together
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
          I&apos;m always open to discussing new projects, creative ideas, or
          opportunities to be part of an ambitious vision.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
