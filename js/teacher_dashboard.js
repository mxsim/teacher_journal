// teacher_dashboard.js
const express = require("express");
const router = express.Router();
const connection = require("../config/db"); // Import your MySQL connection

// Route handler for /teacher_dashboard
router.get("/", (req, res) => {
  console.log("Checking user authentication for teacher dashboard");

  const userId = req.session.userId;

  // Query the database to get the user's data
  connection.query(
    "SELECT name, surname, parent_name, role FROM users WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).send("Internal Server Error");
      }
      if (results.length === 0) {
        console.log("User not found in the database");
        return res.status(401).send("User not found");
      }

      const userData = results[0];

      console.log("User data:", userData);

      // Set the layout to teacher.hbs
      res.locals.layout = "main_layout";

      // Render the teacher dashboard with the user's data
      res.render("teacher_dashboard", { userData: userData });
    }
  );
});



module.exports = router;
