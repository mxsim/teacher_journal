const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");

const unlinkAsync = promisify(fs.unlink);
const existsAsync = promisify(fs.exists);

// Configure storage for different file types
const configureStorage = (type) => {
  return multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadPath = path.join(__dirname, `../../public/uploads/${type}`);

      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },
    filename: async (req, file, cb) => {
      const ext = path.extname(file.originalname);
      let filename;

      // For subject icons, use subject ID as filename
      if (type === "subjects/subject_icons" && req.params.id) {
        filename = `subject_${req.params.id}${ext}`;

        // Delete existing file if it exists
        const filePath = path.join(
          __dirname,
          `../../public/uploads/${type}/${filename}`
        );
        if (await existsAsync(filePath)) {
          await unlinkAsync(filePath);
        }
      }
      // For other files, use timestamp
      else {
        filename = `${type.split("/").pop()}_${Date.now()}${ext}`;
      }

      cb(null, filename);
    },
  });
};

// File type validators
const fileValidators = {
  image: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
  document: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only document files are allowed!"), false);
    }
  },
};

// Create upload middleware for each type
const uploadMiddleware = {
  subjectIcon: multer({
    storage: configureStorage("subjects/subject_icons"),
    fileFilter: fileValidators.image,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }).single("subject_icon"),

  materialFile: multer({
    storage: configureStorage("subjects/material_files"),
    fileFilter: fileValidators.document,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  }).single("material_file"),

  profilePhoto: multer({
    storage: configureStorage("users/profile_data"),
    fileFilter: fileValidators.image,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }).single("profile_photo"),
};

// File deletion utility
const deleteFile = async (filePath) => {
  try {
    if (await existsAsync(filePath)) {
      await unlinkAsync(filePath);
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error deleting file:", err);
    return false;
  }
};

// Get public URL for a file
const getPublicPath = (filename, type) => {
  if (!filename) return null;

  const basePaths = {
    "subjects/subject_icons": "/uploads/subjects/subject_icons",
    "subjects/material_files": "/uploads/subjects/material_files",
    "users/profile_data": "/uploads/users/profile_data",
  };

  return `${basePaths[type]}/${filename}`;
};

module.exports = {
  uploadMiddleware,
  deleteFile,
  getPublicPath,
};
