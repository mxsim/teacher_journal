const express = require("express");
const router = express.Router();
const db = require("../config/db");
const storageManager = require("../config/multerStorageManager");

const uploadSubjectPhoto = storageManager.getUpload("subjectIcons");

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
// Render Subjects Page
router.get("/", async (req, res) => {
  try {
    const { search = "", sort = "asc", department = "" } = req.query;

    const teacherId = await getTeacherId(req);
    if (!teacherId) {
      return res.status(403).send("Access denied - teacher not found");
    }

    const groups = await getTeacherGroups(teacherId); // Changed from teacher[0].teacher_id to teacherId
    const [userData] = await db
      .promise()
      .query("SELECT user_id, name, surname FROM users WHERE user_id = ?", [
        req.session.userId,
      ]);

    let query = `
      SELECT s.*, d.department_name
      FROM subjects s
      JOIN departments d ON s.department_id = d.department_id
      JOIN teacher_departments td ON s.department_id = td.department_id
      WHERE s.teacher_id = ? AND td.teacher_id = ?
    `;
    const params = [teacherId, teacherId];

    if (search) {
      query += " AND s.subject_name LIKE ?";
      params.push(`%${search}%`);
    }

    if (department) {
      query += " AND s.department_id = ?";
      params.push(department);
    }

    query += ` ORDER BY s.subject_name ${sort === "desc" ? "DESC" : "ASC"}`;

    const [subjects, departments] = await Promise.all([
      db.promise().query(query, params),
      db.promise().query(
        `SELECT d.department_id, d.department_name
         FROM teacher_departments td
         JOIN departments d ON td.department_id = d.department_id
         WHERE td.teacher_id = ?`,
        [teacherId]
      ),
    ]);

    res.render("teacher/subjects", {
      userData: userData[0][0],
      subjects: subjects[0].map((subject) => ({
        ...subject,
        subject_photo: subject.subject_photo
          ? storageManager.getPublicUrl("subjectIcons", subject.subject_photo)
          : "/img/header.jpg",
      })),
      departments: departments[0],
      currentSearch: search,
      currentSort: sort,
      groups: groups,
      currentDepartment: department,
      isTeacher: req.session.role === "teacher",
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
// Get single subject
router.get("/:id", async (req, res) => {
  try {
    const teacherId = await getTeacherId(req);
    const subjectId = req.params.id;

    const [subject] = await db.promise().query(
      `SELECT s.*, d.department_name
       FROM subjects s
       JOIN departments d ON s.department_id = d.department_id
       WHERE s.subject_id = ? AND s.teacher_id = ?`,
      [subjectId, teacherId]
    );

    if (!subject.length) {
      return res.status(404).json({ error: "Subject not found" });
    }

    const subjectData = subject[0];
    if (subjectData.subject_photo) {
      subjectData.subject_photo = storageManager.getPublicUrl(
        "subjectIcons",
        storageManager.getFilenameFromPath(subjectData.subject_photo)
      );
    }

    res.json(subjectData);
  } catch (err) {
    console.error("Error fetching subject:", err);
    res.status(500).json({ error: "Error fetching subject" });
  }
});

// Add new subject
router.post(
  "/add",
  uploadSubjectPhoto.single("subject_photo"),
  async (req, res) => {
    try {
      const { "subject-name": subjectName, department: departmentId } =
        req.body;
      const teacherId = await getTeacherId(req);

      if (!teacherId) {
        return res.status(403).json({ error: "Teacher not found" });
      }

      // Verify department assignment
      const [validDept] = await db
        .promise()
        .query(
          "SELECT 1 FROM teacher_departments WHERE teacher_id = ? AND department_id = ?",
          [teacherId, departmentId]
        );

      if (!validDept.length) {
        return res
          .status(403)
          .json({ error: "Teacher not assigned to this department" });
      }

      // Handle file upload
      let subjectPhoto = null;
      if (req.file) {
        subjectPhoto = req.file.filename;
      }

      const [result] = await db.promise().query(
        `INSERT INTO subjects 
       (subject_name, teacher_id, department_id, subject_photo) 
       VALUES (?, ?, ?, ?)`,
        [subjectName, teacherId, departmentId, subjectPhoto]
      );

      res.json({ success: true, subjectId: result.insertId });
    } catch (err) {
      console.error("Add subject error:", err);

      // Clean up uploaded file if error occurred
      if (req.file) {
        storageManager.deleteFile("subjectIcons", req.file.filename);
      }

      res.status(500).json({ error: "Error adding subject" });
    }
  }
);

// Update subject
router.put(
  "/:id",
  uploadSubjectPhoto.single("subject_photo"),
  async (req, res) => {
    try {
      const {
        "subject-name": subjectName,
        department: departmentId,
        current_photo: currentPhoto,
      } = req.body;

      const teacherId = await getTeacherId(req);
      const subjectId = req.params.id;

      if (!teacherId) {
        return res.status(403).json({ error: "Teacher not found" });
      }

      // Verify department assignment
      const [validDept] = await db
        .promise()
        .query(
          "SELECT 1 FROM teacher_departments WHERE teacher_id = ? AND department_id = ?",
          [teacherId, departmentId]
        );

      if (!validDept.length) {
        return res
          .status(403)
          .json({ error: "Teacher not assigned to this department" });
      }

      // Handle file upload
      let subjectPhoto = currentPhoto;
      if (req.file) {
        // Delete old photo if exists
        if (currentPhoto) {
          const oldFilename = storageManager.getFilenameFromPath(currentPhoto);
          storageManager.deleteFile("subjectIcons", oldFilename);
        }

        subjectPhoto = req.file.filename;
      }

      const [result] = await db.promise().query(
        `UPDATE subjects SET
       subject_name = ?,
       department_id = ?,
       subject_photo = ?
       WHERE subject_id = ? AND teacher_id = ?`,
        [subjectName, departmentId, subjectPhoto, subjectId, teacherId]
      );

      res.json({
        success: result.affectedRows > 0,
        subjectPhoto: subjectPhoto
          ? storageManager.getPublicUrl("subjectIcons", subjectPhoto)
          : null,
      });
    } catch (err) {
      console.error("Update error:", err);

      // Clean up uploaded file if error occurred
      if (req.file) {
        storageManager.deleteFile("subjectIcons", req.file.filename);
      }

      res.status(500).json({ error: "Error updating subject" });
    }
  }
);

// Delete subject
router.delete("/:id", async (req, res) => {
  try {
    const subjectId = req.params.id;
    const teacherId = await getTeacherId(req);

    // Get subject data first (for photo cleanup)
    const [subject] = await db.promise().query(
      `SELECT subject_id, subject_photo 
       FROM subjects 
       WHERE subject_id = ? AND teacher_id = ?`,
      [subjectId, teacherId]
    );

    if (!subject.length) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Delete associated photo if exists
    if (subject[0].subject_photo) {
      const filename = storageManager.getFilenameFromPath(
        subject[0].subject_photo
      );
      storageManager.deleteFile("subjectIcons", filename);
    }

    // Delete subject
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
