"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/badge";
import { ConnectDialog } from "@/components/tfc/ConnectDialog";
import {
  Search,
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
  Users2,
  X,
} from "lucide-react";
import Link from "next/link";

export interface PersonItem {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  headline?: string | null;
  college?: string | null;
  city?: string | null;
  role?: string | null;
  primarySkill?: string | null;
  secondarySkills?: string[] | null;
  tags?: string[] | null;
  industries?: string[] | null;
  commitment?: string | null;
  chapterVerified?: boolean;
  isFellow?: boolean;
  openToJoin?: boolean;
}

const SKILLS_LIST = [
  { id: "tech", label: "Tech" },
  { id: "product", label: "Product" },
  { id: "design", label: "Design" },
  { id: "growth", label: "Growth" },
  { id: "sales", label: "Sales/BD" },
  { id: "ops", label: "Ops/Finance" },
  { id: "domain", label: "Domain" },
];

const COLLEGES_LIST = [
  "Netaji Subhas University of Technology",
  "Delhi Technological University",
  "Shri Ram College of Commerce",
  "Kirori Mal College (DU)",
  "Miranda House (DU)",
  "IIT Madras BS Degree",
];

const INDUSTRIES_LIST = [
  "AgriTech",
  "EdTech",
  "FinTech",
  "AI/ML",
  "Climate",
  "Health",
  "SaaS",
  "Consumer",
  "B2B",
];

interface Props {
  initialPeople: PersonItem[];
  currentUserId: string;
}

