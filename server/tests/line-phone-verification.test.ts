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
import { users, sessions } from "@shared/models/auth";
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
const createdSessionSids: string[] = [];

afterEach(async () => {
  for (const sid of createdSessionSids) {
    await db.delete(sessions).where(eq(sessions.sid, sid)).catch(() => {});
  }
  for (const uid of createdUserIds) {
    await db.delete(users).where(eq(users.id, uid)).catch(() => {});
  }
  createdUserIds.length = 0;
  createdSessionSids.length = 0;
});

function authAs(userId: string) {
  return { "x-test-session-user-id": userId };
}

async function createParent(suffix: string, opts: { lineRegistrationComplete: boolean; lineUserId?: string }) {
  const [user] = await db
    .insert(users)
    .values({
      id: `ts271_parent_${suffix}`,
      username: `ts271_parent_${suffix}`,
      phone: "0900000271",
      role: "parent",
      lineRegistrationComplete: opts.lineRegistrationComplete,
      lineUserId: opts.lineUserId ?? null,
    })
    .returning();
  return user;
}

async function createAdmin(suffix: string) {
  const [user] = await db
    .insert(users)
    .values({
      id: `ts271_admin_${suffix}`,
      username: `ts271_admin_${suffix}`,
      phone: "0800002710",
      role: "admin",
    })
    .returning();
  return user;
}

async function insertFakeSession(sid: string, credentialUserId: string) {
  await db.insert(sessions).values({
    sid,
    sess: { credentialUserId } as any,
    expire: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
}

describe("isCredentialOrAuth middleware — LINE 電話驗證守衛", () => {
  it("當 lineRegistrationComplete = false 時，回傳 403 及 PHONE_VERIFICATION_REQUIRED", async () => {
    const s = `${Date.now().toString(36)}a`;
    const parent = await createParent(s, { lineRegistrationComplete: false });
    createdUserIds.push(parent.id);

    const res = await request(testApp)
      .get("/api/children")
      .set(authAs(parent.id));

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("PHONE_VERIFICATION_REQUIRED");
    expect(res.body.message).toBe("請先完成電話驗證");
  });

  it("當 lineRegistrationComplete = true 時，可正常存取受保護 API", async () => {
    const s = `${Date.now().toString(36)}b`;
    const parent = await createParent(s, { lineRegistrationComplete: true });
    createdUserIds.push(parent.id);

    const res = await request(testApp)
      .get("/api/children")
      .set(authAs(parent.id));

    expect(res.status).toBe(200);
  });

  it("無效的 session（未帶認證標頭）時，回傳 401", async () => {
    const res = await request(testApp).get("/api/children");
    expect(res.status).toBe(401);
  });
});

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

describe("isCredentialOrAuth middleware — 批次驗證多個受保護家長 API", () => {
  const protectedEndpoints: Array<{ method: HttpMethod; path: string; label: string }> = [
    { method: "get",  path: "/api/bookings",              label: "GET /api/bookings" },
    { method: "post", path: "/api/bookings",              label: "POST /api/bookings" },
    { method: "get",  path: "/api/parent/wallet",         label: "GET /api/parent/wallet" },
    { method: "get",  path: "/api/parent/transactions",   label: "GET /api/parent/transactions" },
    { method: "get",  path: "/api/orders",                label: "GET /api/orders" },
    { method: "post", path: "/api/orders",                label: "POST /api/orders" },
    { method: "get",  path: "/api/notifications",         label: "GET /api/notifications" },
    { method: "get",  path: "/api/favorite-franchises",   label: "GET /api/favorite-franchises" },
    { method: "post", path: "/api/parent/validate-coupon",label: "POST /api/parent/validate-coupon" },
  ];

  it.each(protectedEndpoints)(
    "lineRegistrationComplete=false 時，$label 回傳 403 及 PHONE_VERIFICATION_REQUIRED",
    async ({ method, path }) => {
      const s = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      const parent = await createParent(s, { lineRegistrationComplete: false });
      createdUserIds.push(parent.id);

      const res = await invoke(method, path).set(authAs(parent.id));

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("PHONE_VERIFICATION_REQUIRED");
      expect(res.body.message).toBe("請先完成電話驗證");
    },
  );

  it.each(protectedEndpoints)(
    "未帶認證標頭時，$label 回傳 401",
    async ({ method, path }) => {
      const res = await invoke(method, path);
      expect(res.status).toBe(401);
    },
  );
});

describe("DELETE /api/admin/users/:userId/line — 管理員清除 LINE 綁定", () => {
  it("清除 LINE 綁定後，該家長的 session 被刪除", async () => {
    const s = `${Date.now().toString(36)}c`;
    const admin = await createAdmin(s);
    createdUserIds.push(admin.id);
    const parent = await createParent(s, {
      lineRegistrationComplete: true,
      lineUserId: `ts271_line_${s}`,
    });
    createdUserIds.push(parent.id);

    const sid = `ts271_sid_${s}`;
    await insertFakeSession(sid, parent.id);
    createdSessionSids.push(sid);

    const res = await request(testApp)
      .delete(`/api/admin/users/${parent.id}/line`)
      .set(authAs(admin.id));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const [remaining] = await db
      .select({ sid: sessions.sid })
      .from(sessions)
      .where(eq(sessions.sid, sid));
    expect(remaining).toBeUndefined();
  });

  it("清除 LINE 綁定後，lineRegistrationComplete 重設為 false", async () => {
    const s = `${Date.now().toString(36)}d`;
    const admin = await createAdmin(s);
    createdUserIds.push(admin.id);
    const parent = await createParent(s, {
      lineRegistrationComplete: true,
      lineUserId: `ts271_line2_${s}`,
    });
    createdUserIds.push(parent.id);

    const res = await request(testApp)
      .delete(`/api/admin/users/${parent.id}/line`)
      .set(authAs(admin.id));

    expect(res.status).toBe(200);

    const [updated] = await db
      .select({ lineRegistrationComplete: users.lineRegistrationComplete, lineUserId: users.lineUserId })
      .from(users)
      .where(eq(users.id, parent.id));
    expect(updated.lineUserId).toBeNull();
    expect(updated.lineRegistrationComplete).toBe(false);
  });

  it("對尚未綁定 LINE 的帳號清除，回傳 400", async () => {
    const s = `${Date.now().toString(36)}e`;
    const admin = await createAdmin(s);
    createdUserIds.push(admin.id);
    const parent = await createParent(s, { lineRegistrationComplete: true, lineUserId: undefined });
    createdUserIds.push(parent.id);

    const res = await request(testApp)
      .delete(`/api/admin/users/${parent.id}/line`)
      .set(authAs(admin.id));

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("此帳號尚未綁定 LINE");
  });

  it("非管理員（家長）嘗試清除 LINE 綁定，回傳 403", async () => {
    const s = `${Date.now().toString(36)}f`;
    const parent = await createParent(s, { lineRegistrationComplete: true, lineUserId: `ts271_line3_${s}` });
    createdUserIds.push(parent.id);

    const res = await request(testApp)
      .delete(`/api/admin/users/${parent.id}/line`)
      .set(authAs(parent.id));

    expect(res.status).toBe(403);
  });
});
