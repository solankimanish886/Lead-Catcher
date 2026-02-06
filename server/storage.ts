import { db } from "./db";
import {
  users, agencies, widgets, leads, notes,
  type User, type InsertUser,
  type Agency, type InsertAgency,
  type Widget, type InsertWidget,
  type Lead, type InsertLead,
  type Note, type InsertNote,
  type LeadStatus
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User & Agency
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createAgency(agency: InsertAgency): Promise<Agency>;
  getAgencyUsers(agencyId: number): Promise<User[]>;
  
  // Widgets
  getWidgets(agencyId: number): Promise<Widget[]>;
  getWidget(id: number): Promise<Widget | undefined>;
  createWidget(widget: InsertWidget): Promise<Widget>;
  updateWidget(id: number, widget: Partial<InsertWidget>): Promise<Widget>;
  deleteWidget(id: number): Promise<void>;

  // Leads
  getLeads(agencyId: number): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, updates: Partial<Lead>): Promise<Lead>;
  
  // Notes
  getNotes(leadId: number): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  
  // Dashboard
  getAgencyStats(agencyId: number, days: number): Promise<any>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor(sessionStore: any) {
    this.sessionStore = sessionStore;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async createAgency(agency: InsertAgency): Promise<Agency> {
    const [newAgency] = await db.insert(agencies).values(agency).returning();
    return newAgency;
  }

  async getAgencyUsers(agencyId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.agencyId, agencyId));
  }

  async getWidgets(agencyId: number): Promise<Widget[]> {
    return await db.select().from(widgets).where(eq(widgets.agencyId, agencyId)).orderBy(desc(widgets.createdAt));
  }

  async getWidget(id: number): Promise<Widget | undefined> {
    const [widget] = await db.select().from(widgets).where(eq(widgets.id, id));
    return widget;
  }

  async createWidget(widget: InsertWidget): Promise<Widget> {
    const [newWidget] = await db.insert(widgets).values(widget).returning();
    return newWidget;
  }

  async updateWidget(id: number, updates: Partial<InsertWidget>): Promise<Widget> {
    const [updated] = await db.update(widgets).set(updates).where(eq(widgets.id, id)).returning();
    return updated;
  }

  async deleteWidget(id: number): Promise<void> {
    await db.delete(widgets).where(eq(widgets.id, id));
  }

  async getLeads(agencyId: number): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.agencyId, agencyId)).orderBy(desc(leads.createdAt));
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }

  async updateLead(id: number, updates: Partial<Lead>): Promise<Lead> {
    const [updated] = await db.update(leads).set(updates).where(eq(leads.id, id)).returning();
    return updated;
  }

  async getNotes(leadId: number): Promise<Note[]> {
    return await db.select().from(notes).where(eq(notes.leadId, leadId)).orderBy(desc(notes.createdAt));
  }

  async createNote(note: InsertNote): Promise<Note> {
    const [newNote] = await db.insert(notes).values(note).returning();
    return newNote;
  }
  
  async getAgencyStats(agencyId: number, days: number): Promise<any> {
    // Simple aggregation for MVP
    const agencyLeads = await this.getLeads(agencyId);
    
    // Total leads
    const totalLeads = agencyLeads.length;
    
    // Leads by status
    const leadsByStatus = agencyLeads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Leads by widget
    const leadsByWidget = agencyLeads.reduce((acc, lead) => {
      const widgetKey = String(lead.widgetId);
      acc[widgetKey] = (acc[widgetKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLeads,
      leadsByStatus,
      leadsByWidget,
      recentLeads: agencyLeads.slice(0, 5)
    };
  }
}

export const storage = new DatabaseStorage(null);
