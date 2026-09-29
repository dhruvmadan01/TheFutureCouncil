import { Database } from "@/lib/supabase/types";

export type ReviewStatus = Database["public"]["Enums"]["review_status"];
export type VerificationTier = Database["public"]["Enums"]["verification_tier"];
export type CollectionTheme = "orange" | "forest" | "amber" | "ink" | "ballpoint";

export interface AdminKPIs {
  profilesCount: number;
  profilesWeeklyDelta: number;
  startupsCount: number;
  startupsWeeklyDelta: number;
  requestAcceptanceRate: number; // percentage 0-100
  teamsFormedCount: number;
  teamsFormedWeeklyDelta: number;
}

export interface VerificationQueueItem {
  id: string;
  kind: "profile" | "startup";
  target_id: string;
  target_name: string;
  target_meta: string;
  submitted_by: string;
  submitter_name: string;
  evidence: string | null;
  status: ReviewStatus;
  waiting_hours: number;
  created_at: string;
}

export interface ReportQueueItem {
  id: string;
  target_type: "profile" | "startup" | "message" | "connection";
  target_id: string;
  target_title: string;
  reporter_id: string;
  reporter_name: string;
  reason: "spam" | "fake" | "harassment" | "inappropriate" | "other";
  details: string | null;
  status: ReviewStatus;
  created_at: string;
}

export interface AdminCollectionItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  theme: CollectionTheme;
  is_published: boolean;
  sort_order: number;
  startups: {
    id: string;
    slug: string;
    name: string;
    logo_url: string | null;
    verification_tier: VerificationTier;
  }[];
}

export interface ChapterItem {
  id: string;
  name: string;
  college: string;
  city: string | null;
  code: string;
  signups_this_month: number;
  created_at: string;
}

export interface LaunchpadSignalItem {
  connection_id: string;
  user_a_name: string;
  user_a_college: string | null;
  user_b_name: string;
  user_b_college: string | null;
  startup_id?: string;
  startup_slug?: string;
  startup_name?: string;
  startup_tier?: string;
  updates_count: number;
  teamed_up_at: string;
}
