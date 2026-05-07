import PDFDocument from "pdfkit";
import * as fs from "fs";
import * as path from "path";

const FONT_PATH = path.join(process.cwd(), "assets/fonts/NotoSansTC-Regular.otf");
const OUTPUT_PATH = path.join(process.cwd(), "exports/role-features.pdf");

const COLORS = {
  tiffany: "#81D8D0",
  coral: "#FFB7B2",
  amber: "#F59E0B",
  purple: "#8B5CF6",
  washi: "#FAF9F6",
  dark: "#1A1A1A",
  gray: "#6B7280",
  lightGray: "#E5E7EB",
  sectionBg: "#F9FAFB",
};

interface RoleData {
  role: string;
  subtitle: string;
  color: string;
  icon: string;
  features: { category: string; items: string[] }[];
}

const roles: RoleData[] = [
  {
    role: "老師（Coach）",
    subtitle: "管理課程、學生與薪酬的教學核心",
    color: COLORS.tiffany,
    icon: "◆",
    features: [
      {
        category: "行事曆",
        items: [
          "查看個人課表（週／月視圖）",
          "查看每日時段與座位資訊",
          "掌握上課安排與人數",
        ],
      },
      {
        category: "點名管理",
        items: [
          "上課前 15 分鐘開放點名功能",
          "標記學生已到／未到",
          "即時更新出席紀錄",
        ],
      },
      {
        category: "聯絡簿",
        items: [
          "填寫學生當日學習內容",
          "含教材單元選擇器（依年級搜尋）",
          "家長可即時查閱",
        ],
      },
      {
        category: "我的學生",
        items: [
          "查看歷史學生列表",
          "瀏覽個別學習歷程",
          "查閱學生聯絡簿紀錄",
        ],
      },
      {
        category: "教材庫",
        items: [
          "瀏覽 HQ 上傳的課程 PDF",
          "查閱教學題目與練習卷",
          "存取期中考歸檔卷",
          "內嵌 PDF 瀏覽器，無需離開系統",
        ],
      },
      {
        category: "個人資料",
        items: [
          "查看帳號資訊",
          "確認 LINE 綁定狀態",
          "查看薪酬設定方式",
        ],
      },
      {
        category: "薪酬查看",
        items: [
          "查看已確認課程的預估收入",
          "支援固定時薪、小時計費、收入百分比三種計薪方式",
          "區分已確認與預估收入",
        ],
      },
      {
        category: "通知中心",
        items: [
          "查看時段變更通知",
          "接收排課相關通知",
          "即時鈴聲提示（紅點）",
        ],
      },
    ],
  },
  {
    role: "家長（Parent）",
    subtitle: "為孩子預約課程、追蹤學習進度",
    color: COLORS.coral,
    icon: "◆",
    features: [
      {
        category: "首頁總覽",
        items: [
          "查看剩餘堂數（家庭錢包）",
          "查看即將到來的課程",
          "閱讀最新公告",
        ],
      },
      {
        category: "預約課程",
        items: [
          "依縣市、行政區、星期、時段搜尋分校",
          "查看分校師資與教室資訊",
          "線上預約時段（提前 3 天以上）",
          "可收藏分校，搜尋時優先顯示",
        ],
      },
      {
        category: "我的孩子",
        items: [
          "新增／編輯孩子資料",
          "設定姓名、年級、學校、備註",
          "管理多位孩子",
        ],
      },
      {
        category: "預約紀錄",
        items: [
          "查看所有預約狀態（已確認／已上課／已取消）",
          "上課前 4 小時內可取消預約",
          "匯出 ICS 行事曆至手機",
          "自動行事曆同步支援",
        ],
      },
      {
        category: "購買堂數",
        items: [
          "選擇多種堂數方案",
          "輸入優惠券代碼享折扣",
          "透過 ECPay 信用卡線上付款",
          "付款後即時入帳",
        ],
      },
      {
        category: "堂數交易紀錄",
        items: [
          "查看所有購買紀錄",
          "追蹤堂數扣除、退回、到期",
          "清楚掌握堂數動態",
        ],
      },
      {
        category: "聯絡簿",
        items: [
          "查看老師填寫的孩子學習紀錄",
          "依日期與孩子篩選",
          "追蹤學習進度與教材單元",
        ],
      },
      {
        category: "商城",
        items: [
          "購買教材或周邊商品",
          "加入購物車、線上結帳",
          "查看訂單紀錄",
        ],
      },
      {
        category: "LINE 帳號綁定",
        items: [
          "綁定 LINE 帳號以接收推播通知",
          "加入官方帳號後獲得歡迎訊息",
          "查看綁定狀態與管理",
        ],
      },
    ],
  },
  {
    role: "分校主任（Franchise Admin）",
    subtitle: "管理單一或多個分校的日常營運",
    color: COLORS.amber,
    icon: "◆",
    features: [
      {
        category: "分校總覽",
        items: [
          "今日統計：上課老師數、時段數、預約人數、已上課人數",
          "區間統計：自訂日期範圍查看預約趨勢",
          "支援快速預設（本週、本月等）",
        ],
      },
      {
        category: "分校資訊",
        items: [
          "編輯分校名稱、地址、電話、簡介",
          "設定分類標籤",
          "設定每日營業時間",
          "管理特殊日期（假日、補班等）",
        ],
      },
      {
        category: "教室管理",
        items: [
          "新增、重新命名、刪除教室",
          "上傳教室照片",
          "時段指定教室功能",
        ],
      },
      {
        category: "師資管理",
        items: [
          "新增、編輯、停用老師帳號",
          "設定薪酬類型（固定、時薪、百分比）",
          "查看老師課表",
          "管理老師認證狀態",
        ],
      },
      {
        category: "時段管理",
        items: [
          "週／月／列表三種視圖",
          "新增時段（指定教室、老師、最大座位數）",
          "批次刪除（含預約保護機制）",
          "刪除有學生預約時自動通知家長",
        ],
      },
      {
        category: "預約管理",
        items: [
          "查看所有預約（含狀態篩選）",
          "手動幫學生預約指定時段",
          "處理取消申請",
        ],
      },
      {
        category: "學生管理",
        items: [
          "查看學生基本資料",
          "瀏覽個別預約歷程",
          "查閱聯絡簿紀錄",
          "直接將學生關聯至本分校",
        ],
      },
      {
        category: "LINE 客服收件匣",
        items: [
          "查看所有 LINE 客服對話",
          "分配對話給指定人員",
          "回覆訊息（透過 LINE Messaging API）",
        ],
      },
      {
        category: "多分校切換",
        items: [
          "若管理多間分校，可在側邊欄切換",
          "所有 API 呼叫自動依選定分校過濾",
        ],
      },
    ],
  },
  {
    role: "總部人員（HQ Admin）",
    subtitle: "統籌全台分校營運與平台設定",
    color: COLORS.purple,
    icon: "◆",
    features: [
      {
        category: "總覽統計",
        items: [
          "全台學生數、老師數、分校數、總預約數",
          "平均滿班率、本月預約彙整",
          "各分校依縣市篩選與多種排序",
          "個別分校詳細數據（新生數、確認數等）",
        ],
      },
      {
        category: "加盟分校管理",
        items: [
          "新增、編輯、停用分校",
          "查看各分校詳細數據",
          "管理分校聯絡人與地址",
        ],
      },
      {
        category: "老師管理",
        items: [
          "跨分校查看所有老師",
          "編輯老師資料與認證狀態",
        ],
      },
      {
        category: "時段管理",
        items: [
          "跨分校查看所有時段",
          "協助調度資源",
        ],
      },
      {
        category: "帳號管理",
        items: [
          "管理所有使用者帳號（家長、老師、分校主任）",
          "角色設定與權限管理",
          "LINE 帳號綁定狀態查看與解除",
        ],
      },
      {
        category: "內容管理",
        items: [
          "常見問題（FAQ）新增、編輯、刪除，即時更新前台",
          "成功案例與家長好評管理",
          "全台公告發布",
        ],
      },
      {
        category: "點數管理",
        items: [
          "設定堂數方案（含到期天數與價格）",
          "建立促銷活動（期間折扣）",
          "發行優惠券代碼",
          "手動調整家長堂數",
          "ECPay 退款操作",
        ],
      },
      {
        category: "官網編輯",
        items: [
          "編輯首頁各區塊內容",
          "更新統計數字展示",
          "管理分校資訊展示",
        ],
      },
      {
        category: "教材庫管理",
        items: [
          "依年級管理教材單元（代碼、名稱）",
          "上傳 PDF（每單元最多 5 份）",
          "管理期中考歸檔卷",
          "老師可透過教材庫瀏覽存取",
        ],
      },
      {
        category: "系統工具",
        items: [
          "資料重設輔助工具",
          "模擬資料產生（測試用）",
          "系統維護功能",
        ],
      },
    ],
  },
];

