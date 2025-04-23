// grades.js
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser"); // Import body-parser module
const connection = require("../config/db"); // Import the database connection

// Use bodyParser middleware to parse JSON data
router.use(bodyParser.json());

router.post("/add", async (req, res) => {
  try {
    // Extract data from the request body
    const { subject, student, date, lessonType, grade } = req.body;

    // Split the student data into name, surname, and parent name
    const [name, surname, parentName] = student.split(" ");

    // Perform database operations to insert the grade
    const query = `
      INSERT INTO journal (student_id, lesson_id, grade)
      SELECT s.student_id, l.lesson_id, ?
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      JOIN lessons l ON u.name = ? AND u.surname = ? AND u.parent_name = ?
      JOIN subjects sub ON l.subject_id = sub.subject_id AND sub.subject_name = ?
      WHERE l.lesson_date = ? AND l.lesson_type = ?;`
    ;

    connection.query(
      query, // <-- Use the query string directly here
      [grade, name, surname, parentName, subject, date, lessonType],
      (error, results) => {
        if (error) {
          if (error.code === "ER_SIGNAL_EXCEPTION") {
            // Handle trigger error
            return res.status(400).json({ error: error.message });
          } else {
            // Handle other errors
            console.error("Error adding grade:", error);
            return res
              .status(500)
              .json({ success: false, message: "Failed to add grade" });
          }
        }
        res.json(results);
      }
    );
  } catch (error) {
    console.error("Error adding grade:", error);
    res.status(500).json({ success: false, message: "Failed to add grade" });
  }
});


// Server-side route for updating a grade
router.put("/update", async (req, res) => {
  try {
    // Extract data from the request body
    const { student, subject, date, lessonType, newGrade } = req.body;

    const [user_name, user_surname, user_parentName] = student.split(" ");

    // Perform database operation to update the grade entry
    const query = `
      UPDATE journal
      SET grade = ?
      WHERE student_id = (
          SELECT s.student_id
          FROM students s
          JOIN users u ON s.user_id = u.user_id
          WHERE u.name = ? AND u.surname = ? AND u.parent_name = ?
      )
      AND lesson_id = (
          SELECT l.lesson_id
          FROM lessons l
          JOIN subjects sub ON l.subject_id = sub.subject_id
          WHERE sub.subject_name = ? AND l.lesson_date = ? AND l.lesson_type = ?
      );`
    ;

    connection.query(
      query,
      [newGrade, user_name, user_surname, user_parentName, subject, date, lessonType],
      (error, results) => {
        if (error) {
          throw error;
        }
        res.json(results);
      }
    );
  } catch (error) {
    console.error("Error updating grade:", error);
    res.status(500).json({ success: false, message: "Failed to update grade" });
  }
});




// Server-side route for deleting a grade
router.delete("/delete", async (req, res) => {
  try {
    // Extract data from the request body
    const { student, subject, date, lessonType } = req.body;

    const [user_name, user_surname, user_parent_name] = student.split(" ");

    // Perform database operation to delete the grade entry
    const query = `
      DELETE FROM journal
      USING journal
      JOIN students s ON journal.student_id = s.student_id
      JOIN users u ON s.user_id = u.user_id
      JOIN lessons l ON journal.lesson_id = l.lesson_id
      JOIN subjects sub ON l.subject_id = sub.subject_id
      WHERE u.name = ? 
        AND u.surname = ? 
        AND u.parent_name = ? 
        AND l.lesson_date = ? 
        AND l.lesson_type = ?
        AND sub.subject_name = ?;`
    ;

    connection.query(
      query, // <-- Use the query string directly here
      [user_name, user_surname, user_parent_name, date, lessonType, subject],
      (error, results) => {
        if (error) {
          throw error;
        }
        res.json(results);
      }
    );
  } catch (error) {
    console.error("Error adding grade:", error);
    res.status(500).json({ success: false, message: "Failed to add grade" });
  }
});
































// Route to get subjects
router.get("/get_subjects", (req, res) => {
  const userId = req.session.userId;

  try {
    const sql = `
      SELECT s.* 
      FROM subjects s
      INNER JOIN teachers t ON s.teacher_id = t.teacher_id
      WHERE t.user_id = ?`
    ;
    connection.query(sql, [userId], (error, results) => {
      if (error) {
        throw error;
      }
      res.json(results);
    });
  } catch (error) {
    console.error("Error fetching lesson subjects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to get collaborative groups for a specific subject
router.get("/get_student_groups", (req, res) => {
  const subjectName = req.query.subjectName;

  try {
    const sql = `
      SELECT sg.group_name AS collaborative_group_name
      FROM subjects s
      JOIN subject_groups sg ON s.subject_id = sg.subject_id
      WHERE s.subject_name = ?`
    ;
    connection.query(sql, [subjectName], (error, results) => {
      if (error) {
        throw error;
      }
      res.json(results);
    });
  } catch (error) {
    console.error("Error fetching collaborative groups:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to get students from a specific collaborative group
router.get("/get_students", (req, res) => {
  const studentGroupName = req.query.studentGroupName;

  try {
    const sql = `
      SELECT CONCAT(u.name, ' ', u.surname, ' ', u.parent_name) AS student
      FROM collaborative_groups cg
      JOIN students s ON cg.student_id = s.student_id
      JOIN users u ON s.user_id = u.user_id
      JOIN subject_groups sg ON cg.subject_group_id = sg.subject_group_id
      WHERE sg.group_name = ?`
    ;
    connection.query(sql, [studentGroupName], (error, results) => {
      if (error) {
        throw error;
      }
      res.json(results);
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to get unique lesson types from lesson records
router.get("/get_lesson_types", (req, res) => {
  try {
    const sql = `
      SELECT DISTINCT lesson_type
      FROM lessons;`
    ;
    connection.query(sql, (error, results) => {
      if (error) {
        throw error;
      }
      res.json(results);
    });
  } catch (error) {
    console.error("Error fetching lesson types:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;