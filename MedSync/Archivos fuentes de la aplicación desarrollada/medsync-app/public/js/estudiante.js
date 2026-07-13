const translateCourse = (text) => {
    if(!text) return text;
    let translated = text;
    const dict = {
        'Applied Epidemiology': 'Epidemiología Aplicada',
        'Biostatistics for Health': 'Bioestadística para la Salud',
        'Mental Health First Aid': 'Primeros Auxilios en Salud Mental',
        'Epidemiology': 'Epidemiología'
    };
    for (const [en, es] of Object.entries(dict)) {
        translated = translated.replace(new RegExp(en, 'g'), es);
    }
    return translated;
};

let currentStudentId = null;
let studentGradesData = [];
let studentAttendanceData = {};
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('medsync_user'));
    
    if (!user || user.role !== 'STUDENT') {
        window.location.href = 'index.html';
        return;
    }

    currentStudentId = user.student_id;
    document.getElementById('userNameDisplay').textContent = user.username.toUpperCase();

    // Event Listeners for Nav
    document.getElementById('navGrades').addEventListener('click', (e) => {
        e.preventDefault();
        showGrades();
    });
    
    document.getElementById('navAttendance').addEventListener('click', (e) => {
        e.preventDefault();
        showAttendance();
    });

    document.getElementById('navSchedule').addEventListener('click', (e) => {
        e.preventDefault();
        showSchedule();
    });

    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('medsync_user');
        window.location.href = 'index.html';
    });

    // Setup Profile Dropdown
    const userProfileBtn = document.getElementById('userProfileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (userProfileBtn && profileDropdown) {
        userProfileBtn.addEventListener('click', (e) => {
            if (e.target.closest('#dropdownLogoutBtn')) return;
            profileDropdown.style.display = profileDropdown.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', (e) => {
            if (!userProfileBtn.contains(e.target)) {
                profileDropdown.style.display = 'none';
            }
        });

        const displayName = user.username.toUpperCase();
        document.getElementById('dropdownName').textContent = displayName;
        document.getElementById('dropdownAvatarImg').src = `https://ui-avatars.com/api/?name=${displayName}&background=555&color=fff&size=100`;
        
        document.getElementById('dropdownEmail').textContent = user.username.toLowerCase() + '@unmsm.edu.pe';
    }

    const dropLogout = document.getElementById('dropdownLogoutBtn');
    if (dropLogout) {
        dropLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('medsync_user');
            window.location.href = 'index.html';
        });
    }

    // Load initial data
    loadGrades();
    loadAttendance();
    loadSchedule();
});

function showGrades() {
    document.getElementById('navGrades').classList.add('active');
    document.getElementById('navAttendance').classList.remove('active');
    document.getElementById('navSchedule').classList.remove('active');
    document.getElementById('gradesCard').style.display = 'block';
    document.getElementById('attendanceCard').style.display = 'none';
    document.getElementById('scheduleCard').style.display = 'none';
    document.getElementById('surveyArea').style.display = 'none';
}

function showAttendance() {
    document.getElementById('navAttendance').classList.add('active');
    document.getElementById('navGrades').classList.remove('active');
    document.getElementById('navSchedule').classList.remove('active');
    document.getElementById('attendanceCard').style.display = 'block';
    document.getElementById('gradesCard').style.display = 'none';
    document.getElementById('scheduleCard').style.display = 'none';
    document.getElementById('surveyArea').style.display = 'none';
}

function showSchedule() {
    document.getElementById('navSchedule').classList.add('active');
    document.getElementById('navGrades').classList.remove('active');
    document.getElementById('navAttendance').classList.remove('active');
    document.getElementById('scheduleCard').style.display = 'block';
    document.getElementById('gradesCard').style.display = 'none';
    document.getElementById('attendanceCard').style.display = 'none';
    document.getElementById('surveyArea').style.display = 'none';
}

