import { Database } from "@/lib/supabase/types";

export type StartupStage = Database["public"]["Enums"]["startup_stage"];
export type VerificationTier = Database["public"]["Enums"]["verification_tier"];
export type RoleType = Database["public"]["Enums"]["role_type"];
export type SkillType = Database["public"]["Enums"]["skill"];
export type CommitmentType = Database["public"]["Enums"]["commitment"];

export interface StartupMetric {
  label: string;
  value: string;
}

export interface StartupItem {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  cover_url: string | null;
  one_liner: string;
  problem: string | null;
  solution: string | null;
  stage: StartupStage;
  industry: string;
  city: string | null;
  website: string | null;
  demo_video_url: string | null;
  founded_year: number | null;
  metrics: StartupMetric[];
  funding_raised: string | null;
  status_tags: string[];
  deck_path: string | null;
  verification_tier: VerificationTier;
  claimed: boolean;
  is_hidden: boolean;
  created_by: string | null;
  last_update_at: string;
  created_at: string;
  updated_at: string;
  follows_count: number;
  upvotes_count: number;
  is_inactive: boolean;
  trending_score: number;
}

export interface CollectionItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  theme: "orange" | "forest" | "amber" | "ink" | "ballpoint";
  is_published: boolean;
  sort_order: number;
}

export interface OpenRoleItem {
  id: string;
  startup_id: string;
  title: string;
  type: RoleType;
  skills: SkillType[];
  commitment: CommitmentType | null;
  description: string | null;
  is_open: boolean;
  created_at: string;
}

export interface TeamMemberItem {
  startup_id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  college: string | null;
  role_title: string | null;
  is_owner: boolean;
  met_on_tfc: boolean;
}

export interface StartupUpdateItem {
  id: string;
  startup_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const STAGES: { id: StartupStage; label: string }[] = [
  { id: "idea", label: "Idea" },
  { id: "building", label: "Building / Prototype" },
  { id: "launched", label: "Launched (Beta)" },
  { id: "revenue", label: "Generating Revenue" },
  { id: "funded", label: "Funded / Scaling" },
];

export const STATUS_TAGS = [
  { id: "needs_cofounder", label: "🤝 Needs Co-founder" },
  { id: "hiring", label: "💼 Hiring" },
  { id: "beta_users", label: "🧪 Looking for Beta Users" },
  { id: "raising", label: "📈 Raising Capital" },
  { id: "mentors", label: "🧠 Seeking Mentors" },
] as const;

export const INDUSTRIES = [
  "AI/ML",
  "AgriTech",
  "B2B SaaS",
  "Climate & CleanTech",
  "Consumer & Social",
  "Creator Economy",
  "DeepTech & Robotics",
  "Developer Tools",
  "E-commerce & D2C",
  "EdTech",
  "FinTech & Payments",
  "Gaming & Media",
  "HealthTech & Bio",
  "Logistics & Supply",
  "Other",
] as const;
