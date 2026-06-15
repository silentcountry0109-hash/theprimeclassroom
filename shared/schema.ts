import { pgTable, text, varchar, integer, serial, boolean, timestamp, real, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
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
  businessHours: jsonb("business_hours"),
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
  compensationType: text("compensation_type").default("fixed"),
  compensationAmount: integer("compensation_amount").default(200),
  createdAt: timestamp("created_at").defaultNow(),
});

export const children = pgTable("children", {
  id: serial("id").primaryKey(),
  parentId: varchar("parent_id").references(() => users.id),
  name: text("name").notNull(),
  gender: text("gender").default("male"),
  grade: integer("grade").notNull(),
  school: text("school"),
  notes: text("notes"),
  studentCode: text("student_code").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const franchiseStudents = pgTable("franchise_students", {
  id: serial("id").primaryKey(),
  franchiseId: integer("franchise_id").references(() => franchises.id).notNull(),
  childId: integer("child_id").references(() => children.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("franchise_students_unique").on(table.franchiseId, table.childId),
]);

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
  parentId: varchar("parent_id").references(() => users.id),
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

export const insertFranchiseSchema = createInsertSchema(franchises).omit({ id: true, createdAt: true }).extend({
  name: z.string().regex(/^質數教室\s\S+教室$/, "分校名稱格式錯誤，需符合「質數教室 XX教室」格式（例：質數教室 大安教室）"),
});
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
export type AggregatedCoach = Coach & { branchNames: string[] };
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

export const customSchools = pgTable("custom_schools", {
  id: serial("id").primaryKey(),
  city: text("city").notNull(),
  district: text("district").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("custom_schools_unique").on(table.city, table.district, table.name),
]);

export const insertCustomSchoolSchema = createInsertSchema(customSchools).omit({ id: true, createdAt: true }).extend({
  city: z.string().trim().min(1, "請選擇縣市"),
  district: z.string().trim().min(1, "請選擇行政區"),
  name: z.string().trim().min(1, "請輸入學校名稱"),
});
export type CustomSchool = typeof customSchools.$inferSelect;
export type InsertCustomSchool = z.infer<typeof insertCustomSchoolSchema>;

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

export const creditPackages = pgTable("credit_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  credits: integer("credits").notNull(),
  bonusCredits: integer("bonus_credits").default(0).notNull(),
  bonusExpiryDays: integer("bonus_expiry_days"),
  price: integer("price").notNull(),
  expiryDays: integer("expiry_days"),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCreditPackageSchema = createInsertSchema(creditPackages).omit({ id: true, createdAt: true });
export type CreditPackage = typeof creditPackages.$inferSelect;
export type InsertCreditPackage = z.infer<typeof insertCreditPackageSchema>;

export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  discountType: text("discount_type").notNull(),
  discountValue: integer("discount_value").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  applicablePackageIds: integer("applicable_package_ids").array(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPromotionSchema = createInsertSchema(promotions).omit({ id: true, createdAt: true });
export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;

export const couponCodes = pgTable("coupon_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(),
  discountValue: integer("discount_value").notNull(),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").default(0).notNull(),
  minPurchaseAmount: integer("min_purchase_amount"),
  validFrom: text("valid_from"),
  validUntil: text("valid_until"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCouponCodeSchema = createInsertSchema(couponCodes).omit({ id: true, createdAt: true });
export type CouponCode = typeof couponCodes.$inferSelect;
export type InsertCouponCode = z.infer<typeof insertCouponCodeSchema>;

export const creditPurchases = pgTable("credit_purchases", {
  id: serial("id").primaryKey(),
  parentId: varchar("parent_id").references(() => users.id).notNull(),
  packageId: integer("package_id").references(() => creditPackages.id),
  credits: integer("credits").notNull(),
  originalAmount: integer("original_amount").notNull(),
  discountAmount: integer("discount_amount").default(0).notNull(),
  finalAmount: integer("final_amount").notNull(),
  promotionId: integer("promotion_id").references(() => promotions.id),
  couponId: integer("coupon_id").references(() => couponCodes.id),
  paymentMethod: text("payment_method").default("manual").notNull(),
  paymentStatus: text("payment_status").default("pending").notNull(),
  ecpayTradeNo: text("ecpay_trade_no"),
  ecpayInternalTradeNo: text("ecpay_internal_trade_no"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCreditPurchaseSchema = createInsertSchema(creditPurchases).omit({ id: true, createdAt: true });
export type CreditPurchase = typeof creditPurchases.$inferSelect;
export type InsertCreditPurchase = z.infer<typeof insertCreditPurchaseSchema>;

export const creditBalances = pgTable("credit_balances", {
  id: serial("id").primaryKey(),
  parentId: varchar("parent_id").references(() => users.id).notNull(),
  purchaseId: integer("purchase_id").references(() => creditPurchases.id),
  originalCredits: integer("original_credits").notNull(),
  remainingCredits: integer("remaining_credits").notNull(),
  creditType: text("credit_type").default("paid").notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCreditBalanceSchema = createInsertSchema(creditBalances).omit({ id: true, createdAt: true });
export type CreditBalance = typeof creditBalances.$inferSelect;
export type InsertCreditBalance = z.infer<typeof insertCreditBalanceSchema>;

export const creditTransactions = pgTable("credit_transactions", {
  id: serial("id").primaryKey(),
  parentId: varchar("parent_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  credits: integer("credits").notNull(),
  balanceId: integer("balance_id").references(() => creditBalances.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  purchaseId: integer("purchase_id").references(() => creditPurchases.id),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCreditTransactionSchema = createInsertSchema(creditTransactions).omit({ id: true, createdAt: true });
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;

export const textbooks = pgTable("textbooks", {
  id: serial("id").primaryKey(),
  grade: integer("grade").notNull(),
  subject: text("subject").default("數學").notNull(),
  unitCode: text("unit_code").notNull(),
  unitName: text("unit_name").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTextbookSchema = createInsertSchema(textbooks).omit({ id: true, createdAt: true });
export type Textbook = typeof textbooks.$inferSelect;
export type InsertTextbook = z.infer<typeof insertTextbookSchema>;

export const textbookQuizzes = pgTable("textbook_quizzes", {
  id: serial("id").primaryKey(),
  textbookId: integer("textbook_id").references(() => textbooks.id).notNull(),
  quizName: text("quiz_name").notNull(),
  totalScore: integer("total_score").default(100).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTextbookQuizSchema = createInsertSchema(textbookQuizzes).omit({ id: true, createdAt: true });
export type TextbookQuiz = typeof textbookQuizzes.$inferSelect;
export type InsertTextbookQuiz = z.infer<typeof insertTextbookQuizSchema>;

export const textbookFiles = pgTable("textbook_files", {
  id: serial("id").primaryKey(),
  textbookId: integer("textbook_id").references(() => textbooks.id).notNull(),
  fileType: text("file_type").notNull(),
  originalName: text("original_name").notNull(),
  storedPath: text("stored_path").notNull(),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  uniqueTextbookFileType: uniqueIndex("textbook_files_textbook_id_file_type_idx").on(t.textbookId, t.fileType),
}));

export const insertTextbookFileSchema = createInsertSchema(textbookFiles).omit({ id: true, createdAt: true, updatedAt: true });
export type TextbookFile = typeof textbookFiles.$inferSelect;
export type InsertTextbookFile = z.infer<typeof insertTextbookFileSchema>;

export const curriculumUnits = pgTable("curriculum_units", {
  id: serial("id").primaryKey(),
  courseCode: text("course_code").notNull(),
  unitName: text("unit_name").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const curriculumFiles = pgTable("curriculum_files", {
  id: serial("id").primaryKey(),
  unitId: integer("unit_id").references(() => curriculumUnits.id).notNull(),
  fileType: text("file_type").notNull(),
  originalName: text("original_name").notNull(),
  storedPath: text("stored_path").notNull(),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const curriculumMidtermExams = pgTable("curriculum_midterm_exams", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  semester: text("semester"),
  grade: integer("grade"),
  originalName: text("original_name").notNull(),
  storedPath: text("stored_path").notNull(),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCurriculumUnitSchema = createInsertSchema(curriculumUnits).omit({ id: true, createdAt: true });
export const insertCurriculumFileSchema = createInsertSchema(curriculumFiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCurriculumMidtermExamSchema = createInsertSchema(curriculumMidtermExams).omit({ id: true, createdAt: true });

export type CurriculumUnit = typeof curriculumUnits.$inferSelect;
export type InsertCurriculumUnit = z.infer<typeof insertCurriculumUnitSchema>;
export type CurriculumFile = typeof curriculumFiles.$inferSelect;
export type InsertCurriculumFile = z.infer<typeof insertCurriculumFileSchema>;
export type CurriculumMidtermExam = typeof curriculumMidtermExams.$inferSelect;
export type InsertCurriculumMidtermExam = z.infer<typeof insertCurriculumMidtermExamSchema>;

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({ id: true, updatedAt: true });
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;

export const REGISTRATION_GIFT_SETTING_KEY = "registration_gift";

export const registrationGiftSettingSchema = z.object({
  enabled: z.boolean(),
  credits: z.number().int().min(0),
  expiryDays: z.number().int().positive().nullable(),
});
export type RegistrationGiftSetting = z.infer<typeof registrationGiftSettingSchema>;

export const DEFAULT_REGISTRATION_GIFT_SETTING: RegistrationGiftSetting = {
  enabled: true,
  credits: 2,
  expiryDays: null,
};

export const coachReminderLogs = pgTable("coach_reminder_logs", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  date: text("date").notNull(),
  type: text("type").notNull().default("daily_summary"),
  sentAt: timestamp("sent_at").defaultNow(),
}, (t) => ({
  uniqueCoachDateType: uniqueIndex("coach_reminder_logs_coach_id_date_type_idx").on(t.coachId, t.date, t.type),
}));

export type CoachReminderLog = typeof coachReminderLogs.$inferSelect;

