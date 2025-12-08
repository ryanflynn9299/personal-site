import Link from "next/link";
import { getPublishedPosts, isDirectusConfigured } from "@/lib/directus";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceUnavailableWithDevMode } from "@/components/ui/DevModeIndicator";

// 2x2 Horizontal Grid of Recent Blog Posts
export async function BlogHighlight4() {
  // Fetch all posts and take only the latest four for the 2x2 grid.
  const { status, posts } = await getPublishedPosts();
  const latestPosts = posts.slice(0, 4);

  return (
    <section className="py-20 md:py-28 border-t border-slate-800">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* UPDATED: New, more professional and grounded copy */}
          <h2 className="font-heading text-3xl font-bold text-slate-50">
            Recent Writings
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            A few posts from my recent endeavors to document my learnings and
            organize my thoughts.
          </p>
        </div>

        {/* The 2x2 Grid Layout */}
        {/* --- NEW: Conditional Rendering Logic --- */}
        <div className="mt-16">
          {status === "error" || !isDirectusConfigured() ? (
            // If the service is down or not configured, render the error component
            <div className="lg:max-w-5xl lg:mx-auto">
              <ServiceUnavailableWithDevMode />
            </div>
          ) : latestPosts.length > 0 ? (
            // If successful and posts exist, render the grid
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:max-w-5xl lg:mx-auto">
              {latestPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            // If successful but no posts, render a "no content" message
            <p className="text-center text-slate-400">
              No recent articles found. Check back soon!
            </p>
          )}
        </div>

        {/* The Call to Action */}
        <div className="mt-16 text-center">
          <Link
            href="/blog"
            className="group inline-flex items-center text-lg font-medium text-sky-300 transition-colors hover:text-sky-200"
          >
            <span>Explore All Articles</span>
            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// A new, text-focused PostCard component for this section
function PostCard({ post }: { post: any }) {
  const formattedDate = new Date(post.publish_date).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  );

  return (
    <Link
      href={`/blog/${post.slug}`}
      // The `group` class enables the hover effects on child elements.
      className="group relative block overflow-hidden rounded-lg border border-slate-700 bg-slate-800 p-6
                 transition-colors duration-300 hover:bg-slate-700/50"
    >
      {/* The "HUD Scanline" Effect */}
      <div
        className="absolute top-0 left-0 h-full w-1/2
                   bg-gradient-to-r from-transparent via-sky-300/10 to-transparent
                   -translate-y-full transform-gpu transition-transform duration-100 ease-in-out group-hover:translate-y-0"
      />

      <div className="relative z-10 flex h-full flex-col">
        {/* Metadata section with a high-tech, monospace font feel */}
        <p className="font-mono text-xs text-slate-400">
          // TRANSMISSION DATE: {formattedDate}
        </p>

        {/* Main content */}
        <h3 className="mt-4 font-heading text-xl font-semibold text-slate-50 transition-colors duration-300 group-hover:text-sky-300">
          {post.title}
        </h3>
        <p className="mt-3 flex-grow text-sm text-slate-300 line-clamp-3">
          {post.summary}
        </p>

        {/* The in-card CTA, correctly placed at the bottom */}
        <div className="mt-4 flex items-center text-sm font-medium text-sky-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span>Read Article</span>
          <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
