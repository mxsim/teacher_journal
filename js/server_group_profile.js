const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Helper function to promisify queries if needed
async function executeQuery(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// Main group profile route
router.get("/:id", async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.session.userId;

    // Get group info
    const groupRows = await executeQuery(
      `
      SELECT sg.*, u.name as teacher_name, u.surname as teacher_surname
      FROM subject_groups sg
      JOIN teachers t ON sg.teacher_id = t.teacher_id
      JOIN users u ON t.user_id = u.user_id
      WHERE sg.subject_group_id = ?
    `,
      [groupId]
    );

    if (groupRows.length === 0) {
      return res.status(404).send("Group not found");
    }

    const group = groupRows[0];
    const isOwner = group.teacher_id === userId;

    // Get students
    const students = await executeQuery(
      `
      SELECT u.user_id, u.name, u.surname, u.parent_name, sp.speciality_abbreviation
      FROM collaborative_groups cg
      JOIN students st ON cg.student_id = st.student_id
      JOIN users u ON st.user_id = u.user_id
      JOIN speciality sp ON st.speciality_id = sp.speciality_id
      WHERE cg.subject_group_id = ?
      ORDER BY u.surname ASC
    `,
      [groupId]
    );

    res.render("group_profile", {
      group: group,
      students,
      isOwner,
      currentUser: { id: userId },
    });
  } catch (err) {
    console.error("Group profile error:", err);
    res.status(500).send("Server error");
  }
});

// Add student to group
router.post("/:id/add-student", async (req, res) => {
  try {
    const groupId = req.params.id;
    const { studentId } = req.body;

    // Check ownership
    const group = await executeQuery(
      "SELECT teacher_id FROM subject_groups WHERE subject_group_id = ?",
      [groupId]
    );

    if (group[0].teacher_id !== req.session.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Add student
    await executeQuery(
      "INSERT INTO collaborative_groups (subject_group_id, student_id) VALUES (?, ?)",
      [groupId, studentId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Add student error:", err);
    res.status(500).json({ error: "Error adding student" });
  }
});

// Remove student from group
router.delete("/:groupId/remove-student/:studentId", async (req, res) => {
  try {
    const { groupId, studentId } = req.params;

    // Check ownership
    const group = await executeQuery(
      "SELECT teacher_id FROM subject_groups WHERE subject_group_id = ?",
      [groupId]
    );

    if (group[0].teacher_id !== req.session.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    await executeQuery(
      "DELETE FROM collaborative_groups WHERE subject_group_id = ? AND student_id = ?",
      [groupId, studentId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Remove student error:", err);
    res.status(500).json({ error: "Error removing student" });
  }
});

module.exports = router;
