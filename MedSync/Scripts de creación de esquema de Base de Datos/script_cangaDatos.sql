-- =====================================================================
-- CERSEU - FACULTY OF MEDICINE - UNMSM
-- BLOCK 3: DATA LOAD SCRIPT
-- 9.3.1 Data insertion (fictitious data for testing)
-- Run AFTER 01_schema.sql and 02_objects.sql
-- =====================================================================

USE cerseu_med;

-- HEALTH AREAS
INSERT INTO health_area(name, description) VALUES
('Public Health',      'Epidemiology and community health'),
('Clinical Skills',    'Clinical and assistance skills'),
('Research',           'Scientific research in health'),
('Mental Health',      'Mental health and psychological well-being'),
('Nutrition',          'Clinical nutrition and dietetics'),
('Health Management',  'Health administration and management'),
('Medical Technology', 'Medical technology and informatics');

-- ASSESSMENT TYPES (fixed weights: RN-29)
INSERT INTO assessment_type(name, weight_percentage) VALUES
('MIDTERM',    30.00),
('CONTINUOUS', 40.00),
('FINAL',      30.00);

-- SCHOLARSHIP TYPES
INSERT INTO scholarship_type(name, discount_percentage, description) VALUES
('Full Scholarship',    100.00, 'Full coverage for vulnerable cases'),
('Partial Scholarship',  50.00, 'Half coverage'),
('Social Scholarship',   75.00, 'High social vulnerability case'),
('Excellence',           30.00, 'Top performers from previous editions');

-- SURVEY QUESTIONS
INSERT INTO survey_question(question_text, is_active) VALUES
('The teacher masters the course topics',          TRUE),
('The teacher is punctual and follows schedule',   TRUE),
('The teacher explains clearly',                   TRUE),
('The materials and resources were useful',        TRUE),
('The teacher answers questions appropriately',    TRUE);

-- TEACHERS
INSERT INTO teacher(dni, first_name, last_name, email, phone, specialization) VALUES
('41258963','Luis','Baldeon','lbaldeon@cerseu.pe','987654321','Public Health'),
('40789654','Jorge','Solano','jsolano@cerseu.pe','986554120','Medical Technology'),
('42365871','Maria','Quispe','mquispe@cerseu.pe','985236471','Mental Health'),
('43654128','Carlos','Rojas','crojas@cerseu.pe','984125874','Research'),
('44556677','Elena','Castro','ecastro@cerseu.pe','987123456','Public Health');

-- ROLES
INSERT INTO role(name) VALUES
('COORDINATOR'),
('TEACHER'),
('STUDENT');

-- TEACHER ACCOUNTS
INSERT INTO app_user(username, password_hash, role_id, teacher_id) VALUES
('lbaldeon', '$2y$10$hashLB', 2, 1),
('jsolano',  '$2y$10$hashJS', 2, 2),
('mquispe',  '$2y$10$hashMQ', 2, 3),
('crojas',   '$2y$10$hashCR', 2, 4),
('ecastro',  '$2y$10$hashEC', 2, 5);

-- COORDINATOR ACCOUNT
INSERT INTO app_user(username, password_hash, role_id) VALUES
('coordinator', '$2y$10$hashCO', 1);

-- COURSES
INSERT INTO course(code, name, description, total_hours, min_students, max_students, platform, health_area_id) VALUES
('CRS-EPI', 'Applied Epidemiology',     'Fundamentals of epidemiology applied to public health.', 48, 5, 30, 'ZOOM',        1),
('CRS-BST', 'Biostatistics for Health', 'Statistics applied to health research.',                  40, 5, 25, 'GOOGLE_MEET', 3),
('CRS-MH',  'Mental Health First Aid',  'Basic psychological support skills.',                     32, 4, 20, 'ZOOM',        4),
('CRS-RCP', 'RCP y Primeros Auxilios', 'Taller práctico de reanimación cardiopulmonar.',           20, 10, 40, 'ZOOM',     2);

-- COURSE SECTIONS (Section A: open / MH-2024B: closed for grade & survey tests)
INSERT INTO course_section(course_id, teacher_id, section_code, start_date, end_date, duration_weeks, meeting_link, status) VALUES
(1, 1, 'EPI-2025A', '2025-03-03', '2025-04-25', 8,  'https://zoom.us/j/epi2025a',  'OPEN'),
(2, 4, 'BST-2025A', '2025-03-04', '2025-05-27', 12, 'https://meet.google.com/bst', 'OPEN'),
(3, 3, 'MH-2024B',  '2024-09-02', '2024-10-25', 8,  'https://zoom.us/j/mh2024b',   'CLOSED'),
(4, 5, 'RCP-2026A', '2026-08-01', '2026-09-30', 4,  'https://zoom.us/j/rcp2026a',  'OPEN');

