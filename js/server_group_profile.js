const express = require("express");
const router = express.Router({ mergeParams: true }); // Important for nested routes
const db = require("../config/db");
const storageManager = require("../config/multerStorageManager");

// Helper to check group ownership
function checkGroupOwnership(groupId, userId, callback) {
  db.query(
    `SELECT t.user_id 
     FROM subject_groups sg
     JOIN teachers t ON sg.teacher_id = t.teacher_id
     WHERE sg.subject_group_id = ?`,
    [groupId],
    (err, rows) => {
      if (err) return callback(err);
      callback(null, rows[0]?.user_id === userId);
    }
  );
}

// Get group profile
router.get("/:id", (req, res) => {
  const groupId = req.params.id;
  const userId = req.session.userId;

  db.query(
    `SELECT sg.*, s.subject_name, 
            u.name AS teacher_name, u.surname AS teacher_surname,
            u.user_profile_image AS teacher_image
     FROM subject_groups sg
     JOIN teachers t ON sg.teacher_id = t.teacher_id
     JOIN users u ON t.user_id = u.user_id
     JOIN subjects s ON sg.subject_id = s.subject_id
     WHERE sg.subject_group_id = ?`,
    [groupId],
    (err, groupRows) => {
      if (err) {
        console.error("Error loading group info:", err);
        return res
          .status(500)
          .render("error", { message: "Помилка завантаження групи" });
      }
      if (!groupRows.length) return res.status(404).send("Group not found");

      const group = groupRows[0];

      db.query(
        `SELECT u.user_id, u.name, u.surname, u.parent_name, 
                u.user_profile_image, sp.speciality_name, 
                st.is_group_leader
         FROM collaborative_groups cg
         JOIN students st ON cg.student_id = st.student_id
         JOIN users u ON st.user_id = u.user_id
         LEFT JOIN speciality sp ON st.speciality_id = sp.speciality_id
         WHERE cg.subject_group_id = ?`,
        [groupId],
        (err, members) => {
          if (err) {
            console.error("Error loading group members:", err);
            return res
              .status(500)
              .render("error", { message: "Помилка завантаження студентів" });
          }

          const leader = members.find((m) => m.is_group_leader) || null;

          db.query(
            `SELECT * FROM speciality WHERE department_id = 
             (SELECT department_id FROM subjects WHERE subject_id = ?)`,
            [group.subject_id],
            (err, specialities) => {
              if (err) {
                console.error("Error fetching specialities:", err);
                return res
                  .status(500)
                  .render("error", {
                    message: "Помилка завантаження спеціальностей",
                  });
              }

              checkGroupOwnership(groupId, userId, (err, isOwner) => {
                if (err) {
                  console.error("Error checking ownership:", err);
                  return res
                    .status(500)
                    .render("error", {
                      message: "Помилка перевірки власності групи",
                    });
                }

                res.render("group_profile", {
                  group: {
                    ...group,
                    group_photo: group.group_photo
                      ? storageManager.getPublicUrl(
                          "subjectGroupPhotos",
                          group.group_photo
                        )
                      : null,
                  },
                  teacher: {
                    name: group.teacher_name,
                    surname: group.teacher_surname,
                    image: group.teacher_image
                      ? storageManager.getPublicUrl(
                          "userProfilePhotos",
                          group.teacher_image
                        )
                      : "/img/default-profile.png",
                  },
                  leader: leader
                    ? {
                        ...leader,
                        user_profile_image: leader.user_profile_image
                          ? storageManager.getPublicUrl(
                              "userProfilePhotos",
                              leader.user_profile_image
                            )
                          : "/img/default-profile.png",
                      }
                    : null,
                  members: members.map((m, index) => ({
                    ...m,
                    position: index + 1, // Add position numbering
                    user_profile_image: m.user_profile_image
                      ? storageManager.getPublicUrl(
                          "userProfilePhotos",
                          m.user_profile_image
                        )
                      : "/img/default-profile.png",
                    is_leader: m.is_group_leader,
                  })),
                  specialities,
                  isOwner,
                  user_id: userId,
                  role: req.session.role,
                  title: `${group.group_name} - Група`,
                  scripts: ["client_group_profile"],
                  styles: ["main_styles", "group_profile"],
                });
              });
            }
          );
        }
      );
    }
  );
});



// New search endpoints
router.get("/api/specialities/search", (req, res) => {
  const searchQuery = `%${req.query.q}%`;
  db.query(
    `SELECT * FROM speciality 
     WHERE speciality_name LIKE ? 
     LIMIT ?`,
    [searchQuery, parseInt(req.query.limit) || 5],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    }
  );
});

// Change the student search endpoint
router.get("/api/students/search", (req, res) => {
  const searchQuery = `%${req.query.q}%`;
  const specialityId = req.query.specialityId;

  if (!specialityId || isNaN(specialityId)) {
    return res.status(400).json({ error: "Invalid speciality ID" });
  }

  db.query(
    `SELECT s.student_id, s.user_id, u.surname, u.name, u.parent_name
     FROM students s
     JOIN users u ON s.user_id = u.user_id
     WHERE s.speciality_id = ?
     AND (u.surname LIKE ? OR u.name LIKE ?)
     LIMIT ?`,
    [specialityId, searchQuery, searchQuery, parseInt(req.query.limit) || 5],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    }
  );
});







// API to add member(s) to group
// Update the add member route
router.post("/:id/member/:userId/add", (req, res) => {
  const groupId = req.params.id;
  const userId = req.params.userId; // This is actually student_id from the client
  const currentUserId = req.session.userId;

  checkGroupOwnership(groupId, currentUserId, (err, isOwner) => {
    if (err || !isOwner) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Directly use the student_id (no need for conversion)
    db.query(
      `INSERT IGNORE INTO collaborative_groups (subject_group_id, student_id) VALUES (?, ?)`,
      [groupId, userId], // userId here is actually student_id
      (err) => {
        if (err) {
          console.error("Error adding student:", err);
          return res.status(500).json({ error: "Помилка додавання студента" });
        }
        res.json({ success: true });
      }
    );
  });
});






router.post("/:id/members/:userId/delete", (req, res) => {
  const groupId = req.params.id;
  const userId = req.params.userId;
  checkGroupOwnership(groupId, req.session.userId, (err, isOwner) => {
    if (err || !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Convert user_id to student_id
    db.query(
      `SELECT student_id FROM students WHERE user_id = ?`,
      [userId],
      (err, results) => {
        if (err || !results.length) {
          return res.status(404).json({
            success: false,
            message: "Student not found",
          });
        }

        const studentId = results[0].student_id;
        db.query(
          `DELETE FROM collaborative_groups 
           WHERE subject_group_id = ? AND student_id = ?`,
          [groupId, studentId],
          (err) => {
            if (err) {
              return res.status(500).json({
                success: false,
                message: "Delete failed",
              });
            }

            if (req.xhr || req.headers.accept.indexOf("json") > -1) {
              return res.json({
                success: true,
                redirect: `/groups/${groupId}`,
              });
            } else {
              return res.redirect(`/groups/${groupId}`);
            }
          }
        );
      }
    );
  });
});








module.exports = router;
