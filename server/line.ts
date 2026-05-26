// ─── Token 自動管理 ────────────────────────────────────────────────────────
let _cachedToken: string | null = null;
let _tokenExpiresAt = 0;

export async function getLineToken(): Promise<string | null> {
  // 如果快取 token 還有 1 小時以上則直接使用
  if (_cachedToken && Date.now() < _tokenExpiresAt - 3600_000) return _cachedToken;

  // 自動用 Messaging API Channel ID + Secret 取 short-lived token
  const channelId = process.env.LINE_MESSAGING_CHANNEL_ID || "2009852161";
  const channelSecret = process.env.LINE_MESSAGING_CHANNEL_SECRET;
  if (!channelSecret) { console.error("[LINE] 缺少 LINE_MESSAGING_CHANNEL_SECRET"); return null; }

  try {
    const res = await fetch("https://api.line.me/v2/oauth/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${channelId}&client_secret=${channelSecret}`,
    });
    if (!res.ok) { console.error("[LINE] Token 取得失敗:", await res.text()); return null; }
    const data = await res.json() as { access_token: string; expires_in: number };
    _cachedToken = data.access_token;
    _tokenExpiresAt = Date.now() + data.expires_in * 1000;
    console.log(`[LINE] 已自動取得 Access Token (expires in ${Math.floor(data.expires_in / 86400)} 天)`);
    return _cachedToken;
  } catch (err) {
    console.error("[LINE] Token 取得失敗:", err);
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────

export async function sendLineMessage(lineUserId: string, message: string): Promise<void> {
  const token = await getLineToken();
  if (!token || !lineUserId) return;
  try {
    const res = await fetch("https://api.line.me/v2/bot/message/multicast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: [lineUserId],
        messages: [{ type: "text", text: message }],
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[LINE Push] API error ${res.status}:`, body);
    }
  } catch (err) {
    console.error("[LINE Push] Failed:", err);
  }
}

export async function sendLineFlexMessage(
  lineUserId: string,
  altText: string,
  contents: object
): Promise<void> {
  const token = await getLineToken();
  if (!token || !lineUserId) return;
  try {
    const res = await fetch("https://api.line.me/v2/bot/message/multicast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: [lineUserId],
        messages: [{ type: "flex", altText, contents }],
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[LINE Flex] API error ${res.status}:`, body);
    } else {
      console.log(`[LINE Flex] Sent OK: ${altText}`);
    }
  } catch (err) {
    console.error("[LINE Flex] Failed:", err);
  }
}

export async function sendLineFlexMessages(
  lineUserId: string,
  messages: Array<{ altText: string; contents: object }>
): Promise<void> {
  const token = await getLineToken();
  if (!token || !lineUserId) return;
  const MULTICAST_URL = "https://api.line.me/v2/bot/message/multicast";
  const reqBody = JSON.stringify({
    to: [lineUserId],
    messages: messages.map(({ altText, contents }) => ({
      type: "flex",
      altText,
      contents,
    })),
  });
  console.log(`[LINE Flex Multi] calling ${MULTICAST_URL} with ${messages.length} msgs, token[0:10]=${token.slice(0,10)}, bodyLen=${reqBody.length}`);
  try {
    const res = await fetch(MULTICAST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: reqBody,
    });
    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[LINE Flex Multi] API error ${res.status}:`, errBody);
      // 若 403，清除快取 token 並重試一次
      if (res.status === 403) {
        console.log("[LINE Flex Multi] 清除 token 快取並重試...");
        _cachedToken = null;
        _tokenExpiresAt = 0;
        const freshToken = await getLineToken();
        if (freshToken) {
          const res2 = await fetch(MULTICAST_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${freshToken}` },
            body: reqBody,
          });
          if (!res2.ok) {
            console.error(`[LINE Flex Multi] 重試失敗 ${res2.status}:`, await res2.text());
          } else {
            console.log(`[LINE Flex Multi] 重試成功！Sent ${messages.length} messages`);
          }
        }
      }
    } else {
      console.log(`[LINE Flex Multi] Sent ${messages.length} messages OK`);
    }
  } catch (err) {
    console.error("[LINE Flex Multi] Failed:", err);
  }
}

