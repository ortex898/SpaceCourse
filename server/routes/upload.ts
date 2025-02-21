
import { Router } from "express";
import multer from "multer";
import AWS from "aws-sdk";
import { storage } from "../storage";
import { AuthRequest } from "../middleware/auth";
import { insertContentSchema } from "@shared/schema";
import { ZodError } from "zod";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

router.post("/", upload.single("file"), async (req: AuthRequest, res) => {
  try {
    if (!req.user || req.user.role !== "instructor") {
      return res.status(403).json({ message: "Only instructors can upload content" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const courseId = parseInt(req.body.courseId);
    if (isNaN(courseId)) {
      return res.status(400).json({ message: "Valid courseId is required" });
    }

    // Verify instructor owns the course
    const course = await storage.getCourse(courseId);
    if (!course || course.instructorId !== req.user.id) {
      return res.status(403).json({ message: "You can only upload content to your own courses" });
    }

    const fileKey = `${Date.now()}-${req.file.originalname}`;
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const result = await s3.upload(uploadParams).promise();

    const contentData = {
      courseId,
      type: req.file.mimetype.split("/")[0],
      url: result.Location,
    };

    const content = await storage.createContent(contentData);
    res.status(201).json(content);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: error.message });
    }
    throw error;
  }
});

export default router;
