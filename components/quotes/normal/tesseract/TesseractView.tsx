"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import type { Quote } from "@/app/(portfolio)/quotes/config";
import { Tesseract3D, type Category } from "./Tesseract3D";

interface TesseractViewProps {
  quotes: Quote[];
}

// Color palette for categories
const CATEGORY_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#f97316", // orange
  "#6366f1", // indigo
];

/**
 * Extract unique categories from quotes based on tags
 */
function extractCategories(quotes: Quote[]): Category[] {
  const categoryMap = new Map<string, { count: number; quotes: Quote[] }>();

  quotes.forEach((quote) => {
    if (quote.tags && quote.tags.length > 0) {
      quote.tags.forEach((tag) => {
        const normalized = tag.toLowerCase();
        if (!categoryMap.has(normalized)) {
          categoryMap.set(normalized, { count: 0, quotes: [] });
        }
        const entry = categoryMap.get(normalized)!;
        entry.count++;
        entry.quotes.push(quote);
      });
    } else {
      // Quotes without tags go to "uncategorized"
      if (!categoryMap.has("uncategorized")) {
        categoryMap.set("uncategorized", { count: 0, quotes: [] });
      }
      const entry = categoryMap.get("uncategorized")!;
      entry.count++;
      entry.quotes.push(quote);
    }
  });

  // Convert to categories array
  const categories: Category[] = Array.from(categoryMap.entries()).map(
    ([name, data], idx) => ({
      id: name,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      position: [
        Math.cos((idx / categoryMap.size) * Math.PI * 2) * 3,
        Math.sin((idx / categoryMap.size) * Math.PI * 2) * 3,
        Math.sin((idx / categoryMap.size) * Math.PI * 4) * 2,
      ] as [number, number, number],
      quotes: data.quotes,
    })
  );

  return categories;
}

