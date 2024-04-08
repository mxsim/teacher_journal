CREATE DATABASE IF NOT EXISTS journaldb;
USE journaldb;

-- Table: user
CREATE TABLE IF NOT EXISTS user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    parent_name VARCHAR(100),
    password VARCHAR(50) NOT NULL,
    role ENUM('student', 'teacher', 'admin') NOT NULL
);

-- Table: subject
CREATE TABLE IF NOT EXISTS subject (
    subject_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    semester ENUM('Spring', 'Summer', 'Fall', 'Winter') NOT NULL
);

-- Table: teacher
CREATE TABLE IF NOT EXISTS teacher (
    teacher_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (subject_id) REFERENCES subject(subject_id)
);

-- Table: student
CREATE TABLE IF NOT EXISTS student (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    group_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

-- Table: grade
CREATE TABLE IF NOT EXISTS grade (
    grade_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    grade DECIMAL(4,2) NOT NULL,
    grade_date DATE NOT NULL,
    FOREIGN KEY (student_id) REFERENCES student(student_id),
    FOREIGN KEY (subject_id) REFERENCES subject(subject_id)
);
