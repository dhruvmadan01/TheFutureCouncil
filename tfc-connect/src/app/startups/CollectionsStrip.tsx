"use client";

import { Sparkles } from "lucide-react";
import { CollectionItem } from "./types";

interface CollectionsStripProps {
  collections: CollectionItem[];
  selectedCollectionSlug: string | null;
  onSelectCollection: (slug: string | null) => void;
}

export function CollectionsStrip({
  collections,
  selectedCollectionSlug,
  onSelectCollection,
}: CollectionsStripProps) {
  if (!collections || collections.length === 0) return null;

  const getThemeClass = (theme: CollectionItem["theme"]) => {
    switch (theme) {
      case "forest":
        return "from-[#1F5A45] to-[#2C7D61]";
      case "amber":
        return "from-[#9A6412] to-[#C78726]";
      case "ink":
        return "from-[#1B1712] to-[#40372F]";
      case "ballpoint":
        return "from-[#2C4A9A] to-[#4A6EC9]";
      case "orange":
      default:
        return "from-[#E2542A] to-[#F27854]";
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="eyebrow text-xs flex items-center gap-1.5">
          <Sparkles className="size-3 text-orange" />
          CURATED CAMPUS COLLECTIONS
        </span>
        {selectedCollectionSlug && (
          <button
            type="button"
            onClick={() => onSelectCollection(null)}
            className="font-mono text-xs text-orange hover:underline cursor-pointer"
          >
            Clear collection filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {collections.map((col) => {
          const isSelected = selectedCollectionSlug === col.slug;
          const bgGradient = getThemeClass(col.theme);

          return (
            <button
              key={col.id}
              type="button"
              onClick={() =>
                onSelectCollection(isSelected ? null : col.slug)
              }
              className={`text-left p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br ${bgGradient} text-white transition-all transform hover:-translate-y-0.5 shadow-sm relative overflow-hidden group ${
                isSelected ? "ring-3 ring-orange ring-offset-2 ring-offset-warm scale-[1.02]" : "opacity-90 hover:opacity-100"
              }`}
            >
              <div className="relative z-10 space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/75 font-semibold">
                  Collection
                </span>
                <h4 className="font-display text-sm sm:text-base font-bold leading-snug text-white">
                  {col.title}
                </h4>
                {col.description && (
                  <p className="font-sans text-xs text-white/80 line-clamp-1">
                    {col.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
