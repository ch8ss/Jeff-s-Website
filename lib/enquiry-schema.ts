import { z } from "zod";

export const TOPICS = ["Mural", "Buy artwork", "Live painting", "Collab", "Other"] as const;

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please add your name").max(120),
  email: z.email("That email doesn't look right").max(200),
  organisation: z.string().trim().max(160).optional().or(z.literal("")),
  topic: z.enum(TOPICS, { message: "Pick what it's about" }),
  preferred_date: z.iso.date().optional().or(z.literal("")),
  message: z.string().trim().min(10, "A few more words, please").max(600, "Keep it under 600 characters"),
  consent: z.literal("on", { message: "Please tick the box so Jeff can reply" }),
  artwork_id: z.uuid().optional().or(z.literal("")),
});

export type EnquiryState = {
  ok: boolean;
  message?: string;
  errors?: Partial<Record<string, string>>;
};
