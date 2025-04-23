const express = require("express");
const router = express.Router();
const connection = require("../config/db"); // Assuming you have a file for database configuration

// Route handler for rendering the journal page
router.get("/", async (req, res) => {
  try {
    const userId = req.session.userId; // Assuming userId is stored in session

    // hello changes to test in github

    // Fetch other data needed for the journal page
    const subjectGroups = await getSubjectGroups();
    //const gradeDates = await getGradeDates();

    const months = await getMonths();
    const years = await getYears();
    const groups = await getGroups();
    const subjects = await getSubjects(userId);
    const students = await getStudents(groups);

    // Convert arrays to JSON strings
    const monthsJSON = JSON.stringify(months);
    const yearsJSON = JSON.stringify(years);
    const groupsJSON = JSON.stringify(groups);
    const subjectsJSON = JSON.stringify(subjects);

    // Render the journal page
    res.render("journal", {
      months: monthsJSON,
      years: yearsJSON,
      groups: groupsJSON,
      subjects: subjectsJSON,
      subjectGroups,
      students,
      //gradeDates,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route handler for updating subject groups based on the selected subject
router.get("/updateSubjectGroups", async (req, res) => {
  const { subjectId } = req.query;
  try {
    // Fetch subject groups based on the selected subject
    const subjectGroups = await getSubjectGroupsBySubjectId(subjectId);
    res.json(subjectGroups);
  } catch (error) {
    console.error("Error fetching subject groups:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/data", async (req, res) => {
  const { month, year, group, subject } = req.query;
  try {
    const journalData = await getJournalData(month, year, group, subject);
    const testSumData = await getTestSumData(group, subject);
    const overallSumData = await getOverallSumData(group, subject);

    res.json({ journalData, testSumData, overallSumData });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/all_data", async (req, res) => {
  const { year, group, subject } = req.query;
  try {
    const allPeriodData = await getAllPeriodData(year, group, subject);
    const testSumData = await getTestSumData(group, subject);
    const overallSumData = await getOverallSumData(group, subject);

    res.json({ allPeriodData, testSumData, overallSumData });
  } catch (error) {
    console.error("Error fetching all period data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

async function getJournalData(month, year, group, subject) {
  const monthMap = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  const monthInt = monthMap[month];

  return new Promise((resolve, reject) => {
    const query = `
SELECT CONCAT(u.name, ' ', u.surname, ' ', u.parent_name) AS students,
       l.lesson_date,
       l.lesson_type,
       COALESCE(j.grade, '') AS grade
FROM users u
JOIN students s ON u.user_id = s.user_id
JOIN collaborative_groups cg ON s.student_id = cg.student_id
JOIN subject_groups sg ON cg.subject_group_id = sg.subject_group_id
JOIN subjects sub ON sg.subject_id = sub.subject_id
JOIN lessons l ON sub.subject_id = l.subject_id
LEFT JOIN journal j ON s.student_id = j.student_id AND l.lesson_id = j.lesson_id
WHERE sub.subject_name = ?
  AND sg.group_name = ?
  AND MONTH(l.lesson_date) = ?
  AND YEAR(l.lesson_date) = ?

    `;

    connection.query(
      query,
      [subject, group, monthInt, year],
      (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          reject(err);
        } else {
          //console.log("Query results:", results);
          resolve(results);
        }
      }
    );
  });
}

async function getAllPeriodData(year, group, subject) {
  const query = `
     SELECT CONCAT(u.name, ' ', u.surname, ' ', u.parent_name) AS students,
       l.lesson_date,
       l.lesson_type,
       COALESCE(j.grade, '') AS grade
FROM users u
JOIN students s ON u.user_id = s.user_id
JOIN collaborative_groups cg ON s.student_id = cg.student_id
JOIN subject_groups sg ON cg.subject_group_id = sg.subject_group_id
JOIN subjects sub ON sg.subject_id = sub.subject_id
JOIN lessons l ON sub.subject_id = l.subject_id
LEFT JOIN journal j ON s.student_id = j.student_id AND l.lesson_id = j.lesson_id
WHERE sub.subject_name = ?
  AND sg.group_name = ?
  AND YEAR(l.lesson_date) = ?

    `;

  return new Promise((resolve, reject) => {
    connection.query(query, [subject, group, year], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        reject(err);
      } else {
        //console.log("Query results:", results);
        resolve(results); // Resolve with data retrieved from the database
      }
    });
  });
}

async function getTestSumData(groupName, subjectName) {
  const query = `
    SELECT
      CONCAT(u.name, ' ', u.surname, ' ', u.parent_name) AS students,
      SUM(j.grade) AS test_sum
    FROM
      users u
    JOIN
      students s ON u.user_id = s.user_id
    JOIN
      collaborative_groups cg ON s.student_id = cg.student_id
    JOIN
      subject_groups sg ON cg.subject_group_id = sg.subject_group_id
    JOIN
      journal j ON s.student_id = j.student_id
    JOIN
      lessons l ON j.lesson_id = l.lesson_id
    JOIN
      subjects sub ON l.subject_id = sub.subject_id
    WHERE
      sg.group_name = ? AND
      sub.subject_name = ? AND
      l.lesson_type IN ('MK1', 'MK2')
    GROUP BY
      s.student_id;
  `;

  return new Promise((resolve, reject) => {
    connection.query(query, [groupName, subjectName], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

async function getOverallSumData(groupName, subjectName) {
  const query = `
    SELECT
      CONCAT(u.name, ' ', u.surname, ' ', u.parent_name) AS students,
      SUM(j.grade) AS overall_sum
    FROM
      users u
    JOIN
      students s ON u.user_id = s.user_id
    JOIN
      collaborative_groups cg ON s.student_id = cg.student_id
    JOIN
      subject_groups sg ON cg.subject_group_id = sg.subject_group_id
    JOIN
      journal j ON s.student_id = j.student_id
    JOIN
      lessons l ON j.lesson_id = l.lesson_id
    JOIN
      subjects sub ON l.subject_id = sub.subject_id
    WHERE
      sg.group_name = ? AND
      sub.subject_name = ?
    GROUP BY
      s.student_id;
  `;

  return new Promise((resolve, reject) => {
    connection.query(query, [groupName, subjectName], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

router.get("/get_lessons", (req, res) => {
  const subjectName = req.query.subjectName;

  try {
    const sql = `
      SELECT l.lesson_id, l.lesson_date, l.lesson_type
      FROM lessons l
      INNER JOIN subjects s ON l.subject_id = s.subject_id
      WHERE s.subject_name = ?
    `;
    connection.query(sql, [subjectName], (error, results) => {
      if (error) {
        throw error;
      }
      res.json(results);
    });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Function to fetch subject groups based on the selected subject
async function getSubjectGroupsBySubjectId(subjectId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT sg.subject_group_id, sg.group_name
FROM subject_groups sg
INNER JOIN subjects s ON sg.subject_id = s.subject_id
WHERE s.subject_name = ?
    `;
    connection.query(query, [subjectId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

async function getStudents(groups) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT CONCAT(u.name, ' ', u.surname) AS full_name, u.parent_name
      FROM users u
      JOIN students s ON u.user_id = s.user_id
      JOIN collaborative_groups cg ON s.student_id = cg.student_id
      JOIN subject_groups sg ON cg.subject_group_id = sg.subject_group_id
      WHERE sg.group_name IN (?);
    `;
    connection.query(query, [groups], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

async function getLessons(month, year, subject) {
  const monthMap = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  const monthInt = monthMap[month];

  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT lesson_date
      FROM lessons
      WHERE subject_id = (SELECT subject_id FROM subjects WHERE subject_name = ?)
        AND MONTH(lesson_date) = ?
        AND YEAR(lesson_date) = ?;
    `;

    connection.query(query, [subject, monthInt, year], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        reject(err);
      } else {
        //console.log("Query results:", results);
        resolve(results);
      }
    });
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

async function getSubjectGroups() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT sg.subject_id, sg.subject_group_id, s.subject_name, g.group_name
      FROM subject_groups sg
      INNER JOIN subjects s ON sg.subject_id = s.subject_id
      INNER JOIN subject_groups g ON sg.subject_group_id = g.subject_group_id
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

async function getMonths() {
  return new Promise((resolve, reject) => {
    const query =
      "SELECT DISTINCT MONTHNAME(lesson_date) AS month FROM lessons;";
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

async function getYears() {
  return new Promise((resolve, reject) => {
    const query =
      "SELECT DISTINCT DATE_FORMAT(lesson_date, '%Y') AS year FROM lessons;";
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
async function getGroups() {
  return new Promise((resolve, reject) => {
    const query = "SELECT group_name FROM subject_groups;";
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

module.exports = router;
