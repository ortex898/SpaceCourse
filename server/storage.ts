import { 
  users, type User, type InsertUser,
  courses, type Course, type InsertCourse,
  enrollments, type Enrollment, type InsertEnrollment,
  liveSessions, type LiveSession, type InsertLiveSession,
  content, type Content, type InsertContent
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, gte, lte } from "drizzle-orm";
import bcrypt from "bcryptjs";

type CourseFilters = {
  title?: string;
  minPrice?: number;
  maxPrice?: number;
  instructorId?: number;
};

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<Omit<InsertUser, "password">>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  verifyUserCredentials(email: string, password: string): Promise<User | null>;

  // Course operations
  getCourse(id: number): Promise<Course | undefined>;
  getAllCourses(): Promise<Course[]>;
  searchCourses(filters: CourseFilters): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, data: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;

  // Enrollment operations
  getEnrollment(id: number): Promise<Enrollment | undefined>;
  getAllEnrollments(): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  getEnrollmentByUserAndCourse(userId: number, courseId: number): Promise<Enrollment | undefined>;
  getEnrolledCourses(userId: number): Promise<Course[]>;

  // Live Session operations
  getLiveSession(id: number): Promise<LiveSession | undefined>;
  getAllLiveSessions(): Promise<LiveSession[]>;
  createLiveSession(session: InsertLiveSession): Promise<LiveSession>;

  // Content operations
  getContent(id: number): Promise<Content | undefined>;
  getAllContent(): Promise<Content[]>;
  createContent(contentData: InsertContent): Promise<Content>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async updateUser(
    id: number,
    data: Partial<Omit<InsertUser, "password">>,
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<boolean> {
    const [user] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return !!user;
  }

  async verifyUserCredentials(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Course operations
  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async searchCourses(filters: CourseFilters): Promise<Course[]> {
    let conditions = [];

    if (filters.title) {
      conditions.push(like(courses.title, `%${filters.title}%`));
    }

    if (filters.minPrice !== undefined) {
      conditions.push(gte(courses.price, filters.minPrice));
    }

    if (filters.maxPrice !== undefined) {
      conditions.push(lte(courses.price, filters.maxPrice));
    }

    if (filters.instructorId !== undefined) {
      conditions.push(eq(courses.instructorId, filters.instructorId));
    }

    const query = conditions.length > 0
      ? db.select().from(courses).where(and(...conditions))
      : db.select().from(courses);

    return await query;
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db.insert(courses).values(insertCourse).returning();
    return course;
  }

  async updateCourse(
    id: number,
    data: Partial<InsertCourse>,
  ): Promise<Course | undefined> {
    const [course] = await db
      .update(courses)
      .set(data)
      .where(eq(courses.id, id))
      .returning();
    return course;
  }

  async deleteCourse(id: number): Promise<boolean> {
    const [course] = await db
      .delete(courses)
      .where(eq(courses.id, id))
      .returning();
    return !!course;
  }

  // Enrollment operations
  async getEnrollment(id: number): Promise<Enrollment | undefined> {
    const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, id));
    return enrollment;
  }

  async getAllEnrollments(): Promise<Enrollment[]> {
    return await db.select().from(enrollments);
  }

  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const [enrollment] = await db.insert(enrollments).values(insertEnrollment).returning();
    return enrollment;
  }

  async getEnrollmentByUserAndCourse(
    userId: number,
    courseId: number
  ): Promise<Enrollment | undefined> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.courseId, courseId)
        )
      );
    return enrollment;
  }

  async getEnrolledCourses(userId: number): Promise<Course[]> {
    const result = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        instructorId: courses.instructorId,
        price: courses.price,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.userId, userId));

    return result;
  }

  // Live Session operations
  async getLiveSession(id: number): Promise<LiveSession | undefined> {
    const [session] = await db.select().from(liveSessions).where(eq(liveSessions.id, id));
    return session;
  }

  async getAllLiveSessions(): Promise<LiveSession[]> {
    return await db.select().from(liveSessions);
  }

  async createLiveSession(insertSession: InsertLiveSession): Promise<LiveSession> {
    const [session] = await db.insert(liveSessions).values(insertSession).returning();
    return session;
  }

  // Content operations
  async getContent(id: number): Promise<Content | undefined> {
    const [contentItem] = await db.select().from(content).where(eq(content.id, id));
    return contentItem;
  }

  async getAllContent(): Promise<Content[]> {
    return await db.select().from(content);
  }

  async createContent(contentData: InsertContent): Promise<Content> {
    const [contentItem] = await db.insert(content).values(contentData).returning();
    return contentItem;
  }
}

export const storage = new DatabaseStorage();


// Example of where the fetch call might be, demonstrating JWT token inclusion.
async function createCourseAPI(data: any) {
  const token = localStorage.getItem('jwt');
  if (!token) {
    // Handle the case where token is not available
    console.error("JWT token not found in localStorage.");
    return; // Or throw an error, redirect, etc.
  }

  const response = await fetch('/api/courses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    // Handle API errors
    const errorData = await response.json();
    console.error("API error:", errorData);
    throw new Error("Failed to create course.");
  }
  const createdCourse = await response.json();
  return createdCourse;
}