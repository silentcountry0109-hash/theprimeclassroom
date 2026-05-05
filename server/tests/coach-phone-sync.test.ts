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
import { coaches, franchises } from "@shared/schema";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";

let testApp: any;

beforeAll(async () => {
  const app = express();
  const httpServer = createServer(app);
  app.use(express.json());
  await registerRoutes(httpServer, app);
  testApp = app;
}, 30000);

async function createAdminUser(suffix: string) {
  const [user] = await db
    .insert(users)
    .values({ id: `ts239_admin_${suffix}`, username: `ts239_admin_${suffix}`, phone: "0800000000", role: "admin" })
    .returning();
  return user;
}

async function createFranchiseAdminUser(suffix: string, franchiseId: number) {
  const [user] = await db
    .insert(users)
    .values({
      id: `ts239_fadmin_${suffix}`,
      username: `ts239_fadmin_${suffix}`,
      phone: "0800000001",
      role: "franchise_admin",
      franchiseId,
    })
    .returning();
  return user;
}

async function createCoachUser(suffix: string, phone: string) {
  const [user] = await db
    .insert(users)
    .values({ id: `ts239_cu_${suffix}`, username: `ts239_cu_${suffix}`, phone, role: "coach" })
    .returning();
  return user;
}

async function createFranchise(suffix: string) {
  const [franchise] = await db
    .insert(franchises)
    .values({ name: `ts239_franchise_${suffix}`, address: "Test Address", city: "Test City", district: "Test District", isActive: true })
    .returning();
  return franchise;
}

async function createCoach(franchiseId: number, phone: string, userId: string | null = null) {
  const [coach] = await db
    .insert(coaches)
    .values({ name: "Test Coach", phone, franchiseId, userId, isActive: true, isCertified: false })
    .returning();
  return coach;
}

const createdCoachIds: number[] = [];
const createdUserIds: string[] = [];
const createdFranchiseIds: number[] = [];

afterEach(async () => {
  for (const id of createdCoachIds) await db.delete(coaches).where(eq(coaches.id, id));
  for (const fid of createdFranchiseIds) {
    await db.delete(coaches).where(eq(coaches.franchiseId, fid));
    await db.delete(franchises).where(eq(franchises.id, fid));
  }
  for (const uid of createdUserIds) await db.delete(users).where(eq(users.id, uid));
  createdCoachIds.length = 0;
  createdUserIds.length = 0;
  createdFranchiseIds.length = 0;
});

function authAs(userId: string) {
  return { "x-test-session-user-id": userId };
}

