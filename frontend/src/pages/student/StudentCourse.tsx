import React, { useEffect, useState } from "react";

type CourseType = {
  _id: string;
  title: string;
  description?: string;
  instructor?: string;
  image?: string;
  category?: "Basic" | "Advanced";
  videoUrl?: string;
};

const StudentCourses: React.FC = () => {
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/courses");
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) return <div className="p-6 text-lg font-semibold">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-blue-800">Student: Available Courses</h2>
      {courses.length === 0 ? (
        <p className="text-gray-600">No courses available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="p-4 border rounded-lg shadow bg-white hover:shadow-md transition duration-300 ease-in-out flex flex-col"
            >
              {course.image && (
  <img
    src={course.image}
    alt={course.title}
    className="h-40 w-full object-cover rounded mb-3"
  />
)}
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-xl font-semibold text-blue-700">{course.title}</h3>
                {course.category && (
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      course.category === "Basic" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {course.category}
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-2">{course.description}</p>
              {course.instructor && <p className="text-sm text-gray-500 mb-2">Instructor: {course.instructor}</p>}
             {course.videoUrl && (
  <a
    href={course.videoUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="text-center mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
  >
    Watch Video
  </a>
)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
