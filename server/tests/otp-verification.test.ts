import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from "vitest";
import express from "express";
import { createServer } from "http";
import request from "supertest";

// ──────────────────────────────────────────────────────────────────────────────
// 安全防護回歸測試：手機簡訊 OTP 發送 / 驗證流程
//
// 背景：先前有「萬用驗證碼」與「強制略過 Twilio」的後門被移除。本測試鎖定以下行為，
// 確保未來不會再被悄悄加回：
//   1. 設有 Twilio 憑證時（等同 production 設定），發送與驗證一律走真實 Twilio（此處 mock）。
//   2. 任何「萬用碼」都不會被特別放行——驗證結果完全取決於 Twilio 的回傳。
//   3. 非開發環境且缺少 Twilio 憑證時，發送會明確失敗，不會偽造 OTP。
//   4. 速率限制（60 秒內不可重複發送）。
// ──────────────────────────────────────────────────────────────────────────────

// 在匯入 routes 之前就設定 Twilio 憑證，讓 hasTwilioCredentials() 於請求時回傳 true，
// 如此 sendTwilioOtp / checkTwilioOtp 一律走 Twilio 分支（不論 isDev 為何）。
process.env.TWILIO_ACCOUNT_SID = "ACtest_otp_suite";
process.env.TWILIO_AUTH_TOKEN = "test_auth_token";
process.env.TWILIO_VERIFY_SERVICE_SID = "VAtest_otp_suite";

// 可被各測試控制的 Twilio mock 狀態
const twilioMock = {
  verificationsCreate: vi.fn(async (_args: any) => ({ status: "pending" })),
  verificationChecksCreate: vi.fn(async (_args: any) => ({ status: "pending" })),
};

vi.mock("twilio", () => {
  const factory = (_sid: string, _token: string) => ({
    verify: {
      v2: {
        services: (_serviceSid: string) => ({
          verifications: {
            create: (args: any) => twilioMock.verificationsCreate(args),
          },
          verificationChecks: {
            create: (args: any) => twilioMock.verificationChecksCreate(args),
          },
        }),
      },
    },
  });
  return { default: factory };
});

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

import { registerRoutes, __resetOtpThrottleStores } from "../routes";
import { db } from "../db";
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

afterAll(() => {
  delete process.env.TWILIO_ACCOUNT_SID;
  delete process.env.TWILIO_AUTH_TOKEN;
  delete process.env.TWILIO_VERIFY_SERVICE_SID;
});

const createdUserIds: string[] = [];

beforeEach(() => {
  twilioMock.verificationsCreate.mockReset();
  twilioMock.verificationsCreate.mockResolvedValue({ status: "pending" });
  twilioMock.verificationChecksCreate.mockReset();
  twilioMock.verificationChecksCreate.mockResolvedValue({ status: "pending" });
  // 模組層級的限流 / 鎖定 Map 會跨測試累積，需在每個測試前清空避免互相污染。
  __resetOtpThrottleStores();
});

afterEach(async () => {
  for (const uid of createdUserIds) {
    await db.delete(users).where(eq(users.id, uid)).catch(() => {});
  }
  createdUserIds.length = 0;
});

function authAs(userId: string) {
  return { "x-test-session-user-id": userId };
}

// 每個測試用不重複的手機號碼，避免 module-level 的速率限制 store 互相污染。
let phoneCounter = 0;
function uniquePhone(): string {
  phoneCounter += 1;
  const suffix = String(phoneCounter).padStart(7, "0");
  return `09${suffix}`.slice(0, 10).padEnd(10, "0");
}

async function createParent(suffix: string, opts: { lineRegistrationComplete: boolean } = { lineRegistrationComplete: false }) {
  const id = `ts361_parent_${suffix}`;
  const [user] = await db
    .insert(users)
    .values({
      id,
      username: id,
      phone: "0900000361",
      role: "parent",
      lineRegistrationComplete: opts.lineRegistrationComplete,
    })
    .returning();
  createdUserIds.push(user.id);
  return user;
}