function drawRoleCard(
  doc: InstanceType<typeof PDFDocument>,
  role: RoleData,
  startY: number
): number {
  const pageWidth = doc.page.width;
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;

  let y = startY;

  doc
    .rect(margin, y, contentWidth, 48)
    .fillColor(role.color)
    .fill();

  doc
    .fillColor("#FFFFFF")
    .font(FONT_PATH)
    .fontSize(18)
    .text(role.role, margin + 16, y + 10, { width: contentWidth - 32 });

  doc
    .fillColor("rgba(255,255,255,0.85)")
    .fontSize(10)
    .text(role.subtitle, margin + 16, y + 31, { width: contentWidth - 32 });

  y += 48 + 12;

  for (const section of role.features) {
    const estimatedHeight = 22 + section.items.length * 16 + 10;
    if (y + estimatedHeight > doc.page.height - 70) {
      doc.addPage();
      y = 50;
    }

    doc
      .rect(margin, y, contentWidth, 22)
      .fillColor("#F3F4F6")
      .fill();

    doc
      .fillColor(role.color)
      .fontSize(11)
      .font(FONT_PATH)
      .text(`● ${section.category}`, margin + 10, y + 5, { width: contentWidth - 20 });

    y += 22;

    for (const item of section.items) {
      if (y + 16 > doc.page.height - 70) {
        doc.addPage();
        y = 50;
      }
      doc
        .fillColor(COLORS.dark)
        .fontSize(10)
        .font(FONT_PATH)
        .text(`    · ${item}`, margin + 10, y + 2, { width: contentWidth - 20 });
      y += 16;
    }

    y += 10;
  }

  return y + 20;
}

