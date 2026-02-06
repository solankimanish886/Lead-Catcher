import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { db } from "./db";
import { widgets, leads } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Set up authentication first
  setupAuth(app);

  // === PROTECTED ROUTES (require auth) ===
  
  // Middleware to ensure user is logged in
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Team
  app.get(api.team.list.path, requireAuth, async (req, res) => {
    const user = req.user!;
    if (user.role !== 'owner') {
      return res.status(403).json({ message: "Only owners can view team" });
    }
    const team = await storage.getAgencyUsers(user.agencyId);
    res.json(team);
  });

  app.post(api.team.invite.path, requireAuth, async (req, res) => {
    const user = req.user!;
    if (user.role !== 'owner') {
      return res.status(403).json({ message: "Only owners can invite members" });
    }
    
    const input = api.team.invite.input.parse(req.body);
    
    // Check if user exists
    const existingUser = await storage.getUserByEmail(input.email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Create new user in same agency
    const newUser = await storage.createUser({
      ...input,
      agencyId: user.agencyId,
      role: 'rep', // Default role for invites
    });
    
    res.status(201).json(newUser);
  });

  // Widgets
  app.get(api.widgets.list.path, requireAuth, async (req, res) => {
    const user = req.user!;
    const items = await storage.getWidgets(user.agencyId);
    res.json(items);
  });

  app.get(api.widgets.get.path, requireAuth, async (req, res) => {
    const user = req.user!;
    const widget = await storage.getWidget(Number(req.params.id));
    
    if (!widget || widget.agencyId !== user.agencyId) {
      return res.status(404).json({ message: "Widget not found" });
    }
    res.json(widget);
  });

  app.post(api.widgets.create.path, requireAuth, async (req, res) => {
    const user = req.user!;
    const input = api.widgets.create.input.parse(req.body);
    
    const widget = await storage.createWidget({
      ...input,
      agencyId: user.agencyId,
    });
    res.status(201).json(widget);
  });

  app.put(api.widgets.update.path, requireAuth, async (req, res) => {
    const user = req.user!;
    const widget = await storage.getWidget(Number(req.params.id));
    
    if (!widget || widget.agencyId !== user.agencyId) {
      return res.status(404).json({ message: "Widget not found" });
    }
    
    const input = api.widgets.update.input.parse(req.body);
    const updated = await storage.updateWidget(widget.id, input);
    res.json(updated);
  });
  
  app.delete(api.widgets.delete.path, requireAuth, async (req, res) => {
    const user = req.user!;
    const widget = await storage.getWidget(Number(req.params.id));
    
    if (!widget || widget.agencyId !== user.agencyId) {
      return res.status(404).json({ message: "Widget not found" });
    }
    
    await storage.deleteWidget(widget.id);
    res.json({ success: true });
  });

  // Leads
  app.get(api.leads.list.path, requireAuth, async (req, res) => {
    const user = req.user!;
    const allLeads = await storage.getLeads(user.agencyId);
    
    // Filter if rep
    let filtered = allLeads;
    if (user.role === 'rep') {
      filtered = allLeads.filter(l => l.assignedTo === user.id);
    }
    
    // Get related data names for UI convenience
    const enriched = await Promise.all(filtered.map(async (l) => {
      const w = await storage.getWidget(l.widgetId);
      const assignee = l.assignedTo ? await storage.getUser(l.assignedTo) : null;
      return {
        ...l,
        widgetName: w?.name,
        assigneeName: assignee?.name
      };
    }));
    
    res.json(enriched);
  });

  app.get(api.leads.get.path, requireAuth, async (req, res) => {
    const user = req.user!;
    const lead = await storage.getLead(Number(req.params.id));
    
    if (!lead || lead.agencyId !== user.agencyId) {
      return res.status(404).json({ message: "Lead not found" });
    }
    
    if (user.role === 'rep' && lead.assignedTo !== user.id) {
       return res.status(403).json({ message: "Access denied" });
    }
    
    const notes = await storage.getNotes(lead.id);
    res.json({ ...lead, notes });
  });

  app.put(api.leads.update.path, requireAuth, async (req, res) => {
    const user = req.user!;
    const lead = await storage.getLead(Number(req.params.id));
    
    if (!lead || lead.agencyId !== user.agencyId) {
      return res.status(404).json({ message: "Lead not found" });
    }
    
    const input = api.leads.update.input.parse(req.body);
    const updated = await storage.updateLead(lead.id, input);
    res.json(updated);
  });

  app.post(api.leads.addNote.path, requireAuth, async (req, res) => {
    const user = req.user!;
    const lead = await storage.getLead(Number(req.params.id));
    
    if (!lead || lead.agencyId !== user.agencyId) {
      return res.status(404).json({ message: "Lead not found" });
    }
    
    const input = api.leads.addNote.input.parse(req.body);
    const note = await storage.createNote({
      leadId: lead.id,
      authorId: user.id,
      content: input.content,
    });
    res.status(201).json(note);
  });

  // Dashboard
  app.get(api.dashboard.stats.path, requireAuth, async (req, res) => {
    const user = req.user!;
    const stats = await storage.getAgencyStats(user.agencyId, 30);
    res.json(stats);
  });


  // === PUBLIC ROUTES (Widget API) ===
  
  // Simple in-memory rate limiter
  const submissionLog = new Map<string, number[]>();
  const WINDOW_MS = 60 * 60 * 1000; // 1 hour
  const MAX_SUBMISSIONS = 10;

  app.get(api.public.getWidget.path, async (req, res) => {
    const widget = await storage.getWidget(Number(req.params.id));
    if (!widget) {
      return res.status(404).json({ message: "Widget not found" });
    }
    res.json(widget);
  });

  app.post(api.public.submitLead.path, async (req, res) => {
    const input = api.public.submitLead.input.parse(req.body);
    
    // 1. Honeypot check
    if (input._hp) {
      // Silent success for bots
      return res.status(201).json({ success: true });
    }

    // 2. Rate limiting
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const timestamps = submissionLog.get(ip) || [];
    // Filter out old timestamps
    const recent = timestamps.filter(t => now - t < WINDOW_MS);
    
    if (recent.length >= MAX_SUBMISSIONS) {
      return res.status(429).json({ message: "Too many requests" });
    }
    
    recent.push(now);
    submissionLog.set(ip, recent);

    const widget = await storage.getWidget(input.widgetId);
    
    if (!widget) {
      return res.status(404).json({ message: "Widget not found" });
    }
    
    // Extract key info for quick access
    const email = input.formResponses['email'] || input.formResponses['Email'];
    const name = input.formResponses['name'] || input.formResponses['Name'];
    const phone = input.formResponses['phone'] || input.formResponses['Phone'];

    await storage.createLead({
      agencyId: widget.agencyId,
      widgetId: widget.id,
      formResponses: input.formResponses,
      email: typeof email === 'string' ? email : undefined,
      name: typeof name === 'string' ? name : undefined,
      phone: typeof phone === 'string' ? phone : undefined,
      status: "new",
    });
    
    res.status(201).json({ success: true });
  });


  return httpServer;
}
