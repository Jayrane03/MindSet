import mongoose from "mongoose";
const CourseSchema = new mongoose.Schema({
  title: String,
  description: String,
  instructor: String,
  image: String,
  category: {
    type: String,
    enum: ["Basic", "Advanced"],
    default: "Basic",
  },
  videoUrl: { type: String },

});



export const Course = mongoose.model("Course", CourseSchema);
