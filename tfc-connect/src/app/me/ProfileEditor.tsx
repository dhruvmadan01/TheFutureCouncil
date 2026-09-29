"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/badge";
import { updateMyProfileAction } from "./actions";
import {
  ExternalLink,
  Mail,
  Phone,
  Lock,
  Edit3,
  Eye,
  Check,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  Save,
} from "lucide-react";
import { LinkedInIcon } from "@/components/icons/LinkedInIcon";
import { type ProfileEditData } from "@/lib/onboarding/schemas";

const SKILL_OPTIONS = [
  { id: "tech", label: "Tech" },
  { id: "product", label: "Product" },
  { id: "design", label: "Design" },
  { id: "growth", label: "Growth" },
  { id: "sales", label: "Sales/BD" },
  { id: "ops", label: "Ops/Finance" },
  { id: "domain", label: "Domain expert" },
] as const;

const PRESET_INDUSTRIES = [
  "AgriTech",
  "EdTech",
  "FinTech",
  "AI/ML",
  "Climate",
  "Health",
  "SaaS",
  "Consumer",
  "B2B",
  "Social",
];

interface ProofLink {
  url: string;
  title: string;
  note?: string;
}

interface ProfileEditorProps {
  profile: {
    id: string;
    full_name?: string | null;
    avatar_url?: string | null;
    headline?: string | null;
    college?: string | null;
    city?: string | null;
    bio?: string | null;
    why_startup?: string | null;
    role?: "idea" | "join" | "either" | null;
    primary_skill?: (typeof SKILL_OPTIONS)[number]["id"] | null;
    secondary_skills?: string[] | null;
    looking_for_skills?: string[] | null;
    industries?: string[] | null;
    commitment?: "full_time" | "part_time" | "after_grad" | null;
    remote_ok?: boolean | null;
    equity_pref?: "equal" | "open" | "depends" | null;
    proof_links?: ProofLink[] | null;
    work_style?: { speed?: number; risk?: number; hours?: number; decision?: number } | null;
    chapter_verified?: boolean | null;
    is_fellow?: boolean | null;
    is_admin?: boolean | null;
    onboarding_complete?: boolean | null;
    hide_from_own_college?: boolean | null;
    hidden?: boolean | null;
    chapters?: { name: string; college: string } | null;
  };
  contacts: {
    email?: string | null;
    phone?: string | null;
    linkedin_url?: string | null;
  } | null;
}

