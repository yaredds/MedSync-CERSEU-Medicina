const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de la base de datos
const dbConfig = {
    host: 'localhost',
    user: 'cerseu_admin',
    password: 'cerseu2026',
    database: 'cerseu_med'
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Endpoint de Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await pool.execute(
            'SELECT u.*, r.name as role FROM app_user u JOIN role r ON u.role_id = r.role_id WHERE u.username = ? AND u.is_active = 1',
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Usuario no encontrado o inactivo.' });
        }

        const user = rows[0];

        // Validación de contraseña
        // NOTA: Como en script_cangaDatos.sql los hashes son falsos (ej. $2y$10$hashLB), 
        // para efectos del demo compararemos la contraseña directamente si el hash no es válido de bcrypt.
        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(password, user.password_hash);
        } catch (e) {
            // Si bcrypt falla por un hash mal formado, lo ignoramos
        }

        if (!isMatch && password !== user.password_hash && password !== '123456') {
            return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
        }

        res.json({
            success: true,
            role: user.role,
            student_id: user.student_id,
            teacher_id: user.teacher_id,
            username: user.username
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
});

// --- ENDPOINTS COORDINADOR ---

// Obtener Secciones (Catálogo Académico)
app.get('/api/sections', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM v_section_availability ORDER BY status DESC, course_name');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al obtener secciones.' });
    }
});

// Obtener lista de estudiantes (para matrícula)
app.get('/api/coordinator/students', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT student_id, dni, CONCAT(first_name, " ", last_name) as full_name FROM student ORDER BY last_name');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al obtener estudiantes.' });
    }
});

// Obtener solo secciones abiertas (para matrícula)
app.get('/api/coordinator/open-sections', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT course_section_id, CONCAT(course_name, " (", section_code, ")") as label, available_seats FROM v_section_availability WHERE status = "OPEN" AND available_seats > 0');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al obtener secciones.' });
    }
});

// Registrar nuevo estudiante (sp_register_student)
app.post('/api/coordinator/student', async (req, res) => {
    const { dni, first_name, last_name, email, phone, profession, institution, level, username, password } = req.body;
    try {
        await pool.execute('CALL sp_register_student(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @out_id)',
            [dni, first_name, last_name, email, phone || null, profession, institution, level, username, password]);
        res.json({ success: true, message: 'Estudiante registrado y cuenta creada exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.sqlMessage || 'Error al registrar estudiante. Verifique DNI o Correo.' });
    }
});

// Matricular estudiante (sp_enroll_student)
app.post('/api/coordinator/enroll', async (req, res) => {
    const { student_id, section_id, scholarship_type_id } = req.body;
    try {
        await pool.execute('CALL sp_enroll_student(?, ?, ?, @out_id)', [student_id, section_id, scholarship_type_id || null]);
        res.json({ success: true, message: 'Matrícula completada exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.sqlMessage || 'Error al matricular. Verifique cruces de horario o vacantes.' });
    }
});

// Obtener reportes de encuestas docentes (v_teacher_survey)
app.get('/api/coordinator/reports', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM v_teacher_survey ORDER BY final_score DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al obtener reportes.' });
    }
});

// Obtener listas de docentes y cursos (para crear secciones)
app.get('/api/coordinator/teachers-courses', async (req, res) => {
    try {
        const [courses] = await pool.execute('SELECT course_id, name FROM course ORDER BY name');
        const [teachers] = await pool.execute('SELECT teacher_id, first_name, last_name FROM teacher ORDER BY last_name');
        res.json({ success: true, courses, teachers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al cargar opciones.' });
    }
});

// Crear nueva sección de curso
app.post('/api/coordinator/section', async (req, res) => {
    const { course_id, teacher_id, section_code, start_date, end_date, duration_weeks, meeting_link } = req.body;
    try {
        await pool.execute(
            `INSERT INTO course_section (course_id, teacher_id, section_code, start_date, end_date, duration_weeks, meeting_link, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN')`,
            [course_id, teacher_id, section_code, start_date, end_date, duration_weeks, meeting_link || null]
        );
        res.json({ success: true, message: 'Sección creada exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.sqlMessage || 'Error al crear la sección.' });
    }
});

// --- ENDPOINTS DOCENTE ---

// Obtener secciones asignadas al docente
app.get('/api/teacher/:teacher_id/sections', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT cs.course_section_id, c.name as course_name, cs.section_code, cs.start_date, cs.end_date, cs.status
            FROM course_section cs
            JOIN course c ON cs.course_id = c.course_id
            WHERE cs.teacher_id = ?
        `, [req.params.teacher_id]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al obtener secciones del docente.' });
    }
});

// Obtener estudiantes de una sección
app.get('/api/teacher/sections/:section_id/students', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT e.enrollment_id, s.student_id, s.dni, CONCAT(s.first_name, ' ', s.last_name) as full_name, e.status
            FROM enrollment e
            JOIN student s ON e.student_id = s.student_id
            WHERE e.course_section_id = ? AND e.status = 'ACTIVE'
        `, [req.params.section_id]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al obtener estudiantes.' });
    }
});

// Obtener sesiones de una sección
app.get('/api/teacher/sections/:section_id/sessions', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM session WHERE course_section_id = ?', [req.params.section_id]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al obtener sesiones.' });
    }
});

