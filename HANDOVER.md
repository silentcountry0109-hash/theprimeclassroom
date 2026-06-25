# The Prime 質數教室 — 專案完整交接文件

> 最後更新：2026-06-25
> 平台：Replit（原始開發環境）→ 可遷移至任何支援 Node.js + PostgreSQL 的主機

---

## 目錄

1. [專案概覽](#1-專案概覽)
2. [系統架構](#2-系統架構)
3. [資料庫結構（34 張資料表）](#3-資料庫結構)
4. [環境變數完整清單](#4-環境變數完整清單)
5. [前端路由](#5-前端路由)
6. [後端 API 路由](#6-後端-api-路由)
7. [角色與權限系統](#7-角色與權限系統)
8. [外部服務串接](#8-外部服務串接)
9. [本機開發啟動方式](#9-本機開發啟動方式)
10. [資料庫遷移與部署](#10-資料庫遷移與部署)
11. [資料轉移 SOP](#11-資料轉移-sop)
12. [GitHub 推送與接手注意事項](#12-github-推送與接手注意事項)
13. [目錄結構說明](#13-目錄結構說明)
14. [核心業務邏輯筆記](#14-核心業務邏輯筆記)

---

## 1. 專案概覽

The Prime 質數教室是一個 **S2B2C 教育平台**，連結台灣國小數學補習教室（加盟主）、老師（教練）與家長學生三方。

| 對象 | 功能 |
|------|------|
| **家長** | 搜尋教室、預約課程、管理孩子、購買堂數點數、LINE 登入 |
| **老師（Coach）** | 查看課表、簽到、填聯絡簿、查看薪資 |
| **加盟主（Franchise Admin）** | 管理分校、師資、時段、教室、學生 |
| **總部（HQ Admin）** | 全平台統計、師資總管、點數套餐、官網 CMS、彈窗廣告 |

**正式網域：** `https://www.theprimeclassroom.com`

---

## 2. 系統架構

```
┌─────────────────────────────────────────────────────┐
│                    前端 (Vite + React)               │
│  React 18 · Wouter · TanStack Query · Tailwind CSS  │
│  Shadcn/UI · Radix UI · Framer Motion              │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP / REST API（同埠 :5000）
┌───────────────────────▼─────────────────────────────┐
│               後端 (Express.js + TypeScript)         │
│  server/index.ts → server/routes.ts                  │
│  Drizzle ORM · express-session · multer             │
└──────────┬────────────────────────┬─────────────────┘
           │                        │
    ┌──────▼──────┐      ┌──────────▼──────────────┐
    │  PostgreSQL │      │  Google Cloud Storage   │
    │ (Drizzle)   │      │  (圖片 & PDF 檔案)      │
    └─────────────┘      └─────────────────────────┘
           │
    ┌──────▼──────────────────────────────────────────┐
    │  外部服務                                        │
    │  · ECPay 綠界（線上金流）                       │
    │  · LINE Login / Messaging / LIFF                │
    │  · Twilio Verify（手機 OTP 主要）               │
    │  · 三竹簡訊 Mitake（OTP 備援）                  │
    │  · Google Gemini AI（老師大頭照 AI 生成）       │
    └─────────────────────────────────────────────────┘
```

### 技術選型

| 分層 | 技術 | 說明 |
|------|------|------|
| 前端框架 | React 18 + Vite | 開發體驗佳、HMR 快速 |
| 前端路由 | Wouter | 輕量，比 React Router 簡單 |
| 資料快取 | TanStack Query v5 | 伺服器狀態管理，自動 refetch |
| UI 元件 | Shadcn/UI + Radix UI | 可存取性好、可深度客製化 |
| 樣式 | Tailwind CSS | 設計 token 集中管理 |
| 動畫 | Framer Motion | Landing page 視差動畫 |
| 後端框架 | Express.js | 成熟穩定 |
| ORM | Drizzle ORM | TypeScript 型別安全 |
| Schema 驗證 | Zod + drizzle-zod | 前後端共用型別定義 |
| Session | express-session | 有狀態 session 儲存於 DB |

### 設計系統 Token

| 名稱 | 色碼 | 用途 |
|------|------|------|
| Tiffany Blue | `#81D8D0` | 主色、CTA |
| Coral | `#FFB7B2` | 強調色 |
| Amber Warm | `#FFF9E5` | 背景強調 |
| Washi | `#FAF9F6` | 頁面主背景 |

字型：Noto Sans TC（內文）、Shippori Mincho（標題）

---

## 3. 資料庫結構

資料庫共 **34 張資料表**，所有 schema 定義在 `shared/schema.ts`。

### 核心業務表

| 資料表 | 說明 |
|--------|------|
| `franchises` | 加盟分校基本資料（地址、縣市、照片、介紹、營業時間） |
| `coaches` | 老師資料（薪資設定、認證狀態、照片、isActive） |
| `classrooms` | 分校底下的教室（A 教室、B 教室…） |
| `time_slots` | 開課時段（日期、時間、老師、教室、座位數） |
| `bookings` | 家長預約紀錄（含簽到、出缺席狀態） |
| `children` | 孩子資料（含唯一 `studentCode`） |
| `franchise_students` | 分校—學生關聯（多對多） |
| `contact_books` | 老師每堂課後填寫的學習聯絡簿 |

### 用戶相關表

| 資料表 | 說明 |
|--------|------|
| `users`（Replit Auth 管理） | 由 Replit OpenID Connect 自動建立 |
| `favorite_franchises` | 家長收藏的分校（搜尋頁置頂） |
| `notifications` | 站內通知（鈴鐺圖示） |

### 點數（Credits）系統表

| 資料表 | 說明 |
|--------|------|
| `credit_packages` | HQ 定義的點數套餐（含限定白名單） |
| `credit_purchases` | 購買紀錄（含 ECPay 交易號、狀態） |
| `credit_balances` | 每個家庭每個套餐的剩餘點數（FIFO 扣點） |
| `credit_transactions` | 點數異動明細（扣點、退點、贈點） |
| `promotions` | 促銷活動（折扣比例、贈點） |
| `coupon_codes` | 優惠碼 |

### 電商表

| 資料表 | 說明 |
|--------|------|
| `products` | 商品（教材、周邊） |
| `cart_items` | 購物車 |
| `orders` | 訂單 |
| `order_items` | 訂單明細 |

### 內容管理（CMS）表

| 資料表 | 說明 |
|--------|------|
| `site_content` | 官網 CMS（key-value，如 `hero.title`、`footer.lineUrl`） |
| `faqs` | 常見問題 |
| `success_stories` | 成功案例 |
| `announcements` | 公告 |
| `popup_ads` | 首頁彈窗廣告（含圖片、連結、檔期） |
| `custom_schools` | 自訂學校清單（補 MOE 資料不足） |

### 課程內容表

| 資料表 | 說明 |
|--------|------|
| `textbooks` | 教材單元（年級、單元碼） |
| `textbook_quizzes` | 教材測驗題 |
| `textbook_files` | 教材 PDF（GCS 路徑） |
| `curriculum_units` | 課程單元 |
| `curriculum_files` | 課程 PDF |
| `curriculum_midterm_exams` | 期中考題庫 |

### 其他

| 資料表 | 說明 |
|--------|------|
| `coach_daily_records` | 老師每日打卡紀錄（薪資計算基礎） |
| `coach_reminder_logs` | 聯絡簿提醒 log |
| `system_settings` | 系統設定（如新生贈堂數） |

---

## 4. 環境變數完整清單

> ⚠️ **絕對不要**將以下任何機密值提交到 Git。
> 請使用 `.env` 檔（已在 `.gitignore` 中）或平台的 Secrets 管理功能。
> 參考 `.env.example` 檔案建立你自己的 `.env`。

### 必填項目

| 變數名稱 | 說明 | 取得方式 |
|----------|------|---------|
| `DATABASE_URL` | PostgreSQL 連線字串 | 資料庫服務商提供 |
| `SESSION_SECRET` | Express session 加密金鑰 | 隨機生成 64 字元以上 |
| `GEMINI_API_KEY` | Google Gemini AI API Key | [Google AI Studio](https://aistudio.google.com/) |

### LINE 相關

| 變數名稱 | 說明 | 取得方式 |
|----------|------|---------|
| `LINE_CHANNEL_ID` | LINE Login Channel ID | LINE Developers Console |
| `LINE_CHANNEL_SECRET` | LINE Login Channel Secret | LINE Developers Console |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging API Access Token | LINE Developers Console |
| `LINE_MESSAGING_CHANNEL_SECRET` | LINE Messaging Channel Secret | LINE Developers Console |
| `LINE_MESSAGING_CHANNEL_ID` | LINE Messaging Channel ID（固定值） | `2009852161` |
| `VITE_LINE_OA_URL` | 首頁「加入好友」按鈕 URL | `https://line.me/R/ti/p/@你的OA帳號` |

> **注意：** 換新網域後，必須到 LINE Developers Console 更新：
> - LINE Login → Callback URL → `https://新網域/api/auth/line/callback`
> - LINE Messaging → Webhook URL → `https://新網域/api/line/webhook`

### 手機 OTP 驗證

| 變數名稱 | 說明 |
|----------|------|
| `TWILIO_ACCOUNT_SID` | Twilio 帳號 SID（主要） |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_VERIFY_SERVICE_SID` | Twilio Verify Service SID |
| `MITAKE_USERNAME` | 三竹簡訊帳號（備援） |
| `MITAKE_PASSWORD` | 三竹簡訊密碼（備援） |

### ECPay 綠界金流

| 變數名稱 | 說明 | 正式環境 |
|----------|------|---------|
| `ECPAY_MERCHANT_ID` | 商店代號 | 向綠界申請 |
| `ECPAY_HASH_KEY` | Hash Key | 向綠界申請 |
| `ECPAY_HASH_IV` | Hash IV | 向綠界申請 |
| `ECPAY_IS_SANDBOX` | 沙盒模式開關 | **正式上線改為 `false`** |

> **注意：** ECPay 的付款通知 callback（POST `/api/ecpay/notify`）必須可被綠界伺服器訪問，
> 需確保正式網域未被防火牆封鎖。

### 檔案儲存（Google Cloud Storage）

| 變數名稱 | 說明 |
|----------|------|
| `DEFAULT_OBJECT_STORAGE_BUCKET_ID` | GCS Bucket ID |
| `PUBLIC_OBJECT_SEARCH_PATHS` | 公開檔案路徑前綴（`public`） |
| `PRIVATE_OBJECT_DIR` | 私有 PDF 路徑前綴（`.private`） |

> **注意：** 目前使用 Replit App Storage SDK（`@replit/object-storage`）。
> 離開 Replit 平台後需改為直接使用 `@google-cloud/storage` + GCP Service Account。

### 應用程式設定

| 變數名稱 | 說明 | 範例值 |
|----------|------|-------|
| `TZ` | 伺服器時區 | `Asia/Taipei` |
| `APP_BASE_URL` | 正式網域（production only） | `https://www.theprimeclassroom.com` |
| `NODE_ENV` | 環境模式 | `development` / `production` |

---

## 5. 前端路由

| 路徑 | 頁面元件 | 說明 |
|------|---------|------|
| `/` | `landing.tsx` | 官網首頁（品牌、搜尋入口） |
| `/search` | `search-results.tsx` | 搜尋分校結果 |
| `/classroom/:id` | `classroom-detail.tsx` | 分校詳情、預約時段 |
| `/parent-login` | `parent-login.tsx` | 家長登入（LINE / 帳密） |
| `/dashboard` | `parent-dashboard.tsx` | 家長後台 |
| `/parent-register/add-friend` | `parent-register-add-friend.tsx` | 家長註冊步驟 1 |
| `/parent-register/verify-phone` | `parent-register-verify-phone.tsx` | 家長註冊步驟 2（OTP） |
| `/hq-login` | `hq-login.tsx` | 總部管理員登入 |
| `/admin` | `admin-dashboard.tsx` | 總部後台（HQ） |
| `/franchise-login` | `franchise-login.tsx` | 加盟主登入 |
| `/franchise-admin` | `franchise-admin.tsx` | 加盟主後台 |
| `/coach-login` | `franchise-login.tsx`（共用） | 老師登入 |
| `/coach-dashboard` | `coach-dashboard.tsx` | 老師後台 |
| `/payment-result` | `payment-result.tsx` | ECPay 付款後跳轉頁 |
| `/liff` / `/liff/:tab` | `liff-app.tsx` | LINE LIFF App（LINE 內使用） |
| `/privacy` | `privacy.tsx` | 隱私權政策 |
| `/refund` | `refund.tsx` | 退費政策 |

---

## 6. 後端 API 路由

### 公開路由（無需登入）

```
GET  /api/coaches                 首頁師資輪播（已過濾停用老師）
GET  /api/franchises              分校搜尋
GET  /api/faqs                    常見問題列表
GET  /api/success-stories         成功案例列表
GET  /api/site-content            官網 CMS 所有內容
GET  /api/popup-ads?date=YYYY-MM-DD  當日有效彈窗廣告
GET  /api/credit-packages         點數套餐（已登入家長依白名單過濾）
GET  /api/textbooks               教材列表
```

### 家長路由（需 parent session）

```
GET/POST        /api/bookings              預約管理
PATCH           /api/bookings/:id/cancel   取消預約
POST            /api/bookings/recurring    週期預約
GET             /api/bookings/calendar.ics ICS 行事曆匯出
GET/POST        /api/children              孩子管理
GET/POST/PATCH/DELETE /api/cart           購物車
POST            /api/credit-purchases      購買點數（建立 ECPay 訂單）
```

### 老師路由（需 coach session）

```
GET   /api/coach/calendar/:year/:month     月曆課表
GET   /api/coach/daily-record/:date        每日打卡記錄
GET   /api/coach/earnings                  薪資查詢
GET   /api/coach/my-info                   個人資料
PATCH /api/coach/my-info                   更新個人資料
PATCH /api/coach/bookings/:id/check-in     學生簽到
PATCH /api/coach/bookings/:id/absent       標記缺席
POST  /api/coach/contact-books             新增聯絡簿
PATCH /api/coach/contact-books/:id         更新聯絡簿
```

### 加盟主路由（需 franchise_admin session + `X-Franchise-Id` header）

```
GET/POST/PATCH/DELETE /api/franchise-admin/time-slots      時段管理
GET/POST/PATCH        /api/franchise-admin/coaches         師資管理
GET/POST              /api/franchise-admin/contact-books   聯絡簿管理
GET                   /api/franchise-admin/bookings        預約查詢
POST                  /api/franchise-admin/manual-booking  手動加課
GET/POST/DELETE       /api/franchise-admin/classrooms      教室管理
GET                   /api/franchise-admin/students        學生列表
```

### 總部路由（需 admin session）

```
GET/POST/PATCH/DELETE /api/admin/franchises            分校管理
GET/POST/PATCH/DELETE /api/admin/coaches               師資管理（跨分校）
GET/POST/PATCH        /api/admin/credit-packages       點數套餐
POST                  /api/admin/adjust-credits        手動加點
GET/POST/DELETE       /api/admin/popup-ads             彈窗廣告管理
GET                   /api/admin/stats                 總覽統計
GET                   /api/admin/franchise-analytics   各分校分析
GET                   /api/admin/parent-transactions   家長消費紀錄
GET                   /api/admin/credit-purchase-stats 購買點數統計
GET                   /api/admin/credit-consumption-stats 課消點數統計
GET                   /api/admin/ecpay-purchases       付款紀錄
POST                  /api/admin/ecpay-refund/:id      發起退款
PUT                   /api/admin/site-content          更新官網 CMS
PUT                   /api/admin/site-content/batch    批次更新 CMS
POST                  /api/admin/site-content/upload-image  上傳 CMS 圖片
GET/POST/PATCH/DELETE /api/admin/faqs                 FAQ 管理
GET/POST/PATCH/DELETE /api/admin/success-stories      成功案例管理
GET/POST/PATCH/DELETE /api/admin/announcements        公告管理
GET/POST/PATCH/DELETE /api/admin/products             商品管理
GET/PATCH             /api/admin/orders               訂單管理
POST                  /api/admin/textbooks            新增教材
PATCH/DELETE          /api/admin/textbooks/:id        編輯/刪除教材
```

### 認證路由

```
GET  /api/auth/line               LINE OAuth 起始（家長登入）
GET  /api/auth/line/callback      LINE OAuth 回調
POST /api/auth/line/send-otp      傳送手機 OTP
POST /api/auth/line/confirm-otp   驗證手機 OTP
POST /api/auth/liff               LIFF Token 換 session
POST /api/auth/change-password    修改後台帳號密碼

POST /api/line/webhook            LINE Messaging Webhook（接收訊息）
POST /api/ecpay/notify            ECPay 付款結果 Callback
GET  /api/ecpay/return            ECPay 付款後前端跳轉
```

---

## 7. 角色與權限系統

### 四種角色

| 角色 | 登入入口 | Session 機制 | 說明 |
|------|---------|-------------|------|
| `parent` | `/parent-login` | LINE OAuth / 手機 OTP | 一般家長 |
| `coach` | `/coach-login` | 帳號密碼（credential auth） | 老師 |
| `franchise_admin` | `/franchise-login` | 帳號密碼（credential auth） | 加盟主 |
| `admin` | `/hq-login` | 帳號密碼（credential auth） | 總部人員 |

### 兩套 Session 機制

**家長（LINE / OTP 登入）：**
```javascript
req.session.userId       // Replit users 表的 userId
req.session.userRole     // "parent"
```

**老師/加盟主/總部（帳密登入）：**
```javascript
req.session.credentialUserId  // 本地 users 表的 userId
req.session.userRole          // "coach" | "franchise_admin" | "admin"
```

### 加盟主多分校切換

加盟主可管理多個分校，前端在每個 API 請求的 header 帶入當前分校：
```
X-Franchise-Id: 9
```
後端用此 header 限制操作範圍。

### 老師停用保護

`coaches.isActive = false` 時：
- 停用老師無法登入（後端 middleware 攔截）
- 停用老師不出現在首頁輪播、分校詳情等公開頁面
- 仍可在後台師資管理中看到（供管理操作）

---

## 8. 外部服務串接

### LINE Login（家長登入）

- **Channel 類型：** LINE Login
- **OAuth 流程：** 前端 → `/api/auth/line` → LINE OAuth → `/api/auth/line/callback` → 建立 session
- **必須設定 Callback URL：** `https://你的網域/api/auth/line/callback`
- **LIFF 設定：** LINE Developers Console → LIFF → Endpoint URL 設為 `https://你的網域/liff`

### LINE Messaging API（客服訊息）

- **用途：** 接收家長 LINE 訊息，管理員後台可查看與回覆
- **Webhook URL：** `https://你的網域/api/line/webhook`
- 需在 LINE Developers Console 開啟 webhook 功能

### ECPay 綠界金流

付款流程：
1. 後端建立訂單 → 回傳 ECPay 表單
2. 前端 POST 到綠界 → 家長在綠界頁面刷卡
3. 綠界 POST 到 `/api/ecpay/notify` 更新付款狀態
4. 家長跳轉回 `/payment-result`

**正式上線 checklist：**
- [ ] 換上正式商店的 `ECPAY_MERCHANT_ID` / `ECPAY_HASH_KEY` / `ECPAY_HASH_IV`
- [ ] 將 `ECPAY_IS_SANDBOX` 改為 `false`
- [ ] 確認 `/api/ecpay/notify` 可被綠界伺服器訪問（非 localhost）

### Twilio Verify（手機 OTP）

- **用途：** 家長手機驗證、老師帳號建立時的 OTP
- **服務類型：** Twilio Verify（非 Twilio SMS API）
- 備援：三竹簡訊（Mitake），當 Twilio 失敗時自動切換

### Google Gemini AI（老師大頭照）

- **模型：** `gemini-2.5-flash-image`
- **功能：** 老師上傳照片 → AI 轉換成統一風格師資大頭照（數學教室背景、深色西裝）
- **程式位置：** `server/gemini-image.ts`

### Google Cloud Storage（圖片與 PDF）

- 公開圖片存在 `public/` 前綴，直接以 GCS URL 存取
- 私有 PDF（教材）存在 `.private/` 前綴，透過後端 API 串流給有權限的用戶
- **離開 Replit 時：** 需將 `@replit/object-storage` 改為 `@google-cloud/storage` + Service Account JSON

---

## 9. 本機開發啟動方式

### 前置需求

- Node.js 20+
- PostgreSQL 15+（建議用 Docker）
- Git

### 快速啟動

```bash
# 1. Clone 專案
git clone https://github.com/your-org/theprime.git
cd theprime

# 2. 安裝套件
npm install

# 3. 設定環境變數
cp .env.example .env
# 用你的編輯器填入 .env 所有必要值

# 4. 建立資料庫（PostgreSQL 要先跑起來）
createdb theprime

# 5. 推送 schema（建立所有資料表）
npm run db:push

# 6. （選用）載入種子資料
npx tsx server/seed.ts

# 7. 啟動開發伺服器
npm run dev
# → 開啟 http://localhost:5000
```

### 常用指令

```bash
npm run dev          # 開發模式（前後端同埠 :5000，熱更新）
npm run build        # 建置正式版 → dist/index.cjs
npm run start        # 執行正式版
npm run db:push      # 將 schema 變更推送到資料庫
npm run check        # TypeScript 型別檢查
```

### 開發時的測試帳號

執行 `seed.ts` 後，會有以下測試帳號可用（密碼請查看 seed.ts 內容）：

- 總部管理員：`admin`
- 加盟主：`franchise_admin_daantest`（大安教室）
- 老師：可在分校後台建立

---

## 10. 資料庫遷移與部署

### Schema 變更流程

本專案採用 Drizzle ORM 的 **push 模式**：

```bash
# 1. 修改 shared/schema.ts
# 2. 推送到資料庫
npm run db:push
```

> ⚠️ `db:push` 在開發時方便，但在**正式環境有刪除欄位的風險**。
> 建議正式環境切換為：
> ```bash
> npx drizzle-kit generate   # 產生 migration SQL
> npx drizzle-kit migrate    # 執行 migration
> ```

### migrations/ 資料夾

`migrations/` 下的 `.sql` 是歷史手動 migration，若需要在全新環境還原完整歷史，請依序執行：

```bash
psql $DATABASE_URL < migrations/0001_add_ecpay_trade_no.sql
psql $DATABASE_URL < migrations/0002_add_ecpay_internal_trade_no.sql
# ... 依序執行所有檔案
```

> 多數情況下，直接 `npm run db:push` 即可，不需要跑歷史 migration。

### 正式環境部署（非 Replit）

```bash
# 建置
npm run build

# 使用 PM2 管理 process
npm install -g pm2
NODE_ENV=production pm2 start dist/index.cjs --name theprime

# 或使用 Docker（需自備 Dockerfile）
docker build -t theprime .
docker run -p 5000:5000 --env-file .env theprime
```

---

## 11. 資料轉移 SOP

### 匯出資料庫

```bash
# 在目前 Replit 環境執行
pg_dump $DATABASE_URL \
  --no-owner \
  --no-acl \
  --format=plain \
  --file=theprime_backup_$(date +%Y%m%d).sql

# 若只需要資料（不含 schema）
pg_dump $DATABASE_URL \
  --no-owner \
  --no-acl \
  --data-only \
  --file=theprime_data_only_$(date +%Y%m%d).sql
```

### 匯入到新環境

```bash
# 方法一：完整匯入（schema + data）
psql $NEW_DATABASE_URL < theprime_backup_20260625.sql

# 方法二：先建 schema，再匯入資料
npm run db:push   # 建立所有資料表
psql $NEW_DATABASE_URL < theprime_data_only_20260625.sql
```

### 圖片與 PDF 轉移

1. 在 Replit 的 **Object Storage** 頁籤，下載所有檔案
2. 上傳到新環境的 GCS Bucket
3. 更新環境變數：`DEFAULT_OBJECT_STORAGE_BUCKET_ID`、`PUBLIC_OBJECT_SEARCH_PATHS`、`PRIVATE_OBJECT_DIR`

### 不需要轉移的資料

- `sessions` 表（用戶重新登入即可）
- `coach_reminder_logs`（執行 log，非業務資料）

---

## 12. GitHub 推送與接手注意事項

### 推送前確認 .gitignore

確認以下項目在 `.gitignore` 中（已預設設定好）：

```
node_modules/
dist/
.env
Secrets
uploads/
*.tar.gz
```

### ⚠️ 離開 Replit 平台的注意事項

#### 1. 認證系統需要替換

本專案後台（Admin / Franchise Admin / Coach）登入使用了 Replit 專屬的 User Store（`server/replit_integrations/`）。

**需要替換為：**
- Passport.js + Local Strategy（最相近的替代方案）
- 或任何支援 session-based auth 的方案

家長端的 LINE Login 不受影響，可直接使用。

#### 2. 物件儲存 SDK 需要替換

```javascript
// 目前（Replit 專屬）
import { getDefaultBucket } from "@replit/object-storage";

// 替換為（標準 GCP）
import { Storage } from "@google-cloud/storage";
const storage = new Storage({ keyFilename: "service-account.json" });
```

涉及函數：`server/routes.ts` 中的 `uploadPublicFile`、`uploadPrivatePdf`、`deletePublicFile`

#### 3. 其他不受影響的部分

- PostgreSQL 資料庫（只需更換 `DATABASE_URL`）
- LINE 相關功能
- ECPay 金流
- Twilio OTP
- Gemini AI

### 接手後第一步確認清單

- [ ] 設定所有環境變數（參考 `.env.example`）
- [ ] `npm install && npm run db:push`
- [ ] 替換 Replit Auth 為標準認證方案
- [ ] 替換 `@replit/object-storage` 為 GCS SDK
- [ ] 更新 LINE Developers Console 的 Callback / Webhook URL
- [ ] ECPay 換正式金鑰、`ECPAY_IS_SANDBOX=false`
- [ ] 設定 HTTPS 憑證（ECPay 和 LINE 都要求 HTTPS）
- [ ] 測試所有主要流程：預約、購買點數、聯絡簿、金流

---

## 13. 目錄結構說明

```
theprime/
│
├── client/                         前端 React App
│   └── src/
│       ├── App.tsx                 路由設定（wouter）
│       ├── pages/                  每個路由對應一個頁面檔
│       │   ├── landing.tsx         官網首頁（~5000 行，最大）
│       │   ├── admin-dashboard.tsx 總部後台（~4500 行）
│       │   ├── franchise-admin.tsx 加盟主後台（~3500 行）
│       │   ├── coach-dashboard.tsx 老師後台
│       │   ├── parent-dashboard.tsx 家長後台
│       │   └── liff-app.tsx        LINE LIFF App
│       ├── components/             共用 UI 元件
│       ├── hooks/                  自訂 React hooks
│       │   ├── use-auth.ts         家長認證狀態
│       │   ├── use-credential-auth.ts  後台帳密認證狀態
│       │   └── use-site-content.ts CMS 內容讀取
│       └── lib/
│           └── queryClient.ts      TanStack Query + fetch 設定
│
├── server/                         後端 Express App
│   ├── index.ts                    伺服器進入點、session 設定
│   ├── routes.ts                   所有 API 路由（~4000 行）
│   ├── storage.ts                  DB 操作層（IStorage 介面 + 實作）
│   ├── db.ts                       Drizzle DB 連線
│   ├── gemini-image.ts             AI 大頭照生成（Gemini）
│   ├── line.ts                     LINE API 工具函數
│   ├── seed.ts                     種子資料（開發用）
│   ├── simulate-data.ts            模擬營運資料生成
│   ├── static.ts                   靜態檔案服務
│   ├── vite.ts                     開發模式 Vite 整合
│   ├── replit_integrations/        Replit 專屬模組（遷移時需替換）
│   └── tests/                      單元測試
│
├── shared/
│   └── schema.ts                   DB Schema + 所有 TypeScript 型別（唯一真相來源）
│
├── migrations/                     歷史手動 SQL migration 檔
├── scripts/
│   └── post-merge.sh               CI/CD 後自動執行腳本
├── artifacts/
│   └── mockup-sandbox/             UI 原型沙盒（設計用，不影響主程式）
├── docs/                           開發文件
│
├── package.json                    套件清單與 npm 指令
├── drizzle.config.ts               Drizzle ORM 設定
├── tailwind.config.ts              Tailwind 設定（含設計 token）
├── vite.config.ts                  Vite 打包設定
├── tsconfig.json                   TypeScript 設定
├── components.json                 Shadcn/UI 設定
├── replit.md                       專案概覽與 User Preferences
├── .env.example                    環境變數範本（無機密值）
└── HANDOVER.md                     本文件
```

---

## 14. 核心業務邏輯筆記

### 點數（堂數）系統

- 家長購買「堂數」套餐，存入家庭錢包（`credit_balances` 表，per-package 記錄）
- 預約時自動扣 1 堂，取消時退回（前提：開課前 4 小時）
- 扣點採 **FIFO 原則**（先到期的先扣）
- 套餐可設定 `isRestricted = true` + `allowedList`，限定特定學號或家長帳號才能購買
- `POST /api/admin/reconcile-credits` 可修正歷史資料不一致

### 預約保護機制

- 使用 `pg_advisory_xact_lock` 防止同一孩子同時段被重複預約（race condition）
- 最早可提前 3 天預約（`ADVANCE_BOOKING_DAYS = 3`）
- 取消截止：開課前 4 小時；超過後無法退堂數

### 老師薪資計算

薪資有三種模式（`coaches.compensationType`）：

| 模式 | 說明 |
|------|------|
| `fixed` | 每堂固定金額（`compensationAmount` 元） |
| `hourly` | 時薪 × 上課小時數 |
| `percentage` | 當堂收入 × 百分比 |

老師每日透過「打卡」建立 `coach_daily_records`，薪資從這裡計算。

### CMS 系統

官網所有文字由 `site_content` 表管理（key-value），HQ 管理員可在後台即時修改。

**新增 CMS 欄位時，必須同時修改三處：**

1. `client/src/pages/landing.tsx` → 使用 `useSiteContent("新.key")` 取值
2. `client/src/pages/admin-dashboard.tsx` → 欄位定義陣列加入新 key
3. `client/src/pages/admin-dashboard.tsx` → `SITE_CONTENT_DEFAULTS` 加入預設值

### 彈窗廣告系統

- HQ 上傳圖片並設定 `startDate` / `endDate` 檔期
- 首頁載入 1 秒後，從當日有效廣告中隨機取一則
- 用 `sessionStorage` 防止同一次瀏覽重複彈出
- 可設定點擊連結（可導向 LINE 好友、報名頁等）

### 加盟主多分校管理

- `users.managedFranchiseIds`（integer array）儲存可管理的分校 ID
- 前端切換分校時，API 請求帶 `X-Franchise-Id` header
- 後端 middleware 驗證此 header 是否在 `managedFranchiseIds` 內

### 跨分校老師名稱同步

老師可在多個分校任教（`coaches` 表可有多筆相同 `userId`）。
修改老師姓名時，系統自動同步更新所有相同 `userId` 的 coaches 紀錄。

### 首頁搜尋流程

1. 選擇縣市 → 動態載入區域清單
2. 選擇時段偏好 → 搜尋有符合時段的分校
3. 搜尋結果：已收藏的分校置頂顯示
4. 點擊分校 → 分校詳情頁 → 選擇時段 → 確認預約

---

*文件由開發方整理，最後更新於 2026-06-25。*
*如有任何問題，請查閱 `replit.md` 或聯繫原始開發方。*
