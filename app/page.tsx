import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function HomePage() {
  return (
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-24 text-center md:py-32">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl md:text-6xl">
            Building Digital Experiences
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-300 md:text-xl">
            Welcome to my corner of the web. I&#39;m a software engineer specializing in modern web technologies, passionate about creating performant, accessible, and beautiful applications.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Button asChild size="lg">
              <Link href="/vitae">View My Vitae</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/blog">Explore My Blog</Link>
            </Button>
          </div>
        </section>

        {/* About Me Snippet */}
        <section className="py-16 md:py-24 border-t border-slate-800">
          {/*... Brief "About Me" snippet content... */}
        </section>

        {/* Latest Blog Posts Placeholder */}
        <section className="py-16 md:py-24 border-t border-slate-800">
          <h2 className="text-center font-heading text-3xl font-bold text-slate-50">
            From the Blog
          </h2>
          <p className="text-center mt-4 text-slate-400">
            Latest articles and thoughts on technology and development.
          </p>
          <div className="mt-12">
            {/* Placeholder for fetching and displaying latest 3 blog posts */}
            <p className="text-center text-slate-500">
              [Latest blog posts will be dynamically loaded here.]
            </p>
          </div>
        </section>
      </div>
  );
}