-- SCHEDULES
-- EPI-2025A: Mon & Wed 14:00-17:00
INSERT INTO schedule(course_section_id, day_of_week, start_time, end_time) VALUES
(1,'MONDAY',   '14:00:00','17:00:00'),
(1,'WEDNESDAY','14:00:00','17:00:00');
-- BST-2025A: Tue & Thu 14:00-16:00
INSERT INTO schedule(course_section_id, day_of_week, start_time, end_time) VALUES
(2,'TUESDAY',  '14:00:00','16:00:00'),
(2,'THURSDAY', '14:00:00','16:00:00');
-- MH-2024B: Mon & Wed 18:00-21:00
INSERT INTO schedule(course_section_id, day_of_week, start_time, end_time) VALUES
(3,'MONDAY',   '18:00:00','21:00:00'),
(3,'WEDNESDAY','18:00:00','21:00:00');
-- RCP-2026A: Sat 09:00-13:00
INSERT INTO schedule(course_section_id, day_of_week, start_time, end_time) VALUES
(4,'SATURDAY',  '09:00:00','13:00:00');

-- STUDENTS
INSERT INTO student(dni, first_name, last_name, email, phone, profession, institution_of_origin, professional_level) VALUES
('70123456','Ana','Torres','atorres@mail.com','911111111','Nurse','UNMSM','GRADUATE'),
('70234567','Pedro','Gomez','pgomez@mail.com','922222222','Medical Student','UPCH','STUDENT'),
('70345678','Lucia','Mendoza','lmendoza@mail.com','933333333','Obstetrician','UNFV','SPECIALIST'),
('70456789','Diego','Ramos','dramos@mail.com','944444444','Psychologist','UNMSM','GRADUATE'),
('70567890','Sofia','Vega','svega@mail.com','955555555','Nutritionist','USMP','GRADUATE'),
('70678901','Jorge','Martinez','jmartinez@mail.com','966666666','Médico General','UNMSM','SPECIALIST');

-- STUDENT ACCOUNTS
INSERT INTO app_user(username, password_hash, role_id, student_id) VALUES
('atorres',  '$2y$10$hashAT', 3, 1),
('pgomez',   '$2y$10$hashPG', 3, 2),
('lmendoza', '$2y$10$hashLM', 3, 3),
('dramos',   '$2y$10$hashDR', 3, 4),
('svega',    '$2y$10$hashSV', 3, 5),
('jmartinez','$2y$10$hashJM', 3, 6);

-- ENROLLMENTS (open sections: seeded directly; production uses sp_enroll_student)
INSERT INTO enrollment(student_id, course_section_id, scholarship_type_id) VALUES
(1, 1, NULL),   -- Ana   -> EPI-2025A
(2, 1, 2),      -- Pedro -> EPI-2025A (partial scholarship)
(3, 2, NULL),   -- Lucia -> BST-2025A
(4, 1, NULL);   -- Diego -> EPI-2025A

-- ENROLLMENTS for the CLOSED section MH-2024B and OPEN section RCP-2026A
INSERT INTO enrollment(student_id, course_section_id, scholarship_type_id) VALUES
(4, 3, NULL),    -- Diego -> MH-2024B  (enrollment_id = 5)
(5, 3, 3),       -- Sofia -> MH-2024B  (enrollment_id = 6, social scholarship)
(6, 4, NULL);    -- Jorge -> RCP-2026A (enrollment_id = 7)

-- SESSIONS (only session dates; time comes from schedule)
INSERT INTO session(course_section_id, session_number, session_date, topic) VALUES
(1,1,'2025-03-03','Introduction to Epidemiology'),
(1,2,'2025-03-05','Measures of Frequency'),
(3,1,'2024-09-02','Principles of Mental Health'),
(3,2,'2024-09-04','Crisis Identification');

-- ATTENDANCE (closed section, for reporting)
INSERT INTO attendance(session_id, student_id, status) VALUES
(3, 4, 'PRESENT'),
(3, 5, 'PRESENT'),
(4, 4, 'LATE'),
(4, 5, 'ABSENT');

-- GRADES for the CLOSED section (via stored procedure to compute final grade)
-- assessment_type: 1=MIDTERM 2=CONTINUOUS 3=FINAL ; teacher 3 owns section 3
CALL sp_register_grade(5, 1, 3, 16);  -- Diego midterm
CALL sp_register_grade(5, 2, 3, 15);  -- Diego continuous
CALL sp_register_grade(5, 3, 3, 14);  -- Diego final     -> final 15.00 APPROVED

CALL sp_register_grade(6, 1, 3, 9);   -- Sofia midterm
CALL sp_register_grade(6, 2, 3, 10);  -- Sofia continuous
CALL sp_register_grade(6, 3, 3, 8);   -- Sofia final      -> final 9.10 FAILED

-- SURVEYS for the CLOSED section (anonymous) + result consolidation
CALL sp_submit_survey(5, 5,5,4,5,4,'Excellent course');
CALL sp_submit_survey(6, 4,5,4,4,5,'Very useful');
CALL sp_calculate_survey_result(3);

-- =====================================================================
-- END OF BLOCK 3
-- =====================================================================