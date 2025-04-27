// server_subject_profile.js

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const storageManager = require("../config/multerStorageManager");

// Multer setup for uploading new materials
const uploadMaterial = storageManager
  .getUpload("subjectMaterialFiles")
  .single("material");

// Helper: check if the logged-in user owns this subject
async function checkOwnership(subjectId, userId) {
  try {
    const [rows] = await db.promise().query(
      `SELECT t.user_id
       FROM subjects s
       JOIN teachers t ON s.teacher_id = t.teacher_id
       WHERE s.subject_id = ?`,
      [subjectId]
    );
    return rows.length > 0 && rows[0].user_id === userId;
  } catch (err) {
    console.error("Ownership check failed:", err);
    return false;
  }
}

// GET subject profile, with server-side tab selection
router.get("/:id", async (req, res) => {
  try {
    const subjectId = req.params.id;
    const userId = req.session.userId;

    // 1) Load subject + teacher + department
    const [subjRows] = await db.promise().query(
      `SELECT s.subject_id,
              s.subject_name,
              s.description,
              s.subject_photo,
              u.user_profile_image AS teacher_image,
              u.name AS teacher_name,
              u.surname AS teacher_surname,
              d.department_name
       FROM subjects s
       JOIN teachers t ON s.teacher_id = t.teacher_id
       JOIN users u ON t.user_id = u.user_id
       JOIN departments d ON s.department_id = d.department_id
       WHERE s.subject_id = ?`,
      [subjectId]
    );
    if (!subjRows.length) {
      return res.status(404).send("Subject not found");
    }
    const subj = subjRows[0];

    // 2) Ownership
    const isOwner = await checkOwnership(subjectId, userId);

    // 3) Load materials
    const [materials] = await db
      .promise()
      .query(`SELECT * FROM subject_materials WHERE subject_id = ?`, [
        subjectId,
      ]);
    const formatted = materials.map((m) => ({
      ...m,
      file_path: storageManager.getPublicUrl(
        "subjectMaterialFiles",
        m.file_path
      ),
    }));
    const materialsByType = {
      lecture: formatted.filter((m) => m.material_type === "lecture"),
      task: formatted.filter((m) => m.material_type === "task"),
      additional: formatted.filter((m) => m.material_type === "additional"),
    };

    // 4) Load groups + members with role
    const [groups] = await db
      .promise()
      .query(`SELECT * FROM subject_groups WHERE subject_id = ?`, [subjectId]);

    for (let g of groups) {
      const [members] = await db.promise().query(
        `SELECT u.user_id,
            u.name,
            u.surname,
            u.parent_name,
            u.user_profile_image,
            sp.speciality_name,
            u.role,  -- Directly fetch role from users table
            cg.*
     FROM collaborative_groups cg
     JOIN students st ON cg.student_id = st.student_id
     JOIN users u ON st.user_id = u.user_id
     LEFT JOIN speciality sp ON st.speciality_id = sp.speciality_id
     WHERE cg.subject_group_id = ?`,
        [g.subject_group_id]
      );
  

      g.members = members.map((m) => ({
        ...m,
        // Determine role based on both the role field and is_group_leader
        role: m.is_group_leader ? "Староста" : m.role || "Студент",
        user_profile_image: m.user_profile_image
          ? storageManager.getPublicUrl(
              "userProfilePhotos",
              m.user_profile_image
            )
          : "/img/default-profile.png",
      }));
    }

    // 5) Render
    res.render("subject_profile", {
      subject: {
        subject_id: subj.subject_id,
        subject_name: subj.subject_name,
        description: subj.description,
        department_name: subj.department_name,
        subject_photo: subj.subject_photo
          ? storageManager.getPublicUrl("subjectIcons", subj.subject_photo)
          : null,
      },
      teacher: {
        name: subj.teacher_name,
        surname: subj.teacher_surname,
        image: subj.teacher_image
          ? storageManager.getPublicUrl("userProfilePhotos", subj.teacher_image)
          : "/img/default-profile.png",
      },
      materialsByType,
      groups,
      isOwner,
      role: req.session.role,
      user_id: req.session.userId,
      title: subj.subject_name,
      scripts: ["client_subject_profile"],
      styles: ["main_styles", "subject_profile"],
    });
  } catch (err) {
    console.error("Error loading profile:", err);
    res.status(500).send("Server error");
  }
});

