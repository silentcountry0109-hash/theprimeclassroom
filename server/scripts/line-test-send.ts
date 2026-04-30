const LINE_USER_ID = "Uecb97d0ef5b5bfa232d24893c35bfa42";
const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

if (!TOKEN) {
  console.error("❌ LINE_CHANNEL_ACCESS_TOKEN 未設定");
  process.exit(1);
}

const scenarios: [string, string][] = [
  ["1_booking_success", `【質數教室】✅ 課程預約成功\n孩子：陳小明\n日期：2026/05/03（日）\n時間：10:00–11:00\n老師：林老師\n地點：台北信義分校\n剩餘點數：5 堂`],
  ["2_recurring", `【質數教室】✅ 連排預約成功（3 堂）\n孩子：陳小明\n📅 2026/05/03 10:00–11:00\n📅 2026/05/10 10:00–11:00\n📅 2026/05/17 10:00–11:00\n老師：林老師｜地點：信義分校\n剩餘點數：3 堂`],
  ["3_cancel", `【質數教室】❌ 課程已取消\n孩子：陳小明\n日期：2026/05/03（日）\n時間：10:00–11:00\n點數已退回，剩餘 6 堂`],
  ["4_pre_class", `【質數教室】⏰ 上課提醒\n陳小明 今天 10:00–11:00 有數學課\n老師：林老師\n地點：台北信義分校\n請準時出席！`],
  ["5_contact_book", `【質數教室】📒 聯絡簿通知\n陳小明 今日課後紀錄已填寫\n老師 林老師 已完成記錄\n請至 App 查看詳情`],
  ["6_low_credit", `【質數教室】⚠️ 點數提醒\n陳小明 的點數僅剩 1 堂，請盡快購買以免影響課程。`],
  ["7_no_credit", `【質數教室】🔴 點數已用完\n陳小明 的點數已歸零，請盡快購買點數以繼續預約課程。`],
];

async function send(label: string, text: string) {
  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ to: LINE_USER_ID, messages: [{ type: "text", text }] }),
  });
  const body = await res.text();
  const ok = res.status === 200;
  console.log(`${ok ? "✅" : "❌"} [${label}] HTTP ${res.status} → ${ok ? "發送成功" : body}`);
  return ok;
}

(async () => {
  console.log(`\n📨 正在發送 ${scenarios.length} 種通知情境…\nToken 長度: ${TOKEN.length}\n`);
  for (const [label, text] of scenarios) {
    await send(label, text);
    await new Promise((r) => setTimeout(r, 600));
  }
  console.log("\n✅ 全部完成");
})();
