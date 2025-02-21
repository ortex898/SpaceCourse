
import { Router } from "express";
import { eq } from "drizzle-orm";
import { storage } from "../storage";
import { AuthRequest } from "../middleware/auth";
import { insertLiveSessionSchema } from "@shared/schema";
import { ZodError } from "zod";

const router = Router();

// POST /api/live-sessions - Schedule a new session
router.post("/", async (req: AuthRequest, res) => {
  try {
    if (!req.user || req.user.role !== 'instructor') {
      return res.status(403).json({ message: "Only instructors can schedule sessions" });
    }

    const data = insertLiveSessionSchema.parse({
      ...req.body,
      zoomLink: "https://zoom.us/j/placeholder", // Placeholder for future Zoom integration
    });

    // Verify the course exists and instructor has access
    const course = await storage.getCourse(data.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (course.instructorId !== req.user.id) {
      return res.status(403).json({ message: "You can only schedule sessions for your own courses" });
    }

    const session = await storage.createLiveSession(data);
    res.status(201).json(session);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: error.message });
    }
    throw error;
  }
});

// GET /api/live-sessions - List sessions for a course
router.get("/", async (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.query.courseId as string);
    if (isNaN(courseId)) {
      return res.status(400).json({ message: "Valid courseId query parameter is required" });
    }

    const sessions = await storage.db.query.liveSessions.findMany({
      where: eq(storage.schema.liveSessions.courseId, courseId),
    });

    res.json(sessions);
  } catch (error) {
    throw error;
  }
});

// GET /api/live-sessions/:id - Get session details
router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    if (isNaN(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    const session = await storage.getLiveSession(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    throw error;
  }
});

export default router;
