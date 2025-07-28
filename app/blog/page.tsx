import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/directus";
import { PostCard } from "@/components/PostCard";
import {Post} from "@/types";
import {BlogPageClient} from "@/app/blog/BlogPageClient";

const mockPosts: Post[] = [
    {
        id: "1",
        title: "My First Blog Post: Setting Up the Foundation",
        status: "published",
        slug: "first-blog-post",
        publish_date: "2025-06-23T12:00:00Z",
        summary: "A deep dive into the initial setup of this portfolio and blog, covering Next.js, TypeScript, and the power of a well-defined project structure.",
        feature_image: {id: 0, filename:"https://placehold.co/600x400/0f172a/7dd3fc"}, // Example image
        content: "", // HTML content is not needed for the card view
        tags: ["Next.js", "TypeScript", "WebDev"],
        author: {
            first_name: "",
            last_name: ""
        }
    },
    {
        id: "2",
        title: "Exploring Headless CMS Options for a Personal Site",
        slug: "headless-cms-options",
        publish_date: "2025-06-20T10:00:00Z",
        summary: "Comparing Strapi and Directus for self-hosting. An analysis of features, performance, and ease of use for developers.",
        feature_image: null, // Example of a post without a feature image
        content: "",
        tags: ["CMS", "Self-Hosting", "Architecture"],
        status: "published",
        author: {
            first_name: "Ryan",
            last_name: "Flynn"
        }
    },
    {
        id: "3",
        title: "The Art of Professional UI: A Look at Tailwind CSS",
        slug: "art-of-tailwind-css",
        publish_date: "2025-06-18T15:30:00Z",
        summary: "Why utility-first CSS is more than just a trend. We'll explore how Tailwind helps in building consistent, scalable, and beautiful user interfaces.",
        feature_image: {id: 2, filename:"https://placehold.co/600x400/0f172a/7dd3fc"}, // Example image
        content: "",
        tags: ["UI", "CSS", "Design"],
        status: "published",
        author: {
            first_name: "Ryan",
            last_name: "Flynn"
        }
    },
];

export const metadata: Metadata = {
    title: "Blog",
    description: "A collection of articles and thoughts on software development, technology, and more.",
};

// Revalidate the page every hour to fetch new posts
export const revalidate = 3600;

// export default async function BlogIndexPage() {
//     const posts = await getPublishedPosts();
//     //const posts = mockPosts; // Use mock data for now
//
//     return (
//         <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
//             <h1 className="font-heading text-4xl font-bold text-slate-50">Blog</h1>
//             <p className="mt-4 text-lg text-slate-300">
//                 Welcome to my digital journal. Here I share my thoughts, learnings, and explorations in the world of technology.
//             </p>
//
//             {posts && posts.length > 0? (
//                 <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
//                     {posts.map((post) => (
//                         <PostCard key={post.id} post={post} />
//                     ))}
//                 </div>
//             ) : (
//                 <p className="mt-12 text-center text-slate-400">No posts found. Check back soon!</p>
//             )}
//         </div>
//     );
// }

export default async function BlogIndexPage() {
    const posts = await getPublishedPosts();

    return <BlogPageClient posts={posts} />;
}