async function loadGrades() {
    try {
        const res = await fetch(`/api/student/${currentStudentId}/grades`);
        const json = await res.json();
        
        if (json.success) {
            studentGradesData = json.data;
            const selector = document.getElementById('courseSelector');
            if (selector) {
                selector.innerHTML = '';
                
                if (studentGradesData.length === 0) {
                    selector.innerHTML = '<option>No hay cursos matriculados</option>';
                    selector.disabled = true;
                    updateGradesView(null);
                    return;
                }
                
                selector.disabled = false;
                studentGradesData.forEach((g, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = `${translateCourse(g.course_name)} (${g.section_code})`;
                    selector.appendChild(option);
                });
                
                updateGradesView();
            }
        }
    } catch (e) {
        console.error("Error al cargar notas", e);
    }
}

function updateGradesView(index = null) {
    const ecVal = document.getElementById('val-ec');
    const efVal = document.getElementById('val-ef');
    const promedioVal = document.getElementById('val-promedio');
    const barEc = document.getElementById('bar-ec');
    const barEf = document.getElementById('bar-ef');
    const btnEval = document.getElementById('btnEvaluarDocente');

    if (index === null && studentGradesData.length > 0) {
        index = document.getElementById('courseSelector').value;
    }

    if (index === null || !studentGradesData[index]) {
        if(ecVal) ecVal.textContent = '-';
        if(efVal) efVal.textContent = '-';
        if(promedioVal) promedioVal.textContent = '-';
        if(barEc) barEc.style.height = '0%';
        if(barEf) barEf.style.height = '0%';
        if(btnEval) btnEval.style.display = 'none';
        return;
    }

    const g = studentGradesData[index];
    
    const ec = parseFloat(g.continuous_eval) || 0;
    const ef = parseFloat(g.final_exam) || 0;
    
    if(ecVal) ecVal.textContent = g.continuous_eval !== null ? Math.round(ec) : '-';
    if(efVal) efVal.textContent = g.final_exam !== null ? Math.round(ef) : '-';
    if(promedioVal) promedioVal.textContent = g.final_grade !== null ? parseFloat(g.final_grade).toFixed(2) : 'Pendiente';

    const ecHeight = g.continuous_eval !== null ? Math.min((ec / 20) * 100, 100) : 0;
    const efHeight = g.final_exam !== null ? Math.min((ef / 20) * 100, 100) : 0;
    
    if(barEc && barEf) {
        setTimeout(() => {
            barEc.style.height = `${ecHeight}%`;
            barEf.style.height = `${efHeight}%`;
        }, 50);
    }

    if(btnEval) {
        if (g.status !== 'ACTIVE') {
            btnEval.style.display = 'inline-block';
            btnEval.onclick = () => openSurvey(g.enrollment_id, translateCourse(g.course_name));
        } else {
            btnEval.style.display = 'none';
        }
    }
}


async function loadAttendance() {
    try {
        const res = await fetch(`/api/student/${currentStudentId}/attendance-details`);
        const json = await res.json();
        
        if (json.success) {
            studentAttendanceData = {};
            json.data.forEach(item => {
                const courseKey = `${translateCourse(item.course_name)} (${item.section_code})`;
                if (!studentAttendanceData[courseKey]) {
                    studentAttendanceData[courseKey] = { asistencias: [], faltas: [] };
                }
                
                // Format date as "Martes, 31 de marzo"
                const dateObj = new Date(item.session_date);
                const options = { weekday: 'long', day: 'numeric', month: 'long' };
                // Using UTC to avoid timezone shifting the day if time is 00:00:00
                const utcDate = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000);
                let dateStr = utcDate.toLocaleDateString('es-ES', options);
                dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
                
                if (item.status === 'PRESENT' || item.status === 'LATE') {
                    studentAttendanceData[courseKey].asistencias.push(dateStr);
                } else if (item.status === 'ABSENT' || item.status === 'JUSTIFIED') {
                    studentAttendanceData[courseKey].faltas.push(dateStr);
                }
            });
            
            const selector = document.getElementById('attendanceCourseSelector');
            if (selector) {
                selector.innerHTML = '';
                const courses = Object.keys(studentAttendanceData);
                
                if (courses.length === 0) {
                    selector.innerHTML = '<option>No hay registros</option>';
                    selector.disabled = true;
                    updateAttendanceView(null);
                    return;
                }
                
                selector.disabled = false;
                courses.forEach(c => {
                    const option = document.createElement('option');
                    option.value = c;
                    option.textContent = c;
                    selector.appendChild(option);
                });
                
                updateAttendanceView();
            }
        }
    } catch (e) {
        console.error("Error al cargar asistencias", e);
    }
}

