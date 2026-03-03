import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authStorage } from "./replit_integrations/auth/storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { seedDatabase } from "./seed";
import bcrypt from "bcryptjs";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";
import { db } from "./db";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error("只允許上傳圖片檔案"));
  },
});

function getSessionUserId(req: any): string | null {
  if (req.session?.credentialUserId) return req.session.credentialUserId;
  if (req.isAuthenticated?.() && req.user?.claims?.sub) return req.user.claims.sub;
  return null;
}

const isCredentialOrAuth: RequestHandler = async (req: any, res, next) => {
  const userId = getSessionUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const user = await authStorage.getUser(userId);
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  req.currentUser = user;
  next();
};

const isAdmin: RequestHandler = async (req: any, res, next) => {
  const userId = getSessionUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const user = await authStorage.getUser(userId);
  if (!user || user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  req.currentUser = user;
  next();
};

const isFranchiseAdmin: RequestHandler = async (req: any, res, next) => {
  const userId = getSessionUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const user = await authStorage.getUser(userId);
  if (!user || user.role !== "franchise_admin" || !user.franchiseId) return res.status(403).json({ message: "Forbidden" });
  req.franchiseId = user.franchiseId;
  req.currentUser = user;
  next();
};

const isCoach: RequestHandler = async (req: any, res, next) => {
  const userId = getSessionUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const user = await authStorage.getUser(userId);
  if (!user || user.role !== "coach") return res.status(403).json({ message: "Forbidden" });
  const coach = await storage.getCoachByUserId(userId);
  if (!coach) return res.status(403).json({ message: "找不到老師資料" });
  req.currentUser = user;
  req.coach = coach;
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.use("/uploads", express.static(uploadsDir));

  await seedDatabase();

  app.post("/api/credential-login", async (req: any, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "請輸入帳號和密碼" });
      }
      const [user] = await db.select().from(users).where(eq(users.username, username));
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "帳號或密碼錯誤" });
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: "帳號或密碼錯誤" });
      }
      if (user.role !== "admin" && user.role !== "franchise_admin" && user.role !== "parent" && user.role !== "coach") {
        return res.status(403).json({ message: "帳號或密碼錯誤" });
      }
      req.session.credentialUserId = user.id;
      req.session.save(() => {
        const { passwordHash: _, ...safeUser } = user;
        res.json({ ...safeUser, mustChangePassword: user.mustChangePassword || false });
      });
    } catch (error) {
      res.status(500).json({ message: "登入失敗" });
    }
  });

  app.post("/api/auth/change-password", async (req: any, res) => {
    const credId = req.session?.credentialUserId;
    if (!credId) return res.status(401).json({ message: "Unauthorized" });
    try {
      const [user] = await db.select().from(users).where(eq(users.id, credId));
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      if (user.role !== "coach") return res.status(403).json({ message: "此功能僅供老師使用" });
      if (!user.mustChangePassword) return res.status(400).json({ message: "不需要更改密碼" });
      const { newPassword } = req.body;
      if (!newPassword || newPassword.length < 6) return res.status(400).json({ message: "新密碼至少需要 6 個字元" });
      const hash = await bcrypt.hash(newPassword, 10);
      await db.update(users).set({ passwordHash: hash, mustChangePassword: false, updatedAt: new Date() }).where(eq(users.id, credId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "修改密碼失敗" });
    }
  });

  app.get("/api/credential-user", async (req: any, res) => {
    const credId = req.session?.credentialUserId;
    if (!credId) return res.status(401).json({ message: "Unauthorized" });
    try {
      const user = await authStorage.getUser(credId);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      const { passwordHash: _, ...safeUser } = user as any;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/credential-logout", (req: any, res) => {
    req.session.credentialUserId = null;
    if (req.isAuthenticated?.()) {
      req.logout(() => {
        req.session.save(() => {
          res.json({ success: true });
        });
      });
    } else {
      req.session.save(() => {
        res.json({ success: true });
      });
    }
  });

  app.post("/api/parent-register", async (req: any, res) => {
    try {
      const { username, password, firstName, email, phone, address, referralSource } = req.body;
      if (!username || !password || !firstName || !phone || !email) {
        return res.status(400).json({ message: "請填寫所有必填欄位" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "密碼至少需要 6 個字元" });
      }
      if (username.length < 3) {
        return res.status(400).json({ message: "帳號至少需要 3 個字元" });
      }
      const [existing] = await db.select().from(users).where(eq(users.username, username));
      if (existing) {
        return res.status(400).json({ message: "此帳號已被使用" });
      }
      const hash = await bcrypt.hash(password, 10);
      const [newUser] = await db.insert(users).values({
        id: `parent-${username}-${Date.now()}`,
        username,
        passwordHash: hash,
        firstName,
        email: email || null,
        phone: phone || null,
        address: address || null,
        referralSource: referralSource && referralSource.length > 0 ? referralSource : null,
        role: "parent",
      }).returning();
      req.session.credentialUserId = newUser.id;
      req.session.save(() => {
        const { passwordHash: _, ...safeUser } = newUser;
        res.json(safeUser);
      });
    } catch (error) {
      res.status(500).json({ message: "註冊失敗，請稍後再試" });
    }
  });

  app.post("/api/admin/create-credential-account", isAdmin, async (req: any, res) => {
    try {
      const { userId, username, password } = req.body;
      if (!userId || !username || !password) {
        return res.status(400).json({ message: "缺少必要欄位" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "密碼至少需要 6 個字元" });
      }
      const existing = await db.select().from(users).where(eq(users.username, username));
      if (existing.length > 0 && existing[0].id !== userId) {
        return res.status(400).json({ message: "此帳號名稱已被使用" });
      }
      const hash = await bcrypt.hash(password, 10);
      const [updated] = await db.update(users)
        .set({ username, passwordHash: hash, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
      if (!updated) return res.status(404).json({ message: "找不到使用者" });
      const { passwordHash: _, ...safeUser } = updated;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "建立帳號失敗" });
    }
  });

  app.post("/api/admin/create-franchise-director", isAdmin, async (req: any, res) => {
    try {
      const { franchiseId, username, password, firstName, lastName } = req.body;
      if (!franchiseId || !username || !password) {
        return res.status(400).json({ message: "缺少必要欄位" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "密碼至少需要 6 個字元" });
      }
      const existing = await db.select().from(users).where(eq(users.username, username));
      if (existing.length > 0) {
        return res.status(400).json({ message: "此帳號名稱已被使用" });
      }
      const franchise = await storage.getFranchise(franchiseId);
      if (!franchise) return res.status(404).json({ message: "找不到此分校" });
      const hash = await bcrypt.hash(password, 10);
      const [newUser] = await db.insert(users).values({
        email: `${username}@primemath.tw`,
        firstName: firstName || franchise.name.replace("質數數學 ", "").replace("質數教室 ", "").replace("教室", ""),
        lastName: lastName || "主任",
        role: "franchise_admin",
        franchiseId,
        username,
        passwordHash: hash,
      }).returning();
      const { passwordHash: _, ...safeUser } = newUser;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "建立主任帳號失敗" });
    }
  });

  app.get("/api/coaches", async (_req, res) => {
    try {
      const coaches = await storage.getCoaches();
      res.json(coaches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coaches" });
    }
  });

  app.get("/api/franchises", async (_req, res) => {
    try {
      const franchises = await storage.getFranchises();
      res.json(franchises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch franchises" });
    }
  });

  app.get("/api/faqs", async (_req, res) => {
    try {
      const faqList = await storage.getFaqs();
      res.json(faqList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch FAQs" });
    }
  });

  app.get("/api/success-stories", async (_req, res) => {
    try {
      const stories = await storage.getSuccessStories();
      res.json(stories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  app.get("/api/search-slots", async (req, res) => {
    try {
      const city = req.query.city as string | undefined;
      const results = await storage.searchSlots(city);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to search slots" });
    }
  });

  app.get("/api/search-franchises", async (req, res) => {
    try {
      const city = req.query.city as string | undefined;
      const district = req.query.district as string | undefined;
      const days = req.query.days ? (req.query.days as string).split(",") : undefined;
      const periods = req.query.periods ? (req.query.periods as string).split(",") : undefined;
      const results = await storage.searchFranchises({ city, district, days, periods });
      res.json(results);
    } catch (error: any) {
      console.error("Search franchises error:", error);
      res.status(500).json({ message: "Failed to search franchises" });
    }
  });

  app.get("/api/franchises/:id/detail", async (req, res) => {
    try {
      const detail = await storage.getFranchiseDetail(parseInt(req.params.id));
      if (!detail) {
        return res.status(404).json({ message: "教室不存在" });
      }
      res.json(detail);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch franchise detail" });
    }
  });

  app.get("/api/children", isCredentialOrAuth, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const kids = await storage.getChildrenByParent(userId);
      res.json(kids);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch children" });
    }
  });

  app.post("/api/children", isCredentialOrAuth, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      if (!req.body.school || typeof req.body.school !== "string" || req.body.school.trim().length === 0) {
        return res.status(400).json({ message: "請選擇就讀學校" });
      }
      const child = await storage.createChild({
        ...req.body,
        parentId: userId,
      });
      res.json(child);
    } catch (error) {
      res.status(500).json({ message: "Failed to create child" });
    }
  });

  app.patch("/api/children/:id", isCredentialOrAuth, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const kids = await storage.getChildrenByParent(userId);
      const childId = parseInt(req.params.id);
      if (!kids.find((k: any) => k.id === childId)) {
        return res.status(403).json({ message: "無權限編輯此孩子" });
      }
      const { name, gender, grade, school, notes } = req.body;
      const updated = await storage.updateChild(childId, { name, gender, grade, school, notes });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update child" });
    }
  });


  app.get("/api/bookings", isCredentialOrAuth, async (req: any, res) => {
    try {
      await storage.completeExpiredBookings();
      const userId = req.currentUser.id;
      const userBookings = await storage.getBookingsByParent(userId);
      res.json(userBookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", isCredentialOrAuth, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const kids = await storage.getChildrenByParent(userId);
      if (!kids.find((k: any) => k.id === req.body.childId)) {
        return res.status(403).json({ message: "無權限為此孩子預約" });
      }
      const slot = await storage.getSlot(req.body.slotId);
      if (!slot) {
        return res.status(404).json({ message: "時段不存在" });
      }
      const taiwanTodayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
      const taiwanToday = new Date(taiwanTodayStr + "T00:00:00+08:00");
      const slotDate = new Date(slot.date + "T00:00:00+08:00");
      const diffDays = Math.round((slotDate.getTime() - taiwanToday.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 3) {
        return res.status(400).json({ message: "需於 3 天前預約課程（最早可預約 3 天後的時段）" });
      }
      const booking = await storage.createBooking({
        slotId: req.body.slotId,
        childId: req.body.childId,
        parentId: userId,
      });
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create booking" });
    }
  });

  app.post("/api/bookings/recurring", isCredentialOrAuth, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const { slotIds, childId } = req.body;
      if (!Array.isArray(slotIds) || !childId) {
        return res.status(400).json({ message: "缺少必要參數" });
      }
      const kids = await storage.getChildrenByParent(userId);
      if (!kids.find((k: any) => k.id === childId)) {
        return res.status(403).json({ message: "無權限為此孩子預約" });
      }
      const taiwanTodayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
      const taiwanToday = new Date(taiwanTodayStr + "T00:00:00+08:00");
      const results: { slotId: number; success: boolean; message?: string }[] = [];
      for (const slotId of slotIds) {
        try {
          const slot = await storage.getSlot(slotId);
          if (!slot) {
            results.push({ slotId, success: false, message: "時段不存在" });
            continue;
          }
          const slotDate = new Date(slot.date + "T00:00:00+08:00");
          const diffDays = Math.round((slotDate.getTime() - taiwanToday.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays < 3) {
            results.push({ slotId, success: false, message: "需於 3 天前預約課程" });
            continue;
          }
          await storage.createBooking({ slotId, childId, parentId: userId });
          results.push({ slotId, success: true });
        } catch (err: any) {
          results.push({ slotId, success: false, message: err.message });
        }
      }
      res.json({ results });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create recurring bookings" });
    }
  });

  app.get("/api/bookings/recurring-slots", isCredentialOrAuth, async (req: any, res) => {
    try {
      const slotId = parseInt(req.query.slotId as string);
      const weeks = Math.min(parseInt(req.query.weeks as string) || 4, 12);
      const childId = parseInt(req.query.childId as string);
      const slot = await storage.getSlot(slotId);
      if (!slot) return res.status(404).json({ message: "時段不存在" });

      const results: Array<{ weekOffset: number; date: string; slotId: number | null; available: number; alreadyBooked: boolean }> = [];
      const baseDate = new Date(slot.date + "T00:00:00");

      for (let w = 1; w <= weeks; w++) {
        const futureDate = new Date(baseDate);
        futureDate.setDate(futureDate.getDate() + 7 * w);
        const dateStr = futureDate.toISOString().split("T")[0];
        const matchingSlot = await storage.findSlot(slot.franchiseId, slot.coachId, dateStr, slot.startTime, slot.endTime);
        let alreadyBooked = false;
        if (matchingSlot && childId) {
          alreadyBooked = await storage.hasExistingBooking(matchingSlot.id, childId);
        }
        results.push({
          weekOffset: w,
          date: dateStr,
          slotId: matchingSlot?.id || null,
          available: matchingSlot ? matchingSlot.maxSeats - matchingSlot.bookedSeats : 0,
          alreadyBooked,
        });
      }
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to find recurring slots" });
    }
  });

  app.patch("/api/bookings/:id/cancel", isCredentialOrAuth, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const bookingId = parseInt(req.params.id);
      const userBookings = await storage.getBookingsByParent(userId);
      const target = userBookings.find((b: any) => b.id === bookingId);
      if (!target) {
        return res.status(403).json({ message: "無權限取消此預約" });
      }
      if (target.status !== "confirmed") {
        return res.status(400).json({ message: "此預約無法取消" });
      }

      const slotDate = target.slotDate;
      const slotStartTime = target.slotStartTime;
      const slotDateTime = new Date(`${slotDate}T${slotStartTime}:00+08:00`);
      const now = new Date();
      const hoursUntilStart = (slotDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursUntilStart < 4) {
        return res.status(400).json({ message: "課程開始前 4 小時內無法取消，系統仍會扣除點數計費。如有特殊情況，請聯繫教室。" });
      }

      await storage.cancelBooking(bookingId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to cancel booking" });
    }
  });

  app.get("/api/bookings/calendar.ics", isCredentialOrAuth, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const userBookings = await storage.getBookingsByParent(userId);
      const confirmed = userBookings.filter((b: any) => b.status === "confirmed");

      const lines: string[] = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//質數教室//TW",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:質數教室課程",
        "X-WR-TIMEZONE:Asia/Taipei",
      ];

      for (const b of confirmed) {
        const dateClean = (b.slotDate || "").replace(/-/g, "");
        const startClean = (b.slotStartTime || "").replace(/:/g, "");
        const endClean = (b.slotEndTime || "").replace(/:/g, "");
        const dtStart = `${dateClean}T${startClean}00`;
        const dtEnd = `${dateClean}T${endClean}00`;
        const uid = `booking-${b.id}@primemath.tw`;
        const summary = `質數教室 - ${b.childName || ""}`;
        const location = b.franchiseName || "";
        const description = `老師：${b.coachName || ""}\\n孩子：${b.childName || ""}\\n教室：${location}`;

        lines.push("BEGIN:VEVENT");
        lines.push(`UID:${uid}`);
        lines.push(`DTSTART;TZID=Asia/Taipei:${dtStart}`);
        lines.push(`DTEND;TZID=Asia/Taipei:${dtEnd}`);
        lines.push(`SUMMARY:${summary}`);
        lines.push(`LOCATION:${location}`);
        lines.push(`DESCRIPTION:${description}`);
        lines.push("BEGIN:VALARM");
        lines.push("TRIGGER:-PT6H");
        lines.push("ACTION:DISPLAY");
        lines.push("DESCRIPTION:質數教室課程即將開始（6小時後）");
        lines.push("END:VALARM");
        lines.push("END:VEVENT");
      }

      lines.push("END:VCALENDAR");

      res.setHeader("Content-Type", "text/calendar; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=prime-math-bookings.ics");
      res.send(lines.join("\r\n"));
    } catch (error) {
      res.status(500).json({ message: "Failed to generate calendar" });
    }
  });

  app.get("/api/admin/stats", isAdmin, async (_req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/faqs", isAdmin, async (_req, res) => {
    try {
      const faqList = await storage.getAllFaqs();
      res.json(faqList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch FAQs" });
    }
  });

  app.post("/api/admin/faqs", isAdmin, async (req, res) => {
    try {
      const faq = await storage.createFaq({
        question: req.body.question,
        answer: req.body.answer,
        category: req.body.category,
        sortOrder: req.body.sortOrder || 0,
        isActive: true,
      });
      res.json(faq);
    } catch (error) {
      res.status(500).json({ message: "Failed to create FAQ" });
    }
  });

  app.patch("/api/admin/faqs/:id", isAdmin, async (req, res) => {
    try {
      const faq = await storage.updateFaq(parseInt(req.params.id), req.body);
      res.json(faq);
    } catch (error) {
      res.status(500).json({ message: "Failed to update FAQ" });
    }
  });

  app.delete("/api/admin/faqs/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteFaq(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete FAQ" });
    }
  });

  app.get("/api/admin/success-stories", isAdmin, async (_req, res) => {
    try {
      const stories = await storage.getAllSuccessStories();
      res.json(stories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  app.post("/api/admin/success-stories", isAdmin, async (req, res) => {
    try {
      const story = await storage.createSuccessStory({
        studentName: req.body.studentName,
        testimonial: req.body.testimonial,
        grade: req.body.grade || null,
        parentName: req.body.parentName || null,
        photoUrl: null,
        tags: req.body.tags || null,
        isActive: true,
      });
      res.json(story);
    } catch (error) {
      res.status(500).json({ message: "Failed to create story" });
    }
  });

  app.patch("/api/admin/success-stories/:id", isAdmin, async (req, res) => {
    try {
      const story = await storage.updateSuccessStory(parseInt(req.params.id), req.body);
      res.json(story);
    } catch (error) {
      res.status(500).json({ message: "Failed to update story" });
    }
  });

  app.delete("/api/admin/success-stories/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteSuccessStory(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete story" });
    }
  });

  app.get("/api/admin/franchises", isAdmin, async (_req, res) => {
    try {
      const franchiseList = await storage.getAllFranchises();
      res.json(franchiseList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch franchises" });
    }
  });

  app.post("/api/admin/franchises", isAdmin, async (req, res) => {
    try {
      const franchise = await storage.createFranchise(req.body);
      res.json(franchise);
    } catch (error) {
      res.status(500).json({ message: "Failed to create franchise" });
    }
  });

  app.patch("/api/admin/franchises/:id", isAdmin, async (req, res) => {
    try {
      const franchise = await storage.updateFranchise(parseInt(req.params.id), req.body);
      res.json(franchise);
    } catch (error) {
      res.status(500).json({ message: "Failed to update franchise" });
    }
  });

  app.post("/api/admin/franchises/:id/upload-photo", isAdmin, upload.single("photo"), async (req: any, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "請選擇圖片" });
      const franchiseId = parseInt(req.params.id);
      const photoUrl = `/uploads/${req.file.filename}`;
      const franchise = await storage.getFranchise(franchiseId);
      if (!franchise) return res.status(404).json({ message: "Franchise not found" });
      const currentPhotos = franchise.photos || [];
      const updatedPhotos = [...currentPhotos, photoUrl];
      await storage.updateFranchise(franchiseId, { photos: updatedPhotos });
      res.json({ url: photoUrl, photos: updatedPhotos });
    } catch (error) {
      res.status(500).json({ message: "上傳失敗" });
    }
  });

  app.delete("/api/admin/franchises/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteFranchise(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete franchise" });
    }
  });

  app.get("/api/admin/coaches", isAdmin, async (_req, res) => {
    try {
      const coachList = await storage.getAllCoaches();
      res.json(coachList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coaches" });
    }
  });

  app.post("/api/admin/coaches", isAdmin, async (req, res) => {
    try {
      const coach = await storage.createCoach(req.body);
      res.json(coach);
    } catch (error) {
      res.status(500).json({ message: "Failed to create coach" });
    }
  });

  app.patch("/api/admin/coaches/:id", isAdmin, async (req, res) => {
    try {
      const coach = await storage.updateCoach(parseInt(req.params.id), req.body);
      res.json(coach);
    } catch (error) {
      res.status(500).json({ message: "Failed to update coach" });
    }
  });

  app.delete("/api/admin/coaches/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteCoach(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete coach" });
    }
  });

  app.get("/api/admin/franchises/:id/coaches", isAdmin, async (req, res) => {
    try {
      const coachList = await storage.getCoachesByFranchise(parseInt(req.params.id));
      res.json(coachList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coaches" });
    }
  });

  app.get("/api/admin/franchises/:id/slots", isAdmin, async (req, res) => {
    try {
      const slotList = await storage.getSlotsByFranchise(parseInt(req.params.id));
      res.json(slotList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch slots" });
    }
  });

  app.post("/api/admin/time-slots", isAdmin, async (req, res) => {
    try {
      const slot = await storage.createSlot(req.body);
      res.json(slot);
    } catch (error) {
      res.status(500).json({ message: "Failed to create time slot" });
    }
  });

  app.delete("/api/admin/time-slots/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteSlot(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete time slot" });
    }
  });

  app.get("/api/admin/announcements", isAdmin, async (_req, res) => {
    try {
      const announcementList = await storage.getAnnouncements();
      res.json(announcementList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post("/api/admin/announcements", isAdmin, async (req, res) => {
    try {
      const announcement = await storage.createAnnouncement({
        title: req.body.title,
        content: req.body.content,
        type: req.body.type || "info",
        isActive: true,
      });
      res.json(announcement);
    } catch (error) {
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.patch("/api/admin/announcements/:id", isAdmin, async (req, res) => {
    try {
      const announcement = await storage.updateAnnouncement(parseInt(req.params.id), req.body);
      res.json(announcement);
    } catch (error) {
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  app.delete("/api/admin/announcements/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteAnnouncement(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  app.get("/api/admin/users", isAdmin, async (_req, res) => {
    try {
      const userList = await storage.getAllUsers();
      res.json(userList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id/role", isAdmin, async (req, res) => {
    try {
      const { role, franchiseId } = req.body;
      const user = await storage.updateUserRole(req.params.id, role, franchiseId || null);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.get("/api/franchise-admin/my-franchise", isFranchiseAdmin, async (req: any, res) => {
    try {
      const franchise = await storage.getFranchise(req.franchiseId);
      if (!franchise) return res.status(404).json({ message: "Franchise not found" });
      res.json(franchise);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch franchise" });
    }
  });

  app.patch("/api/franchise-admin/my-franchise", isFranchiseAdmin, async (req: any, res) => {
    try {
      const { description, phone, tags, nearbySchools, photos, coverPhoto } = req.body;
      const updates: any = { description, phone, tags, nearbySchools };
      if (photos !== undefined) updates.photos = photos;
      if (coverPhoto !== undefined) updates.coverPhoto = coverPhoto;
      const franchise = await storage.updateFranchise(req.franchiseId, updates);
      res.json(franchise);
    } catch (error) {
      res.status(500).json({ message: "Failed to update franchise" });
    }
  });

  app.post("/api/franchise-admin/upload-photo", isFranchiseAdmin, upload.single("photo"), async (req: any, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "請選擇圖片" });
      const photoUrl = `/uploads/${req.file.filename}`;
      const franchise = await storage.getFranchise(req.franchiseId);
      if (!franchise) return res.status(404).json({ message: "Franchise not found" });
      const currentPhotos = franchise.photos || [];
      const updatedPhotos = [...currentPhotos, photoUrl];
      await storage.updateFranchise(req.franchiseId, { photos: updatedPhotos });
      res.json({ url: photoUrl, photos: updatedPhotos });
    } catch (error) {
      res.status(500).json({ message: "上傳失敗" });
    }
  });

  app.delete("/api/franchise-admin/delete-photo", isFranchiseAdmin, async (req: any, res) => {
    try {
      const { photoUrl } = req.body;
      if (!photoUrl) return res.status(400).json({ message: "Missing photoUrl" });
      const franchise = await storage.getFranchise(req.franchiseId);
      if (!franchise) return res.status(404).json({ message: "Franchise not found" });
      const currentPhotos = franchise.photos || [];
      const updatedPhotos = currentPhotos.filter((p: string) => p !== photoUrl);
      const updateData: any = { photos: updatedPhotos };
      if (franchise.coverPhoto === photoUrl) {
        updateData.coverPhoto = null;
      }
      await storage.updateFranchise(req.franchiseId, updateData);
      const filename = photoUrl.replace("/uploads/", "");
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.json({ photos: updatedPhotos });
    } catch (error) {
      res.status(500).json({ message: "刪除失敗" });
    }
  });

  app.get("/api/franchise-admin/stats", isFranchiseAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getFranchiseStats(req.franchiseId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/franchise-admin/stats/date-range", isFranchiseAdmin, async (req: any, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) return res.status(400).json({ message: "startDate and endDate required" });
      const stats = await storage.getFranchiseStatsByDateRange(req.franchiseId, startDate as string, endDate as string);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch date range stats" });
    }
  });

  app.get("/api/franchise-admin/coaches", isFranchiseAdmin, async (req: any, res) => {
    try {
      const coachList = await storage.getCoachesByFranchise(req.franchiseId);
      const enriched = await Promise.all(coachList.map(async (coach) => {
        if (coach.userId) {
          const [user] = await db.select({ username: users.username }).from(users).where(eq(users.id, coach.userId));
          return { ...coach, accountUsername: user?.username || null };
        }
        return { ...coach, accountUsername: null };
      }));
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coaches" });
    }
  });

  app.post("/api/franchise-admin/coaches", isFranchiseAdmin, async (req: any, res) => {
    try {
      const coach = await storage.createCoach({ ...req.body, franchiseId: req.franchiseId });
      res.json(coach);
    } catch (error) {
      res.status(500).json({ message: "Failed to create coach" });
    }
  });

  app.patch("/api/franchise-admin/coaches/:id", isFranchiseAdmin, async (req: any, res) => {
    try {
      const coach = await storage.getCoach(parseInt(req.params.id));
      if (!coach || coach.franchiseId !== req.franchiseId) return res.status(403).json({ message: "Forbidden" });
      const updated = await storage.updateCoach(parseInt(req.params.id), req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update coach" });
    }
  });

  app.delete("/api/franchise-admin/coaches/:id", isFranchiseAdmin, async (req: any, res) => {
    try {
      const coach = await storage.getCoach(parseInt(req.params.id));
      if (!coach || coach.franchiseId !== req.franchiseId) return res.status(403).json({ message: "Forbidden" });
      await storage.deleteCoach(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete coach" });
    }
  });

  app.get("/api/franchise-admin/time-slots", isFranchiseAdmin, async (req: any, res) => {
    try {
      const slotList = await storage.getSlotsByFranchise(req.franchiseId);
      res.json(slotList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch time slots" });
    }
  });

  app.post("/api/franchise-admin/time-slots", isFranchiseAdmin, async (req: any, res) => {
    try {
      const { date, startTime, endTime, coachId } = req.body;
      const franchiseId = req.franchiseId;

      const roomConflicts = await storage.getOverlappingSlots(franchiseId, date, startTime, endTime);
      if (roomConflicts.length > 0) {
        const detail = roomConflicts.map((s) => `${s.startTime}-${s.endTime}`).join("、");
        return res.status(409).json({
          message: `教室時段衝突：${date} 已有時段 ${detail} 與此時段重疊`,
          type: "room_conflict",
          conflicts: roomConflicts,
        });
      }

      if (coachId) {
        const coachConflicts = await storage.getCoachOverlappingSlots(coachId, date, startTime, endTime);
        if (coachConflicts.length > 0) {
          const detail = coachConflicts.map((s) => `${s.franchiseName} ${s.startTime}-${s.endTime}`).join("、");
          return res.status(409).json({
            message: `老師排課衝突：${date} 老師已在 ${detail} 有排課`,
            type: "coach_conflict",
            conflicts: coachConflicts,
          });
        }
      }

      const slot = await storage.createSlot({ ...req.body, franchiseId });
      res.json(slot);
    } catch (error) {
      res.status(500).json({ message: "Failed to create time slot" });
    }
  });

  app.get("/api/franchise-admin/coaches/:id/schedule", isFranchiseAdmin, async (req: any, res) => {
    try {
      const coachId = parseInt(req.params.id);
      const coach = await storage.getCoach(coachId);
      if (!coach) return res.status(404).json({ message: "Coach not found" });
      const schedule = await storage.getCoachScheduleAcrossFranchises(coachId);
      res.json({ coach: { id: coach.id, name: coach.name }, schedule });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coach schedule" });
    }
  });

  app.delete("/api/franchise-admin/time-slots/:id", isFranchiseAdmin, async (req: any, res) => {
    try {
      const slotList = await storage.getSlotsByFranchise(req.franchiseId);
      const slot = slotList.find((s) => s.id === parseInt(req.params.id));
      if (!slot) return res.status(403).json({ message: "Forbidden" });
      await storage.deleteSlot(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete time slot" });
    }
  });

  app.get("/api/franchise-admin/bookings", isFranchiseAdmin, async (req: any, res) => {
    try {
      const bookingList = await storage.getBookingsByFranchise(req.franchiseId);
      res.json(bookingList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // ========== Franchise Admin: Coach Account Management ==========
  app.post("/api/franchise-admin/coaches/:id/account", isFranchiseAdmin, async (req: any, res) => {
    try {
      const coachId = parseInt(req.params.id);

      const coach = await storage.getCoach(coachId);
      if (!coach || coach.franchiseId !== req.franchiseId) return res.status(403).json({ message: "Forbidden" });
      if (coach.userId) return res.status(400).json({ message: "此老師已有帳號" });
      if (!coach.phone || coach.phone.length < 6) return res.status(400).json({ message: "請先填寫老師手機號碼（至少 6 位）" });

      let username = `${coach.name}@prime`;
      let suffix = 1;
      while (true) {
        const [existing] = await db.select().from(users).where(eq(users.username, username));
        if (!existing) break;
        suffix++;
        username = `${coach.name}${suffix}@prime`;
      }

      const phoneLast6 = coach.phone.slice(-6);
      const hash = await bcrypt.hash(phoneLast6, 10);
      const userId = `coach-${coach.name}-${Date.now()}`;
      await db.insert(users).values({
        id: userId,
        username,
        passwordHash: hash,
        firstName: coach.name,
        role: "coach",
        franchiseId: req.franchiseId,
        mustChangePassword: true,
      });

      const updated = await storage.createCoachAccount(coachId, userId);
      res.json({ ...updated, accountUsername: username });
    } catch (error) {
      res.status(500).json({ message: "建立帳號失敗" });
    }
  });

  app.patch("/api/franchise-admin/coaches/:id/account", isFranchiseAdmin, async (req: any, res) => {
    try {
      const coachId = parseInt(req.params.id);
      const { password } = req.body;
      if (!password) return res.status(400).json({ message: "請輸入新密碼" });
      if (password.length < 6) return res.status(400).json({ message: "密碼至少需要 6 個字元" });

      const coach = await storage.getCoach(coachId);
      if (!coach || coach.franchiseId !== req.franchiseId) return res.status(403).json({ message: "Forbidden" });
      if (!coach.userId) return res.status(400).json({ message: "此老師尚未建立帳號" });

      const hash = await bcrypt.hash(password, 10);
      await db.update(users).set({ passwordHash: hash, mustChangePassword: true }).where(eq(users.id, coach.userId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "重設密碼失敗" });
    }
  });

  // ========== Coach: Auth ==========
  app.get("/api/coach-user", async (req: any, res) => {
    const credId = req.session?.credentialUserId;
    if (!credId) return res.status(401).json({ message: "Unauthorized" });
    try {
      const user = await authStorage.getUser(credId);
      if (!user || user.role !== "coach") return res.status(401).json({ message: "Unauthorized" });
      const coach = await storage.getCoachByUserId(credId);
      const { passwordHash: _, ...safeUser } = user as any;
      res.json({ ...safeUser, coach });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ========== Coach: Calendar & Students ==========
  app.get("/api/coach/calendar/:year/:month", isCoach, async (req: any, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const slots = await storage.getCoachSlots(req.coach.id, year, month);
      res.json(slots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calendar" });
    }
  });

  app.get("/api/coach/slots/:slotId/students", isCoach, async (req: any, res) => {
    try {
      const slotId = parseInt(req.params.slotId);
      const slot = await storage.getTimeSlot(slotId);
      if (!slot || slot.coachId !== req.coach.id) {
        return res.status(403).json({ message: "此時段不屬於您" });
      }
      const students = await storage.getSlotStudents(slotId);
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/coach/students", isCoach, async (req: any, res) => {
    try {
      const students = await storage.getCoachStudents(req.coach.id);
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/coach/students/:childId/history", isCoach, async (req: any, res) => {
    try {
      const childId = parseInt(req.params.childId);
      const history = await storage.getStudentContactBookHistory(req.coach.id, childId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  // ========== Coach: Contact Books ==========
  app.post("/api/coach/contact-books", isCoach, async (req: any, res) => {
    try {
      const { entries } = req.body;
      if (!entries || !Array.isArray(entries) || entries.length === 0) {
        return res.status(400).json({ message: "請提供聯絡簿內容" });
      }
      const results = [];
      for (const entry of entries) {
        if (entry.bookingId) {
          const booking = await storage.getBooking(entry.bookingId);
          if (booking) {
            const slot = await storage.getTimeSlot(booking.slotId);
            if (!slot || slot.coachId !== req.coach.id) {
              return res.status(403).json({ message: "此預約不屬於您的時段" });
            }
          }
        }
        const created = await storage.createContactBook({
          ...entry,
          coachId: req.coach.id,
        });
        results.push(created);
      }
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "儲存聯絡簿失敗" });
    }
  });

  app.patch("/api/coach/contact-books/:id", isCoach, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getContactBook(id);
      if (!existing || existing.coachId !== req.coach.id) {
        return res.status(403).json({ message: "此聯絡簿不屬於您" });
      }
      const updated = await storage.updateContactBook(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "更新聯絡簿失敗" });
    }
  });

  app.get("/api/coach/contact-books/slot/:slotId", isCoach, async (req: any, res) => {
    try {
      const slotId = parseInt(req.params.slotId);
      const books = await storage.getContactBooksBySlot(slotId, req.coach.id);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact books" });
    }
  });

  // ========== Parent: Contact Books ==========
  app.get("/api/parent/contact-books", isCredentialOrAuth, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const books = await storage.getContactBooksByParent(userId);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact books" });
    }
  });

  app.get("/api/parent/contact-books/child/:childId", isCredentialOrAuth, async (req: any, res) => {
    try {
      const childId = parseInt(req.params.childId);
      const parentChildren = await storage.getChildrenByParent(req.currentUser.id);
      if (!parentChildren.some(c => c.id === childId)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const books = await storage.getContactBooksByChild(childId);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact books" });
    }
  });

  // ========== Coach: Profile ==========
  app.get("/api/coach/my-info", isCoach, async (req: any, res) => {
    try {
      const coach = req.coach;
      const franchise = coach.franchiseId ? await storage.getFranchise(coach.franchiseId) : null;
      res.json({ coach, franchise });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch info" });
    }
  });

  app.patch("/api/coach/my-info", isCoach, async (req: any, res) => {
    try {
      const { bio, specialties } = req.body;
      const updated = await storage.updateCoach(req.coach.id, { bio, specialties });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "更新資料失敗" });
    }
  });

  // ========== Shop: Products (Public) ==========
  app.get("/api/products", async (_req, res) => {
    try {
      const productList = await storage.getActiveProducts();
      res.json(productList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // ========== Shop: Cart (Parent) ==========
  app.get("/api/cart", isCredentialOrAuth, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const items = await storage.getCartItems(userId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", isCredentialOrAuth, async (req: any, res) => {
    try {
      const { productId, quantity } = req.body;
      if (!productId || !quantity || quantity < 1) {
        return res.status(400).json({ message: "請提供商品和數量" });
      }
      const product = await storage.getProduct(productId);
      if (!product || !product.isActive) {
        return res.status(404).json({ message: "商品不存在或已下架" });
      }
      const item = await storage.addToCart(req.currentUser.id, productId, quantity);
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "加入購物車失敗" });
    }
  });

  app.patch("/api/cart/:id", isCredentialOrAuth, async (req: any, res) => {
    try {
      const { quantity } = req.body;
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "數量不正確" });
      }
      const item = await storage.updateCartQuantity(parseInt(req.params.id), quantity);
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "更新購物車失敗" });
    }
  });

  app.delete("/api/cart/:id", isCredentialOrAuth, async (req: any, res) => {
    try {
      await storage.removeFromCart(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "移除商品失敗" });
    }
  });

  // ========== Shop: Orders (Parent) ==========
  app.post("/api/orders", isCredentialOrAuth, async (req: any, res) => {
    try {
      const { items, note } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "請至少選擇一項商品" });
      }
      const order = await storage.createOrder(req.currentUser.id, items, note);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "下單失敗" });
    }
  });

  app.get("/api/orders", isCredentialOrAuth, async (req: any, res) => {
    try {
      const orderList = await storage.getOrders(req.currentUser.id);
      res.json(orderList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", isCredentialOrAuth, async (req: any, res) => {
    try {
      const order = await storage.getOrder(parseInt(req.params.id));
      if (!order) return res.status(404).json({ message: "訂單不存在" });
      const items = await storage.getOrderItems(order.id);
      res.json({ ...order, items });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // ========== Shop: Admin Product Management ==========
  app.get("/api/admin/products", isAdmin, async (_req, res) => {
    try {
      const productList = await storage.getAllProducts();
      res.json(productList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/admin/products", isAdmin, upload.single("image"), async (req: any, res) => {
    try {
      const { name, description, price, discountPrice, category, stock, isActive, sortOrder } = req.body;
      if (!name || !price || !category) {
        return res.status(400).json({ message: "請填寫商品名稱、價格和分類" });
      }
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
      const product = await storage.createProduct({
        name,
        description: description || null,
        price: parseInt(price),
        discountPrice: discountPrice ? parseInt(discountPrice) : null,
        category,
        imageUrl,
        stock: stock ? parseInt(stock) : 0,
        isActive: isActive === "true" || isActive === true,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
      });
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "新增商品失敗" });
    }
  });

  app.patch("/api/admin/products/:id", isAdmin, upload.single("image"), async (req: any, res) => {
    try {
      const data: any = {};
      const { name, description, price, discountPrice, category, stock, isActive, sortOrder } = req.body;
      if (name !== undefined) data.name = name;
      if (description !== undefined) data.description = description || null;
      if (price !== undefined) data.price = parseInt(price);
      if (discountPrice !== undefined) data.discountPrice = discountPrice ? parseInt(discountPrice) : null;
      if (category !== undefined) data.category = category;
      if (stock !== undefined) data.stock = parseInt(stock);
      if (isActive !== undefined) data.isActive = isActive === "true" || isActive === true;
      if (sortOrder !== undefined) data.sortOrder = parseInt(sortOrder);
      if (req.file) data.imageUrl = `/uploads/${req.file.filename}`;
      const product = await storage.updateProduct(parseInt(req.params.id), data);
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "更新商品失敗" });
    }
  });

  app.delete("/api/admin/products/:id", isAdmin, async (req: any, res) => {
    try {
      await storage.deleteProduct(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "刪除商品失敗" });
    }
  });

  // ========== Shop: Admin Order Management ==========
  app.get("/api/admin/orders", isAdmin, async (_req, res) => {
    try {
      const orderList = await storage.getOrders();
      res.json(orderList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/admin/orders/:id", isAdmin, async (req: any, res) => {
    try {
      const order = await storage.getOrder(parseInt(req.params.id));
      if (!order) return res.status(404).json({ message: "訂單不存在" });
      const items = await storage.getOrderItems(order.id);
      res.json({ ...order, items });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.patch("/api/admin/orders/:id/status", isAdmin, async (req: any, res) => {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ message: "請提供狀態" });
      const order = await storage.updateOrderStatus(parseInt(req.params.id), status);
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "更新訂單狀態失敗" });
    }
  });

  app.get("/api/site-content", async (_req, res) => {
    try {
      const content = await storage.getAllSiteContent();
      const contentMap: Record<string, string> = {};
      for (const item of content) {
        contentMap[item.sectionKey] = item.value;
      }
      res.json(contentMap);
    } catch (error) {
      res.status(500).json({ message: "取得網站內容失敗" });
    }
  });

  app.get("/api/admin/site-content", isAdmin, async (_req, res) => {
    try {
      const content = await storage.getAllSiteContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "取得網站內容失敗" });
    }
  });

  app.put("/api/admin/site-content", isAdmin, async (req: any, res) => {
    try {
      const { sectionKey, value } = req.body;
      if (!sectionKey || value === undefined) {
        return res.status(400).json({ message: "請提供 sectionKey 和 value" });
      }
      const result = await storage.upsertSiteContent(sectionKey, value);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "更新網站內容失敗" });
    }
  });

  app.put("/api/admin/site-content/batch", isAdmin, async (req: any, res) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ message: "請提供 items 陣列" });
      }
      const results = [];
      for (const item of items) {
        if (item.sectionKey && item.value !== undefined) {
          const result = await storage.upsertSiteContent(item.sectionKey, item.value);
          results.push(result);
        }
      }
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "批次更新網站內容失敗" });
    }
  });

  app.get("/api/admin/franchise-analytics", isAdmin, async (_req, res) => {
    try {
      const analytics = await storage.getAllFranchiseAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "取得分校分析資料失敗" });
    }
  });

  app.get("/api/favorite-franchises", isCredentialOrAuth, async (req: any, res) => {
    try {
      const userId = getSessionUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const favorites = await storage.getFavoriteFranchises(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "取得收藏失敗" });
    }
  });

  app.post("/api/favorite-franchises/:franchiseId", isCredentialOrAuth, async (req: any, res) => {
    try {
      const userId = getSessionUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const franchiseId = parseInt(req.params.franchiseId);
      const result = await storage.addFavoriteFranchise(userId, franchiseId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "收藏失敗" });
    }
  });

  app.delete("/api/favorite-franchises/:franchiseId", isCredentialOrAuth, async (req: any, res) => {
    try {
      const userId = getSessionUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const franchiseId = parseInt(req.params.franchiseId);
      await storage.removeFavoriteFranchise(userId, franchiseId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "取消收藏失敗" });
    }
  });

  app.post("/api/admin/promote-grades", isAdmin, async (_req, res) => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const record = await storage.getSiteContent("system.lastGradePromotion");
      const lastYear = record ? parseInt(record.value) : 0;
      if (lastYear >= year) {
        return res.json({ message: `今年 (${year}) 已經升級過了`, promoted: 0 });
      }
      const count = await storage.promoteAllGrades();
      await storage.upsertSiteContent("system.lastGradePromotion", String(year));
      res.json({ message: `成功升級 ${count} 位學生`, promoted: count, year });
    } catch (error) {
      res.status(500).json({ message: "升級失敗" });
    }
  });

  async function checkAndPromoteGrades() {
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const year = now.getFullYear();

      if (month === 7 && day === 1) {
        const record = await storage.getSiteContent("system.lastGradePromotion");
        const lastYear = record ? parseInt(record.value) : 0;
        if (lastYear < year) {
          const count = await storage.promoteAllGrades();
          await storage.upsertSiteContent("system.lastGradePromotion", String(year));
          console.log(`[Grade Promotion] ${year}/7/1: ${count} students promoted.`);
        }
      }
    } catch (error) {
      console.error("[Grade Promotion] Error:", error);
    }
  }

  checkAndPromoteGrades();
  setInterval(checkAndPromoteGrades, 60 * 60 * 1000);

  return httpServer;
}
