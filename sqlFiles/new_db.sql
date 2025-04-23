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
    user_photo VARCHAR(255) DEFAULT NULL,
    role ENUM('student', 'teacher', 'admin') NOT NULL
);


-- Table: kafedra

CREATE TABLE IF NOT EXISTS departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    head_id INT DEFAULT NULL,
    FOREIGN KEY (head_id) REFERENCES teachers(teacher_id) ON DELETE SET NULL
);


-- Table: teachers
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    department_id INT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
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

CREATE TABLE IF NOT EXISTS subject_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
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
    lesson_type ENUM('Лекція', 'Реферат', 'Практична робота', 'Лабораторна робота', 'Додатково', 'MK1', 'MK2') NOT NULL,
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
INSERT INTO users (name, surname, parent_name, email, password, user_photo, role) VALUES
('Іван', 'Петров', 'Петрівна', 'ivan@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Марія', 'Іванова', 'Іванівна', 'maria@example.com', 'абв123', 'photos/sergiy.jpg', 'student'),
('Олександр', 'Сидоренко', 'Сергійович', 'oleksandr@example.com', 'qwerty', 'photos/sergiy.jpg', 'teacher'),
('Наталія', 'Коваленко', 'Михайлівна', 'natalia@example.com', 'пароль123', 'photos/sergiy.jpg', 'teacher'),
('Олена', 'Литвиненко', 'Олександровна', 'olena@example.com', 'п@св0рд', 'photos/sergiy.jpg', 'admin'),
('Іван', 'Борисов', 'Іванович', 'ivan2@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Петро', 'Петренко', 'Петрович', 'petro@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Сергій', 'Сергієнко', 'Сергійович', 'sergey@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Марина', 'Мариненко', 'Маринівна', 'marina@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Олег', 'Олегов', 'Олегович', 'oleg@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Марта', 'Мартиненко', 'Мартинівна', 'marta@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Ірина', 'Петренко', 'Василівна', 'irina@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Андрій', 'Коваленко', 'Андрійович', 'andriy@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Ольга', 'Литвиненко', 'Олександрівна', 'olga@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Павло', 'Павлов', 'Павлович', 'pavlo@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Ірина', 'Іриненко', 'Іринівна', 'irina2@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Андрій', 'Андрієнко', 'Андрійович', 'andriy2@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Ольга', 'Олександренко', 'Олександрівна', 'olga2@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Павло', 'Павлів', 'Павлович', 'pavlo2@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Ірина', 'Іванів', 'Іванівна', 'irina3@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Андрій', 'Андріян', 'Андрійович', 'andriy3@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Ольга', 'Олегівна', 'Олександрівна', 'olga3@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Павло', 'Павленко', 'Павлович', 'pavlo3@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Віктор', 'Васильов', 'Вікторович', 'viktor@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Наталія', 'Олексієнко', 'Наталівна', 'natalia2@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Олена', 'Олексіївна', 'Василівна', 'olena2@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Марина', 'Михайлівна', 'Миколаївна', 'marina2@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Петро', 'Петренко', 'Петрович', 'petro2@example.com', 'пароль123', 'photos/sergiy.jpg', 'student'),
('Сергій', 'Коваленко', 'Олександрович', 'sergiy.k@example.com', 'pass123', 'photos/sergiy.jpg', 'teacher'),
('Анна', 'Гриценко', 'Володимирівна', 'anna.g@example.com', 'pass123', 'photos/anna.jpg', 'teacher'),
('Дмитро', 'Леонов', 'Іванович', 'dmitro.l@example.com', 'pass123', 'photos/dmitro.jpg', 'student'),
('Оксана', 'Мельник', 'Петрівна', 'oksana.m@example.com', 'pass123', 'photos/oksana.jpg', 'student'),
('Руслан', 'Гончар', 'Михайлович', 'ruslan.g@example.com', 'pass123', 'photos/ruslan.jpg', 'student'),
('Світлана', 'Данилюк', 'Олександрівна', 'svitlana.d@example.com', 'pass123', 'photos/svitlana.jpg', 'admin'),
('Ігор', 'Федоренко', 'Сергійович', 'igor.f@example.com', 'pass123', 'photos/igor.jpg', 'student'),
('Людмила', 'Кравченко', 'Василівна', 'lyudmyla.k@example.com', 'pass123', 'photos/lyudmyla.jpg', 'teacher'),
('Володимир', 'Мороз', 'Олегович', 'volodymyr.m@example.com', 'pass123', 'photos/volodymyr.jpg', 'student'),
('Елена', 'Павленко', 'Станіславівна', 'elena.p@example.com', 'pass123', 'photos/elena.jpg', 'student');