function updateAttendanceView(courseKey = null) {
    if (courseKey === null) {
        const selector = document.getElementById('attendanceCourseSelector');
        courseKey = selector ? selector.value : null;
    }
    
    const asistenciasList = document.getElementById('asistenciasList');
    const faltasList = document.getElementById('faltasList');
    
    if (!asistenciasList || !faltasList) return;
    
    if (!courseKey || !studentAttendanceData[courseKey]) {
        asistenciasList.innerHTML = '<div style="text-align: center; color: #888;">No hay datos</div>';
        faltasList.innerHTML = '<div style="text-align: center; color: #888;">No hay datos</div>';
        return;
    }
    
    const data = studentAttendanceData[courseKey];
    
    // Render Asistencias
    if (data.asistencias.length === 0) {
        asistenciasList.innerHTML = '<div style="text-align: center; color: #888; font-size: 0.9rem;">No hay asistencias registradas</div>';
    } else {
        asistenciasList.innerHTML = data.asistencias.map(date => `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 10px; height: 10px; border-radius: 50%; background: #34d399;"></div>
                    <span style="color: #666; font-size: 0.9rem;">${date}</span>
                </div>
                <span style="background: #e6f7ec; color: #34d399; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Presente</span>
            </div>
        `).join('');
    }
    
    // Render Faltas
    if (data.faltas.length === 0) {
        faltasList.innerHTML = '<div style="text-align: center; color: #888; font-size: 0.9rem;">No hay faltas registradas</div>';
    } else {
        faltasList.innerHTML = data.faltas.map(date => `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444;"></div>
                    <span style="color: #666; font-size: 0.9rem;">${date}</span>
                </div>
            </div>
        `).join('');
    }
}


function openSurvey(enrollment_id, course_name) {
    document.getElementById('gradesCard').style.display = 'none';
    document.getElementById('surveyArea').style.display = 'block';
    document.getElementById('surveyEnrollmentId').value = enrollment_id;
    document.getElementById('surveyCourseName').textContent = course_name;
}

function closeSurvey() {
    document.getElementById('surveyArea').style.display = 'none';
    document.getElementById('gradesCard').style.display = 'block';
}

async function submitSurvey() {
    const enrollment_id = document.getElementById('surveyEnrollmentId').value;
    const q1 = document.querySelector('input[name="q1"]:checked').value;
    const q2 = document.querySelector('input[name="q2"]:checked').value;
    const q3 = document.querySelector('input[name="q3"]:checked').value;
    const q4 = document.querySelector('input[name="q4"]:checked').value;
    const q5 = document.querySelector('input[name="q5"]:checked').value;
    const comment = document.getElementById('surveyComment').value;

    try {
        const res = await fetch('/api/student/survey', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enrollment_id, q1, q2, q3, q4, q5, comment })
        });
        const json = await res.json();
        showCustomAlert(json.success ? 'success' : 'error', json.message, json.success ? 'ACEPTAR' : 'CERRAR');
        if (json.success) {
            closeSurvey();
        }
    } catch (e) {
        showCustomAlert('error', 'Error de conexión', 'CERRAR');
    }
}

async function loadSchedule() {
    try {
        const res = await fetch(`/api/student/${currentStudentId}/schedule`);
        const json = await res.json();
        
        if (json.success) {
            renderSchedule(json.data);
        }
    } catch (e) {
        console.error("Error al cargar horario", e);
    }
}

