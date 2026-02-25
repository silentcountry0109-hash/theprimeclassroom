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

## Key Files
- `shared/models/auth.ts` - User/session tables (Replit Auth)
- `shared/schema.ts` - All data models (franchises, coaches, children, time_slots, bookings, faqs, success_stories, announcements)
- `server/routes.ts` - All API routes
- `server/storage.ts` - DatabaseStorage with CRUD methods
- `server/seed.ts` - Seed data for development
- `client/src/pages/landing.tsx` - Public landing page with Skyscanner-style search
- `client/src/pages/parent-dashboard.tsx` - Parent dashboard (manage children, bookings)
- `client/src/pages/admin-dashboard.tsx` - Admin CMS (FAQs, stories, franchises, coaches, announcements)
- `client/src/pages/search-results.tsx` - Search results with booking dialog
- `client/src/components/navbar.tsx` - Public navigation bar
- `client/src/components/coach-card.tsx` - Coach card with seat indicator dots

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