export async function sendLineReplyFlex(
  replyToken: string,
  altText: string,
  contents: object
): Promise<boolean> {
  const token = await getLineToken();
  if (!token) { console.error("[LINE Reply Flex] No access token, cannot send reply"); return false; }
  try {
    const res = await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        replyToken,
        messages: [{ type: "flex", altText, contents }],
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[LINE Reply Flex] API error ${res.status}:`, body);
      return false;
    }
    console.log("[LINE Reply Flex] Sent OK:", altText);
    return true;
  } catch (err) {
    console.error("[LINE Reply Flex] Failed:", err);
    return false;
  }
}

export async function sendLineReply(replyToken: string, message: string): Promise<boolean> {
  const token = await getLineToken();
  if (!token) { console.error("[LINE Reply] No access token, cannot send reply"); return false; }
  try {
    const res = await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        replyToken,
        messages: [{ type: "text", text: message }],
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[LINE Reply] API error ${res.status}:`, body);
      return false;
    }
    console.log("[LINE Reply] Sent OK:", message.slice(0, 30));
    return true;
  } catch (err) {
    console.error("[LINE Reply] Failed:", err);
    return false;
  }
}

const BASE = process.env.APP_BASE_URL
  || (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : "https://the-prime-math.replit.app");

function infoRow(label: string, value: string, valueColor = "#2C2C2C", strikethrough = false): object {
  return {
    type: "box",
    layout: "horizontal",
    spacing: "sm",
    contents: [
      { type: "text", text: label, color: "#AAAAAA", size: "xs", flex: 0 },
      {
        type: "text",
        text: value,
        color: valueColor,
        size: "sm",
        flex: 1,
        decoration: strikethrough ? "line-through" : "none",
      },
    ],
  };
}

function separator(): object {
  return { type: "separator", margin: "sm", color: "#F0F0F0" };
}

// ────────────────────────────────────────────────────────────────────────────

