import {
  franchises, coaches, children, timeSlots, bookings, faqs, successStories, announcements,
  products, cartItems, orders, orderItems, siteContent, contactBooks, favoriteFranchises,
  coachDailyRecords, classrooms, notifications, franchiseStudents,
  creditPackages, promotions, couponCodes, creditPurchases, creditBalances, creditTransactions,
  textbooks, textbookQuizzes, textbookFiles,
  curriculumUnits, curriculumFiles, curriculumMidtermExams,
  users,
  type Franchise, type InsertFranchise,
  type Coach, type InsertCoach,
  type Child, type InsertChild,
  type TimeSlot, type InsertTimeSlot,
  type Booking, type InsertBooking,
  type Faq, type InsertFaq,
  type SuccessStory, type InsertSuccessStory,
  type Announcement, type InsertAnnouncement,
  type Product, type InsertProduct,
  type CartItem, type InsertCartItem,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Notification, type InsertNotification,
  type User,
  type SiteContent,
  type ContactBook, type InsertContactBook,
  type FavoriteFranchise,
  type CoachDailyRecord,
  type Classroom, type InsertClassroom,
  type CreditPackage, type InsertCreditPackage,
  type Promotion, type InsertPromotion,
  type CouponCode, type InsertCouponCode,
  type CreditPurchase, type InsertCreditPurchase,
  type CreditBalance, type InsertCreditBalance,
  type CreditTransaction, type InsertCreditTransaction,
  type Textbook, type InsertTextbook,
  type TextbookQuiz, type InsertTextbookQuiz,
  type TextbookFile, type InsertTextbookFile,
  type CurriculumUnit, type InsertCurriculumUnit,
  type CurriculumFile, type InsertCurriculumFile,
  type CurriculumMidtermExam, type InsertCurriculumMidtermExam,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, inArray, gte, lte, asc, gt } from "drizzle-orm";
import fs from "fs";
import path from "path";

export interface IStorage {
  getCoaches(): Promise<Coach[]>;
  getAllCoaches(): Promise<Coach[]>;
  getCoach(id: number): Promise<Coach | undefined>;
  getCoachesByFranchise(franchiseId: number): Promise<Coach[]>;
  getCoachesByUserId(userId: string): Promise<Coach[]>;
  createCoach(coach: InsertCoach): Promise<Coach>;
  updateCoach(id: number, data: Partial<InsertCoach>): Promise<Coach>;
  deleteCoach(id: number): Promise<void>;

  getFranchises(): Promise<Franchise[]>;
  getAllFranchises(): Promise<Franchise[]>;
  getFranchise(id: number): Promise<Franchise | undefined>;
  createFranchise(franchise: InsertFranchise): Promise<Franchise>;
  updateFranchise(id: number, data: Partial<InsertFranchise>): Promise<Franchise>;
  deleteFranchise(id: number): Promise<void>;

  searchFranchises(filters: {
    city?: string;
    district?: string;
    days?: string[];
    periods?: string[];
  }): Promise<any[]>;

  getFranchiseDetail(id: number): Promise<{
    franchise: Franchise;
    coaches: Coach[];
    timeSlots: any[];
  } | null>;

  getChildrenByParent(parentId: string): Promise<Child[]>;
  createChild(child: InsertChild): Promise<Child>;
  updateChild(id: number, data: Partial<InsertChild>): Promise<Child>;
  deleteChild(id: number): Promise<void>;

  searchSlots(city?: string, grade?: string): Promise<any[]>;
  getSlotsByFranchise(franchiseId: number): Promise<TimeSlot[]>;
  getSlot(id: number): Promise<TimeSlot | undefined>;
  findSlot(franchiseId: number, coachId: number | null, date: string, startTime: string, endTime: string): Promise<TimeSlot | undefined>;
  createSlot(slot: InsertTimeSlot): Promise<TimeSlot>;
  updateTimeSlotCoachAndClassroom(slotId: number, franchiseId: number, coachId: number, classroomId: number | null): Promise<TimeSlot>;
  deleteSlot(id: number): Promise<void>;

  getBooking(id: number): Promise<any | undefined>;
  getBookingsByParent(parentId: string): Promise<any[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  hasExistingBooking(slotId: number, childId: number): Promise<boolean>;
  cancelBooking(id: number): Promise<void>;
  completeExpiredBookings(): Promise<number>;

  getFaqs(): Promise<Faq[]>;
  getAllFaqs(): Promise<Faq[]>;
  createFaq(faq: InsertFaq): Promise<Faq>;
  updateFaq(id: number, data: Partial<InsertFaq>): Promise<Faq>;
  deleteFaq(id: number): Promise<void>;

  getSuccessStories(): Promise<SuccessStory[]>;
  getAllSuccessStories(): Promise<SuccessStory[]>;
  createSuccessStory(story: InsertSuccessStory): Promise<SuccessStory>;
  updateSuccessStory(id: number, data: Partial<InsertSuccessStory>): Promise<SuccessStory>;
  deleteSuccessStory(id: number): Promise<void>;

  getAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, data: Partial<InsertAnnouncement>): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<void>;

  getAdminStats(): Promise<{
    totalStudents: number;
    totalCoaches: number;
    totalFranchises: number;
    totalBookings: number;
  }>;

