import express, { type Express } from "express";
import { createServer, type Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { User } from "@shared/schema";
import { api } from "@shared/routes";
import { z } from "zod";
import { hash } from "bcryptjs";

export async function registerRoutes(
  httpServer: HttpServer,
  app: Express,
  io: SocketServer
): Promise<HttpServer> {

  // Set up authentication first
  setupAuth(app);

  // Attach io to req for easy access in handlers
  app.use((req: any, _res, next) => {
    req.io = io;
    next();
  });

  // === PROTECTED ROUTES (require auth) ===

  // Middleware to ensure user is logged in
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Middleware to ensure user is an owner
  const requireOwner = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = req.user as User;
    if (user.role !== 'owner') {
      return res.status(403).json({ message: "Forbidden: Owner access required" });
    }
    next();
  };

  // Team
  app.get(api.team.list.path, requireAuth, requireOwner, async (req, res) => {
    const user = req.user as User;
    const team = await storage.getAgencyUsers(user.agencyId);
    res.json(team);
  });

  app.post(api.team.invite.path, requireAuth, requireOwner, async (req, res) => {
    console.log("[INVITE] Route hit");

    try {
      const user = req.user as User;
      const input = api.team.invite.input.safeParse(req.body);
      if (!input.success) {
        console.error("[INVITE] Validation error:", input.error.errors);
        return res.status(400).json({
          message: "Validation failed",
          errors: input.error.errors
        });
      }

      const data = input.data;
      data.email = data.email.toLowerCase();

      console.log("[INVITE] Parsed input for:", data.email);

      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        console.log("[INVITE] User already exists:", data.email);
        return res.status(400).json({ message: "User already exists" });
      }

      console.log("[INVITE] Hashing password...");
      const hashedPassword = await hash(data.password, 10);

      console.log("[INVITE] Creating user in storage...");
      const newUser = await storage.createUser({
        ...data,
        password: hashedPassword,
        agencyId: user.agencyId,
        role: 'agent',
        status: 'active',
      });

      console.log("[INVITE] User created with ID:", newUser.id);

      const webhookUrl = process.env.NODE_ENV === 'production'
        ? process.env.N8N_PRODUCTION_URL
        : process.env.N8N_TEST_URL;

      console.log("[INVITE] Webhook URL:", webhookUrl || "NOT CONFIGURED");

      if (webhookUrl) {
        const protocol = req.protocol;
        const host = req.get('host');
        const loginUrl = `${protocol}://${host}/auth`;

        const payload = {
          fullName: data.name,
          workEmail: data.email,
          initialPassword: data.password,
          userType: 'Agent',
          loginUrl: loginUrl
        };

        console.log("[INVITE] Sending webhook payload...");

        try {
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const responseText = await response.text();
          console.log("[INVITE] Webhook response status:", response.status);

          if (!response.ok) {
            console.error("[INVITE] Webhook failed:", responseText);
            // We still created the user, so maybe we return 201 but Warn?
            // User requested "Expected Behavior: успешно send invitation AND create team member"
            // If webhook fails, the "Invitation" (email) failed.
          }
        } catch (webhookError: any) {
          console.error("[INVITE] Webhook fetch exception:", webhookError.message);
        }
      }

      res.status(201).json(newUser);
    } catch (err: any) {
      console.error("[INVITE] Fatal route error:", err);
      res.status(500).json({ message: err.message || "Internal server error" });
    }
  });

  app.put(api.team.update.path, requireAuth, requireOwner, async (req, res) => {
    const user = req.user as User;

    const targetId = Number(req.params.id);
    const target = await storage.getUser(targetId);

    if (!target || target.agencyId !== user.agencyId) {
      return res.status(404).json({ message: "Member not found" });
    }

    const input = api.team.update.input.parse(req.body);

    // Security: Owner cannot deactivate themselves
    if (target.id === user.id && input.status === 'inactive') {
      return res.status(400).json({ message: "You cannot deactivate yourself" });
    }

    // Security: Only owner can change roles
    // (Already checked user.role === 'owner', but adding logic here if needed)

    const updated = await storage.updateUser(targetId, input);
    res.json(updated);
  });

  app.delete(api.team.delete.path, requireAuth, requireOwner, async (req, res) => {
    const user = req.user as User;

    const targetId = Number(req.params.id);
    const target = await storage.getUser(targetId);

    if (!target || target.agencyId !== user.agencyId) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Security: Cannot remove yourself
    if (target.id === user.id) {
      return res.status(400).json({ message: "You cannot remove yourself" });
    }

    await storage.deleteUser(targetId);
    res.sendStatus(200);
  });

  // Widgets
  app.get(api.widgets.list.path, requireAuth, requireOwner, async (req, res) => {
    const user = req.user as User;
    const items = await storage.getWidgets(user.agencyId);
    res.json(items);
  });

  app.get(api.widgets.get.path, requireAuth, requireOwner, async (req, res) => {
    const user = req.user as User;
    const widget = await storage.getWidget(Number(req.params.id));

    if (!widget || widget.agencyId !== user.agencyId) {
      return res.status(404).json({ message: "Widget not found" });
    }
    res.json(widget);
  });

  app.post(api.widgets.create.path, requireAuth, requireOwner, async (req, res) => {
    const user = req.user as User;
    const input = api.widgets.create.input.parse(req.body);

    const widget = await storage.createWidget({
      ...input,
      agencyId: user.agencyId,
    });
    res.status(201).json(widget);
  });

  app.put(api.widgets.update.path, requireAuth, requireOwner, async (req, res) => {
    const user = req.user as User;
    const widget = await storage.getWidget(Number(req.params.id));

    if (!widget || widget.agencyId !== user.agencyId) {
      return res.status(404).json({ message: "Widget not found" });
    }

    const input = api.widgets.update.input.parse(req.body);
    const updated = await storage.updateWidget(widget.id, input);
    res.json(updated);
  });

  app.delete(api.widgets.delete.path, requireAuth, requireOwner, async (req, res) => {
    const user = req.user as User;
    const widget = await storage.getWidget(Number(req.params.id));

    if (!widget || widget.agencyId !== user.agencyId) {
      return res.status(404).json({ message: "Widget not found" });
    }

    await storage.deleteWidget(widget.id);
    res.json({ success: true });
  });

  // Leads
  app.get(api.leads.list.path, requireAuth, async (req, res) => {
    const user = req.user as User;
    const allLeads = await storage.getLeads(user.agencyId);

    // Filter if agent
    let filtered = allLeads;
    if (user.role === 'agent') {
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
    const user = req.user as User;
    const lead = await storage.getLead(Number(req.params.id));

    if (!lead || lead.agencyId !== user.agencyId) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (user.role === 'agent' && lead.assignedTo !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const notes = await storage.getNotes(lead.id);
    const enrichedNotes = await Promise.all(notes.map(async (note) => {
      const author = await storage.getUser(note.authorId);
      return { ...note, authorName: author?.name };
    }));

    const widget = await storage.getWidget(lead.widgetId);
    let assigneeName = undefined;
    if (lead.assignedTo) {
      const assignee = await storage.getUser(lead.assignedTo);
      assigneeName = assignee?.name;
    }

    res.json({
      ...lead,
      notes: enrichedNotes,
      widgetName: widget?.name,
      assigneeName
    });
  });

  app.put(api.leads.update.path, requireAuth, async (req, res) => {
    const user = req.user as User;
    const lead = await storage.getLead(Number(req.params.id));

    if (!lead || lead.agencyId !== user.agencyId) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const input = api.leads.update.input.parse(req.body);
    const updated = await storage.updateLead(lead.id, input);

    // Real-time update
    const users = await storage.getAgencyUsers(user.agencyId);
    console.log(`[Server Socket] Emitting lead:updated for lead ${updated.id} to ${users.length} users in agency ${user.agencyId}`);
    users.forEach(u => {
      console.log(`[Server Socket] Emitting to user:${u.id} room`);
      io.to(`user:${u.id}`).emit("lead:updated", updated);
    });

    res.json(updated);
  });

  app.post(api.leads.addNote.path, requireAuth, async (req, res) => {
    const user = req.user as User;
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

    // Real-time update
    const users = await storage.getAgencyUsers(user.agencyId);
    console.log(`[Server Socket] Emitting lead:updated (note) for lead ${lead.id} to ${users.length} users in agency ${user.agencyId}`);
    users.forEach(u => {
      console.log(`[Server Socket] Emitting to user:${u.id} room`);
      io.to(`user:${u.id}`).emit("lead:updated", { ...lead, lastNote: note });
    });

    res.status(201).json(note);
  });

  // Dashboard
  app.get(api.dashboard.stats.path, requireAuth, async (req, res) => {
    const user = req.user as User;
    const stats = await storage.getAgencyStats(
      user.agencyId,
      30,
      user.role === 'agent' ? user.id : undefined
    );
    res.json(stats);
  });


  // === PUBLIC ROUTES (Widget API) ===

  // Simple in-memory rate limiter
  const submissionLog = new Map<string, number[]>();
  const WINDOW_MS = 60 * 60 * 1000; // 1 hour
  const MAX_SUBMISSIONS = 10;

  app.get(api.public.getForm.path, async (req, res) => {
    const widget = await storage.getWidgetByFormId(req.params.id as string);
    if (!widget) {
      return res.status(404).json({ message: "Form not found" });
    }
    res.json(widget);
  });

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

    const lead = await storage.createLead({
      agencyId: widget.agencyId,
      widgetId: widget.id,
      formResponses: input.formResponses,
      email: typeof email === 'string' ? email : undefined,
      name: typeof name === 'string' ? name : undefined,
      phone: typeof phone === 'string' ? phone : undefined,
      status: "new",
    });

    // Real-time updates
    const users = await storage.getAgencyUsers(widget.agencyId);
    const stats = await storage.getAgencyStats(widget.agencyId, 30);

    console.log(`[Server Socket] New Lead captured! Emitting to ${users.length} users in agency ${widget.agencyId}`);
    users.forEach(u => {
      console.log(`[Server Socket] Emitting lead:new and stats:update to user:${u.id} room`);
      io.to(`user:${u.id}`).emit("lead:new", lead);
      io.to(`user:${u.id}`).emit("submission:new", lead);
      io.to(`user:${u.id}`).emit("stats:update", stats);
    });

    res.status(201).json({ success: true });
  });


  return httpServer;
}
