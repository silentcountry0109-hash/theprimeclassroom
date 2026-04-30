export async function sendLineMessage(lineUserId: string, message: string): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token || !lineUserId) return;
  try {
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: lineUserId,
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
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token || !lineUserId) return;
  try {
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: lineUserId,
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
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token || !lineUserId) return;
  console.log(`[LINE Flex] token length=${token.length} starts=${token.slice(0,6)} ends=${token.slice(-6)}`);
  try {
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: messages.map(({ altText, contents }) => ({
          type: "flex",
          altText,
          contents,
        })),
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[LINE Flex Multi] API error ${res.status}:`, body);
    } else {
      console.log(`[LINE Flex Multi] Sent ${messages.length} messages OK`);
    }
  } catch (err) {
    console.error("[LINE Flex Multi] Failed:", err);
  }
}

export async function sendLineReply(replyToken: string, message: string): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) { console.error("[LINE Reply] No access token"); return; }
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
    } else {
      console.log("[LINE Reply] Sent OK:", message.slice(0, 30));
    }
  } catch (err) {
    console.error("[LINE Reply] Failed:", err);
  }
}

const BASE = "https://35b01c9c-e144-4845-804d-493efef1bdbc-00-1f48xp0bjovrd.worf.replit.dev";

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
                    type: "text",
                    text: `🎫 ${params.credits} 堂`,
                    color: "#E65100",
                    size: "xs",
                    weight: "bold",
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
