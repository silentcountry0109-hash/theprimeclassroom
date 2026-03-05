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
  photos: text("photos").array(),
  coverPhoto: text("cover_photo"),
  maxSeats: integer("max_seats").default(5).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  tags: text("tags").array(),
  rating: real("franchise_rating").default(0),
  reviewCount: integer("franchise_review_count").default(0),
  nearbySchools: text("nearby_schools").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const coaches = pgTable("coaches", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  franchiseId: integer("franchise_id").references(() => franchises.id),
  name: text("name").notNull(),
  phone: text("phone"),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  specialties: text("specialties").array(),
  isCertified: boolean("is_certified").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const children = pgTable("children", {
  id: serial("id").primaryKey(),
  parentId: varchar("parent_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  gender: text("gender").default("male"),
  grade: integer("grade").notNull(),
  school: text("school"),
  notes: text("notes"),
  studentCode: text("student_code").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const classrooms = pgTable("classrooms", {
  id: serial("id").primaryKey(),
  franchiseId: integer("franchise_id").references(() => franchises.id).notNull(),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const timeSlots = pgTable("time_slots", {
  id: serial("id").primaryKey(),
  franchiseId: integer("franchise_id").references(() => franchises.id).notNull(),
  coachId: integer("coach_id").references(() => coaches.id),
  classroomId: integer("classroom_id").references(() => classrooms.id),
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

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  discountPrice: integer("discount_price"),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  stock: integer("stock").default(0).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: text("status").default("pending").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFranchiseSchema = createInsertSchema(franchises).omit({ id: true, createdAt: true });
export const insertCoachSchema = createInsertSchema(coaches).omit({ id: true, createdAt: true });
export const insertChildSchema = createInsertSchema(children).omit({ id: true, createdAt: true, studentCode: true });
export const insertClassroomSchema = createInsertSchema(classrooms).omit({ id: true, createdAt: true });
export type Classroom = typeof classrooms.$inferSelect;
export type InsertClassroom = z.infer<typeof insertClassroomSchema>;

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

export const siteContent = pgTable("site_content", {
  id: serial("id").primaryKey(),
  sectionKey: text("section_key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSiteContentSchema = createInsertSchema(siteContent).omit({ id: true, updatedAt: true });
export type SiteContent = typeof siteContent.$inferSelect;
export type InsertSiteContent = z.infer<typeof insertSiteContentSchema>;

export const contactBooks = pgTable("contact_books", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id),
  coachId: integer("coach_id").references(() => coaches.id).notNull(),
  childId: integer("child_id").references(() => children.id).notNull(),
  lessonDate: text("lesson_date").notNull(),
  lessonUnit: text("lesson_unit").notNull(),
  lessonProgress: text("lesson_progress"),
  performance: text("performance"),
  classNotes: text("class_notes"),
  quizScore: integer("quiz_score"),
  quizTotal: integer("quiz_total").default(100),
  homework: text("homework"),
  nextExam: text("next_exam"),
  teacherRemarks: text("teacher_remarks"),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactBookSchema = createInsertSchema(contactBooks).omit({ id: true, createdAt: true });
export type ContactBook = typeof contactBooks.$inferSelect;
export type InsertContactBook = z.infer<typeof insertContactBookSchema>;

export const favoriteFranchises = pgTable("favorite_franchises", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  franchiseId: integer("franchise_id").references(() => franchises.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFavoriteFranchiseSchema = createInsertSchema(favoriteFranchises).omit({ id: true, createdAt: true });
export type FavoriteFranchise = typeof favoriteFranchises.$inferSelect;
export type InsertFavoriteFranchise = z.infer<typeof insertFavoriteFranchiseSchema>;

export const coachDailyRecords = pgTable("coach_daily_records", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").references(() => coaches.id).notNull(),
  date: text("date").notNull(),
  totalSlots: integer("total_slots").default(0).notNull(),
  checkedInSlots: integer("checked_in_slots").default(0).notNull(),
  contactBookSlots: integer("contact_book_slots").default(0).notNull(),
  isComplete: boolean("is_complete").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCoachDailyRecordSchema = createInsertSchema(coachDailyRecords).omit({ id: true, createdAt: true });
export type CoachDailyRecord = typeof coachDailyRecords.$inferSelect;
export type InsertCoachDailyRecord = z.infer<typeof insertCoachDailyRecordSchema>;

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true, createdAt: true });

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
