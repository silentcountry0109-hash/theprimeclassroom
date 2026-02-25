import {
  franchises, coaches, children, timeSlots, bookings, faqs, successStories, announcements,
  type Franchise, type InsertFranchise,
  type Coach, type InsertCoach,
  type Child, type InsertChild,
  type TimeSlot, type InsertTimeSlot,
  type Booking, type InsertBooking,
  type Faq, type InsertFaq,
  type SuccessStory, type InsertSuccessStory,
  type Announcement, type InsertAnnouncement,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, inArray } from "drizzle-orm";

export interface IStorage {
  getCoaches(): Promise<Coach[]>;
  getCoach(id: number): Promise<Coach | undefined>;
  createCoach(coach: InsertCoach): Promise<Coach>;

  getFranchises(): Promise<Franchise[]>;
  getFranchise(id: number): Promise<Franchise | undefined>;
  createFranchise(franchise: InsertFranchise): Promise<Franchise>;

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
  createSlot(slot: InsertTimeSlot): Promise<TimeSlot>;

  getBookingsByParent(parentId: string): Promise<any[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  cancelBooking(id: number): Promise<void>;

  getFaqs(): Promise<Faq[]>;
  getAllFaqs(): Promise<Faq[]>;
  createFaq(faq: InsertFaq): Promise<Faq>;
  deleteFaq(id: number): Promise<void>;

  getSuccessStories(): Promise<SuccessStory[]>;
  getAllSuccessStories(): Promise<SuccessStory[]>;
  createSuccessStory(story: InsertSuccessStory): Promise<SuccessStory>;
  deleteSuccessStory(id: number): Promise<void>;

  getAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<void>;

  getAdminStats(): Promise<{
    totalStudents: number;
    totalCoaches: number;
    totalFranchises: number;
    totalBookings: number;
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

  async getCoach(id: number): Promise<Coach | undefined> {
    const [coach] = await db.select().from(coaches).where(eq(coaches.id, id));
    return coach;
  }

  async createCoach(coach: InsertCoach): Promise<Coach> {
    const [created] = await db.insert(coaches).values(coach).returning();
    return created;
  }

  async getFranchises(): Promise<Franchise[]> {
    return db.select().from(franchises).where(eq(franchises.isActive, true));
  }

  async getFranchise(id: number): Promise<Franchise | undefined> {
    const [franchise] = await db.select().from(franchises).where(eq(franchises.id, id));
    return franchise;
  }

  async createFranchise(franchise: InsertFranchise): Promise<Franchise> {
    const [created] = await db.insert(franchises).values(franchise).returning();
    return created;
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

  async createSlot(slot: InsertTimeSlot): Promise<TimeSlot> {
    const [created] = await db.insert(timeSlots).values(slot).returning();
    return created;
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

    await db
      .update(timeSlots)
      .set({ bookedSeats: slot.bookedSeats + 1 })
      .where(eq(timeSlots.id, booking.slotId));

    const [created] = await db.insert(bookings).values(booking).returning();
    return created;
  }

  async cancelBooking(id: number): Promise<void> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    if (!booking) throw new Error("預約不存在");

    await db
      .update(bookings)
      .set({ status: "cancelled" })
      .where(eq(bookings.id, id));

    await db
      .update(timeSlots)
      .set({ bookedSeats: sql`${timeSlots.bookedSeats} - 1` })
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
}

export const storage = new DatabaseStorage();