describe("POST /api/send-otp — 發送驗證碼一律走 Twilio", () => {
  it("有效手機號碼時，呼叫 Twilio verifications.create 並回傳成功", async () => {
    const phone = uniquePhone();
    const res = await request(testApp).post("/api/send-otp").send({ phone });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("驗證碼已發送");
    expect(twilioMock.verificationsCreate).toHaveBeenCalledTimes(1);
    const arg = twilioMock.verificationsCreate.mock.calls[0][0];
    expect(arg.channel).toBe("sms");
    expect(arg.to).toBe("+886" + phone.slice(1));
  });

  it("手機號碼格式不正確時，回傳 400 且不呼叫 Twilio", async () => {
    const res = await request(testApp).post("/api/send-otp").send({ phone: "12345" });
    expect(res.status).toBe(400);
    expect(twilioMock.verificationsCreate).not.toHaveBeenCalled();
  });

  it("缺少手機號碼時，回傳 400 且不呼叫 Twilio", async () => {
    const res = await request(testApp).post("/api/send-otp").send({});
    expect(res.status).toBe(400);
    expect(twilioMock.verificationsCreate).not.toHaveBeenCalled();
  });

  it("60 秒內對同一號碼重複發送時，回傳 429（速率限制）", async () => {
    const phone = uniquePhone();
    const first = await request(testApp).post("/api/send-otp").send({ phone });
    expect(first.status).toBe(200);

    const second = await request(testApp).post("/api/send-otp").send({ phone });
    expect(second.status).toBe(429);
    expect(second.body.message).toMatch(/秒後再重新發送/);
    // 第二次因速率限制被擋下，Twilio 只應被呼叫一次。
    expect(twilioMock.verificationsCreate).toHaveBeenCalledTimes(1);
  });

  it("Twilio 發送拋出錯誤時，回傳 500 並帶出錯誤訊息", async () => {
    const phone = uniquePhone();
    twilioMock.verificationsCreate.mockRejectedValueOnce(new Error("簡訊發送失敗（錯誤碼 99999），請稍後再試。"));
    const res = await request(testApp).post("/api/send-otp").send({ phone });
    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/簡訊發送失敗/);
  });
});

