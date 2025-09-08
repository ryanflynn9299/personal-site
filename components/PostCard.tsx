import Link from "next/link";
import Image from "next/image";
import { Calendar } from "lucide-react";
import {Post} from "@/types";

interface PostCardProps {
    post: Post;
}

export function PostCard({ post }: PostCardProps) {
    const formattedDate = new Date(post.publish_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // const imageUrl = post.feature_image
    //     ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${post.feature_image}`
    //     : null;

    // @ts-ignore
    return (
        <Link
            href={`/app/(portfolio)/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-800 transition-all hover:border-sky-400 hover:shadow-lg hover:shadow-sky-900/20"
        >
            {post.feature_image && (
                <div className="relative h-48 w-full overflow-hidden">
                    <Image
                        src={post.feature_image.filename}
                        alt="Alt text"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            )}
            <div className="flex flex-1 flex-col p-6">
                <h2 className="font-heading text-xl font-semibold text-slate-50 transition-colors group-hover:text-sky-300">
                    {post.title}
                </h2>
                <p className="mt-3 flex-grow text-slate-300">{post.summary}</p>
                <div className="mt-4 flex items-center text-sm text-slate-400">
                    <Calendar className="mr-2 h-4 w-4" />
                    <time dateTime={post.publish_date}>{formattedDate}</time>
                </div>
            </div>
        </Link>
    );
}