  getAllUsers(): Promise<User[]>;
  updateUserRole(id: string, role: string, franchiseId: number | null): Promise<User>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  updateUserLineUserId(userId: string, lineUserId: string | null): Promise<void>;
  getBookingsByFranchise(franchiseId: number): Promise<any[]>;
  getFranchiseStats(franchiseId: number): Promise<{
    totalCoaches: number;
    totalSlots: number;
    totalBookings: number;
    confirmedBookings: number;
    attendedBookings: number;
  }>;
  getFranchiseTodayStats(franchiseId: number): Promise<any>;
  getAllProducts(): Promise<Product[]>;
  getActiveProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(data: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(userId: string, productId: number, quantity: number): Promise<CartItem>;
  updateCartQuantity(cartItemId: number, quantity: number): Promise<CartItem>;
  removeFromCart(cartItemId: number): Promise<void>;
  clearCart(userId: string): Promise<void>;

  createOrder(userId: string, items: { productId: number; quantity: number }[], note?: string): Promise<Order>;
  getOrders(userId?: string): Promise<(Order & { userName?: string })[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  updateOrderStatus(id: number, status: string): Promise<Order>;

  createCoachAccount(coachId: number, userId: string): Promise<Coach>;
  getCoachByUserId(userId: string): Promise<Coach | undefined>;
  getCoachSlots(coachId: number, year: number, month: number): Promise<any[]>;
  getTimeSlot(id: number): Promise<any | undefined>;
  getSlotStudents(slotId: number): Promise<any[]>;
  checkInBooking(id: number, coachId: number): Promise<void>;
  markAbsentBooking(id: number, coachId: number): Promise<void>;
  uncheckInBooking(id: number, coachId: number): Promise<void>;
  getCoachDailyRecord(coachId: number, date: string): Promise<any>;
  updateCoachDailyRecord(coachId: number, date: string): Promise<CoachDailyRecord>;
  getCoachMonthlyRecords(coachId: number, year: number, month: number): Promise<CoachDailyRecord[]>;
  createContactBook(data: InsertContactBook): Promise<ContactBook>;
  getContactBook(id: number): Promise<ContactBook | undefined>;
  updateContactBook(id: number, data: Partial<InsertContactBook>): Promise<ContactBook>;
  getContactBooksBySlot(slotId: number, coachId: number): Promise<any[]>;
  getContactBooksByChild(childId: number): Promise<any[]>;
  getContactBooksByParent(parentId: string): Promise<any[]>;
  getCoachStudents(coachId: number): Promise<any[]>;
  getCoachStudentsByUserId(userId: string): Promise<any[]>;
  getCoachSlotsByUserId(userId: string, year: number, month: number): Promise<any[]>;
  getStudentContactBookHistory(coachId: number, childId: number): Promise<any[]>;
  getStudentContactBookHistoryByCoachIds(coachIds: number[], childId: number): Promise<any[]>;
  getCoachDailyRecordByCoachIds(coachIds: number[], date: string): Promise<any>;
  getCoachMonthlyRecordsByCoachIds(coachIds: number[], year: number, month: number): Promise<any[]>;

  getAllSiteContent(): Promise<SiteContent[]>;
  getSiteContent(sectionKey: string): Promise<SiteContent | undefined>;
  upsertSiteContent(sectionKey: string, value: string): Promise<SiteContent>;
  promoteAllGrades(): Promise<number>;

  getFavoriteFranchises(userId: string): Promise<number[]>;
  addFavoriteFranchise(userId: string, franchiseId: number): Promise<FavoriteFranchise>;
  removeFavoriteFranchise(userId: string, franchiseId: number): Promise<void>;

  getCoachScheduleAcrossFranchises(coachId: number): Promise<any[]>;
  getOverlappingSlots(franchiseId: number, date: string, startTime: string, endTime: string, excludeSlotId?: number): Promise<TimeSlot[]>;
  getChildOverlappingBookings(childId: number, date: string, startTime: string, endTime: string, excludeBookingId?: number): Promise<any[]>;
  getCoachOverlappingSlots(coachId: number, date: string, startTime: string, endTime: string, excludeSlotId?: number): Promise<any[]>;

  getClassroomOverlappingSlots(classroomId: number, date: string, startTime: string, endTime: string, excludeSlotId?: number): Promise<TimeSlot[]>;
  getSlotsByClassroom(classroomId: number): Promise<TimeSlot[]>;
  getClassroomsByFranchise(franchiseId: number): Promise<Classroom[]>;
  createClassroom(data: InsertClassroom): Promise<Classroom>;
  updateClassroom(id: number, data: Partial<InsertClassroom>): Promise<Classroom>;
  deleteClassroom(id: number): Promise<void>;

  getSlotBookings(slotId: number): Promise<any[]>;
  getSlotStudentList(slotId: number): Promise<any[]>;
  cancelSlotBookingsAndNotify(slotId: number): Promise<void>;

  createNotification(data: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  markNotificationRead(id: number): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  getFranchiseStudents(franchiseId: number): Promise<any[]>;
  addFranchiseStudent(franchiseId: number, name: string, grade: number): Promise<any>;
  removeFranchiseStudent(franchiseId: number, childId: number): Promise<void>;
  getFranchiseStudentBookings(franchiseId: number, childId: number): Promise<any[]>;
  getFranchiseStudentContactBooks(franchiseId: number, childId: number): Promise<any[]>;
  createManualBooking(slotId: number, childId: number, franchiseId: number): Promise<any>;
  createManualBookingExtended(params: {
    slotId: number;
    franchiseId: number;
    childId?: number;
    walkInName?: string;
    walkInGrade?: number;
    walkInSchool?: string;
    overrideCapacity?: boolean;
  }): Promise<any>;

  getAllFranchiseAnalytics(): Promise<any[]>;

  getCreditPackages(): Promise<CreditPackage[]>;
  getActiveCreditPackages(): Promise<CreditPackage[]>;
  createCreditPackage(data: InsertCreditPackage): Promise<CreditPackage>;
  updateCreditPackage(id: number, data: Partial<InsertCreditPackage>): Promise<CreditPackage>;

  getPromotions(): Promise<Promotion[]>;
  getActivePromotions(): Promise<Promotion[]>;
  createPromotion(data: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: number, data: Partial<InsertPromotion>): Promise<Promotion>;

  getCouponCodes(): Promise<CouponCode[]>;
  getCouponByCode(code: string): Promise<CouponCode | undefined>;
  createCouponCode(data: InsertCouponCode): Promise<CouponCode>;
  updateCouponCode(id: number, data: Partial<InsertCouponCode>): Promise<CouponCode>;
  incrementCouponUsage(id: number): Promise<void>;

  createCreditPurchase(data: InsertCreditPurchase): Promise<CreditPurchase>;
  updatePurchaseStatus(id: number, status: string): Promise<CreditPurchase>;
  updatePurchaseStatusAndTradeNo(id: number, status: string, ecpayTradeNo: string): Promise<CreditPurchase>;
  getPurchasesByParent(parentId: string): Promise<CreditPurchase[]>;
  getCreditPurchaseByTradeNo(ecpayTradeNo: string): Promise<CreditPurchase | undefined>;
  atomicMarkPurchasePaid(ecpayTradeNo: string): Promise<CreditPurchase | null>;
  atomicMarkPaidAndAddCredits(ecpayTradeNo: string, expiresAt: Date | null): Promise<CreditPurchase | null>;

  getParentBalance(parentId: string): Promise<number>;
  getCreditBalances(parentId: string): Promise<CreditBalance[]>;
  deductCredits(parentId: string, amount: number, bookingId?: number, description?: string): Promise<CreditTransaction>;
  refundCredits(parentId: string, bookingId: number, description?: string): Promise<CreditTransaction | null>;
  addCredits(parentId: string, purchaseId: number, credits: number, expiresAt: Date | null): Promise<CreditBalance>;

  createCreditTransaction(data: InsertCreditTransaction): Promise<CreditTransaction>;
  getTransactionsByParent(parentId: string): Promise<CreditTransaction[]>;

  getCoachEarningsStats(coachId: number, startDate: string, endDate: string): Promise<any>;
  getCoachEarningsStatsByCoachIds(coachIds: number[], startDate: string, endDate: string): Promise<any>;
  getFranchiseCoachEarnings(franchiseId: number, startDate: string, endDate: string): Promise<any>;

  getTextbooks(): Promise<Textbook[]>;
  getTextbooksByGrade(grade: number): Promise<Textbook[]>;
  getTextbooksWithQuizzes(): Promise<any[]>;
  getTextbooksWithFiles(): Promise<any[]>;
  createTextbook(data: InsertTextbook): Promise<Textbook>;
  updateTextbook(id: number, data: Partial<InsertTextbook>): Promise<Textbook>;
  deleteTextbook(id: number): Promise<void>;
  getQuizzesByTextbook(textbookId: number): Promise<TextbookQuiz[]>;
  createQuiz(data: InsertTextbookQuiz): Promise<TextbookQuiz>;
  updateQuiz(id: number, data: Partial<InsertTextbookQuiz>): Promise<TextbookQuiz>;
  deleteQuiz(id: number): Promise<void>;
  getTextbookFile(textbookId: number, fileType: string): Promise<TextbookFile | undefined>;
  upsertTextbookFile(data: InsertTextbookFile): Promise<TextbookFile>;
  deleteTextbookFile(textbookId: number, fileType: string): Promise<void>;
  getTextbookFiles(textbookId: number): Promise<TextbookFile[]>;

  getCurriculumUnitsWithFiles(): Promise<any[]>;
  getCurriculumUnit(id: number): Promise<CurriculumUnit | undefined>;
  createCurriculumUnit(data: InsertCurriculumUnit): Promise<CurriculumUnit>;
  updateCurriculumUnit(id: number, data: Partial<InsertCurriculumUnit>): Promise<CurriculumUnit>;
  deleteCurriculumUnit(id: number): Promise<void>;
  getCurriculumFile(unitId: number, fileType: string): Promise<CurriculumFile | undefined>;
  upsertCurriculumFile(data: InsertCurriculumFile): Promise<CurriculumFile>;
  deleteCurriculumFile(unitId: number, fileType: string): Promise<void>;
  getCurriculumMidtermExams(): Promise<CurriculumMidtermExam[]>;
  getCurriculumMidtermExam(id: number): Promise<CurriculumMidtermExam | undefined>;
  createCurriculumMidtermExam(data: InsertCurriculumMidtermExam): Promise<CurriculumMidtermExam>;
  deleteCurriculumMidtermExam(id: number): Promise<void>;

  getFranchiseStatsByDateRange(franchiseId: number, startDate: string, endDate: string): Promise<{
    totalSlots: number;
    totalBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    checkedInBookings: number;
    cancelledBookings: number;
    totalSeats: number;
    bookedSeats: number;
    occupancyRate: number;
    dailyStats: Array<{ date: string; slots: number; bookings: number; bookedSeats: number; totalSeats: number }>;
    coachStats: Array<{ coachId: number; coachName: string; slots: number; bookings: number; confirmedBookings: number; cancelledBookings: number; completedBookings: number; bookedSeats: number }>;
  }>;
}

function getTimePeriodCondition(periods: string[]): string {
  const conditions: string[] = [];
  for (const period of periods) {
    if (period === "morning") {
      conditions.push(`(${timeSlots.startTime.name} >= '09:00' AND ${timeSlots.startTime.name} < '12:00')`);
    } else if (period === "afternoon") {
      conditions.push(`(${timeSlots.startTime.name} >= '13:00' AND ${timeSlots.startTime.name} < '17:00')`);
    } else if (period === "evening") {
      conditions.push(`(${timeSlots.startTime.name} >= '18:00' AND ${timeSlots.startTime.name} < '21:00')`);
    }
  }
  return conditions.length > 0 ? `(${conditions.join(" OR ")})` : "TRUE";
}

export class DatabaseStorage implements IStorage {
  async getCoaches(): Promise<Coach[]> {
    return db.select().from(coaches).where(eq(coaches.isCertified, true));
  }

  async getAllCoaches(): Promise<Coach[]> {
    return db.select().from(coaches);
  }

  async getCoach(id: number): Promise<Coach | undefined> {
    const [coach] = await db.select().from(coaches).where(eq(coaches.id, id));
    return coach;
  }

  async getCoachesByFranchise(franchiseId: number): Promise<Coach[]> {
    return db.select().from(coaches).where(eq(coaches.franchiseId, franchiseId));
  }

  async createCoach(coach: InsertCoach): Promise<Coach> {
    const [created] = await db.insert(coaches).values(coach).returning();
    return created;
  }

  async updateCoach(id: number, data: Partial<InsertCoach>): Promise<Coach> {
    const [updated] = await db.update(coaches).set(data).where(eq(coaches.id, id)).returning();
    return updated;
  }

  async deleteCoach(id: number): Promise<void> {
    await db.update(timeSlots).set({ coachId: null }).where(eq(timeSlots.coachId, id));
    await db.delete(coaches).where(eq(coaches.id, id));
  }

  async getFranchises(): Promise<Franchise[]> {
    return db.select().from(franchises).where(eq(franchises.isActive, true));
  }

  async getAllFranchises(): Promise<Franchise[]> {
    return db.select().from(franchises);
  }

  async getFranchise(id: number): Promise<Franchise | undefined> {
    const [franchise] = await db.select().from(franchises).where(eq(franchises.id, id));
    return franchise;
  }

  async createFranchise(franchise: InsertFranchise): Promise<Franchise> {
    const [created] = await db.insert(franchises).values(franchise).returning();
    return created;
  }

  async updateFranchise(id: number, data: Partial<InsertFranchise>): Promise<Franchise> {
    const [updated] = await db.update(franchises).set(data).where(eq(franchises.id, id)).returning();
    return updated;
  }

  async deleteFranchise(id: number): Promise<void> {
    const slotsToDelete = await db.select({ id: timeSlots.id }).from(timeSlots).where(eq(timeSlots.franchiseId, id));
    if (slotsToDelete.length > 0) {
      const slotIds = slotsToDelete.map((s) => s.id);
      await db.delete(bookings).where(inArray(bookings.slotId, slotIds));
      await db.delete(timeSlots).where(eq(timeSlots.franchiseId, id));
    }
    await db.delete(coaches).where(eq(coaches.franchiseId, id));
    await db.delete(franchises).where(eq(franchises.id, id));
  }

  async searchFranchises(filters: {
    city?: string;
    district?: string;
    days?: string[];
    periods?: string[];
  }): Promise<any[]> {
    const conditions = [eq(franchises.isActive, true)];

    if (filters.city) {
      conditions.push(eq(franchises.city, filters.city));
    }
    if (filters.district) {
      conditions.push(eq(franchises.district, filters.district));
    }

    const matchingFranchises = await db
      .select()
      .from(franchises)
      .where(and(...conditions));

    const results = [];

    for (const franchise of matchingFranchises) {
      const slotConditions = [
        eq(timeSlots.franchiseId, franchise.id),
        eq(timeSlots.isActive, true),
        sql`${timeSlots.bookedSeats} < ${timeSlots.maxSeats}`,
      ];

      if (filters.days && filters.days.length > 0) {
        const dayConditions = filters.days.map((day) => {
          return sql`EXTRACT(DOW FROM CAST(${timeSlots.date} AS date)) = ${parseInt(day)}`;
        });
        slotConditions.push(sql`(${sql.join(dayConditions, sql` OR `)})`);
      }

      if (filters.periods && filters.periods.length > 0) {
        const periodConditions: any[] = [];
        for (const period of filters.periods) {
          if (period === "morning") {
            periodConditions.push(sql`(${timeSlots.startTime} >= '09:00' AND ${timeSlots.startTime} < '12:00')`);
          } else if (period === "afternoon") {
            periodConditions.push(sql`(${timeSlots.startTime} >= '13:00' AND ${timeSlots.startTime} < '17:00')`);
          } else if (period === "evening") {
            periodConditions.push(sql`(${timeSlots.startTime} >= '18:00' AND ${timeSlots.startTime} < '21:00')`);
          }
        }
        if (periodConditions.length > 0) {
          slotConditions.push(sql`(${sql.join(periodConditions, sql` OR `)})`);
        }
      }

      const availableSlots = await db
        .select({ count: sql<number>`count(*)` })
        .from(timeSlots)
        .where(and(...slotConditions));

      const slotCount = Number(availableSlots[0].count);

      const franchiseCoaches = await db
        .select()
        .from(coaches)
        .where(eq(coaches.franchiseId, franchise.id));

      const todayStr = new Date().toISOString().split("T")[0];
      const nextSlot = await db
        .select()
        .from(timeSlots)
        .where(and(
          eq(timeSlots.franchiseId, franchise.id),
          eq(timeSlots.isActive, true),
          sql`${timeSlots.bookedSeats} < ${timeSlots.maxSeats}`,
          sql`${timeSlots.date} >= ${todayStr}`
        ))
        .orderBy(timeSlots.date, timeSlots.startTime)
        .limit(1);

      results.push({
        franchise,
        availableSlots: slotCount,
        coachCount: franchiseCoaches.length,
        coaches: franchiseCoaches.map((c) => c.name),
        nextAvailable: nextSlot.length > 0
          ? `${nextSlot[0].date} ${nextSlot[0].startTime}`
          : null,
      });
    }

    return results.filter((r) => r.availableSlots > 0).sort((a, b) => {
      const aScore = (a.franchise.rating || 0) * 10 + a.availableSlots;
      const bScore = (b.franchise.rating || 0) * 10 + b.availableSlots;
      return bScore - aScore;
    });
  }

  async getFranchiseDetail(id: number): Promise<{
    franchise: Franchise;
    coaches: Coach[];
    timeSlots: any[];
  } | null> {
    const franchise = await this.getFranchise(id);
    if (!franchise) return null;

    const franchiseCoaches = await db
      .select()
      .from(coaches)
      .where(eq(coaches.franchiseId, id));

    const todayStr = new Date().toISOString().split("T")[0];
    const slots = await db
      .select({
        slot: timeSlots,
        coach: coaches,
      })
      .from(timeSlots)
      .leftJoin(coaches, eq(timeSlots.coachId, coaches.id))
      .where(
        and(
          eq(timeSlots.franchiseId, id),
          eq(timeSlots.isActive, true),
          sql`${timeSlots.date} >= ${todayStr}`
        )
      )
      .orderBy(timeSlots.date, timeSlots.startTime);

    return {
      franchise,
      coaches: franchiseCoaches,
      timeSlots: slots.map((s) => ({
        ...s.slot,
        coachName: s.coach?.name || null,
        coachId: s.coach?.id || null,
      })),
    };
  }

  async getChildrenByParent(parentId: string): Promise<Child[]> {
    return db.select().from(children).where(eq(children.parentId, parentId));
  }

  async generateStudentCode(): Promise<string> {
    const taiwanDateStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" }).replace(/-/g, "");
    const prefix = taiwanDateStr;
    const existing = await db.select({ studentCode: children.studentCode })
      .from(children)
      .where(sql`${children.studentCode} LIKE ${prefix + '%'} AND length(${children.studentCode}) = 12`);
    const maxSeq = existing.reduce((max, row) => {
      if (!row.studentCode || row.studentCode.length !== 12) return max;
      const seq = parseInt(row.studentCode.substring(8), 10);
      return seq > max ? seq : max;
    }, 0);
    const nextSeq = (maxSeq + 1).toString().padStart(4, "0");
    return `${prefix}${nextSeq}`;
  }

  async createChild(child: InsertChild): Promise<Child> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const studentCode = await this.generateStudentCode();
      try {
        const [created] = await db.insert(children).values({ ...child, studentCode }).returning();
        return created;
      } catch (err: any) {
        if (err?.code === "23505" && err?.constraint?.includes("student_code") && attempt < 4) {
          continue;
        }
        throw err;
      }
    }
    throw new Error("Failed to generate unique student code after 5 attempts");
  }

  async updateChild(id: number, data: Partial<InsertChild>): Promise<Child> {
    const [updated] = await db.update(children).set(data).where(eq(children.id, id)).returning();
    return updated;
  }

  async deleteChild(id: number): Promise<void> {
    const childBookings = await db.select().from(bookings).where(eq(bookings.childId, id));
    for (const booking of childBookings) {
      if (booking.status === "confirmed") {
        await db
          .update(timeSlots)
          .set({ bookedSeats: sql`GREATEST(${timeSlots.bookedSeats} - 1, 0)` })
          .where(eq(timeSlots.id, booking.slotId));
      }
    }
    await db.delete(bookings).where(eq(bookings.childId, id));
    await db.delete(children).where(eq(children.id, id));
  }

  async searchSlots(city?: string): Promise<any[]> {
    const conditions = [
      eq(timeSlots.isActive, true),
      eq(franchises.isActive, true),
      sql`${timeSlots.bookedSeats} < ${timeSlots.maxSeats}`,
    ];

    if (city) {
      conditions.push(eq(franchises.city, city));
    }

    return db
      .select({
        slot: timeSlots,
        franchise: franchises,
        coach: coaches,
      })
      .from(timeSlots)
      .innerJoin(franchises, eq(timeSlots.franchiseId, franchises.id))
      .leftJoin(coaches, eq(timeSlots.coachId, coaches.id))
      .where(and(...conditions));
  }

  async getSlotsByFranchise(franchiseId: number): Promise<TimeSlot[]> {
    return db.select().from(timeSlots).where(eq(timeSlots.franchiseId, franchiseId));
  }

  async getSlot(id: number): Promise<TimeSlot | undefined> {
    const [slot] = await db.select().from(timeSlots).where(eq(timeSlots.id, id));
    return slot;
  }

  async findSlot(franchiseId: number, coachId: number | null, date: string, startTime: string, endTime: string): Promise<TimeSlot | undefined> {
    const conditions = [
      eq(timeSlots.franchiseId, franchiseId),
      eq(timeSlots.date, date),
      eq(timeSlots.startTime, startTime),
      eq(timeSlots.endTime, endTime),
      eq(timeSlots.isActive, true),
    ];
    if (coachId !== null) {
      conditions.push(eq(timeSlots.coachId, coachId));
    }
    const [slot] = await db.select().from(timeSlots).where(and(...conditions));
    return slot;
  }

  async createSlot(slot: InsertTimeSlot): Promise<TimeSlot> {
    const [created] = await db.insert(timeSlots).values(slot).returning();
    return created;
  }

  async updateTimeSlotCoachAndClassroom(slotId: number, franchiseId: number, coachId: number, classroomId: number | null): Promise<TimeSlot> {
    const [updated] = await db
      .update(timeSlots)
      .set({ coachId, classroomId })
      .where(and(eq(timeSlots.id, slotId), eq(timeSlots.franchiseId, franchiseId)))
      .returning();
    return updated;
  }

  async deleteSlot(id: number): Promise<void> {
    await db.delete(bookings).where(eq(bookings.slotId, id));
    await db.delete(timeSlots).where(eq(timeSlots.id, id));
  }

  async getCoachScheduleAcrossFranchises(coachId: number): Promise<any[]> {
    const rows = await db
      .select({
        slotId: timeSlots.id,
        franchiseId: timeSlots.franchiseId,
        franchiseName: franchises.name,
        date: timeSlots.date,
        startTime: timeSlots.startTime,
        endTime: timeSlots.endTime,
        maxSeats: timeSlots.maxSeats,
        bookedSeats: timeSlots.bookedSeats,
      })
      .from(timeSlots)
      .innerJoin(franchises, eq(timeSlots.franchiseId, franchises.id))
      .where(and(eq(timeSlots.coachId, coachId), eq(timeSlots.isActive, true)))
      .orderBy(timeSlots.date, timeSlots.startTime);
    return rows;
  }

  async getOverlappingSlots(franchiseId: number, date: string, startTime: string, endTime: string, excludeSlotId?: number): Promise<TimeSlot[]> {
    const conditions = [
      eq(timeSlots.franchiseId, franchiseId),
      eq(timeSlots.date, date),
      eq(timeSlots.isActive, true),
      sql`${timeSlots.startTime} < ${endTime}`,
      sql`${timeSlots.endTime} > ${startTime}`,
    ];
    if (excludeSlotId) {
      conditions.push(sql`${timeSlots.id} != ${excludeSlotId}`);
    }
    return db.select().from(timeSlots).where(and(...conditions));
  }

  async getClassroomOverlappingSlots(classroomId: number, date: string, startTime: string, endTime: string, excludeSlotId?: number): Promise<TimeSlot[]> {
    const conditions = [
      eq(timeSlots.classroomId, classroomId),
      eq(timeSlots.date, date),
      eq(timeSlots.isActive, true),
      sql`${timeSlots.startTime} < ${endTime}`,
      sql`${timeSlots.endTime} > ${startTime}`,
    ];
    if (excludeSlotId) {
      conditions.push(sql`${timeSlots.id} != ${excludeSlotId}`);
    }
    return db.select().from(timeSlots).where(and(...conditions));
  }

  async getCoachOverlappingSlots(coachId: number, date: string, startTime: string, endTime: string, excludeSlotId?: number): Promise<any[]> {
    const conditions = [
      eq(timeSlots.coachId, coachId),
      eq(timeSlots.date, date),
      eq(timeSlots.isActive, true),
      sql`${timeSlots.startTime} < ${endTime}`,
      sql`${timeSlots.endTime} > ${startTime}`,
    ];
    if (excludeSlotId) {
      conditions.push(sql`${timeSlots.id} != ${excludeSlotId}`);
    }
    const rows = await db
      .select({
        slotId: timeSlots.id,
        franchiseId: timeSlots.franchiseId,
        franchiseName: franchises.name,
        date: timeSlots.date,
        startTime: timeSlots.startTime,
        endTime: timeSlots.endTime,
      })
      .from(timeSlots)
      .innerJoin(franchises, eq(timeSlots.franchiseId, franchises.id))
      .where(and(...conditions));
    return rows;
  }

  async getSlotsByClassroom(classroomId: number): Promise<TimeSlot[]> {
    return db.select().from(timeSlots)
      .where(and(eq(timeSlots.classroomId, classroomId), eq(timeSlots.isActive, true)));
  }

  async getClassroomsByFranchise(franchiseId: number): Promise<Classroom[]> {
    return db.select().from(classrooms)
      .where(and(eq(classrooms.franchiseId, franchiseId), eq(classrooms.isActive, true)))
      .orderBy(classrooms.name);
  }

  async createClassroom(data: InsertClassroom): Promise<Classroom> {
    const [created] = await db.insert(classrooms).values(data).returning();
    return created;
  }

  async updateClassroom(id: number, data: Partial<InsertClassroom>): Promise<Classroom> {
    const [updated] = await db.update(classrooms).set(data).where(eq(classrooms.id, id)).returning();
    return updated;
  }

  async deleteClassroom(id: number): Promise<void> {
    await db.update(classrooms).set({ isActive: false }).where(eq(classrooms.id, id));
  }

  async getFranchiseStudents(franchiseId: number): Promise<any[]> {
    const bookingStudents = await db
      .selectDistinctOn([children.id], {
        id: children.id,
        name: children.name,
        grade: children.grade,
        school: children.school,
        studentCode: children.studentCode,
        parentId: children.parentId,
      })
      .from(bookings)
      .innerJoin(timeSlots, eq(bookings.slotId, timeSlots.id))
      .innerJoin(children, eq(bookings.childId, children.id))
      .where(eq(timeSlots.franchiseId, franchiseId))
      .orderBy(children.id, children.name);

    const linkedStudents = await db
      .select({
        id: children.id,
        name: children.name,
        grade: children.grade,
        school: children.school,
        studentCode: children.studentCode,
        parentId: children.parentId,
      })
      .from(franchiseStudents)
      .innerJoin(children, eq(franchiseStudents.childId, children.id))
      .where(eq(franchiseStudents.franchiseId, franchiseId));

    const seenIds = new Set<number>();
    const allStudents = [];
    for (const s of [...bookingStudents, ...linkedStudents]) {
      if (!seenIds.has(s.id)) {
        seenIds.add(s.id);
        allStudents.push(s);
      }
    }

    const result = [];
    for (const row of allStudents) {
      const [parent] = row.parentId
        ? await db.select({ firstName: users.firstName, lastName: users.lastName, phone: users.phone }).from(users).where(eq(users.id, row.parentId))
        : [null];
      const [countRow] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(bookings)
        .innerJoin(timeSlots, eq(bookings.slotId, timeSlots.id))
        .where(and(eq(bookings.childId, row.id), eq(timeSlots.franchiseId, franchiseId)));
      result.push({
        ...row,
        parentName: parent ? `${parent.lastName || ""}${parent.firstName || ""}`.trim() || "未設定" : "未設定",
        parentPhone: parent?.phone || null,
        bookingCount: countRow?.count || 0,
      });
    }
    return result;
  }

  async addFranchiseStudent(franchiseId: number, name: string, grade: number): Promise<any> {
    const placeholderParentId = `franchise-${franchiseId}-parent-placeholder`;
    await db.insert(users).values({
      id: placeholderParentId,
      username: `franchise-${franchiseId}-parent`,
      passwordHash: "nologin",
      role: "parent",
      firstName: "教室學生",
      lastName: "",
    }).onConflictDoNothing();
    const child = await this.createChild({ parentId: placeholderParentId, name, grade });
    await db.insert(franchiseStudents).values({ franchiseId, childId: child.id });
    return child;
  }

  async removeFranchiseStudent(franchiseId: number, childId: number): Promise<void> {
    await db.delete(franchiseStudents).where(
      and(eq(franchiseStudents.franchiseId, franchiseId), eq(franchiseStudents.childId, childId))
    );
  }

  async getFranchiseStudentBookings(franchiseId: number, childId: number): Promise<any[]> {
    const results = await db
      .select({
        id: bookings.id,
        status: bookings.status,
        createdAt: bookings.createdAt,
        date: timeSlots.date,
        startTime: timeSlots.startTime,
        endTime: timeSlots.endTime,
        coachName: coaches.name,
        classroomId: timeSlots.classroomId,
      })
      .from(bookings)
      .innerJoin(timeSlots, eq(bookings.slotId, timeSlots.id))
      .leftJoin(coaches, eq(timeSlots.coachId, coaches.id))
      .where(and(eq(bookings.childId, childId), eq(timeSlots.franchiseId, franchiseId)))
      .orderBy(desc(timeSlots.date), desc(timeSlots.startTime));

    const enriched = [];
    for (const r of results) {
      let classroomName = null;
      if (r.classroomId) {
        const [cr] = await db.select({ name: classrooms.name }).from(classrooms).where(eq(classrooms.id, r.classroomId));
        classroomName = cr?.name || null;
      }
      enriched.push({ id: r.id, status: r.status, createdAt: r.createdAt, date: r.date, startTime: r.startTime, endTime: r.endTime, coachName: r.coachName, classroomName });
    }
    return enriched;
  }

  async getFranchiseStudentContactBooks(franchiseId: number, childId: number): Promise<any[]> {
    const results = await db
      .select({
        id: contactBooks.id,
        lessonDate: contactBooks.lessonDate,
        lessonUnit: contactBooks.lessonUnit,
        lessonProgress: contactBooks.lessonProgress,
        performance: contactBooks.performance,
        teacherRemarks: contactBooks.teacherRemarks,
        quizScore: contactBooks.quizScore,
        quizTotal: contactBooks.quizTotal,
        homework: contactBooks.homework,
        coachId: contactBooks.coachId,
        coachName: coaches.name,
        createdAt: contactBooks.createdAt,
      })
      .from(contactBooks)
      .innerJoin(coaches, eq(contactBooks.coachId, coaches.id))
      .where(and(eq(contactBooks.childId, childId), eq(coaches.franchiseId, franchiseId)))
      .orderBy(desc(contactBooks.lessonDate));

    return results;
  }

  async createManualBooking(slotId: number, childId: number, franchiseId: number): Promise<any> {
    const [slot] = await db.select().from(timeSlots).where(eq(timeSlots.id, slotId));
    if (!slot) throw new Error("時段不存在");
    if (slot.franchiseId !== franchiseId) throw new Error("此時段不屬於您的分校");
    if (slot.bookedSeats >= slot.maxSeats) throw new Error("此時段已額滿");

    const now = new Date();
    const slotEnd = new Date(`${slot.date}T${slot.endTime}:00+08:00`);
    if (now > slotEnd) throw new Error("此時段已結束，無法加排");

    const existing = await db.select().from(bookings).where(
      and(
        eq(bookings.slotId, slotId),
        eq(bookings.childId, childId),
        inArray(bookings.status, ["confirmed", "checked_in"])
      )
    );
    if (existing.length > 0) throw new Error("此學生已預約此時段");

    const [child] = await db.select().from(children).where(eq(children.id, childId));
    if (!child) throw new Error("學生不存在");

    const franchiseBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .innerJoin(timeSlots, eq(bookings.slotId, timeSlots.id))
      .where(and(eq(bookings.childId, childId), eq(timeSlots.franchiseId, franchiseId)))
      .limit(1);
    const linkedStudent = await db
      .select({ id: franchiseStudents.id })
      .from(franchiseStudents)
      .where(and(eq(franchiseStudents.childId, childId), eq(franchiseStudents.franchiseId, franchiseId)))
      .limit(1);
    if (franchiseBookings.length === 0 && linkedStudent.length === 0) throw new Error("此學生非本分校學生，無法加排");

    const overlapping = await this.getChildOverlappingBookings(childId, slot.date, slot.startTime, slot.endTime);
    if (overlapping.length > 0) {
      const conflict = overlapping[0];
      throw new Error(`此學生在 ${conflict.date} ${conflict.startTime}-${conflict.endTime} 已有其他預約，時間衝突無法加排`);
    }

    const [updated] = await db
      .update(timeSlots)
      .set({ bookedSeats: sql`LEAST(${timeSlots.bookedSeats} + 1, ${timeSlots.maxSeats})` })
      .where(and(eq(timeSlots.id, slotId), sql`${timeSlots.bookedSeats} < ${timeSlots.maxSeats}`))
      .returning();
    if (!updated) throw new Error("此時段已額滿");

    const [created] = await db.insert(bookings).values({
      slotId,
      childId,
      parentId: child.parentId,
      status: "confirmed",
    }).returning();

    return { ...created, childName: child.name };
  }

  async createManualBookingExtended(params: {
    slotId: number;
    franchiseId: number;
    childId?: number;
    walkInName?: string;
    walkInGrade?: number;
    walkInSchool?: string;
    overrideCapacity?: boolean;
  }): Promise<any> {
    const { slotId, franchiseId, childId, walkInName, walkInGrade, walkInSchool, overrideCapacity } = params;

    const [slot] = await db.select().from(timeSlots).where(eq(timeSlots.id, slotId));
    if (!slot) throw new Error("時段不存在");
    if (slot.franchiseId !== franchiseId) throw new Error("此時段不屬於您的分校");

    const now = new Date();
    const slotEnd = new Date(`${slot.date}T${slot.endTime}:00+08:00`);
    if (now > slotEnd) throw new Error("此時段已結束，無法加排");

    if (!overrideCapacity && slot.bookedSeats >= slot.maxSeats) throw new Error("此時段已額滿，請勾選「主任特批超額」");

    let child: { id: number; name: string; grade: number; parentId: string | null };

    if (walkInName && walkInGrade) {
      const [created] = await db.insert(children).values({
        parentId: null,
        name: walkInName.trim(),
        grade: walkInGrade,
        school: walkInSchool?.trim() || null,
      }).returning();
      child = created as any;
      const existing = await db.select().from(franchiseStudents)
        .where(and(eq(franchiseStudents.childId, created.id), eq(franchiseStudents.franchiseId, franchiseId)));
      if (existing.length === 0) {
        await db.insert(franchiseStudents).values({ franchiseId, childId: created.id });
      }
    } else if (childId) {
      const [found] = await db.select().from(children).where(eq(children.id, childId));
      if (!found) throw new Error("學生不存在");
      const franchiseBookings = await db.select({ id: bookings.id }).from(bookings)
        .innerJoin(timeSlots, eq(bookings.slotId, timeSlots.id))
        .where(and(eq(bookings.childId, childId), eq(timeSlots.franchiseId, franchiseId))).limit(1);
      const linked = await db.select({ id: franchiseStudents.id }).from(franchiseStudents)
        .where(and(eq(franchiseStudents.childId, childId), eq(franchiseStudents.franchiseId, franchiseId))).limit(1);
      if (franchiseBookings.length === 0 && linked.length === 0) throw new Error("此學生非本分校學生，無法加排");
      child = found as any;
    } else {
      throw new Error("請選擇學生或填寫臨時學生資料");
    }

    const existingBooking = await db.select().from(bookings).where(
      and(eq(bookings.slotId, slotId), eq(bookings.childId, child.id), inArray(bookings.status, ["confirmed", "checked_in"]))
    );
    if (existingBooking.length > 0) throw new Error("此學生已預約此時段");

    const overlapping = await this.getChildOverlappingBookings(child.id, slot.date, slot.startTime, slot.endTime);
    if (overlapping.length > 0) {
      const c = overlapping[0];
      throw new Error(`此學生在 ${c.date} ${c.startTime}-${c.endTime} 已有其他預約，時間衝突`);
    }

    await db.update(timeSlots).set({ bookedSeats: sql`${timeSlots.bookedSeats} + 1` }).where(eq(timeSlots.id, slotId));

    const [created] = await db.insert(bookings).values({
      slotId,
      childId: child.id,
      parentId: child.parentId ?? null,
      status: "confirmed",
    }).returning();

    return { ...created, childName: child.name };
  }

  async getBooking(id: number): Promise<any | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingsByParent(parentId: string): Promise<any[]> {
    const results = await db
      .select({
        booking: bookings,
        slot: timeSlots,
        franchise: franchises,
        coach: coaches,
        child: children,
      })
      .from(bookings)
      .innerJoin(timeSlots, eq(bookings.slotId, timeSlots.id))
      .innerJoin(franchises, eq(timeSlots.franchiseId, franchises.id))
      .leftJoin(coaches, eq(timeSlots.coachId, coaches.id))
      .innerJoin(children, eq(bookings.childId, children.id))
      .where(eq(bookings.parentId, parentId))
      .orderBy(desc(bookings.createdAt));

    return results.map((r) => ({
      ...r.booking,
      slotDate: r.slot.date,
      slotStartTime: r.slot.startTime,
      slotEndTime: r.slot.endTime,
      franchiseName: r.franchise.name,
      coachName: r.coach?.name || null,
      childName: r.child.name,
      childGender: r.child.gender || "male",
    }));
  }

  async getChildOverlappingBookings(childId: number, date: string, startTime: string, endTime: string, excludeBookingId?: number): Promise<any[]> {
    const conditions = [
      eq(bookings.childId, childId),
      eq(timeSlots.date, date),
      inArray(bookings.status, ["confirmed", "checked_in"]),
      sql`${timeSlots.startTime} < ${endTime}`,
      sql`${timeSlots.endTime} > ${startTime}`,
    ];
    if (excludeBookingId) {
      conditions.push(sql`${bookings.id} != ${excludeBookingId}`);
    }
    return db
      .select({
        bookingId: bookings.id,
        slotId: bookings.slotId,
        date: timeSlots.date,
        startTime: timeSlots.startTime,
        endTime: timeSlots.endTime,
      })
      .from(bookings)
      .innerJoin(timeSlots, eq(bookings.slotId, timeSlots.id))
      .where(and(...conditions));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [slot] = await db
      .select()
      .from(timeSlots)
      .where(eq(timeSlots.id, booking.slotId));

    if (!slot) throw new Error("時段不存在");
    if (slot.bookedSeats >= slot.maxSeats) throw new Error("此時段已額滿");

    const existing = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.slotId, booking.slotId),
          eq(bookings.childId, booking.childId),
          eq(bookings.status, "confirmed")
        )
      );
    if (existing.length > 0) throw new Error("此孩子已預約過此時段，無法重複預約");

    return await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(${booking.childId})`);

      const overlapping = await tx
        .select({
          bookingId: bookings.id,
          slotId: bookings.slotId,
          date: timeSlots.date,
          startTime: timeSlots.startTime,
          endTime: timeSlots.endTime,
        })
        .from(bookings)
        .innerJoin(timeSlots, eq(bookings.slotId, timeSlots.id))
        .where(and(
          eq(bookings.childId, booking.childId),
          eq(timeSlots.date, slot.date),
          inArray(bookings.status, ["confirmed", "checked_in"]),
          sql`${timeSlots.startTime} < ${slot.endTime}`,
          sql`${timeSlots.endTime} > ${slot.startTime}`,
        ));
      if (overlapping.length > 0) {
        const conflict = overlapping[0];
        throw new Error(`此孩子在 ${conflict.date} ${conflict.startTime}-${conflict.endTime} 已有其他預約，時間衝突無法預約`);
      }

      const [updated] = await tx
        .update(timeSlots)
        .set({ bookedSeats: sql`${timeSlots.bookedSeats} + 1` })
        .where(and(eq(timeSlots.id, booking.slotId), sql`${timeSlots.bookedSeats} < ${timeSlots.maxSeats}`))
        .returning();
      if (!updated) throw new Error("此時段已額滿");

      const [created] = await tx.insert(bookings).values(booking).returning();
      return created;
    });
  }

  async hasExistingBooking(slotId: number, childId: number): Promise<boolean> {
    const existing = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.slotId, slotId),
          eq(bookings.childId, childId),
          inArray(bookings.status, ["confirmed", "checked_in"])
        )
      );
    return existing.length > 0;
  }

  async cancelBooking(id: number): Promise<void> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    if (!booking) throw new Error("預約不存在");
    if (booking.status !== "confirmed") throw new Error("此預約無法取消");

    await db
      .update(bookings)
      .set({ status: "cancelled" })
      .where(eq(bookings.id, id));

    await db
      .update(timeSlots)
      .set({ bookedSeats: sql`GREATEST(${timeSlots.bookedSeats} - 1, 0)` })
      .where(eq(timeSlots.id, booking.slotId));
  }

  async completeExpiredBookings(): Promise<number> {
    const now = new Date();
    const tzOffset = 8 * 60;
    const taiwanNow = new Date(now.getTime() + (tzOffset + now.getTimezoneOffset()) * 60000);
    const todayStr = taiwanNow.toISOString().split("T")[0];
    const nowTimeStr = taiwanNow.toTimeString().slice(0, 5);

    const expiredSlots = await db.select({ id: timeSlots.id })
      .from(timeSlots)
      .where(
        sql`${timeSlots.date} < ${todayStr} OR (${timeSlots.date} = ${todayStr} AND ${timeSlots.endTime} <= ${nowTimeStr})`
      );

    if (expiredSlots.length === 0) return 0;

    const expiredSlotIds = expiredSlots.map(s => s.id);
    const result = await db.update(bookings)
      .set({ status: "completed" })
      .where(and(
        inArray(bookings.slotId, expiredSlotIds),
        inArray(bookings.status, ["confirmed", "checked_in"])
      ))
      .returning();

    return result.length;
  }

  async getFaqs(): Promise<Faq[]> {
    return db.select().from(faqs).where(eq(faqs.isActive, true)).orderBy(faqs.sortOrder);
  }

  async getAllFaqs(): Promise<Faq[]> {
    return db.select().from(faqs).orderBy(faqs.sortOrder);
  }

  async createFaq(faq: InsertFaq): Promise<Faq> {
    const [created] = await db.insert(faqs).values(faq).returning();
    return created;
  }

  async updateFaq(id: number, data: Partial<InsertFaq>): Promise<Faq> {
    const [updated] = await db.update(faqs).set(data).where(eq(faqs.id, id)).returning();
    return updated;
  }

  async deleteFaq(id: number): Promise<void> {
    await db.delete(faqs).where(eq(faqs.id, id));
  }

  async getSuccessStories(): Promise<SuccessStory[]> {
    return db.select().from(successStories).where(eq(successStories.isActive, true)).orderBy(desc(successStories.createdAt));
  }

  async getAllSuccessStories(): Promise<SuccessStory[]> {
    return db.select().from(successStories).orderBy(desc(successStories.createdAt));
  }

  async createSuccessStory(story: InsertSuccessStory): Promise<SuccessStory> {
    const [created] = await db.insert(successStories).values(story).returning();
    return created;
  }

  async updateSuccessStory(id: number, data: Partial<InsertSuccessStory>): Promise<SuccessStory> {
    const [updated] = await db.update(successStories).set(data).where(eq(successStories.id, id)).returning();
    return updated;
  }

  async deleteSuccessStory(id: number): Promise<void> {
    await db.delete(successStories).where(eq(successStories.id, id));
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return db.select().from(announcements).where(eq(announcements.isActive, true)).orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [created] = await db.insert(announcements).values(announcement).returning();
    return created;
  }

  async updateAnnouncement(id: number, data: Partial<InsertAnnouncement>): Promise<Announcement> {
    const [updated] = await db.update(announcements).set(data).where(eq(announcements.id, id)).returning();
    return updated;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  async getAdminStats() {
    const [studentCount] = await db.select({ count: sql<number>`count(*)` }).from(children);
    const [franchiseCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(franchises)
      .where(eq(franchises.isActive, true));
    const [bookingCount] = await db.select({ count: sql<number>`count(*)` }).from(bookings);

    const activeCoaches = await db
      .select({ id: coaches.id, userId: coaches.userId })
      .from(coaches)
      .where(eq(coaches.isActive, true));
    const uniqueCoachCount = new Set(
      activeCoaches.map((c) => c.userId ?? `id:${c.id}`)
    ).size;

    return {
      totalStudents: Number(studentCount.count),
      totalCoaches: uniqueCoachCount,
      totalFranchises: Number(franchiseCount.count),
      totalBookings: Number(bookingCount.count),
    };
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserRole(id: string, role: string, franchiseId: number | null): Promise<User> {
    const [updated] = await db.update(users).set({ role, franchiseId, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return updated;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    return user;
  }

  async updateUserLineUserId(userId: string, lineUserId: string | null): Promise<void> {
    await db.update(users).set({ lineUserId, updatedAt: new Date() }).where(eq(users.id, userId));
  }

  async getBookingsByFranchise(franchiseId: number): Promise<any[]> {
    const results = await db
      .select({
        booking: bookings,
        slot: timeSlots,
        child: children,
      })
      .from(bookings)
      .innerJoin(timeSlots, eq(bookings.slotId, timeSlots.id))
      .innerJoin(children, eq(bookings.childId, children.id))
      .where(eq(timeSlots.franchiseId, franchiseId))
      .orderBy(desc(bookings.createdAt));

    return results.map((r) => ({
      id: r.booking.id,
      slotId: r.booking.slotId,
      childId: r.booking.childId,
      status: r.booking.status,
      createdAt: r.booking.createdAt,
      childName: r.child.name,
      childGrade: r.child.grade,
      childSchool: r.child.school,
      date: r.slot.date,
      startTime: r.slot.startTime,
      endTime: r.slot.endTime,
    }));
  }

  async getFranchiseStats(franchiseId: number) {
    const [coachCount] = await db.select({ count: sql<number>`count(*)` }).from(coaches).where(and(eq(coaches.franchiseId, franchiseId), eq(coaches.isActive, true)));
    const [slotCount] = await db.select({ count: sql<number>`count(*)` }).from(timeSlots).where(eq(timeSlots.franchiseId, franchiseId));

    const franchiseSlots = await db.select({ id: timeSlots.id }).from(timeSlots).where(eq(timeSlots.franchiseId, franchiseId));
    let totalBookings = 0;
    let confirmedBookings = 0;
    let attendedBookings = 0;
    if (franchiseSlots.length > 0) {
      const slotIds = franchiseSlots.map((s) => s.id);
      const [allBookings] = await db.select({ count: sql<number>`count(*)` }).from(bookings).where(inArray(bookings.slotId, slotIds));
      const [confirmed] = await db.select({ count: sql<number>`count(*)` }).from(bookings).where(and(inArray(bookings.slotId, slotIds), eq(bookings.status, "confirmed")));
      const [attended] = await db.select({ count: sql<number>`count(*)` }).from(bookings).where(and(inArray(bookings.slotId, slotIds), inArray(bookings.status, ["completed", "checked_in"])));
      totalBookings = Number(allBookings.count);
      confirmedBookings = Number(confirmed.count);
      attendedBookings = Number(attended.count);
    }

    return {
      totalCoaches: Number(coachCount.count),
      totalSlots: Number(slotCount.count),
      totalBookings,
      confirmedBookings,
      attendedBookings,
    };
  }

  async getFranchiseTodayStats(franchiseId: number) {
    const now = new Date();
    const taiwanDate = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const today = taiwanDate.toISOString().split("T")[0];

    const todaySlotRows = await db
      .select({
        id: timeSlots.id,
        startTime: timeSlots.startTime,
        endTime: timeSlots.endTime,
        coachId: timeSlots.coachId,
        classroomId: timeSlots.classroomId,
        bookedSeats: timeSlots.bookedSeats,
        maxSeats: timeSlots.maxSeats,
      })
      .from(timeSlots)
      .where(and(eq(timeSlots.franchiseId, franchiseId), eq(timeSlots.date, today), eq(timeSlots.isActive, true)));

    const coachIds = [...new Set(todaySlotRows.filter((s) => s.coachId).map((s) => s.coachId!))];
    const coachRows = coachIds.length > 0
      ? await db.select({ id: coaches.id, name: coaches.name }).from(coaches).where(inArray(coaches.id, coachIds))
      : [];

    const classroomIds = [...new Set(todaySlotRows.filter((s) => s.classroomId).map((s) => s.classroomId!))];
    const classroomRows = classroomIds.length > 0
      ? await db.select({ id: classrooms.id, name: classrooms.name }).from(classrooms).where(inArray(classrooms.id, classroomIds))
      : [];

    const slotIds = todaySlotRows.map((s) => s.id);
    const todayBookingRows = slotIds.length > 0
      ? await db
          .select({
            id: bookings.id,
            slotId: bookings.slotId,
            childId: bookings.childId,
            status: bookings.status,
          })
          .from(bookings)
          .where(inArray(bookings.slotId, slotIds))
      : [];

    const childIds = [...new Set(todayBookingRows.map((b) => b.childId))];
    const childRows = childIds.length > 0
      ? await db.select({ id: children.id, name: children.name, grade: children.grade }).from(children).where(inArray(children.id, childIds))
      : [];
    const childMap = Object.fromEntries(childRows.map((c) => [c.id, c]));

    const coachMap = Object.fromEntries(coachRows.map((c) => [c.id, c.name]));
    const classroomMap = Object.fromEntries(classroomRows.map((c) => [c.id, c.name]));

    const slotDetails = todaySlotRows.map((s) => ({
      id: s.id,
      startTime: s.startTime,
      endTime: s.endTime,
      coachName: s.coachId ? (coachMap[s.coachId] || "未指派") : "未指派",
      classroomName: s.classroomId ? (classroomMap[s.classroomId] || null) : null,
      bookedSeats: s.bookedSeats,
      maxSeats: s.maxSeats,
    }));

    const bookingDetails = todayBookingRows.map((b) => {
      const child = childMap[b.childId];
      const slot = todaySlotRows.find((s) => s.id === b.slotId);
      return {
        id: b.id,
        childName: child?.name || "未知",
        childGrade: child?.grade || 0,
        status: b.status,
        startTime: slot?.startTime || "",
        endTime: slot?.endTime || "",
      };
    });

    const attendedBookings = bookingDetails.filter((b) => b.status === "checked_in" || b.status === "completed");

    return {
      date: today,
      todayCoaches: coachRows.length,
      coachList: coachRows.map((c) => c.name),
      todaySlots: todaySlotRows.length,
      slotList: slotDetails,
      todayBookings: todayBookingRows.length,
      bookingList: bookingDetails,
      todayAttended: attendedBookings.length,
      attendedList: attendedBookings,
    };
  }

  async getFranchiseStatsByDateRange(franchiseId: number, startDate: string, endDate: string) {
    const slotsInRange = await db
      .select({
        id: timeSlots.id,
        date: timeSlots.date,
        coachId: timeSlots.coachId,
        maxSeats: timeSlots.maxSeats,
        bookedSeats: timeSlots.bookedSeats,
      })
      .from(timeSlots)
      .where(
        and(
          eq(timeSlots.franchiseId, franchiseId),
          gte(timeSlots.date, startDate),
          lte(timeSlots.date, endDate),
        )
      );

    const slotIds = slotsInRange.map((s) => s.id);
    let bookingRows: Array<{ slotId: number; status: string }> = [];
    if (slotIds.length > 0) {
      bookingRows = await db
        .select({ slotId: bookings.slotId, status: bookings.status })
        .from(bookings)
        .where(inArray(bookings.slotId, slotIds));
    }

    const totalSlots = slotsInRange.length;
    const totalBookings = bookingRows.length;
    const confirmedBookings = bookingRows.filter((b) => b.status === "confirmed").length;
    const completedBookings = bookingRows.filter((b) => b.status === "completed").length;
    const checkedInBookings = bookingRows.filter((b) => b.status === "checked_in").length;
    const cancelledBookings = bookingRows.filter((b) => b.status === "cancelled").length;
    const totalSeats = slotsInRange.reduce((sum, s) => sum + s.maxSeats, 0);
    const bookedSeats = slotsInRange.reduce((sum, s) => sum + s.bookedSeats, 0);
    const occupancyRate = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;

    const dailyMap = new Map<string, { slots: number; bookings: number; bookedSeats: number; totalSeats: number }>();
    for (const slot of slotsInRange) {
      const d = dailyMap.get(slot.date) || { slots: 0, bookings: 0, bookedSeats: 0, totalSeats: 0 };
      d.slots++;
      d.totalSeats += slot.maxSeats;
      d.bookedSeats += slot.bookedSeats;
      dailyMap.set(slot.date, d);
    }
    for (const b of bookingRows) {
      const slot = slotsInRange.find((s) => s.id === b.slotId);
      if (slot) {
        const d = dailyMap.get(slot.date);
        if (d) d.bookings++;
      }
    }
    const dailyStats = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const franchiseCoaches = await db.select({ id: coaches.id, name: coaches.name }).from(coaches).where(eq(coaches.franchiseId, franchiseId));
    const coachMap = new Map<number, { coachId: number; coachName: string; slots: number; bookings: number; confirmedBookings: number; cancelledBookings: number; completedBookings: number; bookedSeats: number }>();
    for (const c of franchiseCoaches) {
      coachMap.set(c.id, { coachId: c.id, coachName: c.name, slots: 0, bookings: 0, confirmedBookings: 0, cancelledBookings: 0, completedBookings: 0, bookedSeats: 0 });
    }
    for (const slot of slotsInRange) {
      if (slot.coachId && coachMap.has(slot.coachId)) {
        const c = coachMap.get(slot.coachId)!;
        c.slots++;
        c.bookedSeats += slot.bookedSeats;
      }
    }
    for (const b of bookingRows) {
      const slot = slotsInRange.find((s) => s.id === b.slotId);
      if (slot?.coachId && coachMap.has(slot.coachId)) {
        const entry = coachMap.get(slot.coachId)!;
        entry.bookings++;
        if (b.status === "confirmed") entry.confirmedBookings++;
        else if (b.status === "cancelled") entry.cancelledBookings++;
        else if (b.status === "completed") entry.completedBookings++;
      }
    }
    const coachStats = Array.from(coachMap.values());

    return { totalSlots, totalBookings, confirmedBookings, completedBookings, checkedInBookings, cancelledBookings, totalSeats, bookedSeats, occupancyRate, dailyStats, coachStats };
  }

  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products).orderBy(products.sortOrder, products.id);
  }

  async getActiveProducts(): Promise<Product[]> {
    return db.select().from(products).where(eq(products.isActive, true)).orderBy(products.sortOrder, products.id);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(data: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(data).returning();
    return product;
  }

  async updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    const rows = await db
      .select({ cartItem: cartItems, product: products })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId))
      .orderBy(desc(cartItems.createdAt));
    return rows.map((r) => ({ ...r.cartItem, product: r.product }));
  }

  async addToCart(userId: string, productId: number, quantity: number): Promise<CartItem> {
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
    if (existing) {
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existing.quantity + quantity })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    }
    const [item] = await db.insert(cartItems).values({ userId, productId, quantity }).returning();
    return item;
  }

  async updateCartQuantity(cartItemId: number, quantity: number): Promise<CartItem> {
    const [item] = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, cartItemId)).returning();
    return item;
  }

  async removeFromCart(cartItemId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  async createOrder(userId: string, items: { productId: number; quantity: number }[], note?: string): Promise<Order> {
    let totalAmount = 0;
    const resolvedItems: { productId: number; productName: string; quantity: number; unitPrice: number }[] = [];
    for (const item of items) {
      const product = await this.getProduct(item.productId);
      if (!product) throw new Error(`商品不存在: ${item.productId}`);
      if (!product.isActive) throw new Error(`商品已下架: ${product.name}`);
      if (product.stock < item.quantity) throw new Error(`庫存不足: ${product.name}`);
      const unitPrice = product.discountPrice ?? product.price;
      resolvedItems.push({ productId: product.id, productName: product.name, quantity: item.quantity, unitPrice });
      totalAmount += unitPrice * item.quantity;
    }
    const [order] = await db.insert(orders).values({ userId, totalAmount, status: "pending", note: note || null }).returning();
    for (const ri of resolvedItems) {
      await db.insert(orderItems).values({ orderId: order.id, ...ri });
      await db.update(products).set({ stock: sql`${products.stock} - ${ri.quantity}` }).where(eq(products.id, ri.productId));
    }
    await this.clearCart(userId);
    return order;
  }

  async getOrders(userId?: string): Promise<(Order & { userName?: string })[]> {
    if (userId) {
      return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
    }
    const rows = await db
      .select({ order: orders, firstName: users.firstName })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt));
    return rows.map((r) => ({ ...r.order, userName: r.firstName || undefined }));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [order] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return order;
  }

  async getAllSiteContent(): Promise<SiteContent[]> {
    return db.select().from(siteContent);
  }

  async getSiteContent(sectionKey: string): Promise<SiteContent | undefined> {
    const [row] = await db.select().from(siteContent).where(eq(siteContent.sectionKey, sectionKey));
    return row;
  }

  async upsertSiteContent(sectionKey: string, value: string): Promise<SiteContent> {
    const existing = await this.getSiteContent(sectionKey);
    if (existing) {
      const [updated] = await db.update(siteContent)
        .set({ value, updatedAt: new Date() })
        .where(eq(siteContent.sectionKey, sectionKey))
        .returning();
      return updated;
    }
    const [created] = await db.insert(siteContent).values({ sectionKey, value }).returning();
    return created;
  }
  async promoteAllGrades(): Promise<number> {
    const result = await db.update(children)
      .set({ grade: sql`${children.grade} + 1` })
      .where(lte(children.grade, 6))
      .returning();
    return result.length;
  }

  async createCoachAccount(coachId: number, userId: string): Promise<Coach> {
    const [updated] = await db.update(coaches).set({ userId }).where(eq(coaches.id, coachId)).returning();
    return updated;
  }

  async getCoachByUserId(userId: string): Promise<Coach | undefined> {
    const [coach] = await db.select().from(coaches).where(eq(coaches.userId, userId));
    return coach;
  }

  async getCoachesByUserId(userId: string): Promise<Coach[]> {
    return db.select().from(coaches).where(eq(coaches.userId, userId));
  }

  async getCoachSlotsByUserId(userId: string, year: number, month: number): Promise<any[]> {
    const allCoaches = await this.getCoachesByUserId(userId);
    if (allCoaches.length === 0) return [];
    const coachIds = allCoaches.map(c => c.id);

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endMonth = month === 12 ? 1 : month + 1;
    const endYear = month === 12 ? year + 1 : year;
    const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

    const slots = await db.select({
      slot: timeSlots,
      franchise: franchises,
    })
      .from(timeSlots)
      .leftJoin(franchises, eq(timeSlots.franchiseId, franchises.id))
      .where(
        and(
          inArray(timeSlots.coachId, coachIds),
          gte(timeSlots.date, startDate),
          sql`${timeSlots.date} < ${endDate}`
        )
      )
      .orderBy(timeSlots.date, timeSlots.startTime);

    return slots.map(s => ({
      ...s.slot,
      franchiseName: s.franchise?.name,
    }));
  }

  async getCoachStudentsByUserId(userId: string): Promise<any[]> {
    const allCoaches = await this.getCoachesByUserId(userId);
    if (allCoaches.length === 0) return [];
    const coachIds = allCoaches.map(c => c.id);

    const coachSlots = await db.select({
      id: timeSlots.id,
      coachId: timeSlots.coachId,
      franchiseId: timeSlots.franchiseId,
    }).from(timeSlots).where(inArray(timeSlots.coachId, coachIds));
    if (coachSlots.length === 0) return [];

    const slotIds = coachSlots.map(s => s.id);
    const coachSlotMap = new Map(coachSlots.map(s => [s.id, s]));

    const franchiseIds = [...new Set(coachSlots.map(s => s.franchiseId))];
    const franchiseRows = franchiseIds.length > 0
      ? await db.select({ id: franchises.id, name: franchises.name }).from(franchises).where(inArray(franchises.id, franchiseIds))
      : [];
    const franchiseMap = new Map(franchiseRows.map(f => [f.id, f.name]));

    const bookingRows = await db.select({
      child: children,
      booking: bookings,
    })
      .from(bookings)
      .innerJoin(children, eq(bookings.childId, children.id))
      .where(
        and(
          inArray(bookings.slotId, slotIds),
          inArray(bookings.status, ["confirmed", "checked_in", "absent", "completed"])
        )
      );

    const childMap = new Map<number, { child: any; bookingCount: number; franchiseNames: Set<string> }>();
    for (const row of bookingRows) {
      const slot = coachSlotMap.get(row.booking.slotId);
      const franchiseName = slot ? (franchiseMap.get(slot.franchiseId) || "") : "";
      const existing = childMap.get(row.child.id);
      if (existing) {
        existing.bookingCount++;
        if (franchiseName) existing.franchiseNames.add(franchiseName);
      } else {
        const names = new Set<string>();
        if (franchiseName) names.add(franchiseName);
        childMap.set(row.child.id, { child: row.child, bookingCount: 1, franchiseNames: names });
      }
    }

    return Array.from(childMap.values()).map(({ child, bookingCount, franchiseNames }) => ({
      ...child,
      bookingCount,
      franchiseNames: Array.from(franchiseNames),
    }));
  }

  async getCoachSlots(coachId: number, year: number, month: number): Promise<any[]> {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endMonth = month === 12 ? 1 : month + 1;
    const endYear = month === 12 ? year + 1 : year;
    const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

    const slots = await db.select({
      slot: timeSlots,
      franchise: franchises,
    })
      .from(timeSlots)
      .leftJoin(franchises, eq(timeSlots.franchiseId, franchises.id))
      .where(
        and(
          eq(timeSlots.coachId, coachId),
          gte(timeSlots.date, startDate),
          sql`${timeSlots.date} < ${endDate}`
        )
      )
      .orderBy(timeSlots.date, timeSlots.startTime);

    return slots.map(s => ({
      ...s.slot,
      franchiseName: s.franchise?.name,
    }));
  }

  async getTimeSlot(id: number): Promise<any | undefined> {
    const [slot] = await db.select().from(timeSlots).where(eq(timeSlots.id, id));
    return slot;
  }

  async getSlotStudents(slotId: number): Promise<any[]> {
    const results = await db.select({
      booking: bookings,
      child: children,
    })
      .from(bookings)
      .innerJoin(children, eq(bookings.childId, children.id))
      .where(
        and(
          eq(bookings.slotId, slotId),
          inArray(bookings.status, ["confirmed", "checked_in", "absent", "completed"])
        )
      );

    return results.map(r => ({
      bookingId: r.booking.id,
      childId: r.child.id,
      childName: r.child.name,
      childGrade: r.child.grade,
      childGender: r.child.gender,
      childSchool: r.child.school,
      childStudentCode: r.child.studentCode,
      parentId: r.booking.parentId,
      status: r.booking.status,
    }));
  }

  async checkInBooking(id: number, coachId: number): Promise<void> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    if (!booking) throw new Error("預約不存在");
    if (!["confirmed", "completed"].includes(booking.status)) throw new Error("此預約狀態無法點名");
    const [slot] = await db.select().from(timeSlots).where(eq(timeSlots.id, booking.slotId));
    if (!slot || slot.coachId !== coachId) throw new Error("此預約不屬於您的時段");

    const now = new Date();
    const slotStart = new Date(`${slot.date}T${slot.startTime}:00+08:00`);
    const earliestCheckIn = new Date(slotStart.getTime() - 15 * 60 * 1000);

    if (now < earliestCheckIn) {
      const startTimeStr = slot.startTime;
      throw new Error(`尚未到點名時間，請於 ${startTimeStr} 前 15 分鐘再進行點名`);
    }

    await db.update(bookings).set({ status: "checked_in" }).where(eq(bookings.id, id));
  }

  async markAbsentBooking(id: number, coachId: number): Promise<void> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    if (!booking) throw new Error("預約不存在");
    if (!["confirmed", "completed"].includes(booking.status)) throw new Error("此預約狀態無法標記未到");
    const [slot] = await db.select().from(timeSlots).where(eq(timeSlots.id, booking.slotId));
    if (!slot || slot.coachId !== coachId) throw new Error("此預約不屬於您的時段");

    const now = new Date();
    const slotStart = new Date(`${slot.date}T${slot.startTime}:00+08:00`);
    const earliestCheckIn = new Date(slotStart.getTime() - 15 * 60 * 1000);

    if (now < earliestCheckIn) {
      const startTimeStr = slot.startTime;
      throw new Error(`尚未到點名時間，請於 ${startTimeStr} 前 15 分鐘再進行點名`);
    }

    await db.update(bookings).set({ status: "absent" }).where(eq(bookings.id, id));
  }

  async uncheckInBooking(id: number, coachId: number): Promise<void> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    if (!booking) throw new Error("預約不存在");
    if (booking.status !== "checked_in" && booking.status !== "absent") throw new Error("只有已點名或已標記未到的預約可以取消");
    const [slot] = await db.select().from(timeSlots).where(eq(timeSlots.id, booking.slotId));
    if (!slot || slot.coachId !== coachId) throw new Error("此預約不屬於您的時段");

    await db.update(bookings).set({ status: "confirmed" }).where(eq(bookings.id, id));
  }

  async getCoachDailyRecord(coachId: number, date: string): Promise<any> {
    const coachSlots = await db.select().from(timeSlots)
      .where(and(eq(timeSlots.coachId, coachId), eq(timeSlots.date, date)));

    if (coachSlots.length === 0) {
      return { totalSlots: 0, checkedInSlots: 0, contactBookSlots: 0, isComplete: true, date };
    }

    const slotIds = coachSlots.map(s => s.id);
    const slotBookings = await db.select().from(bookings)
      .where(and(inArray(bookings.slotId, slotIds), sql`${bookings.status} != 'cancelled'`));

    const bookingIds = slotBookings.map(b => b.id);
    const contactBookRecords = bookingIds.length > 0
      ? await db.select().from(contactBooks)
          .where(and(eq(contactBooks.coachId, coachId), inArray(contactBooks.bookingId, bookingIds)))
      : [];

    let checkedInSlots = 0;
    let contactBookSlots = 0;

    for (const slot of coachSlots) {
      const slotBks = slotBookings.filter(b => b.slotId === slot.id);
      if (slotBks.length === 0) {
        checkedInSlots++;
        contactBookSlots++;
        continue;
      }

      const allCheckedIn = slotBks.every(b => b.status === "checked_in" || b.status === "completed" || b.status === "absent");
      if (allCheckedIn) checkedInSlots++;

      const presentBks = slotBks.filter(b => b.status !== "absent");
      const slotBookingIds = presentBks.map(b => b.id);
      const slotCBs = contactBookRecords.filter(cb => slotBookingIds.includes(cb.bookingId!));
      const presentChildIds = presentBks.map(b => b.childId);
      const allHaveContactBook = presentChildIds.length === 0 || presentChildIds.every(childId =>
        slotCBs.some(cb => cb.childId === childId)
      );
      if (allHaveContactBook) contactBookSlots++;
    }

    const totalSlots = coachSlots.length;
    const isComplete = checkedInSlots === totalSlots && contactBookSlots === totalSlots;

    const [existing] = await db.select().from(coachDailyRecords)
      .where(and(eq(coachDailyRecords.coachId, coachId), eq(coachDailyRecords.date, date)));

    return {
      id: existing?.id,
      totalSlots,
      checkedInSlots,
      contactBookSlots,
      isComplete,
      date,
      completedAt: existing?.completedAt,
    };
  }

  async updateCoachDailyRecord(coachId: number, date: string): Promise<CoachDailyRecord> {
    const record = await this.getCoachDailyRecord(coachId, date);

    const [existing] = await db.select().from(coachDailyRecords)
      .where(and(eq(coachDailyRecords.coachId, coachId), eq(coachDailyRecords.date, date)));

    const data = {
      totalSlots: record.totalSlots,
      checkedInSlots: record.checkedInSlots,
      contactBookSlots: record.contactBookSlots,
      isComplete: record.isComplete,
      completedAt: record.isComplete && !existing?.completedAt ? new Date() : existing?.completedAt || null,
    };

    if (existing) {
      const [updated] = await db.update(coachDailyRecords)
        .set(data)
        .where(eq(coachDailyRecords.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(coachDailyRecords)
        .values({ coachId, date, ...data })
        .returning();
      return created;
    }
  }

  async getCoachMonthlyRecords(coachId: number, year: number, month: number): Promise<CoachDailyRecord[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endMonth = month === 12 ? 1 : month + 1;
    const endYear = month === 12 ? year + 1 : year;
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

    return db.select().from(coachDailyRecords)
      .where(and(
        eq(coachDailyRecords.coachId, coachId),
        gte(coachDailyRecords.date, startDate),
        sql`${coachDailyRecords.date} < ${endDate}`,
      ))
      .orderBy(coachDailyRecords.date);
  }

  async createContactBook(data: InsertContactBook): Promise<ContactBook> {
    const [created] = await db.insert(contactBooks).values(data).returning();
    return created;
  }

  async getContactBook(id: number): Promise<ContactBook | undefined> {
    const [book] = await db.select().from(contactBooks).where(eq(contactBooks.id, id));
    return book;
  }

  async updateContactBook(id: number, data: Partial<InsertContactBook>): Promise<ContactBook> {
    const [updated] = await db.update(contactBooks).set(data).where(eq(contactBooks.id, id)).returning();
    return updated;
  }

  async getContactBooksBySlot(slotId: number, coachId: number): Promise<any[]> {
    const slotBookings = await db.select().from(bookings).where(
      and(eq(bookings.slotId, slotId), sql`${bookings.status} != 'cancelled'`)
    );
    const bookingIds = slotBookings.map(b => b.id);
    if (bookingIds.length === 0) return [];

    const results = await db.select({
      contactBook: contactBooks,
      child: children,
    })
      .from(contactBooks)
      .innerJoin(children, eq(contactBooks.childId, children.id))
      .where(
        and(
          eq(contactBooks.coachId, coachId),
          inArray(contactBooks.bookingId, bookingIds)
        )
      );

    return results.map(r => ({
      ...r.contactBook,
      childName: r.child.name,
      childGrade: r.child.grade,
      childGender: r.child.gender,
    }));
  }

  async getContactBooksByChild(childId: number): Promise<any[]> {
    const results = await db.select({
      contactBook: contactBooks,
      coach: coaches,
    })
      .from(contactBooks)
      .innerJoin(coaches, eq(contactBooks.coachId, coaches.id))
      .where(eq(contactBooks.childId, childId))
      .orderBy(desc(contactBooks.createdAt));

    return results.map(r => {
      const { internalNotes, ...safeBook } = r.contactBook;
      return {
        ...safeBook,
        coachName: r.coach.name,
      };
    });
  }

  async getContactBooksByParent(parentId: string): Promise<any[]> {
    const parentChildren = await db.select().from(children).where(eq(children.parentId, parentId));
    if (parentChildren.length === 0) return [];

    const childIds = parentChildren.map(c => c.id);
    const results = await db.select({
      contactBook: contactBooks,
      coach: coaches,
      child: children,
    })
      .from(contactBooks)
      .innerJoin(coaches, eq(contactBooks.coachId, coaches.id))
      .innerJoin(children, eq(contactBooks.childId, children.id))
      .where(inArray(contactBooks.childId, childIds))
      .orderBy(desc(contactBooks.createdAt));

    return results.map(r => {
      const { internalNotes, ...safeBook } = r.contactBook;
      return {
        ...safeBook,
        coachName: r.coach.name,
        childName: r.child.name,
        childGrade: r.child.grade,
        childGender: r.child.gender,
      };
    });
  }

  async getCoachStudents(coachId: number): Promise<any[]> {
    const coachSlots = await db.select({ id: timeSlots.id }).from(timeSlots).where(eq(timeSlots.coachId, coachId));
    if (coachSlots.length === 0) return [];

    const slotIds = coachSlots.map(s => s.id);
    const results = await db.select({
      child: children,
      bookingCount: sql<number>`count(${bookings.id})::int`,
    })
      .from(bookings)
      .innerJoin(children, eq(bookings.childId, children.id))
      .where(
        and(
          inArray(bookings.slotId, slotIds),
          inArray(bookings.status, ["confirmed", "checked_in", "absent", "completed"])
        )
      )
      .groupBy(children.id);

    return results.map(r => ({
      ...r.child,
      bookingCount: r.bookingCount,
    }));
  }

  async getStudentContactBookHistory(coachId: number, childId: number): Promise<any[]> {
    return db.select()
      .from(contactBooks)
      .where(
        and(
          eq(contactBooks.coachId, coachId),
          eq(contactBooks.childId, childId)
        )
      )
      .orderBy(desc(contactBooks.createdAt));
  }

  async getStudentContactBookHistoryByCoachIds(coachIds: number[], childId: number): Promise<any[]> {
    if (coachIds.length === 0) return [];
    return db.select()
      .from(contactBooks)
      .where(
        and(
          inArray(contactBooks.coachId, coachIds),
          eq(contactBooks.childId, childId)
        )
      )
      .orderBy(desc(contactBooks.createdAt));
  }

  async getCoachDailyRecordByCoachIds(coachIds: number[], date: string): Promise<any> {
    if (coachIds.length === 0) return { totalSlots: 0, checkedInSlots: 0, contactBookSlots: 0, isComplete: true, date };
    const perCoach = await Promise.all(coachIds.map(id => this.getCoachDailyRecord(id, date)));
    const totalSlots = perCoach.reduce((s, r) => s + r.totalSlots, 0);
    const checkedInSlots = perCoach.reduce((s, r) => s + r.checkedInSlots, 0);
    const contactBookSlots = perCoach.reduce((s, r) => s + r.contactBookSlots, 0);
    const isComplete = totalSlots > 0 && checkedInSlots === totalSlots && contactBookSlots === totalSlots;
    return { totalSlots, checkedInSlots, contactBookSlots, isComplete, date };
  }

  async getCoachMonthlyRecordsByCoachIds(coachIds: number[], year: number, month: number): Promise<any[]> {
    if (coachIds.length === 0) return [];
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endMonth = month === 12 ? 1 : month + 1;
    const endYear = month === 12 ? year + 1 : year;
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
    const allRecords = await db.select().from(coachDailyRecords)
      .where(and(
        inArray(coachDailyRecords.coachId, coachIds),
        gte(coachDailyRecords.date, startDate),
        sql`${coachDailyRecords.date} < ${endDate}`,
      ));
    const byDate = new Map<string, any>();
    for (const r of allRecords) {
      const existing = byDate.get(r.date);
      if (!existing) {
        byDate.set(r.date, { ...r });
      } else {
        existing.totalSlots += r.totalSlots;
        existing.checkedInSlots += r.checkedInSlots;
        existing.contactBookSlots += r.contactBookSlots;
        existing.isComplete = existing.totalSlots > 0 && existing.checkedInSlots === existing.totalSlots && existing.contactBookSlots === existing.totalSlots;
      }
    }
    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getFavoriteFranchises(userId: string): Promise<number[]> {
    const results = await db
      .select({ franchiseId: favoriteFranchises.franchiseId })
      .from(favoriteFranchises)
      .where(eq(favoriteFranchises.userId, userId));
    return results.map(r => r.franchiseId);
  }

  async addFavoriteFranchise(userId: string, franchiseId: number): Promise<FavoriteFranchise> {
    const existing = await db
      .select()
      .from(favoriteFranchises)
      .where(and(eq(favoriteFranchises.userId, userId), eq(favoriteFranchises.franchiseId, franchiseId)));
    if (existing.length > 0) return existing[0];
    const [created] = await db.insert(favoriteFranchises).values({ userId, franchiseId }).returning();
    return created;
  }

  async removeFavoriteFranchise(userId: string, franchiseId: number): Promise<void> {
    await db.delete(favoriteFranchises).where(
      and(eq(favoriteFranchises.userId, userId), eq(favoriteFranchises.franchiseId, franchiseId))
    );
  }

  async getAllFranchiseAnalytics(): Promise<any[]> {
    const allFranchises = await db.select().from(franchises).orderBy(franchises.id);
    const allSlots = await db.select().from(timeSlots);
    const allBookingsData = await db.select().from(bookings);
    const allCoachesData = await db.select().from(coaches);
    const allChildrenData = await db.select().from(children);
    const allFranchiseStudents = await db.select().from(franchiseStudents);

    const slotsByFranchise = new Map<number, typeof allSlots>();
    for (const slot of allSlots) {
      const arr = slotsByFranchise.get(slot.franchiseId) || [];
      arr.push(slot);
      slotsByFranchise.set(slot.franchiseId, arr);
    }

    const bookingsBySlot = new Map<number, typeof allBookingsData>();
    for (const booking of allBookingsData) {
      const arr = bookingsBySlot.get(booking.slotId) || [];
      arr.push(booking);
      bookingsBySlot.set(booking.slotId, arr);
    }

    const today = new Date().toISOString().split("T")[0];
    const thisMonth = today.substring(0, 7);

    return allFranchises.map(f => {
      const fSlots = slotsByFranchise.get(f.id) || [];
      const fCoaches = allCoachesData.filter(c => c.franchiseId === f.id);
      const fSlotIds = new Set(fSlots.map(s => s.id));
      const fBookings = allBookingsData.filter(b => fSlotIds.has(b.slotId));
      const confirmedBookings = fBookings.filter(b => b.status === "confirmed").length;
      const cancelledBookings = fBookings.filter(b => b.status === "cancelled").length;
      const totalSeats = fSlots.reduce((s, sl) => s + sl.maxSeats, 0);
      const bookedSeats = fSlots.reduce((s, sl) => s + sl.bookedSeats, 0);
      const occupancyRate = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;

      const uniqueChildIds = new Set(fBookings.map(b => b.childId));
      const uniqueParentIds = new Set(fBookings.map(b => b.parentId));

      const thisMonthBookings = fBookings.filter(b => {
        const slot = fSlots.find(s => s.id === b.slotId);
        return slot && slot.date.startsWith(thisMonth);
      }).length;

      const newStudents = allFranchiseStudents.filter(fs => {
        if (fs.franchiseId !== f.id) return false;
        if (!fs.createdAt) return false;
        return new Date(fs.createdAt).toISOString().substring(0, 7) === thisMonth;
      }).length;

      return {
        franchiseId: f.id,
        franchiseName: f.name,
        city: f.city,
        district: f.district,
        isActive: f.isActive,
        totalCoaches: fCoaches.length,
        certifiedCoaches: fCoaches.filter(c => c.isCertified).length,
        totalSlots: fSlots.length,
        totalBookings: fBookings.length,
        confirmedBookings,
        cancelledBookings,
        thisMonthBookings,
        newStudents,
        totalSeats,
        bookedSeats,
        occupancyRate,
        uniqueStudents: uniqueChildIds.size,
        uniqueParents: uniqueParentIds.size,
        rating: f.rating,
        reviewCount: f.reviewCount,
      };
    });
  }

  async getSlotBookings(slotId: number): Promise<any[]> {
    const rows = await db
      .select({
        id: bookings.id,
        slotId: bookings.slotId,
        childId: bookings.childId,
        parentId: bookings.parentId,
        status: bookings.status,
        childName: children.name,
        childGrade: children.grade,
        childSchool: children.school,
      })
      .from(bookings)
      .leftJoin(children, eq(bookings.childId, children.id))
      .where(and(eq(bookings.slotId, slotId), inArray(bookings.status, ["confirmed", "checked_in"])));
    return rows;
  }

  async getSlotStudentList(slotId: number): Promise<any[]> {
    const rows = await db
      .select({
        id: bookings.id,
        slotId: bookings.slotId,
        childId: bookings.childId,
        parentId: bookings.parentId,
        status: bookings.status,
        childName: children.name,
        childGrade: children.grade,
        childSchool: children.school,
      })
      .from(bookings)
      .leftJoin(children, eq(bookings.childId, children.id))
      .where(eq(bookings.slotId, slotId));
    return rows;
  }

  async cancelSlotBookingsAndNotify(slotId: number): Promise<void> {
    const slot = await db.select().from(timeSlots).where(eq(timeSlots.id, slotId)).then(r => r[0]);
    if (!slot) return;

    const activeBookings = await this.getSlotBookings(slotId);
    if (activeBookings.length === 0) return;

    const franchise = await db.select({ name: franchises.name }).from(franchises).where(eq(franchises.id, slot.franchiseId)).then(r => r[0]);
    const franchiseName = franchise?.name || "教室";

    for (const b of activeBookings) {
      await db.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, b.id));

      if (b.parentId) {
        try {
          await this.refundCredits(b.parentId, b.id, `教室取消課程退回 1 堂（${slot.date} ${slot.startTime}）`);
        } catch (refundErr) {
          console.error("Refund failed for booking", b.id, refundErr);
        }

        await db.insert(notifications).values({
          userId: b.parentId,
          type: "slot_cancelled",
          title: "課程已取消",
          message: `您的孩子 ${b.childName} 在 ${slot.date} ${slot.startTime}-${slot.endTime}（${franchiseName}）的課程已被教室取消，已退回 1 堂。`,
          isRead: false,
        });
      }
    }
  }

  async createNotification(data: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(data).returning();
    return created;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return Number(result[0]?.count || 0);
  }
  async getCreditPackages(): Promise<CreditPackage[]> {
    return db.select().from(creditPackages).orderBy(creditPackages.sortOrder, creditPackages.id);
  }

  async getActiveCreditPackages(): Promise<CreditPackage[]> {
    return db.select().from(creditPackages).where(eq(creditPackages.isActive, true)).orderBy(creditPackages.sortOrder, creditPackages.id);
  }

  async createCreditPackage(data: InsertCreditPackage): Promise<CreditPackage> {
    const [created] = await db.insert(creditPackages).values(data).returning();
    return created;
  }

  async updateCreditPackage(id: number, data: Partial<InsertCreditPackage>): Promise<CreditPackage> {
    const [updated] = await db.update(creditPackages).set(data).where(eq(creditPackages.id, id)).returning();
    return updated;
  }

  async getPromotions(): Promise<Promotion[]> {
    return db.select().from(promotions).orderBy(desc(promotions.createdAt));
  }

  async getActivePromotions(): Promise<Promotion[]> {
    const today = new Date().toISOString().split("T")[0];
    return db.select().from(promotions).where(
      and(eq(promotions.isActive, true), lte(promotions.startDate, today), gte(promotions.endDate, today))
    ).orderBy(desc(promotions.createdAt));
  }

  async createPromotion(data: InsertPromotion): Promise<Promotion> {
    const [created] = await db.insert(promotions).values(data).returning();
    return created;
  }

  async updatePromotion(id: number, data: Partial<InsertPromotion>): Promise<Promotion> {
    const [updated] = await db.update(promotions).set(data).where(eq(promotions.id, id)).returning();
    return updated;
  }

  async getCouponCodes(): Promise<CouponCode[]> {
    return db.select().from(couponCodes).orderBy(desc(couponCodes.createdAt));
  }

  async getCouponByCode(code: string): Promise<CouponCode | undefined> {
    const [coupon] = await db.select().from(couponCodes).where(eq(couponCodes.code, code));
    return coupon;
  }

  async createCouponCode(data: InsertCouponCode): Promise<CouponCode> {
    const [created] = await db.insert(couponCodes).values(data).returning();
    return created;
  }

  async updateCouponCode(id: number, data: Partial<InsertCouponCode>): Promise<CouponCode> {
    const [updated] = await db.update(couponCodes).set(data).where(eq(couponCodes.id, id)).returning();
    return updated;
  }

  async incrementCouponUsage(id: number): Promise<void> {
    await db.update(couponCodes).set({ currentUses: sql`${couponCodes.currentUses} + 1` }).where(eq(couponCodes.id, id));
  }

  async createCreditPurchase(data: InsertCreditPurchase): Promise<CreditPurchase> {
    const [created] = await db.insert(creditPurchases).values(data).returning();
    return created;
  }

  async updatePurchaseStatus(id: number, status: string): Promise<CreditPurchase> {
    const [updated] = await db.update(creditPurchases).set({ paymentStatus: status }).where(eq(creditPurchases.id, id)).returning();
    return updated;
  }

  async updatePurchaseStatusAndTradeNo(id: number, status: string, ecpayTradeNo: string): Promise<CreditPurchase> {
    const [updated] = await db.update(creditPurchases).set({ paymentStatus: status, ecpayTradeNo }).where(eq(creditPurchases.id, id)).returning();
    return updated;
  }

  async getCreditPurchaseByTradeNo(ecpayTradeNo: string): Promise<CreditPurchase | undefined> {
    const [purchase] = await db.select().from(creditPurchases).where(eq(creditPurchases.ecpayTradeNo, ecpayTradeNo));
    return purchase;
  }

  async atomicMarkPurchasePaid(ecpayTradeNo: string): Promise<CreditPurchase | null> {
    const result = await db.update(creditPurchases)
      .set({ paymentStatus: "paid" })
      .where(and(eq(creditPurchases.ecpayTradeNo, ecpayTradeNo), eq(creditPurchases.paymentStatus, "pending")))
      .returning();
    return result[0] ?? null;
  }

  async atomicMarkPaidAndAddCredits(ecpayTradeNo: string, expiresAt: Date | null): Promise<CreditPurchase | null> {
    return db.transaction(async (tx) => {
      const [purchase] = await tx.update(creditPurchases)
        .set({ paymentStatus: "paid" })
        .where(and(eq(creditPurchases.ecpayTradeNo, ecpayTradeNo), eq(creditPurchases.paymentStatus, "pending")))
        .returning();
      if (!purchase) return null;
      const [balance] = await tx.insert(creditBalances).values({
        parentId: purchase.parentId,
        purchaseId: purchase.id,
        originalCredits: purchase.credits,
        remainingCredits: purchase.credits,
        expiresAt,
      }).returning();
      await tx.insert(creditTransactions).values({
        parentId: purchase.parentId,
        type: "purchase",
        credits: purchase.credits,
        balanceId: balance.id,
        purchaseId: purchase.id,
        description: "線上付款購買堂數",
      });
      return purchase;
    });
  }

  async getPurchasesByParent(parentId: string): Promise<CreditPurchase[]> {
    return db.select().from(creditPurchases).where(eq(creditPurchases.parentId, parentId)).orderBy(desc(creditPurchases.createdAt));
  }

  async getParentBalance(parentId: string): Promise<number> {
    const now = new Date();
    const [result] = await db.select({ total: sql<number>`COALESCE(SUM(${creditBalances.remainingCredits}), 0)` })
      .from(creditBalances)
      .where(and(
        eq(creditBalances.parentId, parentId),
        gt(creditBalances.remainingCredits, 0),
        sql`(${creditBalances.expiresAt} IS NULL OR ${creditBalances.expiresAt} > ${now})`
      ));
    return Number(result.total);
  }

  async getCreditBalances(parentId: string): Promise<CreditBalance[]> {
    const now = new Date();
    return db.select().from(creditBalances)
      .where(and(
        eq(creditBalances.parentId, parentId),
        gt(creditBalances.remainingCredits, 0),
        sql`(${creditBalances.expiresAt} IS NULL OR ${creditBalances.expiresAt} > ${now})`
      ))
      .orderBy(asc(creditBalances.expiresAt), asc(creditBalances.id));
  }

  async deductCredits(parentId: string, amount: number, bookingId?: number, description?: string): Promise<CreditTransaction> {
    const now = new Date();
    const balances = await db.select().from(creditBalances)
      .where(and(
        eq(creditBalances.parentId, parentId),
        gt(creditBalances.remainingCredits, 0),
        sql`(${creditBalances.expiresAt} IS NULL OR ${creditBalances.expiresAt} > ${now})`
      ))
      .orderBy(asc(creditBalances.expiresAt), asc(creditBalances.id));

    let remaining = amount;
    let lastBalanceId: number | null = null;

    for (const bal of balances) {
      if (remaining <= 0) break;
      const deduct = Math.min(remaining, bal.remainingCredits);
      await db.update(creditBalances)
        .set({ remainingCredits: bal.remainingCredits - deduct })
        .where(eq(creditBalances.id, bal.id));
      remaining -= deduct;
      lastBalanceId = bal.id;
    }

    if (remaining > 0) {
      throw new Error("點數餘額不足");
    }

    const [tx] = await db.insert(creditTransactions).values({
      parentId,
      type: "deduct",
      credits: -amount,
      balanceId: lastBalanceId,
      bookingId: bookingId || null,
      description: description || "預約扣除堂數",
    }).returning();
    return tx;
  }

  async refundCredits(parentId: string, bookingId: number, description?: string): Promise<CreditTransaction | null> {
    const [deductTx] = await db.select().from(creditTransactions)
      .where(and(
        eq(creditTransactions.parentId, parentId),
        eq(creditTransactions.bookingId, bookingId),
        eq(creditTransactions.type, "deduct"),
      ))
      .orderBy(desc(creditTransactions.createdAt))
      .limit(1);

    if (!deductTx) return null;

    const refundAmount = Math.abs(deductTx.credits);

    if (deductTx.balanceId) {
      const [bal] = await db.select().from(creditBalances).where(eq(creditBalances.id, deductTx.balanceId));
      if (bal) {
        await db.update(creditBalances)
          .set({ remainingCredits: bal.remainingCredits + refundAmount })
          .where(eq(creditBalances.id, bal.id));
      }
    }

    const [tx] = await db.insert(creditTransactions).values({
      parentId,
      type: "refund",
      credits: refundAmount,
      balanceId: deductTx.balanceId,
      bookingId,
      description: description || "取消預約退回堂數",
    }).returning();
    return tx;
  }

  async addCredits(parentId: string, purchaseId: number, credits: number, expiresAt: Date | null): Promise<CreditBalance> {
    const [balance] = await db.insert(creditBalances).values({
      parentId,
      purchaseId,
      originalCredits: credits,
      remainingCredits: credits,
      expiresAt,
    }).returning();
    return balance;
  }

  async createCreditTransaction(data: InsertCreditTransaction): Promise<CreditTransaction> {
    const [created] = await db.insert(creditTransactions).values(data).returning();
    return created;
  }

  async getTransactionsByParent(parentId: string): Promise<CreditTransaction[]> {
    return db.select().from(creditTransactions)
      .where(eq(creditTransactions.parentId, parentId))
      .orderBy(desc(creditTransactions.createdAt));
  }

  async getCoachEarningsStats(coachId: number, startDate: string, endDate: string): Promise<any> {
    const coach = await db.select().from(coaches).where(eq(coaches.id, coachId)).then(r => r[0]);
    if (!coach) throw new Error("找不到老師資料");

    const compensationType = coach.compensationType ?? "fixed";
    const compensationAmount = coach.compensationAmount ?? 200;

    const deductRows = await db.execute(sql`
      SELECT ct.id, ct.credits, ct.booking_id, ct.created_at,
             ts.date, ts.start_time, ts.end_time,
             cp.original_amount as purchase_original, cp.discount_amount as purchase_discount,
             cp.final_amount as purchase_final, cp.credits as purchase_credits
      FROM credit_transactions ct
      JOIN bookings b ON ct.booking_id = b.id
      JOIN time_slots ts ON b.slot_id = ts.id
      LEFT JOIN credit_balances cb ON ct.balance_id = cb.id
      LEFT JOIN credit_purchases cp ON cb.purchase_id = cp.id
      WHERE ct.type = 'deduct'
        AND ts.coach_id = ${coachId}
        AND ts.date >= ${startDate}
        AND ts.date <= ${endDate}
    `);

    const refundRows = await db.execute(sql`
      SELECT ct.booking_id
      FROM credit_transactions ct
      JOIN bookings b ON ct.booking_id = b.id
      JOIN time_slots ts ON b.slot_id = ts.id
      WHERE ct.type = 'refund'
        AND ts.coach_id = ${coachId}
        AND ts.date >= ${startDate}
        AND ts.date <= ${endDate}
    `);

    const refundedBookingIds = new Set(refundRows.rows.map((r: any) => r.booking_id));
    const netDeductions = deductRows.rows.filter((r: any) => !refundedBookingIds.has(r.booking_id));

    let totalLessons = 0;
    let totalNetRevenue = 0;
    const dailyMap: Record<string, { lessons: number; revenue: number; earnings: number }> = {};
    const countedSlots = new Set<string>();

    for (const row of netDeductions as any[]) {
      const lessons = Math.abs(row.credits);
      const perCreditRevenue = row.purchase_credits && row.purchase_final
        ? row.purchase_final / row.purchase_credits
        : 0;
      const revenue = lessons * perCreditRevenue;

      totalLessons += lessons;
      totalNetRevenue += revenue;

      const date = row.date;
      if (!dailyMap[date]) dailyMap[date] = { lessons: 0, revenue: 0, earnings: 0 };
      dailyMap[date].lessons += lessons;
      dailyMap[date].revenue += revenue;

      let earning = 0;
      if (compensationType === "fixed") {
        earning = compensationAmount * lessons;
      } else if (compensationType === "hourly") {
        const slotKey = `${date}_${row.start_time}_${row.end_time}`;
        if (!countedSlots.has(slotKey)) {
          countedSlots.add(slotKey);
          const startParts = (row.start_time || "").split(":");
          const endParts = (row.end_time || "").split(":");
          const startMin = (parseInt(startParts[0]) || 0) * 60 + (parseInt(startParts[1]) || 0);
          const endMin = (parseInt(endParts[0]) || 0) * 60 + (parseInt(endParts[1]) || 0);
          const hours = Math.max(0, (endMin - startMin) / 60);
          earning = compensationAmount * hours;
        }
      } else {
        earning = revenue * compensationAmount / 100;
      }
      dailyMap[date].earnings += earning;
    }

    let coachEarnings = 0;
    for (const stats of Object.values(dailyMap)) {
      coachEarnings += stats.earnings;
    }

    const dailyStats = Object.entries(dailyMap)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const monthStart = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const monthEnd = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${new Date(currentYear, currentMonth, 0).getDate()}`;

    const projectionRows = await db.execute(sql`
      SELECT COUNT(*) as upcoming_bookings
      FROM bookings b
      JOIN time_slots ts ON b.slot_id = ts.id
      WHERE ts.coach_id = ${coachId}
        AND ts.date >= ${monthStart}
        AND ts.date <= ${monthEnd}
        AND b.status IN ('confirmed', 'checked_in', 'completed')
    `);
    const upcomingBookings = Number((projectionRows.rows[0] as any)?.upcoming_bookings || 0);

    const avgRevenuePerLesson = totalLessons > 0 ? totalNetRevenue / totalLessons : 0;
    let projectedEarnings = 0;
    if (compensationType === "fixed") {
      projectedEarnings = compensationAmount * upcomingBookings;
    } else if (compensationType === "hourly") {
      const upcomingHoursRows = await db.execute(sql`
        SELECT DISTINCT ts.id, ts.start_time, ts.end_time
        FROM time_slots ts
        JOIN bookings b ON b.slot_id = ts.id
        WHERE ts.coach_id = ${coachId}
          AND ts.date >= ${monthStart}
          AND ts.date <= ${monthEnd}
          AND b.status IN ('confirmed', 'checked_in', 'completed')
      `);
      let totalUpcomingHours = 0;
      for (const slot of upcomingHoursRows.rows as any[]) {
        const sp = (slot.start_time || "").split(":");
        const ep = (slot.end_time || "").split(":");
        const sm = (parseInt(sp[0]) || 0) * 60 + (parseInt(sp[1]) || 0);
        const em = (parseInt(ep[0]) || 0) * 60 + (parseInt(ep[1]) || 0);
        totalUpcomingHours += Math.max(0, (em - sm) / 60);
      }
      projectedEarnings = compensationAmount * totalUpcomingHours;
    } else {
      projectedEarnings = avgRevenuePerLesson * upcomingBookings * compensationAmount / 100;
    }

    return {
      compensationType,
      compensationAmount,
      totalLessons,
      totalNetRevenue: Math.round(totalNetRevenue),
      coachEarnings: Math.round(coachEarnings),
      dailyStats,
      monthlyProjection: {
        totalSlots: upcomingBookings,
        projectedEarnings: Math.round(projectedEarnings),
        month: `${currentYear}-${String(currentMonth).padStart(2, '0')}`,
      },
    };
  }

  async getCoachEarningsStatsByCoachIds(coachIds: number[], startDate: string, endDate: string): Promise<any> {
    if (coachIds.length === 0) {
      return {
        compensationType: "fixed",
        compensationAmount: 0,
        totalLessons: 0,
        totalNetRevenue: 0,
        coachEarnings: 0,
        dailyStats: [],
        monthlyProjection: { totalSlots: 0, projectedEarnings: 0, month: "" },
        perCoach: [],
      };
    }
    const perCoach = [];
    let totalLessons = 0;
    let totalNetRevenue = 0;
    let totalEarnings = 0;
    const mergedDailyMap: Record<string, { lessons: number; revenue: number; earnings: number }> = {};
    let primaryCompensationType = "fixed";
    let primaryCompensationAmount = 0;
    let mergedProjectionSlots = 0;
    let mergedProjectedEarnings = 0;
    let mergedProjectionMonth = "";

    for (const coachId of coachIds) {
      const coach = await db.select().from(coaches).where(eq(coaches.id, coachId)).then(r => r[0]);
      if (!coach) continue;
      const franchise = coach.franchiseId ? await db.select().from(franchises).where(eq(franchises.id, coach.franchiseId)).then(r => r[0]) : null;
      let stats: any;
      try {
        stats = await this.getCoachEarningsStats(coachId, startDate, endDate);
      } catch (err) {
        console.error(`Failed to fetch earnings for coachId ${coachId}:`, err);
        continue;
      }
      totalLessons += stats.totalLessons;
      totalNetRevenue += stats.totalNetRevenue;
      totalEarnings += stats.coachEarnings;
      primaryCompensationType = stats.compensationType;
      primaryCompensationAmount = stats.compensationAmount;
      mergedProjectionSlots += stats.monthlyProjection?.totalSlots || 0;
      mergedProjectedEarnings += stats.monthlyProjection?.projectedEarnings || 0;
      mergedProjectionMonth = stats.monthlyProjection?.month || "";
      for (const day of stats.dailyStats || []) {
        if (!mergedDailyMap[day.date]) {
          mergedDailyMap[day.date] = { lessons: 0, revenue: 0, earnings: 0 };
        }
        mergedDailyMap[day.date].lessons += day.lessons;
        mergedDailyMap[day.date].revenue += day.revenue;
        mergedDailyMap[day.date].earnings += day.earnings;
      }
      perCoach.push({ coachId, franchiseName: franchise?.name || null, ...stats });
    }

    const dailyStats = Object.entries(mergedDailyMap)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      compensationType: primaryCompensationType,
      compensationAmount: primaryCompensationAmount,
      totalLessons,
      totalNetRevenue: Math.round(totalNetRevenue),
      coachEarnings: Math.round(totalEarnings),
      dailyStats,
      monthlyProjection: {
        totalSlots: mergedProjectionSlots,
        projectedEarnings: Math.round(mergedProjectedEarnings),
        month: mergedProjectionMonth,
      },
      perCoach,
    };
  }

  async getFranchiseCoachEarnings(franchiseId: number, startDate: string, endDate: string): Promise<any> {
    const franchiseCoaches = await db.select().from(coaches)
      .where(eq(coaches.franchiseId, franchiseId));

    let totalLessons = 0;
    let totalNetRevenue = 0;
    let totalCoachPay = 0;
    const coachStats = [];

    for (const coach of franchiseCoaches) {
      try {
        const stats = await this.getCoachEarningsStats(coach.id, startDate, endDate);
        totalLessons += stats.totalLessons;
        totalNetRevenue += stats.totalNetRevenue;
        totalCoachPay += stats.coachEarnings;
        coachStats.push({
          coachId: coach.id,
          coachName: coach.name,
          compensationType: stats.compensationType,
          compensationAmount: stats.compensationAmount,
          totalLessons: stats.totalLessons,
          totalNetRevenue: stats.totalNetRevenue,
          coachEarnings: stats.coachEarnings,
        });
      } catch (e) {
      }
    }

    return {
      totalLessons,
      totalNetRevenue: Math.round(totalNetRevenue),
      totalCoachPay: Math.round(totalCoachPay),
      coachStats,
    };
  }

  async getTextbooks(): Promise<Textbook[]> {
    return db.select().from(textbooks).where(eq(textbooks.isActive, true)).orderBy(asc(textbooks.grade), asc(textbooks.sortOrder));
  }

  async getTextbooksByGrade(grade: number): Promise<Textbook[]> {
    return db.select().from(textbooks).where(and(eq(textbooks.grade, grade), eq(textbooks.isActive, true))).orderBy(asc(textbooks.sortOrder));
  }

  async getTextbooksWithQuizzes(): Promise<any[]> {
    const allTextbooks = await db.select().from(textbooks).where(eq(textbooks.isActive, true)).orderBy(asc(textbooks.grade), asc(textbooks.sortOrder));
    const allQuizzes = await db.select().from(textbookQuizzes).where(eq(textbookQuizzes.isActive, true)).orderBy(asc(textbookQuizzes.sortOrder));
    const quizMap = new Map<number, TextbookQuiz[]>();
    for (const q of allQuizzes) {
      if (!quizMap.has(q.textbookId)) quizMap.set(q.textbookId, []);
      quizMap.get(q.textbookId)!.push(q);
    }
    return allTextbooks.map(t => ({ ...t, quizzes: quizMap.get(t.id) || [] }));
  }

  async createTextbook(data: InsertTextbook): Promise<Textbook> {
    const [created] = await db.insert(textbooks).values(data).returning();
    return created;
  }

  async updateTextbook(id: number, data: Partial<InsertTextbook>): Promise<Textbook> {
    const [updated] = await db.update(textbooks).set(data).where(eq(textbooks.id, id)).returning();
    return updated;
  }

  async deleteTextbook(id: number): Promise<void> {
    const filesToDelete = await db.select().from(textbookFiles).where(eq(textbookFiles.textbookId, id));
    for (const f of filesToDelete) {
      try {
        const fullPath = path.join(process.cwd(), "uploads", "curriculum", path.basename(f.storedPath));
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      } catch { }
    }
    await db.delete(textbookFiles).where(eq(textbookFiles.textbookId, id));
    await db.update(textbooks).set({ isActive: false }).where(eq(textbooks.id, id));
  }

  async getQuizzesByTextbook(textbookId: number): Promise<TextbookQuiz[]> {
    return db.select().from(textbookQuizzes).where(and(eq(textbookQuizzes.textbookId, textbookId), eq(textbookQuizzes.isActive, true))).orderBy(asc(textbookQuizzes.sortOrder));
  }

  async createQuiz(data: InsertTextbookQuiz): Promise<TextbookQuiz> {
    const [created] = await db.insert(textbookQuizzes).values(data).returning();
    return created;
  }

  async updateQuiz(id: number, data: Partial<InsertTextbookQuiz>): Promise<TextbookQuiz> {
    const [updated] = await db.update(textbookQuizzes).set(data).where(eq(textbookQuizzes.id, id)).returning();
    return updated;
  }

  async deleteQuiz(id: number): Promise<void> {
    await db.update(textbookQuizzes).set({ isActive: false }).where(eq(textbookQuizzes.id, id));
  }

  async getTextbooksWithFiles(): Promise<any[]> {
    const allTextbooks = await db.select().from(textbooks).where(eq(textbooks.isActive, true)).orderBy(asc(textbooks.grade), asc(textbooks.sortOrder));
    const allFiles = await db.select().from(textbookFiles).orderBy(asc(textbookFiles.fileType));
    const allQuizzes = await db.select().from(textbookQuizzes).where(eq(textbookQuizzes.isActive, true)).orderBy(asc(textbookQuizzes.sortOrder));
    return allTextbooks.map(t => ({
      ...t,
      files: allFiles.filter(f => f.textbookId === t.id).map(({ storedPath: _sp, uploadedBy: _ub, ...safe }) => safe),
      quizzes: allQuizzes.filter(q => q.textbookId === t.id),
    }));
  }

  async getTextbookFile(textbookId: number, fileType: string): Promise<TextbookFile | undefined> {
    const [file] = await db.select().from(textbookFiles).where(and(eq(textbookFiles.textbookId, textbookId), eq(textbookFiles.fileType, fileType)));
    return file;
  }

  async upsertTextbookFile(data: InsertTextbookFile): Promise<TextbookFile> {
    const [file] = await db.insert(textbookFiles)
      .values(data)
      .onConflictDoUpdate({
        target: [textbookFiles.textbookId, textbookFiles.fileType],
        set: {
          originalName: data.originalName,
          storedPath: data.storedPath,
          uploadedBy: data.uploadedBy ?? null,
          updatedAt: new Date(),
        },
      })
      .returning();
    if (!file) throw new Error("DB upsert returned no record");
    return file;
  }

  async deleteTextbookFile(textbookId: number, fileType: string): Promise<void> {
    await db.delete(textbookFiles).where(and(eq(textbookFiles.textbookId, textbookId), eq(textbookFiles.fileType, fileType)));
  }

  async getTextbookFiles(textbookId: number): Promise<TextbookFile[]> {
    return db.select().from(textbookFiles).where(eq(textbookFiles.textbookId, textbookId)).orderBy(asc(textbookFiles.fileType));
  }

  async getCurriculumUnitsWithFiles(): Promise<any[]> {
    const units = await db.select().from(curriculumUnits).where(eq(curriculumUnits.isActive, true)).orderBy(asc(curriculumUnits.sortOrder), asc(curriculumUnits.id));
    const files = await db.select().from(curriculumFiles).orderBy(asc(curriculumFiles.fileType));
    return units.map(u => ({ ...u, files: files.filter(f => f.unitId === u.id) }));
  }

  async getCurriculumUnit(id: number): Promise<CurriculumUnit | undefined> {
    const [unit] = await db.select().from(curriculumUnits).where(eq(curriculumUnits.id, id));
    return unit;
  }

  async createCurriculumUnit(data: InsertCurriculumUnit): Promise<CurriculumUnit> {
    const [unit] = await db.insert(curriculumUnits).values(data).returning();
    return unit;
  }

  async updateCurriculumUnit(id: number, data: Partial<InsertCurriculumUnit>): Promise<CurriculumUnit> {
    const [unit] = await db.update(curriculumUnits).set(data).where(eq(curriculumUnits.id, id)).returning();
    return unit;
  }

  async deleteCurriculumUnit(id: number): Promise<void> {
    await db.delete(curriculumFiles).where(eq(curriculumFiles.unitId, id));
    await db.delete(curriculumUnits).where(eq(curriculumUnits.id, id));
  }

  async getCurriculumFile(unitId: number, fileType: string): Promise<CurriculumFile | undefined> {
    const [file] = await db.select().from(curriculumFiles).where(and(eq(curriculumFiles.unitId, unitId), eq(curriculumFiles.fileType, fileType)));
    return file;
  }

  async upsertCurriculumFile(data: InsertCurriculumFile): Promise<CurriculumFile> {
    const existing = await this.getCurriculumFile(data.unitId, data.fileType);
    if (existing) {
      const [file] = await db.update(curriculumFiles).set({ ...data, updatedAt: new Date() }).where(eq(curriculumFiles.id, existing.id)).returning();
      return file;
    }
    const [file] = await db.insert(curriculumFiles).values(data).returning();
    return file;
  }

  async deleteCurriculumFile(unitId: number, fileType: string): Promise<void> {
    await db.delete(curriculumFiles).where(and(eq(curriculumFiles.unitId, unitId), eq(curriculumFiles.fileType, fileType)));
  }

  async getCurriculumMidtermExams(): Promise<CurriculumMidtermExam[]> {
    return db.select().from(curriculumMidtermExams).orderBy(desc(curriculumMidtermExams.createdAt));
  }

  async getCurriculumMidtermExam(id: number): Promise<CurriculumMidtermExam | undefined> {
    const [exam] = await db.select().from(curriculumMidtermExams).where(eq(curriculumMidtermExams.id, id));
    return exam;
  }

  async createCurriculumMidtermExam(data: InsertCurriculumMidtermExam): Promise<CurriculumMidtermExam> {
    const [exam] = await db.insert(curriculumMidtermExams).values(data).returning();
    return exam;
  }

  async deleteCurriculumMidtermExam(id: number): Promise<void> {
    await db.delete(curriculumMidtermExams).where(eq(curriculumMidtermExams.id, id));
  }
}

