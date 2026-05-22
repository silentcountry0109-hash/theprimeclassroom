import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { sendLineMessage, sendLineFlexMessage, buildCoachDailySummaryFlex } from "./line";

const app = express();
const httpServer = createServer(app);

app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  },
}));

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  const { storage } = await import("./storage");
  const completedCount = await storage.completeExpiredBookings();
  if (completedCount > 0) {
    log(`auto-completed ${completedCount} expired bookings`);
  }

  // Seed default policy content if not yet set
  try {
    const { db } = await import("./db");
    const { siteContent } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const defaultPolicies: Record<string, string> = {
      "privacy_policy": "# 隱私權政策\n\n本平台（質數教室）重視您的隱私權，並致力於保護您的個人資料。\n\n## 資料蒐集\n我們蒐集您在使用本平台時所提供的個人資料，包括姓名、電話、電子信箱等，僅用於提供教育服務及相關通知。\n\n## 資料使用\n您的個人資料將用於：\n- 提供課程預約及管理服務\n- 傳送課程提醒及相關通知\n- 改善本平台之服務品質\n\n## 資料保護\n我們採用業界標準的安全措施保護您的個人資料，未經您的同意，我們不會將您的個人資料提供給第三方。\n\n## 聯絡我們\n如有任何關於隱私權的問題，請聯絡 hello@primemath.tw。",
      "refund_policy": "# 退費規則\n\n## 堂數退費\n1. 購買後尚未使用之堂數，可於購買日起 7 日內申請全額退費。\n2. 超過 7 日後，每堂按原始購買單價退還剩餘堂數金額，並扣除行政手續費 NT$100。\n3. 透過促銷活動或優惠碼購得之加贈堂數，不適用退費。\n\n## 退費申請流程\n1. 請透過 LINE 官方帳號或 Email 提出退費申請。\n2. 我們將於 3 個工作日內完成審核。\n3. 退款將原路退回，處理時間依各銀行規定（約 7-14 個工作日）。\n\n## 注意事項\n- 已使用之堂數恕不退費。\n- 如因平台系統因素導致課程無法進行，將全額退還該堂費用。\n\n如有疑問，請聯絡 hello@primemath.tw。",
    };
    for (const [key, value] of Object.entries(defaultPolicies)) {
      const [existing] = await db.select({ id: siteContent.id }).from(siteContent).where(eq(siteContent.sectionKey, key)).limit(1);
      if (!existing) {
        await db.insert(siteContent).values({ sectionKey: key, value }).onConflictDoNothing();
      }
    }
  } catch (e) {
    log(`startup policy seed failed: ${e}`);
  }

  // Startup migration: backfill coaches.phone -> users.phone for existing accounts
  try {
    const { db } = await import("./db");
    const { coaches, users } = await import("@shared/schema");
    const { and, isNotNull, eq } = await import("drizzle-orm");
    const allCoaches = await db.select().from(coaches)
      .where(and(isNotNull(coaches.userId), isNotNull(coaches.phone)));
    let backfilled = 0;
    for (const coach of allCoaches) {
      if (!coach.userId || !coach.phone) continue;
      const [user] = await db.select({ id: users.id, phone: users.phone })
        .from(users).where(eq(users.id, coach.userId)).limit(1);
      if (user && !user.phone) {
        await db.update(users).set({ phone: coach.phone, updatedAt: new Date() }).where(eq(users.id, coach.userId));
        backfilled++;
      }
    }
    log(`startup backfill: synced phone for ${backfilled} coach account(s)`);
  } catch (e) {
    log(`startup backfill failed: ${e}`);
  }

  setInterval(async () => {
    try {
      const count = await storage.completeExpiredBookings();
      if (count > 0) {
        log(`auto-completed ${count} expired bookings`);
      }
    } catch (e) {
    }
  }, 60 * 1000);

  // ─── 上課前 2 小時提醒 cron job ───────────────────────────────────────────
  const notifiedBookingIds = new Set<number>();

  async function runPreClassReminder() {
    try {
      const { db } = await import("./db");
      const { bookings, timeSlots, users: usersTable, children: childrenTable, coaches: coachesTable, franchises: franchisesTable } = await import("@shared/schema");
      const { eq, and, inArray } = await import("drizzle-orm");

      const nowTw = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Taipei" }));

      // 目標時間 = 台灣現在 + 2 小時；以目標時間的日期作為查詢基準，自然處理跨午夜情境
      const target = new Date(nowTw.getTime() + 2 * 60 * 60 * 1000);
      const targetDateStr = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-${String(target.getDate()).padStart(2, "0")}`;

      // 視窗 ±30 分鐘（以台灣時間的小時/分鐘計算）
      const winStart = new Date(target.getTime() - 30 * 60 * 1000);
      const winEnd = new Date(target.getTime() + 30 * 60 * 1000);
      const pad2 = (n: number) => String(n).padStart(2, "0");
      const winStartStr = `${pad2(winStart.getHours())}:${pad2(winStart.getMinutes())}`;
      const winEndStr = `${pad2(winEnd.getHours())}:${pad2(winEnd.getMinutes())}`;

      // 查詢目標日期的 confirmed 預約
      const rows = await db
        .select({
          bookingId: bookings.id,
          parentId: bookings.parentId,
          childId: bookings.childId,
          slotStart: timeSlots.startTime,
          slotEnd: timeSlots.endTime,
          franchiseId: timeSlots.franchiseId,
          coachId: timeSlots.coachId,
        })
        .from(bookings)
        .innerJoin(timeSlots, eq(bookings.slotId, timeSlots.id))
        .where(
          and(
            eq(timeSlots.date, targetDateStr),
            inArray(bookings.status, ["confirmed"]),
          )
        );

      // 篩選在提醒視窗內的預約（時間字串比較，課程時間通常在 08:00–22:00 不跨午夜）
      const inWindow = rows.filter((r) => {
        const t = r.slotStart || "";
        return t >= winStartStr && t <= winEndStr;
      });

      for (const row of inWindow) {
        if (!row.parentId || notifiedBookingIds.has(row.bookingId)) continue;
        notifiedBookingIds.add(row.bookingId);

        try {
          const [parentRow] = await db
            .select({ lineUserId: usersTable.lineUserId })
            .from(usersTable)
            .where(eq(usersTable.id, row.parentId));
          if (!parentRow?.lineUserId) continue;

          // 取得孩子名字
          let childName = "孩子";
          if (row.childId) {
            const [childRow] = await db.select({ name: childrenTable.name }).from(childrenTable).where(eq(childrenTable.id, row.childId));
            childName = childRow?.name || "孩子";
          }

          // 取得老師名字
          let coachName = "";
          if (row.coachId) {
            const [coachRow] = await db.select({ name: coachesTable.name }).from(coachesTable).where(eq(coachesTable.id, row.coachId));
            coachName = coachRow?.name || "";
          }

          // 取得分校名字
          let franchiseName = "教室";
          if (row.franchiseId) {
            const [frRow] = await db.select({ name: franchisesTable.name }).from(franchisesTable).where(eq(franchisesTable.id, row.franchiseId));
            franchiseName = frRow?.name || "教室";
          }

          const msg = `【質數教室】⏰ 上課提醒\n${childName} 今天 ${row.slotStart}–${row.slotEnd} 有課${coachName ? `\n老師：${coachName}` : ""}\n地點：${franchiseName}\n請準時出席！`;
          await sendLineMessage(parentRow.lineUserId, msg);
          log(`[PreClassReminder] 已提醒 parentId=${row.parentId} bookingId=${row.bookingId}`);
        } catch (e) {
          log(`[PreClassReminder] 提醒失敗 bookingId=${row.bookingId}: ${e}`);
        }
      }
    } catch (e) {
      log(`[PreClassReminder] cron 執行失敗: ${e}`);
    }
  }

  runPreClassReminder();
  setInterval(runPreClassReminder, 60 * 60 * 1000);
  // ─────────────────────────────────────────────────────────────────────────

  // ─── 每晚 20:00 老師課程摘要推播 ─────────────────────────────────────────
  async function runCoachDailySummary() {
    try {
      const { db } = await import("./db");
      const { timeSlots: timeSlotsTable, coaches: coachesTable, users: usersTable } = await import("@shared/schema");
      const { eq, and } = await import("drizzle-orm");
      const { storage: storageInst } = await import("./storage");

      // 取得台灣「明天」日期字串（依據 UTC+8 固定偏移計算，不依賴 server 時區）
      const taiwanOffsetMs = 8 * 60 * 60 * 1000;
      const nowTaiwanMs = Date.now() + taiwanOffsetMs;
      const msInDay = 24 * 60 * 60 * 1000;
      const tomorrowTaiwanMs = nowTaiwanMs + msInDay;
      const tomorrowStr = new Date(tomorrowTaiwanMs).toISOString().split("T")[0];

      log(`[CoachDailySummary] 查詢明日（${tomorrowStr}）課程…`);

      // 清除 90 天前的舊推播紀錄，避免資料庫無限增長（每次觸發必執行，不受有無課程影響）
      try {
        const RETENTION_DAYS = 90;
        const cutoffMs = Date.now() + 8 * 60 * 60 * 1000 - RETENTION_DAYS * 24 * 60 * 60 * 1000;
        const cutoffDate = new Date(cutoffMs).toISOString().split("T")[0];
        const deleted = await storageInst.deleteOldCoachReminderLogs(cutoffDate);
        if (deleted > 0) {
          log(`[CoachDailySummary] 已清除 ${deleted} 筆 ${cutoffDate} 之前的舊推播紀錄`);
        }
      } catch (e) {
        log(`[CoachDailySummary] 清除舊推播紀錄失敗: ${e}`);
      }

      // 查詢隔天所有有老師的時段
      const rows = await db
        .select({
          coachId: coachesTable.id,
          coachUserId: coachesTable.userId,
          slotId: timeSlotsTable.id,
          startTime: timeSlotsTable.startTime,
          endTime: timeSlotsTable.endTime,
          bookedSeats: timeSlotsTable.bookedSeats,
        })
        .from(timeSlotsTable)
        .innerJoin(coachesTable, eq(timeSlotsTable.coachId, coachesTable.id))
        .where(
          and(
            eq(timeSlotsTable.date, tomorrowStr),
            eq(timeSlotsTable.isActive, true),
          )
        );

      if (rows.length === 0) {
        log(`[CoachDailySummary] 明日無課程，跳過`);
        return;
      }

      // 以老師分組
      const byCoach = new Map<number, typeof rows>();
      for (const row of rows) {
        if (!byCoach.has(row.coachId)) byCoach.set(row.coachId, []);
        byCoach.get(row.coachId)!.push(row);
      }

      // 計算明天星期幾（台灣時間）
      const weekdayLabels = ["日", "一", "二", "三", "四", "五", "六"];
      const [, tMonth, tDay] = tomorrowStr.split("-").map(Number);
      const weekday = weekdayLabels[new Date(`${tomorrowStr}T00:00:00+08:00`).getDay()];
      const tomorrowLabel = `${tMonth}/${tDay}（${weekday}）`;

      for (const [coachId, coachSlots] of byCoach.entries()) {
        // 查詢 DB 確認是否已發送過（重啟後仍有效）
        const alreadySent = await storageInst.hasCoachReminderLog(coachId, tomorrowStr, "daily_summary");
        if (alreadySent) continue;

        const firstRow = coachSlots[0];
        if (!firstRow.coachUserId) continue;

        const totalStudents = coachSlots.reduce((sum, s) => sum + (s.bookedSeats || 0), 0);

        const notifMsg = `明日（${tomorrowLabel}）有 ${coachSlots.length} 堂課，共 ${totalStudents} 位學生`;

        try {
          await storageInst.createNotification({
            userId: firstRow.coachUserId,
            type: "pre_class_reminder",
            title: "明日課程摘要",
            message: notifMsg,
          });
          const [coachUser] = await db
            .select({ lineUserId: usersTable.lineUserId })
            .from(usersTable)
            .where(eq(usersTable.id, firstRow.coachUserId));
          if (coachUser?.lineUserId) {
            const flex = buildCoachDailySummaryFlex({
              date: tomorrowLabel,
              slots: coachSlots.map(s => ({ startTime: s.startTime, endTime: s.endTime, bookedSeats: s.bookedSeats || 0 })),
            });
            await sendLineFlexMessage(coachUser.lineUserId, flex.altText, flex.contents);
          }
          // 成功後才寫入 DB 紀錄，確保失敗時可重試；伺服器重啟後同樣有效
          await storageInst.createCoachReminderLog(coachId, tomorrowStr, "daily_summary");
          log(`[CoachDailySummary] 已通知老師 coachId=${coachId}`);
        } catch (e) {
          log(`[CoachDailySummary] 老師 coachId=${coachId} 通知失敗: ${e}`);
        }
      }
    } catch (e) {
      log(`[CoachDailySummary] 執行失敗: ${e}`);
    }
  }

  function scheduleCoachDailySummary() {
    // 使用 UTC+8 固定偏移計算距離下次台灣 20:00 的毫秒數（不依賴 server 時區）
    const taiwanOffsetMs = 8 * 60 * 60 * 1000;
    const nowUtcMs = Date.now();
    const nowTaiwanMs = nowUtcMs + taiwanOffsetMs;
    const msInDay = 24 * 60 * 60 * 1000;
    const todayTaiwanStartMs = nowTaiwanMs - (nowTaiwanMs % msInDay);
    const target20hTaiwanMs = todayTaiwanStartMs + 20 * 60 * 60 * 1000;
    let targetTaiwanMs = target20hTaiwanMs;
    if (nowTaiwanMs >= target20hTaiwanMs) {
      targetTaiwanMs = target20hTaiwanMs + msInDay; // 已過 20:00，排到明天
    }
    const delayMs = targetTaiwanMs - nowTaiwanMs;
    const minutesUntil = Math.round(delayMs / 60000);
    log(`[CoachDailySummary] 下次排程在 ${minutesUntil} 分鐘後（台灣時間 20:00）`);
    setTimeout(async () => {
      await runCoachDailySummary();
      scheduleCoachDailySummary();
    }, delayMs);
  }

  scheduleCoachDailySummary();
  // ─────────────────────────────────────────────────────────────────────────

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
