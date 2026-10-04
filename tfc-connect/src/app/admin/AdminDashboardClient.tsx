"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/badge";
import {
  AdminKPIs,
  VerificationQueueItem,
  ReportQueueItem,
  AdminCollectionItem,
  ChapterItem,
  LaunchpadSignalItem,
} from "./types";
import {
  approveVerificationAction,
  rejectVerificationAction,
  askInfoVerificationAction,
  resolveReportAction,
  createCollectionAction,
  deleteCollectionAction,
  reorderCollectionsAction,
  addStartupToCollectionAction,
  removeStartupFromCollectionAction,
  createChapterAction,
  deleteChapterAction,
  sendLaunchpadInviteAction,
} from "./actions";
import {
  LayoutDashboard,
  ShieldCheck,
  AlertTriangle,
  FolderKanban,
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  EyeOff,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface AdminDashboardClientProps {
  kpis: AdminKPIs;
  verificationQueue: VerificationQueueItem[];
  reportsQueue: ReportQueueItem[];
  collections: AdminCollectionItem[];
  chapters: ChapterItem[];
  launchpadSignals: LaunchpadSignalItem[];
  availableStartups: { id: string; name: string; slug: string }[];
}

export function AdminDashboardClient({
  kpis,
  verificationQueue,
  reportsQueue,
  collections: initialCollections,
  chapters: initialChapters,
  launchpadSignals,
  availableStartups,
}: AdminDashboardClientProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "overview" | "verification" | "reports" | "collections" | "chapters" | "launchpad"
  >("overview");

  // State
  const [collections, setCollections] = useState(initialCollections);
  const [chapters, setChapters] = useState(initialChapters);

  // Modals state
  const [approveModalReq, setApproveModalReq] = useState<VerificationQueueItem | null>(null);
  const [approveTier, setApproveTier] = useState<"verified" | "tfc_backed">("verified");
  const [reviewerNote, setReviewerNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [rejectModalReq, setRejectModalReq] = useState<VerificationQueueItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [askInfoModalReq, setAskInfoModalReq] = useState<VerificationQueueItem | null>(null);
  const [askInfoText, setAskInfoText] = useState("");

  const [newCollectionOpen, setNewCollectionOpen] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");
  const [newColSlug, setNewColSlug] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [newColTheme, setNewColTheme] = useState<"orange" | "forest" | "amber" | "ink" | "ballpoint">("orange");
  const [newColPublished, setNewColPublished] = useState(true);

  const [newChapterOpen, setNewChapterOpen] = useState(false);
  const [newChapName, setNewChapName] = useState("");
  const [newChapCollege, setNewChapCollege] = useState("");
  const [newChapCity, setNewChapCity] = useState("Delhi NCR");
  const [newChapCode, setNewChapCode] = useState("");

  const [addStartupColId, setAddStartupColId] = useState<string | null>(null);
  const [selectedStartupToAdd, setSelectedStartupToAdd] = useState("");

  // Handler: Approve Verification
  const handleApprove = async () => {
    if (!approveModalReq) return;
    setActionLoading(true);
    try {
      const res = await approveVerificationAction(approveModalReq.id, {
        tier: approveTier,
        reviewerNote: reviewerNote,
      });
      if (res.ok) {
        setApproveModalReq(null);
        setReviewerNote("");
        router.refresh();
      } else {
        alert(res.error);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Reject Verification
  const handleReject = async () => {
    if (!rejectModalReq) return;
    setActionLoading(true);
    try {
      const res = await rejectVerificationAction(rejectModalReq.id, rejectReason);
      if (res.ok) {
        setRejectModalReq(null);
        setRejectReason("");
        router.refresh();
      } else {
        alert(res.error);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Ask Info
  const handleAskInfo = async () => {
    if (!askInfoModalReq || !askInfoText.trim()) return;
    setActionLoading(true);
    try {
      const res = await askInfoVerificationAction(askInfoModalReq.id, askInfoText);
      if (res.ok) {
        setAskInfoModalReq(null);
        setAskInfoText("");
        router.refresh();
      } else {
        alert(res.error);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Resolve Report
  const handleResolveReport = async (reportId: string, action: "resolve_dismiss" | "resolve_hide") => {
    if (!confirm(action === "resolve_hide" ? "Hide reported entity from public views?" : "Dismiss report?")) return;
    const res = await resolveReportAction(reportId, action);
    if (res.ok) {
      router.refresh();
    } else {
      alert(res.error);
    }
  };

  // Handler: Reorder Collections
  const handleMoveCollection = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= collections.length) return;

    const updated = [...collections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setCollections(updated);
    await reorderCollectionsAction(updated.map((c) => c.id));
  };

  // Handler: Create Collection
  const handleCreateCollection = async () => {
    if (!newColTitle.trim() || !newColSlug.trim()) return;
    setActionLoading(true);
    try {
      const res = await createCollectionAction({
        title: newColTitle,
        slug: newColSlug,
        description: newColDesc,
        theme: newColTheme,
        is_published: newColPublished,
        sort_order: collections.length,
      });
      if (res.ok) {
        setNewCollectionOpen(false);
        setNewColTitle("");
        setNewColSlug("");
        setNewColDesc("");
        router.refresh();
      } else {
        alert(res.error);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Add Startup to Collection
  const handleAddStartupToCollection = async () => {
    if (!addStartupColId || !selectedStartupToAdd) return;
    const res = await addStartupToCollectionAction(addStartupColId, selectedStartupToAdd);
    if (res.ok) {
      setAddStartupColId(null);
      setSelectedStartupToAdd("");
      router.refresh();
    } else {
      alert(res.error);
    }
  };

  // Handler: Remove Startup from Collection
  const handleRemoveStartupFromCollection = async (collectionId: string, startupId: string) => {
    const res = await removeStartupFromCollectionAction(collectionId, startupId);
    if (res.ok) {
      router.refresh();
    } else {
      alert(res.error);
    }
  };

  // Handler: Create Chapter
  const handleCreateChapter = async () => {
    if (!newChapName.trim() || !newChapCode.trim()) return;
    setActionLoading(true);
    try {
      const res = await createChapterAction({
        name: newChapName,
        college: newChapCollege,
        city: newChapCity,
        code: newChapCode,
      });
      if (res.ok) {
        setNewChapterOpen(false);
        setNewChapName("");
        setNewChapCollege("");
        setNewChapCode("");
        router.refresh();
      } else {
        alert(res.error);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Delete Chapter
  const handleDeleteChapter = async (id: string) => {
    if (!confirm("Are you sure you want to delete this chapter?")) return;
    const res = await deleteChapterAction(id);
    if (res.ok) {
      setChapters((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    } else {
      alert(res.error);
    }
  };

  // Handler: Launchpad Invite
  const handleLaunchpadInvite = async (connId: string) => {
    const res = await sendLaunchpadInviteAction(connId);
    if (res.ok) {
      alert("✓ Sent Fellowship '27 Early Access invite to team!");
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex">
      {/* SIDE NAVIGATION (PDF Page 14 dark style) */}
      <aside className="w-64 bg-ink text-warm shrink-0 hidden md:flex flex-col justify-between p-5 border-r border-line/20">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2.5 px-2">
            <Image
              src="/logo.png"
              alt="TFC Logo"
              width={26}
              height={26}
              className="rounded-md"
            />
            <span className="font-display font-black text-lg tracking-tight text-warm">
              Admin
            </span>
          </Link>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-sans text-xs font-medium transition-colors ${
                activeTab === "overview"
                  ? "bg-white/10 text-warm font-semibold"
                  : "text-[#B5A596] hover:bg-white/5 hover:text-warm"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="size-4" />
                Overview
              </div>
            </button>

            <button
              onClick={() => setActiveTab("verification")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-sans text-xs font-medium transition-colors ${
                activeTab === "verification"
                  ? "bg-white/10 text-warm font-semibold"
                  : "text-[#B5A596] hover:bg-white/5 hover:text-warm"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="size-4" />
                Verification
              </div>
              {verificationQueue.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-orange text-warm font-mono text-[10px] font-bold">
                  {verificationQueue.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("reports")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-sans text-xs font-medium transition-colors ${
                activeTab === "reports"
                  ? "bg-white/10 text-warm font-semibold"
                  : "text-[#B5A596] hover:bg-white/5 hover:text-warm"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="size-4" />
                Reports
              </div>
              {reportsQueue.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber text-warm font-mono text-[10px] font-bold">
                  {reportsQueue.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("collections")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-sans text-xs font-medium transition-colors ${
                activeTab === "collections"
                  ? "bg-white/10 text-warm font-semibold"
                  : "text-[#B5A596] hover:bg-white/5 hover:text-warm"
              }`}
            >
              <FolderKanban className="size-4" />
              Collections
            </button>

            <button
              onClick={() => setActiveTab("chapters")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-sans text-xs font-medium transition-colors ${
                activeTab === "chapters"
                  ? "bg-white/10 text-warm font-semibold"
                  : "text-[#B5A596] hover:bg-white/5 hover:text-warm"
              }`}
            >
              <GraduationCap className="size-4" />
              Chapters
            </button>

            <button
              onClick={() => setActiveTab("launchpad")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-sans text-xs font-medium transition-colors ${
                activeTab === "launchpad"
                  ? "bg-white/10 text-warm font-semibold"
                  : "text-[#B5A596] hover:bg-white/5 hover:text-warm"
              }`}
            >
              <Sparkles className="size-4" />
              Launchpad Signal
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-white/10 space-y-2">
          <Link
            href="/match"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-sans text-[#B5A596] hover:text-warm hover:bg-white/5 transition-colors"
          >
            ← Back to App
          </Link>
          <div className="px-3 font-mono text-[10px] text-warm/40">
            TFC Connect Admin v1.0
          </div>
        </div>
      </aside>

      {/* MAIN ADMIN WORKSPACE */}
      <main className="flex-1 p-6 sm:p-10 max-w-[1200px] mx-auto overflow-y-auto space-y-8">
        {/* Mobile Navigation Header */}
        <div className="md:hidden flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-line">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-lg">Admin</span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {(["overview", "verification", "reports", "collections", "chapters", "launchpad"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-full capitalize ${
                    activeTab === tab
                      ? "bg-ink text-warm font-bold"
                      : "bg-card border border-line text-ink"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>
        </div>

        {/* 1. TOP KPI TILES (Matching PDF Page 14) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tile 1: Profiles */}
          <div className="rounded-2xl border border-line bg-card p-5 space-y-1 shadow-sm">
            <div className="font-sans text-xs text-ink-soft font-medium">Profiles</div>
            <div className="font-display font-black text-2xl sm:text-3xl text-ink">
              {kpis.profilesCount.toLocaleString()}
            </div>
            <div className="font-mono text-[11px] text-forest font-semibold">
              +{kpis.profilesWeeklyDelta} wk
            </div>
          </div>

          {/* Tile 2: Startups Listed */}
          <div className="rounded-2xl border border-line bg-card p-5 space-y-1 shadow-sm">
            <div className="font-sans text-xs text-ink-soft font-medium">Startups listed</div>
            <div className="font-display font-black text-2xl sm:text-3xl text-ink">
              {kpis.startupsCount.toLocaleString()}
            </div>
            <div className="font-mono text-[11px] text-forest font-semibold">
              +{kpis.startupsWeeklyDelta} wk
            </div>
          </div>

          {/* Tile 3: Request Acceptance Rate */}
          <div className="rounded-2xl border border-line bg-card p-5 space-y-1 shadow-sm">
            <div className="font-sans text-xs text-ink-soft font-medium">Request acceptance</div>
            <div className="font-display font-black text-2xl sm:text-3xl text-ink">
              {kpis.requestAcceptanceRate}%
            </div>
            <div className="font-mono text-[11px] text-ink-soft">
              target 30%+
            </div>
          </div>

          {/* Tile 4: Teams Formed (Highlight ⭐) */}
          <div className="rounded-2xl border-2 border-orange/20 bg-gradient-to-br from-card to-orange-soft/30 p-5 space-y-1 shadow-sm">
            <div className="font-sans text-xs text-orange-deep font-semibold flex items-center gap-1.5">
              <span>Teams formed</span>
              <span>⭐</span>
            </div>
            <div className="font-display font-black text-2xl sm:text-3xl text-ink">
              {kpis.teamsFormedCount.toLocaleString()}
            </div>
            <div className="font-mono text-[11px] text-orange-deep font-semibold">
              +{kpis.teamsFormedWeeklyDelta} wk
            </div>
          </div>
        </div>

        {/* 2. TAB: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Verification Queue Snapshot */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-lg text-ink">
                      Verification queue
                    </h3>
                    <span className="font-mono text-[10px] text-orange-deep px-2 py-0.5 rounded-full bg-orange-soft border border-orange/20 font-bold">
                      SLA 48h
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab("verification")}
                    className="font-sans text-xs font-semibold text-orange-deep hover:underline"
                  >
                    View all ({verificationQueue.length}) →
                  </button>
                </div>

                <div className="rounded-2xl border border-line bg-card divide-y divide-line overflow-hidden shadow-sm">
                  {verificationQueue.length === 0 ? (
                    <div className="p-8 text-center font-sans text-sm text-ink-soft">
                      No pending verification requests. All caught up! 🎉
                    </div>
                  ) : (
                    verificationQueue.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-bg/40 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-sm text-ink">
                              {item.target_name}
                            </span>
                            <Chip variant="neutral" className="text-[10px]">
                              {item.kind}
                            </Chip>
                            <span className="font-mono text-[11px] text-ink-soft flex items-center gap-1">
                              <Clock className="size-3" />
                              {item.waiting_hours}h
                            </span>
                          </div>
                          <p className="font-sans text-xs text-ink-soft">
                            {item.evidence || "No evidence text provided."}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="forest"
                            onClick={() => {
                              setApproveModalReq(item);
                              setApproveTier(item.kind === "startup" ? "tfc_backed" : "verified");
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setRejectModalReq(item)}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Chapter Leaderboard Snapshot */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg text-ink">
                    Chapter leaderboard
                  </h3>
                  <button
                    onClick={() => setActiveTab("chapters")}
                    className="font-sans text-xs font-semibold text-orange-deep hover:underline"
                  >
                    Manage chapters →
                  </button>
                </div>

                <div className="rounded-2xl border border-line bg-card p-5 space-y-4 shadow-sm">
                  <div className="font-sans text-xs text-ink-soft">
                    Verified sign-ups this month across campus chapters
                  </div>

                  <div className="space-y-3">
                    {chapters.slice(0, 5).map((chap, idx) => {
                      const maxSignups = Math.max(...chapters.map((c) => c.signups_this_month || 1), 100);
                      const pct = Math.min(100, Math.round((chap.signups_this_month / maxSignups) * 100));
                      return (
                        <div key={chap.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-sans">
                            <span className="font-semibold text-ink">
                              {idx + 1}. {chap.name}
                            </span>
                            <span className="font-mono text-ink-soft font-bold">
                              {chap.signups_this_month}
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-bg overflow-hidden">
                            <div
                              className="h-full rounded-full bg-orange transition-all duration-500"
                              style={{ width: `${Math.max(8, pct)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Launchpad Signal Callout Banner (Matching PDF Page 14) */}
            <div className="rounded-2xl border border-line bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="font-display font-bold text-base text-ink flex items-center gap-2">
                  <Sparkles className="size-4 text-orange" />
                  Launchpad signal
                </div>
                <p className="font-sans text-sm text-ink-soft">
                  Teams formed in the last 30 days with a verified startup and 3+ updates:{" "}
                  <strong className="text-ink font-semibold">
                    {launchpadSignals.length} teams qualified
                  </strong>
                </p>
              </div>

              <button
                onClick={() => setActiveTab("launchpad")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-orange text-warm font-sans text-xs font-bold hover:bg-orange-deep transition-colors shadow-sm shrink-0"
              >
                View qualified teams →
              </button>
            </div>
          </div>
        )}

        {/* 3. TAB: VERIFICATION QUEUE */}
        {activeTab === "verification" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-black text-2xl text-ink">
                  Verification Queue
                </h2>
                <p className="font-sans text-xs text-ink-soft">
                  Review and verify student founders and campus startups within the 48h SLA.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-card overflow-hidden shadow-sm divide-y divide-line">
              {verificationQueue.length === 0 ? (
                <div className="p-12 text-center font-sans text-ink-soft">
                  No pending verification requests. All items processed!
                </div>
              ) : (
                verificationQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2.5">
                        <span className="font-display font-bold text-base text-ink">
                          {item.target_name}
                        </span>
                        <Chip
                          variant={item.kind === "startup" ? "backed" : "verified"}
                          className="text-[10px] uppercase font-bold"
                        >
                          {item.kind}
                        </Chip>
                        <span
                          className={`font-mono text-xs px-2 py-0.5 rounded-full ${
                            item.waiting_hours >= 36
                              ? "bg-plum-soft text-plum font-bold"
                              : "bg-bg text-ink-soft"
                          }`}
                        >
                          ⏳ {item.waiting_hours}h waiting
                        </span>
                      </div>

                      <p className="font-sans text-xs text-ink-soft">
                        <strong className="text-ink">Submitted by:</strong> {item.submitter_name} ·{" "}
                        <strong className="text-ink">Meta:</strong> {item.target_meta}
                      </p>

                      <div className="rounded-xl bg-bg p-3 font-mono text-xs text-ink border border-line">
                        {item.evidence || "No evidence or website provided."}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="forest"
                        onClick={() => {
                          setApproveModalReq(item);
                          setApproveTier(item.kind === "startup" ? "tfc_backed" : "verified");
                        }}
                      >
                        <CheckCircle className="size-3.5 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setAskInfoModalReq(item)}
                      >
                        <HelpCircle className="size-3.5 mr-1" />
                        Ask info
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setRejectModalReq(item)}
                        className="text-orange-deep hover:bg-orange-soft"
                      >
                        <XCircle className="size-3.5 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 4. TAB: REPORTS QUEUE */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-black text-2xl text-ink">
                  Trust &amp; Safety Reports
                </h2>
                <p className="font-sans text-xs text-ink-soft">
                  Review reported spam, harassment, or fake accounts to protect the community.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-card overflow-hidden shadow-sm divide-y divide-line">
              {reportsQueue.length === 0 ? (
                <div className="p-12 text-center font-sans text-ink-soft">
                  No active reports in queue. Clean community!
                </div>
              ) : (
                reportsQueue.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs uppercase px-2 py-0.5 rounded-full bg-plum-soft text-plum font-bold">
                          {rep.reason}
                        </span>
                        <span className="font-display font-bold text-sm text-ink">
                          Target: {rep.target_title} ({rep.target_type})
                        </span>
                      </div>
                      <p className="font-sans text-xs text-ink-soft">
                        Reported by: <strong className="text-ink">{rep.reporter_name}</strong>
                      </p>
                      <p className="font-sans text-xs text-ink bg-bg p-3 rounded-xl border border-line">
                        &ldquo;{rep.details || "No additional comments."}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleResolveReport(rep.id, "resolve_dismiss")}
                      >
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        variant="solid"
                        onClick={() => handleResolveReport(rep.id, "resolve_hide")}
                        className="bg-plum text-warm hover:bg-plum/90"
                      >
                        <EyeOff className="size-3.5 mr-1" />
                        Hide Target Entity
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 5. TAB: COLLECTIONS EDITOR */}
        {activeTab === "collections" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-black text-2xl text-ink">
                  Collections Editor
                </h2>
                <p className="font-sans text-xs text-ink-soft">
                  Curate collections displayed at the top of the public startup directory.
                </p>
              </div>
              <Button
                size="sm"
                variant="solid"
                onClick={() => setNewCollectionOpen(true)}
                className="gap-1.5"
              >
                <Plus className="size-4" />
                New Collection
              </Button>
            </div>

            <div className="space-y-4">
              {collections.map((col, idx) => (
                <div
                  key={col.id}
                  className="rounded-2xl border border-line bg-card p-5 space-y-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-lg text-ink">
                          {col.title}
                        </span>
                        <Chip variant="neutral" className="text-[10px] capitalize">
                          {col.theme}
                        </Chip>
                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            col.is_published
                              ? "bg-forest-soft text-forest"
                              : "bg-bg text-ink-soft"
                          }`}
                        >
                          {col.is_published ? "Published" : "Draft"}
                        </span>
                      </div>
                      <p className="font-sans text-xs text-ink-soft">
                        Slug: <code className="font-mono text-ink">/collections/{col.slug}</code> ·{" "}
                        {col.description || "No description."}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMoveCollection(idx, "up")}
                        disabled={idx === 0}
                        title="Move Up"
                      >
                        <ArrowUp className="size-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMoveCollection(idx, "down")}
                        disabled={idx === collections.length - 1}
                        title="Move Down"
                      >
                        <ArrowDown className="size-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setAddStartupColId(col.id);
                        }}
                        className="text-xs"
                      >
                        + Add Startup
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          if (!confirm(`Delete collection "${col.title}"?`)) return;
                          await deleteCollectionAction(col.id);
                          setCollections((prev) => prev.filter((c) => c.id !== col.id));
                        }}
                        className="text-orange-deep hover:bg-orange-soft"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Startups inside collection */}
                  <div className="pt-3 border-t border-line/60">
                    <div className="font-sans text-xs font-semibold text-ink-soft mb-2">
                      Included Startups ({col.startups.length}):
                    </div>
                    {col.startups.length === 0 ? (
                      <p className="font-sans text-xs text-ink-soft italic">
                        No startups in this collection yet. Click &ldquo;+ Add Startup&rdquo; above.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {col.startups.map((s) => (
                          <span
                            key={s.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line bg-bg font-sans text-xs text-ink"
                          >
                            <span>{s.name}</span>
                            <button
                              onClick={() => handleRemoveStartupFromCollection(col.id, s.id)}
                              className="size-4 rounded-full text-ink-soft hover:text-orange hover:bg-card flex items-center justify-center font-bold text-xs"
                              title="Remove"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. TAB: CHAPTERS CRUD & LEADERBOARD */}
        {activeTab === "chapters" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-black text-2xl text-ink">
                  Campus Chapters
                </h2>
                <p className="font-sans text-xs text-ink-soft">
                  Manage university chapters and verify campus leaderboard sign-ups.
                </p>
              </div>
              <Button
                size="sm"
                variant="solid"
                onClick={() => setNewChapterOpen(true)}
                className="gap-1.5"
              >
                <Plus className="size-4" />
                Add Chapter
              </Button>
            </div>

            <div className="rounded-2xl border border-line bg-card overflow-hidden shadow-sm divide-y divide-line">
              {chapters.map((chap, idx) => (
                <div
                  key={chap.id}
                  className="p-5 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-orange">
                        #{idx + 1}
                      </span>
                      <span className="font-display font-bold text-base text-ink">
                        {chap.name}
                      </span>
                      <Chip variant="neutral" className="text-[10px]">
                        Code: {chap.code}
                      </Chip>
                    </div>
                    <p className="font-sans text-xs text-ink-soft">
                      {chap.college} · {chap.city || "India"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-display font-bold text-base text-ink">
                        {chap.signups_this_month}
                      </div>
                      <div className="font-sans text-[10px] text-ink-soft">
                        sign-ups this month
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteChapter(chap.id)}
                      className="text-orange-deep hover:bg-orange-soft"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. TAB: LAUNCHPAD SIGNAL */}
        {activeTab === "launchpad" && (
          <div className="space-y-6">
            <div className="rounded-2xl border-2 border-orange/20 bg-gradient-to-br from-card to-orange-soft/30 p-6 space-y-2">
              <h2 className="font-display font-black text-2xl text-ink flex items-center gap-2">
                <Sparkles className="size-5 text-orange" />
                Launchpad Signal
              </h2>
              <p className="font-sans text-sm text-ink-soft max-w-2xl leading-relaxed">
                Teams formed on TFC Connect in the last 30 days that have actively shipped 3+ updates.
                These are top candidates for early access admission into The Future Council Launchpad &apos;27.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-card overflow-hidden shadow-sm divide-y divide-line">
              {launchpadSignals.length === 0 ? (
                <div className="p-12 text-center font-sans text-ink-soft">
                  No newly formed teams meet the 3+ updates criterion yet. Run updates on verified startups to generate signals!
                </div>
              ) : (
                launchpadSignals.map((item) => (
                  <div
                    key={item.connection_id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-base text-ink">
                          {item.startup_name || "Campus Venture"}
                        </span>
                        {item.startup_tier && (
                          <Chip variant="backed" className="text-[10px]">
                            {item.startup_tier}
                          </Chip>
                        )}
                        <span className="font-mono text-xs font-bold text-forest bg-forest-soft px-2 py-0.5 rounded-full">
                          🔥 {item.updates_count} updates
                        </span>
                      </div>

                      <p className="font-sans text-xs text-ink-soft">
                        Founders: <strong className="text-ink">{item.user_a_name}</strong> ({item.user_a_college}) &amp;{" "}
                        <strong className="text-ink">{item.user_b_name}</strong> ({item.user_b_college})
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="solid"
                      onClick={() => handleLaunchpadInvite(item.connection_id)}
                      className="shadow-sm gap-1.5"
                    >
                      <Sparkles className="size-3.5" />
                      Invite to Fellowship &apos;27
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* DIALOG: Approve Verification */}
      <Dialog open={!!approveModalReq} onOpenChange={(open) => !open && setApproveModalReq(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Verification</DialogTitle>
            <DialogDescription>
              Grant verified credential to {approveModalReq?.target_name} ({approveModalReq?.kind}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {approveModalReq?.kind === "startup" && (
              <div className="space-y-1.5">
                <label className="font-sans text-xs font-semibold text-ink">
                  Grant Verification Tier
                </label>
                <select
                  value={approveTier}
                  onChange={(e) => setApproveTier(e.target.value as "verified" | "tfc_backed")}
                  className="w-full rounded-xl border border-line bg-bg px-3 py-2 font-sans text-xs text-ink"
                >
                  <option value="verified">Verified (Standard verified checkmark)</option>
                  <option value="tfc_backed">TFC Backed (Launchpad Fellows / 2x trending multiplier)</option>
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">
                Reviewer Note (optional)
              </label>
              <textarea
                value={reviewerNote}
                onChange={(e) => setReviewerNote(e.target.value)}
                placeholder="e.g. Domain ownership verified, live on iOS App Store."
                rows={2}
                className="w-full rounded-xl border border-line bg-bg p-3 font-sans text-xs text-ink"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={() => setApproveModalReq(null)}>
              Cancel
            </Button>
            <Button
              variant="forest"
              size="sm"
              onClick={handleApprove}
              disabled={actionLoading}
            >
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Reject Verification */}
      <Dialog open={!!rejectModalReq} onOpenChange={(open) => !open && setRejectModalReq(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>
              Provide feedback for {rejectModalReq?.target_name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">
                Reason for Rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Broken website link or unverified university email."
                rows={3}
                className="w-full rounded-xl border border-line bg-bg p-3 font-sans text-xs text-ink"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={() => setRejectModalReq(null)}>
              Cancel
            </Button>
            <Button
              variant="solid"
              size="sm"
              onClick={handleReject}
              disabled={actionLoading}
              className="bg-orange-deep text-warm"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Ask Info */}
      <Dialog open={!!askInfoModalReq} onOpenChange={(open) => !open && setAskInfoModalReq(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Information</DialogTitle>
            <DialogDescription>
              Ask the applicant to provide additional proof.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">
                Information Needed
              </label>
              <textarea
                value={askInfoText}
                onChange={(e) => setAskInfoText(e.target.value)}
                placeholder="e.g. Please link a demo video or update your college roll number."
                rows={3}
                className="w-full rounded-xl border border-line bg-bg p-3 font-sans text-xs text-ink"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={() => setAskInfoModalReq(null)}>
              Cancel
            </Button>
            <Button
              variant="solid"
              size="sm"
              onClick={handleAskInfo}
              disabled={actionLoading || !askInfoText.trim()}
            >
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: New Collection */}
      <Dialog open={newCollectionOpen} onOpenChange={setNewCollectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Collection</DialogTitle>
            <DialogDescription>
              Curate a list of campus startups for directory feature.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">Title</label>
              <input
                type="text"
                value={newColTitle}
                onChange={(e) => {
                  setNewColTitle(e.target.value);
                  setNewColSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, "")
                  );
                }}
                placeholder="e.g. AI by Students"
                className="w-full rounded-xl border border-line bg-bg px-3 py-2 font-sans text-xs text-ink"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">Slug</label>
              <input
                type="text"
                value={newColSlug}
                onChange={(e) => setNewColSlug(e.target.value)}
                placeholder="e.g. ai-by-students"
                className="w-full rounded-xl border border-line bg-bg px-3 py-2 font-sans text-xs text-ink"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">Theme Accent</label>
              <select
                value={newColTheme}
                onChange={(e) =>
                  setNewColTheme(
                    e.target.value as "orange" | "forest" | "amber" | "ink" | "ballpoint"
                  )
                }
                className="w-full rounded-xl border border-line bg-bg px-3 py-2 font-sans text-xs text-ink"
              >
                <option value="orange">Orange (Launchpad / High energy)</option>
                <option value="forest">Forest (DU / Campus)</option>
                <option value="amber">Amber (Bharat / Hardware)</option>
                <option value="ink">Ink (Deep tech / AI)</option>
                <option value="ballpoint">Ballpoint (Design / Products)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-ink">Description</label>
              <textarea
                value={newColDesc}
                onChange={(e) => setNewColDesc(e.target.value)}
                placeholder="Brief one-line summary..."
                rows={2}
                className="w-full rounded-xl border border-line bg-bg p-3 font-sans text-xs text-ink"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pubCheck"
                checked={newColPublished}
                onChange={(e) => setNewColPublished(e.target.checked)}
                className="rounded border-line text-orange"
              />
              <label htmlFor="pubCheck" className="font-sans text-xs font-medium text-ink">
                Publish immediately to directory
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={() => setNewCollectionOpen(false)}>
              Cancel
            </Button>
            <Button variant="solid" size="sm" onClick={handleCreateCollection} disabled={actionLoading}>
              Create Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Add Startup to Collection */}
      <Dialog open={!!addStartupColId} onOpenChange={(open) => !open && setAddStartupColId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Startup to Collection</DialogTitle>
            <DialogDescription>
              Select a registered campus startup to include.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <select
              value={selectedStartupToAdd}
              onChange={(e) => setSelectedStartupToAdd(e.target.value)}
              className="w-full rounded-xl border border-line bg-bg px-3 py-2.5 font-sans text-xs text-ink"
            >
              <option value="">Select startup...</option>
              {availableStartups.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (/startups/{s.slug})
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={() => setAddStartupColId(null)}>
              Cancel
            </Button>
            <Button
              variant="solid"
              size="sm"
              onClick={handleAddStartupToCollection}
              disabled={!selectedStartupToAdd}
            >
              Add to Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: New Chapter */}
      <Dialog open={newChapterOpen} onOpenChange={setNewChapterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Campus Chapter</DialogTitle>
            <DialogDescription>
              Register a new university chapter with verification code.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="font-sans text-xs font-semibold text-ink">Chapter Name</label>
              <input
                type="text"
                value={newChapName}
                onChange={(e) => setNewChapName(e.target.value)}
                placeholder="e.g. TFC BITS Pilani"
                className="w-full rounded-xl border border-line bg-bg px-3 py-2 font-sans text-xs text-ink"
              />
            </div>

            <div className="space-y-1">
              <label className="font-sans text-xs font-semibold text-ink">College Name</label>
              <input
                type="text"
                value={newChapCollege}
                onChange={(e) => setNewChapCollege(e.target.value)}
                placeholder="e.g. Birla Institute of Technology and Science"
                className="w-full rounded-xl border border-line bg-bg px-3 py-2 font-sans text-xs text-ink"
              />
            </div>

            <div className="space-y-1">
              <label className="font-sans text-xs font-semibold text-ink">City</label>
              <input
                type="text"
                value={newChapCity}
                onChange={(e) => setNewChapCity(e.target.value)}
                placeholder="e.g. Pilani / Goa / Hyderabad"
                className="w-full rounded-xl border border-line bg-bg px-3 py-2 font-sans text-xs text-ink"
              />
            </div>

            <div className="space-y-1">
              <label className="font-sans text-xs font-semibold text-ink">Verification Code</label>
              <input
                type="text"
                value={newChapCode}
                onChange={(e) => setNewChapCode(e.target.value.toUpperCase())}
                placeholder="e.g. TFC-BITS-01"
                className="w-full rounded-xl border border-line bg-bg px-3 py-2 font-sans text-xs text-ink font-mono uppercase"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={() => setNewChapterOpen(false)}>
              Cancel
            </Button>
            <Button variant="solid" size="sm" onClick={handleCreateChapter} disabled={actionLoading}>
              Save Chapter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
