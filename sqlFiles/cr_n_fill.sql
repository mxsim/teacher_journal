CREATE DATABASE IF NOT EXISTS journaldb;
USE journaldb;

-- Table: user
CREATE TABLE IF NOT EXISTS user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    parent_name VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    role ENUM('student', 'teacher', 'admin') NOT NULL
);

-- Table: subject
CREATE TABLE IF NOT EXISTS subject (
    subject_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    semester INT NOT NULL
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
    grade DECIMAL(5,2) NOT NULL,
    grade_date DATE NOT NULL,
    FOREIGN KEY (student_id) REFERENCES student(student_id),
    FOREIGN KEY (subject_id) REFERENCES subject(subject_id)
);

-- Table: student_group
CREATE TABLE IF NOT EXISTS student_group (
    group_id INT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(50) NOT NULL
);

-- Insert records into the user table
INSERT INTO user (name, surname, parent_name, password, role) VALUES
('Іван', 'Петров', 'Петрівна', 'пароль123', 'student'),
('Марія', 'Іванова', 'Іванович', 'абв123', 'student'),
('Олександр', 'Сидоренко', 'Григорович', 'qwerty', 'teacher'),
('Наталія', 'Коваленко', 'Михайлович', 'пароль123', 'teacher'),
('Олена', 'Литвиненко', 'Василівна', 'п@св0рд', 'admin');

-- Insert records into the subject table
INSERT INTO subject (subject_name, semester) VALUES
('Математика', 1),
('Українська мова', 2),
('Фізика', 1),
('Історія', 2),
('Програмування', 1);

-- Insert records into the teacher table
INSERT INTO teacher (user_id, subject_id) VALUES
(3, 1),
(4, 2),
(4, 3);

-- Insert records into the student table
INSERT INTO student (user_id, group_name) VALUES
(1, 'А'),
(2, 'Б');

-- Insert records into the grade table
INSERT INTO grade (student_id, subject_id, grade, grade_date) VALUES
(1, 1, 85, '2023-12-15'),
(1, 2, 78, '2023-12-17'),
(2, 1, 90, '2023-12-16'),
(2, 3, 82, '2023-12-18');

-- Insert records into the student_group table
INSERT INTO student_group (group_name) VALUES
('А'),
('Б');
