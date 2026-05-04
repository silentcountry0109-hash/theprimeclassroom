import { users, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { and, eq, ne } from "drizzle-orm";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByLineUserId(lineUserId: string, role?: string): Promise<User | undefined>;
}

export class LineIdAlreadyBoundError extends Error {
  public readonly boundRole: string;
  constructor(boundRole: string) {
    super(`此 LINE 帳號已被一個「${boundRole}」身份綁定，無法重複使用`);
    this.name = "LineIdAlreadyBoundError";
    this.boundRole = boundRole;
  }
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByLineUserId(lineUserId: string, role?: string): Promise<User | undefined> {
    const conditions = role
      ? and(eq(users.lineUserId, lineUserId), eq(users.role, role))
      : eq(users.lineUserId, lineUserId);
    const [user] = await db.select().from(users).where(conditions);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (userData.lineUserId) {
      const existing = await db
        .select({ id: users.id, role: users.role })
        .from(users)
        .where(and(eq(users.lineUserId, userData.lineUserId), ne(users.id, userData.id ?? "")))
        .limit(1);
      if (existing.length > 0) {
        const roleLabel = existing[0].role === "coach" ? "老師" : existing[0].role === "parent" ? "家長" : existing[0].role ?? "其他";
        throw new LineIdAlreadyBoundError(roleLabel);
      }
    }

    const { lineRegistrationComplete: _lr, ...updateFields } = userData;
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...updateFields,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

export const authStorage = new AuthStorage();
