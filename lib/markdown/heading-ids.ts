import type { MutableRefObject } from "react";
import type { DocumentHeading } from "@/lib/markdown/headings";

export function createHeadingIdConsumer(
  headings: DocumentHeading[],
  indexRef: MutableRefObject<number>
): () => string | undefined {
  return () => {
    const index = indexRef.current;
    if (index < headings.length) {
      const id = headings[index].id;
      indexRef.current = index + 1;
      return id;
    }
    return undefined;
  };
}
