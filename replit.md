# The Prime 質數教室

## Overview
The Prime 質數教室 is an S2B2C education platform in Taiwan, connecting parents with elementary school math tutoring services. It comprises a public brand website, a parent system for booking and management, and an HQ admin dashboard for operational control. The platform aims to be a leading digital solution in elementary math education, offering a streamlined experience for students, parents, and educators.

## User Preferences
- **Communication Style**: Clear, concise, and professional.
- **Language**: 一律以繁體中文回覆使用者。
- **Workflow**: Iterative development with regular check-ins.
- **Interaction**: Ask for confirmation before implementing significant architectural changes or adding new external dependencies.

## System Architecture
The platform utilizes a modern web stack: React, Vite, Tailwind CSS, Shadcn/UI, and Framer Motion for the frontend, and Express.js with Drizzle ORM and PostgreSQL for the backend. Authentication is managed via Replit Auth (OpenID Connect). All interfaces are designed to be mobile-responsive.

**UI/UX Design:**
The design adopts a Japanese minimalist aesthetic with a grid paper background.
- **Color Scheme**: Tiffany Blue (#81D8D0), Coral (#FFB7B2), Amber Warm (#FFF9E5), and a Washi (#FAF9F6) background.
- **Typography**: Noto Sans TC for body, Shippori Mincho for headings.
- **Terminology**: All UI text refers to teachers as "老師".

**Technical Implementations:**
- **User Roles**: Supports `parent`, `admin`, `franchise_admin`, and `coach` roles.
- **Search and Booking**: Franchise-centric search allows filtering by location, day, and time, leading to classroom pages where parents can book time slots. A 3-day advance booking restriction applies.
- **Landing Page**: Features an animated hero, brand philosophy, trust bar, methodology, learning map, features, branch locations, coach carousel, enrollment steps, testimonials, FAQ, and CTAs. A floating mobile CTA and "直接預約免費診斷" link are also present.
- **Parent Dashboard**: Offers personalized features including course booking, child management, booking history, contact books, and an e-commerce shop. It supports recurrence booking, a 4-hour cancellation policy, ICS calendar export, and auto calendar sync. Parents can favorite franchises for pinned search results.
- **Admin Dashboards**: Separate dashboards for HQ admins (analytics, summary stats, per-franchise breakdowns) and franchise admins. Franchise admins manage franchises, coaches, time slots, content, users, and e-commerce. They can view daily stats, manually book students, manage classrooms, and view coach schedules. `managedFranchiseIds` enable switching between managed franchises via a sidebar dropdown, with API calls scoped by `X-Franchise-Id`.
- **Coach Dashboard**: Coaches manage calendars, student info, contact books, and profiles. Daily work records track check-ins and contact books for salary calculation. Deactivated coaches are blocked from logging in.
- **Credits/Points System**: Parents purchase lesson credits stored in a family wallet. HQ admin defines credit packages with expiry days and supports promotions and coupon codes. Credits are universal across franchises. Bookings auto-deduct 1 credit (FIFO by expiry); cancellations auto-refund. Admins can manually add credits.
- **ECPay Payment Integration**: Online credit card payments are processed via ECPay, involving a redirect to ECPay's hosted page. The system handles payment creation, notification callbacks, and return redirects. Refunds are initiated by admins via an ECPay API call, with specific handling for legacy orders and state mutations.
- **Concurrency Protections**: Atomic updates prevent race conditions for seat booking, and `pg_advisory_xact_lock` prevents overlapping child bookings.
- **Student Management**: Each child has a unique `studentCode`. Franchise admins manage students, view booking history, and contact books, and can directly associate students with a franchise.
- **Coach Compensation System**: Coaches have configurable compensation types: fixed (per-lesson), hourly, or percentage of revenue. Franchise admins set these, and coaches view confirmed and projected income.
- **Classroom Management**: Franchise admins can create, rename, and delete classrooms, assign time slots, and utilize conflict checking.
- **Business Hours**: Configurable franchise business hours validate time slot creation.
- **Notification System**: Notifies parents and coaches about slot changes via in-dashboard bell icons.
- **Slot Deletion Protection**: Safeguards prevent deletion of slots with active bookings, requiring confirmation for force-deletion and notifying affected parties.
- **Simulation Data**: `server/simulate-data.ts` generates realistic operational data for testing.
- **LINE Customer Service Inbox**: Integrated LINE messaging system for customer service. Includes `line_conversations` and `line_messages` tables, a webhook for LINE events, and admin dashboard interfaces for managing conversations, assignments, and replies.
- **Textbook/Curriculum Management System**: HQ admin manages textbook units by grade with codes, names, and associated quizzes. Contact books include a searchable textbook unit selector, and student learning history is displayed in admin and parent dashboards.
- **Curriculum PDF Management System**: HQ admin manages curriculum units with course codes, names, and uploads up to 5 PDFs per unit (teaching materials, quizzes). A midterm exam archive is also maintained. PDF files are stored in Replit App Storage and served via an authenticated API. Coaches access materials via an inline PDF viewer.
- **Cloud Image/File Storage (App Storage)**: All new images and PDFs are stored in Replit App Storage (GCS-backed). Public files are stored as GCS URLs, while private PDFs are streamed via Express. Multer uses `memoryStorage` for uploads.

## External Dependencies
- **Replit Auth**: OpenID Connect for user authentication.
- **PostgreSQL**: Primary relational database.
- **Multer**: Handles file uploads for images and PDFs.
- **Framer Motion**: Frontend animation library.
- **Tailwind CSS**: Utility-first CSS framework.
- **Shadcn/UI**: Component library for UI elements.
- **ECPay**: Third-party payment gateway for credit card transactions.
- **LINE Messaging API**: For customer service inbox integration.