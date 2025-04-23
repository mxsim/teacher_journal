// server_user_profile.js

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads/users/profile_data"));
  },
  filename: (req, file, cb) => {
    const userId = req.session.userId;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile_${userId}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".png", ".jpeg", ".jpg", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PNG, JPEG, JPG, and WEBP are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});





router.get("/:id", async (req, res) => {
  const userId = req.params.id;
  const loggedInUserId = req.session.userId;

  try {
    const [user] = await db
      .promise()
      .query("SELECT * FROM users WHERE user_id = ?", [userId]);

    if (user.length === 0) return res.status(404).send("User not found");

    // Set default image path if the user does not have a profile picture
    const userProfileImage = user[0].user_profile_image
      ? `/uploads/users/profile_data/${user[0].user_profile_image}` 
      : "/img/default-profile.png";

    res.render("user_profile", {
      ...user[0],
      user_id: req.session.userId,
      role: req.session.role,
      title: "Users",
      scripts: ["shared/client_user_profile"],
      styles: ["main_styles","user_profile"],

      profile_picture: userProfileImage, // Correct path to image
      isOwner: user[0].user_id === loggedInUserId,
      description: user[0].user_description || "No description yet.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("SERVER | server_user_profile.js : Server error");
  }
});
// Update Description functionality
router.post("/update-description", async (req, res) => {
  const { description } = req.body;
  const loggedInUserId = req.session.userId;

  try {
    await db
      .promise()
      .query("UPDATE users SET user_description = ? WHERE user_id = ?", [
        description,
        loggedInUserId,
      ]);
    res.status(200).send({ success: true }); // Success response
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send("SERVER | server_user_profile.js : Error updating description");
  }
});

// Update Profile Picture functionality
router.post(
  "/update-picture",
  upload.single("profile_picture"), // Handles file upload using multer
  async (req, res) => {
    const loggedInUserId = req.session.userId;

    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    // Keep the original file extension
    const fileExtension = path.extname(req.file.originalname).toLowerCase(); // Get original file extension
    const fileName = `profile_${loggedInUserId}${fileExtension}`; // Use original extension

    try {
      // Update the database with the filename, not the full path
      await db
        .promise()
        .query("UPDATE users SET user_profile_image = ? WHERE user_id = ?", [
          fileName,
          loggedInUserId,
        ]);

      // Send back the correct path
      res
        .status(200)
        .json({ filePath: `/uploads/users/profile_data/${fileName}` });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .send(
          "SERVER | server_user_profile.js : Error updating profile picture"
        );
    }
  }
);

module.exports = router;