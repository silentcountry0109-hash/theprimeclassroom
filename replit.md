# The Prime 質數教室

## Overview
The Prime 質數教室 is an S2B2C education platform for elementary school math tutoring in Taiwan, connecting parents with tutoring services. It features a public brand website, a parent system for booking and management, and an HQ admin dashboard for operations. The project aims to be a leading digital platform in elementary math education, providing a seamless experience for students, parents, and educators.

## User Preferences
- **Communication Style**: Clear, concise, and professional.
- **Workflow**: Iterative development with regular check-ins.
- **Interaction**: Ask for confirmation before implementing significant architectural changes or adding new external dependencies.

## System Architecture
The platform uses a modern web stack with React, Vite, Tailwind CSS, Shadcn/UI, and Framer Motion for the frontend, and Express.js with Drizzle ORM and PostgreSQL for the backend. Authentication is handled by Replit Auth (OpenID Connect). Client-side routing uses Wouter, while Express manages server-side routing. All interfaces are mobile-responsive.

**UI/UX Design:**
The design is Japanese minimalist, featuring a grid paper background.
- **Color Scheme**: Tiffany Blue (#81D8D0), Coral (#FFB7B2), Amber Warm (#FFF9E5), and a Washi (#FAF9F6) background.
- **Typography**: Noto Sans TC for body, Shippori Mincho for headings.
- **Terminology**: All UI text uses "老師" (teacher).

**Technical Implementations:**
- **User Roles**: Supports `parent`, `admin`, `franchise_admin`, and `coach` roles.
- **Search Flow**: Franchise-centric search by city, district, day, and time, leading to classroom pages with bookable time slots.
- **Landing Page**: Features an animated hero section, brand philosophy, methodology, learning map, features, coach carousel, enrollment, testimonials, FAQ, and calls to action.
- **Parent Dashboard**: Provides personalized experience with course booking, child management, booking history, contact books, and an e-commerce shop. Includes recurrence booking and a 4-hour cancellation policy. Supports ICS calendar export for bookings and a toggle for auto calendar sync. Parents can mark favorite franchises, which are pinned to search results.
- **Admin Dashboards**: Separate dashboards for HQ admins and franchise admins. HQ admins have an analytics dashboard with summary stats and per-franchise breakdowns. Franchise admins manage franchises, coaches, time slots, content, users, and e-commerce. They can view today's stats, manually book students, manage classrooms, and view coach schedules across all franchises.
- **Coach Dashboard**: Coaches manage their calendar, student info, contact books, and profiles. Daily work records track check-ins and contact books for salary calculation. The `getCoachDailyRecord` method queries contact books via `bookingId` (not slotId) since the `contact_books` table links to bookings, not slots directly. The `getContactBooksBySlot` method includes all non-cancelled booking statuses (confirmed, checked_in, completed).
- **Booking Management**: Booking status flows from `confirmed` to `checked_in` to `completed`. Coaches check-in/uncheck-in students. A 3-day advance booking restriction is enforced. Booking flow includes a coach filter dropdown and a week navigation for date selection.
- **Student Management**: Each child receives a unique `studentCode`. Franchise admins can manage students, view booking history, and contact books.
- **Coach Account Management**: Franchise admins can auto-generate coach accounts with temporary passwords requiring immediate change on first login. Coach phone numbers can be set and displayed.
- **Classroom Management**: Franchise admins can create, rename, and delete classrooms. Time slots can be assigned to specific classrooms. Conflict checking is implemented per classroom.
- **Business Hours**: Franchise business hours are configurable per day, affecting time slot creation validation.
- **Notification System**: A robust system notifies parents and coaches about slot cancellations, assignments, and removals, accessible via dashboard bell icons.
- **Slot Deletion Protection**: Safeguards prevent deletion of slots with active bookings; force-deletion requires confirmation and notifies affected parties.
- **Deactivated Coach Login Block**: When a coach's `isActive` is set to `false` in the `coaches` table, they cannot log in. The `POST /api/credential-login` endpoint checks `coaches.isActive` after password verification and returns 403 with "此帳號已被停用，請聯繫管理員".

## External Dependencies
- **Replit Auth**: OpenID Connect for user authentication.
- **PostgreSQL**: Primary relational database.
- **Multer**: Handles file uploads for images.
- **Framer Motion**: Frontend animation library.
- **Tailwind CSS**: Utility-first CSS framework.
- **Shadcn/UI**: Component library for UI elements.