import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { sendLineMessage } from "./line";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

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
