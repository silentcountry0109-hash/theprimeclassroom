import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authStorage } from "./replit_integrations/auth/storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { seedDatabase } from "./seed";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { users } from "@shared/models/auth";
import { coaches, franchises, creditPurchases, creditBalances, timeSlots, insertTextbookSchema, insertTextbookQuizSchema, insertFranchiseSchema } from "@shared/schema";
import { eq, and, or } from "drizzle-orm";
import { db } from "./db";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import { generateCoachHeadshotFromBuffer } from "./gemini-image";
import { generateFranchiseDescription } from "./gemini-text";
import { objectStorageClient } from "./replit_integrations/object_storage";

interface PgUniqueViolation {
  code: "23505";
  constraint?: string;
}

function isPgUniqueViolation(err: unknown): err is PgUniqueViolation {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as Record<string, unknown>).code === "23505"
  );
}

const uploadsDir = path.join(process.cwd(), "uploads");

// ─── App Storage helpers ────────────────────────────────────────────────────

function parseStoragePath(fullPath: string): { bucketName: string; objectName: string } {
  const p = fullPath.startsWith("/") ? fullPath : `/${fullPath}`;
  const parts = p.split("/").filter(Boolean);
  return { bucketName: parts[0], objectName: parts.slice(1).join("/") };
}

async function uploadPublicFile(
  buffer: Buffer,
  originalname: string,
  contentType: string,
  folder: string = "uploads"
): Promise<string> {
  const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
  const firstPath = pathsStr.split(",")[0].trim();
  if (!firstPath) throw new Error("PUBLIC_OBJECT_SEARCH_PATHS not configured");
  const { bucketName, objectName: basePath } = parseStoragePath(firstPath);
  const ext = path.extname(originalname);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const objectName = `${basePath}/${folder}/${filename}`;
  const bucket = objectStorageClient.bucket(bucketName);
  const file = bucket.file(objectName);
  await file.save(buffer, { contentType, resumable: false });
  await file.makePublic();
  return `https://storage.googleapis.com/${bucketName}/${objectName}`;
}

async function uploadPrivatePdf(
  buffer: Buffer,
  originalname: string
): Promise<string> {
  const privateDir = process.env.PRIVATE_OBJECT_DIR || "";
  if (!privateDir) throw new Error("PRIVATE_OBJECT_DIR not configured");
  const { bucketName, objectName: basePath } = parseStoragePath(privateDir);
  const ext = path.extname(originalname) || ".pdf";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const objectName = `${basePath}/curriculum/${filename}`;
  const bucket = objectStorageClient.bucket(bucketName);
  const file = bucket.file(objectName);
  await file.save(buffer, { contentType: "application/pdf", resumable: false });
  return `gcs:/${bucketName}/${objectName}`;
}

async function streamPrivatePdf(
  storedPath: string,
  originalName: string,
  res: any
): Promise<void> {
  let bucketName: string;
  let objectName: string;
  if (storedPath.startsWith("gcs:/")) {
    const { bucketName: b, objectName: o } = parseStoragePath(storedPath.slice(4));
    bucketName = b;
    objectName = o;
  } else {
    const fullPath = path.join(process.cwd(), "uploads", "curriculum", path.basename(storedPath));
    if (!fs.existsSync(fullPath)) {
      res.status(404).json({ message: "檔案已遺失" });
      return;
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(originalName)}"`);
    fs.createReadStream(fullPath).pipe(res);
    return;
  }
  const bucket = objectStorageClient.bucket(bucketName);
  const file = bucket.file(objectName);
  const [exists] = await file.exists();
  if (!exists) { res.status(404).json({ message: "檔案已遺失" }); return; }
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(originalName)}"`);
  file.createReadStream().pipe(res);
}

async function deletePrivatePdf(storedPath: string): Promise<void> {
  if (storedPath.startsWith("gcs:/")) {
    const { bucketName, objectName } = parseStoragePath(storedPath.slice(4));
    try {
      await objectStorageClient.bucket(bucketName).file(objectName).delete();
    } catch { /* ignore */ }
  } else {
    const fullPath = path.join(process.cwd(), "uploads", "curriculum", path.basename(storedPath));
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  }
}

async function deletePublicFile(photoUrl: string): Promise<void> {
  if (photoUrl.startsWith("https://storage.googleapis.com/")) {
    try {
      const url = new URL(photoUrl);
      const pathParts = url.pathname.split("/").filter(Boolean);
      const bucketName = pathParts[0];
      const objectName = pathParts.slice(1).join("/");
      await objectStorageClient.bucket(bucketName).file(objectName).delete();
    } catch { /* ignore if already deleted */ }
  } else if (photoUrl.startsWith("/uploads/")) {
    const filename = photoUrl.replace("/uploads/", "");
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

interface OtpRecord {
  otp: string;
  expiresAt: number;
  sentAt: number;
  attempts: number;
}
const otpStore = new Map<string, OtpRecord>();
setInterval(() => {
  const now = Date.now();
  for (const [phone, record] of otpStore.entries()) {
    if (now > record.expiresAt) otpStore.delete(phone);
  }
}, 10 * 60_000);

async function sendMitakeSms(phone: string, body: string): Promise<void> {
  const username = process.env.MITAKE_USERNAME;
  const password = process.env.MITAKE_PASSWORD;
  if (!username || !password) {
    throw new Error("簡訊服務未設定，請聯絡系統管理員");
  }
  const params = new URLSearchParams({
    username,
    password,
    dstaddr: phone,
    smbody: body,
  });
  const res = await fetch(`https://smexpress.mitake.com.tw:9600/SmSendPost?${params.toString()}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  const text = await res.text();
  if (!text.includes("statuscode=0") && !text.includes("StatusCode=0")) {
    console.error("[Mitake SMS] Response:", text);
    throw new Error("簡訊發送失敗，請稍後再試");
  }
}
async function sendLineMessage(lineUserId: string, message: string): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token || !lineUserId) return;
  try {
    await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ to: lineUserId, messages: [{ type: "text", text: message }] }),
    });
  } catch (err) {
    console.error("[LINE Push] Failed:", err);
  }
}

async function sendLineReply(replyToken: string, message: string): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) { console.error("[LINE Reply] No access token"); return; }
  try {
    const res = await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ replyToken, messages: [{ type: "text", text: message }] }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[LINE Reply] API error ${res.status}:`, body);
    } else {
      console.log("[LINE Reply] Sent OK:", message.slice(0, 30));
    }
  } catch (err) {
    console.error("[LINE Reply] Failed:", err);
  }
}

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const curriculumDir = path.join(uploadsDir, "curriculum");
if (!fs.existsSync(curriculumDir)) fs.mkdirSync(curriculumDir, { recursive: true });

const siteContentDir = path.join(uploadsDir, "site-content");
if (!fs.existsSync(siteContentDir)) fs.mkdirSync(siteContentDir, { recursive: true });

