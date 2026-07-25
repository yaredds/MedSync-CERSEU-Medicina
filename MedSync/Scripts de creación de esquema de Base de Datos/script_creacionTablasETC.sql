-- =====================================================================
-- CERSEU - FACULTY OF MEDICINE - UNMSM
-- BLOCK 2: DATABASE OBJECTS SCRIPT
-- Run AFTER 01_schema.sql
-- Sections:
--   9.2.1 Table creation
--   9.2.2 Foreign keys (FK)
--   9.2.3 Constraints (CHECK / UNIQUE)
--   9.2.4 Functions, Stored Procedures and Views
-- =====================================================================

USE cerseu_med;

-- =====================================================================
-- 9.2.1  TABLE CREATION
-- =====================================================================

-- #TABLE N1: HEALTH_AREA
CREATE TABLE health_area (
    health_area_id  INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(255) NULL
) ENGINE=InnoDB;

-- #TABLE N2: TEACHER
CREATE TABLE teacher (
    teacher_id      INT AUTO_INCREMENT PRIMARY KEY,
    dni             VARCHAR(15)  NOT NULL,
    first_name      VARCHAR(80)  NOT NULL,
    last_name       VARCHAR(80)  NOT NULL,
    email           VARCHAR(120) NOT NULL,
    phone           VARCHAR(20)  NULL,
    specialization  VARCHAR(120) NULL
) ENGINE=InnoDB;

-- #TABLE N3: COURSE
CREATE TABLE course (
    course_id       INT AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(20)  NOT NULL,
    name            VARCHAR(150) NOT NULL,
    description     TEXT         NULL,
    total_hours     INT          NOT NULL,
    min_students    INT          NOT NULL,
    max_students    INT          NOT NULL,
    platform        ENUM('ZOOM','GOOGLE_MEET') NOT NULL DEFAULT 'ZOOM',
    health_area_id  INT          NOT NULL
) ENGINE=InnoDB;

-- #TABLE N4: COURSE_SECTION
CREATE TABLE course_section (
    course_section_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id         INT          NOT NULL,
    teacher_id        INT          NOT NULL,
    section_code      VARCHAR(30)  NOT NULL,
    start_date        DATE         NOT NULL,
    end_date          DATE         NOT NULL,
    duration_weeks    INT          NOT NULL,
    meeting_link      VARCHAR(255) NULL,
    status            ENUM('OPEN','IN_PROGRESS','CLOSED','CANCELLED')
                      NOT NULL DEFAULT 'OPEN'
) ENGINE=InnoDB;

-- #TABLE N5: SCHEDULE
CREATE TABLE schedule (
    schedule_id       INT AUTO_INCREMENT PRIMARY KEY,
    course_section_id INT NOT NULL,
    day_of_week       ENUM('MONDAY','TUESDAY','WEDNESDAY','THURSDAY',
                           'FRIDAY','SATURDAY','SUNDAY') NOT NULL,
    start_time        TIME NOT NULL,
    end_time          TIME NOT NULL
) ENGINE=InnoDB;