const colorPalette = ['#f59e0b', '#dc2626', '#ef4444', '#2563eb', '#ec4899', '#16a34a', '#8b5cf6'];
const dayMap = { 'MONDAY': 2, 'TUESDAY': 3, 'WEDNESDAY': 4, 'THURSDAY': 5, 'FRIDAY': 6, 'SATURDAY': 7, 'SUNDAY': 8 };

function renderSchedule(scheduleData) {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    
    grid.innerHTML = `
        <div style="background: white;"></div>
        <div style="background: white; text-align: center; padding: 10px 0; font-size: 0.9rem; color: #888;">Lun</div>
        <div style="background: white; text-align: center; padding: 10px 0; font-size: 0.9rem; color: #888;">Mar</div>
        <div style="background: white; text-align: center; padding: 10px 0; font-size: 0.9rem; color: #888;">Mié</div>
        <div style="background: white; text-align: center; padding: 10px 0; font-size: 0.9rem; color: #888;">Jue</div>
        <div style="background: white; text-align: center; padding: 10px 0; font-size: 0.9rem; font-weight: bold; color: #333;">Vie</div>
        <div style="background: white; text-align: center; padding: 10px 0; font-size: 0.9rem; color: #888;">Sáb</div>
        <div style="background: white; text-align: center; padding: 10px 0; font-size: 0.9rem; color: #ef4444;">Dom</div>
    `;
    
    for (let i = 8; i <= 21; i++) {
        const row = i - 6; 
        
        const timeLabel = document.createElement('div');
        timeLabel.style.gridColumn = '1';
        timeLabel.style.gridRow = row.toString();
        timeLabel.style.background = 'white';
        timeLabel.style.textAlign = 'right';
        timeLabel.style.paddingRight = '10px';
        timeLabel.style.paddingTop = '10px';
        timeLabel.style.fontSize = '0.75rem';
        timeLabel.style.color = '#bbb';
        timeLabel.textContent = i + ' hrs';
        grid.appendChild(timeLabel);
        
        for (let j = 2; j <= 8; j++) {
            const cell = document.createElement('div');
            cell.style.gridColumn = j.toString();
            cell.style.gridRow = row.toString();
            cell.style.background = 'white';
            cell.style.borderTop = '1px solid #f0f0f0';
            grid.appendChild(cell);
        }
    }
    
    const courseColors = {};
    let colorIndex = 0;
    
    scheduleData.forEach(item => {
        if (!courseColors[translateCourse(item.course_name)]) {
            courseColors[translateCourse(item.course_name)] = colorPalette[colorIndex % colorPalette.length];
            colorIndex++;
        }
        
        const startHour = parseInt(item.start_time.split(':')[0]);
        const endHour = parseInt(item.end_time.split(':')[0]);
        const col = dayMap[item.day_of_week];
        const rowStart = startHour - 6;
        const rowEnd = endHour - 6;
        
        const event = document.createElement('div');
        event.style.gridColumn = col.toString();
        event.style.gridRow = rowStart + ' / ' + rowEnd;
        event.style.background = courseColors[translateCourse(item.course_name)];
        event.style.color = 'white';
        event.style.margin = '1px';
        event.style.padding = '10px';
        event.style.fontSize = '0.75rem';
        event.style.textAlign = 'center';
        event.style.display = 'flex';
        event.style.flexDirection = 'column';
        event.style.justifyContent = 'center';
        event.innerHTML = `
            <strong style="margin-bottom: 5px;">${item.start_time.slice(0,5)} - ${item.end_time.slice(0,5)}</strong>
            <span style="font-weight: 700; text-transform: uppercase;">${translateCourse(item.course_name)}</span>
            <span style="margin-top: 5px;">Sección ${item.section_code}</span>
        `;
        
        grid.appendChild(event);
    });
}
