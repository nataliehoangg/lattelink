"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SearchBar from "@/components/SearchBar";
import CafeList from "@/components/CafeList";
import MapView from "@/components/MapView";
import { useCafes } from "@/hooks/useCafes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Home(): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const { cafes, isLoading, error } = useCafes(searchQuery);

  const hasSearched = searchQuery.trim().length > 0;
  const resultsCount = cafes?.length ?? 0;
  const showResultsSection = hasSearched;
  const hasResults = resultsCount > 0;
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const qParam = searchParams?.get("q") ?? "";
    setSearchQuery((prev) => (prev === qParam ? prev : qParam));
  }, [searchParams]);

  useEffect(() => {
    if (hasSearched && resultsRef.current) {
      resultsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [hasSearched, resultsCount]);

  const handleSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      setSearchQuery(trimmed);
      setViewMode("list");

      const currentParams = new URLSearchParams(searchParams?.toString() ?? "");
      if (trimmed) {
        currentParams.set("q", trimmed);
      } else {
        currentParams.delete("q");
      }

      const next = currentParams.toString();
      const target = next ? `${pathname}?${next}` : pathname;

      router.push(target, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <main className="min-h-screen bg-cream">
      <section className="relative flex min-h-screen items-center pt-28 pb-16 lg:pt-32">
        <div className="absolute inset-0 bg-gradient-to-br from-pale-latte/20 via-cream to-mist-gray/10" />

        <div className="editorial-container relative z-10 w-full">
          <div className="grid min-h-[calc(100vh-8rem)] items-stretch gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
              className="relative min-h-[60vh] overflow-hidden lg:h-full lg:min-h-0"
            >
              <div
                className="absolute inset-0 scale-105 bg-cover bg-center blur-[6px] brightness-90"
                style={{ backgroundImage: "url('/images/drinks2.JPG')" }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-deep-coffee/40">
                <div className="w-full px-6 text-center">
                  <h1 className="editorial-h1 text-cream mb-8 tracking-tight">
                    LATTELINK
                  </h1>
                  <div className="max-w-2xl mx-auto">
                    <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
              className="relative min-h-[60vh] overflow-hidden lg:h-full lg:min-h-0"
            >
              <div
                className="absolute inset-0 scale-105 bg-cover bg-center blur-[2px] brightness-105"
                style={{ backgroundImage: "url('/images/drinks.png')" }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-deep-coffee/10 mix-blend-luminosity">
                <p className="editorial-caption text-cream tracking-[0.4em] uppercase">
                  WORK & SIP.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showResultsSection && (
          <motion.section
            ref={resultsRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative border-t border-mist-gray bg-cream"
          >
            <div className="editorial-container flex items-center justify-end border-b border-mist-gray py-8">
              <div className="flex gap-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`editorial-caption px-6 py-2 transition-colors duration-400 ${
                    viewMode === "list"
                      ? "bg-espresso text-cream"
                      : "bg-transparent text-deep-coffee/60 hover:bg-pale-latte hover:text-deep-coffee"
                  } ${!hasResults ? "cursor-not-allowed opacity-50" : ""}`}
                  disabled={!hasResults}
                >
                  LIST
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`editorial-caption px-6 py-2 transition-colors duration-400 ${
                    viewMode === "map"
                      ? "bg-espresso text-cream"
                      : "bg-transparent text-deep-coffee/60 hover:bg-pale-latte hover:text-deep-coffee"
                  } ${!hasResults ? "cursor-not-allowed opacity-50" : ""}`}
                  disabled={!hasResults}
                >
                  MAP
                </button>
              </div>
            </div>

            <div className="editorial-container py-16">
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="editorial-body mb-8 border border-red-200/50 bg-red-50/50 px-6 py-4 text-red-800"
                >
                  Error: {error.message}
                </motion.div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-32">
                  <div className="h-12 w-12 animate-spin rounded-full border-2 border-mist-gray border-t-espresso" />
                </div>
              )}

              {!isLoading && !hasResults && (
                <div className="py-32 text-center">
                  <p className="editorial-body mb-4 text-deep-coffee/70">
                    No cafés found. Try a different search.
                  </p>
                  <p className="editorial-caption text-deep-coffee/50">
                    Search by city, neighborhood, or café name.
                  </p>
                </div>
              )}

              {!isLoading && hasResults && (
                <>
                      {viewMode === "list" ? (
                        <CafeList cafes={cafes ?? []} currentQuery={searchQuery} />
                      ) : (
                        <MapView cafes={cafes ?? []} currentQuery={searchQuery} />
                      )}
                </>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
