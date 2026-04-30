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