describe("PATCH /api/admin/coaches/:id — phone is synced to users table", () => {
  it("syncs users.phone when admin updates a coach phone via the real admin route", async () => {
    const s = `${Date.now().toString(36)}a`;
    const franchise = await createFranchise(s);
    createdFranchiseIds.push(franchise.id);
    const adminUser = await createAdminUser(s);
    createdUserIds.push(adminUser.id);
    const coachUser = await createCoachUser(s, "0900000001");
    createdUserIds.push(coachUser.id);
    const coach = await createCoach(franchise.id, "0900000001", coachUser.id);
    createdCoachIds.push(coach.id);

    const newPhone = "0911111111";
    const res = await request(testApp)
      .patch(`/api/admin/coaches/${coach.id}`)
      .set(authAs(adminUser.id))
      .send({ phone: newPhone });

    expect(res.status).toBe(200);
    expect(res.body.phone).toBe(newPhone);
    const [row] = await db.select({ phone: users.phone }).from(users).where(eq(users.id, coachUser.id));
    expect(row.phone).toBe(newPhone);
  });

  it("leaves users.phone unchanged when phone field is absent from admin PATCH payload", async () => {
    const s = `${Date.now().toString(36)}b`;
    const franchise = await createFranchise(s);
    createdFranchiseIds.push(franchise.id);
    const adminUser = await createAdminUser(s);
    createdUserIds.push(adminUser.id);
    const coachUser = await createCoachUser(s, "0900000002");
    createdUserIds.push(coachUser.id);
    const coach = await createCoach(franchise.id, "0900000002", coachUser.id);
    createdCoachIds.push(coach.id);

    const res = await request(testApp)
      .patch(`/api/admin/coaches/${coach.id}`)
      .set(authAs(adminUser.id))
      .send({ name: "Name Only Update" });

    expect(res.status).toBe(200);
    const [row] = await db.select({ phone: users.phone }).from(users).where(eq(users.id, coachUser.id));
    expect(row.phone).toBe("0900000002");
  });

  it("returns 401 when no auth header is present (admin route)", async () => {
    const res = await request(testApp).patch("/api/admin/coaches/99999").send({ phone: "0900000099" });
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/franchise-admin/coaches/:id — phone is synced to users table", () => {
  it("syncs users.phone when franchise-admin updates a coach phone via the real franchise-admin route", async () => {
    const s = `${Date.now().toString(36)}c`;
    const franchise = await createFranchise(s);
    createdFranchiseIds.push(franchise.id);
    const franchiseAdmin = await createFranchiseAdminUser(s, franchise.id);
    createdUserIds.push(franchiseAdmin.id);
    const coachUser = await createCoachUser(s, "0900000003");
    createdUserIds.push(coachUser.id);
    const coach = await createCoach(franchise.id, "0900000003", coachUser.id);
    createdCoachIds.push(coach.id);

    const newPhone = "0922222222";
    const res = await request(testApp)
      .patch(`/api/franchise-admin/coaches/${coach.id}`)
      .set(authAs(franchiseAdmin.id))
      .send({ phone: newPhone });

    expect(res.status).toBe(200);
    expect(res.body.phone).toBe(newPhone);
    const [row] = await db.select({ phone: users.phone }).from(users).where(eq(users.id, coachUser.id));
    expect(row.phone).toBe(newPhone);
  });

  it("returns 403 when franchise-admin tries to update a coach from another franchise", async () => {
    const s = `${Date.now().toString(36)}d`;
    const franchise1 = await createFranchise(`${s}_1`);
    createdFranchiseIds.push(franchise1.id);
    const franchise2 = await createFranchise(`${s}_2`);
    createdFranchiseIds.push(franchise2.id);
    const franchiseAdmin = await createFranchiseAdminUser(s, franchise1.id);
    createdUserIds.push(franchiseAdmin.id);
    const coach = await createCoach(franchise2.id, "0900000004", null);
    createdCoachIds.push(coach.id);

    const res = await request(testApp)
      .patch(`/api/franchise-admin/coaches/${coach.id}`)
      .set(authAs(franchiseAdmin.id))
      .send({ phone: "0933333333" });

    expect(res.status).toBe(403);
  });
});

describe("Multiple coaches sharing the same userId — phone sync via admin route", () => {
  it("updating coach A phone syncs to the shared user account", async () => {
    const s = `${Date.now().toString(36)}e`;
    const franchise1 = await createFranchise(`${s}_1`);
    createdFranchiseIds.push(franchise1.id);
    const franchise2 = await createFranchise(`${s}_2`);
    createdFranchiseIds.push(franchise2.id);
    const adminUser = await createAdminUser(s);
    createdUserIds.push(adminUser.id);
    const sharedUser = await createCoachUser(s, "0900000010");
    createdUserIds.push(sharedUser.id);
    const coach1 = await createCoach(franchise1.id, "0900000010", sharedUser.id);
    createdCoachIds.push(coach1.id);
    const coach2 = await createCoach(franchise2.id, "0900000010", sharedUser.id);
    createdCoachIds.push(coach2.id);

    const newPhone = "0944444444";
    const res = await request(testApp)
      .patch(`/api/admin/coaches/${coach1.id}`)
      .set(authAs(adminUser.id))
      .send({ phone: newPhone });

    expect(res.status).toBe(200);
    expect(res.body.phone).toBe(newPhone);
    const [row] = await db.select({ phone: users.phone }).from(users).where(eq(users.id, sharedUser.id));
    expect(row.phone).toBe(newPhone);
  });

  it("updating coach B phone also syncs to the shared user account", async () => {
    const s = `${Date.now().toString(36)}f`;
    const franchise1 = await createFranchise(`${s}_1`);
    createdFranchiseIds.push(franchise1.id);
    const franchise2 = await createFranchise(`${s}_2`);
    createdFranchiseIds.push(franchise2.id);
    const adminUser = await createAdminUser(s);
    createdUserIds.push(adminUser.id);
    const sharedUser = await createCoachUser(s, "0900000020");
    createdUserIds.push(sharedUser.id);
    const coach1 = await createCoach(franchise1.id, "0900000020", sharedUser.id);
    createdCoachIds.push(coach1.id);
    const coach2 = await createCoach(franchise2.id, "0900000020", sharedUser.id);
    createdCoachIds.push(coach2.id);

    const newPhone = "0955555555";
    const res = await request(testApp)
      .patch(`/api/admin/coaches/${coach2.id}`)
      .set(authAs(adminUser.id))
      .send({ phone: newPhone });

    expect(res.status).toBe(200);
    expect(res.body.phone).toBe(newPhone);
    const [row] = await db.select({ phone: users.phone }).from(users).where(eq(users.id, sharedUser.id));
    expect(row.phone).toBe(newPhone);
  });
});
