import React, { useEffect, useState, useRef } from "react";
import { BookOpen } from "lucide-react";

type CourseType = {
  _id: string;
  title: string;
  description?: string;
  instructor?: string;
  image?: string;
  category?: "Basic" | "Advanced";
  videoUrl?: string;
};

const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructor, setInstructor] = useState("");
  const [category, setCategory] = useState<"Basic" | "Advanced">("Basic");
  const [image, setImage] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/courses");
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const previewUrl = URL.createObjectURL(file);
    setImage(previewUrl);
  }
};


  const createCourse = async () => {
  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("instructor", instructor);
    formData.append("category", category);
    formData.append("videoUrl", videoUrl);

    if (fileInputRef.current?.files?.[0]) {
      formData.append("image", fileInputRef.current.files[0]);
    }

    const res = await fetch("http://localhost:5000/api/courses", {
      method: "POST",
      body: formData, // no Content-Type header here; browser sets it
    });

    if (res.ok) {
      setTitle("");
      setDescription("");
      setInstructor("");
      setCategory("Basic");
      setVideoUrl("");
      setImage("");

      if (fileInputRef.current) fileInputRef.current.value = "";

      fetchCourses();
    }
  } catch (err) {
    console.error("Create error:", err);
  }
};


  const deleteCourse = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/courses/${id}`, {
        method: "DELETE",
      });
      fetchCourses();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <BookOpen className="text-blue-600" /> Admin: Manage Courses
      </h2>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <input
          className="p-2 border rounded w-full"
          placeholder="Course Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="p-2 border rounded w-full"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="p-2 border rounded w-full"
          placeholder="Instructor"
          value={instructor}
          onChange={(e) => setInstructor(e.target.value)}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as "Basic" | "Advanced")}
          className="p-2 border rounded w-full"
        >
          <option value="Basic">Basic</option>
          <option value="Advanced">Advanced</option>
        </select>

        <input
          type="file"
          accept="image/*"
          className="p-2 border rounded w-full"
          onChange={handleImageChange}
          ref={fileInputRef}
        />
        <input
          className="p-2 border rounded w-full"
          placeholder="YouTube Video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />

        {image && (
          <div className="col-span-full">
            <img
              src={image}
              alt="Preview"
              className="h-32 rounded object-cover border"
            />
          </div>
        )}
        <button
          onClick={createCourse}
          className="w-40 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Course
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course._id}
            className="p-4 border rounded-lg shadow hover:shadow-md bg-white flex flex-col"
          >
            {course.image && (
              <img
                src={course.image}
                alt={course.title}
                className="h-40 w-full object-cover rounded mb-3"
              />
            )}
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-xl font-semibold">{course.title}</h3>
              {course.category && (
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    course.category === "Basic"
                      ? "bg-green-100 text-green-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {course.category}
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-2">{course.description}</p>
            {course.instructor && (
              <p className="text-sm text-gray-500">
                By: {course.instructor}
              </p>
            )}
            <button
              onClick={() => deleteCourse(course._id)}
              className="mt-auto text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded self-start"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCourses;
