import { ComplaintCategory, ComplaintStatus, Priority } from "@prisma/client";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2).max(80),
  flatNumber: z.string().min(1).max(20),
  phone: z.string().max(20).optional(),
});

export const createComplaintSchema = z.object({
  title: z.string().min(4).max(120),
  description: z.string().min(12).max(2000),
  category: z.nativeEnum(ComplaintCategory),
  priority: z.nativeEnum(Priority),
  location: z.string().max(120).optional(),
});

export const updateComplaintStatusSchema = z.object({
  complaintId: z.string().cuid(),
  status: z.nativeEnum(ComplaintStatus),
  note: z.string().max(500).optional(),
});

export const createNoticeSchema = z.object({
  title: z.string().min(4).max(140),
  body: z.string().min(10).max(3000),
  pinned: z.boolean().default(false),
  important: z.boolean().default(false),
});

export const ratingSchema = z.object({
  complaintId: z.string().cuid(),
  score: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const complaintFilterSchema = z.object({
  category: z.nativeEnum(ComplaintCategory).optional(),
  status: z.nativeEnum(ComplaintStatus).optional(),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  q: z.string().max(100).optional(),
});

export const overdueSettingsSchema = z.object({
  days: z.number().int().min(1).max(30),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type UpdateComplaintStatusInput = z.infer<typeof updateComplaintStatusSchema>;
export type CreateNoticeInput = z.infer<typeof createNoticeSchema>;
