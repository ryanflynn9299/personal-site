import { Skeleton } from "@/components/primitives/Skeleton";
import { PageHeaderSkeleton } from "@/components/skeletons/PageHeaderSkeleton";
import { BlogPostCardSkeleton } from "@/components/skeletons/BlogPostCardSkeleton";

export function BlogHighlightSkeleton() {
  return (
    <section
      className="border-t border-slate-800 py-16 md:py-24"
      aria-busy="true"
      aria-label="Loading recent writings"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHeaderSkeleton titleWidth={240} subtitleLines={2} centered />
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:mx-auto lg:max-w-5xl">
          {Array.from({ length: 4 }, (_, index) => (
            <BlogPostCardSkeleton key={index} />
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Skeleton height={24} width={200} rounded="sm" />
        </div>
      </div>
    </section>
  );
}
