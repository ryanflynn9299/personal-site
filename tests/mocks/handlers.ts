import { http, HttpResponse } from 'msw';

// Mock Directus API handlers
// Note: MSW matches handlers in order, so more specific handlers should come first
export const handlers = [
  // Get published posts - matches requests filtering by status=published
  http.get('*/items/blogs', ({ request }) => {
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('filter[status][_eq]');
    const slugFilter = url.searchParams.get('filter[slug][_eq]');

    // Handle post by slug requests
    if (slugFilter) {
      if (slugFilter === 'test-post-1') {
        return HttpResponse.json([
          {
            id: '1',
            title: 'Test Post 1',
            summary: 'This is a test post summary',
            slug: 'test-post-1',
            status: 'published',
            publication_date: '2024-01-15T00:00:00Z',
            content: '<p>Test content</p>',
            author: {
              first_name: 'John',
              last_name: 'Doe',
            },
            feature_image: {
              id: 123,
              filename: 'test-image.jpg',
            },
            blog_tags: ['test', 'example'],
          },
        ]);
      }
      // Non-existent post
      return HttpResponse.json([]);
    }

    // Handle published posts requests
    if (statusFilter === 'published') {
      return HttpResponse.json([
        {
          id: '1',
          title: 'Test Post 1',
          summary: 'This is a test post summary',
          slug: 'test-post-1',
          status: 'published',
          publication_date: '2024-01-15T00:00:00Z',
          content: '<p>Test content</p>',
          author: {
            first_name: 'John',
            last_name: 'Doe',
          },
          feature_image: {
            id: 123,
            filename: 'test-image.jpg',
          },
          blog_tags: ['test', 'example'],
        },
        {
          id: '2',
          title: 'Test Post 2',
          summary: 'Another test post',
          slug: 'test-post-2',
          status: 'published',
          publication_date: '2024-01-10T00:00:00Z',
          content: '<p>More test content</p>',
          author: {
            first_name: 'Jane',
            last_name: 'Smith',
          },
          feature_image: null,
          blog_tags: [],
        },
      ]);
    }

    // Default: return empty array
    return HttpResponse.json([]);
  }),
];

