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
- Photos imported via `@assets/...` in landing.tsx and search-results.tsx

## Landing Page Sections (top to bottom)
1. Hero - Animated title reveal + Skyscanner-style search with glowing CTA + social proof
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
- `shared/schema.ts` - All data models
- `server/routes.ts` - All API routes
- `server/storage.ts` - DatabaseStorage with CRUD methods
- `server/seed.ts` - Seed data (uses 老師; 1:5 ratio only in FAQ answer)
- `client/src/pages/landing.tsx` - Public landing page with carousels, animated hero
- `client/src/pages/parent-dashboard.tsx` - Parent dashboard
- `client/src/pages/admin-dashboard.tsx` - Admin CMS
- `client/src/pages/search-results.tsx` - Search results with teacher avatars
- `client/src/components/coach-card.tsx` - Coach card with photo + seat dots

## Database Tables
- users, sessions (Replit Auth)
- franchises (location-based classrooms)
- coaches (certified instructors)
- children (managed by parents)
- time_slots (bookable time periods)
- bookings (parent-child-slot reservations)
- faqs, success_stories, announcements (CMS content)

## User Roles
- `parent` (default) - Manage children, book sessions
- `admin` - CMS management, view stats

## API Routes
### Public
- GET /api/coaches, /api/franchises, /api/faqs, /api/success-stories
- GET /api/search-slots?city=X&grade=Y

### Protected (requires auth)
- GET/POST/DELETE /api/children
- GET/POST /api/bookings, PATCH /api/bookings/:id/cancel

### Admin
- GET /api/admin/stats
- CRUD: /api/admin/faqs, /api/admin/success-stories, /api/admin/announcements
- GET /api/admin/franchises, /api/admin/coaches
