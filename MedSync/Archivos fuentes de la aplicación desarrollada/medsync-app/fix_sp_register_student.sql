-- Corrige un bug en sp_register_student: el INSERT usaba una columna
-- inexistente "role" en vez de "role_id", lo que rompe el registro de
-- estudiantes nuevos desde el panel del Coordinador.
-- Ejecutar con una cuenta con privilegios suficientes (ej. root).

USE cerseu_med;

DROP PROCEDURE IF EXISTS sp_register_student;

DELIMITER $$

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
    DECLARE v_role_id INT;

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

    SELECT role_id INTO v_role_id FROM role WHERE name = 'STUDENT';

    INSERT INTO app_user(username, password_hash, role_id, student_id)
    VALUES (p_username, p_password_hash, v_role_id, p_student_id);

    COMMIT;
END $$

DELIMITER ;
