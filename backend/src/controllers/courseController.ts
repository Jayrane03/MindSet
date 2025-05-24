import { Request, Response } from "express";
import { Course } from "../models/Course";

// GET all courses
export const getCourses = async (_: Request, res: Response) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

// GET single course
export const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch course" });
  }
};

// CREATE new course
export const createCourse = async (req: Request, res: Response) => {
  try {
    const { title, description, instructor, category, videoUrl } = req.body;

    const image = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : "";

    const course = new Course({
      title,
      description,
      instructor,
      image,
      category,
      videoUrl,
    });

    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: "Failed to create course" });
  }
};


// UPDATE course
export const updateCourse = async (req: Request, res: Response) => {
  try {
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Course not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update course" });
  }
};

// DELETE course
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Course not found" });
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete course" });
  }
};
