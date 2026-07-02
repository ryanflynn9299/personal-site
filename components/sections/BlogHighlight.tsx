import Link from "next/link";
import {
  getPublishedPosts,
  isDirectusConfigured,
} from "@/lib/services/directus";
import { ArrowRight } from "lucide-react";
import { ServiceUnavailableWithDevMode } from "@/components/common/DevModeIndicator";
import { isFeatureEnabled } from "@/lib/dev-tooling/features";
import { PostCard } from "@/components/blog/PostCard";

// 2x2 Horizontal Grid of Recent Blog Posts
export async function BlogHighlight({
  maxDisplay = 4,
}: { maxDisplay?: number } = {}) {
  // Check if Directus is configured before attempting to fetch
  if (!isDirectusConfigured() && !isFeatureEnabled("offlineDummyBlogs")) {
    return (
      <section className="py-16 md:py-24 border-t border-slate-800">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-slate-50">
              Recent Writings
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
              A few posts from my recent endeavors to document my learnings and
              organize my thoughts.
            </p>
          </div>
          <div className="mt-16 lg:max-w-5xl lg:mx-auto">
            <ServiceUnavailableWithDevMode />
          </div>
          <div className="mt-8 text-center">
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

  // Fetch up to maxDisplay posts for the grid.
  const { status, posts } = await getPublishedPosts({ limit: maxDisplay });
  const latestPosts = posts;

  return (
    <section className="py-16 md:py-24 border-t border-slate-800">
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
          {status === "error" ? (
            // If the service is down or fetch failed, render the error component
            <div className="lg:max-w-5xl lg:mx-auto">
              <ServiceUnavailableWithDevMode />
            </div>
          ) : latestPosts.length > 0 ? (
            // If successful and posts exist, render the grid
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:max-w-5xl lg:mx-auto">
              {latestPosts.map((post) => (
                <PostCard key={post.id} post={post} titleAs="h3" />
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
        <div className="mt-8 text-center">
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
