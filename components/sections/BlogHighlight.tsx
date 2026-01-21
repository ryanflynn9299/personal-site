import Link from "next/link";
import Image from "next/image";
import { getPublishedPosts } from "@/lib/directus";
import { ArrowRight } from "lucide-react";
import { getBlogPostUrl, formatDate } from "@/lib/utils";

// Simple list of recent blog posts
export async function BlogHighlight() {
  // Fetch all posts and take only the latest three for the homepage.
  const { posts } = await getPublishedPosts();
  const latestPosts = posts.slice(0, 4);
  // Separate the most recent post from the other two.
  const mainPost = latestPosts[0];
  const secondaryPosts = latestPosts.slice(1);

  return (
    <section className="py-20 md:py-28 border-t border-slate-800 bg-slate-950">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold text-slate-50">
            From the Void
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Signals and discoveries from my ongoing explorations in technology.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          {/* Main Post - The "Primary Signal" */}
          {mainPost && (
            <div className="lg:col-span-2">
              <PostCard post={mainPost} isFeatured={true} />
            </div>
          )}

          {/* Secondary Posts - The "Echoes" */}
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:mt-0 lg:flex lg:flex-col">
            {secondaryPosts.map((post) => (
              <PostCard key={post.id} post={post} isFeatured={false} />
            ))}
          </div>
        </div>

        {/* Call to Action - The "Trajectory" */}
        <div className="mt-16 text-center">
          <Link
            href="/blog"
            className="group inline-flex items-center text-lg font-medium text-sky-300 transition-colors hover:text-sky-200"
          >
            <span>View All Transmissions</span>
            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// A reusable PostCard component specifically for this section
function PostCard({ post, isFeatured }: { post: any; isFeatured: boolean }) {
  const formattedDate = formatDate(post.publish_date, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={getBlogPostUrl(post.slug)}
      className="group relative block h-full overflow-hidden rounded-lg border border-slate-700 bg-slate-800 transition-all duration-300 hover:border-sky-300/50 hover:shadow-2xl hover:shadow-sky-900/50"
    >
      {/* Subtle animated grid background on hover */}
      <div
        className="absolute inset-0 z-0 h-full w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        {isFeatured && post.feature_image && (
          <div className="relative h-64 w-full">
            <Image
              src={post.feature_image}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex flex-1 flex-col p-6">
          <p className="text-sm text-slate-400">{formattedDate}</p>
          <h3
            className={`font-heading font-semibold text-slate-50 ${isFeatured ? "text-2xl mt-2" : "text-lg mt-1"}`}
          >
            {post.title}
          </h3>
          <p
            className={`mt-3 text-slate-300 ${isFeatured ? "flex-grow" : "text-sm"}`}
          >
            {post.summary}
          </p>
          <div className="mt-4 text-sm font-medium text-sky-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Read Signal &rarr;
          </div>
        </div>
      </div>
    </Link>
  );
}
