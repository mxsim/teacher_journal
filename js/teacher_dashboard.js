// teacher_dashboard.js
const express = require("express");
const router = express.Router();
const connection = require("../config/db"); // Import your MySQL connection

// Route handler for /teacher_dashboard
router.get("/", (req, res) => {
  console.log(
    "SERVER | teacher_dashboard.js : Checking user authentication for teacher dashboard"
  );

  const userId = req.session.userId;

  // Query the database to get the user's data
  connection.query(
    "SELECT user_id, name, surname, parent_name, role FROM users WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("SERVER | teacher_dashboard.js : Error:", err);
        return res
          .status(500)
          .send("SERVER | teacher_dashboard.js : Internal Server Error");
      }
      if (results.length === 0) {
        console.log(
          "SERVER | teacher_dashboard.js : User not found in the database"
        );
        return res.status(401).send("User not found");
      }

      const userData = results[0];

      console.log("SERVER | teacher_dashboard.js : User data:", userData);

      // Set the layout to teacher.hbs
      // res.locals.layout = "main";

      // Render the teacher dashboard with the user's data
      res.render("teacher/t_teacher_dashboard", {
        userData: userData,
        user_id: req.session.userId,
        role: req.session.role,
        title: "Teacher Dashboard",
        scripts: ["teacher/ee", "teacher_ee"], // Load multiple JS files
        styles: ["styles"], // Additional CSS if needed
      });
    }
  );
});

module.exports = router;
