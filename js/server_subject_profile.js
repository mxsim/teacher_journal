const express = require("express");
const router = express.Router();
const db = require("../config/db");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Debug logger helper
const logAccess = (userId, subjectId, isOwner) => {
  console.log(
    `[DEBUG] User ${userId} accessing subject ${subjectId} - ${
      isOwner ? "OWNER" : "STRANGER"
    }`
  );
};

// Enhanced ownership check
const checkOwnership = async (subjectId, userId) => {
  try {
    const [result] = await db.promise().query(
      `SELECT t.user_id 
       FROM subjects s
       JOIN teachers t ON s.teacher_id = t.teacher_id
       WHERE s.subject_id = ?`,
      [subjectId]
    );

    const isOwner = result[0]?.user_id === userId;
    console.log(
      `[OWNERSHIP CHECK] Subject: ${subjectId}, User: ${userId}, Is Owner: ${isOwner}`
    );
    return isOwner;
  } catch (err) {
    console.error("[OWNERSHIP CHECK ERROR]", err);
    return false;
  }
};

// Configure file upload
const materialStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads/subjects/material_files"));
  },
  filename: (req, file, cb) => {
    const fileName = `material-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, fileName);
  },
});

const uploadMaterial = multer({
  storage: materialStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx", ".txt", ".pptx"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowedTypes.includes(ext));
  },
});

// main route
router.get("/:id", async (req, res) => {
  try {
    const subjectId = req.params.id;
    const userId = req.session.userId;

    // Get subject data
    const [subject] = await db.promise().query(
      `
      SELECT s.*, 
        u.user_id as teacher_user_id,
        u.name as teacher_name, 
        u.surname as teacher_surname,
        u.user_profile_image as teacher_image
      FROM subjects s
      JOIN teachers t ON s.teacher_id = t.teacher_id
      JOIN users u ON t.user_id = u.user_id
      WHERE s.subject_id = ?
    `,
      [subjectId]
    );

    if (!subject.length) return res.status(404).send("Subject not found");

    // Check ownership
    const isOwner = await checkOwnership(subjectId, req.session.userId);

    // Process materials
    const [materials] = await db.promise().query(
      `
      SELECT *, 
        CASE material_type
          WHEN 'lecture' THEN 'lecture.png'
          WHEN 'task' THEN 'task.png'
          WHEN 'additional' THEN 'additional.png'
        END as icon
      FROM subject_materials 
      WHERE subject_id = ?
    `,
      [subjectId]
    );

    // Initialize all material types
    const materialsByType = {
      lecture: [],
      task: [],
      additional: [],
      ...materials.reduce((acc, material) => {
        const type = material.material_type;
        acc[type] = acc[type] || [];
        acc[type].push({
          ...material,
          file_path: `/uploads/subjects/material_files/${material.file_path}`,
        });
        return acc;
      }, {}),
    };

    // Get groups with members
    const [groups] = await db.promise().query(
      `
      SELECT sg.*, 
        (SELECT COUNT(*) FROM collaborative_groups 
         WHERE subject_group_id = sg.subject_group_id) as member_count
      FROM subject_groups sg
      WHERE sg.subject_id = ?
    `,
      [subjectId]
    );

    for (const group of groups) {
      const [members] = await db.promise().query(
        `
        SELECT u.*, sp.speciality_name 
        FROM collaborative_groups cg
        JOIN students st ON cg.student_id = st.student_id
        JOIN users u ON st.user_id = u.user_id
        LEFT JOIN speciality sp ON st.speciality_id = sp.speciality_id
        WHERE cg.subject_group_id = ?
      `,
        [group.subject_group_id]
      );

      group.members = members.map((m) => ({
        ...m,
        profile_image: m.user_profile_image
          ? `/uploads/users/profile_data/${m.user_profile_image}`
          : "/img/default-profile.png",
      }));
    }

    res.render("subject_profile", {
      subject: {
        ...subject[0],
        subject_photo: subject[0].subject_photo
          ? `/uploads/subjects/material_icons/${subject[0].subject_photo}`
          : "/img/default-subject.jpg",
      },
      materialsByType,
      groups,
      teacher: {
        name: subject[0].teacher_name,
        surname: subject[0].teacher_surname,
        image: subject[0].teacher_image
          ? `/uploads/users/profile_data/${subject[0].teacher_image}`
          : "/img/default-profile.png",
      },
      isOwner,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).send("Server error");
  }
});


// main functionalities

// Update subject description
router.post("/:id/description", async (req, res) => {
  try {
    const subjectId = req.params.id;
    const userId = req.session.userId;
    
    if (!(await checkOwnership(subjectId, userId))) {
      console.log(`[UNAUTHORIZED] User ${userId} tried updating description`);
      return res.status(403).json({ error: "Access denied" });
    }

    await db.promise().query(
      `UPDATE subjects SET description = ? WHERE subject_id = ?`,
      [req.body.description, subjectId]
    );
    
    console.log(`[DESCRIPTION UPDATED] Subject: ${subjectId} by User: ${userId}`);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("[DESCRIPTION UPDATE ERROR]", err);
    res.status(500).json({ error: "Error updating description" });
  }
});

// Upload material
router.post("/:id/materials", uploadMaterial.single("material"), async (req, res) => {
  try {
    const subjectId = req.params.id;
    const userId = req.session.userId;

    if (!(await checkOwnership(subjectId, userId))) {
      console.log(`[UNAUTHORIZED] User ${userId} tried uploading material`);
      return res.status(403).json({ error: "Access denied" });
    }

    await db.promise().query(
      `INSERT INTO subject_materials 
       (subject_id, file_name, file_path, material_type)
       VALUES (?, ?, ?, ?)`,
      [
        subjectId,
        req.body.file_name,
        req.file.filename,
        req.body.material_type
      ]
    );

    console.log(`[MATERIAL UPLOADED] Subject: ${subjectId} by User: ${userId}`);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("[MATERIAL UPLOAD ERROR]", err);
    res.status(500).json({ error: "Error uploading material" });
  }
});

// Delete material
router.delete("/materials/:materialId", async (req, res) => {
  try {
    const materialId = req.params.materialId;
    
    // Get material info for ownership check
    const [material] = await db.promise().query(
      `SELECT s.subject_id, sm.file_path
       FROM subject_materials sm
       JOIN subjects s ON sm.subject_id = s.subject_id
       WHERE sm.id = ?`,
      [materialId]
    );

    if (!material.length) {
      return res.status(404).json({ error: "Material not found" });
    }

    const isOwner = await checkOwnership(material[0].subject_id, req.session.userId);
    if (!isOwner) {
      console.log(`[UNAUTHORIZED] User ${req.session.userId} tried deleting material`);
      return res.status(403).json({ error: "Access denied" });
    }

    // Delete from database
    await db.promise().query(
      `DELETE FROM subject_materials WHERE id = ?`,
      [materialId]
    );

    // Delete file
    const filePath = path.join(
      __dirname,
      "../public/uploads/subjects/material_files",
      material[0].file_path
    );
    fs.unlinkSync(filePath);

    console.log(`[MATERIAL DELETED] ID: ${materialId} by User: ${req.session.userId}`);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("[MATERIAL DELETE ERROR]", err);
    res.status(500).json({ error: "Error deleting material" });
  }
});

// Add group to subject
router.post("/:id/groups", async (req, res) => {
  try {
    const subjectId = req.params.id;
    const userId = req.session.userId;

    if (!(await checkOwnership(subjectId, userId))) {
      console.log(`[UNAUTHORIZED] User ${userId} tried adding group`);
      return res.status(403).json({ error: "Access denied" });
    }

    // Example group creation - adapt to your needs
    const [result] = await db.promise().query(
      `INSERT INTO subject_groups 
       (subject_id, group_name)
       VALUES (?, ?)`,
      [subjectId, req.body.group_name]
    );

    console.log(`[GROUP ADDED] Subject: ${subjectId} by User: ${userId}`);
    res.status(200).json({ success: true, groupId: result.insertId });
  } catch (err) {
    console.error("[GROUP ADD ERROR]", err);
    res.status(500).json({ error: "Error adding group" });
  }
});

// Delete group from subject
router.delete("/groups/:groupId", async (req, res) => {
  try {
    const groupId = req.params.groupId;

    // Get group info for ownership check
    const [group] = await db.promise().query(
      `SELECT subject_id FROM subject_groups WHERE subject_group_id = ?`,
      [groupId]
    );

    if (!group.length) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isOwner = await checkOwnership(group[0].subject_id, req.session.userId);
    if (!isOwner) {
      console.log(`[UNAUTHORIZED] User ${req.session.userId} tried deleting group`);
      return res.status(403).json({ error: "Access denied" });
    }

    await db.promise().query(
      `DELETE FROM subject_groups WHERE subject_group_id = ?`,
      [groupId]
    );

    console.log(`[GROUP DELETED] ID: ${groupId} by User: ${req.session.userId}`);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("[GROUP DELETE ERROR]", err);
    res.status(500).json({ error: "Error deleting group" });
  }
});











module.exports = router;
