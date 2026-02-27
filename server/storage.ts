import {
  UserModel, AgencyModel, WidgetModel, LeadModel, NoteModel, getNextId
} from "./models";
import {
  type User, type InsertUser,
  type Agency, type InsertAgency,
  type Widget, type InsertWidget,
  type Lead, type InsertLead,
  type Note, type InsertNote,
  type LeadStatus
} from "@shared/schema";

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
    const user = await UserModel.findById(id);
    return user ? user.toJSON() : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email });
    return user ? user.toJSON() : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = await getNextId(UserModel);
    const newUser = await UserModel.create({ ...user, _id: id });
    return newUser.toJSON();
  }

  async createAgency(agency: InsertAgency): Promise<Agency> {
    const id = await getNextId(AgencyModel);
    const newAgency = await AgencyModel.create({ ...agency, _id: id });
    return newAgency.toJSON();
  }

  async getAgencyUsers(agencyId: number): Promise<User[]> {
    const users = await UserModel.find({ agencyId });
    return users.map(u => u.toJSON());
  }

  async getWidgets(agencyId: number): Promise<Widget[]> {
    const widgets = await WidgetModel.find({ agencyId }).sort({ createdAt: -1 });
    return widgets.map(w => w.toJSON());
  }

  async getWidget(id: number): Promise<Widget | undefined> {
    const widget = await WidgetModel.findById(id);
    return widget ? widget.toJSON() : undefined;
  }

  async createWidget(widget: InsertWidget): Promise<Widget> {
    const id = await getNextId(WidgetModel);
    const newWidget = await WidgetModel.create({ ...widget, _id: id });
    return newWidget.toJSON();
  }

  async updateWidget(id: number, updates: Partial<InsertWidget>): Promise<Widget> {
    const updated = await WidgetModel.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) throw new Error("Widget not found");
    return updated.toJSON();
  }

  async deleteWidget(id: number): Promise<void> {
    await WidgetModel.findByIdAndDelete(id);
  }

  async getLeads(agencyId: number): Promise<Lead[]> {
    const leads = await LeadModel.find({ agencyId }).sort({ createdAt: -1 });
    return leads.map(l => l.toJSON());
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const lead = await LeadModel.findById(id);
    return lead ? lead.toJSON() : undefined;
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const id = await getNextId(LeadModel);
    const newLead = await LeadModel.create({ ...lead, _id: id });
    return newLead.toJSON();
  }

  async updateLead(id: number, updates: Partial<Lead>): Promise<Lead> {
    const updated = await LeadModel.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) throw new Error("Lead not found");
    return updated.toJSON();
  }

  async getNotes(leadId: number): Promise<Note[]> {
    const notes = await NoteModel.find({ leadId }).sort({ createdAt: -1 });
    return notes.map(n => n.toJSON());
  }

  async createNote(note: InsertNote): Promise<Note> {
    const id = await getNextId(NoteModel);
    const newNote = await NoteModel.create({ ...note, _id: id });
    return newNote.toJSON();
  }

  async getAgencyStats(agencyId: number, days: number): Promise<any> {
    const agencyLeads = await this.getLeads(agencyId);

    const totalLeads = agencyLeads.length;

    const leadsByStatus = agencyLeads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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
