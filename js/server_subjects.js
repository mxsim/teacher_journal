// server_subjects.js

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public/uploads/subjects");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "subject-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Helper function to get teacher ID
const getTeacherId = async (req) => {
  const [teacher] = await db
    .promise()
    .query("SELECT teacher_id FROM teachers WHERE user_id = ?", [
      req.session.userId,
    ]);
  return teacher[0]?.teacher_id;
};


// Helper function to get teacher's subjects with department info
const getTeacherSubjects = async (teacherId) => {
  const [results] = await db.promise().query(
    `SELECT s.*, 
     GROUP_CONCAT(sg.group_name) AS groups,
     d.department_name
     FROM subjects s
     LEFT JOIN subject_groups sg ON s.subject_id = sg.subject_id
     JOIN departments d ON s.department_id = d.department_id
     JOIN teacher_departments td ON s.department_id = td.department_id AND s.teacher_id = td.teacher_id
     WHERE s.teacher_id = ?
     GROUP BY s.subject_id`,
    [teacherId]
  );
  return results;
};

// Helper function to get teacher's assigned departments
const getTeacherDepartments = async (teacherId) => {
  const [results] = await db.promise().query(
    `SELECT d.department_id, d.department_name
     FROM teacher_departments td
     JOIN departments d ON td.department_id = d.department_id
     WHERE td.teacher_id = ?`,
    [teacherId]
  );
  return results;
};

// Add a new function to get teacher's groups
const getTeacherGroups = async (teacherId) => {
  const [results] = await db.promise().query(
    `SELECT DISTINCT sg.group_name
     FROM subject_groups sg
     JOIN subjects s ON sg.subject_id = s.subject_id
     WHERE s.teacher_id = ? OR sg.teacher_id = ?`,
    [teacherId, teacherId]
  );
  return results.map((row) => row.group_name);
};

// Render Subjects Page
router.get("/", async (req, res) => {
  try {
    const [teacher] = await db
      .promise()
      .query("SELECT teacher_id FROM teachers WHERE user_id = ?", [
        req.session.userId,
      ]);

    if (!teacher.length) {
      return res.status(403).send("Access denied - teacher not found");
    }

    const subjects = await getTeacherSubjects(teacher[0].teacher_id);
    const departments = await getTeacherDepartments(teacher[0].teacher_id);
    const groups = await getTeacherGroups(teacher[0].teacher_id);
    const [userData] = await db
      .promise()
      .query("SELECT user_id, name, surname FROM users WHERE user_id = ?", [
        req.session.userId,
      ]);

    res.render("teacher/subjects", {
      userData: userData[0],
      subjects: subjects,
      departments: departments,
      groups: groups,
      user_id: req.session.userId,
      role: req.session.role,
      title: "My Subjects",
      scripts: ["teacher/client_subjects"],
      styles: ["main_styles", "subjects"],
    });
  } catch (err) {
    console.error("Error in subjects route:", err);
    res.status(500).send("Error loading subjects");
  }
});


























// Add Subject with file upload
router.post("/add", async (req, res) => {
  try {
    const {
      "subject-name": subjectName,
      department: departmentId,
      description,
    } = req.body;

    const teacherId = await getTeacherId(req);

    // validation
    if (!teacherId) {
      return res.status(403).json({ error: "Teacher not found" });
    }

    // Verify department assignment
    const [validDept] = await db
      .promise()
      .query(
        "SELECT 1 FROM teacher_departments WHERE teacher_id = ? AND department_id = ?",
        [teacherId, department_id]
      );

    if (!validDept.length) {
      return res
        .status(403)
        .json({ error: "Teacher not assigned to this department" });
    }

    const subjectPhoto = req.file
      ? `/uploads/subjects/${req.file.filename}`
      : null;

    await db.promise().query(
      `INSERT INTO subjects 
       (subject_name, teacher_id, department_id, description, subject_photo) 
       VALUES (?, ?, ?, ?, ?)`,
      [subjectName, teacherId, departmentId, description, subjectPhoto]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Add subject error:", err);
    res.status(500).json({ error: "Error adding subject" });
  }
});


// Update Subject
router.put("/:id", upload.single('subject_image'), async (req, res) => {
  try {
    const { 
      'subject-name': subjectName,
      department: departmentId,
      description,
      current_image: currentImage
    } = req.body;

    const teacherId = await getTeacherId(req);
    const subjectId = req.params.id;


    // validation

    if (!teacherId) {
      return res.status(403).json({ error: "Teacher not found" });
    }








    // Handle file upload
    let subjectPhoto = currentImage;
    if (req.file) {
      subjectPhoto = `/uploads/subjects/${req.file.filename}`;
      if (currentImage) {
        const oldPath = path.join(__dirname, "../public", currentImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const [result] = await db.promise().query(
      `UPDATE subjects SET
       subject_name = ?,
       department_id = ?,
       description = ?,
       subject_photo = ?
       WHERE subject_id = ? AND teacher_id = ?`,
      [subjectName, departmentId, description, subjectPhoto, subjectId, teacherId]
    );

    res.json({ success: result.affectedRows > 0 });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Error updating subject" });
  }
});














// Delete a subject
router.delete("/:id", async (req, res) => {
  try {
    const subjectId = req.params.id;

    // Verify ownership
    const [subject] = await db.promise().query(
      `SELECT s.subject_id 
       FROM subjects s
       JOIN teachers t ON s.teacher_id = t.teacher_id
       WHERE s.subject_id = ? AND t.user_id = ?`,
      [subjectId, req.session.userId]
    );

    if (!subject.length) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await db
      .promise()
      .query("DELETE FROM subjects WHERE subject_id = ?", [subjectId]);

    res.json({ success: true });
  } catch (err) {
    console.error("Delete subject error:", err);
    res.status(500).json({ error: "Error deleting subject" });
  }
});

module.exports = router;
