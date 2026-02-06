import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["owner", "rep"] }).notNull().default("owner"),
  agencyId: integer("agency_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agencies = pgTable("agencies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const widgets = pgTable("widgets", {
  id: serial("id").primaryKey(),
  agencyId: integer("agency_id").notNull(),
  name: text("name").notNull(),
  // Store form fields configuration: { label, key, required, type, options? }[]
  fields: jsonb("fields").notNull().$type<any[]>().default([]), 
  primaryColor: text("primary_color").default("#000000"),
  headingText: text("heading_text"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  agencyId: integer("agency_id").notNull(),
  widgetId: integer("widget_id").notNull(),
  // Captured data
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  // Full form responses map
  formResponses: jsonb("form_responses").notNull().$type<Record<string, any>>().default({}),
  status: text("status", { enum: ["new", "contacted", "qualified", "converted", "closed_lost"] }).notNull().default("new"),
  assignedTo: integer("assigned_to"), // userId of rep
  createdAt: timestamp("created_at").defaultNow(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").notNull(),
  authorId: integer("author_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [users.agencyId],
    references: [agencies.id],
  }),
  assignedLeads: many(leads, { relationName: "assignedLeads" }),
}));

export const agenciesRelations = relations(agencies, ({ many }) => ({
  users: many(users),
  widgets: many(widgets),
  leads: many(leads),
}));

export const widgetsRelations = relations(widgets, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [widgets.agencyId],
    references: [agencies.id],
  }),
  leads: many(leads),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [leads.agencyId],
    references: [agencies.id],
  }),
  widget: one(widgets, {
    fields: [leads.widgetId],
    references: [widgets.id],
  }),
  assignee: one(users, {
    fields: [leads.assignedTo],
    references: [users.id],
    relationName: "assignedLeads",
  }),
  notes: many(notes),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  lead: one(leads, {
    fields: [notes.leadId],
    references: [leads.id],
  }),
  author: one(users, {
    fields: [notes.authorId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertAgencySchema = createInsertSchema(agencies).omit({ id: true, createdAt: true });
export const insertWidgetSchema = createInsertSchema(widgets).omit({ id: true, createdAt: true, agencyId: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export const insertNoteSchema = createInsertSchema(notes).omit({ id: true, createdAt: true });

// === TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Agency = typeof agencies.$inferSelect;
export type InsertAgency = z.infer<typeof insertAgencySchema>;

export type Widget = typeof widgets.$inferSelect;
export type InsertWidget = z.infer<typeof insertWidgetSchema>;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type Note = typeof notes.$inferSelect;
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

export type CreateWidgetRequest = InsertWidget & { fields: WidgetField[] };
export type UpdateWidgetRequest = Partial<CreateWidgetRequest>;

export type CreateLeadRequest = {
  widgetId: number;
  formResponses: Record<string, string>;
};

export type UpdateLeadRequest = {
  status?: LeadStatus;
  assignedTo?: number | null;
  notes?: string; // Optional convenience to add a note while updating
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