describe("POST /api/auth/line/send-otp — LINE 註冊流程發送驗證碼", () => {
  it("未登入時回傳 401，且不呼叫 Twilio", async () => {
    const res = await request(testApp).post("/api/auth/line/send-otp").send({ phone: uniquePhone() });
    expect(res.status).toBe(401);
    expect(twilioMock.verificationsCreate).not.toHaveBeenCalled();
  });

  it("已登入且手機有效時，呼叫 Twilio 並回傳成功", async () => {
    const parent = await createParent(`${Date.now().toString(36)}a`);
    const phone = uniquePhone();
    const res = await request(testApp)
      .post("/api/auth/line/send-otp")
      .set(authAs(parent.id))
      .send({ phone });

    expect(res.status).toBe(200);
    expect(twilioMock.verificationsCreate).toHaveBeenCalledTimes(1);
  });

  it("已登入但手機格式錯誤時，回傳 400 且不呼叫 Twilio", async () => {
    const parent = await createParent(`${Date.now().toString(36)}b`);
    const res = await request(testApp)
      .post("/api/auth/line/send-otp")
      .set(authAs(parent.id))
      .send({ phone: "not-a-phone" });

    expect(res.status).toBe(400);
    expect(twilioMock.verificationsCreate).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/line/confirm-otp — 驗證碼確認一律以 Twilio 為準（無萬用碼後門）", () => {
  it("Twilio 回傳 approved 時，驗證通過並標記 lineRegistrationComplete=true", async () => {
    const parent = await createParent(`${Date.now().toString(36)}c`, { lineRegistrationComplete: false });
    const phone = uniquePhone();
    twilioMock.verificationChecksCreate.mockResolvedValueOnce({ status: "approved" });

    const res = await request(testApp)
      .post("/api/auth/line/confirm-otp")
      .set(authAs(parent.id))
      .send({ phone, otp: "654321" });

    expect(res.status).toBe(200);
    expect(twilioMock.verificationChecksCreate).toHaveBeenCalledTimes(1);
    expect(twilioMock.verificationChecksCreate.mock.calls[0][0].code).toBe("654321");

    const [row] = await db
      .select({ lineRegistrationComplete: users.lineRegistrationComplete, phone: users.phone })
      .from(users)
      .where(eq(users.id, parent.id));
    expect(row.lineRegistrationComplete).toBe(true);
    expect(row.phone).toBe(phone);
  });

  it("Twilio 回傳 pending（驗證碼錯誤）時，回傳 400 且不標記完成", async () => {
    const parent = await createParent(`${Date.now().toString(36)}d`, { lineRegistrationComplete: false });
    const phone = uniquePhone();
    twilioMock.verificationChecksCreate.mockResolvedValueOnce({ status: "pending" });

    const res = await request(testApp)
      .post("/api/auth/line/confirm-otp")
      .set(authAs(parent.id))
      .send({ phone, otp: "111111" });

    expect(res.status).toBe(400);
    const [row] = await db
      .select({ lineRegistrationComplete: users.lineRegistrationComplete })
      .from(users)
      .where(eq(users.id, parent.id));
    expect(row.lineRegistrationComplete).toBe(false);
  });

  it.each(["000000", "123456", "999999", "888888"])(
    "舊「萬用碼」%s 不會被特別放行：Twilio 拒絕則一律回傳 400",
    async (masterCandidate) => {
      const parent = await createParent(`${Date.now().toString(36)}_${masterCandidate}`, { lineRegistrationComplete: false });
      const phone = uniquePhone();
      // Twilio 對任何碼都回傳非 approved
      twilioMock.verificationChecksCreate.mockResolvedValue({ status: "pending" });

      const res = await request(testApp)
        .post("/api/auth/line/confirm-otp")
        .set(authAs(parent.id))
        .send({ phone, otp: masterCandidate });

      expect(res.status).toBe(400);
      // 證明該碼確實被送往 Twilio 驗證，而非被本地後門攔截放行
      expect(twilioMock.verificationChecksCreate).toHaveBeenCalled();
      const calledCodes = twilioMock.verificationChecksCreate.mock.calls.map((c) => c[0].code);
      expect(calledCodes).toContain(masterCandidate);

      const [row] = await db
        .select({ lineRegistrationComplete: users.lineRegistrationComplete })
        .from(users)
        .where(eq(users.id, parent.id));
      expect(row.lineRegistrationComplete).toBe(false);
    },
  );

  it("未登入時回傳 401，且不呼叫 Twilio 驗證", async () => {
    const res = await request(testApp)
      .post("/api/auth/line/confirm-otp")
      .send({ phone: uniquePhone(), otp: "123456" });
    expect(res.status).toBe(401);
    expect(twilioMock.verificationChecksCreate).not.toHaveBeenCalled();
  });

  it("缺少 otp 時，回傳 400 且不呼叫 Twilio 驗證", async () => {
    const parent = await createParent(`${Date.now().toString(36)}e`, { lineRegistrationComplete: false });
    const res = await request(testApp)
      .post("/api/auth/line/confirm-otp")
      .set(authAs(parent.id))
      .send({ phone: uniquePhone() });
    expect(res.status).toBe(400);
    expect(twilioMock.verificationChecksCreate).not.toHaveBeenCalled();
  });

  it("Twilio 驗證拋出錯誤時，回傳 500", async () => {
    const parent = await createParent(`${Date.now().toString(36)}f`, { lineRegistrationComplete: false });
    twilioMock.verificationChecksCreate.mockRejectedValueOnce(new Error("簡訊服務認證失敗，請聯絡系統管理員。"));
    const res = await request(testApp)
      .post("/api/auth/line/confirm-otp")
      .set(authAs(parent.id))
      .send({ phone: uniquePhone(), otp: "123456" });
    expect(res.status).toBe(500);
  });
});

describe("防簡訊轟炸：同一來源（IP）短時間針對多個號碼大量發送的限流", () => {
  it("同一來源在視窗內連續對不同號碼發送，超過上限後回 429 且不再呼叫 Twilio", async () => {
    const MAX = 5; // 對應 routes.ts 的 OTP_SOURCE_MAX_SENDS
    // 前 MAX 次（每次都用不同號碼以避開「同號碼 60 秒」限制）皆應成功。
    for (let i = 0; i < MAX; i++) {
      const res = await request(testApp).post("/api/send-otp").send({ phone: uniquePhone() });
      expect(res.status).toBe(200);
    }
    expect(twilioMock.verificationsCreate).toHaveBeenCalledTimes(MAX);

    // 第 MAX+1 次（仍為全新號碼，不受單號碼限流影響）應被來源限流擋下。
    const blocked = await request(testApp).post("/api/send-otp").send({ phone: uniquePhone() });
    expect(blocked.status).toBe(429);
    expect(blocked.body.message).toMatch(/發送次數過多/);
    // 被擋下時不應再多打一次 Twilio。
    expect(twilioMock.verificationsCreate).toHaveBeenCalledTimes(MAX);
  });

  it("每次變造 X-Forwarded-For 假 IP 仍無法繞過來源限流", async () => {
    // 測試用 app 未設定 trust proxy（預設 false），req.ip 取實際連線位址而非 X-Forwarded-For，
    // 因此即使每次請求帶不同的偽造 X-Forwarded-For，來源仍視為同一個 → 仍受限流。
    const MAX = 5;
    for (let i = 0; i < MAX; i++) {
      const res = await request(testApp)
        .post("/api/send-otp")
        .set("X-Forwarded-For", `203.0.113.${i + 1}`)
        .send({ phone: uniquePhone() });
      expect(res.status).toBe(200);
    }
    const blocked = await request(testApp)
      .post("/api/send-otp")
      .set("X-Forwarded-For", "203.0.113.250")
      .send({ phone: uniquePhone() });
    expect(blocked.status).toBe(429);
    expect(blocked.body.message).toMatch(/發送次數過多/);
    expect(twilioMock.verificationsCreate).toHaveBeenCalledTimes(MAX);
  });

  it("LINE 流程的 send-otp 同樣以登入使用者為來源套用限流", async () => {
    const MAX = 5;
    const parent = await createParent(`${Date.now().toString(36)}_src`);
    for (let i = 0; i < MAX; i++) {
      const res = await request(testApp)
        .post("/api/auth/line/send-otp")
        .set(authAs(parent.id))
        .send({ phone: uniquePhone() });
      expect(res.status).toBe(200);
    }
    const blocked = await request(testApp)
      .post("/api/auth/line/send-otp")
      .set(authAs(parent.id))
      .send({ phone: uniquePhone() });
    expect(blocked.status).toBe(429);
    expect(blocked.body.message).toMatch(/發送次數過多/);
    expect(twilioMock.verificationsCreate).toHaveBeenCalledTimes(MAX);
  });
});

describe("防暴力猜碼：confirm-otp 連續錯誤的鎖定 / 退避機制", () => {
  it("同一號碼連續錯誤達上限後鎖定，回 429 且不再呼叫 Twilio 驗證", async () => {
    const MAX = 5; // 對應 routes.ts 的 OTP_CONFIRM_MAX_FAILS
    const parent = await createParent(`${Date.now().toString(36)}_lock`, { lineRegistrationComplete: false });
    const phone = uniquePhone();
    twilioMock.verificationChecksCreate.mockResolvedValue({ status: "pending" });

    // 前 MAX 次錯誤皆回 400（驗證碼不正確），並都實際送往 Twilio。
    for (let i = 0; i < MAX; i++) {
      const res = await request(testApp)
        .post("/api/auth/line/confirm-otp")
        .set(authAs(parent.id))
        .send({ phone, otp: "111111" });
      expect(res.status).toBe(400);
    }
    expect(twilioMock.verificationChecksCreate).toHaveBeenCalledTimes(MAX);

    // 第 MAX+1 次應被鎖定：回 429，且不再呼叫 Twilio。
    const locked = await request(testApp)
      .post("/api/auth/line/confirm-otp")
      .set(authAs(parent.id))
      .send({ phone, otp: "111111" });
    expect(locked.status).toBe(429);
    expect(locked.body.message).toMatch(/錯誤次數過多/);
    expect(twilioMock.verificationChecksCreate).toHaveBeenCalledTimes(MAX);
  });

  it("驗證成功後清除失敗計數：少於上限的錯誤不會在成功後殘留導致誤鎖", async () => {
    const parent = await createParent(`${Date.now().toString(36)}_clear`, { lineRegistrationComplete: false });
    const phone = uniquePhone();

    // 先錯 2 次。
    twilioMock.verificationChecksCreate.mockResolvedValue({ status: "pending" });
    for (let i = 0; i < 2; i++) {
      const res = await request(testApp)
        .post("/api/auth/line/confirm-otp")
        .set(authAs(parent.id))
        .send({ phone, otp: "111111" });
      expect(res.status).toBe(400);
    }

    // 接著一次成功，應清除累積失敗計數。
    twilioMock.verificationChecksCreate.mockResolvedValueOnce({ status: "approved" });
    const ok = await request(testApp)
      .post("/api/auth/line/confirm-otp")
      .set(authAs(parent.id))
      .send({ phone, otp: "654321" });
    expect(ok.status).toBe(200);

    const [row] = await db
      .select({ lineRegistrationComplete: users.lineRegistrationComplete })
      .from(users)
      .where(eq(users.id, parent.id));
    expect(row.lineRegistrationComplete).toBe(true);
  });
});

describe("非開發環境缺少 Twilio 憑證時，發送會明確失敗（不偽造 OTP）", () => {
  it("NODE_ENV 非 development 且缺憑證時，/api/send-otp 回傳 500 並提示未設定", async () => {
    // isDev 於 routes 模組載入時依 NODE_ENV 決定；vitest 預設 NODE_ENV=test，故 isDev=false。
    if (process.env.NODE_ENV === "development") {
      // 開發環境下會走 dev fallback，此安全性斷言不適用，直接跳過。
      return;
    }
    const saved = {
      sid: process.env.TWILIO_ACCOUNT_SID,
      token: process.env.TWILIO_AUTH_TOKEN,
      service: process.env.TWILIO_VERIFY_SERVICE_SID,
    };
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_VERIFY_SERVICE_SID;
    try {
      const res = await request(testApp).post("/api/send-otp").send({ phone: uniquePhone() });
      expect(res.status).toBe(500);
      expect(res.body.message).toMatch(/簡訊服務未設定/);
      expect(twilioMock.verificationsCreate).not.toHaveBeenCalled();
    } finally {
      process.env.TWILIO_ACCOUNT_SID = saved.sid;
      process.env.TWILIO_AUTH_TOKEN = saved.token;
      process.env.TWILIO_VERIFY_SERVICE_SID = saved.service;
    }
  });
});