const uploadSiteContent = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp)$/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error("只允許上傳 JPG / PNG / WebP 格式的圖片"));
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error("只允許上傳圖片檔案"));
  },
});

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === ".pdf") cb(null, true);
    else cb(new Error("只允許上傳 PDF 檔案"));
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
  const switchTo = req.headers["x-franchise-id"];
  if (switchTo) {
    const targetId = parseInt(switchTo);
    if (isNaN(targetId)) return res.status(400).json({ message: "Invalid franchise ID" });
    const managed = user.managedFranchiseIds || [];
    const allowed = new Set([user.franchiseId, ...managed]);
    if (!allowed.has(targetId)) return res.status(403).json({ message: "無權管理此分校" });
    req.franchiseId = targetId;
  } else {
    req.franchiseId = user.franchiseId;
  }
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
  const allCoaches = await storage.getCoachesByUserId(userId);
  req.currentUser = user;
  req.coach = coach;
  req.coachIds = allCoaches.map((c: any) => c.id);
  req.coachFranchiseIds = [...new Set(allCoaches.map((c: any) => c.franchiseId).filter(Boolean))];
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  // Legacy: serve files uploaded before the App Storage migration (e.g. coach photoUrl = "/uploads/xxx.jpg").
  // New uploads go to GCS; this route remains only for backward compatibility with existing DB records.
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
      if (user.role === "coach") {
        const [coach] = await db.select().from(coaches).where(eq(coaches.userId, user.id));
        if (coach && !coach.isActive) {
          return res.status(403).json({ message: "此帳號已被停用，請聯繫管理員" });
        }
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

  app.post("/api/send-otp", async (req, res) => {
    try {
      const { phone } = req.body;
      if (!phone || !/^09\d{8}$/.test(phone)) {
        return res.status(400).json({ message: "請輸入有效的台灣手機號碼（09 開頭 10 碼）" });
      }
      const now = Date.now();
      const existing = otpStore.get(phone);
      if (existing && now - existing.sentAt < 60_000) {
        const remaining = Math.ceil((60_000 - (now - existing.sentAt)) / 1000);
        return res.status(429).json({ message: `請等待 ${remaining} 秒後再重新發送` });
      }
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      otpStore.set(phone, { otp, expiresAt: now + 5 * 60_000, sentAt: now, attempts: 0 });
      try {
        await sendMitakeSms(phone, `【質數教室】您的驗證碼為 ${otp}，5 分鐘內有效，請勿告知他人。`);
      } catch (smsError: unknown) {
        otpStore.delete(phone);
        const msg = smsError instanceof Error ? smsError.message : "簡訊發送失敗，請稍後再試";
        return res.status(500).json({ message: msg });
      }
      if (process.env.NODE_ENV === "development") {
        console.log(`[DEV] OTP for ${phone}: ${otp}`);
      }
      return res.json({ message: "驗證碼已發送" });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "發送失敗，請稍後再試";
      return res.status(500).json({ message: msg });
    }
  });

  app.post("/api/parent-register", async (req: any, res) => {
    try {
      const { username, password, firstName, email, phone, address, referralSource, otp } = req.body;
      if (!username || !password || !firstName || !phone || !email) {
        return res.status(400).json({ message: "請填寫所有必填欄位" });
      }
      if (!otp) {
        return res.status(400).json({ message: "請先完成手機驗證" });
      }
      const now = Date.now();
      const record = otpStore.get(phone);
      if (!record) {
        return res.status(400).json({ message: "請先發送驗證碼至手機" });
      }
      if (now > record.expiresAt) {
        otpStore.delete(phone);
        return res.status(400).json({ message: "驗證碼已過期，請重新發送" });
      }
      if (record.attempts >= 3) {
        otpStore.delete(phone);
        return res.status(400).json({ message: "驗證碼錯誤次數過多，請重新發送" });
      }
      if (record.otp !== String(otp)) {
        otpStore.set(phone, { ...record, attempts: record.attempts + 1 });
        const left = 3 - (record.attempts + 1);
        return res.status(400).json({ message: `驗證碼不正確，還剩 ${left} 次機會` });
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
      const [existingEmail] = await db.select().from(users).where(eq(users.email, email));
      if (existingEmail) {
        return res.status(400).json({ message: "此 Email 已被使用，請直接登入或使用其他 Email" });
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
      otpStore.delete(phone);
      const [freePurchase] = await db.insert(creditPurchases).values({
        parentId: newUser.id,
        credits: 2,
        originalAmount: 0,
        discountAmount: 0,
        finalAmount: 0,
        paymentMethod: "free_trial",
        paymentStatus: "completed",
      }).returning();
      await db.insert(creditBalances).values({
        parentId: newUser.id,
        purchaseId: freePurchase.id,
        originalCredits: 2,
        remainingCredits: 2,
        expiresAt: null,
      });
      req.session.credentialUserId = newUser.id;
      req.session.save(() => {
        const { passwordHash: _, ...safeUser } = newUser;
        res.json({ ...safeUser, isNewUser: true });
      });
    } catch (error: unknown) {
      if (isPgUniqueViolation(error)) {
        if (error.constraint?.includes("email")) {
          return res.status(400).json({ message: "此 Email 已被使用，請直接登入或使用其他 Email" });
        }
        if (error.constraint?.includes("username")) {
          return res.status(400).json({ message: "此帳號已被使用" });
        }
      }
      res.status(500).json({ message: "註冊失敗，請稍後再試" });
    }
  });

  // ── LINE Login OAuth ──────────────────────────────────────────────────────────

  app.get("/api/auth/line", (req: any, res) => {
    const channelId = process.env.LINE_CHANNEL_ID;
    if (!channelId) {
      return res.redirect("/parent-login?error=line_not_configured");
    }
    const protocol = (req.headers["x-forwarded-proto"] as string) || req.protocol;
    const redirectUri = `${protocol}://${req.hostname}/api/auth/line/callback`;
    const state = Math.random().toString(36).slice(2);
    req.session.lineOAuthState = state;
    req.session.save(() => {
      const url = new URL("https://access.line.me/oauth2/v2.1/authorize");
      url.searchParams.set("response_type", "code");
      url.searchParams.set("client_id", channelId);
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("scope", "profile openid");
      url.searchParams.set("state", state);
      url.searchParams.set("bot_prompt", "normal");
      res.redirect(url.toString());
    });
  });

  app.get("/api/auth/line/callback", async (req: any, res) => {
    try {
      const { code, state, error } = req.query as Record<string, string>;
      if (error) {
        return res.redirect("/parent-login?error=line_denied");
      }
      if (!code || !state || state !== req.session.lineOAuthState) {
        return res.redirect("/parent-login?error=line_state");
      }
      delete req.session.lineOAuthState;

      const channelId = process.env.LINE_CHANNEL_ID!;
      const channelSecret = process.env.LINE_CHANNEL_SECRET!;
      const protocol = (req.headers["x-forwarded-proto"] as string) || req.protocol;
      const redirectUri = `${protocol}://${req.hostname}/api/auth/line/callback`;

      const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: channelId,
          client_secret: channelSecret,
        }),
      });
      if (!tokenRes.ok) {
        console.error("[LINE OAuth] Token exchange failed:", await tokenRes.text());
        return res.redirect("/parent-login?error=line_token");
      }
      const tokenData = await tokenRes.json() as { access_token: string };

      const profileRes = await fetch("https://api.line.me/v2/profile", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (!profileRes.ok) {
        return res.redirect("/parent-login?error=line_profile");
      }
      const profile = await profileRes.json() as { userId: string; displayName: string; pictureUrl?: string };

      let user = await authStorage.getUserByLineUserId(profile.userId);

      if (!user) {
        user = await authStorage.upsertUser({
          id: `line-${profile.userId}`,
          lineUserId: profile.userId,
          firstName: profile.displayName,
          profileImageUrl: profile.pictureUrl ?? null,
          role: "parent",
          lineRegistrationComplete: false,
        });
      }

      req.session.credentialUserId = user.id;
      req.session.save(() => {
        if (user!.lineRegistrationComplete) {
          return res.redirect("/dashboard");
        }
        return res.redirect("/parent-register/add-friend");
      });
    } catch (err) {
      console.error("[LINE OAuth] Callback error:", err);
      res.redirect("/parent-login?error=line_server");
    }
  });

  app.post("/api/auth/line/send-otp", async (req: any, res) => {
    try {
      const userId = getSessionUserId(req);
      if (!userId) return res.status(401).json({ message: "請先登入" });
      const { phone } = req.body;
      if (!phone || !/^09\d{8}$/.test(phone)) {
        return res.status(400).json({ message: "請輸入有效的台灣手機號碼（09 開頭 10 碼）" });
      }
      const now = Date.now();
      const existing = otpStore.get(phone);
      if (existing && now - existing.sentAt < 60_000) {
        const remaining = Math.ceil((60_000 - (now - existing.sentAt)) / 1000);
        return res.status(429).json({ message: `請等待 ${remaining} 秒後再重新發送` });
      }
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      otpStore.set(phone, { otp, expiresAt: now + 5 * 60_000, sentAt: now, attempts: 0 });
      try {
        await sendMitakeSms(phone, `【質數教室】您的驗證碼為 ${otp}，5 分鐘內有效，請勿告知他人。`);
      } catch (smsError: unknown) {
        otpStore.delete(phone);
        const msg = smsError instanceof Error ? smsError.message : "簡訊發送失敗，請稍後再試";
        return res.status(500).json({ message: msg });
      }
      if (process.env.NODE_ENV === "development") {
        console.log(`[DEV] LINE OTP for ${phone}: ${otp}`);
      }
      res.json({ message: "驗證碼已發送" });
    } catch (err) {
      res.status(500).json({ message: "發送失敗，請稍後再試" });
    }
  });

  app.post("/api/auth/line/confirm-otp", async (req: any, res) => {
    try {
      const userId = getSessionUserId(req);
      if (!userId) return res.status(401).json({ message: "請先登入" });
      const { phone, otp } = req.body;
      if (!phone || !otp) return res.status(400).json({ message: "缺少必要欄位" });
      const now = Date.now();
      const record = otpStore.get(phone);
      if (!record) return res.status(400).json({ message: "請先發送驗證碼至手機" });
      if (now > record.expiresAt) {
        otpStore.delete(phone);
        return res.status(400).json({ message: "驗證碼已過期，請重新發送" });
      }
      if (record.attempts >= 3) {
        otpStore.delete(phone);
        return res.status(400).json({ message: "驗證碼錯誤次數過多，請重新發送" });
      }
      if (record.otp !== String(otp)) {
        otpStore.set(phone, { ...record, attempts: record.attempts + 1 });
        const left = 3 - (record.attempts + 1);
        return res.status(400).json({ message: `驗證碼不正確，還剩 ${left} 次機會` });
      }
      otpStore.delete(phone);
      const [updated] = await db.update(users)
        .set({ phone, lineRegistrationComplete: true, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
      if (!updated) return res.status(404).json({ message: "找不到使用者" });
      const { passwordHash: _, ...safeUser } = updated;
      req.session.save(() => res.json({ ...safeUser }));
    } catch (err) {
      res.status(500).json({ message: "驗證失敗，請稍後再試" });
    }
  });

  // ── END LINE Login OAuth ───────────────────────────────────────────────────────

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

  app.post("/api/admin/franchises/:franchiseId/reset-director-password", isAdmin, async (req: any, res) => {
    try {
      const franchiseId = parseInt(req.params.franchiseId);
      const { password } = req.body;
      if (!password || password.length < 6) {
        return res.status(400).json({ message: "密碼至少需要 6 個字元" });
      }
      const director = await db.select().from(users)
        .where(and(eq(users.franchiseId, franchiseId), eq(users.role, "franchise_admin")))
        .limit(1);
      if (!director.length) {
        return res.status(404).json({ message: "此分校尚未設定主任帳號" });
      }
      const hash = await bcrypt.hash(password, 10);
      await db.update(users).set({ passwordHash: hash, mustChangePassword: true, updatedAt: new Date() })
        .where(eq(users.id, director[0].id));
      res.json({ success: true, username: director[0].username });
    } catch (error) {
      res.status(500).json({ message: "重置密碼失敗" });
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
      const balance = await storage.getParentBalance(userId);
      if (balance < 1) {
        return res.status(400).json({ message: "堂數不足，請先購買堂數後再預約課程", code: "INSUFFICIENT_CREDITS" });
      }
      const booking = await storage.createBooking({
        slotId: req.body.slotId,
        childId: req.body.childId,
        parentId: userId,
      });
      try {
        await storage.deductCredits(userId, 1, booking.id, "預約課程扣除 1 堂");
      } catch (deductErr: any) {
        await storage.cancelBooking(booking.id);
        return res.status(400).json({ message: "堂數扣除失敗，預約已取消", code: "DEDUCT_FAILED" });
      }
      try {
        const child = kids.find((k: any) => k.id === req.body.childId);
        const childName = child?.name || "新學生";
        const slotDate = slot.date;
        const slotTime = `${slot.startTime}–${slot.endTime}`;
        const [directorUser] = await db.select().from(users).where(and(eq(users.franchiseId, slot.franchiseId), eq(users.role, "franchise_admin")));
        if (directorUser) {
          const msg = `【質數教室】新生預約通知\n${childName} 已預約 ${slotDate} ${slotTime} 的課程，請確認安排。`;
          await storage.createNotification({ userId: directorUser.id, type: "new_booking", title: "新生預約通知", message: `${childName} 已預約 ${slotDate} ${slotTime} 的課程，請確認安排。` });
          if (directorUser.lineUserId) await sendLineMessage(directorUser.lineUserId, msg);
        }
        if (slot.coachId) {
          const [coachRec] = await db.select().from(coaches).where(eq(coaches.id, slot.coachId));
          if (coachRec?.userId) {
            const [coachUser] = await db.select({ lineUserId: users.lineUserId }).from(users).where(eq(users.id, coachRec.userId));
            const msg = `【質數教室】新課程預約\n新學生 ${childName} 將在 ${slotDate} ${slotTime} 出席您的課程。`;
            await storage.createNotification({ userId: coachRec.userId, type: "new_booking", title: "新課程預約", message: `新學生 ${childName} 將在 ${slotDate} ${slotTime} 出席您的課程。` });
            if (coachUser?.lineUserId) await sendLineMessage(coachUser.lineUserId, msg);
          }
        }
      } catch (_) {}
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
      const balance = await storage.getParentBalance(userId);
      if (balance < slotIds.length) {
        return res.status(400).json({ message: `堂數不足，目前剩餘 ${balance} 堂，需要 ${slotIds.length} 堂`, code: "INSUFFICIENT_CREDITS" });
      }
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
          const booking = await storage.createBooking({ slotId, childId, parentId: userId });
          try {
            await storage.deductCredits(userId, 1, booking.id, "預約課程扣除 1 堂");
          } catch (deductErr: any) {
            await storage.cancelBooking(booking.id);
            results.push({ slotId, success: false, message: "堂數不足" });
            continue;
          }
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
      try {
        await storage.refundCredits(userId, bookingId, "取消預約退回 1 堂");
      } catch (refundErr) {
        console.error("Credit refund failed for booking", bookingId, refundErr);
      }
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

  app.post("/api/line/webhook", async (req: any, res) => {
    try {
      const channelSecret = process.env.LINE_CHANNEL_SECRET;
      if (channelSecret) {
        const signature = req.headers["x-line-signature"] as string;
        const rawBody = req.rawBody as Buffer | undefined;
        if (rawBody && signature) {
          const hmac = crypto.createHmac("sha256", channelSecret);
          hmac.update(rawBody);
          const expected = hmac.digest("base64");
          if (signature !== expected) {
            console.warn("[LINE Webhook] Signature mismatch — processing anyway");
          }
        }
      }
      const events: any[] = req.body?.events || [];
      for (const event of events) {
        if (event.type !== "message" || event.message?.type !== "text") continue;
        const lineUserId: string = event.source?.userId;
        const replyToken: string = event.replyToken;
        const text: string = (event.message.text || "").trim();
        if (!lineUserId) continue;
        const normalized = text.replace(/[\s\-\(\)]/g, "");
        const phoneRegex = /^09[0-9]{8}$/;
        if (!phoneRegex.test(normalized)) {
          await sendLineReply(replyToken, "您好！請傳送您的手機號碼（格式：0912345678）以完成質數教室 LINE 通知綁定。");
          continue;
        }
        const [alreadyBound] = await db.select().from(users).where(eq(users.lineUserId, lineUserId)).limit(1);
        if (alreadyBound) {
          const name = alreadyBound.firstName || alreadyBound.username || "";
          await sendLineReply(replyToken, `${name ? name + " 您好！" : ""}您已完成 LINE 綁定，無需重複操作 ✅`);
          continue;
        }
        // 先從 coaches 表格比對手機號碼（老師手機存在 coaches，不在 users）
        const [matchCoach] = await db.select().from(coaches).where(eq(coaches.phone, normalized)).limit(1);
        let targetUserId: string | null = null;
        let displayName = "老師";
        if (matchCoach) {
          if (!matchCoach.userId) {
            await sendLineReply(replyToken, `找到老師「${matchCoach.name}」，但尚未建立系統帳號，請聯絡分校主任協助建立帳號後再綁定。`);
            continue;
          }
          targetUserId = matchCoach.userId;
          displayName = matchCoach.name || "老師";
        } else {
          // 再從 users 表格比對（分校主任可能有手機號碼）
          const [matchUser] = await db.select().from(users).where(
            and(eq(users.phone, normalized), eq(users.role, "franchise_admin"))
          ).limit(1);
          if (matchUser) {
            targetUserId = matchUser.id;
            displayName = matchUser.firstName || matchUser.username || "主任";
          }
        }
        if (!targetUserId) {
          await sendLineReply(replyToken, `查無手機號碼「${normalized}」對應的老師或分校主任帳號，請確認號碼是否正確，或聯絡分校主任協助。`);
          continue;
        }
        const [targetUser] = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);
        if (targetUser?.lineUserId) {
          await sendLineReply(replyToken, `此手機號碼已完成 LINE 綁定。若需重新綁定，請聯絡分校主任協助解除後再操作。`);
          continue;
        }
        await storage.updateUserLineUserId(targetUserId, lineUserId);
        await sendLineReply(replyToken, `✅ 綁定成功！${displayName} 您好，往後課程排班通知、新生預約等重要訊息將直接傳送到這裡。`);
      }
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("[LINE Webhook] Error:", error);
      res.status(500).json({ message: "Webhook error" });
    }
  });

  app.get("/api/notifications", isCredentialOrAuth, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const notificationList = await storage.getNotificationsByUser(userId);
      res.json(notificationList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread-count", isCredentialOrAuth, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.patch("/api/notifications/:id/read", isCredentialOrAuth, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const notifId = parseInt(req.params.id);
      const userNotifs = await storage.getNotificationsByUser(userId);
      const owns = userNotifs.some((n) => n.id === notifId);
      if (!owns) return res.status(403).json({ message: "Forbidden" });
      await storage.markNotificationRead(notifId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification read" });
    }
  });

  app.patch("/api/notifications/read-all", isCredentialOrAuth, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      await storage.markAllNotificationsRead(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications read" });
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
      const parsed = insertFranchiseSchema.safeParse(req.body);
      if (!parsed.success) {
        const nameError = parsed.error.issues.find((i) => i.path.includes("name"));
        return res.status(400).json({ message: nameError?.message || "表單資料格式錯誤" });
      }
      const franchise = await storage.createFranchise(parsed.data);
      res.json(franchise);
    } catch (error) {
      res.status(500).json({ message: "Failed to create franchise" });
    }
  });

  app.patch("/api/admin/franchises/:id", isAdmin, async (req, res) => {
    try {
      if (req.body.name !== undefined) {
        const nameCheck = insertFranchiseSchema.shape.name.safeParse(req.body.name);
        if (!nameCheck.success) {
          return res.status(400).json({ message: nameCheck.error.issues[0]?.message || "分校名稱格式錯誤" });
        }
      }
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
      const franchise = await storage.getFranchise(franchiseId);
      if (!franchise) return res.status(404).json({ message: "Franchise not found" });
      const photoUrl = await uploadPublicFile(req.file.buffer, req.file.originalname, req.file.mimetype, "uploads");
      const currentPhotos = franchise.photos || [];
      const updatedPhotos = [...currentPhotos, photoUrl];
      await storage.updateFranchise(franchiseId, { photos: updatedPhotos });
      res.json({ url: photoUrl, photos: updatedPhotos });
    } catch (error) {
      console.error("[upload-photo]", error);
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
      const { date, startTime, endTime, franchiseId } = req.body;
      if (franchiseId && date) {
        const franchiseData = await storage.getFranchise(franchiseId);
        if (franchiseData?.businessHours) {
          const bh = franchiseData.businessHours as Record<string, { isOpen: boolean; openTime?: string; closeTime?: string }>;
          const [y, mo, d] = date.split("-").map(Number);
          const dayOfWeek = new Date(y, mo - 1, d).getDay().toString();
          const dayConfig = bh[dayOfWeek];
          if (dayConfig && !dayConfig.isOpen) {
            const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
            return res.status(400).json({ message: `星期${dayNames[parseInt(dayOfWeek)]}未營業，無法排課` });
          }
          if (dayConfig && dayConfig.isOpen && dayConfig.openTime && dayConfig.closeTime) {
            const st = startTime.padStart(5, "0");
            const et = endTime.padStart(5, "0");
            const ot = dayConfig.openTime.padStart(5, "0");
            const ct = dayConfig.closeTime.padStart(5, "0");
            if (st < ot || et > ct) {
              return res.status(400).json({ message: `排課時間超出營業時間（${dayConfig.openTime} - ${dayConfig.closeTime}）` });
            }
          }
        }
      }
      const slot = await storage.createSlot(req.body);
      if (slot.coachId) {
        const coach = await storage.getCoach(slot.coachId);
        if (coach?.userId) {
          const franchise = await storage.getFranchise(slot.franchiseId);
          const notifMsg = `您在 ${slot.date} ${slot.startTime}-${slot.endTime}（${franchise?.name || "教室"}）有新的排課。`;
          await storage.createNotification({ userId: coach.userId, type: "slot_assigned", title: "新排課通知", message: notifMsg, isRead: false });
          const [coachUser] = await db.select({ lineUserId: users.lineUserId }).from(users).where(eq(users.id, coach.userId));
          if (coachUser?.lineUserId) await sendLineMessage(coachUser.lineUserId, `【質數教室】新排課通知\n${notifMsg}`);
        }
      }
      res.json(slot);
    } catch (error) {
      res.status(500).json({ message: "Failed to create time slot" });
    }
  });

  app.delete("/api/admin/time-slots/:id", isAdmin, async (req, res) => {
    try {
      const slotId = parseInt(req.params.id);

      const slotForCheck = await storage.getSlot(slotId);
      if (slotForCheck) {
        const now = new Date();
        const slotStart = new Date(`${slotForCheck.date}T${slotForCheck.startTime}:00+08:00`);
        if (now >= slotStart) {
          return res.status(403).json({ message: "課程已開始或結束，無法刪除" });
        }
      }

      const activeBookings = await storage.getSlotBookings(slotId);
      const force = req.query.force === "true";

      const checkedInBookings = activeBookings.filter((b: any) => b.status === "checked_in");
      if (checkedInBookings.length > 0) {
        return res.status(403).json({ message: "此時段有學生正在上課，無法刪除" });
      }

      const confirmedBookings = activeBookings.filter((b: any) => b.status === "confirmed");
      if (confirmedBookings.length > 0 && !force) {
        const slot = await storage.getSlot(slotId);
        return res.status(409).json({
          message: `此時段有 ${confirmedBookings.length} 位學生已預約`,
          bookingCount: confirmedBookings.length,
          bookings: confirmedBookings.map((b: any) => ({
            childName: b.childName,
            childGrade: b.childGrade,
            date: slot?.date,
            startTime: slot?.startTime,
            endTime: slot?.endTime,
          })),
        });
      }

      const slot = await storage.getSlot(slotId);

      if (confirmedBookings.length > 0) {
        await storage.cancelSlotBookingsAndNotify(slotId);
      }
      await storage.deleteSlot(slotId);

      if (slot?.coachId) {
        const coach = await storage.getCoach(slot.coachId);
        if (coach?.userId) {
          const franchise = await storage.getFranchise(slot.franchiseId);
          const notifMsg = `您在 ${slot.date} ${slot.startTime}-${slot.endTime}（${franchise?.name || "教室"}）的排課已被取消。`;
          await storage.createNotification({ userId: coach.userId, type: "slot_removed", title: "排課已取消", message: notifMsg, isRead: false });
          const [coachUser] = await db.select({ lineUserId: users.lineUserId }).from(users).where(eq(users.id, coach.userId));
          if (coachUser?.lineUserId) await sendLineMessage(coachUser.lineUserId, `【質數教室】排課取消通知\n${notifMsg}`);
        }
      }

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

  app.get("/api/franchise-admin/managed-franchises", isFranchiseAdmin, async (req: any, res) => {
    try {
      const user = req.currentUser;
      const managed = user.managedFranchiseIds || [];
      const uniqueIds = [...new Set([user.franchiseId, ...managed].filter(Boolean))];
      const results = [];
      for (const id of uniqueIds) {
        const f = await storage.getFranchise(id);
        if (f) results.push({ id: f.id, name: f.name, city: f.city, district: f.district });
      }
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "取得管理分校列表失敗" });
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
      const { description, phone, tags, nearbySchools, photos, coverPhoto, businessHours } = req.body;
      const updates: any = { description, phone, tags, nearbySchools };
      if (photos !== undefined) updates.photos = photos;
      if (coverPhoto !== undefined) updates.coverPhoto = coverPhoto;
      if (businessHours !== undefined) updates.businessHours = businessHours;
      const franchise = await storage.updateFranchise(req.franchiseId, updates);
      res.json(franchise);
    } catch (error) {
      res.status(500).json({ message: "Failed to update franchise" });
    }
  });

  app.post("/api/franchise-admin/generate-description", isFranchiseAdmin, async (req: any, res) => {
    try {
      const franchise = await storage.getFranchise(req.franchiseId);
      if (!franchise) return res.status(404).json({ message: "找不到分校資料" });
      const body = req.body as {
        name?: string;
        city?: string;
        district?: string;
        address?: string;
        nearbySchools?: string[];
        tags?: string[];
      };
      const description = await generateFranchiseDescription({
        name: body.name || franchise.name || "",
        city: body.city ?? franchise.city ?? undefined,
        district: body.district ?? franchise.district ?? undefined,
        address: body.address ?? franchise.address ?? undefined,
        nearbySchools: Array.isArray(body.nearbySchools) ? body.nearbySchools : (franchise.nearbySchools as string[]) || [],
        tags: Array.isArray(body.tags) ? body.tags : (franchise.tags as string[]) || [],
        maxSeats: franchise.maxSeats || undefined,
      });
      if (!description) {
        return res.status(503).json({ message: "AI 服務暫時無法使用，請稍後再試" });
      }
      res.json({ description });
    } catch (error) {
      res.status(500).json({ message: "生成失敗，請稍後再試" });
    }
  });

  app.post("/api/franchise-admin/upload-photo", isFranchiseAdmin, upload.single("photo"), async (req: any, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "請選擇圖片" });
      const franchise = await storage.getFranchise(req.franchiseId);
      if (!franchise) return res.status(404).json({ message: "Franchise not found" });
      const photoUrl = await uploadPublicFile(req.file.buffer, req.file.originalname, req.file.mimetype, "uploads");
      const currentPhotos = franchise.photos || [];
      const updatedPhotos = [...currentPhotos, photoUrl];
      await storage.updateFranchise(req.franchiseId, { photos: updatedPhotos });
      res.json({ url: photoUrl, photos: updatedPhotos });
    } catch (error) {
      console.error("[upload-photo]", error);
      res.status(500).json({ message: "上傳失敗" });
    }
  });

  app.post("/api/franchise-admin/coaches/:id/upload-photo", isFranchiseAdmin, upload.single("photo"), async (req: any, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "請選擇圖片" });
      const coachId = parseInt(req.params.id);
      const coach = await storage.getCoach(coachId);
      if (!coach) return res.status(404).json({ message: "Coach not found" });
      if (coach.franchiseId !== req.franchiseId) return res.status(403).json({ message: "無權限" });
      const mimeType = req.file.mimetype || "image/jpeg";
      const originalPhotoUrl = await uploadPublicFile(req.file.buffer, req.file.originalname, mimeType, "uploads");
      await storage.updateCoach(coachId, { photoUrl: originalPhotoUrl });

      const aiBuffer = await generateCoachHeadshotFromBuffer(req.file.buffer, mimeType);
      if (aiBuffer) {
        const aiPhotoUrl = await uploadPublicFile(aiBuffer, `ai-${Date.now()}.jpg`, "image/jpeg", "uploads");
        await storage.updateCoach(coachId, { photoUrl: aiPhotoUrl });
        res.json({ url: aiPhotoUrl, aiGenerated: true });
      } else {
        res.json({ url: originalPhotoUrl, aiGenerated: false });
      }
    } catch (error) {
      console.error("[upload-coach-photo]", error);
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
      await deletePublicFile(photoUrl);
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

  app.get("/api/franchise-admin/stats/today", isFranchiseAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getFranchiseTodayStats(req.franchiseId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today stats" });
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
          const [user] = await db.select({ username: users.username, lineUserId: users.lineUserId }).from(users).where(eq(users.id, coach.userId));
          return { ...coach, accountUsername: user?.username || null, lineUserId: user?.lineUserId || null };
        }
        return { ...coach, accountUsername: null, lineUserId: null };
      }));
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coaches" });
    }
  });

  app.get("/api/franchise-admin/coaches/check-phone", isFranchiseAdmin, async (req: any, res) => {
    try {
      const phone = (req.query.phone as string || "").trim();
      const excludeCoachId = req.query.excludeCoachId ? parseInt(req.query.excludeCoachId as string) : null;
      if (!phone || phone.length < 6) return res.json({ sameFranchise: [], crossFranchise: [] });

      const matchingCoaches = await db.select().from(coaches)
        .where(and(eq(coaches.phone, phone), eq(coaches.isActive, true)));

      const filtered = matchingCoaches.filter(c => c.id !== excludeCoachId);

      const sameFranchise: any[] = [];
      const crossFranchise: any[] = [];

      for (const c of filtered) {
        let accountUsername: string | null = null;
        if (c.userId) {
          const [user] = await db.select({ username: users.username }).from(users).where(eq(users.id, c.userId));
          accountUsername = user?.username || null;
        }
        const [franchise] = await db.select({ name: franchises.name }).from(franchises).where(eq(franchises.id, c.franchiseId));
        const entry = {
          coachId: c.id,
          coachName: c.name,
          franchiseName: franchise?.name || `分校 #${c.franchiseId}`,
          franchiseId: c.franchiseId,
          hasAccount: !!c.userId,
          accountUsername,
        };
        if (c.franchiseId === req.franchiseId) sameFranchise.push(entry);
        else crossFranchise.push(entry);
      }

      res.json({ sameFranchise, crossFranchise });
    } catch (error) {
      res.status(500).json({ message: "查詢失敗" });
    }
  });

  app.post("/api/franchise-admin/coaches", isFranchiseAdmin, async (req: any, res) => {
    try {
      const { compensationType, compensationAmount, ...rest } = req.body;
      if (!rest.name || !String(rest.name).trim()) return res.status(400).json({ message: "老師姓名為必填" });
      if (!rest.phone || !String(rest.phone).trim()) return res.status(400).json({ message: "手機號碼為必填" });
      const data: any = { ...rest, franchiseId: req.franchiseId };
      if (compensationType !== undefined) {
        if (!["fixed", "percentage", "hourly"].includes(compensationType)) return res.status(400).json({ message: "薪酬類型必須是 fixed、percentage 或 hourly" });
        data.compensationType = compensationType;
      }
      if (compensationAmount !== undefined) {
        const amt = Number(compensationAmount);
        if (isNaN(amt) || amt < 0) return res.status(400).json({ message: "薪酬金額不可為負數" });
        if (compensationType === "percentage" && amt > 100) return res.status(400).json({ message: "抽成比例不可超過 100%" });
        data.compensationAmount = amt;
      }
      const coach = await storage.createCoach(data);
      res.json(coach);
    } catch (error) {
      res.status(500).json({ message: "Failed to create coach" });
    }
  });

  app.patch("/api/franchise-admin/coaches/:id", isFranchiseAdmin, async (req: any, res) => {
    try {
      const coach = await storage.getCoach(parseInt(req.params.id));
      if (!coach || coach.franchiseId !== req.franchiseId) return res.status(403).json({ message: "Forbidden" });
      const { compensationType, compensationAmount, ...rest } = req.body;
      const data: any = { ...rest };
      if (compensationType !== undefined) {
        if (!["fixed", "percentage", "hourly"].includes(compensationType)) return res.status(400).json({ message: "薪酬類型必須是 fixed、percentage 或 hourly" });
        data.compensationType = compensationType;
      }
      if (compensationAmount !== undefined) {
        const amt = Number(compensationAmount);
        if (isNaN(amt) || amt < 0) return res.status(400).json({ message: "薪酬金額不可為負數" });
        const effectiveType = compensationType || coach.compensationType;
        if (effectiveType === "percentage" && amt > 100) return res.status(400).json({ message: "抽成比例不可超過 100%" });
        data.compensationAmount = amt;
      }
      const updated = await storage.updateCoach(parseInt(req.params.id), data);
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
      const { date, startTime, endTime, coachId, classroomId } = req.body;
      const franchiseId = req.franchiseId;

      if (!coachId) {
        return res.status(400).json({ message: "請指派老師" });
      }

      const franchiseData = await storage.getFranchise(franchiseId);
      if (franchiseData?.businessHours && date) {
        const bh = franchiseData.businessHours as Record<string, { isOpen: boolean; openTime?: string; closeTime?: string }>;
        const [y, mo, d] = date.split("-").map(Number);
        const dayOfWeek = new Date(y, mo - 1, d).getDay().toString();
        const dayConfig = bh[dayOfWeek];
        if (dayConfig && !dayConfig.isOpen) {
          const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
          return res.status(400).json({ message: `星期${dayNames[parseInt(dayOfWeek)]}未營業，無法排課` });
        }
        if (dayConfig && dayConfig.isOpen && dayConfig.openTime && dayConfig.closeTime) {
          const st = startTime.padStart(5, "0");
          const et = endTime.padStart(5, "0");
          const ot = dayConfig.openTime.padStart(5, "0");
          const ct = dayConfig.closeTime.padStart(5, "0");
          if (st < ot || et > ct) {
            return res.status(400).json({ message: `排課時間超出營業時間（${dayConfig.openTime} - ${dayConfig.closeTime}）` });
          }
        }
      }

      const allClassrooms = await storage.getClassroomsByFranchise(franchiseId);
      if (allClassrooms.length > 0 && !classroomId) {
        return res.status(400).json({ message: "此分校已建立教室，排課時必須指定教室" });
      }

      if (classroomId) {
        const cr = allClassrooms.find((c) => c.id === classroomId);
        if (!cr) return res.status(400).json({ message: "教室不存在" });

        const roomConflicts = await storage.getClassroomOverlappingSlots(classroomId, date, startTime, endTime);
        if (roomConflicts.length > 0) {
          const detail = roomConflicts.map((s) => `${s.startTime}-${s.endTime}`).join("、");
          return res.status(409).json({
            message: `教室「${cr.name}」時段衝突：${date} 已有時段 ${detail} 與此時段重疊`,
            type: "room_conflict",
            conflicts: roomConflicts,
          });
        }
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
      if (slot.coachId) {
        const coach = await storage.getCoach(slot.coachId);
        if (coach?.userId) {
          const franchise = await storage.getFranchise(franchiseId);
          const notifMsg = `您在 ${slot.date} ${slot.startTime}-${slot.endTime}（${franchise?.name || "教室"}）有新的排課。`;
          await storage.createNotification({ userId: coach.userId, type: "slot_assigned", title: "新排課通知", message: notifMsg, isRead: false });
          const [coachUser] = await db.select({ lineUserId: users.lineUserId }).from(users).where(eq(users.id, coach.userId));
          if (coachUser?.lineUserId) await sendLineMessage(coachUser.lineUserId, `【質數教室】新排課通知\n${notifMsg}`);
        }
      }
      res.json(slot);
    } catch (error) {
      res.status(500).json({ message: "Failed to create time slot" });
    }
  });

  app.patch("/api/franchise-admin/time-slots/:id", isFranchiseAdmin, async (req: any, res) => {
    try {
      const slotId = parseInt(req.params.id);
      const franchiseId = req.franchiseId;
      const { coachId, classroomId } = req.body;

      if (!coachId) {
        return res.status(400).json({ message: "請指派老師" });
      }

      const slotList = await storage.getSlotsByFranchise(franchiseId);
      const slot = slotList.find((s) => s.id === slotId);
      if (!slot) return res.status(403).json({ message: "Forbidden" });

      const franchiseCoaches = await storage.getCoachesByFranchise(franchiseId);
      if (!franchiseCoaches.find((c) => c.id === coachId)) {
        return res.status(400).json({ message: "老師不屬於此分校" });
      }

      if (classroomId) {
        const allClassrooms = await storage.getClassroomsByFranchise(franchiseId);
        const cr = allClassrooms.find((c) => c.id === classroomId);
        if (!cr) {
          return res.status(400).json({ message: "教室不屬於此分校" });
        }

        const roomConflicts = await storage.getClassroomOverlappingSlots(classroomId, slot.date, slot.startTime, slot.endTime, slotId);
        if (roomConflicts.length > 0) {
          const detail = roomConflicts.map((s) => `${s.startTime}-${s.endTime}`).join("、");
          return res.status(409).json({
            message: `教室「${cr.name}」時段衝突：${slot.date} 已有時段 ${detail} 與此時段重疊`,
            type: "room_conflict",
            conflicts: roomConflicts,
          });
        }
      }

      const coachConflicts = await storage.getCoachOverlappingSlots(coachId, slot.date, slot.startTime, slot.endTime, slotId);
      if (coachConflicts.length > 0) {
        const detail = coachConflicts.map((s) => `${s.franchiseName} ${s.startTime}-${s.endTime}`).join("、");
        return res.status(409).json({
          message: `老師排課衝突：${slot.date} 老師已在 ${detail} 有排課`,
          type: "coach_conflict",
          conflicts: coachConflicts,
        });
      }

      const previousCoachId = slot.coachId;
      const updated = await storage.updateTimeSlotCoachAndClassroom(slotId, franchiseId, coachId, classroomId ?? null);

      if (coachId !== previousCoachId) {
        const coach = await storage.getCoach(coachId);
        if (coach?.userId) {
          const franchise = await storage.getFranchise(franchiseId);
          const notifMsg = `您在 ${updated.date} ${updated.startTime}-${updated.endTime}（${franchise?.name || "教室"}）有新的排課。`;
          await storage.createNotification({ userId: coach.userId, type: "slot_assigned", title: "新排課通知", message: notifMsg, isRead: false });
          const [coachUser] = await db.select({ lineUserId: users.lineUserId }).from(users).where(eq(users.id, coach.userId));
          if (coachUser?.lineUserId) await sendLineMessage(coachUser.lineUserId, `【質數教室】新排課通知\n${notifMsg}`);
        }
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "更新時段失敗" });
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

  app.get("/api/franchise-admin/time-slots/:slotId/students", isFranchiseAdmin, async (req: any, res) => {
    try {
      const slotId = parseInt(req.params.slotId);
      const slotList = await storage.getSlotsByFranchise(req.franchiseId);
      const slot = slotList.find((s) => s.id === slotId);
      if (!slot) return res.status(403).json({ message: "Forbidden" });
      const students = await storage.getSlotStudentList(slotId);
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch slot students" });
    }
  });

  app.delete("/api/franchise-admin/time-slots/:id", isFranchiseAdmin, async (req: any, res) => {
    try {
      const slotId = parseInt(req.params.id);
      const slotList = await storage.getSlotsByFranchise(req.franchiseId);
      const slot = slotList.find((s) => s.id === slotId);
      if (!slot) return res.status(403).json({ message: "Forbidden" });

      const now = new Date();
      const slotStart = new Date(`${slot.date}T${slot.startTime}:00+08:00`);
      if (now >= slotStart) {
        return res.status(403).json({ message: "課程已開始或結束，無法刪除" });
      }

      const activeBookings = await storage.getSlotBookings(slotId);
      const force = req.query.force === "true";

      const checkedInBookings = activeBookings.filter((b: any) => b.status === "checked_in");
      if (checkedInBookings.length > 0) {
        return res.status(403).json({ message: "此時段有學生正在上課，無法刪除" });
      }

      const confirmedBookings = activeBookings.filter((b: any) => b.status === "confirmed");
      if (confirmedBookings.length > 0 && !force) {
        return res.status(409).json({
          message: `此時段有 ${confirmedBookings.length} 位學生已預約`,
          bookingCount: confirmedBookings.length,
          bookings: confirmedBookings.map((b: any) => ({
            childName: b.childName,
            childGrade: b.childGrade,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
        });
      }

      if (confirmedBookings.length > 0) {
        await storage.cancelSlotBookingsAndNotify(slotId);
      }
      await storage.deleteSlot(slotId);

      if (slot.coachId) {
        const coach = await storage.getCoach(slot.coachId);
        if (coach?.userId) {
          const franchise = await storage.getFranchise(slot.franchiseId);
          const notifMsg = `您在 ${slot.date} ${slot.startTime}-${slot.endTime}（${franchise?.name || "教室"}）的排課已被取消。`;
          await storage.createNotification({ userId: coach.userId, type: "slot_removed", title: "排課已取消", message: notifMsg, isRead: false });
          const [coachUser] = await db.select({ lineUserId: users.lineUserId }).from(users).where(eq(users.id, coach.userId));
          if (coachUser?.lineUserId) await sendLineMessage(coachUser.lineUserId, `【質數教室】排課取消通知\n${notifMsg}`);
        }
      }

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

  // ========== Franchise Admin: Classroom Management ==========
  app.get("/api/franchise-admin/classrooms", isFranchiseAdmin, async (req: any, res) => {
    try {
      const list = await storage.getClassroomsByFranchise(req.franchiseId);
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch classrooms" });
    }
  });

  app.post("/api/franchise-admin/classrooms", isFranchiseAdmin, async (req: any, res) => {
    try {
      const { name } = req.body;
      if (!name || !name.trim()) return res.status(400).json({ message: "請輸入教室名稱" });
      const created = await storage.createClassroom({ name: name.trim(), franchiseId: req.franchiseId, isActive: true });
      res.json(created);
    } catch (error) {
      res.status(500).json({ message: "新增教室失敗" });
    }
  });

  app.patch("/api/franchise-admin/classrooms/:id", isFranchiseAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name } = req.body;
      if (!name || !name.trim()) return res.status(400).json({ message: "請輸入教室名稱" });
      const existing = await storage.getClassroomsByFranchise(req.franchiseId);
      if (!existing.find((c) => c.id === id)) return res.status(403).json({ message: "Forbidden" });
      const updated = await storage.updateClassroom(id, { name: name.trim() });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "更新教室失敗" });
    }
  });

  app.delete("/api/franchise-admin/classrooms/:id", isFranchiseAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getClassroomsByFranchise(req.franchiseId);
      if (!existing.find((c) => c.id === id)) return res.status(403).json({ message: "Forbidden" });
      const slotsUsingClassroom = await storage.getSlotsByClassroom(id);
      if (slotsUsingClassroom.length > 0) {
        return res.status(400).json({ message: `此教室仍有 ${slotsUsingClassroom.length} 個排課時段，無法刪除` });
      }
      await storage.deleteClassroom(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "刪除教室失敗" });
    }
  });

  app.get("/api/franchise-admin/available-students", isFranchiseAdmin, async (req: any, res) => {
    try {
      const students = await storage.getFranchiseStudents(req.franchiseId);
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/franchise-admin/students", isFranchiseAdmin, async (req: any, res) => {
    try {
      const students = await storage.getFranchiseStudents(req.franchiseId);
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post("/api/franchise-admin/students", isFranchiseAdmin, async (req: any, res) => {
    try {
      const { name, grade } = req.body;
      if (!name || typeof name !== "string" || !name.trim()) return res.status(400).json({ message: "學生姓名為必填" });
      const g = parseInt(grade);
      if (isNaN(g) || g < 1 || g > 6) return res.status(400).json({ message: "年級必須是 1-6" });
      const result = await storage.addFranchiseStudent(req.franchiseId, name.trim(), g);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to add student" });
    }
  });

  app.patch("/api/franchise-admin/students/:childId", isFranchiseAdmin, async (req: any, res) => {
    try {
      const childId = parseInt(req.params.childId);
      const franchiseStudents = await storage.getFranchiseStudents(req.franchiseId);
      const belongs = franchiseStudents.some((s: any) => s.id === childId);
      if (!belongs) return res.status(403).json({ message: "學生不屬於此分校" });
      const { name, grade, school, notes } = req.body;
      const updateData: Record<string, any> = {};
      if (name !== undefined) {
        if (!name.trim()) return res.status(400).json({ message: "姓名不得為空" });
        updateData.name = name.trim();
      }
      if (grade !== undefined) {
        const g = parseInt(grade);
        if (isNaN(g) || g < 1 || g > 6) return res.status(400).json({ message: "年級必須是 1-6" });
        updateData.grade = g;
      }
      if (school !== undefined) updateData.school = school.trim() || null;
      if (notes !== undefined) updateData.notes = notes.trim() || null;
      const updated = await storage.updateChild(childId, updateData);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update student" });
    }
  });

  app.delete("/api/franchise-admin/students/:childId", isFranchiseAdmin, async (req: any, res) => {
    try {
      const childId = parseInt(req.params.childId);
      await storage.removeFranchiseStudent(req.franchiseId, childId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to remove student" });
    }
  });

  app.get("/api/franchise-admin/students/:childId/bookings", isFranchiseAdmin, async (req: any, res) => {
    try {
      const childId = parseInt(req.params.childId);
      const result = await storage.getFranchiseStudentBookings(req.franchiseId, childId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student bookings" });
    }
  });

  app.get("/api/franchise-admin/students/:childId/contact-books", isFranchiseAdmin, async (req: any, res) => {
    try {
      const childId = parseInt(req.params.childId);
      const result = await storage.getFranchiseStudentContactBooks(req.franchiseId, childId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student contact books" });
    }
  });

  app.post("/api/franchise-admin/manual-booking", isFranchiseAdmin, async (req: any, res) => {
    try {
      const { slotId, childId, walkInName, walkInGrade, walkInSchool, overrideCapacity } = req.body;
      if (!slotId) return res.status(400).json({ message: "缺少時段資訊" });
      if (!childId && !walkInName) return res.status(400).json({ message: "請選擇學生或填寫臨時學生資料" });
      const result = await storage.createManualBookingExtended({
        slotId,
        franchiseId: req.franchiseId,
        childId: childId ? parseInt(childId) : undefined,
        walkInName,
        walkInGrade: walkInGrade ? parseInt(walkInGrade) : undefined,
        walkInSchool: walkInSchool || undefined,
        overrideCapacity: !!overrideCapacity,
      });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "加排失敗" });
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

      const existingCoachWithPhone = await db.select().from(coaches)
        .where(and(eq(coaches.phone, coach.phone), eq(coaches.isActive, true)))
        .then(rows => rows.find(c => c.id !== coachId && c.userId != null));

      if (existingCoachWithPhone && existingCoachWithPhone.userId) {
        const linkedUserId = existingCoachWithPhone.userId;
        const [linkedUser] = await db.select().from(users).where(eq(users.id, linkedUserId));
        if (linkedUser) {
          const updated = await storage.createCoachAccount(coachId, linkedUserId);
          return res.json({ ...updated, accountUsername: linkedUser.username, linked: true });
        }
      }

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
      res.json({ ...updated, accountUsername: username, linked: false });
    } catch (error) {
      res.status(500).json({ message: "建立帳號失敗" });
    }
  });

  app.delete("/api/franchise-admin/coaches/:id/account", isFranchiseAdmin, async (req: any, res) => {
    try {
      const coachId = parseInt(req.params.id);
      const coach = await storage.getCoach(coachId);
      if (!coach || coach.franchiseId !== req.franchiseId) return res.status(403).json({ message: "Forbidden" });
      if (!coach.userId) return res.status(400).json({ message: "此老師尚未連結帳號" });
      await storage.updateCoach(coachId, { userId: null } as any);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "解除連結失敗" });
    }
  });

  app.delete("/api/franchise-admin/coaches/:id/line", isFranchiseAdmin, async (req: any, res) => {
    try {
      const coachId = parseInt(req.params.id);
      const coach = await storage.getCoach(coachId);
      if (!coach || coach.franchiseId !== req.franchiseId) return res.status(403).json({ message: "Forbidden" });
      if (!coach.userId) return res.status(400).json({ message: "此老師尚未連結帳號" });
      await storage.updateUserLineUserId(coach.userId, null);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "解除 LINE 綁定失敗" });
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
      const userId = req.currentUser.id;
      const slots = await storage.getCoachSlotsByUserId(userId, year, month);
      res.json(slots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calendar" });
    }
  });

  app.get("/api/coach/slots/:slotId/students", isCoach, async (req: any, res) => {
    try {
      const slotId = parseInt(req.params.slotId);
      const slot = await storage.getTimeSlot(slotId);
      if (!slot) {
        return res.status(404).json({ message: "時段不存在" });
      }
      const coachOwnsSlot = req.coachIds.includes(slot.coachId);
      const franchiseMatch = slot.franchiseId && req.coachFranchiseIds.includes(slot.franchiseId);
      if (!coachOwnsSlot && !franchiseMatch) {
        console.error(`[slots/students] 403: coachIds=${JSON.stringify(req.coachIds)} franchiseIds=${JSON.stringify(req.coachFranchiseIds)} slot.coachId=${slot.coachId} slot.franchiseId=${slot.franchiseId} slotId=${slotId}`);
        return res.status(403).json({ message: "此時段不屬於您" });
      }
      if (!coachOwnsSlot && franchiseMatch) {
        console.warn(`[slots/students] franchise fallback: coachIds=${JSON.stringify(req.coachIds)} slot.coachId=${slot.coachId} slot.franchiseId=${slot.franchiseId} slotId=${slotId}`);
      }
      const students = await storage.getSlotStudents(slotId);
      res.json(students);
    } catch (error) {
      console.error("[slots/students]", error);
      res.status(500).json({ message: "讀取學生名單失敗" });
    }
  });

  app.patch("/api/coach/bookings/:id/check-in", isCoach, async (req: any, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);
      const slot = booking ? await storage.getTimeSlot(booking.slotId) : null;
      const effectiveCoachId = slot?.coachId && req.coachIds.includes(slot.coachId) ? slot.coachId : req.coach.id;
      await storage.checkInBooking(bookingId, effectiveCoachId);
      if (slot) {
        await storage.updateCoachDailyRecord(effectiveCoachId, slot.date);
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "點名失敗" });
    }
  });

  app.patch("/api/coach/bookings/:id/absent", isCoach, async (req: any, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);
      const slot = booking ? await storage.getTimeSlot(booking.slotId) : null;
      const effectiveCoachId = slot?.coachId && req.coachIds.includes(slot.coachId) ? slot.coachId : req.coach.id;
      await storage.markAbsentBooking(bookingId, effectiveCoachId);
      if (slot) {
        await storage.updateCoachDailyRecord(effectiveCoachId, slot.date);
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "標記未到失敗" });
    }
  });

  app.patch("/api/coach/bookings/:id/uncheck-in", isCoach, async (req: any, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);
      const slot = booking ? await storage.getTimeSlot(booking.slotId) : null;
      const effectiveCoachId = slot?.coachId && req.coachIds.includes(slot.coachId) ? slot.coachId : req.coach.id;
      await storage.uncheckInBooking(bookingId, effectiveCoachId);
      if (slot) {
        await storage.updateCoachDailyRecord(effectiveCoachId, slot.date);
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "取消點名失敗" });
    }
  });

  app.get("/api/coach/daily-record/:date", isCoach, async (req: any, res) => {
    try {
      const record = await storage.getCoachDailyRecordByCoachIds(req.coachIds, req.params.date);
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: "取得每日記錄失敗" });
    }
  });

  app.get("/api/coach/monthly-records/:year/:month", isCoach, async (req: any, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const records = await storage.getCoachMonthlyRecordsByCoachIds(req.coachIds, year, month);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "取得月度記錄失敗" });
    }
  });

  app.get("/api/coach/overdue-tasks", isCoach, async (req: any, res) => {
    try {
      const today = new Date();
      const results: any[] = [];
      for (let i = 1; i <= 14; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const record = await storage.getCoachDailyRecordByCoachIds(req.coachIds, dateStr);
        if (record.totalSlots > 0 && !record.isComplete) {
          results.push({ date: dateStr, totalSlots: record.totalSlots, checkedInSlots: record.checkedInSlots, contactBookSlots: record.contactBookSlots });
        }
      }
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "取得未完成任務失敗" });
    }
  });

  app.get("/api/coach/students", isCoach, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const students = await storage.getCoachStudentsByUserId(userId);
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/coach/students/:childId/history", isCoach, async (req: any, res) => {
    try {
      const childId = parseInt(req.params.childId);
      const history = await storage.getStudentContactBookHistoryByCoachIds(req.coachIds, childId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  // ========== Coach: Earnings ==========
  app.get("/api/coach/earnings", isCoach, async (req: any, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) return res.status(400).json({ message: "請提供日期範圍" });
      const stats = await storage.getCoachEarningsStatsByCoachIds(req.coachIds, startDate as string, endDate as string);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "取得收入統計失敗" });
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
      const slotsToUpdate = new Set<string>();
      for (const entry of entries) {
        let effectiveCoachId = req.coach.id;
        if (entry.bookingId) {
          const booking = await storage.getBooking(entry.bookingId);
          if (booking) {
            const slot = await storage.getTimeSlot(booking.slotId);
            if (!slot) continue;
            const coachOwnsSlot = req.coachIds.includes(slot.coachId);
            const franchiseMatch = slot.franchiseId && req.coachFranchiseIds.includes(slot.franchiseId);
            if (!coachOwnsSlot && !franchiseMatch) {
              console.error(`[contact-books POST] 403: coachIds=${JSON.stringify(req.coachIds)} franchiseIds=${JSON.stringify(req.coachFranchiseIds)} slot.coachId=${slot.coachId} slot.franchiseId=${slot.franchiseId} slotId=${slot.id}`);
              return res.status(403).json({ message: "此預約不屬於您的時段" });
            }
            effectiveCoachId = coachOwnsSlot ? slot.coachId! : req.coach.id;
            if (!coachOwnsSlot && franchiseMatch) {
              console.warn(`[contact-books POST] franchise fallback: coachIds=${JSON.stringify(req.coachIds)} slot.coachId=${slot.coachId} slot.franchiseId=${slot.franchiseId} slotId=${slot.id}`);
            }
            if (slot.date) {
              slotsToUpdate.add(`${slot.date}:${effectiveCoachId}`);
            }
          }
        }
        const created = await storage.createContactBook({
          ...entry,
          coachId: effectiveCoachId,
        });
        results.push(created);
      }
      for (const key of slotsToUpdate) {
        const [date, coachIdStr] = key.split(":");
        const effectiveCoachId = parseInt(coachIdStr) || req.coach.id;
        await storage.updateCoachDailyRecord(effectiveCoachId, date);
      }
      res.json(results);
    } catch (error) {
      console.error("[contact-books POST]", error);
      res.status(500).json({ message: "儲存聯絡簿失敗" });
    }
  });

  app.patch("/api/coach/contact-books/:id", isCoach, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getContactBook(id);
      if (!existing || !req.coachIds.includes(existing.coachId)) {
        return res.status(403).json({ message: "此聯絡簿不屬於您" });
      }
      const updated = await storage.updateContactBook(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("[contact-books PATCH]", error);
      res.status(500).json({ message: "更新聯絡簿失敗" });
    }
  });

  app.get("/api/coach/contact-books/slot/:slotId", isCoach, async (req: any, res) => {
    try {
      const slotId = parseInt(req.params.slotId);
      const slot = await storage.getTimeSlot(slotId);
      const effectiveCoachId = slot?.coachId && req.coachIds.includes(slot.coachId) ? slot.coachId : req.coach.id;
      const books = await storage.getContactBooksBySlot(slotId, effectiveCoachId);
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
      const imageUrl = req.file ? await uploadPublicFile(req.file.buffer, req.file.originalname, req.file.mimetype, "uploads") : null;
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
      if (req.file) data.imageUrl = await uploadPublicFile(req.file.buffer, req.file.originalname, req.file.mimetype, "uploads");
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

  app.post("/api/admin/site-content/upload-image", isAdmin, uploadSiteContent.single("image"), async (req: any, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "請選擇圖片" });
      const url = await uploadPublicFile(req.file.buffer, req.file.originalname, req.file.mimetype, "site-content");
      res.json({ url });
    } catch (error) {
      console.error("[site-content-upload]", error);
      res.status(500).json({ message: "圖片上傳失敗" });
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

  // ========== Credit System: Admin Routes (T003) ==========
  app.get("/api/admin/credit-packages", isAdmin, async (_req: any, res) => {
    try {
      const packages = await storage.getCreditPackages();
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: "取得堂數方案失敗" });
    }
  });

  app.post("/api/admin/credit-packages", isAdmin, async (req: any, res) => {
    try {
      const { name, credits, price, expiryDays, description, isActive, sortOrder } = req.body;
      if (!name || !credits || !price) return res.status(400).json({ message: "請填寫方案名稱、堂數和定價" });
      const pkg = await storage.createCreditPackage({ name, credits, price, expiryDays: expiryDays || null, description: description || null, isActive: isActive !== false, sortOrder: sortOrder || 0 });
      res.json(pkg);
    } catch (error) {
      res.status(500).json({ message: "建立堂數方案失敗" });
    }
  });

  app.patch("/api/admin/credit-packages/:id", isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const pkg = await storage.updateCreditPackage(id, req.body);
      res.json(pkg);
    } catch (error) {
      res.status(500).json({ message: "更新堂數方案失敗" });
    }
  });

  app.get("/api/admin/promotions", isAdmin, async (_req: any, res) => {
    try {
      const promos = await storage.getPromotions();
      res.json(promos);
    } catch (error) {
      res.status(500).json({ message: "取得優惠活動失敗" });
    }
  });

  app.post("/api/admin/promotions", isAdmin, async (req: any, res) => {
    try {
      const { name, description, discountType, discountValue, startDate, endDate, applicablePackageIds, isActive } = req.body;
      if (!name || !discountType || !discountValue || !startDate || !endDate) return res.status(400).json({ message: "請填寫所有必填欄位" });
      const promo = await storage.createPromotion({ name, description: description || null, discountType, discountValue, startDate, endDate, applicablePackageIds: applicablePackageIds || null, isActive: isActive !== false });
      res.json(promo);
    } catch (error) {
      res.status(500).json({ message: "建立優惠活動失敗" });
    }
  });

  app.patch("/api/admin/promotions/:id", isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const promo = await storage.updatePromotion(id, req.body);
      res.json(promo);
    } catch (error) {
      res.status(500).json({ message: "更新優惠活動失敗" });
    }
  });

  app.get("/api/admin/coupon-codes", isAdmin, async (_req: any, res) => {
    try {
      const coupons = await storage.getCouponCodes();
      res.json(coupons);
    } catch (error) {
      res.status(500).json({ message: "取得優惠碼失敗" });
    }
  });

  app.post("/api/admin/coupon-codes", isAdmin, async (req: any, res) => {
    try {
      const { code, discountType, discountValue, maxUses, minPurchaseAmount, validFrom, validUntil, isActive } = req.body;
      if (!code || !discountType || !discountValue) return res.status(400).json({ message: "請填寫優惠碼、折扣類型和折扣值" });
      const existing = await storage.getCouponByCode(code.toUpperCase());
      if (existing) return res.status(400).json({ message: "此優惠碼已存在" });
      const coupon = await storage.createCouponCode({ code: code.toUpperCase(), discountType, discountValue, maxUses: maxUses || null, minPurchaseAmount: minPurchaseAmount || null, validFrom: validFrom || null, validUntil: validUntil || null, isActive: isActive !== false });
      res.json(coupon);
    } catch (error) {
      res.status(500).json({ message: "建立優惠碼失敗" });
    }
  });

  app.patch("/api/admin/coupon-codes/:id", isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const coupon = await storage.updateCouponCode(id, req.body);
      res.json(coupon);
    } catch (error) {
      res.status(500).json({ message: "更新優惠碼失敗" });
    }
  });

  app.get("/api/admin/parent-wallets", isAdmin, async (_req: any, res) => {
    try {
      const parents = await db.select().from(users).where(eq(users.role, "parent"));
      const wallets = await Promise.all(parents.map(async (p) => {
        const balance = await storage.getParentBalance(p.id);
        return { parentId: p.id, parentName: p.firstName || p.username, username: p.username, balance };
      }));
      res.json(wallets);
    } catch (error) {
      res.status(500).json({ message: "取得家長錢包列表失敗" });
    }
  });

  app.post("/api/admin/adjust-credits", isAdmin, async (req: any, res) => {
    try {
      const { parentId, packageId, credits, description } = req.body;
      if (!parentId) return res.status(400).json({ message: "請選擇家長" });

      let creditAmount = credits;
      let expiresAt: Date | null = null;
      let finalAmount = 0;
      let pkgId = packageId || null;

      if (packageId) {
        const packages = await storage.getCreditPackages();
        const pkg = packages.find(p => p.id === packageId);
        if (!pkg) return res.status(400).json({ message: "方案不存在" });
        creditAmount = pkg.credits;
        finalAmount = pkg.price;
        if (pkg.expiryDays) {
          expiresAt = new Date(Date.now() + pkg.expiryDays * 24 * 60 * 60 * 1000);
        }
      }

      if (!creditAmount || creditAmount <= 0) return res.status(400).json({ message: "堂數必須大於 0" });

      const purchase = await storage.createCreditPurchase({
        parentId,
        packageId: pkgId,
        credits: creditAmount,
        originalAmount: finalAmount,
        discountAmount: 0,
        finalAmount,
        paymentMethod: "manual",
        paymentStatus: "paid",
        expiresAt,
      });

      const balance = await storage.addCredits(parentId, purchase.id, creditAmount, expiresAt);

      await storage.createCreditTransaction({
        parentId,
        type: "admin_adjust",
        credits: creditAmount,
        balanceId: balance.id,
        purchaseId: purchase.id,
        description: description || "總部手動加點",
      });

      const newBalance = await storage.getParentBalance(parentId);
      res.json({ success: true, purchase, newBalance });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "加點失敗" });
    }
  });

  app.get("/api/admin/credit-sales-stats", isAdmin, async (_req: any, res) => {
    try {
      const allPurchases = await db.select().from(creditPurchases).where(eq(creditPurchases.paymentStatus, "paid"));
      const totalRevenue = allPurchases.reduce((sum, p) => sum + p.finalAmount, 0);
      const totalCredits = allPurchases.reduce((sum, p) => sum + p.credits, 0);
      const totalPurchases = allPurchases.length;

      const packageStats = new Map<number, { name: string; count: number; credits: number; revenue: number }>();
      const packages = await storage.getCreditPackages();
      for (const pkg of packages) {
        packageStats.set(pkg.id, { name: pkg.name, count: 0, credits: 0, revenue: 0 });
      }
      for (const p of allPurchases) {
        if (p.packageId && packageStats.has(p.packageId)) {
          const stat = packageStats.get(p.packageId)!;
          stat.count++;
          stat.credits += p.credits;
          stat.revenue += p.finalAmount;
        }
      }

      const coupons = await storage.getCouponCodes();
      const couponStats = coupons.map(c => ({ code: c.code, uses: c.currentUses, maxUses: c.maxUses }));

      res.json({ totalRevenue, totalCredits, totalPurchases, packageStats: Array.from(packageStats.values()), couponStats });
    } catch (error) {
      res.status(500).json({ message: "取得銷售報表失敗" });
    }
  });

  app.get("/api/admin/ecpay-purchases", isAdmin, async (req: any, res) => {
    try {
      const status = typeof req.query.status === "string" && req.query.status ? req.query.status : undefined;
      const purchases = await storage.getEcpayPurchases(status);
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ message: "取得線上付款紀錄失敗" });
    }
  });

  app.post("/api/admin/ecpay-refund/:purchaseId", isAdmin, async (req: any, res) => {
    try {
      const purchaseId = parseInt(req.params.purchaseId);
      if (isNaN(purchaseId)) return res.status(400).json({ message: "無效的付款 ID" });

      const purchases = await storage.getEcpayPurchases();
      const purchase = purchases.find(p => p.id === purchaseId);
      if (!purchase) return res.status(404).json({ message: "找不到該付款紀錄" });
      if (purchase.paymentStatus !== "paid") return res.status(400).json({ message: "只有已付款的訂單可以退款" });
      if (!purchase.ecpayTradeNo) return res.status(400).json({ message: "缺少綠界訂單號，無法退款" });

      if (!purchase.ecpayInternalTradeNo) {
        return res.status(400).json({ message: "此訂單缺少綠界內部訂單號（可能為舊訂單或未完成收款），無法發起綠界退款。請聯絡技術人員處理。" });
      }

      const doActionParams: Record<string, string> = {
        MerchantID: ECPAY_MERCHANT_ID,
        MerchantTradeNo: purchase.ecpayTradeNo,
        TradeNo: purchase.ecpayInternalTradeNo,
        Action: "R",
        TotalAmount: String(purchase.finalAmount),
      };
      doActionParams.CheckMacValue = computeCheckMacValue(doActionParams);

      const ecpayDoActionUrl = ECPAY_IS_SANDBOX
        ? "https://payment-stage.ecpay.com.tw/CreditDetail/DoAction"
        : "https://payment.ecpay.com.tw/CreditDetail/DoAction";
      const formBody = new URLSearchParams(doActionParams).toString();
      const ecpayRes = await fetch(ecpayDoActionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody,
      });
      const ecpayText = await ecpayRes.text();
      console.log("[ecpay-refund] DoAction response:", ecpayText);

      const [rtnCode, rtnMsg] = ecpayText.split("|");
      if (rtnCode !== "1") {
        return res.status(502).json({ message: `綠界退款失敗：${rtnMsg || ecpayText}` });
      }

      const result = await storage.refundEcpayPurchase(purchaseId);
      res.json({ message: "退款成功", creditsDeducted: result.creditsDeducted, purchase: result.purchase });
    } catch (error: any) {
      console.error("[ecpay-refund] error:", error);
      res.status(500).json({ message: error.message || "退款失敗" });
    }
  });

  // ========== Textbook / Curriculum Management ==========
  app.get("/api/textbooks", isCredentialOrAuth, async (req: any, res) => {
    try {
      const items = await storage.getTextbooksWithFiles();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "取得教材失敗" });
    }
  });

  // POST upload PDF for textbook (admin only)
  // fileType: material | quiz_1 | quiz_2 | quiz_3 | quiz_4
  app.post("/api/admin/textbooks/:id/files/:fileType", isAdmin, (req, res, next) => {
    pdfUpload.single("file")(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message || "上傳失敗" });
      next();
    });
  }, async (req: any, res) => {
    try {
      const textbookId = parseInt(req.params.id);
      if (isNaN(textbookId)) return res.status(400).json({ message: "無效的教材 ID" });
      const fileType = req.params.fileType;
      const validTypes = ["material", "quiz_1", "quiz_2", "quiz_3", "quiz_4"];
      if (!validTypes.includes(fileType)) return res.status(400).json({ message: "無效的檔案類型" });
      if (!req.file) return res.status(400).json({ message: "請選擇 PDF 檔案" });

      const allTextbooks = await storage.getTextbooksWithFiles();
      if (!allTextbooks.find(t => t.id === textbookId)) return res.status(404).json({ message: "教材單元不存在" });

      const existing = await storage.getTextbookFile(textbookId, fileType);
      if (existing) {
        await deletePrivatePdf(existing.storedPath);
      }

      const storedPath = await uploadPrivatePdf(req.file.buffer, req.file.originalname);
      const file = await storage.upsertTextbookFile({
        textbookId,
        fileType,
        originalName: Buffer.from(req.file.originalname, 'latin1').toString('utf8'),
        storedPath,
        uploadedBy: req.currentUser?.id ?? null,
      });
      console.log("[textbook-upload] SUCCESS textbookId=%d fileType=%s file=%s", textbookId, fileType, storedPath);
      res.json(file);
    } catch (error) {
      console.error("[textbook-upload] FAILED:", error);
      res.status(500).json({ message: "上傳失敗" });
    }
  });

  // DELETE PDF file from textbook (admin only)
  app.delete("/api/admin/textbooks/:id/files/:fileType", isAdmin, async (req, res) => {
    try {
      const textbookId = parseInt(req.params.id);
      if (isNaN(textbookId)) return res.status(400).json({ message: "無效的教材 ID" });
      const fileType = req.params.fileType;
      const validTypes = ["material", "quiz_1", "quiz_2", "quiz_3", "quiz_4"];
      if (!validTypes.includes(fileType)) return res.status(400).json({ message: "無效的檔案類型" });
      const existing = await storage.getTextbookFile(textbookId, fileType);
      if (existing) {
        await deletePrivatePdf(existing.storedPath);
        await storage.deleteTextbookFile(textbookId, fileType);
      }
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "刪除失敗" });
    }
  });

  // GET serve textbook PDF file inline (authenticated users)
  app.get("/api/textbooks/:id/files/:fileType/view", isCredentialOrAuth, async (req, res) => {
    try {
      const textbookId = parseInt(req.params.id);
      if (isNaN(textbookId)) return res.status(400).json({ message: "無效的教材 ID" });
      const fileType = req.params.fileType;
      const validTypes = ["material", "quiz_1", "quiz_2", "quiz_3", "quiz_4"];
      if (!validTypes.includes(fileType)) return res.status(400).json({ message: "無效的檔案類型" });
      const file = await storage.getTextbookFile(textbookId, fileType);
      if (!file) return res.status(404).json({ message: "檔案不存在" });
      await streamPrivatePdf(file.storedPath, file.originalName, res);
    } catch {
      res.status(500).json({ message: "無法開啟檔案" });
    }
  });

  app.post("/api/admin/textbooks", isAdmin, async (req: any, res) => {
    try {
      const parsed = insertTextbookSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "資料格式錯誤", errors: parsed.error.flatten() });
      const created = await storage.createTextbook(parsed.data);
      res.json(created);
    } catch (error) {
      res.status(500).json({ message: "新增教材失敗" });
    }
  });

  app.patch("/api/admin/textbooks/:id", isAdmin, async (req: any, res) => {
    try {
      const partial = insertTextbookSchema.partial().safeParse(req.body);
      if (!partial.success) return res.status(400).json({ message: "資料格式錯誤", errors: partial.error.flatten() });
      const updated = await storage.updateTextbook(parseInt(req.params.id), partial.data);
      if (!updated) return res.status(404).json({ message: "教材不存在" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "更新教材失敗" });
    }
  });

  app.delete("/api/admin/textbooks/:id", isAdmin, async (req: any, res) => {
    try {
      await storage.deleteTextbook(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "刪除教材失敗" });
    }
  });

  app.post("/api/admin/textbooks/:id/quizzes", isAdmin, async (req: any, res) => {
    try {
      const parsed = insertTextbookQuizSchema.safeParse({ ...req.body, textbookId: parseInt(req.params.id) });
      if (!parsed.success) return res.status(400).json({ message: "資料格式錯誤", errors: parsed.error.flatten() });
      const created = await storage.createQuiz(parsed.data);
      res.json(created);
    } catch (error) {
      res.status(500).json({ message: "新增考卷失敗" });
    }
  });

  app.patch("/api/admin/quizzes/:id", isAdmin, async (req: any, res) => {
    try {
      const partial = insertTextbookQuizSchema.partial().safeParse(req.body);
      if (!partial.success) return res.status(400).json({ message: "資料格式錯誤", errors: partial.error.flatten() });
      const updated = await storage.updateQuiz(parseInt(req.params.id), partial.data);
      if (!updated) return res.status(404).json({ message: "考卷不存在" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "更新考卷失敗" });
    }
  });

  app.delete("/api/admin/quizzes/:id", isAdmin, async (req: any, res) => {
    try {
      await storage.deleteQuiz(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "刪除考卷失敗" });
    }
  });

  // ========== Credit System: Parent Routes (T004) ==========
  app.get("/api/parent/wallet", isCredentialOrAuth, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      if (req.currentUser.role !== "parent") return res.status(403).json({ message: "僅限家長使用" });
      const balance = await storage.getParentBalance(userId);
      const balances = await storage.getCreditBalances(userId);
      const now = new Date();
      const expiringBalances = balances
        .filter(b => b.expiresAt && b.remainingCredits > 0)
        .filter(b => {
          const daysLeft = Math.ceil((new Date(b.expiresAt!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return daysLeft <= 30 && daysLeft > 0;
        })
        .map(b => ({
          credits: b.remainingCredits,
          expiresAt: b.expiresAt,
          daysLeft: Math.ceil((new Date(b.expiresAt!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        }));
      res.json({ balance, balances, expiringBalances });
    } catch (error) {
      res.status(500).json({ message: "取得錢包資訊失敗" });
    }
  });

  app.get("/api/parent/transactions", isCredentialOrAuth, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      if (req.currentUser.role !== "parent") return res.status(403).json({ message: "僅限家長使用" });
      const transactions = await storage.getTransactionsByParent(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "取得交易紀錄失敗" });
    }
  });

  app.get("/api/credit-packages", async (_req, res) => {
    try {
      const packages = await storage.getActiveCreditPackages();
      const activePromotions = await storage.getActivePromotions();
      res.json({ packages, promotions: activePromotions });
    } catch (error) {
      res.status(500).json({ message: "取得堂數方案失敗" });
    }
  });

  app.post("/api/parent/validate-coupon", isCredentialOrAuth, async (req: any, res) => {
    try {
      if (req.currentUser.role !== "parent") return res.status(403).json({ message: "僅限家長使用" });
      const { code, amount } = req.body;
      if (!code) return res.status(400).json({ message: "請輸入優惠碼" });
      const coupon = await storage.getCouponByCode(code.toUpperCase());
      if (!coupon) return res.status(404).json({ message: "優惠碼不存在" });
      if (!coupon.isActive) return res.status(400).json({ message: "此優惠碼已停用" });
      if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) return res.status(400).json({ message: "此優惠碼已達使用上限" });
      const today = new Date().toISOString().split("T")[0];
      if (coupon.validFrom && today < coupon.validFrom) return res.status(400).json({ message: "此優惠碼尚未開始" });
      if (coupon.validUntil && today > coupon.validUntil) return res.status(400).json({ message: "此優惠碼已過期" });
      if (coupon.minPurchaseAmount && amount && amount < coupon.minPurchaseAmount) return res.status(400).json({ message: `最低消費金額為 $${coupon.minPurchaseAmount}` });

      let discount = 0;
      if (coupon.discountType === "fixed") {
        discount = coupon.discountValue;
      } else if (coupon.discountType === "percentage") {
        discount = amount ? Math.round(amount * coupon.discountValue / 100) : 0;
      }
      res.json({ valid: true, coupon: { id: coupon.id, code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue }, discount });
    } catch (error) {
      res.status(500).json({ message: "驗證優惠碼失敗" });
    }
  });

  // ─── Curriculum Management ──────────────────────────────────────
  // GET units (admin + authenticated coaches/franchise)
  app.get("/api/curriculum/units", isCredentialOrAuth, async (_req, res) => {
    try {
      const units = await storage.getCurriculumUnitsWithFiles();
      res.json(units);
    } catch {
      res.status(500).json({ message: "無法載入課程單元" });
    }
  });

  // POST create unit (admin only)
  app.post("/api/curriculum/units", isAdmin, async (req, res) => {
    try {
      const { courseCode, unitName, sortOrder } = req.body;
      if (!courseCode || !unitName) return res.status(400).json({ message: "課號和單元名稱為必填" });
      const unit = await storage.createCurriculumUnit({ courseCode, unitName, sortOrder: sortOrder ?? 0, isActive: true });
      res.json(unit);
    } catch {
      res.status(500).json({ message: "建立單元失敗" });
    }
  });

  // PATCH update unit (admin only)
  app.patch("/api/curriculum/units/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { courseCode, unitName, sortOrder } = req.body;
      const unit = await storage.updateCurriculumUnit(id, { courseCode, unitName, sortOrder });
      res.json(unit);
    } catch {
      res.status(500).json({ message: "更新單元失敗" });
    }
  });

  // DELETE unit (admin only) — also deletes its files
  app.delete("/api/curriculum/units/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const units = await storage.getCurriculumUnitsWithFiles();
      const unit = units.find(u => u.id === id);
      if (unit) {
        for (const f of unit.files) {
          const fullPath = path.join(process.cwd(), "uploads", "curriculum", path.basename(f.storedPath));
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }
      }
      await storage.deleteCurriculumUnit(id);
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "刪除單元失敗" });
    }
  });

  // POST upload file for unit (admin only)
  // fileType: material | quiz_1 | quiz_2 | quiz_3 | quiz_4
  app.post("/api/curriculum/units/:id/files/:fileType", isAdmin, (req, res, next) => {
    pdfUpload.single("file")(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message || "上傳失敗" });
      next();
    });
  }, async (req: any, res) => {
    try {
      const unitId = parseInt(req.params.id);
      const fileType = req.params.fileType;
      const validTypes = ["material", "quiz_1", "quiz_2", "quiz_3", "quiz_4"];
      if (!validTypes.includes(fileType)) return res.status(400).json({ message: "無效的檔案類型" });
      if (!req.file) return res.status(400).json({ message: "請選擇 PDF 檔案" });

      const unit = await storage.getCurriculumUnit(unitId);
      if (!unit) return res.status(404).json({ message: "單元不存在" });

      const existing = await storage.getCurriculumFile(unitId, fileType);
      if (existing) {
        await deletePrivatePdf(existing.storedPath);
      }

      const storedPath = await uploadPrivatePdf(req.file.buffer, req.file.originalname);
      const file = await storage.upsertCurriculumFile({
        unitId,
        fileType,
        originalName: Buffer.from(req.file.originalname, 'latin1').toString('utf8'),
        storedPath,
        uploadedBy: req.currentUser?.id ?? null,
      });
      res.json(file);
    } catch {
      res.status(500).json({ message: "上傳失敗" });
    }
  });

  // DELETE file from unit (admin only)
  app.delete("/api/curriculum/units/:id/files/:fileType", isAdmin, async (req, res) => {
    try {
      const unitId = parseInt(req.params.id);
      const fileType = req.params.fileType;
      const existing = await storage.getCurriculumFile(unitId, fileType);
      if (existing) {
        await deletePrivatePdf(existing.storedPath);
        await storage.deleteCurriculumFile(unitId, fileType);
      }
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "刪除失敗" });
    }
  });

  // GET serve PDF file inline (no download, any authenticated user)
  app.get("/api/curriculum/units/:id/files/:fileType/view", isCredentialOrAuth, async (req, res) => {
    try {
      const unitId = parseInt(req.params.id);
      const fileType = req.params.fileType;
      const file = await storage.getCurriculumFile(unitId, fileType);
      if (!file) return res.status(404).json({ message: "檔案不存在" });
      await streamPrivatePdf(file.storedPath, file.originalName, res);
    } catch {
      res.status(500).json({ message: "無法開啟檔案" });
    }
  });

  // ─── Midterm Exams ───────────────────────────────────────────────
  app.get("/api/curriculum/midterm-exams", isCredentialOrAuth, async (_req, res) => {
    try {
      const exams = await storage.getCurriculumMidtermExams();
      res.json(exams);
    } catch {
      res.status(500).json({ message: "無法載入期中考" });
    }
  });

  app.post("/api/curriculum/midterm-exams", isAdmin, (req, res, next) => {
    pdfUpload.single("file")(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message || "上傳失敗" });
      next();
    });
  }, async (req: any, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "請選擇 PDF 檔案" });
      const { title, semester, grade } = req.body;
      if (!title) return res.status(400).json({ message: "請輸入標題" });
      const storedPath = await uploadPrivatePdf(req.file.buffer, req.file.originalname);
      const exam = await storage.createCurriculumMidtermExam({
        title,
        semester: semester || null,
        grade: grade ? parseInt(grade) : null,
        originalName: Buffer.from(req.file.originalname, 'latin1').toString('utf8'),
        storedPath,
        uploadedBy: req.currentUser?.id ?? null,
      });
      res.json(exam);
    } catch {
      res.status(500).json({ message: "上傳失敗" });
    }
  });

  app.delete("/api/curriculum/midterm-exams/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const exam = await storage.getCurriculumMidtermExam(id);
      if (exam) {
        await deletePrivatePdf(exam.storedPath);
        await storage.deleteCurriculumMidtermExam(id);
      }
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "刪除失敗" });
    }
  });

  app.get("/api/curriculum/midterm-exams/:id/view", isCredentialOrAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const exam = await storage.getCurriculumMidtermExam(id);
      if (!exam) return res.status(404).json({ message: "找不到此考卷" });
      await streamPrivatePdf(exam.storedPath, exam.originalName, res);
    } catch {
      res.status(500).json({ message: "無法開啟檔案" });
    }
  });

  // ─── ECPay Payment Integration ──────────────────────────────────
  const ECPAY_MERCHANT_ID = process.env.ECPAY_MERCHANT_ID || "2000132";
  const ECPAY_HASH_KEY = process.env.ECPAY_HASH_KEY || "5294y06JbISpM5x9";
  const ECPAY_HASH_IV = process.env.ECPAY_HASH_IV || "v77hoKGq4kWxNNIS";
  const ECPAY_IS_SANDBOX = process.env.ECPAY_IS_SANDBOX !== "false";
  const ECPAY_AIO_URL = ECPAY_IS_SANDBOX
    ? "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5"
    : "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5";

  const domain = process.env.REPLIT_DOMAINS
    ? process.env.REPLIT_DOMAINS.split(",")[0]
    : "localhost:5000";

  function computeCheckMacValue(params: Record<string, string>): string {
    const p = { ...params };
    delete p.CheckMacValue;
    const sorted = Object.keys(p).sort();
    const queryStr = sorted.map(k => `${k}=${p[k]}`).join("&");
    const raw = `HashKey=${ECPAY_HASH_KEY}&${queryStr}&HashIV=${ECPAY_HASH_IV}`;
    const encoded = encodeURIComponent(raw)
      .toLowerCase()
      .replace(/%20/g, "+")
      .replace(/%21/g, "!")
      .replace(/%28/g, "(")
      .replace(/%29/g, ")")
      .replace(/%2a/g, "*");
    return crypto.createHash("sha256").update(encoded).digest("hex").toUpperCase();
  }

  app.post("/api/payment/ecpay/create", isCredentialOrAuth, async (req: any, res) => {
    try {
      if (req.currentUser.role !== "parent") return res.status(403).json({ message: "僅限家長使用" });
      const parentId = req.currentUser.id;
      const { packageId, couponId } = req.body;
      if (!packageId) return res.status(400).json({ message: "請選擇堂數方案" });

      const pkg = await storage.getActiveCreditPackages().then(pkgs => pkgs.find(p => p.id === Number(packageId)));
      if (!pkg) return res.status(404).json({ message: "找不到此方案" });

      let originalAmount = pkg.price;
      let discountAmount = 0;
      let couponDbId: number | null = null;
      let promotionId: number | null = null;

      const activePromotions = await storage.getActivePromotions();
      const now = new Date().toISOString().split("T")[0];
      const promo = activePromotions.find(p => {
        if (!p.isActive || p.startDate > now || p.endDate < now) return false;
        if (p.applicablePackageIds && p.applicablePackageIds.length > 0) {
          return p.applicablePackageIds.includes(Number(packageId));
        }
        return true;
      });

      if (promo) {
        promotionId = promo.id;
        if (promo.discountType === "percentage") {
          discountAmount = Math.round(originalAmount * promo.discountValue / 100);
        } else {
          discountAmount = Math.min(promo.discountValue, originalAmount);
        }
      }

      let couponDiscount = 0;
      if (couponId) {
        const coupon = await storage.getCouponByCode(String(couponId));
        if (!coupon) return res.status(400).json({ message: "優惠碼不存在" });
        if (!coupon.isActive) return res.status(400).json({ message: "此優惠碼已停用" });
        if (coupon.maxUses != null && coupon.currentUses >= coupon.maxUses) return res.status(400).json({ message: "此優惠碼已達使用上限" });
        const today = new Date().toISOString().split("T")[0];
        if (coupon.validFrom && today < coupon.validFrom) return res.status(400).json({ message: "此優惠碼尚未開始" });
        if (coupon.validUntil && today > coupon.validUntil) return res.status(400).json({ message: "此優惠碼已過期" });
        const discountedSoFar = originalAmount - discountAmount;
        if (coupon.minPurchaseAmount != null && discountedSoFar < coupon.minPurchaseAmount) return res.status(400).json({ message: `最低消費金額為 $${coupon.minPurchaseAmount}` });
        couponDbId = coupon.id;
        if (coupon.discountType === "fixed") {
          couponDiscount = coupon.discountValue;
        } else if (coupon.discountType === "percentage") {
          couponDiscount = Math.round(discountedSoFar * coupon.discountValue / 100);
        }
      }
      discountAmount += couponDiscount;
      const finalAmount = Math.max(1, originalAmount - discountAmount);

      const now2 = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const tradeDate = `${now2.getFullYear()}/${pad(now2.getMonth() + 1)}/${pad(now2.getDate())} ${pad(now2.getHours())}:${pad(now2.getMinutes())}:${pad(now2.getSeconds())}`;

      const purchase = await storage.createCreditPurchase({
        parentId,
        packageId: pkg.id,
        credits: pkg.credits,
        originalAmount,
        discountAmount,
        finalAmount,
        promotionId,
        couponId: couponDbId,
        paymentMethod: "ecpay",
        paymentStatus: "pending",
        ecpayTradeNo: null,
        expiresAt: pkg.expiryDays ? new Date(Date.now() + pkg.expiryDays * 86400 * 1000) : null,
      });

      const merchantTradeNo = `P${purchase.id}T${Date.now().toString().slice(-8)}`.slice(0, 20);
      await storage.updatePurchaseStatusAndTradeNo(purchase.id, "pending", merchantTradeNo);

      const params: Record<string, string> = {
        MerchantID: ECPAY_MERCHANT_ID,
        MerchantTradeNo: merchantTradeNo,
        MerchantTradeDate: tradeDate,
        PaymentType: "aio",
        TotalAmount: String(finalAmount),
        TradeDesc: "質數教室堂數購買",
        ItemName: `${pkg.name} ${pkg.credits}堂`,
        ReturnURL: `https://${domain}/api/payment/ecpay/notify`,
        OrderResultURL: `https://${domain}/api/payment/ecpay/return`,
        ChoosePayment: "Credit",
        EncryptType: "1",
      };
      params.CheckMacValue = computeCheckMacValue(params);

      res.json({ actionUrl: ECPAY_AIO_URL, params });
    } catch (error) {
      console.error("ECPay create error:", error);
      res.status(500).json({ message: "建立付款失敗" });
    }
  });

  app.post("/api/payment/ecpay/notify", async (req, res) => {
    try {
      const body = req.body as Record<string, string>;
      const { CheckMacValue, RtnCode, MerchantTradeNo } = body;

      const computedMac = computeCheckMacValue(body);
      if (computedMac !== CheckMacValue) {
        console.error("ECPay notify: CheckMacValue mismatch", { computedMac, received: CheckMacValue });
        return res.status(200).send("0|CheckMacValue Error");
      }

      if (RtnCode !== "1") {
        const failedPurchase = await storage.getCreditPurchaseByTradeNo(MerchantTradeNo);
        if (failedPurchase && failedPurchase.paymentStatus === "pending") {
          await storage.updatePurchaseStatus(failedPurchase.id, "failed");
        }
        return res.status(200).send("1|OK");
      }

      const existingPurchase = await storage.getCreditPurchaseByTradeNo(MerchantTradeNo);
      if (!existingPurchase) {
        console.error("ECPay notify: purchase not found for", MerchantTradeNo);
        return res.status(200).send("1|OK");
      }

      const pkg = existingPurchase.packageId
        ? await storage.getActiveCreditPackages().then(pkgs => pkgs.find(p => p.id === existingPurchase.packageId))
        : null;

      const expiresAt = pkg?.expiryDays
        ? new Date(Date.now() + pkg.expiryDays * 86400 * 1000)
        : null;

      const ecpayInternalTradeNo = typeof body.TradeNo === "string" ? body.TradeNo : undefined;
      const purchase = await storage.atomicMarkPaidAndAddCredits(MerchantTradeNo, expiresAt, ecpayInternalTradeNo);
      if (!purchase) {
        return res.status(200).send("1|OK");
      }

      if (purchase.couponId) {
        await storage.incrementCouponUsage(purchase.couponId);
      }

      return res.status(200).send("1|OK");
    } catch (error) {
      console.error("ECPay notify error:", error);
      return res.status(200).send("1|OK");
    }
  });

  const handleEcpayReturn = (req: any, res: any) => {
    const data = req.method === "POST" ? req.body : req.query;
    const { RtnCode } = data as Record<string, string>;
    const status = RtnCode === "1" ? "success" : "fail";
    res.redirect(`/parent?tab=credits&payment=${status}`);
  };
  app.get("/api/payment/ecpay/return", handleEcpayReturn);
  app.post("/api/payment/ecpay/return", handleEcpayReturn);

  return httpServer;
}
