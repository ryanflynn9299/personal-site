import { Button } from "@/components/primitives/Button";
import Link from "next/link";
import { AnimatedText } from "@/components/common/AnimatedText";

export function HeroSection() {
  return (
    <section className="py-24 text-center md:py-32">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedText
          text="Building Digital Experiences"
          animationType="cascade-letters" // Options: "stagger-words", "cascade-letters", "decode"
          className="font-heading text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl md:text-6xl"
        />
        {/*<h1 className="font-heading text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl md:text-6xl">*/}
        {/*    Building Digital Experiences*/}
        {/*</h1>*/}
        <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-300 md:text-xl">
          Welcome to my corner of the web. I&apos;m a software engineer
          specializing in backend development, passionate about creating
          performant, accessible, and maximally usable applications.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Button asChild size="lg">
            <Link href="/vitae">View My Vitae</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/blog">Explore My Blog</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
