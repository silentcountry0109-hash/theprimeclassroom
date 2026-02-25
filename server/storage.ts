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
import { eq, and, sql, desc } from "drizzle-orm";

export interface IStorage {
  getCoaches(): Promise<Coach[]>;
  getCoach(id: number): Promise<Coach | undefined>;
  createCoach(coach: InsertCoach): Promise<Coach>;

  getFranchises(): Promise<Franchise[]>;
  getFranchise(id: number): Promise<Franchise | undefined>;
  createFranchise(franchise: InsertFranchise): Promise<Franchise>;

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
    const conditions = [eq(timeSlots.isActive, true)];

    let query;
    if (city) {
      query = db
        .select({
          slot: timeSlots,
          franchise: franchises,
          coach: coaches,
        })
        .from(timeSlots)
        .innerJoin(franchises, eq(timeSlots.franchiseId, franchises.id))
        .leftJoin(coaches, eq(timeSlots.coachId, coaches.id))
        .where(
          and(
            eq(timeSlots.isActive, true),
            eq(franchises.isActive, true),
            eq(franchises.city, city),
            sql`${timeSlots.bookedSeats} < ${timeSlots.maxSeats}`
          )
        );
    } else {
      query = db
        .select({
          slot: timeSlots,
          franchise: franchises,
          coach: coaches,
        })
        .from(timeSlots)
        .innerJoin(franchises, eq(timeSlots.franchiseId, franchises.id))
        .leftJoin(coaches, eq(timeSlots.coachId, coaches.id))
        .where(
          and(
            eq(timeSlots.isActive, true),
            eq(franchises.isActive, true),
            sql`${timeSlots.bookedSeats} < ${timeSlots.maxSeats}`
          )
        );
    }

    return query;
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
