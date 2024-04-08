-- Drop tables if they exist
DROP DATABASE IF EXISTS journaldb;

CREATE DATABASE IF NOT EXISTS journaldb;
USE journaldb;

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    parent_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL,
    role ENUM('student', 'teacher', 'admin') NOT NULL
);

-- Table: teachers
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Table: subjects
CREATE TABLE IF NOT EXISTS subjects (
    subject_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    teacher_id INT NOT NULL,
    semester INT NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id)
);

-- Table: speciality
CREATE TABLE IF NOT EXISTS speciality (
    speciality_id INT AUTO_INCREMENT PRIMARY KEY,
    speciality_name VARCHAR(50) NOT NULL
);

-- Table: subject_groups (adjusted)
CREATE TABLE IF NOT EXISTS subject_groups (
    subject_group_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    group_name VARCHAR(50) NOT NULL,  -- Change from group_id to group_name
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
);

-- Table: students
CREATE TABLE IF NOT EXISTS students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    speciality_id INT NOT NULL,
    is_group_leader BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (speciality_id) REFERENCES speciality(speciality_id)
);

-- Table: grades
CREATE TABLE IF NOT EXISTS grades (
    grade_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    grade DECIMAL(5,2) NOT NULL,
    grade_date DATE NOT NULL,
    lesson_type ENUM('Lecture', 'Practical', 'Lab work', 'MK1', 'MK2') NOT NULL, -- Added
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
);

-- Insert records into the users table
INSERT INTO users (name, surname, parent_name, email, password, role) VALUES
('Іван', 'Петров', 'Петрівна', 'ivan@example.com', 'пароль123', 'student'),
('Марія', 'Іванова', 'Іванович', 'maria@example.com', 'абв123', 'student'),
('Олександр', 'Сидоренко', 'Григорович', 'oleksandr@example.com', 'qwerty', 'teacher'),
('Наталія', 'Коваленко', 'Михайлович', 'natalia@example.com', 'пароль123', 'teacher'),
('Олена', 'Литвиненко', 'Василівна', 'olena@example.com', 'п@св0рд', 'admin'),
('Іван', 'Борисов', 'Іванович', 'ivan2@example.com', 'пароль123', 'student'),
('Петро', 'Петренко', 'Петрович', 'petro@example.com', 'пароль123', 'student'),
('Сергій', 'Сергієнко', 'Сергійович', 'sergey@example.com', 'пароль123', 'student'),
('Марина', 'Мариненко', 'Маринівна', 'marina@example.com', 'пароль123', 'student'),
('Олег', 'Олегов', 'Олегович', 'oleg@example.com', 'пароль123', 'student'),
('Марта', 'Мартиненко', 'Мартинівна', 'marta@example.com', 'пароль123', 'student');

-- Insert records into the teachers table
INSERT INTO teachers (user_id) VALUES
(3),
(4),
(4);

-- Insert records into the speciality table
INSERT INTO speciality (speciality_name) VALUES
('Group A'),
('Group B'),
('Group C');

-- Insert records into the students table
INSERT INTO students (user_id, speciality_id, is_group_leader) VALUES
(1, 1, TRUE), -- Assuming user_id 1 is the group leader for Group A
(2, 1, FALSE),
(7, 1, FALSE),
(8, 2, TRUE), -- Assuming user_id 8 is the group leader for Group B
(9, 2, FALSE),
(6, 3, TRUE), -- Assuming user_id 6 is the group leader for Group C
(3, 3, FALSE),
(4, 3, FALSE),
(5, 3, FALSE),
(10, 3, FALSE);

-- Insert records into the subjects table
INSERT INTO subjects (subject_name, teacher_id, semester) VALUES
('Математика', 1, 1),
('Українська мова', 2, 2),
('Фізика', 1, 1),
('Історія', 3, 2),
('Програмування', 2, 1);

-- Insert records into the subject_groups table (adjusted)
INSERT INTO subject_groups (subject_id, group_name) VALUES
(1, 'Group A'), -- Matematika in Group A
(1, 'Group B'), -- Matematika in Group B
(3, 'Group C'), -- Physics in Group C
(5, 'Group A'), -- Programming in Group A
(5, 'Group B'); -- Programming in Group B

-- Insert records into the grades table
INSERT INTO grades (student_id, subject_id, grade, grade_date, lesson_type) VALUES
(1, 1, 2, '2023-12-15', 'Lecture'),
(1, 2, 3, '2023-12-17', 'Practical'),
(2, 1, 4, '2023-12-16', 'Lecture'),
(2, 3, 4, '2023-12-18', 'Lab work');
