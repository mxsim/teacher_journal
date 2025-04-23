-- db script query
DROP DATABASE IF EXISTS journaldb_test;

CREATE DATABASE IF NOT EXISTS journaldb_test;
USE journaldb_test;

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    parent_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULLa UNIQUE,
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
    description TEXT,
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

-- Table: collaborative_groups
CREATE TABLE IF NOT EXISTS collaborative_groups (
    collaborative_group_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_group_id INT NOT NULL,
    student_id INT NOT NULL,
    FOREIGN KEY (subject_group_id) REFERENCES subject_groups(subject_group_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);



-- Table to store lesson information
CREATE TABLE IF NOT EXISTS lessons (
    lesson_id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_date DATE,
    lesson_type ENUM('Lecture', 'Practical', 'Lab work', 'MK1', 'MK2') NOT NULL,
    subject_id INT,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
);


-- Table to store journal entries
CREATE TABLE IF NOT EXISTS journal (
    entry_id INT PRIMARY KEY,
    student_id INT,
    lesson_id INT,
    grade INT,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id)
);



-- Insert records into the users table
INSERT INTO users (name, surname, parent_name, email, password, role) VALUES
('Іван', 'Петров', 'Петрівна', 'ivan@example.com', 'пароль123', 'student'),
('Марія', 'Іванова', 'Іванівна', 'maria@example.com', 'абв123', 'student'),
('Олександр', 'Сидоренко', 'Сергійович', 'oleksandr@example.com', 'qwerty', 'teacher'),
('Наталія', 'Коваленко', 'Михайлівна', 'natalia@example.com', 'пароль123', 'teacher'),
('Олена', 'Литвиненко', 'Олександровна', 'olena@example.com', 'п@св0рд', 'admin'),
('Іван', 'Борисов', 'Іванович', 'ivan2@example.com', 'пароль123', 'student'),
('Петро', 'Петренко', 'Петрович', 'petro@example.com', 'пароль123', 'student'),
('Сергій', 'Сергієнко', 'Сергійович', 'sergey@example.com', 'пароль123', 'student'),
('Марина', 'Мариненко', 'Маринівна', 'marina@example.com', 'пароль123', 'student'),
('Олег', 'Олегов', 'Олегович', 'oleg@example.com', 'пароль123', 'student'),
('Марта', 'Мартиненко', 'Мартинівна', 'marta@example.com', 'пароль123', 'student'),
('Ірина', 'Петренко', 'Василівна', 'irina@example.com', 'пароль123', 'student'),
('Андрій', 'Коваленко', 'Андрійович', 'andriy@example.com', 'пароль123', 'student'),
('Ольга', 'Литвиненко', 'Олександрівна', 'olga@example.com', 'пароль123', 'student'),
('Павло', 'Павлов', 'Павлович', 'pavlo@example.com', 'пароль123', 'student'),
('Ірина', 'Іриненко', 'Іринівна', 'irina2@example.com', 'пароль123', 'student'),
('Андрій', 'Андрієнко', 'Андрійович', 'andriy2@example.com', 'пароль123', 'student'),
('Ольга', 'Олександренко', 'Олександрівна', 'olga2@example.com', 'пароль123', 'student'),
('Павло', 'Павлів', 'Павлович', 'pavlo2@example.com', 'пароль123', 'student'),
('Ірина', 'Іванів', 'Іванівна', 'irina3@example.com', 'пароль123', 'student'),
('Андрій', 'Андріян', 'Андрійович', 'andriy3@example.com', 'пароль123', 'student'),
('Ольга', 'Олегівна', 'Олександрівна', 'olga3@example.com', 'пароль123', 'student'),
('Павло', 'Павленко', 'Павлович', 'pavlo3@example.com', 'пароль123', 'student'),
('Віктор', 'Васильов', 'Вікторович', 'viktor@example.com', 'пароль123', 'student'),
('Наталія', 'Олексієнко', 'Наталівна', 'natalia2@example.com', 'пароль123', 'student'),
('Олена', 'Олексіївна', 'Василівна', 'olena2@example.com', 'пароль123', 'student'),
('Марина', 'Михайлівна', 'Миколаївна', 'marina2@example.com', 'пароль123', 'student'),
('Петро', 'Петренко', 'Петрович', 'petro2@example.com', 'пароль123', 'student');

-- Insert records into the teachers table
INSERT INTO teachers (user_id) VALUES
(3),
(4),
(4);

-- Insert records into the speciality table
INSERT INTO speciality (speciality_name) VALUES
('CS-21'),
('IPS-41'),
('IC-21'),
('UR-32'),
('IKN-31');

-- Insert records into the students table
INSERT INTO students (user_id, speciality_id, is_group_leader) VALUES
(1, 1, TRUE), 
(2, 1, FALSE),
(7, 1, FALSE),
(8, 2, TRUE),
(9, 2, FALSE),
(6, 3, TRUE), 
(3, 3, FALSE),
(4, 3, FALSE),
(5, 3, FALSE),
(10, 3, FALSE);

-- Insert records into the subjects table
INSERT INTO subjects (subject_name, teacher_id, description) VALUES
('Математика', 1, NULL),
('Українська мова', 2, NULL),
('Фізика', 1, NULL),
('Історія', 3, NULL),
('Програмування', 2, NULL);

-- Insert records into the subject_groups table (adjusted)
INSERT INTO subject_groups (subject_id, group_name) VALUES
(1, 'Група КП-Н21'), 
(1, 'Group B-2'),
(3, 'Group C-1'),
(5, 'Group A-1'),
(5, 'Group D-2');

-- Insert records into the collaborative_groups table
INSERT INTO collaborative_groups (subject_group_id, student_id) VALUES
(1, 1), -- Add student 1 to subject group 1
(1, 2), -- Add student 2 to subject group 1
(1, 3), -- Add student 3 to subject group 1
(2, 4), -- Add student 4 to subject group 2
(2, 5), -- Add student 5 to subject group 2
(2, 6); -- Add student 6 to subject group 2


-- Insert records into the lessons table
INSERT INTO lessons (lesson_date, lesson_type, subject_id) VALUES
('2024-04-10', 'Lecture', 1),
('2024-04-12', 'Practical', 1),
('2024-04-15', 'Lab work', 1),
('2023-04-18', 'MK1', 1),
('2024-04-20', 'MK2', 1),
('2024-05-01', 'Lecture', 2),
('2024-05-02', 'Practical', 2),
('2024-05-10', 'Lab work', 2),
('2023-05-21', 'MK1', 2),
('2024-05-15', 'MK2', 2);

-- Insert records into the journal table
INSERT INTO journal (entry_id, student_id, lesson_id, grade) VALUES
(1, 1, 1, 8), -- Lecture
(2, 2, 1, 7), -- Lecture
(3, 3, 2, 9), -- Lecture
(4, 4, 2, 8), -- Lecture
(5, 5, 3, 9), -- Practical
(6, 6, 3, 9), -- Practical
(7, 7, 4, 10), -- Lab work
(8, 8, 4, 8), -- Lab work
(9, 9, 5, 9), -- MK1
(10, 10, 5, 8); -- MK1
