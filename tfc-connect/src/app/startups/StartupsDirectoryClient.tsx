"use client";

import { Button } from "@/components/ui/button";
import { Filter, Flame, Plus, RotateCcw, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CollectionsStrip } from "./CollectionsStrip";
import { StartupCard } from "./StartupCard";
import {
  CollectionItem,
  INDUSTRIES,
  STAGES,
  StartupItem,
  STATUS_TAGS,
} from "./types";

interface StartupsDirectoryClientProps {
  initialStartups: StartupItem[];
  collections: CollectionItem[];
  collectionItemsMap: Record<string, string[]>; // collectionSlug -> startupIds
}

export function StartupsDirectoryClient({
  initialStartups,
  collections,
  collectionItemsMap,
}: StartupsDirectoryClientProps) {
  // Search & Filter State
  const [search, setSearch] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedCollectionSlug, setSelectedCollectionSlug] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"trending" | "newest" | "most_followed">("trending");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract unique cities from startups
  const cities = useMemo(() => {
    const set = new Set<string>();
    initialStartups.forEach((s) => {
      if (s.city) set.add(s.city);
    });
    return Array.from(set).sort();
  }, [initialStartups]);

  // Filtered & Sorted Startups
  const filteredStartups = useMemo(() => {
    return initialStartups
      .filter((s) => {
        // Collection filter
        if (selectedCollectionSlug) {
          const allowedIds = collectionItemsMap[selectedCollectionSlug] || [];
          if (!allowedIds.includes(s.id)) return false;
        }

        // Search keyword
        if (search.trim()) {
          const q = search.toLowerCase();
          const matches =
            s.name.toLowerCase().includes(q) ||
            s.one_liner.toLowerCase().includes(q) ||
            s.industry.toLowerCase().includes(q) ||
            (s.city && s.city.toLowerCase().includes(q));
          if (!matches) return false;
        }

        // Stage
        if (selectedStage !== "all" && s.stage !== selectedStage) {
          return false;
        }

        // Industry
        if (selectedIndustry !== "all" && s.industry !== selectedIndustry) {
          return false;
        }

        // Status tag
        if (selectedTag !== "all" && !s.status_tags?.includes(selectedTag)) {
          return false;
        }

        // City
        if (selectedCity !== "all" && s.city !== selectedCity) {
          return false;
        }

        // Verified only
        if (verifiedOnly && s.verification_tier === "listed") {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "trending") {
          return (Number(b.trending_score) || 0) - (Number(a.trending_score) || 0);
        }
        if (sortBy === "most_followed") {
          return (b.follows_count || 0) - (a.follows_count || 0);
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [
    initialStartups,
    selectedCollectionSlug,
    collectionItemsMap,
    search,
    selectedStage,
    selectedIndustry,
    selectedTag,
    selectedCity,
    verifiedOnly,
    sortBy,
  ]);

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedStage !== "all" ||
    selectedIndustry !== "all" ||
    selectedTag !== "all" ||
    selectedCity !== "all" ||
    verifiedOnly ||
    selectedCollectionSlug !== null;

  const resetFilters = () => {
    setSearch("");
    setSelectedStage("all");
    setSelectedIndustry("all");
    setSelectedTag("all");
    setSelectedCity("all");
    setVerifiedOnly(false);
    setSelectedCollectionSlug(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="glow-dot" />
            <span className="eyebrow">CAMPUS DIRECTORY</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-ink tracking-tight">
            India&apos;s campus startups
          </h1>
          <p className="font-sans text-sm text-ink-soft">
            Discover, support, and join the most promising student-founded startups.
          </p>
        </div>

        <Link href="/startups/new">
          <Button variant="solid" size="sm" className="gap-1.5 shadow-xs">
            <Plus className="size-4" />
            List your startup
          </Button>
        </Link>
      </div>

      {/* Top Collections Strip */}
      <CollectionsStrip
        collections={collections}
        selectedCollectionSlug={selectedCollectionSlug}
        onSelectCollection={setSelectedCollectionSlug}
      />

      {/* Main Grid: Left Filters + Right Startup Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-soft" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, industry, city..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-line bg-card font-sans text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="shrink-0 gap-1.5 border border-line"
          >
            <Filter className="size-4" />
            Filters {hasActiveFilters && "•"}
          </Button>
        </div>

        {/* Left Filters Panel */}
        <div
          className={`space-y-6 bg-card border border-line rounded-2xl p-5 shadow-card lg:block ${
            mobileFilterOpen ? "block" : "hidden"
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <h3 className="font-display text-sm font-bold text-ink flex items-center gap-1.5">
              <Filter className="size-4 text-orange-deep" />
              Filter Startups
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="font-mono text-[11px] text-orange-deep hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="size-3" />
                Reset
              </button>
            )}
          </div>

          {/* Desktop Search */}
          <div className="hidden lg:block space-y-1.5">
            <label className="font-sans text-xs font-semibold text-ink">
              Search keyword
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-soft" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, one-liner, tech..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-line bg-bg font-sans text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>
          </div>

          {/* Stage */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-semibold text-ink">
              Stage
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full rounded-xl border border-line bg-bg px-3 py-2 font-sans text-xs text-ink focus:outline-none focus:ring-1 focus:ring-ink"
            >
              <option value="all">All stages</option>
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Industry */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-semibold text-ink">
              Industry
            </label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full rounded-xl border border-line bg-bg px-3 py-2 font-sans text-xs text-ink focus:outline-none focus:ring-1 focus:ring-ink"
            >
              <option value="all">All industries</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Looking for / Status Tags */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-semibold text-ink">
              Looking for
            </label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full rounded-xl border border-line bg-bg px-3 py-2 font-sans text-xs text-ink focus:outline-none focus:ring-1 focus:ring-ink"
            >
              <option value="all">All opportunities</option>
              {STATUS_TAGS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          {cities.length > 0 && (
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">
                City / Hub
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full rounded-xl border border-line bg-bg px-3 py-2 font-sans text-xs text-ink focus:outline-none focus:ring-1 focus:ring-ink"
              >
                <option value="all">All cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Verified Only Checkbox */}
          <div className="pt-2 border-t border-line">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded border-line text-ink focus:ring-ink size-4"
              />
              <span className="font-sans text-xs font-medium text-ink flex items-center gap-1">
                <Sparkles className="size-3 text-orange" />
                Verified &amp; TFC Backed only
              </span>
            </label>
          </div>
        </div>

        {/* Right Content: Sort & Results Grid */}
        <div className="lg:col-span-3 space-y-5">
          {/* Top Sort Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-line rounded-2xl px-5 py-3 shadow-xs">
            <span className="font-mono text-xs text-ink-soft">
              Showing <strong className="text-ink">{filteredStartups.length}</strong>{" "}
              {filteredStartups.length === 1 ? "startup" : "startups"}
            </span>

            <div className="flex items-center gap-2 text-xs font-sans">
              <span className="text-ink-soft">Sort by:</span>
              <div className="flex items-center bg-bg rounded-xl p-1 border border-line">
                <button
                  type="button"
                  onClick={() => setSortBy("trending")}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                    sortBy === "trending"
                      ? "bg-card text-orange-deep font-semibold shadow-xs"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  <Flame className="size-3.5 fill-orange/20" />
                  Trending
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("newest")}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                    sortBy === "newest"
                      ? "bg-card text-ink font-semibold shadow-xs"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  Newest
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("most_followed")}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                    sortBy === "most_followed"
                      ? "bg-card text-ink font-semibold shadow-xs"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  Most followed
                </button>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredStartups.length === 0 ? (
            <div className="bg-card border border-line rounded-2xl p-12 text-center space-y-4 shadow-card">
              <div className="size-12 rounded-full bg-bg border border-line text-ink-soft mx-auto flex items-center justify-center text-xl">
                🚀
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-ink">
                  No matching startups found
                </h3>
                <p className="font-sans text-xs text-ink-soft max-w-sm mx-auto">
                  Try broadening your search query or resetting filters to explore all campus ventures.
                </p>
              </div>
              <Button variant="solid" size="sm" onClick={resetFilters}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStartups.map((s) => (
                <StartupCard key={s.id} startup={s} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
