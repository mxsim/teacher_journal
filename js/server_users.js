const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
  console.log("Server: GET /users; Rendering users page.");

  const searchQuery = req.query.search || "";
  const roleFilter = req.query.role || "all";

  const roleSql = `SELECT DISTINCT role FROM users`;
  db.query(roleSql, (err, rolesResult) => {
    if (err) {
      console.error("Error fetching roles:", err);
      return res.status(500).send("Error fetching roles");
    }

    const roles = rolesResult.map((r) => r.role);
    roles.unshift("all");

    let usersSql = `
      SELECT u.*, s.speciality_abbreviation
      FROM users u
      LEFT JOIN students st ON u.user_id = st.user_id
      LEFT JOIN speciality s ON st.speciality_id = s.speciality_id
      WHERE (u.name LIKE ? OR u.surname LIKE ? OR u.parent_name LIKE ?)
    `;
    const params = [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`];

    if (roleFilter !== "all") {
      usersSql += " AND u.role = ?";
      params.push(roleFilter);
    }

    db.query(usersSql, params, (err, results) => {
      if (err) {
        console.error("Error fetching users:", err);
        return res.status(500).send("Error fetching users");
      }

      const users = results.map((user) => {
        const profileImagePath = user.user_profile_image?.trim()
          ? `/uploads/users/profile_data/${user.user_profile_image.trim()}`
          : "/img/default-profile.png"; // Використовуємо дефолтне зображення, якщо відсутнє

        return {
          ...user,
          user_profile_image: profileImagePath, // Формуємо коректний шлях
          isStudent: user.role === "student",
          // Додаємо спеціальність лише для студентів
          specialization:
            user.role === "student" ? user.speciality_abbreviation : null,
        };
      });

      res.render("users", {
        users,
        roles,
        selectedRole: roleFilter,
        searchQuery,
      });
    });
  });
});

module.exports = router;
