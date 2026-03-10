import { z } from "zod";

// === BASE SCHEMAS ===

export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  name: z.string().min(1),
  role: z.enum(["owner", "agent"]).default("agent"),
  status: z.enum(["active", "inactive"]).default("active"),
  agencyId: z.number(),
  resetToken: z.string().optional().nullable(),
  resetTokenExpiresAt: z.date().optional().nullable(),
});

export const insertAgencySchema = z.object({
  name: z.string().min(1),
});

export const insertWidgetSchema = z.object({
  name: z.string().min(1),
  agencyId: z.number(),
  fields: z.array(z.any()).default([]),
  primaryColor: z.string().default("#000000").optional(),
  headingText: z.string().optional().nullable(),
  ctaText: z.string().max(40).optional().nullable(),
  formId: z.string().optional().nullable(),
  status: z.enum(["active", "inactive", "draft"]).default("active"),
});

export const insertLeadSchema = z.object({
  agencyId: z.number(),
  widgetId: z.number(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  formResponses: z.record(z.any()).default({}),
  status: z.enum(["new", "contacted", "qualified", "converted", "closed_lost"]).default("new"),
  assignedTo: z.number().optional().nullable(),
});

export const insertNoteSchema = z.object({
  leadId: z.number(),
  authorId: z.number(),
  content: z.string().min(1),
});

// === TYPES ===

export type User = z.infer<typeof insertUserSchema> & { id: number; createdAt: Date };
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Agency = z.infer<typeof insertAgencySchema> & { id: number; createdAt: Date };
export type InsertAgency = z.infer<typeof insertAgencySchema>;

export type Widget = z.infer<typeof insertWidgetSchema> & { id: number; agencyId: number; createdAt: Date };
export type InsertWidget = z.infer<typeof insertWidgetSchema>;

export type Lead = z.infer<typeof insertLeadSchema> & { id: number; createdAt: Date };
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type Note = z.infer<typeof insertNoteSchema> & { id: number; createdAt: Date };
export type InsertNote = z.infer<typeof insertNoteSchema>;

// === API CONTRACT TYPES ===

export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "closed_lost";

// Widget Field definition for JSONB
export interface WidgetField {
  key: string;
  label: string;
  type: "text" | "email" | "phone" | "textarea" | "dropdown" | "radio" | "checkbox" | "date" | "date_time" | "number" | "file_upload";
  required: boolean;
  options?: any[]; // for dropdown, radio, checkbox
  // Metadata for validation/constraints
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
  maxSize?: number;
}

export type CreateWidgetRequest = Omit<InsertWidget, "agencyId"> & { fields: WidgetField[] };
export type UpdateWidgetRequest = Partial<CreateWidgetRequest>;

export type CreateLeadRequest = {
  widgetId: number;
  formResponses: Record<string, string>;
};

export type UpdateLeadRequest = {
  status?: LeadStatus;
  assignedTo?: number | null;
  notes?: string;
};

export type CreateNoteRequest = {
  content: string;
};

export type DashboardStats = {
  totalLeads: number;
  leadsByStatus: Record<LeadStatus, number>;
  leadsByWidget: Record<string, number>;
  recentLeads: Lead[];
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
  agencyName: string;
};
