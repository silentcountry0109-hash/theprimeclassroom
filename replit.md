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
- **ICS Calendar Export**: Parents can export confirmed bookings to their calendars with reminder alarms.
- **Favorite Franchises**: Parents can toggle a heart icon on franchise search cards to mark favorites. Favorited classrooms are pinned to the top of search results with a coral highlight. Data stored in `favoriteFranchises` table (userId + franchiseId). API: GET/POST/DELETE `/api/favorite-franchises/:franchiseId`.
- **HQ Admin Analytics Dashboard**: The admin OverviewTab displays 6 summary stat cards (students, coaches, franchises, bookings, avg occupancy, this-month bookings) plus a per-franchise analytics breakdown with sortable/filterable cards showing coaches, students, bookings, occupancy rate, upcoming slots, and monthly metrics. API: GET `/api/admin/franchise-analytics`.
- **School Cascading Dropdown**: When adding/editing a child, school is a required field using 3 cascading Select dropdowns: City → District → Elementary School. Data sourced from `shared/taiwan-schools.ts` covering all 22 Taiwan counties/cities. School value stored as concatenated string (e.g., "台北市大安區大安國小"). Legacy school data is handled with a migration hint during edit.

## External Dependencies
- **Replit Auth**: Used for OpenID Connect based authentication for parent users.
- **PostgreSQL**: The relational database used for all application data storage.
- **Multer**: Used for handling file uploads, specifically for franchise photos, which are then served statically.
- **Framer Motion**: Integrated for advanced animations and transitions in the frontend.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **Shadcn/UI**: Component library built on Tailwind CSS for consistent UI elements.