export function buildBookingSuccessFlex(params: {
  childName: string;
  date: string;
  time: string;
  teacher: string;
  location: string;
  credits: number;
  bookingUrl?: string;
}): { altText: string; contents: object } {
  return {
    altText: `✅ 課程預約成功！${params.childName} ${params.date} ${params.time}`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#81D8D0",
        paddingAll: "12px",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "✅  課程預約成功！", color: "#FFFFFF", size: "sm", weight: "bold", flex: 1 },
            ],
          },
          { type: "text", text: "The Prime 質數教室", color: "#FFFFFFBB", size: "xxs", margin: "xs" },
        ],
      },
      hero: {
        type: "image",
        url: `${BASE}/ip-character.png`,
        size: "full",
        aspectMode: "fit",
        aspectRatio: "3:2",
        backgroundColor: "#E8FAF9",
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        paddingAll: "12px",
        contents: [
          infoRow("孩子", params.childName, "#4FBDB4"),
          separator(),
          infoRow("📅 日期", params.date),
          infoRow("🕙 時間", params.time),
          infoRow("👩‍🏫 老師", params.teacher),
          infoRow("📍 地點", params.location),
          separator(),
          {
            type: "box",
            layout: "horizontal",
            spacing: "sm",
            contents: [
              { type: "text", text: "剩餘", color: "#AAAAAA", size: "xs", flex: 0 },
              {
                type: "box",
                layout: "horizontal",
                flex: 1,
                contents: [
                  {
                    type: "box",
                    layout: "baseline",
                    flex: 0,
                    backgroundColor: "#FFF8E1",
                    borderColor: "#FFE082",
                    borderWidth: "1px",
                    cornerRadius: "20px",
                    paddingTop: "2px",
                    paddingBottom: "2px",
                    paddingStart: "8px",
                    paddingEnd: "8px",
                    contents: [
                      {
                        type: "text",
                        text: `🎫 ${params.credits} 堂`,
                        color: "#E65100",
                        size: "xs",
                        weight: "bold",
                        flex: 0,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "10px",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#81D8D0",
            height: "sm",
            action: {
              type: "uri",
              label: "查看預約詳情 →",
              uri: params.bookingUrl ?? `${BASE}/`,
            },
          },
        ],
      },
    },
  };
}

export function buildPreClassReminderFlex(params: {
  childName: string;
  date: string;
  time: string;
  teacher: string;
  location: string;
  hoursUntil: number;
  bookingUrl?: string;
}): { altText: string; contents: object } {
  return {
    altText: `⏰ 上課提醒：${params.childName} 今天 ${params.time}`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#FFB7B2",
        paddingAll: "12px",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "⏰  上課提醒", color: "#FFFFFF", size: "sm", weight: "bold", flex: 1 },
            ],
          },
          { type: "text", text: `距離開課還有 ${params.hoursUntil} 小時`, color: "#FFFFFFBB", size: "xxs", margin: "xs" },
        ],
      },
      hero: {
        type: "image",
        url: `${BASE}/ip-reminder.png`,
        size: "full",
        aspectMode: "fit",
        aspectRatio: "3:2",
        backgroundColor: "#FFF4F3",
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        paddingAll: "12px",
        contents: [
          infoRow("孩子", params.childName, "#F0847C"),
          separator(),
          infoRow("📅 今天", params.date),
          infoRow("🕙 時間", params.time),
          infoRow("👩‍🏫 老師", params.teacher),
          infoRow("📍 地點", params.location),
          separator(),
          {
            type: "text",
            text: "🙌 請提前 10 分鐘抵達，今天的課程已準備好囉！",
            color: "#888888",
            size: "xs",
            wrap: true,
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "10px",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#FFB7B2",
            height: "sm",
            action: {
              type: "uri",
              label: "查看課程資訊 →",
              uri: params.bookingUrl ?? `${BASE}/`,
            },
          },
        ],
      },
    },
  };
}

export function buildRecurringBookingFlex(params: {
  childName: string;
  totalCount: number;
  slots: string[];
  moreCount: number;
  credits: number;
  bookingUrl?: string;
}): { altText: string; contents: object } {
  const slotItems = params.slots.map((s) => ({
    type: "text",
    text: `• ${s}`,
    color: "#555555",
    size: "xs",
    wrap: true,
  }));
  if (params.moreCount > 0) {
    slotItems.push({
      type: "text",
      text: `…等共 ${params.totalCount} 堂`,
      color: "#AAAAAA",
      size: "xs",
      wrap: true,
    });
  }
  return {
    altText: `✅ 連排預約成功！${params.childName} 共 ${params.totalCount} 堂`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#81D8D0",
        paddingAll: "12px",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "✅  連排預約成功！", color: "#FFFFFF", size: "sm", weight: "bold", flex: 1 },
            ],
          },
          { type: "text", text: `${params.childName} 共預約 ${params.totalCount} 堂`, color: "#FFFFFFBB", size: "xxs", margin: "xs" },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        paddingAll: "12px",
        contents: [
          infoRow("孩子", params.childName, "#4FBDB4"),
          separator(),
          ...slotItems,
          separator(),
          {
            type: "box",
            layout: "horizontal",
            spacing: "sm",
            contents: [
              { type: "text", text: "剩餘", color: "#AAAAAA", size: "xs", flex: 0 },
              {
                type: "box",
                layout: "horizontal",
                flex: 1,
                contents: [
                  {
                    type: "box",
                    layout: "baseline",
                    flex: 0,
                    backgroundColor: "#FFF8E1",
                    borderColor: "#FFE082",
                    borderWidth: "1px",
                    cornerRadius: "20px",
                    paddingTop: "2px",
                    paddingBottom: "2px",
                    paddingStart: "8px",
                    paddingEnd: "8px",
                    contents: [
                      {
                        type: "text",
                        text: `🎫 ${params.credits} 堂`,
                        color: "#E65100",
                        size: "xs",
                        weight: "bold",
                        flex: 0,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "10px",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#81D8D0",
            height: "sm",
            action: {
              type: "uri",
              label: "查看預約詳情 →",
              uri: params.bookingUrl ?? `${BASE}/`,
            },
          },
        ],
      },
    },
  };
}

export function buildManualBookingFlex(params: {
  childName: string;
  date: string;
  time: string;
  teacher: string;
  location: string;
  bookingUrl?: string;
}): { altText: string; contents: object } {
  return {
    altText: `✅ 課程已加排！${params.childName} ${params.date} ${params.time}`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#388E3C",
        paddingAll: "12px",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "✅  課程已加排！", color: "#FFFFFF", size: "sm", weight: "bold", flex: 1 },
            ],
          },
          { type: "text", text: "The Prime 質數教室", color: "#FFFFFFBB", size: "xxs", margin: "xs" },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        paddingAll: "12px",
        contents: [
          infoRow("孩子", params.childName, "#2E7D32"),
          separator(),
          infoRow("📅 日期", params.date),
          infoRow("🕙 時間", params.time),
          infoRow("👩‍🏫 老師", params.teacher),
          infoRow("📍 地點", params.location),
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "10px",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#388E3C",
            height: "sm",
            action: {
              type: "uri",
              label: "查看預約詳情 →",
              uri: params.bookingUrl ?? `${BASE}/`,
            },
          },
        ],
      },
    },
  };
}

