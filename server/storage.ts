import {
  franchises, coaches, children, timeSlots, bookings, faqs, successStories, announcements,
  products, cartItems, orders, orderItems, siteContent, contactBooks, favoriteFranchises,
  coachDailyRecords, classrooms,
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
  type User,
  type SiteContent,
  type ContactBook, type InsertContactBook,
  type FavoriteFranchise,
  type CoachDailyRecord,
  type Classroom, type InsertClassroom,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, inArray, gte, lte } from "drizzle-orm";

export interface IStorage {
  getCoaches(): Promise<Coach[]>;
  getAllCoaches(): Promise<Coach[]>;
  getCoach(id: number): Promise<Coach | undefined>;
  getCoachesByFranchise(franchiseId: number): Promise<Coach[]>;
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
  getStudentContactBookHistory(coachId: number, childId: number): Promise<any[]>;

  getAllSiteContent(): Promise<SiteContent[]>;
  getSiteContent(sectionKey: string): Promise<SiteContent | undefined>;
  upsertSiteContent(sectionKey: string, value: string): Promise<SiteContent>;
  promoteAllGrades(): Promise<number>;

  getFavoriteFranchises(userId: string): Promise<number[]>;
  addFavoriteFranchise(userId: string, franchiseId: number): Promise<FavoriteFranchise>;
  removeFavoriteFranchise(userId: string, franchiseId: number): Promise<void>;

  getCoachScheduleAcrossFranchises(coachId: number): Promise<any[]>;
  getOverlappingSlots(franchiseId: number, date: string, startTime: string, endTime: string, excludeSlotId?: number): Promise<TimeSlot[]>;
  getCoachOverlappingSlots(coachId: number, date: string, startTime: string, endTime: string, excludeSlotId?: number): Promise<any[]>;

  getClassroomOverlappingSlots(classroomId: number, date: string, startTime: string, endTime: string, excludeSlotId?: number): Promise<TimeSlot[]>;
  getSlotsByClassroom(classroomId: number): Promise<TimeSlot[]>;
  getClassroomsByFranchise(franchiseId: number): Promise<Classroom[]>;
  createClassroom(data: InsertClassroom): Promise<Classroom>;
  updateClassroom(id: number, data: Partial<InsertClassroom>): Promise<Classroom>;
  deleteClassroom(id: number): Promise<void>;

  getFranchiseStudents(franchiseId: number): Promise<any[]>;
  createManualBooking(slotId: number, childId: number, franchiseId: number): Promise<any>;

  getAllFranchiseAnalytics(): Promise<any[]>;

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
    const rows = await db
      .selectDistinctOn([children.id], {
        id: children.id,
        name: children.name,
        grade: children.grade,
        school: children.school,
        parentId: children.parentId,
      })
      .from(bookings)
      .innerJoin(timeSlots, eq(bookings.slotId, timeSlots.id))
      .innerJoin(children, eq(bookings.childId, children.id))
      .where(eq(timeSlots.franchiseId, franchiseId))
      .orderBy(children.id, children.name);
    return rows;
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
    if (franchiseBookings.length === 0) throw new Error("此學生非本分校學生，無法加排");

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

    await db
      .update(timeSlots)
      .set({ bookedSeats: slot.bookedSeats + 1 })
      .where(eq(timeSlots.id, booking.slotId));

    const [created] = await db.insert(bookings).values(booking).returning();
    return created;
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

    const expiredSlots = await db.select({ id: timeSlots.id })
      .from(timeSlots)
      .where(sql`${timeSlots.date} < ${todayStr}`);

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
    const [coachCount] = await db.select({ count: sql<number>`count(*)` }).from(coaches);
    const [franchiseCount] = await db.select({ count: sql<number>`count(*)` }).from(franchises);
    const [bookingCount] = await db.select({ count: sql<number>`count(*)` }).from(bookings);

    return {
      totalStudents: Number(studentCount.count),
      totalCoaches: Number(coachCount.count),
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
    const [coachCount] = await db.select({ count: sql<number>`count(*)` }).from(coaches).where(eq(coaches.franchiseId, franchiseId));
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
          inArray(bookings.status, ["confirmed", "checked_in"])
        )
      );

    return results.map(r => ({
      bookingId: r.booking.id,
      childId: r.child.id,
      childName: r.child.name,
      childGrade: r.child.grade,
      childGender: r.child.gender,
      childStudentCode: r.child.studentCode,
      parentId: r.booking.parentId,
      status: r.booking.status,
    }));
  }

  async checkInBooking(id: number, coachId: number): Promise<void> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    if (!booking) throw new Error("預約不存在");
    if (booking.status !== "confirmed") throw new Error("只有已確認的預約可以點名");
    const [slot] = await db.select().from(timeSlots).where(eq(timeSlots.id, booking.slotId));
    if (!slot || slot.coachId !== coachId) throw new Error("此預約不屬於您的時段");

    const now = new Date();
    const slotStart = new Date(`${slot.date}T${slot.startTime}:00+08:00`);
    const slotEnd = new Date(`${slot.date}T${slot.endTime}:00+08:00`);
    const earliestCheckIn = new Date(slotStart.getTime() - 15 * 60 * 1000);

    if (now < earliestCheckIn) {
      const startTimeStr = slot.startTime;
      throw new Error(`尚未到點名時間，請於 ${startTimeStr} 前 15 分鐘再進行點名`);
    }
    if (now > slotEnd) {
      throw new Error("課程已結束，無法點名");
    }

    await db.update(bookings).set({ status: "checked_in" }).where(eq(bookings.id, id));
  }

  async uncheckInBooking(id: number, coachId: number): Promise<void> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    if (!booking) throw new Error("預約不存在");
    if (booking.status !== "checked_in") throw new Error("只有已點名的預約可以取消點名");
    const [slot] = await db.select().from(timeSlots).where(eq(timeSlots.id, booking.slotId));
    if (!slot || slot.coachId !== coachId) throw new Error("此預約不屬於您的時段");

    const now = new Date();
    const slotEnd = new Date(`${slot.date}T${slot.endTime}:00+08:00`);
    if (now > slotEnd) {
      throw new Error("課程已結束，無法取消點名");
    }

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

    const contactBookRecords = await db.select().from(contactBooks)
      .where(and(eq(contactBooks.coachId, coachId), inArray(contactBooks.slotId, slotIds)));

    let checkedInSlots = 0;
    let contactBookSlots = 0;

    for (const slot of coachSlots) {
      const slotBks = slotBookings.filter(b => b.slotId === slot.id);
      if (slotBks.length === 0) {
        checkedInSlots++;
        contactBookSlots++;
        continue;
      }

      const allCheckedIn = slotBks.every(b => b.status === "checked_in" || b.status === "completed");
      if (allCheckedIn) checkedInSlots++;

      const studentIds = slotBks.map(b => b.childId);
      const slotCBs = contactBookRecords.filter(cb => cb.slotId === slot.id);
      const allHaveContactBook = studentIds.every(childId =>
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
      and(eq(bookings.slotId, slotId), eq(bookings.status, "confirmed"))
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
          eq(bookings.status, "confirmed")
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

      const upcomingSlots = fSlots.filter(s => s.date >= today && s.isActive).length;

      const thisMonth = today.substring(0, 7);
      const thisMonthBookings = fBookings.filter(b => {
        const slot = fSlots.find(s => s.id === b.slotId);
        return slot && slot.date.startsWith(thisMonth);
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
        upcomingSlots,
        totalBookings: fBookings.length,
        confirmedBookings,
        cancelledBookings,
        thisMonthBookings,
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
