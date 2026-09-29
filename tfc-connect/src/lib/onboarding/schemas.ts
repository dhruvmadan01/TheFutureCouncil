import { z } from "zod";

export const skillEnum = z.enum([
  "tech",
  "product",
  "design",
  "growth",
  "sales",
  "ops",
  "domain",
]);

export const founderRoleEnum = z.enum(["idea", "join", "either"]);
export const commitmentEnum = z.enum(["full_time", "part_time", "after_grad"]);
export const equityPrefEnum = z.enum(["equal", "open", "depends"]);

export const step1Schema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name must be under 80 characters"),
  college: z.string().min(2, "College/Company is required").max(100),
  city: z.string().min(2, "City is required").max(60),
  email: z.string().email("Valid college or company email is required"),
  linkedin_url: z
    .string()
    .url("Please enter a valid LinkedIn URL")
    .or(z.literal(""))
    .optional(),
  chapter_code: z.string().max(30).optional(),
  avatar_url: z.string().url().or(z.literal("")).optional(),
});

export const step2Schema = z.object({
  role: founderRoleEnum,
  primary_skill: skillEnum,
  secondary_skills: z.array(skillEnum).default([]),
});

export const step3Schema = z.object({
  looking_for_skills: z
    .array(skillEnum)
    .min(1, "Pick at least 1 skill you are looking for")
    .max(3, "Pick up to 3 skills"),
  industries: z
    .array(z.string())
    .min(1, "Pick at least 1 industry")
    .max(5, "Pick up to 5 industries"),
  commitment: commitmentEnum,
  city: z.string().min(2, "Preferred city is required"),
  remote_ok: z.boolean().default(true),
  equity_pref: equityPrefEnum.default("open"),
});

export const proofLinkSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  title: z.string().min(2, "Title is required").max(80),
  note: z.string().max(120).optional(),
});

export const step4Schema = z.object({
  proof_links: z
    .array(proofLinkSchema)
    .min(1, "Add at least 1 proof of work link")
    .max(3, "You can add up to 3 proof links"),
  why_startup: z
    .string()
    .min(10, "Why do you want to start up? (at least 10 characters)")
    .max(200, "Maximum 200 characters"),
});

export const step5Schema = z.object({
  speed: z.number().min(0).max(100),
  risk: z.number().min(0).max(100),
  hours: z.number().min(0).max(100),
  decision: z.number().min(0).max(100),
});

export const profileEditSchema = z.object({
  full_name: z.string().min(2).max(80),
  headline: z.string().max(120).optional().or(z.literal("")),
  college: z.string().min(2).max(100).optional().or(z.literal("")),
  city: z.string().min(2).max(60).optional().or(z.literal("")),
  bio: z.string().max(600).optional().or(z.literal("")),
  why_startup: z.string().max(200).optional().or(z.literal("")),
  role: founderRoleEnum.optional(),
  primary_skill: skillEnum.optional(),
  secondary_skills: z.array(skillEnum).optional(),
  looking_for_skills: z.array(skillEnum).optional(),
  industries: z.array(z.string()).optional(),
  commitment: commitmentEnum.optional(),
  remote_ok: z.boolean().optional(),
  equity_pref: equityPrefEnum.optional(),
  proof_links: z.array(proofLinkSchema).optional(),
  speed: z.number().min(0).max(100).optional(),
  risk: z.number().min(0).max(100).optional(),
  hours: z.number().min(0).max(100).optional(),
  decision: z.number().min(0).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional().or(z.literal("")),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  hide_from_own_college: z.boolean().optional(),
  hidden: z.boolean().optional(),
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type ProfileEditData = z.infer<typeof profileEditSchema>;
