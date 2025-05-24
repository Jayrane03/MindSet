import express from "express";
import multer from "multer";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Routes
router.get("/", getCourses);
router.get("/:id", getCourseById);
router.post("/", upload.single("image"), createCourse); // <-- THIS IS THE IMPORTANT LINE
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

export default router;
