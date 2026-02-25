# 質數數學 The Prime Math

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
2. ClassroomShowcase - Photo + text about learning environment
3. Features - 3 cards with photos (個別指導, 專業認證師資, 彈性預約制度)
4. Coaches - Auto-sliding carousel with left/right navigation
5. Process - 4-step "如何開始" flow
6. Testimonials - Auto-sliding single-card carousel with student photos
7. FAQ - Accordion grouped by category
8. CTA - Parent-child photo + booking call-to-action
9. Footer - Links + contact info + 分校管理 button for franchise owners

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
- `client/src/pages/parent-dashboard.tsx` - Parent dashboard
- `client/src/pages/admin-dashboard.tsx` - Admin CMS
- `client/src/components/coach-card.tsx` - Coach card with photo + seat dots

## Database Tables
- users, sessions (Replit Auth)
- franchises (location-based classrooms with tags, rating, reviewCount, nearbySchools, photos array)
  - Photos uploaded via multer to /uploads/ directory, served statically
- coaches (certified instructors)
- children (managed by parents)
- time_slots (bookable time periods, date stored as text YYYY-MM-DD)
- bookings (parent-child-slot reservations)
- faqs, success_stories, announcements (CMS content)

## Authentication
- Parents: Replit Auth (OIDC) via /api/login
- Admin & Franchise Admin: Credential-based login (username/password)
  - HQ admin login page: /hq-login (hidden, no links on public site)
  - Franchise admin login page: /franchise-login (linked in footer only)
  - Credentials set by HQ admin via 帳號管理 tab
  - Default admin: username=admin, password=admin123

## User Roles
- `parent` (default) - Manage children, book sessions via Replit Auth
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

### Protected (requires auth)
- GET/POST/DELETE /api/children
- GET/POST /api/bookings, PATCH /api/bookings/:id/cancel

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

## Franchise Admin Dashboard (/franchise-admin)
- 分校總覽: Stats (coaches, slots, bookings, confirmed)
- 分校資訊: Edit own franchise description, phone, tags, nearby schools
- 師資管理: CRUD coaches for own franchise only
- 時段管理: CRUD time slots for own franchise only
- 預約管理: View bookings for own franchise (child name, grade, school, date/time, status)

## Franchise Tags
- 家長好評推薦 (amber styling)
- 年度績優校區 (tiffany styling)
- 成績進步快速 (coral styling)

## Coach Photo Mapping (by name, not ID)
- 林佳慧→teacher_1, 陳志明→teacher_2, 王雅琪→teacher_3
- 張育銘→teacher_4, 李美玲→teacher_5, 黃建宏→teacher_6