export function buildContactBookFlex(params: {
  childName: string;
  teacher: string;
  date: string;
  bookingUrl?: string;
}): { altText: string; contents: object } {
  return {
    altText: `📒 聯絡簿通知：${params.childName} 今日課後記錄已填寫`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#E65100",
        paddingAll: "12px",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "📒  聯絡簿通知", color: "#FFFFFF", size: "sm", weight: "bold", flex: 1 },
            ],
          },
          { type: "text", text: "課後學習記錄已更新", color: "#FFFFFFBB", size: "xxs", margin: "xs" },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        paddingAll: "12px",
        contents: [
          infoRow("孩子", params.childName, "#E65100"),
          separator(),
          infoRow("📅 日期", params.date),
          infoRow("👩‍🏫 老師", params.teacher),
          separator(),
          {
            type: "text",
            text: "🎯 老師已完成今日課後紀錄，請至 App 查看詳情！",
            color: "#888888",
            size: "xs",
            wrap: true,
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "10px",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#E65100",
            height: "sm",
            action: {
              type: "uri",
              label: "查看聯絡簿 →",
              uri: params.bookingUrl ?? `${BASE}/`,
            },
          },
        ],
      },
    },
  };
}

export interface CoachWelcomeConfig {
  altText?: string;
  headerTitle?: string;
  bodySubtitle?: string;
  step1?: string;
  step2?: string;
  step3?: string;
  footerHint?: string;
}

