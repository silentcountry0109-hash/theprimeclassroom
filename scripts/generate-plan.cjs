const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
} = require("docx");
const fs = require("fs");
const path = require("path");

function heading1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
  });
}

function heading2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
  });
}

function heading3(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
  });
}

function body(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    spacing: { before: 60, after: 60 },
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    bullet: { level },
    spacing: { before: 40, after: 40 },
  });
}

function coverParagraph(text, opts = {}) {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: opts.bold || false,
        size: opts.size || 24,
        color: opts.color || "000000",
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: opts.spaceBefore || 100, after: opts.spaceAfter || 100 },
  });
}

const doc = new Document({
  numbering: {
    config: [],
  },
  sections: [
    {
      children: [
        // ===== COVER PAGE =====
        new Paragraph({ children: [new TextRun({ text: "", size: 24 })], spacing: { before: 2000 } }),
        coverParagraph("質數教室", { bold: true, size: 64, spaceBefore: 200, spaceAfter: 200 }),
        coverParagraph("Prime Math Classroom", { size: 32, color: "555555", spaceBefore: 100, spaceAfter: 300 }),
        coverParagraph("專案計劃書", { bold: true, size: 48, spaceBefore: 200, spaceAfter: 600 }),
        coverParagraph("版本：1.0", { size: 22, color: "555555", spaceBefore: 100, spaceAfter: 60 }),
        coverParagraph("日期：2026 年 4 月 20 日", { size: 22, color: "555555", spaceBefore: 60, spaceAfter: 60 }),
        coverParagraph("機密等級：內部使用", { size: 20, color: "888888", spaceBefore: 60, spaceAfter: 200 }),
        new Paragraph({ children: [new PageBreak()] }),

        // ===== 目錄提示 =====
        heading1("目錄"),
        body("1. 專案概述"),
        body("2. 網頁建置"),
        body("3. 前台後台模組說明"),
        body("4. 線上測試規劃"),
        body("5. 師資培訓"),
        body("6. 教材管理"),
        body("7. 待辦與待啟動功能清單"),
        new Paragraph({ children: [new PageBreak()] }),

        // ===== 章節 1：專案概述 =====
        heading1("1. 專案概述"),

        heading2("1.1 系統定位"),
        body("質數教室（Prime Math Classroom）是一套專為 1 對 1 數學補習連鎖加盟品牌設計的全端管理平台。系統涵蓋公開行銷網站、家長預約端、教練教學端、分校後台與總部後台，提供完整的教務、師資與教材管理功能。"),

        heading2("1.2 目標用戶"),
        bullet("家長（Parent）：透過公開網站搜尋分校、預約課程、購買堂數、查看孩子學習紀錄"),
        bullet("教練（Coach）：查看排課行事曆、記錄出席、填寫聯絡簿、管理學生、查閱教材庫"),
        bullet("分校主任（Franchise Admin）：管理時段、學生、師資、統計報表及臨時加課"),
        bullet("總部管理員（HQ Admin）：管理所有分校、帳號、官網內容、商城及點數系統"),
        bullet("加盟主（Franchise Owner）：透過分校後台了解分校日常營運狀況"),

        heading2("1.3 技術架構摘要"),
        bullet("前端框架：React 18 + TypeScript + Vite"),
        bullet("UI 元件庫：shadcn/ui + Tailwind CSS"),
        bullet("路由：Wouter（前端 SPA）"),
        bullet("後端框架：Node.js + Express"),
        bullet("資料庫：PostgreSQL（Drizzle ORM）"),
        bullet("認證：Replit Auth（OAuth）+ 帳號密碼登入（bcryptjs）"),
        bullet("簡訊驗證：三竹簡訊（Mitake SMS）"),
        bullet("AI 功能：Google Gemini（教練大頭照生成、分校描述生成）"),
        bullet("檔案上傳：Multer（本機儲存，支援 PDF / 圖片）"),
        bullet("狀態管理：TanStack Query v5"),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 章節 2：網頁建置 =====
        heading1("2. 網頁建置"),

        heading2("2.1 公開首頁架構"),
        body("公開首頁（Landing Page）是品牌形象的主要入口，功能包含："),
        bullet("品牌形象展示（Logo、品牌標語、GIF 動畫封面）"),
        bullet("全台分校搜尋（依縣市、區域篩選）"),
        bullet("推薦師資展示（依預約量排序）"),
        bullet("成功案例輪播（學生見證、家長推薦）"),
        bullet("品牌特色說明"),
        bullet("常見問題（FAQ）"),
        bullet("頁尾（社群媒體連結、隱私政策）"),

        heading2("2.2 分頁清單"),
        bullet("/ — 公開首頁"),
        bullet("/search — 分校搜尋結果"),
        bullet("/classroom/:id — 分校詳情頁（預約、師資、圖片）"),
        bullet("/parent-login — 家長登入 / 註冊（含手機 OTP 驗證）"),
        bullet("/franchise-login — 分校主任 / 教練登入"),
        bullet("/hq-login — 總部管理員登入"),
        bullet("/dashboard — 家長後台"),
        bullet("/franchise-admin — 分校後台"),
        bullet("/admin — 總部後台"),
        bullet("/coach-dashboard — 教練端"),

        heading2("2.3 響應式設計"),
        body("所有頁面均採用 Tailwind CSS 實作響應式排版，支援手機（≥375px）、平板（≥768px）、桌機（≥1280px）三種斷點。"),

        heading2("2.4 深色 / 淺色模式"),
        body("系統支援深色模式切換，依照 CSS 自訂屬性（:root / .dark）與 Tailwind dark: 變體進行配色管理。"),

        heading2("2.5 進場動畫"),
        body("首頁各區塊設有 CSS / Framer Motion 進場動畫，提升使用者視覺體驗。"),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 章節 3：前台後台模組說明 =====
        heading1("3. 前台後台模組說明"),

        heading2("3.1 總部後台（HQ Admin）"),
        body("路由：/admin"),
        heading3("功能模組"),
        bullet("總覽（Overview）：全國分校預約統計、滿班率、學生人數、本月新生"),
        bullet("分校管理：新增 / 編輯 / 停用分校、設定主任帳號、管理分校相片"),
        bullet("老師管理：新增 / 編輯教練資料、設定薪資方案、AI 生成大頭照"),
        bullet("時段管理：跨分校查看與管理排課時段"),
        bullet("帳號管理：建立 / 管理所有角色帳號（家長、教練、主任）"),
        bullet("常見問題管理：新增 / 編輯 FAQ，立即同步至前台"),
        bullet("成功案例管理：新增 / 編輯學生見證"),
        bullet("公告管理：發布站內公告"),
        bullet("商城管理：管理商品目錄、訂單"),
        bullet("點數管理：管理堂數方案、折扣碼、優惠活動、點數購買紀錄"),
        bullet("官網編輯：更新首頁文字、圖片、GIF 等內容（CMS 功能）"),

        heading2("3.2 分校後台（Franchise Admin）"),
        body("路由：/franchise-admin"),
        heading3("功能模組"),
        bullet("分校總覽：今日上課人數、出席率、老師數、預約統計圖表"),
        bullet("分校資訊：編輯地址、電話、描述、相片、標籤、鄰近學校、營業時間"),
        bullet("師資管理：分校教練 CRUD、設定認證狀態、薪資設定"),
        bullet("時段管理：批次排課（支援重複時段）、單堂新增 / 刪除、教室指派"),
        bullet("預約管理：查看 / 管理所有預約、出席確認"),
        bullet("學生管理：查看分校學生名冊"),
        bullet("統計分析：自訂日期範圍報表、縣市 / 分校篩選"),
        bullet("特殊節日設定：批量停課管理"),
        bullet("通知中心：新預約提醒、時段異動通知"),

        heading2("3.3 教練端（Coach Dashboard）"),
        body("路由：/coach-dashboard"),
        heading3("功能模組"),
        bullet("行事曆：月曆視圖顯示排課，點擊日期展開課堂明細"),
        bullet("出席紀錄：逐堂點名、記錄出席 / 缺席狀態"),
        bullet("聯絡簿填寫：課程進度、測驗分數、作業、備註"),
        bullet("學生管理：查看負責學生名單與聯絡資料"),
        bullet("教材庫：依年級瀏覽 PDF 教材、數學練習網站連結"),
        bullet("個人資料：更新自我介紹、專長、照片"),
        bullet("使用手冊：內建操作說明"),
        bullet("通知系統：新預約提醒、時段指派 / 移除通知、過期未填提醒"),

        heading2("3.4 家長端（Parent Dashboard）"),
        body("路由：/dashboard"),
        heading3("功能模組"),
        bullet("首頁：堂數餘額、即將到來的課程、孩子學習概況"),
        bullet("預約課程：搜尋分校、選擇時段、以堂數完成預約"),
        bullet("我的孩子：新增 / 編輯孩子資料（年級、學校、備註）"),
        bullet("預約紀錄：查看歷史預約、取消預約"),
        bullet("購買堂數：選購堂數方案、輸入折扣碼"),
        bullet("聯絡簿：查看教練填寫的課堂紀錄"),
        bullet("商城：瀏覽 / 購買周邊商品"),
        bullet("通知系統：課程取消提醒、堂數到期提醒"),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 章節 4：線上測試規劃 =====
        heading1("4. 線上測試規劃"),

        heading2("4.1 測試策略"),
        body("系統採用端對端（E2E）測試作為主要驗收方式，使用 Playwright 框架驅動 Chromium 瀏覽器，模擬真實使用者操作流程。"),

        heading2("4.2 測試類型"),
        heading3("E2E 功能測試"),
        bullet("家長註冊與手機 OTP 驗證流程"),
        bullet("家長登入、預約課程、取消預約"),
        bullet("分校後台：時段建立、批次排課、刪除確認"),
        bullet("教練端：行事曆顯示、點名操作、聯絡簿填寫"),
        bullet("總部後台：分校 CRUD、帳號建立、官網編輯"),

        heading3("API 功能測試"),
        bullet("所有 REST API 端點正常回應（2xx）"),
        bullet("驗證錯誤處理（4xx / 5xx）"),
        bullet("資料庫 CRUD 操作正確性"),

        heading3("視覺測試"),
        bullet("各頁面截圖對比（Playwright screenshot）"),
        bullet("響應式斷點驗證（375px / 768px / 1280px）"),
        bullet("深色模式渲染驗證"),

        heading2("4.3 驗收標準"),
        bullet("所有核心使用者流程（家長預約、教練點名、分校排課）通過 E2E 測試"),
        bullet("API 回應時間 p95 < 500ms"),
        bullet("行動裝置（375px）無水平捲軸"),
        bullet("所有互動元素具有 data-testid 屬性"),
        bullet("深色模式文字對比度符合 WCAG AA 標準"),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 章節 5：師資培訓 =====
        heading1("5. 師資培訓"),

        heading2("5.1 內建訓練手冊"),
        body("系統於教練端設有「使用手冊」頁面（Manual Tab），提供以下說明："),
        bullet("課表查看與行事曆操作說明"),
        bullet("點名流程圖解"),
        bullet("聯絡簿各欄位填寫指引"),
        bullet("教材庫使用說明"),
        bullet("通知系統說明"),
        body("訓練手冊內容由總部透過官網 CMS 編輯功能更新，無需重新部署。"),

        heading2("5.2 加盟主上手流程（SOP）"),
        heading3("步驟一：帳號開通"),
        bullet("總部管理員建立分校主任帳號（franchise_admin 角色）"),
        bullet("主任收到帳號密碼後首次登入"),
        bullet("建議首次登入後立即更改密碼"),

        heading3("步驟二：分校資料設定"),
        bullet("填寫分校地址、電話、描述"),
        bullet("上傳分校封面圖與相片集"),
        bullet("設定營業時間與鄰近學校"),
        bullet("新增教室（教室名稱）"),

        heading3("步驟三：師資建立"),
        bullet("新增教練（姓名、電話、專長、認證狀態）"),
        bullet("設定薪資方案（固定 / 時薪）"),
        bullet("總部管理員建立教練登入帳號"),
        bullet("教練首次登入後更改密碼"),

        heading3("步驟四：排課設定"),
        bullet("建立常態班時段（批次排課，支援多星期幾重複）"),
        bullet("指派教練至時段"),
        bullet("確認開課後開放家長預約"),

        heading2("5.3 教練操作說明"),
        bullet("每日開課前，確認當天排課顯示在行事曆"),
        bullet("課程開始後於「行事曆 > 今日課堂」逐一點名"),
        bullet("課程結束後填寫聯絡簿（課程進度、測驗分數、作業）"),
        bullet("內部備註欄僅教練與分校主任可見，家長無法查看"),
        bullet("教材庫可查閱當前教學單元的 PDF 講義"),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 章節 6：教材管理 =====
        heading1("6. 教材管理"),

        heading2("6.1 PDF 教材庫"),
        heading3("架構"),
        bullet("教材以「課程單元（Curriculum Unit）」為組織單位，每單元可上傳多種類型的 PDF"),
        bullet("資料表：curriculum_units（單元）、curriculum_files（PDF 檔案）"),
        bullet("儲存路徑：uploads/curriculum/"),

        heading3("檔案類型"),
        bullet("教師版講義（teacher_pdf）"),
        bullet("學生版講義（student_pdf）"),
        bullet("答案卷（answer_pdf）"),

        heading3("安全限制"),
        bullet("PDF 檢視器內建禁止下載功能（Content-Disposition 設為 inline）"),
        bullet("僅認證用戶可查閱（需登入）"),
        bullet("上傳限制：最大 20MB、僅接受 .pdf 格式"),

        heading2("6.2 教科書教材庫（Textbook）"),
        body("另設有依年級 / 科目分類的教科書教材系統（textbooks、textbook_files、textbook_quizzes），供教練查看對應年級的單元教材與測驗卷。"),

        heading2("6.3 外部教材網站連結"),
        body("教材庫提供外部數學練習網站的快捷連結，包含："),
        bullet("均一教育平台"),
        bullet("IXL Math"),
        bullet("Khan Academy"),
        bullet("翰林數位教材"),
        body("連結由總部統一管理，顯示於教練端「教材庫」頁面。"),

        heading2("6.4 期中考歸檔（Midterm Exam Archive）"),
        body("資料表：curriculum_midterm_exams"),
        bullet("欄位：試卷標題、學期、年級、原始檔名、儲存路徑"),
        bullet("支援按年級 / 學期篩選"),
        bullet("僅教練與分校主任可上傳 / 查閱"),
        bullet("家長端不開放此功能"),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 章節 7：待辦與待啟動功能清單 =====
        heading1("7. 待辦與待啟動功能清單"),

        body("以下為目前規劃中（PROPOSED）尚未實作的功能，依功能類別分組列出："),

        heading2("7.1 家長互動功能"),
        bullet("#15 家長真實評論與評分系統（核心功能）"),
        body("允許家長對分校或教練留下真實評分與文字評論，提升口碑透明度。"),
        bullet("#16 自動評論邀請通知（排程任務）"),
        body("課程結束後，透過排程任務自動向家長發送評論邀請通知。"),

        heading2("7.2 首頁與公開網站"),
        bullet("#20 首頁推薦師資依預約量排序"),
        body("調整首頁師資展示區塊，依累積預約數量降冪排序，突顯熱門教練。"),
        bullet("#61 讓首頁 GIF 字幕在深色裝置模式下仍然清楚可見"),
        body("修正深色模式下首頁 GIF 動畫字幕對比度不足的問題。"),
        bullet("#62 首頁各區塊之間加入更豐富的進場動畫"),
        body("為首頁各主要區塊加入 scroll-triggered 進場動畫，提升視覺體驗。"),

        heading2("7.3 分校後台功能"),
        bullet("#28 分校後台「臨時加課」整合功能"),
        body("提供分校主任快速新增單次臨時加課，並自動開放家長預約的整合流程。"),
        bullet("#45 批次排課星期預設改為全選（一到日）"),
        body("優化批次排課 UI，將星期選擇預設改為全選，減少操作步驟。"),
        bullet("#46 統計分析新增「本週一到五」快捷按鈕"),
        body("在統計分析日期篩選區新增「本週一到五」預設快捷鍵，提升常用查詢效率。"),

        heading2("7.4 教練端功能"),
        bullet("#41 學習地圖 — 依聯絡簿自動標示單元學習狀態"),
        body("根據教練填寫的聯絡簿資料，自動在學習地圖上標示每個課程單元的學習狀態（未開始 / 進行中 / 完成）。"),
        bullet("#43 教材庫新增子分頁（數學練習網站＋期中考歸檔）"),
        body("在教材庫新增兩個子分頁：外部數學練習網站連結清單，以及期中考歸檔瀏覽。"),

        heading2("7.5 學生與家長資料"),
        bullet("#71 學生資料頁面也能讓家長看到學校和備註欄位"),
        body("在家長端的孩子資料頁面顯示「學校」與「備註」欄位，讓家長確認資料完整性。"),

        heading2("7.6 通知與系統"),
        bullet("#57 當老師被從時段移除時，通知原本的老師"),
        body("當分校主任將教練從某時段移除，自動發送站內通知給該教練，說明被移除的日期與時段。"),
        bullet("#74 也確認「今日上課老師數」不含停用老師"),
        body("修正分校總覽今日統計邏輯，確保 isActive=false 的教練不計入當日上課老師數。"),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 附錄 =====
        heading1("附錄：主要資料表清單"),
        body("以下為系統 PostgreSQL 資料庫中的主要資料表："),
        bullet("users — 所有角色帳號（管理員、分校主任、教練、家長）"),
        bullet("franchises — 加盟分校"),
        bullet("coaches — 教練"),
        bullet("children — 學生（孩子）資料"),
        bullet("franchise_students — 分校學生關聯"),
        bullet("classrooms — 教室"),
        bullet("time_slots — 排課時段"),
        bullet("bookings — 預約紀錄"),
        bullet("contact_books — 聯絡簿"),
        bullet("faqs — 常見問題"),
        bullet("success_stories — 成功案例"),
        bullet("announcements — 站內公告"),
        bullet("products / cart_items / orders / order_items — 商城"),
        bullet("credit_packages / credit_purchases / credit_balances / credit_transactions — 點數系統"),
        bullet("textbooks / textbook_files / textbook_quizzes — 教科書教材"),
        bullet("curriculum_units / curriculum_files / curriculum_midterm_exams — 課程教材"),
        bullet("notifications — 站內通知"),
        bullet("site_content — CMS 官網內容"),
        bullet("promotions / coupon_codes — 優惠活動 / 折扣碼"),
        bullet("favorite_franchises — 收藏分校"),
        bullet("coach_daily_records — 教練每日紀錄"),

        new Paragraph({ spacing: { before: 600 } }),
        coverParagraph("— 文件結束 —", { color: "888888", size: 20 }),
        coverParagraph(`版本：1.0  |  日期：2026 年 4 月 20 日  |  系統：質數教室 Prime Math`, { color: "888888", size: 18 }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  const outPath = path.join(process.cwd(), "質數教室_專案計劃書.docx");
  fs.writeFileSync(outPath, buffer);
  console.log("文件已產生：" + outPath);
});
