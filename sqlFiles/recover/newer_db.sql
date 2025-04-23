-- db_test_2 | 19:55, 3/9/2025

-- 19:55, 3/9/2025 : added material type in subject_materials


DROP DATABASE IF EXISTS journaldb_test;

CREATE DATABASE IF NOT EXISTS journaldb_test;
USE journaldb_test;

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    parent_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL,
    user_description TEXT DEFAULT NULL,
    user_profile_image VARCHAR(255) DEFAULT NULL,
    role ENUM('student', 'teacher', 'admin') NOT NULL
);


-- Table: teachers
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Table: departments
CREATE TABLE IF NOT EXISTS departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(255) NOT NULL UNIQUE,
    department_head_id INT DEFAULT NULL,
    FOREIGN KEY (department_head_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Table: teacher_departments
CREATE TABLE IF NOT EXISTS teacher_departments (
    teacher_id INT NOT NULL,
    department_id INT NOT NULL,
    PRIMARY KEY (teacher_id, department_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE
);



-- Table: subjects
CREATE TABLE IF NOT EXISTS subjects (
    subject_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    teacher_id INT NOT NULL,
    department_id INT NOT NULL,
    description TEXT,
    subject_photo VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- Table: speciality
CREATE TABLE IF NOT EXISTS speciality (
    speciality_id INT AUTO_INCREMENT PRIMARY KEY,
    speciality_name VARCHAR(100) NOT NULL UNIQUE,
    speciality_abbreviation VARCHAR(10) NOT NULL UNIQUE,
    department_id INT NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
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

-- Table: subject_groups
CREATE TABLE IF NOT EXISTS subject_groups (
    subject_group_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    group_name VARCHAR(50) NOT NULL,
    subject_group_photo VARCHAR(255) DEFAULT NULL,
    teacher_id INT NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id),
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
);

CREATE TABLE IF NOT EXISTS subject_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    material_type ENUM('lecture', 'task', 'additional') NOT NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE
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

-----------------------------------------------------
-- Data Insertion
-----------------------------------------------------

-- Insert records into the users table
INSERT INTO users (name, surname, parent_name, email, password, user_description, user_profile_image, role) VALUES
('Іван', 'Петров', 'Петрівна', 'ivan@example.com', 'пароль123', 'Старанний студент, зацікавлений у програмуванні.', '', 'student'),
('Петро', 'Субач', 'Григорович', 'petr@example.com', 'пароль123', 'голова кафедри копм наук, люблю компютери.', '', 'teacher'),
('Лариса', 'Черук', 'Іванівна', 'larysa1@example.com', 'пароль123', 'люблю землю, тисяча досягнень у землеїдстві', '', 'teacher'),
('Марія', 'Іванова', 'Іванівна', 'maria@example.com', 'абв123', 'Любить математику та займається науковими проектами.', '', 'student'),
('Олександр', 'Сидоренко', 'Сергійович', 'oleksandr@example.com', 'qwerty', 'Досвідчений викладач з понад 10-річним стажем.', '', 'teacher'),
('Наталія', 'Коваленко', 'Михайлівна', 'natalia@example.com', 'пароль123', 'Викладач, що спеціалізується на фізиці.', '', 'teacher'),
('Олена', 'Литвиненко', 'Олександровна', 'olena@example.com', 'п@св0рд', 'Адміністратор із відповідальним підходом до роботи.', '', 'admin'),
('Іван', 'Борисов', 'Іванович', 'ivan2@example.com', 'пароль123', 'Майбутній інженер-програміст, цікавиться алгоритмами.', '', 'student'),
('Петро', 'Петренко', 'Петрович', 'petro@example.com', 'пароль123', 'Захоплюється кібербезпекою та розробкою ПЗ.', '', 'student'),
('Сергій', 'Сергієнко', 'Сергійович', 'sergey@example.com', 'пароль123', 'Активний учасник студентських конференцій.', '', 'student'),
('Марина', 'Мариненко', 'Маринівна', 'marina@example.com', 'пароль123', 'Студентка, яка цікавиться базами даних.', '', 'student'),
('Олег', 'Олегов', 'Олегович', 'oleg@example.com', 'пароль123', 'Любить математику та працює над аналітичними задачами.', '', 'student'),
('Марта', 'Мартиненко', 'Мартинівна', 'marta@example.com', 'пароль123', 'Студентка, яка мріє стати професійним розробником.', '', 'student'),
('Ірина', 'Петренко', 'Василівна', 'irina@example.com', 'пароль123', 'Захоплюється штучним інтелектом.', '', 'student'),
('Андрій', 'Коваленко', 'Андрійович', 'andriy@example.com', 'пароль123', 'Прагне отримати навички веб-розробки.', '', 'student'),
('Ольга', 'Литвиненко', 'Олександрівна', 'olga@example.com', 'пароль123', 'Активно бере участь у хакатонах.', '', 'student'),
('Павло', 'Павлов', 'Павлович', 'pavlo@example.com', 'пароль123', 'Любить працювати з великими даними.', '', 'student'),
('Ірина', 'Іриненко', 'Іринівна', 'irina2@example.com', 'пароль123', 'Майбутня науковиця у сфері машинного навчання.', '', 'student'),
('Андрій', 'Андрієнко', 'Андрійович', 'andriy2@example.com', 'пароль123', 'Цікавиться робототехнікою.', '', 'student'),
('Ольга', 'Олександренко', 'Олександрівна', 'olga2@example.com', 'пароль123', 'Спеціалізується на розробці мобільних додатків.', '', 'student'),
('Павло', 'Павлів', 'Павлович', 'pavlo2@example.com', 'пароль123', 'Мріє стати системним адміністратором.', '', 'student'),
('Ірина', 'Іванів', 'Іванівна', 'irina3@example.com', 'пароль123', 'Працює над власним IT-стартапом.', '', 'student'),
('Андрій', 'Андріян', 'Андрійович', 'andriy3@example.com', 'пароль123', 'Цікавиться розробкою ігор.', '', 'student'),
('Ольга', 'Олегівна', 'Олександрівна', 'olga3@example.com', 'пароль123', 'Любить працювати з алгоритмами.', '', 'student'),
('Павло', 'Павленко', 'Павлович', 'pavlo3@example.com', 'пароль123', 'Захоплюється DevOps.', '', 'student'),
('Віктор', 'Васильов', 'Вікторович', 'viktor@example.com', 'пароль123', 'Студент, який обожнює backend-розробку.', '', 'student'),
('Наталія', 'Олексієнко', 'Наталівна', 'natalia2@example.com', 'пароль123', 'Захоплюється хмарними технологіями.', '', 'student'),
('Олена', 'Олексіївна', 'Василівна', 'olena2@example.com', 'пароль123', 'Прагне стати аналітиком даних.', '', 'student'),
('Марина', 'Михайлівна', 'Миколаївна', 'marina2@example.com', 'пароль123', 'Цікавиться кібербезпекою.', '', 'student'),
('Петро', 'Петренко', 'Петрович', 'petro2@example.com', 'пароль123', 'Хоче стати full-stack розробником.', '', 'student');

-- Insert records into the teachers table
-- (Teacher rows get auto-assigned teacher_id values)
INSERT INTO teachers (user_id) VALUES
(3),  -- teacher_id = 1
(4),  -- teacher_id = 2
(4);  -- teacher_id = 3

-- Insert records into the departments table
INSERT INTO departments (department_name, department_head_id) VALUES
('Кафедра прикладної математики та комп''ютерних наук', 2),
('Кафедра екології', 3);

-- Insert records into speciality
INSERT INTO speciality (speciality_name, speciality_abbreviation, department_id) VALUES
('Комп''ютерні науки', 'CS', 1),
('Інформаційні технології', 'IT', 1),
('Земельні технологія', 'ET', 2),
('Біотехнологія', 'B', 2),
('Інженерія програмного забезпечення', 'IPS', 1),
('Фізика земельних енергій', 'FEE', 2);  


INSERT INTO teacher_departments (teacher_id, department_id) VALUES
(1, 1),  -- Teacher 1 in Math department
(1, 2),  -- Teacher 1 also in Physics department
(2, 1),  -- Teacher 2 in Math department
(3, 2);  -- Teacher 3 in Physics department

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

-- Insert records into the subjects table with the correct department_id
INSERT INTO subjects (subject_name, teacher_id, department_id, description) VALUES
('Стандартизація програмного забезпечення', 1, 1, NULL),         -- teacher_id 1, department 1
('Обчислювальна Техніка', 2, 1, NULL),      -- teacher_id 2, department 1
('Прикладна Математика', 1, 2, NULL),               -- teacher_id 1, department 2
('Екологія', 3, 1, NULL),              -- teacher_id 3, department 1
('Обчислювальна Техніка', 2, 1, NULL);        -- teacher_id 2, department 1


-- Insert records into the subject_groups table
-- Note: Only one insert block that provides teacher_id is used.
INSERT INTO subject_groups (subject_id, group_name, subject_group_photo, teacher_id) VALUES
(1, 'Група КП-Н21', 'photos/group_kp.jpg', 1),
(1, 'Група B-2', 'photos/group_b2.jpg', 1),
(2, 'Група Ф', 'photos/physics_group.jpg', 2);

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
(1, 1, 1, 8),  -- Lecture
(2, 2, 1, 7),  -- Lecture
(3, 3, 2, 9),  -- Lecture
(4, 4, 2, 8),  -- Lecture
(5, 5, 3, 9),  -- Practical
(6, 6, 3, 9),  -- Practical
(7, 7, 4, 10), -- Lab work
(8, 8, 4, 8),  -- Lab work
(9, 9, 5, 9),  -- MK1
(10, 10, 5, 8);-- MK1

-- Insert records into the subject_materials table
INSERT INTO subject_materials (subject_id, file_name, file_path, material_type) VALUES
(1, 'algebra.pdf', '/materials/math/algebra.pdf', 'lecture'),
(1, 'geometry.pdf', '/materials/math/geometry.pdf', 'lecture'),
(2, 'mechanics.pdf', '/materials/physics/mechanics.pdf', 'task');