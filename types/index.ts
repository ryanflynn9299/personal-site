// This is the clean, frontend-facing Post type (already exists)
export interface Post {
    id: string;
    status: 'published' | 'draft' | 'archived';
    title: string;
    author: { first_name: string; last_name: string };
    slug: string;
    publish_date: string;
    summary: string;
    feature_image: string | null; // This will be a full URL
    html: string;
    tags: string[];
}

// --- ADD THIS ---
// This type represents the raw data structure from the 'posts' collection in Directus.
export interface DirectusPost {
    id: string;
    status: 'published' | 'draft' | 'archived';
    title: string;
    author: { first_name: string; last_name: string };
    slug: string;
    publish_date: string; // ISO 8601 Date string
    summary: string;
    body: string; // The main content of the post
    // In Directus, a file/image field is a foreign key (string ID) to the directus_files collection.
    feature_image: string;
    // Assuming 'tags' is a simple comma-separated string or a JSON array in Directus
    tags: string[];
}