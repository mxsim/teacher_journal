// journal.js
const express = require("express");
const router = express.Router();
const connection = require("../config/db"); // Assuming you have a file for database configuration

// Route handler for rendering the journal page
router.get("/", async (req, res) => {
  try {
    // Fetch other data needed for the journal page
    const subjectGroups = await getSubjectGroups();
    const students = await getStudents();
    const dates = await getDates();
    const gradeDates = await getGradeDates();

    const months = await getMonths();
    const years = await getYears();
    const groups = await getGroups();
    const subjects = await getSubjects();

    // Convert arrays to JSON strings
    const monthsJSON = JSON.stringify(months);
    const yearsJSON = JSON.stringify(years);
    const groupsJSON = JSON.stringify(groups);
    const subjectsJSON = JSON.stringify(subjects);

    // Render the journal page template with the fetched data
    res.render("journal", {
      months: monthsJSON,
      years: yearsJSON,
      groups: groupsJSON,
      subjects: subjectsJSON,
      subjectGroups,
      students,
      dates,
      gradeDates,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// async function getJournalData() {
//   return new Promise((resolve, reject) => {
//     const query = `
//             SELECT
//                 CONCAT(u.name, ' ', u.surname) AS studentName,
//                 CONCAT(u.parent_name) AS parentName,
//                 s.subject_name AS subjectName,
//                 g.grade,
//                 g.grade_date
//             FROM
//                 students stu
//             INNER JOIN
//                 users u ON stu.user_id = u.user_id
//             INNER JOIN
//                 grades g ON stu.student_id = g.student_id
//             INNER JOIN
//                 subjects s ON g.subject_id = s.subject_id;
//         `;
//     connection.query(query, (err, results) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// }
// Handle GET request to fetch journal data
router.get("/data", async (req, res) => {
  const { month, year, group, subject } = req.query;
  try {
    // Fetch journal data from the database based on the selected criteria
    const journalData = await getJournalData(month, year, group, subject);
    res.json(journalData);
  } catch (error) {
    console.error("Error fetching journal data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

async function getJournalData(month, year, group, subject) {
  return new Promise((resolve, reject) => {
    // Print selected criteria
    console.log("Selected Month:", month);
    console.log("Selected Year:", year);
    console.log("Selected Group:", group);
    console.log("Selected Subject:", subject);

    // Your SQL query to fetch journal data based on the selected criteria
    const query = `
      SELECT 
        CONCAT(u.name, ' ', u.surname) AS studentName,
        CONCAT(u.parent_name) AS parentName,
        s.subject_name AS subjectName,
        g.grade,
        g.grade_date
      FROM 
        students stu
      INNER JOIN 
        users u ON stu.user_id = u.user_id
      INNER JOIN 
        grades g ON stu.student_id = g.student_id
      INNER JOIN 
        subjects s ON g.subject_id = s.subject_id
      INNER JOIN 
        subject_groups sg ON s.subject_id = sg.subject_id
      WHERE 
        MONTH(g.grade_date) = ? AND
        YEAR(g.grade_date) = ? AND
        stu.group_id = (SELECT group_id FROM student_groups WHERE group_name = ?) AND
        s.subject_name = ?;
    `;

    // Print the SQL query with parameters
    console.log("Query:", query);
    console.log("Parameters:", [month, year, group, subject]);

    connection.query(query, [month, year, group, subject], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        reject(err);
      } else {
        console.log("Query results:", results);
        resolve(results); // Resolve with data retrieved from the database
      }
    });
  });
}

// Function to update grade in the database
async function updateGradeInDatabase(grade) {
  return new Promise((resolve, reject) => {
    const { studentId, subjectId, gradeValue, gradeDate } = grade;
    const query = `
            INSERT INTO grades (student_id, subject_id, grade, grade_date)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE grade = VALUES(grade), grade_date = VALUES(grade_date);
        `;
    connection.query(
      query,
      [studentId, subjectId, gradeValue, gradeDate],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

// Function to fetch subject groups from the database
async function getSubjectGroups() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT sg.subject_id, sg.group_id, s.subject_name, g.group_name
      FROM subject_groups sg
      INNER JOIN subjects s ON sg.subject_id = s.subject_id
      INNER JOIN student_groups g ON sg.group_id = g.group_id
    `;
    connection.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Function to fetch students from the database
async function getStudents() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT student_id, name
      FROM students
      INNER JOIN users ON students.user_id = users.user_id
    `;
    connection.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Function to fetch dates for the current month
async function getDates() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // Months are 0-indexed
  const daysInMonth = new Date(year, month, 0).getDate();
  const dates = [];
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(
      `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`
    );
  }
  return dates;
}

// Function to fetch dates when grades were put from the database
async function getGradeDates() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT YEAR(grade_date) AS year, MONTHNAME(grade_date) AS month
      FROM grades
      ORDER BY year DESC, MONTH(grade_date) DESC
    `;
    connection.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Function to fetch months from the database
async function getMonths() {
  return new Promise((resolve, reject) => {
    // Your SQL query to fetch distinct months from the 'grades' table
    const query = "SELECT DISTINCT MONTHNAME(grade_date) AS month FROM grades;";
    connection.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        const months = results.map((result) => result.month);
        resolve(months);
      }
    });
  });
}

// Function to fetch years from the database
async function getYears() {
  return new Promise((resolve, reject) => {
    // Your SQL query to fetch distinct years from the relevant table
    const query = "SELECT DISTINCT YEAR(grade_date) AS year FROM grades;";
    connection.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        const years = results.map((result) => result.year);
        resolve(years);
      }
    });
  });
}
// Function to fetch groups from the database
async function getGroups() {
  return new Promise((resolve, reject) => {
    const query = "SELECT group_name FROM student_groups;";
    connection.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        const groups = results.map((result) => result.group_name);
        resolve(groups);
      }
    });
  });
}

// Function to fetch subjects from the database
async function getSubjects() {
  return new Promise((resolve, reject) => {
    const query = "SELECT subject_name FROM subjects;";
    connection.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        const subjects = results.map((result) => result.subject_name);
        resolve(subjects);
      }
    });
  });
}

module.exports = router;