export function buildWelcomeBindingFlex(cfg: CoachWelcomeConfig = {}): { altText: string; contents: object } {
  const altText = cfg.altText || "歡迎加入質數教室！請依步驟完成帳號綁定";
  const headerTitle = cfg.headerTitle || "👋  歡迎加入質數教室！";
  const bodySubtitle = cfg.bodySubtitle || "完成帳號綁定，即可收到課程通知！";
  const step1 = cfg.step1 || "① 直接在這個聊天室輸入您在質數教室登記的手機號碼";
  const step2 = cfg.step2 || "② 系統自動驗證並完成綁定";
  const step3 = cfg.step3 || "③ 之後即可收到課程提醒、聯絡簿等通知";
  const footerHint = cfg.footerHint || "請直接在下方輸入您的手機號碼 ↓";
  return {
    altText,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#81D8D0",
        paddingAll: "14px",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: headerTitle,
                color: "#FFFFFF",
                size: "sm",
                weight: "bold",
                flex: 1,
              },
            ],
          },
          {
            type: "text",
            text: "The Prime 質數教室",
            color: "#FFFFFFBB",
            size: "xxs",
            margin: "xs",
          },
        ],
      },
      hero: {
        type: "image",
        url: `${BASE}/ip-character.png`,
        size: "full",
        aspectMode: "fit",
        aspectRatio: "3:2",
        backgroundColor: "#E8FAF9",
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        paddingAll: "14px",
        contents: [
          {
            type: "text",
            text: bodySubtitle,
            color: "#2C2C2C",
            size: "sm",
            weight: "bold",
            wrap: true,
          },
          {
            type: "separator",
            margin: "sm",
            color: "#F0F0F0",
          },
          {
            type: "text",
            text: "📋 綁定步驟",
            color: "#4FBDB4",
            size: "sm",
            weight: "bold",
            margin: "sm",
          },
          {
            type: "text",
            text: step1,
            color: "#555555",
            size: "xs",
            wrap: true,
          },
          {
            type: "text",
            text: step2,
            color: "#555555",
            size: "xs",
            wrap: true,
            margin: "xs",
          },
          {
            type: "text",
            text: step3,
            color: "#555555",
            size: "xs",
            wrap: true,
            margin: "xs",
          },
          {
            type: "separator",
            margin: "sm",
            color: "#F0F0F0",
          },
          {
            type: "text",
            text: "📌 手機號碼格式範例",
            color: "#4FBDB4",
            size: "sm",
            weight: "bold",
            margin: "sm",
          },
          {
            type: "box",
            layout: "vertical",
            backgroundColor: "#F4FFFE",
            cornerRadius: "6px",
            paddingAll: "8px",
            margin: "xs",
            contents: [
              {
                type: "text",
                text: "0912345678",
                color: "#2C2C2C",
                size: "md",
                weight: "bold",
                align: "center",
              },
            ],
          },
          {
            type: "text",
            text: "（09 開頭，共 10 位數，不含空格或符號）",
            color: "#AAAAAA",
            size: "xxs",
            wrap: true,
            margin: "xs",
            align: "center",
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "10px",
        contents: [
          {
            type: "text",
            text: footerHint,
            color: "#4FBDB4",
            size: "xs",
            align: "center",
            weight: "bold",
          },
        ],
      },
    },
  };
}

export function buildNewVisitorWelcomeFlex(): { altText: string; contents: object } {
  return {
    altText: "歡迎加入質數教室！立即免費註冊，預約診斷課程",
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#81D8D0",
        paddingAll: "14px",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "🌟  歡迎加入質數教室！",
                color: "#FFFFFF",
                size: "sm",
                weight: "bold",
                flex: 1,
              },
            ],
          },
          {
            type: "text",
            text: "The Prime 質數教室",
            color: "#FFFFFFBB",
            size: "xxs",
            margin: "xs",
          },
        ],
      },
      hero: {
        type: "image",
        url: `${BASE}/ip-character.png`,
        size: "full",
        aspectMode: "fit",
        aspectRatio: "3:2",
        backgroundColor: "#E8FAF9",
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        paddingAll: "14px",
        contents: [
          {
            type: "text",
            text: "感謝您關注質數教室！\n我們專注於小學數學補教，讓孩子愛上學習 🧮",
            color: "#2C2C2C",
            size: "sm",
            wrap: true,
          },
          {
            type: "separator",
            margin: "sm",
            color: "#F0F0F0",
          },
          {
            type: "text",
            text: "✨ 加入後您可以",
            color: "#4FBDB4",
            size: "sm",
            weight: "bold",
            margin: "sm",
          },
          {
            type: "text",
            text: "• 預約免費診斷課程，了解孩子學習狀況",
            color: "#555555",
            size: "xs",
            wrap: true,
          },
          {
            type: "text",
            text: "• 彈性選擇適合的上課時段",
            color: "#555555",
            size: "xs",
            wrap: true,
            margin: "xs",
          },
          {
            type: "text",
            text: "• 即時掌握孩子的學習進度與聯絡簿",
            color: "#555555",
            size: "xs",
            wrap: true,
            margin: "xs",
          },
          {
            type: "separator",
            margin: "sm",
            color: "#F0F0F0",
          },
          {
            type: "text",
            text: "點擊下方按鈕免費註冊，即可開始預約課程！",
            color: "#888888",
            size: "xs",
            wrap: true,
            margin: "sm",
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "10px",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#81D8D0",
            height: "sm",
            action: {
              type: "uri",
              label: "免費註冊，預約診斷課程 →",
              uri: `${BASE}/`,
            },
          },
          {
            type: "text",
            text: "有任何問題，歡迎直接在這裡留言！",
            color: "#AAAAAA",
            size: "xxs",
            align: "center",
            margin: "sm",
          },
        ],
      },
    },
  };
}