export function ProfileEditor({ profile, contacts }: ProfileEditorProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [headline, setHeadline] = useState(profile.headline || "");
  const [college, setCollege] = useState(profile.college || "");
  const [city, setCity] = useState(profile.city || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [whyStartup, setWhyStartup] = useState(profile.why_startup || "");

  const [role, setRole] = useState<"idea" | "join" | "either">(profile.role || "idea");
  const [primarySkill, setPrimarySkill] = useState<(typeof SKILL_OPTIONS)[number]["id"]>(
    (profile.primary_skill as (typeof SKILL_OPTIONS)[number]["id"]) || "tech"
  );
  const [secondarySkills, setSecondarySkills] = useState<string[]>(
    profile.secondary_skills || []
  );
  const [lookingForSkills, setLookingForSkills] = useState<string[]>(
    profile.looking_for_skills || ["tech"]
  );
  const [industries, setIndustries] = useState<string[]>(
    profile.industries || ["AgriTech"]
  );
  const [commitment, setCommitment] = useState<"full_time" | "part_time" | "after_grad">(
    profile.commitment || "full_time"
  );
  const [remoteOk, setRemoteOk] = useState(profile.remote_ok ?? true);
  const [equityPref, setEquityPref] = useState<"equal" | "open" | "depends">(
    profile.equity_pref || "open"
  );

  const [proofLinks, setProofLinks] = useState<ProofLink[]>(
    profile.proof_links?.length
      ? profile.proof_links
      : [{ url: "https://github.com", title: "GitHub Projects", note: "Code and prototypes" }]
  );

  const [speed, setSpeed] = useState(profile.work_style?.speed ?? 50);
  const [risk, setRisk] = useState(profile.work_style?.risk ?? 60);
  const [hours, setHours] = useState(profile.work_style?.hours ?? 80);
  const [decision, setDecision] = useState(profile.work_style?.decision ?? 40);

  // Contact & Privacy State
  const [email, setEmail] = useState(contacts?.email || "");
  const [phone, setPhone] = useState(contacts?.phone || "");
  const [linkedinUrl, setLinkedinUrl] = useState(contacts?.linkedin_url || "");
  const [hideFromOwnCollege, setHideFromOwnCollege] = useState(
    profile.hide_from_own_college ?? false
  );
  const [hidden, setHidden] = useState(profile.hidden ?? false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const payload: ProfileEditData = {
      full_name: fullName.trim(),
      headline: headline.trim() || undefined,
      college: college.trim() || undefined,
      city: city.trim() || undefined,
      bio: bio.trim() || undefined,
      why_startup: whyStartup.trim() || undefined,
      role,
      primary_skill: primarySkill,
      secondary_skills: secondarySkills as ProfileEditData["secondary_skills"],
      looking_for_skills: lookingForSkills as ProfileEditData["looking_for_skills"],
      industries,
      commitment,
      remote_ok: remoteOk,
      equity_pref: equityPref,
      proof_links: proofLinks.filter((l) => l.url.trim() && l.title.trim()),
      speed,
      risk,
      hours,
      decision,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      linkedin_url: linkedinUrl.trim() || undefined,
      hide_from_own_college: hideFromOwnCollege,
      hidden,
    };

    const res = await updateMyProfileAction(payload);
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setMode("view");
    }, 1200);
  }

  function toggleSecondary(id: string) {
    if (secondarySkills.includes(id)) {
      setSecondarySkills(secondarySkills.filter((s) => s !== id));
    } else if (secondarySkills.length < 3) {
      setSecondarySkills([...secondarySkills, id]);
    }
  }

  function toggleLooking(id: string) {
    if (lookingForSkills.includes(id)) {
      setLookingForSkills(lookingForSkills.filter((s) => s !== id));
    } else if (lookingForSkills.length < 3) {
      setLookingForSkills([...lookingForSkills, id]);
    }
  }

  function toggleIndustry(ind: string) {
    if (industries.includes(ind)) {
      setIndustries(industries.filter((i) => i !== ind));
    } else if (industries.length < 5) {
      setIndustries([...industries, ind]);
    }
  }

  return (
    <div className="space-y-6">
      {/* Mode switcher tabs */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex gap-2">
          <Button
            variant={mode === "view" ? "solid" : "ghost"}
            size="sm"
            onClick={() => setMode("view")}
            className="gap-2"
          >
            <Eye className="size-4" />
            Public Preview
          </Button>
          <Button
            variant={mode === "edit" ? "solid" : "ghost"}
            size="sm"
            onClick={() => setMode("edit")}
            className="gap-2"
          >
            <Edit3 className="size-4" />
            Edit Profile
          </Button>
        </div>

        {mode === "edit" && (
          <Button
            variant="solid"
            size="sm"
            form="profile-edit-form"
            type="submit"
            disabled={loading}
            className="gap-2"
          >
            <Save className="size-4" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>

      {success && (
        <div className="bg-forest-soft border border-forest/30 rounded-xl p-3 text-forest text-xs font-semibold flex items-center gap-2">
          <Check className="size-4" /> Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="bg-plum-soft border border-plum/30 rounded-xl p-3 text-plum text-xs font-semibold">
          {error}
        </div>
      )}

      {mode === "view" ? (
        /* PUBLIC PREVIEW MODE */
        <div className="bg-card border border-line rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-start gap-4 pb-6 border-b border-line/60">
            <div className="size-20 rounded-full border-2 border-line bg-warm flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={fullName || "Founder"}
                  className="size-full object-cover"
                />
              ) : (
                <span className="font-display font-extrabold text-2xl text-ink">
                  {fullName ? fullName.charAt(0).toUpperCase() : "U"}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                  {fullName || "Founder"}
                </h2>
                {profile.chapter_verified && (
                  <Chip variant="verified" size="sm">
                    <ShieldCheck className="size-3" /> ✓ Verified
                  </Chip>
                )}
                {profile.is_fellow && (
                  <Chip variant="backed" size="sm">
                    <Sparkles className="size-3" /> TFC Fellow
                  </Chip>
                )}
              </div>

              <p className="font-sans text-xs sm:text-sm text-ink-soft">
                {headline ||
                  `${primarySkill.toUpperCase()} · ${college || "Campus"} · ${city || "India"}`}
              </p>

              {profile.chapters && (
                <p className="font-mono text-[11px] text-orange-deep font-semibold">
                  {profile.chapters.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {role === "idea" && <Chip variant="neutral">💡 Has an idea</Chip>}
            {role === "join" && <Chip variant="verified">🛠 Open to join</Chip>}
            {role === "either" && <Chip variant="backed">🤝 Open to either</Chip>}
            <Chip variant="neutral">
              {commitment === "full_time"
                ? "Full-time"
                : commitment === "part_time"
                ? "Part-time"
                : "After graduation"}
            </Chip>
            {remoteOk && <Chip variant="neutral">Remote OK</Chip>}
            <Chip variant="backed">Primary: {primarySkill.toUpperCase()}</Chip>
            {secondarySkills.map((sk) => (
              <Chip key={sk} variant="neutral">
                {sk}
              </Chip>
            ))}
          </div>

          {/* Contact Details (Owner can view own contacts) */}
          <div className="bg-warm/60 border border-line rounded-xl p-4 sm:p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">
                Your Contact Details (RLS Protected)
              </span>
              <span className="font-mono text-[10px] text-forest flex items-center gap-1 font-semibold">
                <Lock className="size-3" /> Visible to accepted connections
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs font-sans text-ink">
                <Mail className="size-4 text-orange" />
                <span className="font-medium">{email || "No email listed"}</span>
              </div>
              {linkedinUrl && (
                <div className="flex items-center gap-2 text-xs font-sans text-ink">
                  <LinkedInIcon className="size-4 text-ballpoint" />
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline font-medium text-ballpoint flex items-center gap-1"
                  >
                    LinkedIn Profile <ExternalLink className="size-3" />
                  </a>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-2 text-xs font-sans text-ink">
                  <Phone className="size-4 text-forest" />
                  <span>{phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* About & Why Startup */}
          {(bio || whyStartup) && (
            <div className="space-y-3 pt-2">
              <h3 className="font-display text-lg font-bold text-ink">About</h3>
              {bio && <p className="font-sans text-sm text-ink-soft leading-relaxed">{bio}</p>}
              {whyStartup && (
                <div className="bg-orange-soft/40 border border-orange/20 rounded-xl p-3.5 space-y-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-orange-deep font-bold">
                    Why I want to start up
                  </span>
                  <p className="font-sans text-xs text-ink leading-relaxed">
                    &ldquo;{whyStartup}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Proof of Work */}
          {proofLinks.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="font-display text-lg font-bold text-ink">Proof of Work</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {proofLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 bg-white border border-line rounded-xl hover:border-orange transition-all block space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-sm text-ink">{link.title}</span>
                      <ExternalLink className="size-3.5 text-mute" />
                    </div>
                    {link.note && (
                      <p className="font-sans text-xs text-ink-soft line-clamp-2">{link.note}</p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* EDIT PROFILE MODE */
        <form id="profile-edit-form" onSubmit={handleSave} className="space-y-8">
          {/* Section 1: Basics */}
          <div className="bg-card border border-line rounded-2xl p-6 sm:p-8 shadow-card space-y-5">
            <h3 className="font-display text-xl font-bold text-ink">Basic Info</h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">
                  Full Name <span className="text-orange">*</span>
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">
                  Headline (Short Tagline)
                </label>
                <Input
                  placeholder="e.g. Full-stack builder passionate about AgriTech"
                  value={headline}
                  maxLength={120}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">
                    College / Organization
                  </label>
                  <Input
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">
                    City
                  </label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">
                  About / Bio (Max 600 chars)
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  maxLength={600}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell founders about your background, what you love to ship, and what drives you."
                  className="w-full rounded-xl border border-line bg-white p-3 font-sans text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">
                    Why do you want to start up? (Max 200 chars)
                  </label>
                  <span className="font-mono text-[10px] text-mute">{whyStartup.length}/200</span>
                </div>
                <textarea
                  rows={2}
                  value={whyStartup}
                  maxLength={200}
                  onChange={(e) => setWhyStartup(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white p-3 font-sans text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Skills & Matching Preferences */}
          <div className="bg-card border border-line rounded-2xl p-6 sm:p-8 shadow-card space-y-5">
            <h3 className="font-display text-xl font-bold text-ink">Skills &amp; Collaboration</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold block">
                  Current Role / State
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "idea", label: "💡 Has an idea" },
                    { id: "join", label: "🛠 Open to join" },
                    { id: "either", label: "🤝 Either works" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as "idea" | "join" | "either")}
                      className={`p-2.5 rounded-xl font-sans text-xs font-semibold text-center border transition-all ${
                        role === r.id
                          ? "bg-orange text-white border-orange shadow-sm"
                          : "bg-white border-line text-ink hover:bg-warm"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-line/60">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold block">
                  Primary Skill
                </label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setPrimarySkill(s.id)}
                      className={`px-3 py-1.5 rounded-full font-sans text-xs font-semibold transition-all ${
                        primarySkill === s.id
                          ? "bg-orange text-white shadow-sm"
                          : "bg-white border border-line text-ink hover:bg-warm"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-line/60">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold block">
                  Secondary Skills (Up to 3)
                </label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.filter((s) => s.id !== primarySkill).map((s) => {
                    const isSelected = secondarySkills.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSecondary(s.id)}
                        className={`px-3 py-1.5 rounded-full font-sans text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-ink text-warm"
                            : "bg-white border border-line text-ink-soft hover:border-ink/30"
                        }`}
                      >
                        {s.label} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-line/60">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold block">
                  Looking For Skills (1–3)
                </label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((s) => {
                    const isSelected = lookingForSkills.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleLooking(s.id)}
                        className={`px-3 py-1.5 rounded-full font-sans text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-orange text-white"
                            : "bg-white border border-line text-ink hover:bg-warm"
                        }`}
                      >
                        {s.label} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-line/60">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold block">
                  Industries (1–5)
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_INDUSTRIES.map((ind) => {
                    const isSelected = industries.includes(ind);
                    return (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => toggleIndustry(ind)}
                        className={`px-3 py-1.5 rounded-full font-sans text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-ink text-warm"
                            : "bg-white border border-line text-ink-soft"
                        }`}
                      >
                        {ind} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-line/60">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold block">
                  Commitment Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "full_time", label: "Full-time" },
                    { id: "part_time", label: "Part-time" },
                    { id: "after_grad", label: "After grad" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCommitment(c.id as "full_time" | "part_time" | "after_grad")}
                      className={`p-2.5 rounded-xl font-sans text-xs font-semibold text-center border transition-all ${
                        commitment === c.id
                          ? "bg-orange text-white border-orange shadow-sm"
                          : "bg-white border-line text-ink hover:bg-warm"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-line/60 flex items-center justify-between">
                <div>
                  <span className="font-sans text-xs font-bold text-ink block">Remote Friendly</span>
                  <span className="font-sans text-[11px] text-mute">Open to working remotely</span>
                </div>
                <input
                  type="checkbox"
                  checked={remoteOk}
                  onChange={(e) => setRemoteOk(e.target.checked)}
                  className="accent-orange size-4 cursor-pointer"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-line/60">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold block">
                  Equity Expectation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "equal", label: "Equal split (50/50)" },
                    { id: "open", label: "Open to talk" },
                    { id: "depends", label: "Depends on stage" },
                  ].map((eq) => (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => setEquityPref(eq.id as "equal" | "open" | "depends")}
                      className={`p-2.5 rounded-xl font-sans text-xs font-semibold text-center border transition-all ${
                        equityPref === eq.id
                          ? "bg-ink text-warm border-ink shadow-sm"
                          : "bg-white border-line text-ink-soft hover:bg-warm"
                      }`}
                    >
                      {eq.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Proof of Work */}
          <div className="bg-card border border-line rounded-2xl p-6 sm:p-8 shadow-card space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-ink">Proof of Work</h3>
              {proofLinks.length < 3 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setProofLinks([...proofLinks, { title: "", url: "https://", note: "" }])
                  }
                  className="gap-1.5"
                >
                  <Plus className="size-3.5" /> Add Link
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {proofLinks.map((link, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-warm/50 border border-line rounded-xl space-y-2.5 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-orange-deep font-bold">
                      Link #{idx + 1}
                    </span>
                    {proofLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setProofLinks(proofLinks.filter((_, i) => i !== idx))}
                        className="text-plum hover:text-plum/80 text-xs p-1"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      placeholder="Title"
                      value={link.title}
                      onChange={(e) => {
                        const updated = [...proofLinks];
                        updated[idx].title = e.target.value;
                        setProofLinks(updated);
                      }}
                      required
                    />
                    <Input
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => {
                        const updated = [...proofLinks];
                        updated[idx].url = e.target.value;
                        setProofLinks(updated);
                      }}
                      required
                    />
                  </div>
                  <Input
                    placeholder="Note / Metric"
                    value={link.note || ""}
                    onChange={(e) => {
                      const updated = [...proofLinks];
                      updated[idx].note = e.target.value;
                      setProofLinks(updated);
                    }}
                    className="text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Working Style */}
          <div className="bg-card border border-line rounded-2xl p-6 sm:p-8 shadow-card space-y-5">
            <h3 className="font-display text-xl font-bold text-ink">Working Style</h3>

            <div className="space-y-4">
              <div className="space-y-1.5 p-3.5 bg-warm/50 border border-line rounded-xl">
                <div className="flex justify-between text-xs font-semibold text-ink">
                  <span className="text-orange-deep">Ship fast</span>
                  <span className="font-mono text-mute">{speed}%</span>
                  <span>Polish first</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full accent-orange cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 p-3.5 bg-warm/50 border border-line rounded-xl">
                <div className="flex justify-between text-xs font-semibold text-ink">
                  <span>Play safe</span>
                  <span className="font-mono text-mute">{risk}%</span>
                  <span className="text-orange-deep">Big bets</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={risk}
                  onChange={(e) => setRisk(Number(e.target.value))}
                  className="w-full accent-orange cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 p-3.5 bg-warm/50 border border-line rounded-xl">
                <div className="flex justify-between text-xs font-semibold text-ink">
                  <span>20 hrs/week</span>
                  <span className="font-mono text-mute">{hours}%</span>
                  <span className="text-orange-deep">40+ hrs/week</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full accent-orange cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 p-3.5 bg-warm/50 border border-line rounded-xl">
                <div className="flex justify-between text-xs font-semibold text-ink">
                  <span>Decide with data</span>
                  <span className="font-mono text-mute">{decision}%</span>
                  <span className="text-orange-deep">Decide with gut</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={decision}
                  onChange={(e) => setDecision(Number(e.target.value))}
                  className="w-full accent-orange cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Contact & Privacy (RLS Boundaries) */}
          <div className="bg-card border border-line rounded-2xl p-6 sm:p-8 shadow-card space-y-5">
            <div className="space-y-1">
              <h3 className="font-display text-xl font-bold text-ink">Contact &amp; Privacy</h3>
              <p className="font-sans text-xs text-ink-soft">
                Contact details are protected by Row-Level Security and unlocked only upon mutual connection.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">
                    LinkedIn URL
                  </label>
                  <Input
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">
                    Phone / WhatsApp (Optional)
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {/* Privacy toggles */}
              <div className="pt-2 border-t border-line/60 space-y-3">
                <label className="flex items-center justify-between p-3 bg-warm/50 border border-line rounded-xl cursor-pointer">
                  <div>
                    <span className="font-sans text-xs font-bold text-ink block">
                      Hide profile from members of my own college
                    </span>
                    <span className="font-sans text-[11px] text-mute">
                      Protects idea privacy from campus peers while browsing India-wide.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hideFromOwnCollege}
                    onChange={(e) => setHideFromOwnCollege(e.target.checked)}
                    className="accent-orange size-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-warm/50 border border-line rounded-xl cursor-pointer">
                  <div>
                    <span className="font-sans text-xs font-bold text-ink block">
                      Pause matching (Hidden)
                    </span>
                    <span className="font-sans text-[11px] text-mute">
                      Temporarily removes your profile from daily matches and browse directory.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hidden}
                    onChange={(e) => setHidden(e.target.checked)}
                    className="accent-orange size-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setMode("view")}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              type="submit"
              disabled={loading}
              className="gap-2 px-8"
            >
              <Save className="size-4" />
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
