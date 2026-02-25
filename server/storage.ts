import {
  franchises, coaches, children, timeSlots, bookings, faqs, successStories, announcements,
  products, cartItems, orders, orderItems, siteContent,
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
  deleteChild(id: number): Promise<void>;

  searchSlots(city?: string, grade?: string): Promise<any[]>;
  getSlotsByFranchise(franchiseId: number): Promise<TimeSlot[]>;
  getSlot(id: number): Promise<TimeSlot | undefined>;
  findSlot(franchiseId: number, coachId: number | null, date: string, startTime: string, endTime: string): Promise<TimeSlot | undefined>;
  createSlot(slot: InsertTimeSlot): Promise<TimeSlot>;
  deleteSlot(id: number): Promise<void>;

  getBookingsByParent(parentId: string): Promise<any[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  hasExistingBooking(slotId: number, childId: number): Promise<boolean>;
  cancelBooking(id: number): Promise<void>;

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
  }>;
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

  getAllSiteContent(): Promise<SiteContent[]>;
  getSiteContent(sectionKey: string): Promise<SiteContent | undefined>;
  upsertSiteContent(sectionKey: string, value: string): Promise<SiteContent>;

  getFranchiseStatsByDateRange(franchiseId: number, startDate: string, endDate: string): Promise<{
    totalSlots: number;
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    totalSeats: number;
    bookedSeats: number;
    occupancyRate: number;
    dailyStats: Array<{ date: string; slots: number; bookings: number; bookedSeats: number; totalSeats: number }>;
    coachStats: Array<{ coachId: number; coachName: string; slots: number; bookings: number; bookedSeats: number }>;
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

  async createChild(child: InsertChild): Promise<Child> {
    const [created] = await db.insert(children).values(child).returning();
    return created;
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
          eq(bookings.status, "confirmed")
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
    if (franchiseSlots.length > 0) {
      const slotIds = franchiseSlots.map((s) => s.id);
      const [allBookings] = await db.select({ count: sql<number>`count(*)` }).from(bookings).where(inArray(bookings.slotId, slotIds));
      const [confirmed] = await db.select({ count: sql<number>`count(*)` }).from(bookings).where(and(inArray(bookings.slotId, slotIds), eq(bookings.status, "confirmed")));
      totalBookings = Number(allBookings.count);
      confirmedBookings = Number(confirmed.count);
    }

    return {
      totalCoaches: Number(coachCount.count),
      totalSlots: Number(slotCount.count),
      totalBookings,
      confirmedBookings,
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
    const coachMap = new Map<number, { coachId: number; coachName: string; slots: number; bookings: number; bookedSeats: number }>();
    for (const c of franchiseCoaches) {
      coachMap.set(c.id, { coachId: c.id, coachName: c.name, slots: 0, bookings: 0, bookedSeats: 0 });
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
        coachMap.get(slot.coachId)!.bookings++;
      }
    }
    const coachStats = Array.from(coachMap.values());

    return { totalSlots, totalBookings, confirmedBookings, cancelledBookings, totalSeats, bookedSeats, occupancyRate, dailyStats, coachStats };
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
}

export const storage = new DatabaseStorage();
