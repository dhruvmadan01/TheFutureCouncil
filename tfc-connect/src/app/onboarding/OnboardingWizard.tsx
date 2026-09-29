"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  Lightbulb,
  Wrench,
  Users2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  saveStep1Action,
  saveStep2Action,
  saveStep3Action,
  saveStep4Action,
  saveStep5AndCompleteAction,
  uploadAvatarAction,
} from "./actions";
import {
  type Step1Data,
  type Step2Data,
  type Step3Data,
  type Step4Data,
  type Step5Data,
} from "@/lib/onboarding/schemas";
import { trackEvent } from "@/lib/analytics/posthog";

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

interface ProofLinkItem {
  url: string;
  title: string;
  note: string;
}

interface OnboardingWizardProps {
  initialProfile?: {
    full_name?: string | null;
    avatar_url?: string | null;
    college?: string | null;
    city?: string | null;
    role?: "idea" | "join" | "either" | null;
    primary_skill?: (typeof SKILL_OPTIONS)[number]["id"] | null;
    secondary_skills?: string[] | null;
    looking_for_skills?: string[] | null;
    industries?: string[] | null;
    commitment?: "full_time" | "part_time" | "after_grad" | null;
    remote_ok?: boolean | null;
    equity_pref?: "equal" | "open" | "depends" | null;
    proof_links?: ProofLinkItem[] | null;
    why_startup?: string | null;
    work_style?: { speed?: number; risk?: number; hours?: number; decision?: number } | null;
    onboarding_complete?: boolean | null;
  };
  initialEmail?: string;
  initialLinkedIn?: string;
}