-- #TABLE N6: STUDENT
CREATE TABLE student (
    student_id            INT AUTO_INCREMENT PRIMARY KEY,
    dni                   VARCHAR(15)  NOT NULL,
    first_name            VARCHAR(80)  NOT NULL,
    last_name             VARCHAR(80)  NOT NULL,
    email                 VARCHAR(120) NOT NULL,
    phone                 VARCHAR(20)  NULL,
    profession            VARCHAR(100) NOT NULL,
    institution_of_origin VARCHAR(150) NOT NULL,
    professional_level    ENUM('STUDENT','GRADUATE','SPECIALIST') NOT NULL,
    created_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- #TABLE N7: SCHOLARSHIP_TYPE
CREATE TABLE scholarship_type (
    scholarship_type_id INT AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(80)  NOT NULL,
    discount_percentage DECIMAL(5,2) NOT NULL,
    description         VARCHAR(255) NULL
) ENGINE=InnoDB;

-- #TABLE N8: ENROLLMENT
CREATE TABLE enrollment (
    enrollment_id       INT AUTO_INCREMENT PRIMARY KEY,
    student_id          INT          NOT NULL,
    course_section_id   INT          NOT NULL,
    scholarship_type_id INT          NULL,
    enrollment_date     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    final_grade         DECIMAL(4,2) NULL,
    status              ENUM('ACTIVE','APPROVED','FAILED') NOT NULL DEFAULT 'ACTIVE'
) ENGINE=InnoDB;

-- #TABLE N9: ROLE
CREATE TABLE role (
    role_id       INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- #TABLE N10: APP_USER
CREATE TABLE app_user (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(60)  NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id       INT NOT NULL,
    student_id    INT NULL,
    teacher_id    INT NULL,
    is_active     BOOLEAN  NOT NULL DEFAULT TRUE,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- #TABLE N10: SESSION
CREATE TABLE session (
    session_id        INT AUTO_INCREMENT PRIMARY KEY,
    course_section_id INT          NOT NULL,
    session_number    INT          NOT NULL,
    session_date      DATE         NOT NULL,
    topic             VARCHAR(200) NULL
) ENGINE=InnoDB;

-- #TABLE N11: ATTENDANCE
CREATE TABLE attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id    INT NOT NULL,
    student_id    INT NOT NULL,
    status        ENUM('PRESENT','ABSENT','LATE','JUSTIFIED') NOT NULL,
    remarks       VARCHAR(255) NULL
) ENGINE=InnoDB;

-- #TABLE N12: ASSESSMENT_TYPE
CREATE TABLE assessment_type (
    assessment_type_id INT AUTO_INCREMENT PRIMARY KEY,
    name               ENUM('MIDTERM','CONTINUOUS','FINAL') NOT NULL,
    weight_percentage  DECIMAL(5,2) NOT NULL
) ENGINE=InnoDB;

-- #TABLE N13: GRADE
CREATE TABLE grade (
    grade_id           INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id      INT          NOT NULL,
    assessment_type_id INT          NOT NULL,
    teacher_id         INT          NOT NULL,
    score              DECIMAL(4,2) NOT NULL,
    recorded_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- #TABLE N14: SURVEY_QUESTION
CREATE TABLE survey_question (
    survey_question_id INT AUTO_INCREMENT PRIMARY KEY,
    question_text      VARCHAR(255) NOT NULL,
    is_active          BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- #TABLE N15: SURVEY_RESPONSE (anonymous: no student_id stored)
CREATE TABLE survey_response (
    survey_response_id INT AUTO_INCREMENT PRIMARY KEY,
    course_section_id  INT NOT NULL,
    teacher_id         INT NOT NULL,
    survey_question_id INT NOT NULL,
    rating             INT NOT NULL,
    comment            TEXT NULL,
    responded_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- #TABLE N16: SURVEY_COMPLETED (participation control, separate from answers)
CREATE TABLE survey_completed (
    survey_completed_id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id       INT NOT NULL,
    completed_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- #TABLE N17: SURVEY_RESULT
CREATE TABLE survey_result (
    survey_result_id  INT AUTO_INCREMENT PRIMARY KEY,
    course_section_id INT NOT NULL,
    teacher_id        INT NOT NULL,
    final_score       DECIMAL(4,2) NOT NULL,
    total_responses   INT NOT NULL
) ENGINE=InnoDB;

-- =====================================================================
-- 9.2.2  FOREIGN KEYS (FK)
-- =====================================================================

-- Add FK to table: COURSE
ALTER TABLE course
    ADD CONSTRAINT fk_course_health_area
    FOREIGN KEY (health_area_id) REFERENCES health_area(health_area_id);

-- Add FK to table: COURSE_SECTION
ALTER TABLE course_section
    ADD CONSTRAINT fk_section_course
        FOREIGN KEY (course_id)  REFERENCES course(course_id),
    ADD CONSTRAINT fk_section_teacher
        FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id);

-- Add FK to table: SCHEDULE
ALTER TABLE schedule
    ADD CONSTRAINT fk_schedule_section
    FOREIGN KEY (course_section_id) REFERENCES course_section(course_section_id) ON DELETE CASCADE;

-- Add FK to table: ENROLLMENT
ALTER TABLE enrollment
    ADD CONSTRAINT fk_enrollment_student
        FOREIGN KEY (student_id) REFERENCES student(student_id),
    ADD CONSTRAINT fk_enrollment_section
        FOREIGN KEY (course_section_id) REFERENCES course_section(course_section_id),
    ADD CONSTRAINT fk_enrollment_scholarship
        FOREIGN KEY (scholarship_type_id) REFERENCES scholarship_type(scholarship_type_id);

-- Add FK to table: APP_USER
ALTER TABLE app_user
    ADD CONSTRAINT fk_user_role
        FOREIGN KEY (role_id) REFERENCES role(role_id),
    ADD CONSTRAINT fk_user_student
        FOREIGN KEY (student_id) REFERENCES student(student_id),
    ADD CONSTRAINT fk_user_teacher
        FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id);

-- Add FK to table: SESSION
ALTER TABLE session
    ADD CONSTRAINT fk_session_section
    FOREIGN KEY (course_section_id) REFERENCES course_section(course_section_id) ON DELETE CASCADE;

-- Add FK to table: ATTENDANCE
ALTER TABLE attendance
    ADD CONSTRAINT fk_attendance_session
        FOREIGN KEY (session_id) REFERENCES session(session_id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_attendance_student
        FOREIGN KEY (student_id) REFERENCES student(student_id);

-- Add FK to table: GRADE
ALTER TABLE grade
    ADD CONSTRAINT fk_grade_enrollment
        FOREIGN KEY (enrollment_id) REFERENCES enrollment(enrollment_id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_grade_assessment
        FOREIGN KEY (assessment_type_id) REFERENCES assessment_type(assessment_type_id),
    ADD CONSTRAINT fk_grade_teacher
        FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id);

-- Add FK to table: SURVEY_RESPONSE
ALTER TABLE survey_response
    ADD CONSTRAINT fk_response_section
        FOREIGN KEY (course_section_id) REFERENCES course_section(course_section_id),
    ADD CONSTRAINT fk_response_teacher
        FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id),
    ADD CONSTRAINT fk_response_question
        FOREIGN KEY (survey_question_id) REFERENCES survey_question(survey_question_id);

-- Add FK to table: SURVEY_COMPLETED
ALTER TABLE survey_completed
    ADD CONSTRAINT fk_completed_enrollment
    FOREIGN KEY (enrollment_id) REFERENCES enrollment(enrollment_id);

-- Add FK to table: SURVEY_RESULT
ALTER TABLE survey_result
    ADD CONSTRAINT fk_result_section
        FOREIGN KEY (course_section_id) REFERENCES course_section(course_section_id),
    ADD CONSTRAINT fk_result_teacher
        FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id);

-- =====================================================================
-- 9.2.3  CONSTRAINTS (UNIQUE / CHECK)
-- =====================================================================

-- Add UNIQUE constraints
ALTER TABLE teacher
    ADD CONSTRAINT uq_teacher_dni   UNIQUE (dni),
    ADD CONSTRAINT uq_teacher_email UNIQUE (email);

ALTER TABLE course
    ADD CONSTRAINT uq_course_code UNIQUE (code);

ALTER TABLE course_section
    ADD CONSTRAINT uq_section_code UNIQUE (section_code);

ALTER TABLE student
    ADD CONSTRAINT uq_student_dni   UNIQUE (dni),
    ADD CONSTRAINT uq_student_email UNIQUE (email);

ALTER TABLE enrollment
    ADD CONSTRAINT uq_enrollment UNIQUE (student_id, course_section_id);

ALTER TABLE app_user
    ADD CONSTRAINT uq_user_username UNIQUE (username);

ALTER TABLE session
    ADD CONSTRAINT uq_session UNIQUE (course_section_id, session_number);

ALTER TABLE attendance
    ADD CONSTRAINT uq_attendance UNIQUE (session_id, student_id);

ALTER TABLE assessment_type
    ADD CONSTRAINT uq_assessment_name UNIQUE (name);

ALTER TABLE grade
    ADD CONSTRAINT uq_grade UNIQUE (enrollment_id, assessment_type_id);

ALTER TABLE survey_completed
    ADD CONSTRAINT uq_completed_enrollment UNIQUE (enrollment_id);

ALTER TABLE survey_result
    ADD CONSTRAINT uq_result_section UNIQUE (course_section_id);

-- Add CHECK constraints
ALTER TABLE course
    ADD CONSTRAINT chk_course_capacity CHECK (max_students >= min_students),
    ADD CONSTRAINT chk_course_hours    CHECK (total_hours > 0);

ALTER TABLE course_section
    ADD CONSTRAINT chk_section_dates CHECK (end_date > start_date);

ALTER TABLE schedule
    ADD CONSTRAINT chk_schedule_time CHECK (end_time > start_time);

ALTER TABLE scholarship_type
    ADD CONSTRAINT chk_scholarship_pct CHECK (discount_percentage BETWEEN 0 AND 100);

ALTER TABLE enrollment
    ADD CONSTRAINT chk_enrollment_final_grade
    CHECK (final_grade IS NULL OR (final_grade BETWEEN 0 AND 20));

ALTER TABLE assessment_type
    ADD CONSTRAINT chk_assessment_weight CHECK (weight_percentage BETWEEN 0 AND 100);

ALTER TABLE grade
    ADD CONSTRAINT chk_grade_score CHECK (score BETWEEN 0 AND 20);

ALTER TABLE survey_response
    ADD CONSTRAINT chk_response_rating CHECK (rating BETWEEN 1 AND 5);

-- Performance indexes
CREATE INDEX idx_section_course   ON course_section(course_id);
CREATE INDEX idx_section_teacher  ON course_section(teacher_id);
CREATE INDEX idx_enrollment_sec   ON enrollment(course_section_id);
CREATE INDEX idx_enrollment_stu   ON enrollment(student_id);
CREATE INDEX idx_session_section  ON session(course_section_id);
CREATE INDEX idx_grade_enrollment ON grade(enrollment_id);
CREATE INDEX idx_response_section ON survey_response(course_section_id);

-- =====================================================================
-- 9.2.4  FUNCTIONS, STORED PROCEDURES AND VIEWS
-- =====================================================================

DELIMITER $$

-- #FUNCTION N1: weighted final grade of an enrollment (RN-31, RN-32)
DROP FUNCTION IF EXISTS fn_final_grade $$
CREATE FUNCTION fn_final_grade(p_enrollment_id INT)
RETURNS DECIMAL(4,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_count       INT;
    DECLARE v_final_grade DECIMAL(6,2);

    SELECT COUNT(*) INTO v_count
    FROM grade
    WHERE enrollment_id = p_enrollment_id;

    IF v_count < 3 THEN
        RETURN NULL;
    END IF;

    SELECT SUM(g.score * at.weight_percentage / 100) INTO v_final_grade
    FROM grade g
    JOIN assessment_type at ON g.assessment_type_id = at.assessment_type_id
    WHERE g.enrollment_id = p_enrollment_id;

    RETURN ROUND(v_final_grade, 2);
END $$

-- #FUNCTION N2: attendance percentage of an enrollment (PRESENT + LATE)
DROP FUNCTION IF EXISTS fn_attendance_rate $$
CREATE FUNCTION fn_attendance_rate(p_enrollment_id INT)
RETURNS DECIMAL(5,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_student_id INT;
    DECLARE v_section_id INT;
    DECLARE v_total      INT;
    DECLARE v_present    INT;

    SELECT student_id, course_section_id
      INTO v_student_id, v_section_id
    FROM enrollment
    WHERE enrollment_id = p_enrollment_id;

    SELECT COUNT(*) INTO v_total
    FROM session
    WHERE course_section_id = v_section_id;

    IF v_total = 0 THEN
        RETURN 0;
    END IF;

    SELECT COUNT(*) INTO v_present
    FROM attendance a
    JOIN session s ON a.session_id = s.session_id
    WHERE s.course_section_id = v_section_id
      AND a.student_id = v_student_id
      AND a.status IN ('PRESENT','LATE');

    RETURN ROUND(v_present * 100 / v_total, 2);
END $$

-- #FUNCTION N3: detect schedule conflict before enrolling (RN-16)
DROP FUNCTION IF EXISTS fn_has_schedule_conflict $$
CREATE FUNCTION fn_has_schedule_conflict(p_student_id INT, p_section_id INT)
RETURNS TINYINT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_conflicts INT;

    SELECT COUNT(*) INTO v_conflicts
    FROM enrollment e
    JOIN course_section cs  ON e.course_section_id = cs.course_section_id
    JOIN schedule s         ON cs.course_section_id = s.course_section_id
    JOIN schedule ns        ON ns.course_section_id = p_section_id
    JOIN course_section ncs ON ncs.course_section_id = p_section_id
    WHERE e.student_id = p_student_id
      AND e.status = 'ACTIVE'
      AND e.course_section_id <> p_section_id
      AND s.day_of_week = ns.day_of_week
      AND s.start_time < ns.end_time
      AND ns.start_time < s.end_time
      AND cs.start_date <= ncs.end_date
      AND ncs.start_date <= cs.end_date;

    RETURN IF(v_conflicts > 0, 1, 0);
END $$

-- #PROCEDURE N1: register a new student and create the STUDENT account
DROP PROCEDURE IF EXISTS sp_register_student $$
CREATE PROCEDURE sp_register_student(
    IN  p_dni           VARCHAR(15),
    IN  p_first_name    VARCHAR(80),
    IN  p_last_name     VARCHAR(80),
    IN  p_email         VARCHAR(120),
    IN  p_phone         VARCHAR(20),
    IN  p_profession    VARCHAR(100),
    IN  p_institution   VARCHAR(150),
    IN  p_level         VARCHAR(20),
    IN  p_username      VARCHAR(60),
    IN  p_password_hash VARCHAR(255),
    OUT p_student_id    INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    INSERT INTO student(dni, first_name, last_name, email, phone,
                        profession, institution_of_origin, professional_level)
    VALUES (p_dni, p_first_name, p_last_name, p_email, p_phone,
            p_profession, p_institution, p_level);

    SET p_student_id = LAST_INSERT_ID();

    INSERT INTO app_user(username, password_hash, role, student_id)
    VALUES (p_username, p_password_hash, 'STUDENT', p_student_id);

    COMMIT;
END $$

-- #PROCEDURE N2: enroll a student validating RN-08, RN-16, RN-17, RN-18
DROP PROCEDURE IF EXISTS sp_enroll_student $$
CREATE PROCEDURE sp_enroll_student(
    IN  p_student_id          INT,
    IN  p_section_id          INT,
    IN  p_scholarship_type_id INT,
    OUT p_enrollment_id       INT
)
BEGIN
    DECLARE v_status    VARCHAR(15);
    DECLARE v_max       INT;
    DECLARE v_current   INT;
    DECLARE v_duplicate INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- RN-08: section must be OPEN
    SELECT cs.status, c.max_students
      INTO v_status, v_max
    FROM course_section cs
    JOIN course c ON cs.course_id = c.course_id
    WHERE cs.course_section_id = p_section_id
    FOR UPDATE;

    IF v_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Section does not exist.';
    END IF;
    IF v_status <> 'OPEN' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Section is not open for enrollment.';
    END IF;

    -- RN-17: no duplicate enrollment
    SELECT COUNT(*) INTO v_duplicate
    FROM enrollment
    WHERE student_id = p_student_id AND course_section_id = p_section_id;
    IF v_duplicate > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student is already enrolled in this section.';
    END IF;

    -- RN-18: capacity not exceeded
    SELECT COUNT(*) INTO v_current
    FROM enrollment
    WHERE course_section_id = p_section_id AND status = 'ACTIVE';
    IF v_current >= v_max THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Section has reached its maximum capacity.';
    END IF;

    -- RN-16: no schedule conflict
    IF fn_has_schedule_conflict(p_student_id, p_section_id) = 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Schedule conflict with another active enrollment.';
    END IF;

    INSERT INTO enrollment(student_id, course_section_id, scholarship_type_id)
    VALUES (p_student_id, p_section_id, p_scholarship_type_id);

    SET p_enrollment_id = LAST_INSERT_ID();

    COMMIT;
END $$

-- #PROCEDURE N3: register a grade (RN-28, RN-34) and recompute final grade
DROP PROCEDURE IF EXISTS sp_register_grade $$
CREATE PROCEDURE sp_register_grade(
    IN p_enrollment_id      INT,
    IN p_assessment_type_id INT,
    IN p_teacher_id         INT,
    IN p_score              DECIMAL(4,2)
)
BEGIN
    DECLARE v_section_teacher INT;
    DECLARE v_final           DECIMAL(4,2);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- RN-28: score range
    IF p_score < 0 OR p_score > 20 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Score must be between 0 and 20.';
    END IF;

    -- RN-34: only the assigned teacher can register grades
    SELECT cs.teacher_id INTO v_section_teacher
    FROM enrollment e
    JOIN course_section cs ON e.course_section_id = cs.course_section_id
    WHERE e.enrollment_id = p_enrollment_id;

    IF v_section_teacher IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Enrollment does not exist.';
    END IF;
    IF v_section_teacher <> p_teacher_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Teacher is not assigned to this section.';
    END IF;

    -- RN-30: one grade per assessment type (insert or update)
    INSERT INTO grade(enrollment_id, assessment_type_id, teacher_id, score)
    VALUES (p_enrollment_id, p_assessment_type_id, p_teacher_id, p_score)
    ON DUPLICATE KEY UPDATE score = p_score, recorded_at = CURRENT_TIMESTAMP;

    -- RN-31/32/33: recompute final grade when the three grades exist
    SET v_final = fn_final_grade(p_enrollment_id);
    IF v_final IS NOT NULL THEN
        UPDATE enrollment
        SET final_grade = v_final,
            status = IF(v_final >= 11, 'APPROVED', 'FAILED')
        WHERE enrollment_id = p_enrollment_id;
    END IF;

    COMMIT;
END $$

-- #PROCEDURE N4: mark attendance validating enrollment (RN-24, RN-25)
DROP PROCEDURE IF EXISTS sp_mark_attendance $$
CREATE PROCEDURE sp_mark_attendance(
    IN p_session_id INT,
    IN p_student_id INT,
    IN p_status     VARCHAR(15),
    IN p_remarks    VARCHAR(255)
)
BEGIN
    DECLARE v_enrolled INT;

    SELECT COUNT(*) INTO v_enrolled
    FROM session s
    JOIN enrollment e ON e.course_section_id = s.course_section_id
    WHERE s.session_id = p_session_id
      AND e.student_id = p_student_id;

    IF v_enrolled = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student is not enrolled in this section.';
    END IF;

    INSERT INTO attendance(session_id, student_id, status, remarks)
    VALUES (p_session_id, p_student_id, p_status, p_remarks)
    ON DUPLICATE KEY UPDATE status = p_status, remarks = p_remarks;
END $$

-- #PROCEDURE N5: submit an anonymous survey, single submission (RN-42, RN-43)
DROP PROCEDURE IF EXISTS sp_submit_survey $$
CREATE PROCEDURE sp_submit_survey(
    IN p_enrollment_id INT,
    IN p_q1 INT, IN p_q2 INT, IN p_q3 INT, IN p_q4 INT, IN p_q5 INT,
    IN p_comment TEXT
)
BEGIN
    DECLARE v_section_id INT;
    DECLARE v_teacher_id INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT cs.course_section_id, cs.teacher_id
      INTO v_section_id, v_teacher_id
    FROM enrollment e
    JOIN course_section cs ON e.course_section_id = cs.course_section_id
    WHERE e.enrollment_id = p_enrollment_id;

    IF v_section_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Enrollment does not exist.';
    END IF;

    -- RN-42: single submission enforced by UNIQUE(enrollment_id)
    INSERT INTO survey_completed(enrollment_id) VALUES (p_enrollment_id);

    -- RN-43: anonymous responses (no student_id stored)
    INSERT INTO survey_response(course_section_id, teacher_id, survey_question_id, rating, comment)
    VALUES
      (v_section_id, v_teacher_id, 1, p_q1, NULL),
      (v_section_id, v_teacher_id, 2, p_q2, NULL),
      (v_section_id, v_teacher_id, 3, p_q3, NULL),
      (v_section_id, v_teacher_id, 4, p_q4, NULL),
      (v_section_id, v_teacher_id, 5, p_q5, p_comment);

    COMMIT;
END $$

-- #PROCEDURE N6: consolidate teacher survey result (RN-45)
DROP PROCEDURE IF EXISTS sp_calculate_survey_result $$
CREATE PROCEDURE sp_calculate_survey_result(IN p_section_id INT)
BEGIN
    DECLARE v_teacher_id INT;
    DECLARE v_avg        DECIMAL(4,2);
    DECLARE v_total      INT;

    SELECT teacher_id INTO v_teacher_id
    FROM course_section WHERE course_section_id = p_section_id;

    SELECT ROUND(AVG(rating),2) INTO v_avg
    FROM survey_response
    WHERE course_section_id = p_section_id;

    SELECT COUNT(*) INTO v_total
    FROM survey_completed sc
    JOIN enrollment e ON sc.enrollment_id = e.enrollment_id
    WHERE e.course_section_id = p_section_id;

    INSERT INTO survey_result(course_section_id, teacher_id, final_score, total_responses)
    VALUES (p_section_id, v_teacher_id, IFNULL(v_avg,0), v_total)
    ON DUPLICATE KEY UPDATE
        final_score = IFNULL(v_avg,0),
        total_responses = v_total;
END $$

DELIMITER ;

-- #VIEW N1: open sections with current occupancy
CREATE OR REPLACE VIEW v_section_availability AS
SELECT cs.course_section_id,
       c.name AS course_name,
       cs.section_code,
       CONCAT(t.first_name,' ',t.last_name) AS teacher,
       c.max_students,
       COUNT(e.enrollment_id) AS enrolled,
       c.max_students - COUNT(e.enrollment_id) AS available_seats,
       cs.status
FROM course_section cs
JOIN course  c ON cs.course_id = c.course_id
JOIN teacher t ON cs.teacher_id = t.teacher_id
LEFT JOIN enrollment e
       ON e.course_section_id = cs.course_section_id AND e.status = 'ACTIVE'
GROUP BY cs.course_section_id, c.name, cs.section_code,
         teacher, c.max_students, cs.status;

-- #VIEW N2: student grades consolidated by section
CREATE OR REPLACE VIEW v_student_grades AS
SELECT e.enrollment_id,
       CONCAT(s.first_name,' ',s.last_name) AS student,
       c.name AS course_name,
       cs.section_code,
       MAX(CASE WHEN at.name='MIDTERM'    THEN g.score END) AS midterm,
       MAX(CASE WHEN at.name='CONTINUOUS' THEN g.score END) AS continuous_eval,
       MAX(CASE WHEN at.name='FINAL'      THEN g.score END) AS final_exam,
       e.final_grade,
       e.status
FROM enrollment e
JOIN student s         ON e.student_id = s.student_id
JOIN course_section cs ON e.course_section_id = cs.course_section_id
JOIN course c          ON cs.course_id = c.course_id
LEFT JOIN grade g            ON g.enrollment_id = e.enrollment_id
LEFT JOIN assessment_type at ON g.assessment_type_id = at.assessment_type_id
GROUP BY e.enrollment_id, student, c.name, cs.section_code,
         e.final_grade, e.status;

-- #VIEW N3: attendance summary per enrollment
CREATE OR REPLACE VIEW v_attendance_summary AS
SELECT e.enrollment_id,
       CONCAT(s.first_name,' ',s.last_name) AS student,
       c.name AS course_name,
       cs.section_code,
       fn_attendance_rate(e.enrollment_id) AS attendance_rate
FROM enrollment e
JOIN student s         ON e.student_id = s.student_id
JOIN course_section cs ON e.course_section_id = cs.course_section_id
JOIN course c          ON cs.course_id = c.course_id;

-- #VIEW N5: teacher satisfaction report
CREATE OR REPLACE VIEW v_teacher_survey AS
SELECT CONCAT(t.first_name,' ',t.last_name) AS teacher,
       c.name AS course_name,
       cs.section_code,
       sr.final_score,
       sr.total_responses
FROM survey_result sr
JOIN course_section cs ON sr.course_section_id = cs.course_section_id
JOIN course c          ON cs.course_id = c.course_id
JOIN teacher t         ON sr.teacher_id = t.teacher_id;

-- =====================================================================
-- END OF BLOCK 2
-- =====================================================================