export function PeopleBrowseClient({ initialPeople, currentUserId }: Props) {
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [openToJoinOnly, setOpenToJoinOnly] = useState(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Filtered list
  const filtered = useMemo(() => {
    return initialPeople.filter((p) => {
      // Don't show self in browse
      if (p.id === currentUserId) return false;

      // Search term
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = p.fullName.toLowerCase().includes(query);
        const matchesCollege = p.college?.toLowerCase().includes(query);
        const matchesHeadline = p.headline?.toLowerCase().includes(query);
        const matchesTags = p.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesName && !matchesCollege && !matchesHeadline && !matchesTags) {
          return false;
        }
      }

      // Skill filter
      if (selectedSkill) {
        const hasSkill =
          p.primarySkill === selectedSkill || p.secondarySkills?.includes(selectedSkill);
        if (!hasSkill) return false;
      }

      // Industry filter
      if (selectedIndustry) {
        if (!p.industries?.includes(selectedIndustry)) return false;
      }

      // College filter
      if (selectedCollege) {
        if (!p.college?.toLowerCase().includes(selectedCollege.toLowerCase())) {
          return false;
        }
      }

      // Verified only
      if (verifiedOnly && !p.chapterVerified && !p.isFellow) {
        return false;
      }

      // Open to join
      if (openToJoinOnly && !p.openToJoin) {
        return false;
      }

      return true;
    });
  }, [
    initialPeople,
    currentUserId,
    search,
    selectedSkill,
    selectedIndustry,
    selectedCollege,
    verifiedOnly,
    openToJoinOnly,
  ]);

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(selectedSkill) ||
    Boolean(selectedIndustry) ||
    Boolean(selectedCollege) ||
    verifiedOnly ||
    openToJoinOnly;

  function clearAllFilters() {
    setSearch("");
    setSelectedSkill(null);
    setSelectedIndustry(null);
    setSelectedCollege(null);
    setVerifiedOnly(false);
    setOpenToJoinOnly(false);
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="glow-dot" />
            <span className="eyebrow">STUDENT FOUNDERS &amp; BUILDERS</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-ink tracking-tight">
            Browse People
          </h1>
          <p className="font-sans text-sm text-ink-soft">
            Discover verified student founders across DU, NSUT, DTU, SRCC and IIT Madras BS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Chip variant="neutral" size="sm">
            {filtered.length} {filtered.length === 1 ? "builder" : "builders"} found
          </Chip>
          <Button
            variant="ghost"
            size="sm"
            className="sm:hidden gap-1.5"
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
          >
            <SlidersHorizontal className="size-3.5" />
            Filters
          </Button>
        </div>
      </div>

      {/* Search and Quick Filters Strip */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-mute pointer-events-none" />
          <Input
            placeholder="Search by name, college, skill (e.g. NSUT, ML, Growth)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-full bg-white shadow-xs"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mute hover:text-ink"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Skill Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-mute mr-1">
            Skill:
          </span>
          <button
            onClick={() => setSelectedSkill(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedSkill === null
                ? "bg-ink text-warm font-semibold shadow-xs"
                : "bg-white border border-line text-ink-soft hover:bg-warm"
            }`}
          >
            All
          </button>
          {SKILLS_LIST.map((s) => {
            const isSelected = selectedSkill === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSkill(isSelected ? null : s.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-orange text-white font-semibold shadow-xs"
                    : "bg-white border border-line text-ink-soft hover:bg-warm"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Filter Pills for Mobile & Desktop */}
        <div className={`flex flex-wrap items-center gap-2 pt-1 ${showFiltersMobile ? "block" : "hidden sm:flex"}`}>
          {/* Verified toggle */}
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
              verifiedOnly
                ? "bg-forest text-white font-semibold shadow-xs"
                : "bg-white border border-line text-ink-soft hover:bg-warm"
            }`}
          >
            <ShieldCheck className="size-3.5" />
            Verified only
          </button>

          {/* Open to join toggle */}
          <button
            onClick={() => setOpenToJoinOnly(!openToJoinOnly)}
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
              openToJoinOnly
                ? "bg-orange text-white font-semibold shadow-xs"
                : "bg-white border border-line text-ink-soft hover:bg-warm"
            }`}
          >
            🛠 Open to join
          </button>

          {/* Industry dropdown pill */}
          <select
            value={selectedIndustry || ""}
            onChange={(e) => setSelectedIndustry(e.target.value || null)}
            className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-line text-ink focus:outline-none focus:ring-1 focus:ring-orange cursor-pointer"
          >
            <option value="">All Industries</option>
            {INDUSTRIES_LIST.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>

          {/* College dropdown pill */}
          <select
            value={selectedCollege || ""}
            onChange={(e) => setSelectedCollege(e.target.value || null)}
            className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-line text-ink focus:outline-none focus:ring-1 focus:ring-orange cursor-pointer max-w-[200px] truncate"
          >
            <option value="">All Campuses</option>
            {COLLEGES_LIST.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="font-mono text-[11px] text-orange-deep hover:underline uppercase tracking-wider font-semibold ml-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of PersonCards */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-line rounded-2xl p-10 text-center max-w-md mx-auto space-y-3 shadow-card">
          <Users2 className="size-10 text-mute mx-auto stroke-[1.5]" />
          <h3 className="font-display text-lg font-bold text-ink">No founders match these filters</h3>
          <p className="font-sans text-xs text-ink-soft">
            Try adjusting your search criteria or clearing selected skills.
          </p>
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((person) => (
            <div
              key={person.id}
              className="bg-card border border-line rounded-2xl p-5 shadow-card hover:border-orange/50 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start gap-3.5">
                  <Link href={`/people/${person.id}`}>
                    <div className="size-14 rounded-full border border-line bg-warm flex items-center justify-center overflow-hidden shrink-0 hover:ring-2 hover:ring-orange transition-all">
                      {person.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={person.avatarUrl}
                          alt={person.fullName}
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="font-display font-extrabold text-lg text-ink">
                          {person.fullName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link
                        href={`/people/${person.id}`}
                        className="font-display font-bold text-base text-ink hover:text-orange transition-colors truncate"
                      >
                        {person.fullName}
                      </Link>
                      {person.chapterVerified && (
                        <Chip variant="verified" size="sm" className="px-1.5 py-0 text-[10px]">
                          ✓
                        </Chip>
                      )}
                      {person.isFellow && (
                        <Chip variant="backed" size="sm" className="px-1.5 py-0 text-[10px]">
                          Fellow
                        </Chip>
                      )}
                    </div>
                    <p className="font-sans text-xs text-ink-soft truncate">
                      {person.college || "Campus"} · {person.city || "India"}
                    </p>
                    {person.headline && (
                      <p className="font-sans text-[11px] text-mute line-clamp-1">
                        {person.headline}
                      </p>
                    )}
                  </div>
                </div>

                {/* Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {person.primarySkill && (
                    <Chip variant="backed" size="sm">
                      {person.primarySkill.toUpperCase()}
                    </Chip>
                  )}
                  {person.secondarySkills?.slice(0, 2).map((s) => (
                    <Chip key={s} variant="neutral" size="sm">
                      {s}
                    </Chip>
                  ))}
                  {person.role === "idea" && (
                    <Chip variant="neutral" size="sm">
                      💡 Has idea
                    </Chip>
                  )}
                  {person.role === "join" && (
                    <Chip variant="verified" size="sm">
                      🛠 Open to join
                    </Chip>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-line/50">
                <Link
                  href={`/people/${person.id}`}
                  className="font-sans text-xs font-semibold text-ink-soft hover:text-ink flex items-center gap-1"
                >
                  View profile <ExternalLink className="size-3" />
                </Link>

                <ConnectDialog
                  targetId={person.id}
                  targetName={person.fullName}
                  triggerButton={
                    <Button variant="solid" size="sm" className="h-8 text-xs px-3.5">
                      Connect
                    </Button>
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