export function OnboardingWizard({
  initialProfile,
  initialEmail = "",
  initialLinkedIn = "",
}: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedCelebration, setCompletedCelebration] = useState(false);
  const [matchesCount, setMatchesCount] = useState<number>(0);

  // Step 1 State
  const [avatarUrl, setAvatarUrl] = useState<string>(initialProfile?.avatar_url || "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [fullName, setFullName] = useState<string>(initialProfile?.full_name || "");
  const [college, setCollege] = useState<string>(initialProfile?.college || "");
  const [city, setCity] = useState<string>(initialProfile?.city || "");
  const [email, setEmail] = useState<string>(initialEmail);
  const [linkedinUrl, setLinkedinUrl] = useState<string>(initialLinkedIn);
  const [chapterCode, setChapterCode] = useState<string>("");

  // Step 2 State
  const [role, setRole] = useState<"idea" | "join" | "either">(
    (initialProfile?.role as "idea" | "join" | "either") || "idea"
  );
  const [primarySkill, setPrimarySkill] = useState<(typeof SKILL_OPTIONS)[number]["id"]>(
    (initialProfile?.primary_skill as (typeof SKILL_OPTIONS)[number]["id"]) || "tech"
  );
  const [secondarySkills, setSecondarySkills] = useState<string[]>(
    initialProfile?.secondary_skills || []
  );

  // Step 3 State
  const [lookingForSkills, setLookingForSkills] = useState<string[]>(
    initialProfile?.looking_for_skills || ["product"]
  );
  const [industries, setIndustries] = useState<string[]>(
    initialProfile?.industries || ["AgriTech", "FinTech"]
  );
  const [customIndustry, setCustomIndustry] = useState("");
  const [commitment, setCommitment] = useState<"full_time" | "part_time" | "after_grad">(
    (initialProfile?.commitment as "full_time" | "part_time" | "after_grad") || "full_time"
  );
  const [remoteOk, setRemoteOk] = useState<boolean>(initialProfile?.remote_ok ?? true);
  const [equityPref, setEquityPref] = useState<"equal" | "open" | "depends">(
    (initialProfile?.equity_pref as "equal" | "open" | "depends") || "equal"
  );

  // Step 4 State
  const [proofLinks, setProofLinks] = useState<ProofLinkItem[]>(
    (initialProfile?.proof_links as ProofLinkItem[])?.length
      ? (initialProfile?.proof_links as ProofLinkItem[])
      : [{ url: "https://github.com/", title: "GitHub & Projects", note: "Code and prototypes" }]
  );
  const [whyStartup, setWhyStartup] = useState<string>(
    initialProfile?.why_startup || "I want to build software that solves critical problems for India."
  );

  // Step 5 State
  const [speed, setSpeed] = useState<number>(initialProfile?.work_style?.speed ?? 40);
  const [risk, setRisk] = useState<number>(initialProfile?.work_style?.risk ?? 75);
  const [hours, setHours] = useState<number>(initialProfile?.work_style?.hours ?? 80);
  const [decision, setDecision] = useState<number>(initialProfile?.work_style?.decision ?? 35);

  // Avatar Upload Handler
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadAvatarAction(formData);
      if (res.ok && res.data?.avatarUrl) {
        setAvatarUrl(res.data.avatarUrl);
      } else {
        setErrorMessage(res.ok ? "Upload failed" : res.error);
      }
    } catch {
      setErrorMessage("Error uploading photo. Try again.");
    } finally {
      setAvatarUploading(false);
    }
  }

  // Step 1 Submit
  async function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const data: Step1Data = {
      full_name: fullName.trim(),
      college: college.trim(),
      city: city.trim(),
      email: email.trim(),
      linkedin_url: linkedinUrl.trim() || undefined,
      chapter_code: chapterCode.trim() || undefined,
      avatar_url: avatarUrl || undefined,
    };

    const res = await saveStep1Action(data);
    setLoading(false);

    if (!res.ok) {
      setErrorMessage(res.error);
      return;
    }

    trackEvent("onboarding_step_completed", { step: 1, college: data.college, city: data.city });
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Step 2 Submit
  async function handleStep2Submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const data: Step2Data = {
      role,
      primary_skill: primarySkill,
      secondary_skills: secondarySkills as Step2Data["secondary_skills"],
    };

    const res = await saveStep2Action(data);
    setLoading(false);

    if (!res.ok) {
      setErrorMessage(res.error);
      return;
    }

    trackEvent("onboarding_step_completed", { step: 2, role: data.role, primary_skill: data.primary_skill });
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Step 3 Submit
  async function handleStep3Submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (lookingForSkills.length === 0) {
      setErrorMessage("Please select at least 1 skill you are looking for");
      return;
    }
    if (industries.length === 0) {
      setErrorMessage("Please select at least 1 industry");
      return;
    }

    setLoading(true);

    const data: Step3Data = {
      looking_for_skills: lookingForSkills as Step3Data["looking_for_skills"],
      industries,
      commitment,
      city: city.trim() || "Delhi NCR",
      remote_ok: remoteOk,
      equity_pref: equityPref,
    };

    const res = await saveStep3Action(data);
    setLoading(false);

    if (!res.ok) {
      setErrorMessage(res.error);
      return;
    }

    trackEvent("onboarding_step_completed", { step: 3, commitment: data.commitment, industries: data.industries });
    setStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Step 4 Submit
  async function handleStep4Submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const validLinks = proofLinks.filter((l) => l.url.trim() && l.title.trim());
    if (validLinks.length === 0) {
      setErrorMessage("Please add at least 1 proof of work link");
      return;
    }
    if (whyStartup.trim().length < 10) {
      setErrorMessage("Why do you want to start up must be at least 10 characters");
      return;
    }

    setLoading(true);

    const data: Step4Data = {
      proof_links: validLinks,
      why_startup: whyStartup.trim(),
    };

    const res = await saveStep4Action(data);
    setLoading(false);

    if (!res.ok) {
      setErrorMessage(res.error);
      return;
    }

    trackEvent("onboarding_step_completed", { step: 4, links_count: validLinks.length });
    setStep(5);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Step 5 Submit (Final Completion)
  async function handleStep5Submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const data: Step5Data = {
      speed,
      risk,
      hours,
      decision,
    };

    const res = await saveStep5AndCompleteAction(data);
    setLoading(false);

    if (!res.ok) {
      setErrorMessage(res.error);
      return;
    }

    trackEvent("onboarding_step_completed", { step: 5, matches_count: res.data?.matchesComputed || 5 });
    setMatchesCount(res.data?.matchesComputed || 5);
    setCompletedCelebration(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleSecondarySkill(id: string) {
    if (secondarySkills.includes(id)) {
      setSecondarySkills(secondarySkills.filter((s) => s !== id));
    } else {
      if (secondarySkills.length < 3) {
        setSecondarySkills([...secondarySkills, id]);
      }
    }
  }

  function toggleLookingForSkill(id: string) {
    if (lookingForSkills.includes(id)) {
      setLookingForSkills(lookingForSkills.filter((s) => s !== id));
    } else {
      if (lookingForSkills.length < 3) {
        setLookingForSkills([...lookingForSkills, id]);
      }
    }
  }

  function toggleIndustry(ind: string) {
    if (industries.includes(ind)) {
      setIndustries(industries.filter((i) => i !== ind));
    } else {
      if (industries.length < 5) {
        setIndustries([...industries, ind]);
      }
    }
  }

  function addCustomIndustry() {
    const val = customIndustry.trim();
    if (!val) return;
    if (!industries.includes(val) && industries.length < 5) {
      setIndustries([...industries, val]);
    }
    setCustomIndustry("");
  }

  return (
    <div className="max-w-[680px] mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
      {/* Top progress bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono tracking-wider uppercase text-mute">
          <span className="flex items-center gap-1.5 text-orange-deep font-semibold">
            <span className="glow-dot size-1.5" />
            STEP {step} OF 5
          </span>
          <span>{step * 20}% COMPLETED</span>
        </div>
        <div className="w-full bg-warm-2 h-1.5 rounded-full overflow-hidden border border-line/40">
          <div
            className="h-full bg-orange transition-all duration-300 ease-out"
            style={{ width: `${step * 20}%` }}
          />
        </div>
      </div>

      {/* Dashed-path step indicator (motif from design system & PDF page 7) */}
      <div className="relative py-2 select-none">
        <div className="flex items-center justify-between relative z-10 max-w-md mx-auto">
          {[1, 2, 3, 4, 5].map((s, idx) => {
            const isCurrent = step === s;
            const isCompleted = step > s;
            return (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <button
                  type="button"
                  onClick={() => {
                    if (s < step) setStep(s);
                  }}
                  disabled={s > step}
                  className={`size-8 sm:size-9 rounded-full font-display font-bold text-xs sm:text-sm flex items-center justify-center transition-all ${
                    isCurrent
                      ? "bg-orange text-white ring-4 ring-orange-soft shadow-md scale-105"
                      : isCompleted
                      ? "bg-orange text-white cursor-pointer hover:bg-orange-deep"
                      : "bg-warm-2 border border-line text-mute cursor-not-allowed"
                  }`}
                  aria-label={`Step ${s}`}
                >
                  {isCompleted ? <Check className="size-4 stroke-[2.5]" /> : s}
                </button>
                {idx < 4 && (
                  <div
                    className={`flex-1 mx-1.5 sm:mx-2 border-t-2 border-dashed transition-colors ${
                      step > s ? "border-orange" : "border-line"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error banner */}
      {errorMessage && (
        <div className="bg-plum-soft border border-plum/30 rounded-xl p-3.5 text-plum text-sm font-medium flex items-center gap-2">
          <span className="size-2 rounded-full bg-plum" />
          {errorMessage}
        </div>
      )}

      {/* Celebration Card upon Step 5 completion */}
      {completedCelebration ? (
        <div className="bg-card border border-line rounded-2xl p-8 sm:p-10 text-center space-y-6 shadow-card animate-in fade-in zoom-in-95 duration-300">
          <div className="size-16 rounded-full bg-orange-soft text-orange mx-auto flex items-center justify-center shadow-inner">
            <Sparkles className="size-8 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2">
              <span className="glow-dot" />
              <span className="eyebrow">READY TO CONNECT</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold text-ink tracking-tight">
              Profile 100% complete!
            </h2>
            <p className="font-sans text-sm text-ink-soft max-w-md mx-auto leading-relaxed">
              We&apos;ve analyzed your skills, proof of work, and working style against our founder pool.
              {matchesCount > 0
                ? ` Your first ${matchesCount} matches are ready to explore.`
                : " Your matches have been prepared for today."}
            </p>
          </div>

          <div className="bg-warm/70 border border-line rounded-xl p-4 max-w-sm mx-auto space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-ink">
              <span className="text-mute">STATUS:</span>
              <span className="font-bold text-forest flex items-center gap-1">
                <Check className="size-3.5 text-forest" /> VERIFIED APPLICANT
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-ink">
              <span className="text-mute">NEXT BATCH:</span>
              <span className="font-medium">8:00 AM IST DAILY</span>
            </div>
          </div>

          <Button
            variant="solid"
            size="lg"
            className="w-full sm:w-auto px-8 gap-2"
            onClick={() => router.push("/match")}
          >
            See my matches
            <ArrowRight className="size-4" />
          </Button>
        </div>
      ) : (
        /* The 5-Step Forms */
        <div className="bg-card border border-line rounded-2xl p-6 sm:p-8 shadow-card">
          {/* STEP 1: BASICS & VERIFICATION */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div className="space-y-1">
                <h2 className="font-display text-2xl font-bold text-ink tracking-tight">
                  Let&apos;s get you verified
                </h2>
                <p className="font-sans text-xs sm:text-sm text-ink-soft">
                  Verified profiles get 3× more responses from builders and founders.
                </p>
              </div>

              {/* Avatar Upload */}
              <div className="flex items-center gap-4 py-2 border-b border-line/60">
                <div className="relative size-18 rounded-full border-2 border-line bg-warm flex items-center justify-center overflow-hidden group">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="font-display font-bold text-lg text-ink-soft">
                      {fullName ? fullName.charAt(0).toUpperCase() : "+"}
                    </span>
                  )}
                  {avatarUploading && (
                    <div className="absolute inset-0 bg-ink/50 flex items-center justify-center text-white text-[10px] font-mono">
                      ...
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="cursor-pointer inline-flex items-center gap-2 text-xs font-semibold text-orange hover:text-orange-deep bg-orange-soft px-3 py-1.5 rounded-full transition-colors">
                    <Upload className="size-3.5" />
                    {avatarUrl ? "Change photo" : "Upload photo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={avatarUploading}
                    />
                  </label>
                  <p className="font-sans text-[11px] text-mute">
                    Square JPG, PNG or WebP under 5MB.
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">
                    Full Name <span className="text-orange">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Rohan Mehta"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">
                      College or Company <span className="text-orange">*</span>
                    </label>
                    <Input
                      placeholder="e.g. NSUT Delhi or IIT Madras"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">
                      City <span className="text-orange">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Delhi NCR or Bengaluru"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">
                      College / Company Email <span className="text-orange">*</span>
                    </label>
                    <span className="font-mono text-[10px] text-forest flex items-center gap-1">
                      <Lock className="size-2.5" /> Hidden until connected
                    </span>
                  </div>
                  <Input
                    type="email"
                    placeholder="e.g. rohan@du.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">
                      LinkedIn URL (optional)
                    </label>
                    <span className="font-mono text-[10px] text-forest flex items-center gap-1">
                      <Lock className="size-2.5" /> Hidden until connected
                    </span>
                  </div>
                  <Input
                    placeholder="https://linkedin.com/in/username"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                  />
                </div>

                <div className="bg-warm/60 border border-line rounded-xl p-3.5 space-y-2">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold block">
                    Campus Chapter Code (optional)
                  </label>
                  <Input
                    placeholder="e.g. TFC-DU-04 or TFC-NSUT-01"
                    value={chapterCode}
                    onChange={(e) => setChapterCode(e.target.value)}
                    className="font-mono uppercase placeholder:normal-case"
                  />
                  <p className="font-sans text-[11px] text-mute">
                    Have a code from your campus TFC lead? Enter it to get priority chapter verification.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="solid" type="submit" disabled={loading} className="gap-2">
                  {loading ? "Saving..." : "Continue"}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: ROLE & SKILL */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <div className="space-y-1">
                <h2 className="font-display text-2xl font-bold text-ink tracking-tight">
                  Where are you right now?
                </h2>
                <p className="font-sans text-xs sm:text-sm text-ink-soft">
                  Tell us what you bring to the table and how you want to collaborate.
                </p>
              </div>

              {/* Role selection cards */}
              <div className="grid grid-cols-1 gap-3">
                {[
                  {
                    id: "idea",
                    icon: Lightbulb,
                    title: "I have an idea",
                    desc: "Looking for someone to build it with",
                  },
                  {
                    id: "join",
                    icon: Wrench,
                    title: "I want to join one",
                    desc: "Bring my skills to a founder's idea",
                  },
                  {
                    id: "either",
                    icon: Users2,
                    title: "Either works",
                    desc: "Open to both: leading or teaming up",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = role === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRole(item.id as "idea" | "join" | "either")}
                      className={`text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? "bg-orange-soft/60 border-orange ring-1 ring-orange text-ink"
                          : "bg-white border-line hover:border-ink/20 text-ink"
                      }`}
                    >
                      <div
                        className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-orange text-white" : "bg-warm-2 text-ink-soft"
                        }`}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-display font-bold text-base text-ink flex items-center gap-2">
                          {item.title}
                          {isSelected && <Check className="size-4 text-orange" />}
                        </div>
                        <p className="font-sans text-xs text-ink-soft">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Primary Skill */}
              <div className="space-y-2 pt-2 border-t border-line/60">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold block">
                  Your Primary Skill (Pick 1) <span className="text-orange">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((s) => {
                    const isSelected = primarySkill === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setPrimarySkill(s.id)}
                        className={`px-4 py-2 rounded-full font-sans text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-orange text-white shadow-sm"
                            : "bg-warm-2 text-ink hover:bg-warm border border-line"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Secondary Skills */}
              <div className="space-y-2 pt-2 border-t border-line/60">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">
                    Secondary Skills (Optional, up to 3)
                  </label>
                  <span className="font-mono text-[10px] text-mute">
                    {secondarySkills.length}/3 SELECTED
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.filter((s) => s.id !== primarySkill).map((s) => {
                    const isSelected = secondarySkills.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSecondarySkill(s.id)}
                        className={`px-3 py-1.5 rounded-full font-sans text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-ink text-warm"
                            : "bg-white text-ink-soft border border-line hover:border-ink/30"
                        }`}
                      >
                        {s.label} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setStep(1)}
                  className="gap-1.5"
                >
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <Button variant="solid" type="submit" disabled={loading} className="gap-2">
                  {loading ? "Saving..." : "Continue"}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: WHO ARE YOU LOOKING FOR? */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-6">
              <div className="space-y-1">
                <h2 className="font-display text-2xl font-bold text-ink tracking-tight">
                  Who are you looking for?
                </h2>
                <p className="font-sans text-xs sm:text-sm text-ink-soft">
                  Matching algorithms use these exact criteria to score complementary candidates.
                </p>
              </div>

              {/* Skills Needed */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">
                    Skills You Need (1–3) <span className="text-orange">*</span>
                  </label>
                  <span className="font-mono text-[10px] text-mute">
                    {lookingForSkills.length}/3 SELECTED
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((s) => {
                    const isSelected = lookingForSkills.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleLookingForSkill(s.id)}
                        className={`px-3.5 py-1.5 rounded-full font-sans text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-orange text-white shadow-sm"
                            : "bg-white border border-line text-ink hover:bg-warm"
                        }`}
                      >
                        {s.label} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Industries */}
              <div className="space-y-2 pt-2 border-t border-line/60">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">
                    Industries (1–5) <span className="text-orange">*</span>
                  </label>
                  <span className="font-mono text-[10px] text-mute">
                    {industries.length}/5 SELECTED
                  </span>
                </div>
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
                            : "bg-white border border-line text-ink-soft hover:border-ink/30"
                        }`}
                      >
                        {ind} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>

                {/* Custom industry input */}
                <div className="flex gap-2 pt-2 max-w-sm">
                  <Input
                    placeholder="+ Add custom industry"
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomIndustry();
                      }
                    }}
                    className="text-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addCustomIndustry}
                    disabled={!customIndustry.trim() || industries.length >= 5}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Commitment */}
              <div className="space-y-2 pt-2 border-t border-line/60">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold block">
                  Commitment Level <span className="text-orange">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "full_time", label: "Full-time" },
                    { id: "part_time", label: "Part-time" },
                    { id: "after_grad", label: "After grad" },
                  ].map((c) => {
                    const isSelected = commitment === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCommitment(c.id as "full_time" | "part_time" | "after_grad")}
                        className={`p-2.5 rounded-xl font-sans text-xs font-semibold text-center border transition-all ${
                          isSelected
                            ? "bg-orange text-white border-orange shadow-sm"
                            : "bg-white border-line text-ink hover:bg-warm"
                        }`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location & Remote OK */}
              <div className="space-y-3 pt-2 border-t border-line/60">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold block">
                      Remote Friendly
                    </span>
                    <p className="font-sans text-xs text-mute">
                      Open to collaborating with builders outside your city.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={remoteOk}
                      onChange={(e) => setRemoteOk(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange" />
                  </label>
                </div>
              </div>

              {/* Equity Preference */}
              <div className="space-y-2 pt-2 border-t border-line/60">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold block">
                  Equity Expectation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "equal", label: "Equal split (50/50)" },
                    { id: "open", label: "Open to talk" },
                    { id: "depends", label: "Depends on stage" },
                  ].map((item) => {
                    const isSelected = equityPref === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setEquityPref(item.id as "equal" | "open" | "depends")}
                        className={`p-2.5 rounded-xl font-sans text-xs font-semibold text-center border transition-all ${
                          isSelected
                            ? "bg-ink text-warm border-ink"
                            : "bg-white border-line text-ink-soft hover:bg-warm"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setStep(2)}
                  className="gap-1.5"
                >
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <Button variant="solid" type="submit" disabled={loading} className="gap-2">
                  {loading ? "Saving..." : "Continue"}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </form>
          )}

          {/* STEP 4: PROOF OF WORK */}
          {step === 4 && (
            <form onSubmit={handleStep4Submit} className="space-y-6">
              <div className="space-y-1">
                <h2 className="font-display text-2xl font-bold text-ink tracking-tight">
                  Show what you&apos;ve built
                </h2>
                <p className="font-sans text-xs sm:text-sm text-ink-soft">
                  Proof beats a CV. Add 1 to 3 projects, live links, or milestones.
                </p>
              </div>

              {/* Proof links list */}
              <div className="space-y-3">
                {proofLinks.map((link, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-warm/50 border border-line rounded-xl space-y-2.5 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-orange-deep font-bold flex items-center gap-1">
                        <ExternalLink className="size-3" /> PROOF LINK #{idx + 1}
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
                        placeholder="Title (e.g. MandiRates or SIH Finalist)"
                        value={link.title}
                        onChange={(e) => {
                          const updated = [...proofLinks];
                          updated[idx].title = e.target.value;
                          setProofLinks(updated);
                        }}
                        required
                        className="bg-white"
                      />
                      <Input
                        placeholder="URL (e.g. https://github.com/...)"
                        value={link.url}
                        onChange={(e) => {
                          const updated = [...proofLinks];
                          updated[idx].url = e.target.value;
                          setProofLinks(updated);
                        }}
                        required
                        className="bg-white"
                      />
                    </div>

                    <Input
                      placeholder="Context / Note (e.g. AI notes app · 1.2k users · built in React)"
                      value={link.note}
                      onChange={(e) => {
                        const updated = [...proofLinks];
                        updated[idx].note = e.target.value;
                        setProofLinks(updated);
                      }}
                      className="bg-white text-xs"
                    />
                  </div>
                ))}

                {proofLinks.length < 3 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2 w-full border-dashed"
                    onClick={() =>
                      setProofLinks([...proofLinks, { title: "", url: "https://", note: "" }])
                    }
                  >
                    <Plus className="size-3.5" /> Add another proof link ({proofLinks.length}/3)
                  </Button>
                )}
              </div>

              {/* Why Startup (1-liner, max 200 chars) */}
              <div className="space-y-1.5 pt-2 border-t border-line/60">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">
                    Why do you want to start up? (1 line) <span className="text-orange">*</span>
                  </label>
                  <span
                    className={`font-mono text-[10px] ${
                      whyStartup.length > 200 ? "text-plum font-bold" : "text-mute"
                    }`}
                  >
                    {whyStartup.length}/200
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={whyStartup}
                  maxLength={200}
                  onChange={(e) => setWhyStartup(e.target.value)}
                  placeholder="e.g. Farmers in my village still sell through 3 middlemen. I want to build software that fixes supply chain transparency."
                  className="w-full rounded-xl border border-line bg-white p-3 font-sans text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
                  required
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setStep(3)}
                  className="gap-1.5"
                >
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <Button variant="solid" type="submit" disabled={loading} className="gap-2">
                  {loading ? "Saving..." : "Continue"}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </form>
          )}

          {/* STEP 5: WORKING STYLE */}
          {step === 5 && (
            <form onSubmit={handleStep5Submit} className="space-y-6">
              <div className="space-y-1">
                <h2 className="font-display text-2xl font-bold text-ink tracking-tight">
                  How do you work?
                </h2>
                <p className="font-sans text-xs sm:text-sm text-ink-soft">
                  No right answers. This helps our matching engine pair you with complementary mindsets.
                </p>
              </div>

              <div className="space-y-6 pt-2">
                {/* 1. Speed Slider */}
                <div className="space-y-2 p-3.5 bg-warm/50 border border-line rounded-xl">
                  <div className="flex items-center justify-between text-xs font-semibold text-ink">
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
                  <p className="font-sans text-[11px] text-mute">
                    Do you prefer rapid iteration with quick customer feedback, or refined architecture before launch?
                  </p>
                </div>

                {/* 2. Risk Slider */}
                <div className="space-y-2 p-3.5 bg-warm/50 border border-line rounded-xl">
                  <div className="flex items-center justify-between text-xs font-semibold text-ink">
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
                  <p className="font-sans text-[11px] text-mute">
                    Are you building proven business models, or swinging for moonshot venture-scale outcomes?
                  </p>
                </div>

                {/* 3. Hours Slider */}
                <div className="space-y-2 p-3.5 bg-warm/50 border border-line rounded-xl">
                  <div className="flex items-center justify-between text-xs font-semibold text-ink">
                    <span>20 hrs / week</span>
                    <span className="font-mono text-mute">{hours}%</span>
                    <span className="text-orange-deep">40+ hrs / week</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-full accent-orange cursor-pointer"
                  />
                  <p className="font-sans text-[11px] text-mute">
                    Realistically, how much time can you dedicate alongside classes or work right now?
                  </p>
                </div>

                {/* 4. Decision Slider */}
                <div className="space-y-2 p-3.5 bg-warm/50 border border-line rounded-xl">
                  <div className="flex items-center justify-between text-xs font-semibold text-ink">
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
                  <p className="font-sans text-[11px] text-mute">
                    When data is sparse, do you wait for more signal or bias toward bold founder intuition?
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setStep(4)}
                  className="gap-1.5"
                >
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <Button
                  variant="solid"
                  type="submit"
                  disabled={loading}
                  className="gap-2 px-6"
                >
                  {loading ? (
                    <>
                      <Sparkles className="size-4 animate-spin" />
                      Computing your matches...
                    </>
                  ) : (
                    <>
                      Finish &amp; Find Matches
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
