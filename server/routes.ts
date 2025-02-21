import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCourseSchema, insertEnrollmentSchema } from "@shared/schema";
import { ZodError } from "zod";
import { generateToken, authMiddleware, adminAuthMiddleware, type AuthRequest } from "./middleware/auth";
import { z } from "zod";
import { eq, like, and, or, not } from "drizzle-orm";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const updateUserSchema = insertUserSchema.partial().omit({ password: true });
const updateCourseSchema = insertCourseSchema.partial();

const courseSearchSchema = z.object({
  title: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  instructorId: z.number().optional(),
});

import enrollmentsRouter from "./routes/enrollments";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mount enrollments routes
  app.use("/api/enrollments", authMiddleware, enrollmentsRouter);
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);

      // Ensure only student or instructor roles are allowed during registration
      if (data.role !== 'student' && data.role !== 'instructor') {
        return res.status(400).json({ message: "Invalid role. Must be either 'student' or 'instructor'" });
      }

      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser(data);
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res.status(201).json({ token, user: { ...user, password: undefined } });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.verifyUserCredentials(data.email, data.password);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res.json({ token, user: { ...user, password: undefined } });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  });

  // Course Management Routes
  app.get("/api/courses", async (req, res) => {
    try {
      const filters = courseSearchSchema.parse(req.query);
      const courses = await storage.searchCourses(filters);
      res.json(courses);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    const courseId = parseInt(req.params.id);
    const course = await storage.getCourse(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  });

  app.post("/api/courses", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.user || req.user.role !== 'instructor') {
        return res.status(403).json({ message: "Only instructors can create courses" });
      }

      const data = insertCourseSchema.parse({
        ...req.body,
        instructorId: req.user.id,
      });

      const course = await storage.createCourse(data);
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  });

  app.put("/api/courses/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (!req.user || (req.user.role !== 'instructor' || course.instructorId !== req.user.id)) {
        return res.status(403).json({ message: "Only the course instructor can update this course" });
      }

      const data = updateCourseSchema.parse(req.body);
      const updatedCourse = await storage.updateCourse(courseId, data);
      res.json(updatedCourse);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  });

  app.delete("/api/courses/:id", authMiddleware, async (req: AuthRequest, res) => {
    const courseId = parseInt(req.params.id);
    const course = await storage.getCourse(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!req.user || (req.user.role !== 'instructor' || course.instructorId !== req.user.id)) {
      return res.status(403).json({ message: "Only the course instructor can delete this course" });
    }

    const success = await storage.deleteCourse(courseId);
    if (success) {
      res.status(204).send();
    } else {
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Enrollment Management Routes
  app.post("/api/enrollments", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.user || req.user.role !== 'student') {
        return res.status(403).json({ message: "Only students can enroll in courses" });
      }

      const data = insertEnrollmentSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      // Check if course exists
      const course = await storage.getCourse(data.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check for existing enrollment
      const existingEnrollment = await storage.getEnrollmentByUserAndCourse(
        req.user.id,
        data.courseId
      );

      if (existingEnrollment) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }

      const enrollment = await storage.createEnrollment(data);
      res.status(201).json(enrollment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  });

  app.get("/api/enrollments/my-courses", authMiddleware, async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const enrolledCourses = await storage.getEnrolledCourses(req.user.id);
    res.json(enrolledCourses);
  });

  // User Management Routes (Admin Only)
  app.get("/api/users", adminAuthMiddleware, async (_req, res) => {
    const users = await storage.getAllUsers();
    res.json(users.map(user => ({ ...user, password: undefined })));
  });

  app.put("/api/users/:id", adminAuthMiddleware, async (req, res) => {
    try {
      const data = updateUserSchema.parse(req.body);
      const userId = parseInt(req.params.id);

      const user = await storage.updateUser(userId, data);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ ...user, password: undefined });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  });

  app.delete("/api/users/:id", adminAuthMiddleware, async (req, res) => {
    const userId = parseInt(req.params.id);
    const success = await storage.deleteUser(userId);

    if (!success) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(204).send();
  });

  const httpServer = createServer(app);
  return httpServer;
}