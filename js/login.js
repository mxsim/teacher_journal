// login.js
const express = require('express');
const router = express.Router();
const connection = require('../config/db');

// Route handler for rendering the login page
router.get('/', (req, res) => {
  console.log("Rendering login page");
  res.render('login'); // Assuming your login page is named 'login.hbs'
});

// Route handler for processing login data
router.post('/', (req, res) => {
  const { email, password } = req.body;

  console.log("Processing login request for email:", email);

  connection.query(
    'SELECT user_id, role FROM users WHERE email = ? AND password = ?',
    [email, password],
    (err, results) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).send('Internal Server Error');
      }
      if (results.length === 0) {
        console.log("Invalid credentials for email:", email);
        return res.status(401).send('Invalid credentials');
      }

      const user = results[0];

      console.log("Login successful for email:", email, "with role:", user.role);

      // Store the user's ID and role in the session
      req.session.userId = user.user_id;
      req.session.role = user.role;

      // Redirect to the appropriate dashboard based on the user's role
      switch (user.role) {
        case 'admin':
          console.log("Redirecting to admin_dashboard for email:", email);
          res.redirect('/admin_dashboard');
          break;
        case 'teacher':
          console.log("Redirecting to teacher_dashboard for email:", email);
          res.redirect('/teacher_dashboard');
          break;
        case 'student':
          console.log("Redirecting to student_dashboard for email:", email);
          res.redirect("/student_dashboard");
          break;
        default:
          console.log("Invalid role for email:", email);
          res.status(403).send('Forbidden');
      }
    }
  );
});

module.exports = router;
