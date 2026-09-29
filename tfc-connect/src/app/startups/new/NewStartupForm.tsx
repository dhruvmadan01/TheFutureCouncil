"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  FileText,
  Image as ImageIcon,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createStartupAction } from "../actions";
import {
  INDUSTRIES,
  STAGES,
  StartupMetric,
  StartupStage,
  STATUS_TAGS,
} from "../types";

interface ConnectionOption {
  id: string;
  name: string;
  college: string;
  avatar_url: string | null;
}

interface NewStartupFormProps {
  currentUserId: string;
  currentUserName: string;
  acceptedConnections: ConnectionOption[];
  preselectedCoFounderId?: string | null;
}

export function NewStartupForm({
  currentUserId,
  currentUserName,
  acceptedConnections,
  preselectedCoFounderId,
}: NewStartupFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1: Basics
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState<string>("AI/ML");
  const [city, setCity] = useState("Delhi NCR");
  const [foundedYear, setFoundedYear] = useState<number>(new Date().getFullYear());
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  // Step 2: Story
  const [oneLiner, setOneLiner] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [stage, setStage] = useState<StartupStage>("building");
  const [demoVideoUrl, setDemoVideoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [metrics, setMetrics] = useState<StartupMetric[]>([
    { label: "Waitlist", value: "250+ users" },
  ]);

  // Step 3: Team
  const [selectedCoFounders, setSelectedCoFounders] = useState<string[]>(
    preselectedCoFounderId ? [preselectedCoFounderId] : []
  );

  // Step 4: Needs
  const [statusTags, setStatusTags] = useState<string[]>([
    "needs_cofounder",
    "beta_users",
  ]);
  const [hasRole, setHasRole] = useState(false);
  const [roleTitle, setRoleTitle] = useState("");
  const [roleType, setRoleType] = useState<
    "cofounder" | "intern" | "freelance"
  >("cofounder");
  const [roleDesc, setRoleDesc] = useState("");
  const [deckPath, setDeckPath] = useState<string | null>(null);
  const [deckUploading, setDeckUploading] = useState(false);

  // Auto-generate kebab slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugEdited) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50);
      setSlug(generated);
    }
  };

  // Upload helper to Supabase storage
  const handleFileUpload = async (
    file: File,
    bucket: "startup-media" | "decks",
    prefix = ""
  ): Promise<string | null> => {
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${currentUserId}/${prefix}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      if (bucket === "startup-media") {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
      }
      return path; // For private decks
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      alert(`Upload error: ${message}`);
      return null;
    }
  };

  // Metrics Helpers
  const addMetric = () => {
    if (metrics.length < 3) {
      setMetrics([...metrics, { label: "", value: "" }]);
    }
  };

  const removeMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const updateMetric = (index: number, field: "label" | "value", val: string) => {
    const updated = [...metrics];
    updated[index][field] = val;
    setMetrics(updated);
  };

  // Validation per step
  const validateStep1 = () => {
    if (!name.trim()) return "Startup name is required";
    if (!slug.trim()) return "Valid URL slug is required";
    return null;
  };

  const validateStep2 = () => {
    if (!oneLiner.trim()) return "One-liner is required (max 80 chars)";
    if (oneLiner.trim().length > 80) return "One-liner cannot exceed 80 characters";
    return null;
  };

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setErrorMsg(err);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) {
        setErrorMsg(err);
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  // Final Publish
  const handlePublish = async () => {
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await createStartupAction({
        name,
        slug,
        one_liner: oneLiner,
        problem: problem || null,
        solution: solution || null,
        stage,
        industry,
        city: city || null,
        website: website || null,
        demo_video_url: demoVideoUrl || null,
        founded_year: foundedYear || null,
        metrics: metrics.filter((m) => m.label.trim() && m.value.trim()),
        status_tags: statusTags as (
          | "needs_cofounder"
          | "hiring"
          | "beta_users"
          | "raising"
          | "mentors"
        )[],
        logo_url: logoUrl || null,
        cover_url: coverUrl || null,
        deck_path: deckPath || null,
        co_founder_ids: selectedCoFounders,
        initial_role: hasRole
          ? {
              title: roleTitle.trim() || "Co-Founder",
              type: roleType,
              description: roleDesc || null,
            }
          : null,
      });

      if (res.ok) {
        router.push(`/startups/${res.slug}`);
      } else {
        setErrorMsg(res.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-line rounded-3xl p-6 sm:p-10 shadow-card space-y-8">
      {/* 4-Step Indicator Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono font-semibold text-ink-soft">
          <span>STEP {step} OF 4</span>
          <span>
            {step === 1 && "1. Basics"}
            {step === 2 && "2. Story & Metrics"}
            {step === 3 && "3. Team & Co-Founders"}
            {step === 4 && "4. Needs & Opportunities"}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
          <div
            className="h-full bg-orange transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-sans text-xs">
          {errorMsg}
        </div>
      )}

      {/* STEP 1: BASICS */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-bold text-ink">
              The Basics
            </h2>
            <p className="font-sans text-xs text-ink-soft">
              Every great campus startup begins with an identity and clear home.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">
                Startup Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. KisanLink"
                maxLength={60}
                className="w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">
                URL Slug *
              </label>
              <div className="flex items-center rounded-xl border border-line bg-bg px-3.5 py-2 font-mono text-xs text-ink-soft">
                <span>/startups/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                  }}
                  placeholder="kisanlink"
                  className="w-full bg-transparent font-mono text-xs text-ink focus:outline-none ml-0.5"
                />
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <label className="font-sans text-xs font-semibold text-ink">
              Startup Logo (square, PNG or JPG)
            </label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="size-16 rounded-xl object-cover border border-line"
                />
              ) : (
                <div className="size-16 rounded-xl bg-bg border border-line border-dashed flex items-center justify-center text-ink-soft">
                  <ImageIcon className="size-6 text-ink-soft/60" />
                </div>
              )}
              <div>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line bg-bg hover:bg-card font-sans text-xs font-medium text-ink transition-colors">
                  <Upload className="size-3.5" />
                  {logoUploading ? "Uploading..." : "Upload Logo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setLogoUploading(true);
                      const url = await handleFileUpload(file, "startup-media", "logo");
                      if (url) setLogoUrl(url);
                      setLogoUploading(false);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">
                Industry / Sector *
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 font-sans text-xs text-ink focus:outline-none focus:ring-1 focus:ring-ink"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">
                City / Location
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Delhi NCR, Bangalore"
                className="w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 font-sans text-xs text-ink focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">
                Founded Year
              </label>
              <input
                type="number"
                value={foundedYear}
                onChange={(e) => setFoundedYear(parseInt(e.target.value))}
                min={2018}
                max={2030}
                className="w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 font-sans text-xs text-ink focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-sans text-xs font-semibold text-ink">
              Product Website (optional)
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourstartup.com"
              className="w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 font-sans text-xs text-ink focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>
        </div>
      )}

      {/* STEP 2: STORY & METRICS */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-bold text-ink">
              Your Story &amp; Proof of Work
            </h2>
            <p className="font-sans text-xs text-ink-soft">
              Tell campus peers and advisors what you are building and why it matters.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-sans text-xs font-semibold text-ink">
                One-Liner (max 80 characters) *
              </label>
              <span className="font-mono text-[10px] text-ink-soft">
                {oneLiner.length}/80
              </span>
            </div>
            <input
              type="text"
              value={oneLiner}
              onChange={(e) => setOneLiner(e.target.value)}
              placeholder="e.g. WhatsApp-first crop marketplace connecting farmers directly to mandis"
              maxLength={80}
              className="w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">
                The Problem
              </label>
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                rows={3}
                maxLength={600}
                placeholder="What pain point do users experience today?"
                className="w-full rounded-xl border border-line bg-bg p-3 font-sans text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">
                The Solution
              </label>
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                rows={3}
                maxLength={600}
                placeholder="How does your product solve it better/faster/cheaper?"
                className="w-full rounded-xl border border-line bg-bg p-3 font-sans text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-sans text-xs font-semibold text-ink">
              Current Startup Stage
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {STAGES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStage(s.id)}
                  className={`p-2.5 rounded-xl border text-xs font-sans text-center transition-all ${
                    stage === s.id
                      ? "bg-ink text-white font-bold border-ink"
                      : "bg-bg text-ink border-line hover:border-ink/30"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Tiles Builder */}
          <div className="space-y-3 pt-2 border-t border-line">
            <div className="flex items-center justify-between">
              <label className="font-sans text-xs font-semibold text-ink">
                Metric Highlights (up to 3)
              </label>
              {metrics.length < 3 && (
                <button
                  type="button"
                  onClick={addMetric}
                  className="font-mono text-xs text-orange hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="size-3" /> Add metric
                </button>
              )}
            </div>

            <div className="space-y-2">
              {metrics.map((m, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={m.value}
                    onChange={(e) => updateMetric(idx, "value", e.target.value)}
                    placeholder="Value (e.g. ₹20k MRR, 1,200 Waitlist)"
                    className="flex-1 rounded-xl border border-line bg-bg px-3 py-2 font-sans text-xs text-ink focus:outline-none focus:ring-1 focus:ring-ink"
                  />
                  <input
                    type="text"
                    value={m.label}
                    onChange={(e) => updateMetric(idx, "label", e.target.value)}
                    placeholder="Label (e.g. Monthly Revenue, Beta Users)"
                    className="flex-1 rounded-xl border border-line bg-bg px-3 py-2 font-sans text-xs text-ink focus:outline-none focus:ring-1 focus:ring-ink"
                  />
                  <button
                    type="button"
                    onClick={() => removeMetric(idx)}
                    className="p-2 text-ink-soft hover:text-red-600 rounded-lg"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cover & Demo Video */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">
                Cover Image (optional banner)
              </label>
              <label className="cursor-pointer flex items-center justify-center p-3 rounded-xl border border-line border-dashed bg-bg hover:bg-card font-sans text-xs text-ink-soft gap-2">
                <Upload className="size-3.5" />
                {coverUploading
                  ? "Uploading..."
                  : coverUrl
                  ? "✓ Cover uploaded"
                  : "Upload Banner Image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setCoverUploading(true);
                    const url = await handleFileUpload(file, "startup-media", "cover");
                    if (url) setCoverUrl(url);
                    setCoverUploading(false);
                  }}
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">
                Demo Video / Loom URL (optional)
              </label>
              <input
                type="url"
                value={demoVideoUrl}
                onChange={(e) => setDemoVideoUrl(e.target.value)}
                placeholder="https://youtube.com/... or loom.com/..."
                className="w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 font-sans text-xs text-ink focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: TEAM & CO-FOUNDERS */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-bold text-ink">
              Founding Team
            </h2>
            <p className="font-sans text-xs text-ink-soft">
              Showcase the people behind the mission. You are listed automatically as the founder.
            </p>
          </div>

          {/* Current User Card */}
          <div className="p-4 rounded-2xl border border-line bg-bg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-ink text-white font-display text-sm font-bold flex items-center justify-center">
                {currentUserName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-display text-sm font-bold text-ink">
                  {currentUserName} (You)
                </p>
                <p className="font-sans text-xs text-ink-soft">
                  Founder &amp; Owner
                </p>
              </div>
            </div>
            <span className="font-mono text-[10px] font-semibold text-forest bg-forest-soft px-2.5 py-0.5 rounded-full border border-forest/20">
              Primary Founder
            </span>
          </div>

          {/* Select Co-founders from accepted connections */}
          <div className="space-y-3">
            <label className="font-sans text-xs font-semibold text-ink">
              Add Co-Founders from TFC Connect
            </label>
            <p className="font-sans text-xs text-ink-soft">
              Anyone you team up with receives the &quot;Met on TFC Connect 🤝&quot; badge on your public startup page.
            </p>

            {acceptedConnections.length === 0 ? (
              <div className="p-4 rounded-xl border border-line bg-bg text-center text-xs text-ink-soft">
                No accepted connections yet. You can always add team members later from your dashboard!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {acceptedConnections.map((conn) => {
                  const isChecked = selectedCoFounders.includes(conn.id);
                  return (
                    <button
                      key={conn.id}
                      type="button"
                      onClick={() =>
                        setSelectedCoFounders((prev) =>
                          isChecked
                            ? prev.filter((id) => id !== conn.id)
                            : [...prev, conn.id]
                        )
                      }
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isChecked
                          ? "bg-forest-soft/40 border-forest"
                          : "bg-bg border-line hover:border-ink/20"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-8 rounded-full bg-ink text-white font-display text-xs font-bold flex items-center justify-center shrink-0">
                          {conn.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-display text-xs font-bold text-ink truncate">
                            {conn.name}
                          </p>
                          <p className="font-sans text-[11px] text-ink-soft truncate">
                            {conn.college}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`size-5 rounded-md border flex items-center justify-center ${
                          isChecked
                            ? "bg-forest border-forest text-white"
                            : "border-line bg-card"
                        }`}
                      >
                        {isChecked && <Check className="size-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: NEEDS & OPEN ROLES */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-bold text-ink">
              What Does Your Startup Need?
            </h2>
            <p className="font-sans text-xs text-ink-soft">
              Help campus builders and advisors discover how they can help you grow.
            </p>
          </div>

          {/* Status Tags */}
          <div className="space-y-2">
            <label className="font-sans text-xs font-semibold text-ink">
              Select all opportunities you are actively pursuing:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STATUS_TAGS.map((tag) => {
                const isSelected = statusTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() =>
                      setStatusTags((prev) =>
                        isSelected
                          ? prev.filter((t) => t !== tag.id)
                          : [...prev, tag.id]
                      )
                    }
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-orange-soft/50 border-orange"
                        : "bg-bg border-line hover:border-ink/20"
                    }`}
                  >
                    <span className="font-sans text-xs font-semibold text-ink">
                      {tag.label}
                    </span>
                    <div
                      className={`size-5 rounded-md border flex items-center justify-center ${
                        isSelected
                          ? "bg-orange border-orange text-white"
                          : "border-line bg-card"
                      }`}
                    >
                      {isSelected && <Check className="size-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Initial Open Role */}
          <div className="pt-4 border-t border-line space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="font-sans text-xs font-semibold text-ink flex items-center gap-1.5">
                  <Briefcase className="size-4 text-orange" />
                  List an Initial Open Role (optional)
                </label>
                <p className="font-sans text-[11px] text-ink-soft">
                  Enable candidates to apply directly through your public startup page.
                </p>
              </div>
              <input
                type="checkbox"
                checked={hasRole}
                onChange={(e) => setHasRole(e.target.checked)}
                className="size-4 text-ink rounded border-line"
              />
            </div>

            {hasRole && (
              <div className="p-4 rounded-2xl border border-line bg-bg space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-sans text-xs font-semibold text-ink">
                      Role Title
                    </label>
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="e.g. Co-Founder / Tech Lead"
                      className="w-full rounded-xl border border-line bg-card px-3 py-2 font-sans text-xs text-ink focus:outline-none focus:ring-1 focus:ring-ink"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-sans text-xs font-semibold text-ink">
                      Role Type
                    </label>
                    <select
                      value={roleType}
                      onChange={(e) =>
                        setRoleType(
                          e.target.value as "cofounder" | "intern" | "freelance"
                        )
                      }
                      className="w-full rounded-xl border border-line bg-card px-3 py-2 font-sans text-xs text-ink focus:outline-none focus:ring-1 focus:ring-ink"
                    >
                      <option value="cofounder">Co-Founder</option>
                      <option value="intern">Intern</option>
                      <option value="freelance">Freelance / Contractor</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-xs font-semibold text-ink">
                    Role Description &amp; Requirements
                  </label>
                  <textarea
                    value={roleDesc}
                    onChange={(e) => setRoleDesc(e.target.value)}
                    rows={2}
                    placeholder="What will they own? Key technical skills, equity expectations..."
                    className="w-full rounded-xl border border-line bg-card p-3 font-sans text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:ring-1 focus:ring-ink"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Pitch Deck Upload (Private Bucket) */}
          <div className="pt-4 border-t border-line space-y-2">
            <label className="font-sans text-xs font-semibold text-ink flex items-center gap-1.5">
              <FileText className="size-4 text-forest" />
              Upload Pitch Deck (PDF, private storage)
            </label>
            <p className="font-sans text-[11px] text-ink-soft">
              Stored securely in the private `decks` bucket. Visible only to team members and verified TFC admins.
            </p>

            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-bg hover:bg-card font-sans text-xs font-medium text-ink transition-colors">
              <Upload className="size-3.5" />
              {deckUploading
                ? "Uploading deck..."
                : deckPath
                ? "✓ Pitch deck attached"
                : "Choose PDF Deck"}
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setDeckUploading(true);
                  const path = await handleFileUpload(file, "decks", "pitchdeck");
                  if (path) setDeckPath(path);
                  setDeckUploading(false);
                }}
              />
            </label>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-line">
        {step > 1 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3 | 4) : 1))}
            className="gap-1.5"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        ) : (
          <Link href="/startups">
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </Link>
        )}

        {step < 4 ? (
          <Button
            type="button"
            variant="solid"
            size="sm"
            onClick={handleNext}
            className="gap-1.5"
          >
            Continue
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="solid"
            size="sm"
            onClick={handlePublish}
            disabled={submitting}
            className="gap-1.5"
          >
            <Sparkles className="size-4" />
            {submitting ? "Publishing listing..." : "Publish Startup Listing"}
          </Button>
        )}
      </div>
    </div>
  );
}
