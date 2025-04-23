const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser"); // Import body-parser module
const connection = require("../config/db"); // Import the database connection

// Use bodyParser middleware to parse JSON data
router.use(bodyParser.json());

// Route handler for rendering the journal page
router.get("/", async (req, res) => {
    console.log("lessons initialization")

});


router.post("/add", async (req, res) => {
  let { lesson_subject, lesson_date, lesson_type } = req.body;

  // Convert MM/DD/YYYY to YYYY-MM-DD format
  const dateParts = lesson_date.split("/");
  lesson_date = `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`;

  try {
    // Check if the lesson already exists in the database
    const lessonExists = await checkIfLessonExists(
      lesson_date,
      lesson_type,
      lesson_subject
    );

    if (lessonExists) {
      return res.status(400).json({ error: "Lesson already exists." });
    }

    // If the lesson doesn't exist, add it to the database
    await addLessonToDatabase(lesson_subject, lesson_date, lesson_type);

    // Return success message to the client
    res.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to get lesson types
router.get("/get_lesson_types", (req, res) => {
  try {
    const sql = `SELECT DISTINCT lesson_type FROM lessons;`;
    connection.query(sql, (error, results) => {
      if (error) {
        throw error;
      }
      const types = results.map((result) => result.lesson_type);
      res.json(types);
    });
  } catch (error) {
    console.error("Error fetching lesson types:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to get lesson subjects
router.get("/get_subjects", (req, res) => {
  const userId = req.session.userId; // Assuming userId is stored in session

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

// Function to check if a lesson exists in the database
function checkIfLessonExists(lessonDate, lessonType, subjectName) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT COUNT(*) AS lessonCount
      FROM lessons
      WHERE lesson_date = STR_TO_DATE(?, '%Y-%m-%d')
      AND lesson_type = ?
      AND subject_id = (
        SELECT subject_id
        FROM subjects
        WHERE subject_name = ?
      )
    ;`
    connection.query(
      sql,
      [lessonDate, lessonType, subjectName],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results[0].lessonCount > 0);
        }
      }
    );
  });
}

// Function to add a lesson to the database
function addLessonToDatabase(lesson_subject, lesson_date, lesson_type) {
  return new Promise((resolve, reject) => {
    // Your logic to add the lesson to the database
    // You would need to implement this logic based on your database structure
    const query = `INSERT INTO lessons (lesson_date, lesson_type, subject_id) VALUES (?, ?, ?)`;
    connection.query(
      query,
      [lesson_date, lesson_type, lesson_subject],
      (error, results, fields) => {
        if (error) {
          reject(error);
        } else {
          console.log("Lesson added successfully.");
          resolve();
        }
      }
    );
  });
}


async function getSubjects(userId) {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT teacher_id FROM teachers WHERE user_id = ?",
      [userId],
      (error, results, fields) => {
        if (error) {
          reject(error);
          return;
        }
        if (results.length === 0) {
          reject("User is not a teacher");
          return;
        }
        const teacherId = results[0].teacher_id;
        connection.query(
          "SELECT subject_name FROM subjects WHERE teacher_id = ?",
          [teacherId],
          (error, results, fields) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(results.map((result) => result.subject_name));
          }
        );
      }
    );
  });
}



module.exports = router;