INSERT INTO teacher_departments (teacher_id, department_id) VALUES
(1, 1),
(2, 2),
(3, 1),
(4, 3),
(5, 4),
(6, 5),
(1, 6),
(2, 7),
(3, 8),
(4, 9);


INSERT INTO speciality (speciality_name, speciality_abbreviation, department_id) VALUES
('Комп''ютерні науки', 'CS-21', 5),
('Інформаційні технології', 'IT-31', 5),
('Хімічна технологія', 'CH-11', 3),
('Біотехнологія', 'BT-22', 4),
('Математичні методи', 'MM-41', 1),
('Фізика високих енергій', 'FE-51', 2),
('Географія', 'GE-12', 8),
('Історія мистецтва', 'IM-33', 7),
('Лінгвістика', 'LG-14', 6),
('Філософія', 'PH-25', 9);

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
(10, 3, FALSE),
(31, 2, FALSE),
(32, 5, TRUE),
(33, 4, FALSE),
(35, 6, FALSE),
(37, 7, TRUE),
(38, 8, FALSE);

-- Insert records into the subjects table
INSERT INTO subjects (subject_name, teacher_id, department_id, description, subject_photo) VALUES
('Математика', 1, 1, 'Основи алгебри і геометрії', 'photos/math.jpg'),
('Фізика', 2, 2, 'Механіка та оптика', 'photos/physics.jpg'),
('Хімія', 4, 3, 'Органічна та неорганічна хімія', 'photos/chemistry.jpg'),
('Біологія', 5, 4, 'Основи біології', 'photos/biology.jpg'),
('Інформатика', 6, 5, 'Програмування та алгоритми', 'photos/informatics.jpg'),
('Лінгвістика', 2, 6, 'Мовознавство', 'photos/linguistics.jpg'),
('Історія', 3, 7, 'Світова історія', 'photos/history.jpg'),
('Географія', 1, 8, 'Фізична та економічна географія', 'photos/geography.jpg'),
('Філософія', 4, 9, 'Основи філософії', 'photos/philosophy.jpg'),
('Математичні методи', 1, 1, 'Поглиблений курс алгебри', 'photos/math_methods.jpg');

-- Insert records into the subject_groups table (adjusted)
INSERT INTO subject_groups (subject_id, group_name, subject_group_photo, teacher_id) VALUES
(1, 'Група КП-Н21', 'photos/physics_group.jpg', 1), 
(1, 'Group B-2, ', 'photos/physics_group.jpg', 1),
(3, 'Group C-1', 'photos/physics_group.jpg', 2),
(5, 'Group A-1', 'photos/physics_group.jpg', 2),
(5, 'Group D-2', 'photos/physics_group.jpg', 2),
(2, 'Фізична група', 'photos/physics_group.jpg', 2),
(3, 'Хімічна група', 'photos/chemistry_group.jpg', 4),
(4, 'Біологічна група', 'photos/biology_group.jpg', 5),
(5, 'Інформатична група', 'photos/informatics_group.jpg', 6),
(6, 'Лінгвістична група', 'photos/linguistics_group.jpg', 2),
(7, 'Історична група', 'photos/history_group.jpg', 3),
(8, 'Географічна група', 'photos/geography_group.jpg', 1),
(9, 'Філософська група', 'photos/philosophy_group.jpg', 4);
-- Insert records into the collaborative_groups table
INSERT INTO collaborative_groups (subject_group_id, student_id) VALUES
(1, 1), -- Add student 1 to subject group 1
(1, 2), -- Add student 2 to subject group 1
(1, 3), -- Add student 3 to subject group 1
(2, 4), -- Add student 4 to subject group 2
(2, 5), -- Add student 5 to subject group 2
(2, 6), -- Add student 6 to subject group 2
(3, 7),
(3, 8),
(4, 9),
(4, 10),
(5, 11),
(5, 12),
(6, 13),
(6, 14),
(7, 15),
(7, 16);


