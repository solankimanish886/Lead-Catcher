import { z } from "zod";

// === BASE SCHEMAS ===

export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  name: z.string().min(1),
  role: z.enum(["owner", "rep"]).default("owner"),
  agencyId: z.number(),
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
  type: "text" | "email" | "phone" | "textarea" | "dropdown";
  required: boolean;
  options?: string[]; // for dropdown
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
