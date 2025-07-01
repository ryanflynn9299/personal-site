// interface Post {
//     title: string;
//     slug: string;
//     publish_date: string;
//     summary: string;
//     feature_image?: { id: string };
//     author: { first_name: string; last_name: string };
// }

import {Post} from "@/types";

interface JsonLdProps {
    post: Post;
}

export function JsonLd({ post }: JsonLdProps) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.title,
        datePublished: post.publish_date,
        author: {
            '@type': 'Person',
            name: `${post.author.first_name} ${post.author.last_name}`,
        },
        image: post.feature_image
            ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${post.feature_image.id}`
            : undefined,
        publisher: {
            '@type': 'Person', // Or 'Organization'
            name: `${post.author.first_name} ${post.author.last_name}`,
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://your-domain.com/blog/${post.slug}`, // Replace with your domain
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}