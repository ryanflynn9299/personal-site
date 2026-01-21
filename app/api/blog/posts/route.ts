import { NextResponse } from "next/server";
import { getPublishedPosts, isDirectusConfigured } from "@/lib/directus";
import { env } from "@/lib/env";

/**
 * API route for fetching published blog posts
 * Used by client-side components to fetch blog data
 */
export async function GET() {
  // In test/offline-dev mode, services are disabled - return empty data instead of 503
  // This allows e2e tests to run offline without errors
  if (!env.connectToServices) {
    return NextResponse.json(
      { status: "success", posts: [] },
      { status: 200 }
    );
  }

  // Check if Directus is configured
  if (!isDirectusConfigured()) {
    return NextResponse.json({ status: "error", posts: [] }, { status: 503 });
  }

  try {
    const postsResponse = await getPublishedPosts();

    return NextResponse.json(postsResponse, {
      status: postsResponse.status === "success" ? 200 : 500,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json({ status: "error", posts: [] }, { status: 500 });
  }
}
