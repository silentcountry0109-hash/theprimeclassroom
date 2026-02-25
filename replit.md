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
- teacher_1-6.png: AI-generated teacher portraits (3:4), mapped to coaches by ID
- hero_classroom.png: Warm tutoring classroom scene (16:9)
- learning_detail.png: Close-up of child doing math (4:3)
- parent_child.png: Parent-child learning together (4:3)
- student_success.png: Student celebrating achievement (4:3)
- Photos imported via `@assets/...` in landing.tsx and search-results.tsx

## Key Files
- `shared/models/auth.ts` - User/session tables (Replit Auth)
- `shared/schema.ts` - All data models (franchises, coaches, children, time_slots, bookings, faqs, success_stories, announcements)
- `server/routes.ts` - All API routes
- `server/storage.ts` - DatabaseStorage with CRUD methods
- `server/seed.ts` - Seed data for development (uses 老師 terminology)
- `client/src/pages/landing.tsx` - Public landing page with warm photos, Skyscanner-style search
- `client/src/pages/parent-dashboard.tsx` - Parent dashboard (manage children, bookings)
- `client/src/pages/admin-dashboard.tsx` - Admin CMS (FAQs, stories, franchises, coaches, announcements)
- `client/src/pages/search-results.tsx` - Search results with teacher avatars and booking dialog
- `client/src/components/navbar.tsx` - Public navigation bar
- `client/src/components/coach-card.tsx` - Coach card with seat indicator dots and teacher photo

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