-- Insert records into the lessons table
INSERT INTO lessons (lesson_date, lesson_type, subject_id) VALUES
('2024-04-10', 'Лекція', 1),
('2024-04-12', 'Практична робота', 1),
('2024-04-15', 'Лабораторна робота', 1),
('2023-04-18', 'MK1', 1),
('2024-04-20', 'MK2', 1),
('2024-05-01', 'Лекція', 2),
('2024-05-02', 'Практична робота', 2),
('2024-05-10', 'Лабораторна робота', 2),
('2023-05-21', 'MK1', 2),
('2024-05-15', 'MK2', 2),
('2024-06-01', 'Лекція', 3),
('2024-06-05', 'Практична робота', 3),
('2024-06-10', 'Лабораторна робота', 3),
('2024-06-15', 'Додатково', 3),
('2024-07-01', 'Лекція', 4),
('2024-07-05', 'Практична робота', 4),
('2024-07-10', 'Лабораторна робота', 4),
('2024-07-15', 'Додатково', 4),
('2024-08-01', 'Лекція', 5),
('2024-08-05', 'Практична робота', 5),
('2024-08-10', 'Лабораторна робота', 5),
('2024-08-15', 'Додатково', 5);

-- Insert records into the journal table
INSERT INTO journal (entry_id, student_id, lesson_id, grade) VALUES
(1, 1, 1, 8), -- Лекція
(2, 2, 1, 7), -- Лекція
(3, 3, 2, 9), -- Лекція
(4, 4, 2, 8), -- Лекція
(5, 5, 3, 9), -- Практична робота
(6, 6, 3, 9), -- Практична робота
(7, 7, 4, 10), -- Лабораторна робота
(8, 8, 4, 8), -- Лабораторна робота
(9, 9, 5, 9), -- MK1
(10, 10, 5, 8), -- MK1
(11, 11, 6, 7),
(12, 12, 7, 8),
(13, 13, 8, 9),
(14, 14, 9, 6),
(15, 15, 10, 10),
(16, 16, 10, 9),
(17, 1, 11, 8),
(18, 2, 12, 7),
(19, 3, 13, 9),
(20, 4, 14, 8),
(21, 5, 15, 9),
(22, 6, 16, 9),
(23, 7, 17, 10),
(24, 8, 18, 8),
(25, 9, 19, 9),
(26, 10, 20, 8),
(27, 11, 21, 7),
(28, 12, 22, 8);



INSERT INTO subject_materials (subject_id, file_name, file_path) VALUES
(1, 'algebra.pdf', '/materials/math/algebra.pdf'),
(1, 'geometry.pdf', '/materials/math/geometry.pdf'),
(2, 'mechanics.pdf', '/materials/physics/mechanics.pdf'),
(3, 'organic_chem.pdf', '/materials/chemistry/organic_chem.pdf'),
(4, 'cell_biology.pdf', '/materials/biology/cell_biology.pdf'),
(5, 'algorithms.pdf', '/materials/informatics/algorithms.pdf'),
(6, 'syntax.pdf', '/materials/linguistics/syntax.pdf'),
(7, 'world_history.pdf', '/materials/history/world_history.pdf'),
(8, 'maps.pdf', '/materials/geography/maps.pdf'),
(9, 'existentialism.pdf', '/materials/philosophy/existentialism.pdf');