export function TesseractView({ quotes }: TesseractViewProps) {
  const categories = useMemo(() => extractCategories(quotes), [quotes]);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const feedRef = useRef<HTMLDivElement>(null);
  const tesseractRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isScrollingRef = useRef(false);
  const isRotatingRef = useRef(false);

  // Organize quotes by category
  const quotesByCategory = useMemo(() => {
    const organized: { [key: string]: Quote[] } = {};
    categories.forEach((cat) => {
      organized[cat.id] = cat.quotes;
    });
    return organized;
  }, [categories]);

  // Calculate rotation from category index
  const getRotationForCategory = useCallback(
    (index: number): [number, number, number] => {
      const angle = (index / categories.length) * Math.PI * 2;
      return [
        Math.sin(angle) * 0.5,
        Math.cos(angle) * 0.8,
        Math.sin(angle * 1.5) * 0.3,
      ];
    },
    [categories.length]
  );

  // Scroll to category section
  const scrollToCategory = useCallback(
    (index: number) => {
      if (sectionRefs.current[index] && !isScrollingRef.current) {
        isScrollingRef.current = true;
        sectionRefs.current[index]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 1000);
      }
    },
    []
  );

  // Handle tesseract rotation change (from drag/click)
  const handleRotationChange = useCallback(
    (newRotation: [number, number, number]) => {
      if (isRotatingRef.current) return;

      setRotation(newRotation);

      // Find closest category based on rotation
      let closestIndex = 0;
      let minDistance = Infinity;

      categories.forEach((_, idx) => {
        const targetRotation = getRotationForCategory(idx);
        const distance =
          Math.abs(newRotation[0] - targetRotation[0]) +
          Math.abs(newRotation[1] - targetRotation[1]) +
          Math.abs(newRotation[2] - targetRotation[2]);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = idx;
        }
      });

      if (closestIndex !== activeCategoryIndex) {
        setActiveCategoryIndex(closestIndex);
        scrollToCategory(closestIndex);
      }
    },
    [categories, activeCategoryIndex, getRotationForCategory, scrollToCategory]
  );

  // Handle scroll - update rotation and active category
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current || !feedRef.current) return;

      const scrollTop = feedRef.current.scrollTop;
      const scrollHeight = feedRef.current.scrollHeight;
      const clientHeight = feedRef.current.clientHeight;
      const scrollProgress = scrollTop / (scrollHeight - clientHeight);

      // Determine active category based on scroll position
      const sectionHeights = sectionRefs.current.map(
        (ref) => ref?.offsetTop || 0
      );
      let newActiveIndex = 0;

      for (let i = sectionHeights.length - 1; i >= 0; i--) {
        if (scrollTop >= (sectionHeights[i] || 0) - 200) {
          newActiveIndex = i;
          break;
        }
      }

      if (newActiveIndex !== activeCategoryIndex) {
        setActiveCategoryIndex(newActiveIndex);
        isRotatingRef.current = true;
        const targetRotation = getRotationForCategory(newActiveIndex);
        setRotation(targetRotation);
        setTimeout(() => {
          isRotatingRef.current = false;
        }, 500);
      }
    };

    const feed = feedRef.current;
    if (feed) {
      feed.addEventListener("scroll", handleScroll);
      return () => feed.removeEventListener("scroll", handleScroll);
    }
  }, [activeCategoryIndex, getRotationForCategory]);

  // Set tesseract size based on viewport (1/3 to 1/2 of smaller dimension)
  useEffect(() => {
    const updateTesseractSize = () => {
      if (!tesseractRef.current) return;
      
      const smallerDimension = Math.min(window.innerHeight, window.innerWidth);
      const size = smallerDimension * 0.42; // 42% of smaller dimension (between 1/3 and 1/2)
      
      if (window.innerWidth >= 1024) {
        // Desktop: square sidebar
        tesseractRef.current.style.width = `${size}px`;
        tesseractRef.current.style.height = `${size}px`;
      } else {
        // Mobile: full width, calculated height
        tesseractRef.current.style.width = '100%';
        tesseractRef.current.style.height = `${size}px`;
      }
    };

    updateTesseractSize();
    window.addEventListener('resize', updateTesseractSize);
    return () => window.removeEventListener('resize', updateTesseractSize);
  }, []);

  // Get active category color
  const activeCategory = categories[activeCategoryIndex];
  const activeColor = activeCategory?.color || CATEGORY_COLORS[0];

  return (
    <div className="flex h-screen flex-col bg-slate-950 lg:flex-row">
      {/* 3D Tesseract Navigation - Sidebar on desktop, sticky top on mobile */}
      <div 
        ref={tesseractRef}
        className="border-b border-slate-800 bg-slate-950 lg:border-b-0 lg:border-r lg:flex-shrink-0"
      >
        <Canvas
          camera={{ position: [0, 0, 10], fov: 50 }}
          className="h-full w-full"
        >
          <Tesseract3D
            rotation={rotation}
            onRotationChange={handleRotationChange}
            categories={categories}
            activeCategoryIndex={activeCategoryIndex}
          />
        </Canvas>
        {/* Category indicator (mobile) */}
        <div className="border-t border-slate-800 bg-slate-950 p-4 lg:hidden">
          <div className="font-mono text-xs text-slate-500">
            ACTIVE:{" "}
            <span
              className="font-semibold"
              style={{ color: activeColor }}
            >
              {activeCategory?.name.toUpperCase() || "ALL"}
            </span>
          </div>
        </div>
      </div>

      {/* Quote Feed */}
      <div
        ref={feedRef}
        className="flex-1 overflow-y-auto"
        style={{
          backgroundColor: `${activeColor}05`,
          borderLeft: `1px solid ${activeColor}20`,
        }}
      >
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {categories.map((category, idx) => (
            <section
              key={category.id}
              ref={(el) => {
                sectionRefs.current[idx] = el;
              }}
              id={`category-${category.id}`}
              className="mb-16 scroll-mt-8"
            >
              {/* Category Header */}
              <div className="mb-8 border-b border-slate-800 pb-4">
                <h2
                  className="font-inter text-3xl font-bold"
                  style={{ color: category.color }}
                >
                  {category.name}
                </h2>
                <p className="mt-2 font-mono text-xs text-slate-500">
                  {category.quotes.length} TRANSMISSION
                  {category.quotes.length !== 1 ? "S" : ""}
                </p>
              </div>

              {/* Quote Cards */}
              <div className="space-y-6">
                {category.quotes.map((quote) => (
                  <QuoteCard
                    key={quote.id}
                    quote={quote}
                    categoryColor={category.color}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Quote Card with high-contrast typography
 */
function QuoteCard({
  quote,
  categoryColor,
}: {
  quote: Quote;
  categoryColor: string;
}) {
  return (
    <article
      className="border border-slate-800 bg-slate-950/80 p-8 transition-colors hover:border-slate-700"
      style={{
        borderLeftColor: `${categoryColor}40`,
        borderLeftWidth: "3px",
      }}
    >
      <blockquote className="font-inter text-2xl font-semibold leading-relaxed text-slate-50">
        {quote.text}
      </blockquote>

      {(quote.author || quote.source) && (
        <div className="mt-6 flex flex-wrap items-center gap-4 font-mono text-sm text-slate-400">
          {quote.author && (
            <>
              <span className="text-slate-600">AUTHOR:</span>
              <span>{quote.author}</span>
            </>
          )}
          {quote.source && (
            <>
              <span className="text-slate-600">//</span>
              <span className="text-slate-500">{quote.source}</span>
            </>
          )}
        </div>
      )}

      {quote.tags && quote.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {quote.tags.map((tag, idx) => (
            <span
              key={idx}
              className="font-mono text-xs text-slate-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