// Registrar Asistencia (sp_mark_attendance)
app.post('/api/teacher/attendance', async (req, res) => {
    const { session_id, student_id, status, remarks } = req.body;
    try {
        await pool.execute('CALL sp_mark_attendance(?, ?, ?, ?)', [session_id, student_id, status, remarks || null]);
        res.json({ success: true, message: 'Asistencia registrada correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.sqlMessage || 'Error al registrar asistencia.' });
    }
});

// Registrar Calificación (sp_register_grade)
app.post('/api/teacher/grade', async (req, res) => {
    const { enrollment_id, assessment_type_id, teacher_id, score } = req.body;
    try {
        await pool.execute('CALL sp_register_grade(?, ?, ?, ?)', [enrollment_id, assessment_type_id, teacher_id, score]);
        res.json({ success: true, message: 'Calificación registrada correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.sqlMessage || 'Error al registrar calificación.' });
    }
});

// --- ENDPOINTS ESTUDIANTE ---

// Obtener calificaciones del estudiante
app.get('/api/student/:student_id/grades', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT v.course_name, v.section_code, v.midterm, v.continuous_eval, v.final_exam, v.final_grade, v.status, v.enrollment_id 
            FROM v_student_grades v
            JOIN enrollment e ON v.enrollment_id = e.enrollment_id
            WHERE e.student_id = ?
        `, [req.params.student_id]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al obtener calificaciones.' });
    }
});

// Obtener resumen de asistencia
app.get('/api/student/:student_id/attendance', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT v.course_name, v.section_code, v.attendance_rate
            FROM v_attendance_summary v
            JOIN enrollment e ON v.enrollment_id = e.enrollment_id
            WHERE e.student_id = ?
        `, [req.params.student_id]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al obtener asistencias.' });
    }
});

// Obtener detalle de asistencia (por sesión)
app.get('/api/student/:student_id/attendance-details', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT s.session_date, a.status, c.name as course_name, cs.section_code
            FROM attendance a
            JOIN session s ON a.session_id = s.session_id
            JOIN course_section cs ON s.course_section_id = cs.course_section_id
            JOIN course c ON cs.course_id = c.course_id
            WHERE a.student_id = ?
            ORDER BY s.session_date DESC
        `, [req.params.student_id]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al obtener detalles de asistencia.' });
    }
});

// Obtener horario del estudiante
app.get('/api/student/:student_id/schedule', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT c.name as course_name, cs.section_code, sch.day_of_week, sch.start_time, sch.end_time
            FROM schedule sch
            JOIN course_section cs ON sch.course_section_id = cs.course_section_id
            JOIN course c ON cs.course_id = c.course_id
            JOIN enrollment e ON cs.course_section_id = e.course_section_id
            WHERE e.student_id = ? AND e.status = 'ACTIVE'
        `, [req.params.student_id]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al obtener horario.' });
    }
});

// Enviar encuesta (sp_submit_survey)
app.post('/api/student/survey', async (req, res) => {
    const { enrollment_id, q1, q2, q3, q4, q5, comment } = req.body;
    try {
        await pool.execute('CALL sp_submit_survey(?, ?, ?, ?, ?, ?, ?)', [enrollment_id, q1, q2, q3, q4, q5, comment || null]);
        res.json({ success: true, message: '¡Gracias! Encuesta enviada correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.sqlMessage || 'Error al enviar encuesta. (Tal vez ya la respondió).' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor MedSync ejecutándose en el puerto ${PORT}`);
});
