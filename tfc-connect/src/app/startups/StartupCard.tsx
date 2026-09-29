import { Chip } from "@/components/ui/badge";
import { ArrowUpRight, Flame, Heart, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { StartupItem, STATUS_TAGS } from "./types";

interface StartupCardProps {
  startup: StartupItem;
}

export function StartupCard({ startup }: StartupCardProps) {
  const statusLabels = new Map(STATUS_TAGS.map((t) => [t.id, t.label]));

  return (
    <Link
      href={`/startups/${startup.slug}`}
      className="group block bg-card border border-line rounded-2xl p-5 sm:p-6 shadow-card hover:border-ink/30 hover:shadow-md transition-all relative overflow-hidden"
    >
      {/* Top Bar: Logo, Name, Tier Chip, Stage */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3.5 min-w-0">
          {startup.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={startup.logo_url}
              alt={startup.name}
              className="size-12 rounded-xl object-cover border border-line shrink-0"
            />
          ) : (
            <div className="size-12 rounded-xl bg-ink text-white font-display text-lg font-bold flex items-center justify-center border border-line shrink-0">
              {startup.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-display text-lg font-bold text-ink group-hover:text-orange-deep transition-colors truncate">
                {startup.name}
              </h3>
              {startup.verification_tier === "tfc_backed" && (
                <Chip variant="backed" className="text-[10px] px-2 py-0">
                  <Sparkles className="size-3 mr-0.5" /> TFC Backed
                </Chip>
              )}
              {startup.verification_tier === "verified" && (
                <Chip variant="verified" className="text-[10px] px-2 py-0">
                  ✓ Verified
                </Chip>
              )}
              {startup.is_inactive && (
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                  Inactive (90d+)
                </span>
              )}
            </div>
            <p className="font-sans text-xs text-ink-soft truncate">
              {startup.industry} {startup.city ? `· ${startup.city}` : ""}
            </p>
          </div>
        </div>

        <span className="font-mono text-[11px] font-semibold text-ink-soft bg-bg px-2.5 py-1 rounded-full border border-line capitalize shrink-0">
          {startup.stage}
        </span>
      </div>

      {/* One-Liner */}
      <p className="font-sans text-sm text-ink-soft leading-relaxed mb-4 line-clamp-2">
        {startup.one_liner}
      </p>

      {/* Status Tags */}
      {startup.status_tags && startup.status_tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {startup.status_tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] font-medium text-ink bg-bg px-2 py-0.5 rounded-md border border-line/80"
            >
              {statusLabels.get(tag as typeof STATUS_TAGS[number]["id"]) || tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Metrics & Engagement */}
      <div className="pt-3 border-t border-line/60 flex items-center justify-between font-mono text-[11px] text-ink-soft">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 hover:text-ink">
            <Users className="size-3.5" />
            {startup.follows_count || 0}
          </span>
          <span className="flex items-center gap-1 hover:text-ink">
            <Heart className="size-3.5" />
            {startup.upvotes_count || 0}
          </span>
          {Number(startup.trending_score) > 0 && (
            <span className="flex items-center gap-0.5 text-orange-600 font-semibold">
              <Flame className="size-3.5 fill-orange-500/20" />
              {startup.trending_score}
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-0.5 text-ink font-semibold group-hover:translate-x-0.5 transition-transform">
          View
          <ArrowUpRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}
