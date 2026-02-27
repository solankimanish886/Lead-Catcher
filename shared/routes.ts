import { z } from 'zod';
import { insertUserSchema, insertWidgetSchema, insertLeadSchema, insertNoteSchema, User, Widget, Lead, Note, Agency } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register',
      input: z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
        agencyName: z.string().min(1),
      }),
      responses: {
        201: z.custom<User>(), // Returns user (without password ideally, but schema type has it)
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({
        email: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<User>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<User>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  team: {
    list: {
      method: 'GET' as const,
      path: '/api/team',
      responses: {
        200: z.array(z.custom<User>()),
      },
    },
    invite: {
      method: 'POST' as const,
      path: '/api/team',
      input: z.object({
        email: z.string().email(),
        name: z.string(),
        password: z.string().min(6), // Temp password
      }),
      responses: {
        201: z.custom<User>(),
        400: errorSchemas.validation,
      },
    },
  },
  widgets: {
    list: {
      method: 'GET' as const,
      path: '/api/widgets',
      responses: {
        200: z.array(z.custom<Widget>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/widgets/:id',
      responses: {
        200: z.custom<Widget>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/widgets',
      input: insertWidgetSchema.omit({ agencyId: true }),
      responses: {
        201: z.custom<Widget>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/widgets/:id',
      input: insertWidgetSchema.omit({ agencyId: true }).partial(),
      responses: {
        200: z.custom<Widget>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/widgets/:id',
      responses: {
        200: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  leads: {
    list: {
      method: 'GET' as const,
      path: '/api/leads',
      input: z.object({
        status: z.string().optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<Lead & { widgetName?: string, assigneeName?: string }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/leads/:id',
      responses: {
        200: z.custom<Lead & { notes: Note[] }>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/leads/:id',
      input: z.object({
        status: z.enum(["new", "contacted", "qualified", "converted", "closed_lost"]).optional(),
        assignedTo: z.number().nullable().optional(),
      }),
      responses: {
        200: z.custom<Lead>(),
        404: errorSchemas.notFound,
      },
    },
    addNote: {
      method: 'POST' as const,
      path: '/api/leads/:id/notes',
      input: z.object({
        content: z.string().min(1),
      }),
      responses: {
        201: z.custom<Note>(),
      },
    },
  },
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats',
      input: z.object({
        days: z.coerce.number().optional().default(30),
      }).optional(),
      responses: {
        200: z.object({
          totalLeads: z.number(),
          leadsByStatus: z.record(z.number()),
          leadsByWidget: z.record(z.number()),
          recentLeads: z.array(z.custom<Lead>()),
        }),
      },
    },
  },
  // Public Widget API
  public: {
    getWidget: {
      method: 'GET' as const,
      path: '/api/public/widgets/:id',
      responses: {
        200: z.custom<Widget>(),
        404: errorSchemas.notFound,
      },
    },
    submitLead: {
      method: 'POST' as const,
      path: '/api/public/leads',
      input: z.object({
        widgetId: z.number(),
        formResponses: z.record(z.string()),
        _hp: z.string().optional(),
      }),
      responses: {
        201: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound,
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
