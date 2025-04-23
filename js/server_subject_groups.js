const express = require("express");
const router = express.Router();
const db = require("../config/db");
const path = require("path"); // Added this line
const fs = require("fs"); // Added this line
const storageManager = require("../config/multerStorageManager");

// Get the configured upload middleware
const uploadGroupPhoto = storageManager.getUpload("subjectGroupPhotos");

// Helper function to get teacher ID
const getTeacherId = async (req) => {
  const [teacher] = await db
    .promise()
    .query("SELECT teacher_id FROM teachers WHERE user_id = ?", [
      req.session.userId,
    ]);
  return teacher[0]?.teacher_id;
};

// GET groups page
router.get("/", async (req, res) => {
  try {
    const teacherId = await getTeacherId(req);
    let groupsQuery = "";
    let params = [];

    if (req.session.role === "teacher" && teacherId) {
      groupsQuery = `
        SELECT sg.*, s.subject_name
        FROM subject_groups sg
        JOIN subjects s ON sg.subject_id = s.subject_id
        WHERE sg.teacher_id = ?
      `;
      params = [teacherId];
    } else {
      groupsQuery = `
        SELECT sg.*, s.subject_name
        FROM subject_groups sg
        JOIN subjects s ON sg.subject_id = s.subject_id
        JOIN collaborative_groups cg ON sg.subject_group_id = cg.subject_group_id
        WHERE cg.student_id = ?
      `;
      params = [req.session.userId];
    }

    const [groups] = await db.promise().query(groupsQuery, params);

    // Add public URLs to group data
    const groupsWithUrls = groups.map((group) => ({
      ...group,
      subject_group_photo: storageManager.getPublicUrl(
        "subjectGroupPhotos",
        group.subject_group_photo
      ),
    }));

    // For teacher users: retrieve subjects for the add/edit forms
    let subjects = [];
    if (req.session.role === "teacher" && teacherId) {
      const [subs] = await db
        .promise()
        .query(
          "SELECT subject_id, subject_name FROM subjects WHERE teacher_id = ?",
          [teacherId]
        );
      subjects = subs;
    }
    res.render("teacher/subject_groups", {
      groups: groupsWithUrls,
      subjects,
      isTeacher: req.session.role === "teacher",
      user_id: req.session.userId,
      role: req.session.role,
      title: "My Groups",
      scripts: ["teacher/client_subject_groups"],
      styles: ["main_styles", "subject_groups"],
    });
  } catch (err) {
    console.error("Error loading groups:", err);
    res.status(500).send("Error loading groups");
  }
});


// GET single group data for editing
router.get("/:id", async (req, res) => {
  try {
    const groupId = req.params.id;
    const teacherId = await getTeacherId(req);
    
    const [rows] = await db.promise().query(
      `SELECT sg.*, s.subject_name
       FROM subject_groups sg
       JOIN subjects s ON sg.subject_id = s.subject_id
       WHERE sg.subject_group_id = ? AND sg.teacher_id = ?`,
      [groupId, teacherId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    const groupData = rows[0];
    if (groupData.subject_group_photo) {
      groupData.subject_group_photo = path.basename(groupData.subject_group_photo);
    }

    res.json(groupData);
  } catch (err) {
    console.error("Error fetching group:", err);
    res.status(500).json({ error: "Error fetching group" });
  }
});

// Add new group
router.post("/add", uploadGroupPhoto.single("group_photo"), async (req, res) => {
  try {
    const { "group-name": groupName, subject_id: subjectId } = req.body;
    const teacherId = await getTeacherId(req);
    if (!teacherId) return res.status(403).json({ error: "Teacher not found" });

    // Insert the group (without photo first to get the ID)
    const [result] = await db.promise().query(
      `INSERT INTO subject_groups (group_name, subject_id, teacher_id)
       VALUES (?, ?, ?)`,
      [groupName, subjectId, teacherId]
    );
    const groupId = result.insertId;

    if (req.file) {
      const ext = path.extname(req.file.filename);
      const newFilename = `subj_group_${groupId}${ext}`;
      const oldPath = storageManager.getFilePath('subjectGroupPhotos', req.file.filename);
      const newPath = storageManager.getFilePath('subjectGroupPhotos', newFilename);
      
      fs.renameSync(oldPath, newPath);
      
      await db.promise().query(
        `UPDATE subject_groups SET subject_group_photo = ? WHERE subject_group_id = ?`,
        [newFilename, groupId]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error adding group:", err);
    res.status(500).json({ error: "Error adding group" });
  }
});

// Update group
router.put("/:id", uploadGroupPhoto.single("group_photo"), async (req, res) => {
  try {
    const {
      "group-name": groupName,
      subject_id: subjectId,
      current_photo: currentPhoto,
    } = req.body;
    const teacherId = await getTeacherId(req);
    const groupId = req.params.id;
    if (!teacherId) return res.status(403).json({ error: "Teacher not found" });

    let groupPhoto = currentPhoto;
    if (req.file) {
      // Delete old photo if exists
      if (currentPhoto) {
        storageManager.deleteFile('subjectGroupPhotos', currentPhoto);
      }
      groupPhoto = req.file.filename;
    }

    const [result] = await db.promise().query(
      `UPDATE subject_groups SET
         group_name = ?,
         subject_id = ?,
         subject_group_photo = ?
       WHERE subject_group_id = ? AND teacher_id = ?`,
      [groupName, subjectId, groupPhoto, groupId, teacherId]
    );

    res.json({ success: result.affectedRows > 0 });
  } catch (err) {
    console.error("Error updating group:", err);
    res.status(500).json({ error: "Error updating group" });
  }
});

// Delete group
router.delete("/:id", async (req, res) => {
  try {
    const groupId = req.params.id;
    const teacherId = await getTeacherId(req);
    
    const [group] = await db.promise().query(
      `SELECT subject_group_photo FROM subject_groups 
       WHERE subject_group_id = ? AND teacher_id = ?`,
      [groupId, teacherId]
    );
    
    if (!group.length) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (group[0].subject_group_photo) {
      storageManager.deleteFile('subjectGroupPhotos', group[0].subject_group_photo);
    }

    await db.promise().query(
      "DELETE FROM subject_groups WHERE subject_group_id = ?",
      [groupId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting group:", err);
    res.status(500).json({ error: "Error deleting group" });
  }
});

module.exports = router;