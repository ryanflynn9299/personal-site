import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/directus";
import {BlogPageClient} from "@/app/(portfolio)/blog/BlogPageClient";

export const metadata: Metadata = {
    title: "Blog",
    description: "A collection of articles and thoughts on software development, technology, and more.",
};

// Revalidate the page every hour to fetch new posts
export const revalidate = 3600;


export default async function BlogIndexPage() {
    const posts = await getPublishedPosts();

    return <BlogPageClient posts={posts} />;
}