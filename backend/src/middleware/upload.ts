// controllers/courseController.ts
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g., 1748071410401.png
  },
});

export const upload = multer({ storage });
