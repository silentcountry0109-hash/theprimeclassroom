import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authStorage } from "./replit_integrations/auth/storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { seedDatabase } from "./seed";

const isAdmin: RequestHandler = async (req: any, res, next) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
  const userId = req.user.claims.sub;
  const user = await authStorage.getUser(userId);
  if (!user || user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  next();
};

const isFranchiseAdmin: RequestHandler = async (req: any, res, next) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
  const userId = req.user.claims.sub;
  const user = await authStorage.getUser(userId);
  if (!user || user.role !== "franchise_admin" || !user.franchiseId) return res.status(403).json({ message: "Forbidden" });
  req.franchiseId = user.franchiseId;
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  await seedDatabase();

  app.get("/api/coaches", async (_req, res) => {
    try {
      const coaches = await storage.getCoaches();
      res.json(coaches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coaches" });
    }
  });

  app.get("/api/franchises", async (_req, res) => {
    try {
      const franchises = await storage.getFranchises();
      res.json(franchises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch franchises" });
    }
  });

  app.get("/api/faqs", async (_req, res) => {
    try {
      const faqList = await storage.getFaqs();
      res.json(faqList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch FAQs" });
    }
  });

  app.get("/api/success-stories", async (_req, res) => {
    try {
      const stories = await storage.getSuccessStories();
      res.json(stories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  app.get("/api/search-slots", async (req, res) => {
    try {
      const city = req.query.city as string | undefined;
      const results = await storage.searchSlots(city);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to search slots" });
    }
  });

  app.get("/api/search-franchises", async (req, res) => {
    try {
      const city = req.query.city as string | undefined;
      const district = req.query.district as string | undefined;
      const days = req.query.days ? (req.query.days as string).split(",") : undefined;
      const periods = req.query.periods ? (req.query.periods as string).split(",") : undefined;
      const results = await storage.searchFranchises({ city, district, days, periods });
      res.json(results);
    } catch (error: any) {
      console.error("Search franchises error:", error);
      res.status(500).json({ message: "Failed to search franchises" });
    }
  });

  app.get("/api/franchises/:id/detail", async (req, res) => {
    try {
      const detail = await storage.getFranchiseDetail(parseInt(req.params.id));
      if (!detail) {
        return res.status(404).json({ message: "教室不存在" });
      }
      res.json(detail);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch franchise detail" });
    }
  });

  app.get("/api/children", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const kids = await storage.getChildrenByParent(userId);
      res.json(kids);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch children" });
    }
  });

  app.post("/api/children", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const child = await storage.createChild({
        ...req.body,
        parentId: userId,
      });
      res.json(child);
    } catch (error) {
      res.status(500).json({ message: "Failed to create child" });
    }
  });

  app.delete("/api/children/:id", isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteChild(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete child" });
    }
  });

  app.get("/api/bookings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userBookings = await storage.getBookingsByParent(userId);
      res.json(userBookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const booking = await storage.createBooking({
        slotId: req.body.slotId,
        childId: req.body.childId,
        parentId: userId,
      });
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id/cancel", isAuthenticated, async (req, res) => {
    try {
      await storage.cancelBooking(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to cancel booking" });
    }
  });

  app.get("/api/admin/stats", isAuthenticated, async (_req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/faqs", isAuthenticated, async (_req, res) => {
    try {
      const faqList = await storage.getAllFaqs();
      res.json(faqList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch FAQs" });
    }
  });

  app.post("/api/admin/faqs", isAuthenticated, async (req, res) => {
    try {
      const faq = await storage.createFaq({
        question: req.body.question,
        answer: req.body.answer,
        category: req.body.category,
        sortOrder: req.body.sortOrder || 0,
        isActive: true,
      });
      res.json(faq);
    } catch (error) {
      res.status(500).json({ message: "Failed to create FAQ" });
    }
  });

  app.delete("/api/admin/faqs/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteFaq(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete FAQ" });
    }
  });

  app.get("/api/admin/success-stories", isAuthenticated, async (_req, res) => {
    try {
      const stories = await storage.getAllSuccessStories();
      res.json(stories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  app.post("/api/admin/success-stories", isAuthenticated, async (req, res) => {
    try {
      const story = await storage.createSuccessStory({
        studentName: req.body.studentName,
        testimonial: req.body.testimonial,
        grade: req.body.grade || null,
        parentName: req.body.parentName || null,
        photoUrl: null,
        tags: req.body.tags || null,
        isActive: true,
      });
      res.json(story);
    } catch (error) {
      res.status(500).json({ message: "Failed to create story" });
    }
  });

  app.delete("/api/admin/success-stories/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteSuccessStory(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete story" });
    }
  });

  app.get("/api/admin/franchises", isAuthenticated, async (_req, res) => {
    try {
      const franchiseList = await storage.getAllFranchises();
      res.json(franchiseList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch franchises" });
    }
  });

  app.post("/api/admin/franchises", isAdmin, async (req, res) => {
    try {
      const franchise = await storage.createFranchise(req.body);
      res.json(franchise);
    } catch (error) {
      res.status(500).json({ message: "Failed to create franchise" });
    }
  });

  app.patch("/api/admin/franchises/:id", isAdmin, async (req, res) => {
    try {
      const franchise = await storage.updateFranchise(parseInt(req.params.id), req.body);
      res.json(franchise);
    } catch (error) {
      res.status(500).json({ message: "Failed to update franchise" });
    }
  });

  app.delete("/api/admin/franchises/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteFranchise(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete franchise" });
    }
  });

  app.get("/api/admin/coaches", isAuthenticated, async (_req, res) => {
    try {
      const coachList = await storage.getAllCoaches();
      res.json(coachList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coaches" });
    }
  });

  app.post("/api/admin/coaches", isAuthenticated, async (req, res) => {
    try {
      const coach = await storage.createCoach(req.body);
      res.json(coach);
    } catch (error) {
      res.status(500).json({ message: "Failed to create coach" });
    }
  });

  app.patch("/api/admin/coaches/:id", isAuthenticated, async (req, res) => {
    try {
      const coach = await storage.updateCoach(parseInt(req.params.id), req.body);
      res.json(coach);
    } catch (error) {
      res.status(500).json({ message: "Failed to update coach" });
    }
  });

  app.delete("/api/admin/coaches/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteCoach(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete coach" });
    }
  });

  app.get("/api/admin/franchises/:id/coaches", isAuthenticated, async (req, res) => {
    try {
      const coachList = await storage.getCoachesByFranchise(parseInt(req.params.id));
      res.json(coachList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coaches" });
    }
  });

  app.get("/api/admin/franchises/:id/slots", isAuthenticated, async (req, res) => {
    try {
      const slotList = await storage.getSlotsByFranchise(parseInt(req.params.id));
      res.json(slotList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch slots" });
    }
  });

  app.post("/api/admin/time-slots", isAuthenticated, async (req, res) => {
    try {
      const slot = await storage.createSlot(req.body);
      res.json(slot);
    } catch (error) {
      res.status(500).json({ message: "Failed to create time slot" });
    }
  });

  app.delete("/api/admin/time-slots/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteSlot(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete time slot" });
    }
  });

  app.get("/api/admin/announcements", isAuthenticated, async (_req, res) => {
    try {
      const announcementList = await storage.getAnnouncements();
      res.json(announcementList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post("/api/admin/announcements", isAuthenticated, async (req, res) => {
    try {
      const announcement = await storage.createAnnouncement({
        title: req.body.title,
        content: req.body.content,
        type: req.body.type || "info",
        isActive: true,
      });
      res.json(announcement);
    } catch (error) {
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.delete("/api/admin/announcements/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteAnnouncement(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  app.get("/api/admin/users", isAdmin, async (_req, res) => {
    try {
      const userList = await storage.getAllUsers();
      res.json(userList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id/role", isAdmin, async (req, res) => {
    try {
      const { role, franchiseId } = req.body;
      const user = await storage.updateUserRole(req.params.id, role, franchiseId || null);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.get("/api/franchise-admin/my-franchise", isFranchiseAdmin, async (req: any, res) => {
    try {
      const franchise = await storage.getFranchise(req.franchiseId);
      if (!franchise) return res.status(404).json({ message: "Franchise not found" });
      res.json(franchise);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch franchise" });
    }
  });

  app.patch("/api/franchise-admin/my-franchise", isFranchiseAdmin, async (req: any, res) => {
    try {
      const { description, phone, tags, nearbySchools } = req.body;
      const franchise = await storage.updateFranchise(req.franchiseId, { description, phone, tags, nearbySchools });
      res.json(franchise);
    } catch (error) {
      res.status(500).json({ message: "Failed to update franchise" });
    }
  });

  app.get("/api/franchise-admin/stats", isFranchiseAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getFranchiseStats(req.franchiseId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/franchise-admin/coaches", isFranchiseAdmin, async (req: any, res) => {
    try {
      const coachList = await storage.getCoachesByFranchise(req.franchiseId);
      res.json(coachList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coaches" });
    }
  });

  app.post("/api/franchise-admin/coaches", isFranchiseAdmin, async (req: any, res) => {
    try {
      const coach = await storage.createCoach({ ...req.body, franchiseId: req.franchiseId });
      res.json(coach);
    } catch (error) {
      res.status(500).json({ message: "Failed to create coach" });
    }
  });

  app.patch("/api/franchise-admin/coaches/:id", isFranchiseAdmin, async (req: any, res) => {
    try {
      const coach = await storage.getCoach(parseInt(req.params.id));
      if (!coach || coach.franchiseId !== req.franchiseId) return res.status(403).json({ message: "Forbidden" });
      const updated = await storage.updateCoach(parseInt(req.params.id), req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update coach" });
    }
  });

  app.delete("/api/franchise-admin/coaches/:id", isFranchiseAdmin, async (req: any, res) => {
    try {
      const coach = await storage.getCoach(parseInt(req.params.id));
      if (!coach || coach.franchiseId !== req.franchiseId) return res.status(403).json({ message: "Forbidden" });
      await storage.deleteCoach(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete coach" });
    }
  });

  app.get("/api/franchise-admin/time-slots", isFranchiseAdmin, async (req: any, res) => {
    try {
      const slotList = await storage.getSlotsByFranchise(req.franchiseId);
      res.json(slotList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch time slots" });
    }
  });

  app.post("/api/franchise-admin/time-slots", isFranchiseAdmin, async (req: any, res) => {
    try {
      const slot = await storage.createSlot({ ...req.body, franchiseId: req.franchiseId });
      res.json(slot);
    } catch (error) {
      res.status(500).json({ message: "Failed to create time slot" });
    }
  });

  app.delete("/api/franchise-admin/time-slots/:id", isFranchiseAdmin, async (req: any, res) => {
    try {
      const slotList = await storage.getSlotsByFranchise(req.franchiseId);
      const slot = slotList.find((s) => s.id === parseInt(req.params.id));
      if (!slot) return res.status(403).json({ message: "Forbidden" });
      await storage.deleteSlot(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete time slot" });
    }
  });

  app.get("/api/franchise-admin/bookings", isFranchiseAdmin, async (req: any, res) => {
    try {
      const bookingList = await storage.getBookingsByFranchise(req.franchiseId);
      res.json(bookingList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  return httpServer;
}