export const storage = new DatabaseStorage();

(async () => {
  try {
    const allChildren = await db.select().from(children);

    const withDash = allChildren.filter((c) => c.studentCode && c.studentCode.includes("-"));
    for (const child of withDash) {
      const newCode = child.studentCode!.replace(/-/g, "");
      await db.update(children).set({ studentCode: newCode }).where(eq(children.id, child.id));
    }
    if (withDash.length > 0) {
      console.log(`Migrated ${withDash.length} student codes to remove dashes`);
    }

    const needCode = allChildren.filter((c) => !c.studentCode);
    for (const child of needCode) {
      const dateStr = child.createdAt
        ? new Date(child.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" }).replace(/-/g, "")
        : new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" }).replace(/-/g, "");
      const prefix = dateStr;
      const existing = await db.select({ studentCode: children.studentCode })
        .from(children)
        .where(sql`${children.studentCode} LIKE ${prefix + '%'} AND length(${children.studentCode}) = 12`);
      const maxSeq = existing.reduce((max, row) => {
        if (!row.studentCode || row.studentCode.length !== 12) return max;
        const seq = parseInt(row.studentCode.substring(8), 10);
        return seq > max ? seq : max;
      }, 0);
      const nextSeq = (maxSeq + 1).toString().padStart(4, "0");
      const code = `${prefix}${nextSeq}`;
      await db.update(children).set({ studentCode: code }).where(eq(children.id, child.id));
    }
    if (needCode.length > 0) {
      console.log(`Backfilled student codes for ${needCode.length} children`);
    }
  } catch (e) {
    console.error("Failed to backfill student codes:", e);
  }
})();
