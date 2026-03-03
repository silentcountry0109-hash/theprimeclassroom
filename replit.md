# The Prime 質數教室

## Overview
The Prime 質數教室 is an S2B2C (Service-to-Business-to-Consumer) education platform designed for elementary school math tutoring in Taiwan. Its primary purpose is to connect parents with tutoring services. The platform comprises a brand website for public access, a comprehensive parent system for booking and management, and an HQ admin dashboard for overall operational control. The project aims to become a leading digital platform for elementary math education, offering a seamless and engaging experience for students, parents, and educators.

## User Preferences
- **Communication Style**: Clear, concise, and professional.
- **Workflow**: Iterative development with regular check-ins.
- **Interaction**: Ask for confirmation before implementing significant architectural changes or adding new external dependencies.

## System Architecture
The platform is built with a modern web stack. The frontend utilizes React with Vite, Tailwind CSS for styling, Shadcn/UI for components, and Framer Motion for animations, providing a dynamic and responsive user interface. The backend is powered by Express.js, using Drizzle ORM for database interactions with PostgreSQL. Authentication is handled via Replit Auth (OpenID Connect). Client-side routing is managed by Wouter, while Express handles server-side routing.

**UI/UX Design:**
The design aesthetic is Japanese minimalist, featuring a grid paper background pattern.
- **Color Scheme**: Primary accents use Tiffany Blue (#81D8D0), complemented by Coral (#FFB7B2) and Amber Warm (#FFF9E5). The background is a warm paper white called Washi (#FAF9F6).
- **Typography**: Noto Sans TC is used for body text, and Shippori Mincho for headings.
- **Terminology**: All UI text uses "老師" (teacher).

**Technical Implementations:**
- **Search Flow**: A franchise-centric search allows users to filter by city, district, day, and time, leading to detailed classroom pages with teacher lists and bookable time slots.
- **Landing Page**: Features an animated hero section, brand philosophy, teaching methodology, learning map, textbook information, core features, coach carousel, enrollment process, testimonials, FAQ, and calls to action.
- **Parent Dashboard**: Provides a personalized experience with top-tab navigation, including an overview, course booking, child management, booking history, contact books, and an e-commerce shop. It features recurrence booking options and a 4-hour cancellation policy enforcement.
- **Admin Dashboards**: Separate dashboards for HQ admins and franchise admins offer comprehensive management capabilities for franchises, coaches, time slots, content (FAQ, success stories, announcements), user accounts, and e-commerce (products, orders). Franchise admins have scoped access to manage their specific franchise.
- **Coach Dashboard**: Coaches can view their calendar, manage student information, write contact books, and update their profiles.
- **Mobile Responsiveness**: A mobile-first approach is implemented across all interfaces using `sm:`, `md:` breakpoints, adjusting layout, typography, and element sizes for optimal viewing on various devices.

**Feature Specifications:**
- **User Roles**: Supports `parent`, `admin`, `franchise_admin`, and `coach` roles, each with distinct access levels and functionalities.
- **CRM/CMS**: Includes robust content management capabilities for FAQs, success stories, announcements, and editable landing page content.
- **E-commerce**: Integrated product catalog, shopping cart, and order management system.
- **Contact Books**: Digital contact books for coaches to record lesson progress and for parents to track their children's performance.
- **Default Image Fallbacks**: Classroom and teacher images use Vite-bundled assets from `attached_assets/` as fallbacks when database values are null. Shared utility at `client/src/lib/default-images.ts` provides `getDefaultClassroomImage(id)` for franchise photos and `getCoachPhoto(name, id, photoUrl)` for teacher avatars. This ensures images display correctly in production (autoscale) where `uploads/` directory is not persisted.
- **ICS Calendar Export**: Parents can export confirmed bookings to their calendars with reminder alarms.
- **Favorite Franchises**: Parents can toggle a heart icon on franchise search cards to mark favorites. Favorited classrooms are pinned to the top of search results with a coral highlight. Data stored in `favoriteFranchises` table (userId + franchiseId). API: GET/POST/DELETE `/api/favorite-franchises/:franchiseId`.
- **HQ Admin Analytics Dashboard**: The admin OverviewTab displays 6 summary stat cards (students, coaches, franchises, bookings, avg occupancy, this-month bookings) plus a per-franchise analytics breakdown with sortable/filterable cards showing coaches, students, bookings, occupancy rate, upcoming slots, and monthly metrics. API: GET `/api/admin/franchise-analytics`.
- **School Cascading Dropdown**: When adding/editing a child, school is a required field using 3 cascading Select dropdowns: City → District → Elementary School. Data sourced from `shared/taiwan-schools.ts` covering all 22 Taiwan counties/cities, including private elementary schools (私校附設國小部). School value stored as concatenated string (e.g., "台北市大安區大安國小"). Legacy school data is handled with a migration hint during edit.
- **Booking 3-Day Advance Restriction**: Parents must book at least 3 days in advance (e.g., if today is 3/2, earliest bookable date is 3/5). Backend enforces in `POST /api/bookings` and `POST /api/bookings/recurring`. Frontend shows "(不可預約)" on date tabs for too-soon dates and disables the booking button with "需提前 3 天" text. All date calculations use UTC+8 (Asia/Taipei) timezone.
- **Coach Filter in Booking Flow**: In the booking detail page (step 2), a coach/teacher dropdown filter is shown when the franchise has more than 1 coach. Parents can filter time slots by selecting a specific coach or "全部老師" (all coaches).
- **Student Code (學生編碼)**: Each child gets a unique `studentCode` in format `YYYYMMDDXXXX` (8-digit Taiwan date + 4-digit sequential, no dash). Auto-generated on creation via `generateStudentCode()` in `server/storage.ts`. Displayed on parent dashboard child cards and coach dashboard student lists. Existing children are backfilled on server startup.
- **Week Navigation for Date Selection**: Booking flow date selection includes a week navigator (← prev / next →) above the horizontal date tabs. Shows `M/D(weekday) ~ M/D(weekday)` format. Auto-advances to the first week with bookable dates. `weekOffset` state controls the view, reset when switching franchises.
- **Auto Calendar Sync**: The "加入行事曆" button in BookingsTab is replaced with a Toggle Switch ("自動加入行事曆"). When enabled (stored in `localStorage` key `autoCalendarSync`), booking success (`bookMutation` and `recurringMutation`) automatically triggers `.ics` file download after 1 second delay. On mobile, opening the `.ics` triggers the system calendar import dialog. The `triggerCalendarDownload()` helper is defined outside components for reuse.
- **Coach Phone Number**: The `coaches` table has a `phone` text field. Franchise admins can set it when adding/editing a coach. Displayed in the coach card with a Phone icon.
- **Coach Cross-Franchise Schedule View**: Franchise admins can click the calendar icon on a coach card to view all of that coach's time slots across all franchises, grouped by date. API: `GET /api/franchise-admin/coaches/:id/schedule`.
- **Scheduling Conflict Checks**: When creating a new time slot (`POST /api/franchise-admin/time-slots`), the backend checks: 1) Room/classroom overlap — no overlapping time slots at the same franchise on the same date; 2) Coach overlap — the assigned coach must not have overlapping slots at any franchise on the same date. Returns 409 with a Chinese error message describing the conflict. Frontend displays the error via toast.
- **Coach Account Auto-Generation**: When franchise admin clicks "建立帳號", the system auto-generates credentials: username = `{name}@prime` (with numeric suffix if duplicate), password = phone last 6 digits. No manual input needed. The `users` table has a `mustChangePassword` boolean field. New coach accounts are created with `mustChangePassword=true`. On first login, a modal forces the coach to set a new password. After changing password, the coach is redirected to dashboard with a "綁定成功" success dialog. Admin reset-password also sets `mustChangePassword=true`. The change-password API (`POST /api/auth/change-password`) is gated to coach role with `mustChangePassword=true`.

## External Dependencies
- **Replit Auth**: Used for OpenID Connect based authentication for parent users.
- **PostgreSQL**: The relational database used for all application data storage.
- **Multer**: Used for handling file uploads, specifically for franchise photos, which are then served statically.
- **Framer Motion**: Integrated for advanced animations and transitions in the frontend.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **Shadcn/UI**: Component library built on Tailwind CSS for consistent UI elements.