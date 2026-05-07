import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import express from "express";
import { createServer } from "http";
import request from "supertest";

vi.mock("../replit_integrations/auth", async () => {
  const { default: session } = await import("express-session");
  return {
    setupAuth: async (app: any) => {
      app.use(session({ secret: "test-secret", resave: false, saveUninitialized: false }));
      app.use((req: any, _res: any, next: any) => {
        const userId = req.headers["x-test-session-user-id"] as string;
        if (userId) {
          req.session = req.session || {};
          req.session.credentialUserId = userId;
        }
        next();
      });
    },
    registerAuthRoutes: () => {},
    isAuthenticated: (_req: any, _res: any, next: any) => next(),
    getSession: () => ({}),
  };
});

import { registerRoutes } from "../routes";
import { db } from "../db";
import { users } from "@shared/models/auth";
import { franchises } from "@shared/schema";
import { eq } from "drizzle-orm";

let testApp: any;

beforeAll(async () => {
  const app = express();
  const httpServer = createServer(app);
  app.use(express.json());
  await registerRoutes(httpServer, app);
  testApp = app;
}, 30000);

const createdUserIds: string[] = [];
const createdFranchiseIds: number[] = [];

afterEach(async () => {
  for (const uid of createdUserIds) {
    await db.delete(users).where(eq(users.id, uid)).catch(() => {});
  }
  for (const fid of createdFranchiseIds) {
    await db.delete(franchises).where(eq(franchises.id, fid)).catch(() => {});
  }
  createdUserIds.length = 0;
  createdFranchiseIds.length = 0;
});

function authAs(userId: string) {
  return { "x-test-session-user-id": userId };
}

async function createParentUser(suffix: string) {
  const [user] = await db
    .insert(users)
    .values({
      id: `ts273_parent_${suffix}`,
      username: `ts273_parent_${suffix}`,
      phone: "0900002730",
      role: "parent",
      lineRegistrationComplete: true,
    })
    .returning();
  return user;
}

async function createFranchise(suffix: string) {
  const [franchise] = await db
    .insert(franchises)
    .values({
      name: `ts273_franchise_${suffix}`,
      address: "Test Address",
      city: "Test City",
      district: "Test District",
      isActive: true,
    })
    .returning();
  return franchise;
}

async function createFranchiseAdminUser(suffix: string, franchiseId: number) {
  const [user] = await db
    .insert(users)
    .values({
      id: `ts273_fadmin_${suffix}`,
      username: `ts273_fadmin_${suffix}`,
      phone: "0900002731",
      role: "franchise_admin",
      franchiseId,
    })
    .returning();
  return user;
}

type HttpMethod = "get" | "post" | "patch" | "delete";

function invoke(method: HttpMethod, path: string) {
  const agent = request(testApp);
  const dispatchers: Record<HttpMethod, (url: string) => ReturnType<typeof agent.get>> = {
    get: agent.get.bind(agent),
    post: agent.post.bind(agent),
    patch: agent.patch.bind(agent),
    delete: agent.delete.bind(agent),
  };
  return dispatchers[method](path);
}

// ---------------------------------------------------------------------------
// isCoach guard — 批次守衛測試
// ---------------------------------------------------------------------------

describe("isCoach middleware — 批次守衛測試（教練 API）", () => {
  const coachEndpoints: Array<{ method: HttpMethod; path: string; label: string }> = [
    { method: "get",   path: "/api/coach/calendar/2026/5",         label: "GET /api/coach/calendar/:year/:month" },
    { method: "get",   path: "/api/coach/slots/1/students",         label: "GET /api/coach/slots/:slotId/students" },
    { method: "patch", path: "/api/coach/bookings/1/check-in",      label: "PATCH /api/coach/bookings/:id/check-in" },
    { method: "patch", path: "/api/coach/bookings/1/absent",        label: "PATCH /api/coach/bookings/:id/absent" },
    { method: "patch", path: "/api/coach/bookings/1/uncheck-in",    label: "PATCH /api/coach/bookings/:id/uncheck-in" },
    { method: "get",   path: "/api/coach/daily-record/2026-05-07",  label: "GET /api/coach/daily-record/:date" },
    { method: "get",   path: "/api/coach/monthly-records/2026/5",   label: "GET /api/coach/monthly-records/:year/:month" },
    { method: "get",   path: "/api/coach/overdue-tasks",            label: "GET /api/coach/overdue-tasks" },
    { method: "get",   path: "/api/coach/students",                 label: "GET /api/coach/students" },
    { method: "get",   path: "/api/coach/earnings",                 label: "GET /api/coach/earnings" },
    { method: "post",  path: "/api/coach/contact-books",            label: "POST /api/coach/contact-books" },
    { method: "get",   path: "/api/coach/my-info",                  label: "GET /api/coach/my-info" },
    { method: "patch", path: "/api/coach/my-info",                  label: "PATCH /api/coach/my-info" },
  ];

  it.each(coachEndpoints)(
    "未帶認證標頭時，$label 回傳 401",
    async ({ method, path }) => {
      const res = await invoke(method, path);
      expect(res.status).toBe(401);
    },
  );

  it.each(coachEndpoints)(
    "以家長身份存取時，$label 回傳 403",
    async ({ method, path }) => {
      const s = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      const parent = await createParentUser(s);
      createdUserIds.push(parent.id);

      const res = await invoke(method, path).set(authAs(parent.id));
      expect(res.status).toBe(403);
    },
  );
});

