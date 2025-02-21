import { pgTable, text, serial, integer, decimal, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull().unique(),
  password: varchar("password").notNull(),
  role: varchar("role", { enum: ['student', 'instructor', 'admin', 'super-admin'] }).notNull().default("student"),
});

export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  enrollments: many(enrollments),
}));

// Courses table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  instructorId: integer("instructor_id").references(() => users.id),
  price: decimal("price").notNull(),
});

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  enrollments: many(enrollments),
  liveSessions: many(liveSessions),
  content: many(content),
}));

// Enrollments table
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  courseId: integer("course_id").references(() => courses.id),
});

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

// Live Sessions table
export const liveSessions = pgTable("live_sessions", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id),
  date: timestamp("date").notNull(),
  zoomLink: varchar("zoom_link").notNull(),
});

export const liveSessionsRelations = relations(liveSessions, ({ one }) => ({
  course: one(courses, {
    fields: [liveSessions.courseId],
    references: [courses.id],
  }),
}));

// Content table
export const content = pgTable("content", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id),
  type: varchar("type").notNull(),
  url: varchar("url").notNull(),
});

export const contentRelations = relations(content, ({ one }) => ({
  course: one(courses, {
    fields: [content.courseId],
    references: [courses.id],
  }),
}));

// Export schemas for insertion
export const insertUserSchema = createInsertSchema(users);
export const insertCourseSchema = createInsertSchema(courses);
export const insertEnrollmentSchema = createInsertSchema(enrollments);
export const insertLiveSessionSchema = createInsertSchema(liveSessions);
export const insertContentSchema = createInsertSchema(content);

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type LiveSession = typeof liveSessions.$inferSelect;
export type InsertLiveSession = z.infer<typeof insertLiveSessionSchema>;
export type Content = typeof content.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;