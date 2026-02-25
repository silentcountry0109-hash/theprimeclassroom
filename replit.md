# The Prime 質數教室

## Overview
S2B2C education platform for elementary school math tutoring in Taiwan. Features a brand website, parent system, and HQ admin dashboard.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + Shadcn/UI + Framer Motion
- **Backend**: Express.js + Drizzle ORM + PostgreSQL
- **Auth**: Replit Auth (OpenID Connect)
- **Routing**: Wouter (client-side), Express (server-side)

## Design System
- **Primary Color**: Tiffany Blue (#81D8D0) - used for accents, CTAs
- **Secondary**: Coral (#FFB7B2), Amber Warm (#FFF9E5)
- **Background**: Washi (#FAF9F6) - warm paper white
- **Typography**: Noto Sans TC (body), Shippori Mincho (headings)
- **Style**: Japanese minimalist with grid paper background pattern

## Terminology
- All UI text uses 老師 (teacher) — never 教練 (coach)
- Code-level variable names still use "coach" in schema/routes for backward compatibility

## Warm Photos (attached_assets/)
- teacher_1-6.png: Teacher portraits (3:4), mapped by name in TEACHER_PHOTOS constant
- student_boy_1/2/3.png, student_girl_1/2.png: Student portraits (1:1) for testimonials carousel
- hero_classroom.png: Warm tutoring classroom scene (16:9)
- learning_detail.png, parent_child.png: Section feature images (4:3)
- Photos imported via `@assets/...` in landing.tsx, search-results.tsx, classroom-detail.tsx

## Search Flow (Franchise-Centric)
1. Hero search: City → District (cascading dropdown) → Day/Time (chip selectors)
2. Search results: Franchise/classroom cards with tags, ratings, available slot counts
3. Click card → Classroom detail page with teacher list + bookable time slots
- Search API: GET /api/search-franchises?city=&district=&days=&periods=
- Detail API: GET /api/franchises/:id/detail

## Landing Page Sections (top to bottom)
1. Hero - Animated title reveal + search bar (city/district/time) + social proof
2. BrandPhilosophy - 品牌與教學理念 (classroom photo + 4 philosophy cards + brand quote)
3. TeachingMethod - 4 cards (螺旋式課程, 階梯式教學, 單元評測, 個別指導)
4. LearningMap - 學習地圖 section with timeline mockup (left: description + 4 highlight cards, right: visual progress tracker)
5. Textbook - 教材介紹 with grade progression and 4-step flow
6. Features - 3 cards with photos (個別指導, 專業認證師資, 彈性預約制度)
7. Coaches - Auto-sliding carousel with left/right navigation
8. Process - 4-step "如何開始" flow
9. Testimonials - Auto-sliding single-card carousel with student photos
10. FAQ - Accordion grouped by category
11. CTA - Parent-child photo + booking call-to-action
12. Footer - Links + contact info + 分校管理 button for franchise owners

## Key Files
- `shared/models/auth.ts` - User/session tables (Replit Auth)
- `shared/schema.ts` - All data models (franchises now have tags, rating, reviewCount, nearbySchools, photos)
- `shared/constants.ts` - Taiwan city/district data, day labels, time period constants
- `server/routes.ts` - All API routes
- `server/storage.ts` - DatabaseStorage with CRUD methods + searchFranchises + getFranchiseDetail
- `server/seed.ts` - Seed data (8 franchises across 4 cities, 9 coaches)
- `client/src/pages/landing.tsx` - Public landing page with carousels, animated hero
- `client/src/pages/search-results.tsx` - Franchise card search results with sidebar filters
- `client/src/pages/classroom-detail.tsx` - Franchise detail with coaches + bookable time slots
- `client/src/pages/parent-dashboard.tsx` - Parent dashboard (top-tab layout: 首頁/預約課程/我的孩子/預約紀錄)
- `client/src/pages/admin-dashboard.tsx` - Admin CMS
- `client/src/components/coach-card.tsx` - Coach card with photo + seat dots

## Database Tables
- users, sessions (Replit Auth) — users now include phone, address, referralSource fields
- franchises (location-based classrooms with tags, rating, reviewCount, nearbySchools, photos array)
  - Photos uploaded via multer to /uploads/ directory, served statically
- coaches (certified instructors)
- children (managed by parents)
- time_slots (bookable time periods, date stored as text YYYY-MM-DD)
- bookings (parent-child-slot reservations)
- faqs, success_stories, announcements (CMS content)
- products (shop items: 教材/教具, price in TWD, discountPrice, stock, isActive)
- cart_items (user cart: userId + productId + quantity)
- orders (userId, totalAmount, status: pending/paid/shipped/completed/cancelled)
- order_items (orderId + productId + productName + quantity + unitPrice)
- site_content (sectionKey unique, value text — CMS key-value for editable landing page text)

## Authentication
- Parents: Replit Auth (OIDC) via /api/login
- Admin & Franchise Admin: Credential-based login (username/password)
  - HQ admin login page: /hq-login (hidden, no links on public site)
  - Franchise admin login page: /franchise-login (linked in footer only)
  - Credentials set by HQ admin via 帳號管理 tab
  - Default admin: username=admin, password=admin123

## User Roles
- `parent` (default) - Manage children, book sessions
  - Login: /parent-login (supports both login and registration)
  - Default seeded accounts: parent1, parent2, parent3 (password: `parent123`)
- `admin` (總部管理員) - Full CMS management, franchise CRUD, user/director account management
  - Login: /hq-login → /admin
  - Default: username=`admin`, password=`admin123`
- `franchise_admin` (分校主任) - Manage own franchise info, coaches, time slots, photos, view bookings
  - Login: /franchise-login → /franchise-admin
  - Linked to a specific franchise via `users.franchiseId`
  - Default password for all seeded franchise admins: `prime123`
  - Accounts: daan, xinyi, zhongshan, banqiao, yonghe, zhongli, taoyuan, xitun

## API Routes
### Public
- GET /api/coaches, /api/franchises, /api/faqs, /api/success-stories
- GET /api/search-franchises?city=&district=&days=1,3,5&periods=morning,afternoon
- GET /api/franchises/:id/detail
- GET /api/search-slots?city=X (legacy)

### Parent Auth
- POST /api/parent-register (username, password, firstName, email?)
- POST /api/credential-login (works for all roles including parent)

### Protected (requires credential or Replit auth)
- GET/POST/DELETE /api/children
- GET/POST /api/bookings, PATCH /api/bookings/:id/cancel
- GET /api/products (public, active only)
- GET/POST/PATCH/DELETE /api/cart (shopping cart CRUD)
- POST /api/orders (create order from cart items)
- GET /api/orders, GET /api/orders/:id (order history)

### Admin (isAdmin middleware - role=admin only)
- GET /api/admin/stats
- CRUD: /api/admin/faqs, /api/admin/success-stories, /api/admin/announcements
- CRUD: /api/admin/franchises (GET all, POST create, PATCH/:id update, DELETE/:id)
- CRUD: /api/admin/coaches (GET all, POST create, PATCH/:id update, DELETE/:id)
- GET /api/admin/franchises/:id/coaches, GET /api/admin/franchises/:id/slots
- POST /api/admin/time-slots, DELETE /api/admin/time-slots/:id
- GET /api/admin/users, PATCH /api/admin/users/:id/role

### Franchise Admin (isFranchiseAdmin middleware - role=franchise_admin only)
- GET /api/franchise-admin/my-franchise, PATCH (edit description/phone/tags/nearbySchools)
- GET /api/franchise-admin/stats
- CRUD: /api/franchise-admin/coaches (scoped to own franchise)
- GET/POST/DELETE /api/franchise-admin/time-slots (scoped to own franchise)
- GET /api/franchise-admin/bookings (scoped to own franchise)

## HQ Admin Dashboard Tabs (/admin)
- 總覽: Stats cards (students, coaches, franchises, bookings)
- 常見問題: FAQ CRUD
- 成功案例: Success stories CRUD
- 加盟分校: Full franchise CRUD (name, city/district, address, phone, tags, nearbySchools, rating, reviewCount, isActive toggle)
- 老師管理: Full coach CRUD (name, franchise assignment, bio, specialties, rating, certified toggle)
- 時段管理: Per-franchise time slot management (select franchise → view/add/delete slots)
- 帳號管理: User role management (assign parent/franchise_admin/admin, link franchise_admin to specific franchise)
- 公告管理: Announcements CRUD
- 商城管理: Product CRUD + Order management
- 官網編輯: CMS editor for landing page text content (section-based editing with real-time preview)

## Franchise Admin Dashboard (/franchise-admin)
- 分校總覽: Stats (coaches, slots, bookings, confirmed) + date-range analytics merged in
  - KPI cards: 開課時段, 預約數, 取消數, 座位使用率
  - Daily bar chart: per-day seat usage with color coding (80%↑ tiffany, 50-79% coral, <50% gray)
  - Coach table: per-coach slots, bookings, booked seats, usage rate
  - API: GET /api/franchise-admin/stats/date-range?startDate=&endDate=
- Sidebar name format: `{city} {district without 區}教室` (e.g. "台北市 信義教室")
- 分校資訊: Edit own franchise description, phone, tags, nearby schools + photo management
- 師資管理: CRUD coaches for own franchise only
- 時段管理: CRUD time slots for own franchise only
- 預約管理: View bookings for own franchise (child name, grade, school, date/time, status)

## Parent Dashboard UX (/dashboard or / when logged in)
- Top tab navigation (mobile-friendly) instead of sidebar
- **首頁 (Overview)**: Stats cards (children, upcoming, completed, quick-book), upcoming bookings timeline, onboarding prompt when no children
- **預約課程 (Book)**: 3-step inline flow — search classrooms → select time slot → select child & confirm → recurring weekly dialog
  - Duplicate booking prevention: backend rejects same child + same slot if confirmed booking exists
  - Recurring booking: after successful booking, dialog offers same weekday/time for next 4 weeks
  - API: POST /api/bookings/recurring (batch book multiple slots), GET /api/bookings/recurring-slots (find matching future slots)
- **我的孩子 (Children)**: Child cards with booking stats per child, AlertDialog confirmation on delete
- **預約紀錄 (Bookings)**: Filter tabs (全部/即將上課/已完成/已取消) with counts, AlertDialog confirmation on cancel
- Confirmation dialogs (AlertDialog) for all destructive actions (delete child, cancel booking)

## Franchise Tags
- 家長好評推薦 (amber styling)
- 年度績優校區 (tiffany styling)
- 成績進步快速 (coral styling)

## Mobile RWD
- Mobile-first approach with `sm:`, `md:` breakpoints
- Navbar: h-16 on mobile, h-20 on desktop; hamburger menu for mobile nav
- All landing sections: py-14 md:py-24, px-4 md:px-6, text-2xl md:text-4xl for headings
- Hero: text-4xl sm:text-5xl md:text-7xl, math symbols hidden on mobile, search bar vertical stacking with border-b dividers
- Cards/grids: reduced padding (p-5 md:p-8), smaller gaps (gap-4 md:gap-8)
- Process steps: grid-cols-2 on mobile (2x2), grid-cols-4 on desktop
- Carousel nav buttons: w-8 h-8 sm:w-10 sm:h-10
- Footer: grid-cols-2 on mobile, grid-cols-4 on desktop
- Dashboard stat cards: p-3 sm:p-4, smaller icons on mobile
- Dashboard tabs: text-xs sm:text-sm, px-3 sm:px-4
- Search/detail pages: pt-20 md:pt-24 for navbar clearance

## Coach Photo Mapping (by name, not ID)
- 林佳慧→teacher_1, 陳志明→teacher_2, 王雅琪→teacher_3
- 張育銘→teacher_4, 李美玲→teacher_5, 黃建宏→teacher_6