// POST update description
router.post("/:id/description", async (req, res) => {
  const subjectId = req.params.id;
  if (!(await checkOwnership(subjectId, req.session.userId))) {
    return res.status(403).send("Access denied");
  }
  await db
    .promise()
    .query(`UPDATE subjects SET description = ? WHERE subject_id = ?`, [
      req.body.description,
      subjectId,
    ]);
  res.redirect(`/subject/${subjectId}?tab=materials`);
});

// POST add material
router.post("/:id/materials", uploadMaterial, async (req, res) => {
  const subjectId = req.params.id;
  if (!(await checkOwnership(subjectId, req.session.userId))) {
    if (req.file)
      storageManager.deleteFile("subjectMaterialFiles", req.file.filename);
    return res.status(403).send("Access denied");
  }
  await db.promise().query(
    `INSERT INTO subject_materials
       (subject_id, file_name, file_path, material_type)
     VALUES (?, ?, ?, ?)`,
    [subjectId, req.body.file_name, req.file.filename, req.body.material_type]
  );
  res.redirect(`/subject/${subjectId}?tab=materials`);
});

// POST rename material
router.post("/materials/:materialId/rename", async (req, res) => {
  const materialId = req.params.materialId;
  const [rows] = await db
    .promise()
    .query(`SELECT subject_id FROM subject_materials WHERE id = ?`, [
      materialId,
    ]);
  if (
    !rows.length ||
    !(await checkOwnership(rows[0].subject_id, req.session.userId))
  ) {
    return res.status(403).send("Access denied");
  }
  await db
    .promise()
    .query(`UPDATE subject_materials SET file_name = ?, material_type = ? WHERE id = ?`, [
      req.body.file_name,
      req.body.material_type,
      materialId,
    ]);
  res.redirect(`/subject/${rows[0].subject_id}?tab=materials`);
});

// POST delete material
router.post("/materials/:materialId/delete", async (req, res) => {
  const materialId = req.params.materialId;
  const [rows] = await db
    .promise()
    .query(`SELECT file_path, subject_id FROM subject_materials WHERE id = ?`, [
      materialId,
    ]);
  if (
    !rows.length ||
    !(await checkOwnership(rows[0].subject_id, req.session.userId))
  ) {
    return res.status(403).send("Access denied");
  }
  await db
    .promise()
    .query(`DELETE FROM subject_materials WHERE id = ?`, [materialId]);
  storageManager.deleteFile("subjectMaterialFiles", rows[0].file_path);
  res.redirect(`/subject/${rows[0].subject_id}?tab=materials`);
});

// POST delete group
router.post("/groups/:groupId/delete", async (req, res) => {
  const groupId = req.params.groupId;
  const [rows] = await db
    .promise()
    .query(`SELECT subject_id FROM subject_groups WHERE subject_group_id = ?`, [
      groupId,
    ]);
  if (
    !rows.length ||
    !(await checkOwnership(rows[0].subject_id, req.session.userId))
  ) {
    return res.status(403).send("Access denied");
  }
  await db
    .promise()
    .query(`DELETE FROM collaborative_groups WHERE subject_group_id = ?`, [
      groupId,
    ]);
  await db
    .promise()
    .query(`DELETE FROM subject_groups WHERE subject_group_id = ?`, [groupId]);
  res.redirect(`/subject/${rows[0].subject_id}?tab=groups`);
});

module.exports = router;
