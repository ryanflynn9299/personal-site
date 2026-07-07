"use client";

import { useEffect, useState } from "react";

const MD_MEDIA_QUERY = "(min-width: 768px)";

/** True when viewport is Tailwind `md` or wider. */
export function useMinMdViewport(): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MD_MEDIA_QUERY);
    const update = () => setMatches(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return matches;
}