// ---------------------------------------------------------------------------
// isFranchiseAdmin guard — 批次守衛測試
// ---------------------------------------------------------------------------

describe("isFranchiseAdmin middleware — 批次守衛測試（分校管理員 API）", () => {
  const franchiseAdminEndpoints: Array<{ method: HttpMethod; path: string; label: string }> = [
    { method: "get",    path: "/api/franchise-admin/managed-franchises",  label: "GET /api/franchise-admin/managed-franchises" },
    { method: "get",    path: "/api/franchise-admin/my-franchise",        label: "GET /api/franchise-admin/my-franchise" },
    { method: "patch",  path: "/api/franchise-admin/my-franchise",        label: "PATCH /api/franchise-admin/my-franchise" },
    { method: "get",    path: "/api/franchise-admin/stats",               label: "GET /api/franchise-admin/stats" },
    { method: "get",    path: "/api/franchise-admin/stats/today",         label: "GET /api/franchise-admin/stats/today" },
    { method: "get",    path: "/api/franchise-admin/stats/date-range",    label: "GET /api/franchise-admin/stats/date-range" },
    { method: "get",    path: "/api/franchise-admin/coaches",             label: "GET /api/franchise-admin/coaches" },
    { method: "post",   path: "/api/franchise-admin/coaches",             label: "POST /api/franchise-admin/coaches" },
    { method: "get",    path: "/api/franchise-admin/time-slots",          label: "GET /api/franchise-admin/time-slots" },
    { method: "post",   path: "/api/franchise-admin/time-slots",          label: "POST /api/franchise-admin/time-slots" },
    { method: "get",    path: "/api/franchise-admin/bookings",            label: "GET /api/franchise-admin/bookings" },
    { method: "get",    path: "/api/franchise-admin/classrooms",          label: "GET /api/franchise-admin/classrooms" },
    { method: "post",   path: "/api/franchise-admin/classrooms",          label: "POST /api/franchise-admin/classrooms" },
    { method: "get",    path: "/api/franchise-admin/students",            label: "GET /api/franchise-admin/students" },
    { method: "post",   path: "/api/franchise-admin/students",            label: "POST /api/franchise-admin/students" },
    { method: "post",   path: "/api/franchise-admin/manual-booking",      label: "POST /api/franchise-admin/manual-booking" },
    { method: "get",    path: "/api/franchise-admin/available-students",  label: "GET /api/franchise-admin/available-students" },
  ];

  it.each(franchiseAdminEndpoints)(
    "未帶認證標頭時，$label 回傳 401",
    async ({ method, path }) => {
      const res = await invoke(method, path);
      expect(res.status).toBe(401);
    },
  );

  it.each(franchiseAdminEndpoints)(
    "以家長身份存取時，$label 回傳 403",
    async ({ method, path }) => {
      const s = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      const parent = await createParentUser(s);
      createdUserIds.push(parent.id);

      const res = await invoke(method, path).set(authAs(parent.id));
      expect(res.status).toBe(403);
    },
  );
});

// ---------------------------------------------------------------------------
// isFranchiseAdmin — 跨分校存取守衛
// ---------------------------------------------------------------------------

describe("isFranchiseAdmin middleware — 跨分校存取守衛", () => {
  it("分校管理員帶有效 X-Franchise-Id（自己的分校）時，可正常存取", async () => {
    const s = `${Date.now().toString(36)}xf1`;
    const franchise = await createFranchise(s);
    createdFranchiseIds.push(franchise.id);
    const admin = await createFranchiseAdminUser(s, franchise.id);
    createdUserIds.push(admin.id);

    const res = await request(testApp)
      .get("/api/franchise-admin/coaches")
      .set(authAs(admin.id))
      .set("x-franchise-id", String(franchise.id));

    expect(res.status).toBe(200);
  });

  it("分校管理員帶他人分校的 X-Franchise-Id 時，回傳 403", async () => {
    const s = `${Date.now().toString(36)}xf2`;
    const franchise1 = await createFranchise(`${s}_1`);
    createdFranchiseIds.push(franchise1.id);
    const franchise2 = await createFranchise(`${s}_2`);
    createdFranchiseIds.push(franchise2.id);
    const admin = await createFranchiseAdminUser(s, franchise1.id);
    createdUserIds.push(admin.id);

    const res = await request(testApp)
      .get("/api/franchise-admin/coaches")
      .set(authAs(admin.id))
      .set("x-franchise-id", String(franchise2.id));

    expect(res.status).toBe(403);
  });
});
