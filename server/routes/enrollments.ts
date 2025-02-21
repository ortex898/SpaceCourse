
import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { storage } from "../storage";
import { AuthRequest } from "../middleware/auth";
import { insertEnrollmentSchema } from "@shared/schema";
import { ZodError } from "zod";

const router = Router();

// POST /api/enrollments - Enroll in a course 
router.post("/", async (req: AuthRequest, res) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ message: "Only students can enroll in courses" });
    }

    const data = insertEnrollmentSchema.parse({
      ...req.body,
      userId: req.user.id,
    });

    // Check for existing enrollment
    const existingEnrollment = await storage.db.query.enrollments.findFirst({
      where: and(
        eq(storage.schema.enrollments.userId, req.user.id),
        eq(storage.schema.enrollments.courseId, data.courseId)
      ),
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    const enrollment = await storage.db.insert(storage.schema.enrollments)
      .values(data)
      .returning();

    res.status(201).json(enrollment[0]);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: error.message });
    }
    throw error;
  }
});

// GET /api/enrollments/my-courses - Get authenticated user's enrolled courses
router.get("/my-courses", async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const enrolledCourses = await storage.db.query.enrollments.findMany({
      where: eq(storage.schema.enrollments.userId, req.user.id),
      with: {
        course: true,
      },
    });

    res.json(enrolledCourses.map(enrollment => enrollment.course));
  } catch (error) {
    throw error;
  }
});

export default router;