export interface ParentWelcomeConfig {
  altText?: string;
  headerTitle?: string;
  bodyIntro?: string;
  bullet1?: string;
  bullet2?: string;
  bullet3?: string;
  bullet4?: string;
  footerNote?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export function buildParentWelcomeFlex(cfg: ParentWelcomeConfig = {}): { altText: string; contents: object } {
  const altText = cfg.altText || "歡迎加入質數教室 LINE！立即預約免費診斷課程";
  const headerTitle = cfg.headerTitle || "🎉  歡迎加入質數教室！";
  const bodyIntro = cfg.bodyIntro || "感謝您關注質數教室！\n我們提供專業的小學數學補教服務，讓孩子愛上數學 🧮";
  const bullet1 = cfg.bullet1 || "• 免費診斷課程，了解孩子學習狀況";
  const bullet2 = cfg.bullet2 || "• 彈性預約，選擇最適合的上課時段";
  const bullet3 = cfg.bullet3 || "• 即時堂數管理，掌握剩餘課程";
  const bullet4 = cfg.bullet4 || "• 課後聯絡簿，掌握孩子學習進度";
  const footerNote = cfg.footerNote || "💬 有任何問題，歡迎直接在這裡留言，我們會盡快回覆您！";
  const ctaLabel = cfg.ctaLabel || "立即預約免費診斷 →";
  const ctaUrl = cfg.ctaUrl || `${BASE}/`;
  return {
    altText,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#81D8D0",
        paddingAll: "14px",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: headerTitle,
                color: "#FFFFFF",
                size: "sm",
                weight: "bold",
                flex: 1,
              },
            ],
          },
          {
            type: "text",
            text: "The Prime 質數教室",
            color: "#FFFFFFBB",
            size: "xxs",
            margin: "xs",
          },
        ],
      },
      hero: {
        type: "image",
        url: `${BASE}/ip-character.png`,
        size: "full",
        aspectMode: "fit",
        aspectRatio: "3:2",
        backgroundColor: "#E8FAF9",
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        paddingAll: "14px",
        contents: [
          {
            type: "text",
            text: bodyIntro,
            color: "#2C2C2C",
            size: "sm",
            wrap: true,
          },
          {
            type: "separator",
            margin: "sm",
            color: "#F0F0F0",
          },
          {
            type: "text",
            text: "📚 我們能為您做什麼",
            color: "#4FBDB4",
            size: "sm",
            weight: "bold",
            margin: "sm",
          },
          {
            type: "text",
            text: bullet1,
            color: "#555555",
            size: "xs",
            wrap: true,
          },
          {
            type: "text",
            text: bullet2,
            color: "#555555",
            size: "xs",
            wrap: true,
            margin: "xs",
          },
          {
            type: "text",
            text: bullet3,
            color: "#555555",
            size: "xs",
            wrap: true,
            margin: "xs",
          },
          {
            type: "text",
            text: bullet4,
            color: "#555555",
            size: "xs",
            wrap: true,
            margin: "xs",
          },
          {
            type: "separator",
            margin: "sm",
            color: "#F0F0F0",
          },
          {
            type: "text",
            text: footerNote,
            color: "#888888",
            size: "xs",
            wrap: true,
            margin: "sm",
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "10px",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#81D8D0",
            height: "sm",
            action: {
              type: "uri",
              label: ctaLabel,
              uri: ctaUrl,
            },
          },
        ],
      },
    },
  };
}

