import {createDirectus, readItems, rest} from '@directus/sdk';
import {Post} from '@/types'; // Import both types
import log from './logger';

// Initialize the Directus client (assuming this already exists)
// TODO: Make this robust to misconfigured envs
const directusUrl = (!process.env.IS_DEV_MODE) ? process.env.DIRECTUS_URL : process.env.DEV_DIRECTUS_URL;
if (!directusUrl) {
    throw new Error("DIRECTUS_URL is not set in environment variables. Check that environment variables are set properly.");
}
export const directus = createDirectus(directusUrl).with(rest());


/**
 * A helper function to get the full asset URL from a Directus file ID.
 * @param fileId - The ID of the file in Directus.
 * @returns The full URL to the asset, or null if fileId is null/undefined.
 */
function getAssetURL(fileId: string | null | undefined): string | null {
    if (!fileId) return null;
    return `${directusUrl}/assets/${fileId}`;
}


/**
 * Fetches all posts from Directus that are marked as 'published'.
 * It rigorously types the response and transforms it into the clean,
 * frontend-facing 'Post' type.
 *
 * @returns {Promise<{ status: 'success' | 'error', posts: Post[] }>} A promise that resolves to an array of published posts.
 */
export async function getPublishedPosts(): Promise<{ status: 'success' | 'error', posts: Post[] }> {
    try {
        // 1. Provide the <DirectusPost> generic to readItems.
        //    This tells TypeScript the exact shape of the items being returned.
        const posts = await directus.request(
            readItems('blogs', {
                fields: ['id', 'title', 'summary', 'author', 'status', 'slug', 'publication_date', 'feature_image', 'blog_tags', 'content'],
                filter: {
                    status: { _eq: 'published' },
                },
                sort: ['-publication_date'],
            })
        );

        // The 'posts' variable is now correctly typed as DirectusPost[]
        if (!posts || posts.length === 0) {
            return { status: 'success', posts: [] };
        }

        // 2. Transform the raw Directus data into the clean frontend 'Post' type.
        return { status: 'success', posts: posts.map(post => ({
            id: post.id,
            title: post.title,
            summary: post.summary || '', // Fallback to empty string if not present
            status: post.status,
            author: {first_name: post.author.first_name, last_name: post.author.last_name}, // Assuming author is always present
            slug: post.slug,
            publish_date: post.publication_date,
            // Use the helper to get the full image URL
            // feature_image: getAssetURL(post.feature_image.id),
            feature_image: post.feature_image,
            // Ensure tags are always an array of strings
            tags: post.blog_tags || [],
            // Renaming 'body' to 'html' for the frontend type
            content: post.content,
        }))};

    } catch (error) {
        // console.error("Failed to fetch published posts from Directus.");
        log.error({ error }, `Failed to fetch published posts from Directus.`);
        // In a real application, you might want to throw the error
        // or return an empty array to prevent the page from crashing.
        return { status: 'error', posts: [] };
    }
}

/**
 * Fetches a single, published post from Directus by its unique slug.
 *
 * This function is designed with several layers of rigor:
 * 1. Strong Typing: It uses the <DirectusPost> generic to ensure the response from
 * the SDK is correctly typed, preventing downstream errors.
 * 2. Security/Logic: It filters not only by slug but also explicitly for 'published'
 * status, preventing unpublished drafts from being accessed via a direct URL.
 * 3. Data Transformation: It converts the raw Directus object (DirectusPost) into the
 * clean, frontend-specific 'Post' type, including creating a full URL for the
 * feature image. This decouples the frontend from the backend data structure.
 * 4. Null Safety: It gracefully returns `null` if no matching and published post
 * is found, allowing the calling page to handle it (e.g., render a 404 page).
 *
 * @param {string} slug - The unique slug of the post to fetch.
 * @returns {Promise<Post | null>} A promise that resolves to the full Post object,
 * or null if the post is not found or not published.
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
    try {
        // Use readItems with a limit of 1. This is the standard way to fetch
        // an item by a secondary unique key (like a slug).
        const posts = await directus.request(
            readItems('blogs', {
                // We use a logical AND to ensure both conditions are met.
                filter: {
                    _and: [
                        { slug: { _eq: slug } },
                        { status: { _eq: 'published' } },
                    ],
                },
                // We only need the first result that matches.
                limit: 1,
                // Specify all fields needed for the full 'Post' type.
                fields: ['id', 'title', 'summary', 'author', 'slug', 'publication_date', 'status', 'feature_image', 'blog_tags', 'content'],
            })
        );

        // If the response is empty, no post was found. Return null.
        if (!posts || posts.length === 0) {
            console.log(`Post with slug "${slug}" not found or not published.`);
            return null;
        }

        // Since we limited to 1, the post is the first element in the array.
        const rawPost = posts[0];

        // Transform the raw Directus data into the clean frontend 'Post' type.
        // This is the same transformation logic used in `getPublishedPosts`.
        return {
            id: rawPost.id,
            title: rawPost.title,
            summary: rawPost.summary || '', // Fallback to empty string if not present
            status: 'published', // We know it's published due to our filter
            slug: rawPost.slug,
            author: {
                first_name: rawPost.author?.first_name || '', // Fallback to empty string if not present
                last_name: rawPost.author?.last_name || '',   // Fallback to empty string if not present
            },
            publish_date: rawPost.publication_date,
            // feature_image: getAssetURL(rawPost.feature_image), // Use the helper
            feature_image: rawPost.feature_image,
            tags: rawPost.blog_tags || [],
            content: rawPost.content,
        };

    } catch (error) {
        // console.error(`Failed to fetch post with slug "${slug}":`, error);
        log.error({ slug, error }, `Failed to fetch post.`);
        
        // Return null on any unexpected error to prevent the page from crashing.
        return null;
    }
}