async function generatePdf() {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

  const doc = new PDFDocument({
    size: "A4",
    bufferPages: true,
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: "The Prime 質數教室 — 各角色功能清單",
      Author: "The Prime 質數教室",
      Subject: "平台角色功能說明",
      Keywords: "老師,家長,分校主任,總部,功能清單",
    },
  });

  const stream = fs.createWriteStream(OUTPUT_PATH);
  doc.pipe(stream);

  const pageWidth = doc.page.width;
  const margin = 50;

  doc
    .rect(0, 0, pageWidth, 130)
    .fillColor(COLORS.tiffany)
    .fill();

  doc
    .rect(0, 125, pageWidth, 8)
    .fillColor(COLORS.coral)
    .fill();

  doc
    .fillColor("#FFFFFF")
    .font(FONT_PATH)
    .fontSize(28)
    .text("The Prime 質數教室", margin, 30, { align: "center", width: pageWidth - margin * 2 });

  doc
    .fillColor("rgba(255,255,255,0.9)")
    .fontSize(13)
    .text("各角色功能清單", margin, 72, { align: "center", width: pageWidth - margin * 2 });

  doc
    .fillColor("rgba(255,255,255,0.75)")
    .fontSize(9)
    .text(`產生日期：${new Date().toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" })}`, margin, 98, { align: "center", width: pageWidth - margin * 2 });

  let y = 150;

  doc
    .fillColor(COLORS.dark)
    .fontSize(11)
    .font(FONT_PATH)
    .text(
      "本文件整理 The Prime 質數教室平台四大角色的完整功能說明，供內部培訓、招募說明及系統規劃參考使用。",
      margin,
      y,
      { width: pageWidth - margin * 2, lineGap: 4 }
    );

  y += 40;

  doc
    .moveTo(margin, y)
    .lineTo(pageWidth - margin, y)
    .strokeColor(COLORS.lightGray)
    .lineWidth(1)
    .stroke();

  y += 16;

  doc
    .fillColor(COLORS.gray)
    .fontSize(10)
    .text("目錄", margin, y);
  y += 18;

  roles.forEach((role, i) => {
    doc
      .fillColor(role.color)
      .fontSize(10)
      .text(`${i + 1}.  ${role.role}`, margin + 10, y);
    y += 16;
  });

  y += 20;

  doc
    .moveTo(margin, y)
    .lineTo(pageWidth - margin, y)
    .strokeColor(COLORS.lightGray)
    .lineWidth(1)
    .stroke();

  y += 20;

  for (let i = 0; i < roles.length; i++) {
    if (i > 0) {
      doc.addPage();
      y = 50;
    }

    const role = roles[i];

    doc
      .fillColor(COLORS.gray)
      .fontSize(9)
      .font(FONT_PATH)
      .text(`第 ${i + 1} 章`, margin, y);
    y += 14;

    y = drawRoleCard(doc, role, y);
  }

  const pageCount = doc.bufferedPageRange().count + 1;
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    doc
      .fillColor(COLORS.gray)
      .fontSize(8)
      .font(FONT_PATH)
      .text(
        `The Prime 質數教室  ·  各角色功能清單  ·  第 ${i + 1} 頁`,
        margin,
        doc.page.height - 35,
        { align: "center", width: pageWidth - margin * 2 }
      );
  }

  doc.end();

  await new Promise<void>((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  console.log("✅ PDF 已成功產生！");
  console.log(`📄 檔案路徑：${OUTPUT_PATH}`);
  const stats = fs.statSync(OUTPUT_PATH);
  console.log(`📦 檔案大小：${(stats.size / 1024).toFixed(1)} KB`);
}

generatePdf().catch((err) => {
  console.error("❌ 產生 PDF 時發生錯誤：", err);
  process.exit(1);
});