export function buildCoachNewBookingFlex(params: {
  childName: string;
  date: string;
  time: string;
  location: string;
  dashboardUrl?: string;
  isNewStudent?: boolean;
}): { altText: string; contents: object } {
  const appBase = process.env.APP_BASE_URL || (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : "https://the-prime-math.replit.app");
  const isNew = !!params.isNewStudent;
  const headerColor = isNew ? "#FF8A7A" : "#4FBDB4";
  const headerTitle = isNew ? "🆕  新生第一堂課" : "📚  新課程預約";
  const altText = isNew
    ? `🆕 新生第一堂課：${params.childName} ${params.date} ${params.time}`
    : `📚 新課程預約：${params.childName} ${params.date} ${params.time}`;
  const studentLabel = isNew ? "🆕 新生" : "學生";
  const footerText = isNew
    ? "📘 請提前準備新生入門資料，歡迎這位新同學！"
    : "🙌 請提前準備好課程，期待這次的授課！";
  return {
    altText,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: headerColor,
        paddingAll: "12px",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: headerTitle, color: "#FFFFFF", size: "sm", weight: "bold", flex: 1 },
            ],
          },
          { type: "text", text: "The Prime 質數教室", color: "#FFFFFFBB", size: "xxs", margin: "xs" },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        paddingAll: "12px",
        contents: [
          infoRow(studentLabel, params.childName, headerColor),
          separator(),
          infoRow("📅 日期", params.date),
          infoRow("🕙 時間", params.time),
          infoRow("📍 地點", params.location),
          separator(),
          {
            type: "text",
            text: footerText,
            color: "#888888",
            size: "xs",
            wrap: true,
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "10px",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#4FBDB4",
            height: "sm",
            action: {
              type: "uri",
              label: "前往行事曆 →",
              uri: params.dashboardUrl ?? `${appBase}/coach-dashboard`,
            },
          },
        ],
      },
    },
  };
}

export function buildCoachCancelFlex(params: {
  childName: string;
  date: string;
  time: string;
  location: string;
  dashboardUrl?: string;
}): { altText: string; contents: object } {
  const appBase = process.env.APP_BASE_URL || (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : "https://the-prime-math.replit.app");
  return {
    altText: `❌ 學生取消預約：${params.childName} ${params.date} ${params.time}`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#D32F2F",
        paddingAll: "12px",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "❌  學生取消預約", color: "#FFFFFF", size: "sm", weight: "bold", flex: 1 },
            ],
          },
          { type: "text", text: "The Prime 質數教室", color: "#FFFFFFBB", size: "xxs", margin: "xs" },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        paddingAll: "12px",
        contents: [
          infoRow("學生", params.childName, "#D32F2F"),
          separator(),
          infoRow("📅 日期", params.date, "#BBBBBB", true),
          infoRow("🕙 時間", params.time, "#BBBBBB", true),
          infoRow("📍 地點", params.location),
          separator(),
          {
            type: "text",
            text: "⚠️ 該時段已釋出，可接受新預約。",
            color: "#888888",
            size: "xs",
            wrap: true,
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "10px",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#D32F2F",
            height: "sm",
            action: {
              type: "uri",
              label: "前往行事曆 →",
              uri: params.dashboardUrl ?? `${appBase}/coach-dashboard`,
            },
          },
        ],
      },
    },
  };
}

