import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock } from "lucide-react";
import { Post } from "@/types";
import { blogSpacing } from "@/lib/blog/spacing";
import {
  estimateReadingTimeMinutes,
  formatReadingTime,
  getBlogPostUrl,
  cn,
} from "@/lib/utils";

/**
 * Named visual instances for PostCard. Add a key here and styles in
 * `POST_CARD_INSTANCES` to introduce a new look without duplicating the component.
 */
export type PostCardInstance = "default";

interface PostCardInstanceStyle {
  link: string;
  body: string;
  title: string;
  summary: string;
}

const POST_CARD_INSTANCES: Record<PostCardInstance, PostCardInstanceStyle> = {
  default: {
    link: "group flex flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-800 transition-all hover:border-sky-400 hover:shadow-lg hover:shadow-sky-900/20",
    body: `flex flex-1 flex-col ${blogSpacing.cardBodyPadding}`,
    title:
      "font-heading text-xl font-semibold text-slate-50 transition-colors group-hover:text-sky-300",
    summary: `${blogSpacing.cardTitleToSummary} flex-grow text-slate-300`,
  },
};

export interface PostCardProps {
  post: Post;
  /** Visual instance — extend `POST_CARD_INSTANCES` for new layouts */
  instance?: PostCardInstance;
  /** Merged onto the root link (grid spacing, max-width, etc.) */
  className?: string;
  /** Heading level — use `h3` when nested under a section `h2` (e.g. home highlight) */
  titleAs?: "h2" | "h3";
}

export function PostCard({
  post,
  instance = "default",
  className,
  titleAs = "h2",
}: PostCardProps) {
  const styles = POST_CARD_INSTANCES[instance];
  const TitleTag = titleAs;

  const formattedDate = new Date(post.publish_date).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
  const readingTime = formatReadingTime(
    estimateReadingTimeMinutes(post.content)
  );

  return (
    <Link
      href={getBlogPostUrl(post.slug)}
      className={cn(styles.link, className)}
    >
      {post.feature_image && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={post.feature_image.filename}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className={styles.body}>
        <TitleTag className={styles.title}>{post.title}</TitleTag>
        <p className={styles.summary}>{post.summary}</p>
        <div
          className={cn(
            blogSpacing.cardSummaryToMeta,
            "flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400"
          )}
        >
          <span className="inline-flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <time dateTime={post.publish_date}>{formattedDate}</time>
          </span>
          <span className="inline-flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            <span>{readingTime}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
