# Blog Scalability: Pagination & Search

As the number of blog posts grows, fetching all posts at once will eventually cause performance bottlenecks—increased memory overhead on the server, larger payload sizes, and slower response times.

To future-proof the blog, the `getPublishedPosts` utility in `lib/directus.ts` has been enhanced with an optional `GetPostsOptions` interface. This allows you to scale cleanly without changing the existing configured behavior for current consumers.

## 1. Directus Utility Improvements

The `getPublishedPosts` method now accepts an optional `options` argument for dynamic querying:

```typescript
export interface GetPostsOptions {
  limit?: number; // How many posts to return per page
  page?: number; // The current page offset
  search?: string; // A text query for full-text search
}
```

The function will also return a `total` count alongside the array of `posts`, utilizing the `meta: ["filter_count"]` configuration natively available in the Directus SDK.

### Preserving Existing Behavior

Because these options are strictly _optional_, the current calls like `getPublishedPosts()` occurring across your application will continue to work seamlessly, fetching everything (which is completely fine for small datasets).

---

## 2. Implementing Pagination

When you are ready to implement pagination on the frontend (e.g., in `/app/(portfolio)/blog/page.tsx`), you can easily extract pagination details from Next.js `searchParams`:

### Example usage:

```tsx
// Inside your Next.js Page component
const limit = 9;
const page = params?.page ? parseInt(params.page) : 1;

const { status, posts, total } = await getPublishedPosts({
  limit,
  page,
});

const totalPages = Math.ceil((total || 0) / limit);
```

You can then pass `page` and `totalPages` into a `<Pagination />` component that simply updates the URL or acts as an "infinite scroll" trigger.

---

## 3. Implementing Search

The Directus `search` string natively performs a full-text search across all of a collection's string fields (including title, summary, content, and tags).

This gives you a powerful “fuzzy search” immediately, passing the search string natively down to the database:

### Example usage:

```tsx
const searchQuery = params?.q || "";

const { posts, total } = await getPublishedPosts({
  search: searchQuery,
  limit: 10,
  page: 1,
});
```

**Frontend implementation:**
Create a wrapper component with a text input. It should use `useRouter` to set `?q=My+Search+Query`. The page will re-fire the data request through `getPublishedPosts` using the query, and instantly deliver search results.

---

## 4. Future System Optimization: `getAdjacentPosts`

Currently, `getAdjacentPosts` fetches **all** published posts, sorts them locally on the server, and determines the `previous` and `next` blogs for link generation.
While perfectly functional for the current scale, this will pose a hurdle as the number of blogs increases because the app will pull down megabytes of blog data just to find two records.

### How to Scale It:

Instead of fetching all and sorting locally, you can refactor `getAdjacentPosts` to directly ask Directus for the adjacent posts using two localized queries:

**For the Next Post:**

```typescript
filter: {
  _or: [
    { publication_date: { _gt: currentPostDate } },
    {
      _and: [
        { publication_date: { _eq: currentPostDate } },
        { id: { _lt: currentPostId } } // Tie-breaker
      ]
    }
  ]
},
limit: 1,
sort: ["publication_date"]
```

**For the Previous Post:**

```typescript
filter: {
  _or: [
    { publication_date: { _lt: currentPostDate } },
    {
      _and: [
        { publication_date: { _eq: currentPostDate } },
        { id: { _gt: currentPostId } } // Tie-breaker
      ]
    }
  ]
},
limit: 1,
sort: ["-publication_date"]
```

This ensures we ask Directus for exactly 2 posts, ensuring O(1) response times regardless of whether you have 10 posts or 10,000 posts.