export function buildCoachDailySummaryFlex(params: {
  date: string;
  slots: Array<{ startTime: string; endTime: string; bookedSeats: number }>;
  dashboardUrl?: string;
}): { altText: string; contents: object } {
  const appBase = process.env.APP_BASE_URL || (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : "https://the-prime-math.replit.app");
  const totalStudents = params.slots.reduce((sum, s) => sum + (s.bookedSeats || 0), 0);
  const slotRows = [...params.slots]
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((s) => ({
      type: "box",
      layout: "horizontal",
      spacing: "sm",
      margin: "xs",
      contents: [
        { type: "text", text: `${s.startTime}–${s.endTime}`, color: "#2C2C2C", size: "xs", flex: 2 },
        { type: "text", text: `${s.bookedSeats} 位學生`, color: "#4FBDB4", size: "xs", flex: 1, align: "end" as const },
      ],
    }));

  return {
    altText: `📅 明日課程摘要：${params.date}，共 ${params.slots.length} 堂 ${totalStudents} 位學生`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#5C6BC0",
        paddingAll: "12px",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "📅  明日課程摘要", color: "#FFFFFF", size: "sm", weight: "bold", flex: 1 },
            ],
          },
          { type: "text", text: params.date, color: "#FFFFFFBB", size: "xxs", margin: "xs" },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        paddingAll: "12px",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            spacing: "sm",
            contents: [
              { type: "text", text: `共 ${params.slots.length} 堂課`, color: "#5C6BC0", size: "sm", weight: "bold", flex: 1 },
              { type: "text", text: `${totalStudents} 位學生`, color: "#E65100", size: "sm", weight: "bold", flex: 0 },
            ],
          },
          separator(),
          {
            type: "box",
            layout: "horizontal",
            spacing: "sm",
            contents: [
              { type: "text", text: "時段", color: "#AAAAAA", size: "xs", flex: 2 },
              { type: "text", text: "學生人數", color: "#AAAAAA", size: "xs", flex: 1, align: "end" as const },
            ],
          },
          ...slotRows,
          separator(),
          {
            type: "text",
            text: "🎓 請做好準備，祝教學順利！",
            color: "#888888",
            size: "xs",
            wrap: true,
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "10px",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#5C6BC0",
            height: "sm",
            action: {
              type: "uri",
              label: "前往行事曆 →",
              uri: params.dashboardUrl ?? `${appBase}/coach-dashboard`,
            },
          },
        ],
      },
    },
  };
}

export function buildCourseCancelFlex(params: {
  childName: string;
  date: string;
  time: string;
  teacher: string;
  credits: number;
  bookingUrl?: string;
}): { altText: string; contents: object } {
  return {
    altText: `😢 課程已取消：${params.childName} ${params.date} ${params.time}`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#78909C",
        paddingAll: "12px",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "😢  課程已取消", color: "#FFFFFF", size: "sm", weight: "bold", flex: 1 },
            ],
          },
          { type: "text", text: "點數已退回，期待下次見！", color: "#FFFFFFBB", size: "xxs", margin: "xs" },
        ],
      },
      hero: {
        type: "image",
        url: `${BASE}/ip-cancel.png`,
        size: "full",
        aspectMode: "fit",
        aspectRatio: "3:2",
        backgroundColor: "#F4F5F6",
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        paddingAll: "12px",
        contents: [
          infoRow("孩子", params.childName, "#555555"),
          separator(),
          infoRow("📅 日期", params.date, "#BBBBBB", true),
          infoRow("🕙 時間", params.time, "#BBBBBB", true),
          infoRow("👩‍🏫 老師", params.teacher, "#BBBBBB", true),
          separator(),
          {
            type: "box",
            layout: "horizontal",
            spacing: "sm",
            contents: [
              { type: "text", text: "退回", color: "#AAAAAA", size: "xs", flex: 0 },
              { type: "text", text: `✅ 點數已退回・剩餘 ${params.credits} 堂`, color: "#2E7D32", size: "xs", flex: 1, weight: "bold" },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "10px",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#78909C",
            height: "sm",
            action: {
              type: "uri",
              label: "重新預約課程 →",
              uri: params.bookingUrl ?? `${BASE}/`,
            },
          },
        ],
      },
    },
  };
}
