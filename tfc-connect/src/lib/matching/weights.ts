// src/lib/matching/weights.ts
// Mirrors public.match_score() in supabase/migrations/0001_init.sql. Keep the two in sync.

export const MATCH_WEIGHTS = {
  skills: 35, // they have what you need AND you have what they need
  commitment: 20, // same level = full points; part-time vs other = half
  industry: 15, // overlap of industries (Jaccard)
  location: 10, // same city 10 · both remote OK 7 · one remote OK 4
  workStyle: 10, // similarity of the 4 working-style sliders
  quality: 10, // verification, proof of work, bio, TFC Fellow
} as const;

export const MATCH_WEIGHT_LABELS: Record<keyof typeof MATCH_WEIGHTS, string> = {
  skills: "Complementary skills",
  commitment: "Commitment & timing",
  industry: "Industry overlap",
  location: "Location / remote fit",
  workStyle: "Working-style similarity",
  quality: "Profile quality & verification",
};

export const SKILLS = [
  { id: "tech", label: "Tech" },
  { id: "product", label: "Product" },
  { id: "design", label: "Design" },
  { id: "growth", label: "Growth" },
  { id: "sales", label: "Sales/BD" },
  { id: "ops", label: "Ops/Finance" },
  { id: "domain", label: "Domain expert" },
] as const;

export const FIT_KIT_QUESTIONS = [
  "Why this problem, and why now?",
  "Realistically, how many hours a week can each of us give?",
  "Who has the final call, and in which areas?",
  "Roles & titles: who owns what?",
  "Equity split and 4-year vesting with a 1-year cliff?",
  "What happens if one of us leaves?",
  "Money: savings, runway, family expectations",
  "Placements / higher studies: what are the plans?",
  "Where do the code, IP and accounts live?",
  "What does failure look like, and when do we call it?",
] as const;
