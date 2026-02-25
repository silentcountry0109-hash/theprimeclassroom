import { pgTable, text, varchar, integer, serial, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
import { users } from "./models/auth";

export const franchises = pgTable("franchises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: varchar("owner_id").references(() => users.id),
  address: text("address").notNull(),
  city: text("city").notNull(),
  district: text("district").notNull(),
  phone: text("phone"),
  description: text("description"),
  imageUrl: text("image_url"),
  maxSeats: integer("max_seats").default(5).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const coaches = pgTable("coaches", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  franchiseId: integer("franchise_id").references(() => franchises.id),
  name: text("name").notNull(),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  specialties: text("specialties").array(),
  isCertified: boolean("is_certified").default(false).notNull(),
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const children = pgTable("children", {
  id: serial("id").primaryKey(),
  parentId: varchar("parent_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  grade: integer("grade").notNull(),
  school: text("school"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const timeSlots = pgTable("time_slots", {
  id: serial("id").primaryKey(),
  franchiseId: integer("franchise_id").references(() => franchises.id).notNull(),
  coachId: integer("coach_id").references(() => coaches.id),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  maxSeats: integer("max_seats").default(5).notNull(),
  bookedSeats: integer("booked_seats").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  slotId: integer("slot_id").references(() => timeSlots.id).notNull(),
  childId: integer("child_id").references(() => children.id).notNull(),
  parentId: varchar("parent_id").references(() => users.id).notNull(),
  status: text("status").default("confirmed").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const successStories = pgTable("success_stories", {
  id: serial("id").primaryKey(),
  studentName: text("student_name").notNull(),
  parentName: text("parent_name"),
  grade: integer("grade"),
  testimonial: text("testimonial").notNull(),
  photoUrl: text("photo_url"),
  tags: text("tags").array(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").default("info").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFranchiseSchema = createInsertSchema(franchises).omit({ id: true, createdAt: true });
export const insertCoachSchema = createInsertSchema(coaches).omit({ id: true, createdAt: true });
export const insertChildSchema = createInsertSchema(children).omit({ id: true, createdAt: true });
export const insertTimeSlotSchema = createInsertSchema(timeSlots).omit({ id: true, createdAt: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export const insertFaqSchema = createInsertSchema(faqs).omit({ id: true });
export const insertSuccessStorySchema = createInsertSchema(successStories).omit({ id: true, createdAt: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true });

export type Franchise = typeof franchises.$inferSelect;
export type InsertFranchise = z.infer<typeof insertFranchiseSchema>;
export type Coach = typeof coaches.$inferSelect;
export type InsertCoach = z.infer<typeof insertCoachSchema>;
export type Child = typeof children.$inferSelect;
export type InsertChild = z.infer<typeof insertChildSchema>;
export type TimeSlot = typeof timeSlots.$inferSelect;
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Faq = typeof faqs.$inferSelect;
export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type SuccessStory = typeof successStories.$inferSelect;
export type InsertSuccessStory = z.infer<typeof insertSuccessStorySchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
