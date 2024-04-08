-- Use the journaldb database
USE journaldb;

-- Query to fetch data from the tables
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
    MONTH(g.grade_date) = '3' AND
    YEAR(g.grade_date) = '2023' AND
    stu.group_id = (SELECT group_id FROM student_groups WHERE group_name = 'Group A') AND
    s.subject_name = 'Історія';
