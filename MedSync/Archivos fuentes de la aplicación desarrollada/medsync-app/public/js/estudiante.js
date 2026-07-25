const translateCourse = (text) => {
    if (!text) return text;
    let translated = text;
    const dict = {
        'Applied Epidemiology': 'Epidemiología Aplicada',
        'Biostatistics for Health': 'Bioestadística para la Salud',
        'Mental Health First Aid': 'Primeros Auxilios en Salud Mental',
        'Epidemiological Surveillance': 'Vigilancia Epidemiológica',
        'Applied Clinical Nutrition': 'Nutrición Clínica Aplicada',
        'Health Services Management': 'Gestión de Servicios de Salud',
        'Biosafety and Waste Management': 'Bioseguridad y Manejo de Residuos',
        'Medical Informatics and EHR': 'Informática Médica e Historia Clínica Electrónica',
        'Epidemiology': 'Epidemiología'
    };
    for (const [en, es] of Object.entries(dict)) {
        translated = translated.replace(new RegExp(en, 'g'), es);
    }
    return translated;
};

const HEALTH_AREA_ES = {
    'Public Health': 'Salud Pública',
    'Clinical Skills': 'Habilidades Clínicas',
    'Research': 'Investigación',
    'Mental Health': 'Salud Mental',
    'Nutrition': 'Nutrición',
    'Health Management': 'Gestión en Salud',
    'Medical Technology': 'Tecnología Médica'
};
const translateHealthArea = (text) => HEALTH_AREA_ES[text] || text;

const escapeHtml = (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

const VALID_TABS = ['notas', 'asistencia', 'horario', 'encuesta', 'informacion'];
const TAB_LABELS = { notas: 'Notas', asistencia: 'Asistencia', horario: 'Horario', encuesta: 'Encuesta', informacion: 'Información' };
const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_SHORT = { MONDAY: 'Lun', TUESDAY: 'Mar', WEDNESDAY: 'Mié', THURSDAY: 'Jue', FRIDAY: 'Vie', SATURDAY: 'Sáb', SUNDAY: 'Dom' };
const SCHEDULE_BLOCK_COLOR = '#f59e0b'; // naranja de marca, consistente con disenio/horario.jpg

let currentStudentId = null;
let coursesData = [];
let gradesData = [];
let attendanceData = [];
let scheduleData = [];
let assessmentWeights = { continuous: 40, final: 60 };

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('medsync_user'));

    if (!user || user.role !== 'STUDENT') {
        window.location.href = 'index.html';
        return;
    }

    currentStudentId = user.student_id;
    const displayName = user.username.toUpperCase();
    document.getElementById('userNameDisplay').textContent = displayName;
    document.getElementById('headerAvatar').textContent = displayName.charAt(0);

    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('medsync_user');
        window.location.href = 'index.html';
    });

    setupProfileDropdown(user, displayName);
    setupTreeRootToggle();
    setupBackButton();
    setupTabs();

    loadAllData().then(() => {
        router();
        window.addEventListener('hashchange', router);
    });
});

function setupProfileDropdown(user, displayName) {
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

        document.getElementById('dropdownName').textContent = displayName;
        document.getElementById('dropdownAvatarImg').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4B205A&color=fff&size=100`;
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
}

function setupTreeRootToggle() {
    const toggle = document.getElementById('treeRootToggle');
    const tree = document.getElementById('courseTree');
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('collapsed');
        tree.classList.toggle('collapsed');
    });
}

function setupBackButton() {
    document.getElementById('backToCourses').addEventListener('click', () => {
        window.location.hash = '#/';
    });
}

function setupTabs() {
    document.getElementById('courseTabs').addEventListener('click', (e) => {
        const btn = e.target.closest('.course-tab');
        if (!btn) return;
        const match = window.location.hash.match(/^#\/curso\/(\d+)\//);
        if (!match) return;
        window.location.hash = `#/curso/${match[1]}/${btn.dataset.tab}`;
    });
}

async function loadAllData() {
    try {
        const [coursesRes, gradesRes, attRes, schedRes, weightsRes] = await Promise.all([
            fetch(`/api/student/${currentStudentId}/courses`).then(r => r.json()),
            fetch(`/api/student/${currentStudentId}/grades`).then(r => r.json()),
            fetch(`/api/student/${currentStudentId}/attendance-details`).then(r => r.json()),
            fetch(`/api/student/${currentStudentId}/schedule`).then(r => r.json()),
            fetch(`/api/assessment-weights`).then(r => r.json())
        ]);

        if (coursesRes.success) coursesData = coursesRes.data;
        if (gradesRes.success) gradesData = gradesRes.data;
        if (attRes.success) attendanceData = attRes.data;
        if (schedRes.success) scheduleData = schedRes.data;
        if (weightsRes.success) {
            weightsRes.data.forEach(w => {
                if (w.name === 'CONTINUOUS') assessmentWeights.continuous = parseFloat(w.weight_percentage);
                if (w.name === 'FINAL') assessmentWeights.final = parseFloat(w.weight_percentage);
            });
        }
    } catch (e) {
        console.error('Error al cargar datos del estudiante', e);
    }
}

// --- Router ---

function router() {
    const hash = window.location.hash;
    const match = hash.match(/^#\/curso\/(\d+)\/([a-z]+)$/);

    if (match) {
        const sectionId = parseInt(match[1], 10);
        const tab = VALID_TABS.includes(match[2]) ? match[2] : 'notas';
        const section = coursesData.find(c => c.course_section_id === sectionId);
        if (!section) {
            window.location.hash = '#/';
            return;
        }
        showCourseDetail(section, tab);
    } else {
        showCourseCatalog();
    }
}

function showCourseCatalog() {
    document.getElementById('courseCatalogView').style.display = 'block';
    document.getElementById('courseDetailView').style.display = 'none';
    document.getElementById('pageTitle').textContent = 'Mis cursos';
    document.getElementById('breadcrumb').innerHTML = '';
    renderCourseCatalog();
    renderCourseTree(null);
}

function showCourseDetail(section, tab) {
    document.getElementById('courseCatalogView').style.display = 'none';
    document.getElementById('courseDetailView').style.display = 'block';
    document.getElementById('pageTitle').textContent = translateCourse(section.course_name);

    renderBreadcrumb(section, tab);
    renderWeekProgress(section);
    renderCourseTree(section.course_section_id);
    setActiveTab(tab);
    renderTabPanel(section, tab);
}

// --- Sidebar: árbol Mis cursos > Área médica > Curso ---

function renderCourseTree(selectedSectionId) {
    const container = document.getElementById('courseTree');

    if (coursesData.length === 0) {
        container.innerHTML = '<div class="course-tree-empty">No tienes cursos matriculados</div>';
        return;
    }

    const grouped = new Map();
    coursesData.forEach(c => {
        if (!grouped.has(c.health_area)) grouped.set(c.health_area, []);
        grouped.get(c.health_area).push(c);
    });

    container.innerHTML = '';

    grouped.forEach((courses, areaName) => {
        const hasActive = courses.some(c => c.course_section_id === selectedSectionId);

        const areaWrap = document.createElement('div');
        areaWrap.className = 'tree-area';

        const header = document.createElement('button');
        header.type = 'button';
        header.className = 'tree-area-header' + (hasActive ? ' has-active' : '');
        header.innerHTML = `
            <i class="fa-solid ${hasActive ? 'fa-folder-open' : 'fa-folder'}"></i>
            <span>${escapeHtml(translateHealthArea(areaName))}</span>
            <i class="fa-solid fa-chevron-down tree-caret"></i>
        `;

        const coursesWrap = document.createElement('div');
        coursesWrap.className = 'tree-area-courses';

        courses.forEach(c => {
            const link = document.createElement('a');
            link.href = `#/curso/${c.course_section_id}/notas`;
            link.className = 'tree-course-link' + (c.course_section_id === selectedSectionId ? ' active' : '');
            link.textContent = translateCourse(c.course_name);
            coursesWrap.appendChild(link);
        });

        header.addEventListener('click', () => {
            header.classList.toggle('collapsed');
            coursesWrap.classList.toggle('collapsed');
        });

        areaWrap.appendChild(header);
        areaWrap.appendChild(coursesWrap);
        container.appendChild(areaWrap);
    });
}

// --- Catálogo de cursos ---

function enrollmentStatusInfo(status) {
    if (status === 'ACTIVE') return { cls: 'active', label: 'En curso' };
    if (status === 'APPROVED') return { cls: 'approved', label: 'Aprobado' };
    return { cls: 'failed', label: 'Desaprobado' };
}

function renderCourseCatalog() {
    const grid = document.getElementById('courseCatalogGrid');

    if (coursesData.length === 0) {
        grid.innerHTML = '<div class="catalog-empty">No tienes cursos matriculados actualmente.</div>';
        return;
    }

    grid.innerHTML = coursesData.map(c => {
        const teacherName = `${c.teacher_first_name} ${c.teacher_last_name}`;
        const statusInfo = enrollmentStatusInfo(c.enrollment_status);
        const scheduleForCourse = scheduleData.filter(s => s.course_section_id === c.course_section_id);
        const scheduleLines = formatScheduleLines(scheduleForCourse);

        return `
            <div class="course-card">
                <span class="course-card-area"><i class="fa-solid fa-diagram-project"></i> ${escapeHtml(translateHealthArea(c.health_area))}</span>
                <h3 class="course-card-title">${escapeHtml(translateCourse(c.course_name))}</h3>
                <p class="course-card-teacher">Docente: ${escapeHtml(teacherName)}</p>
                <span class="course-card-status status-${statusInfo.cls}">${statusInfo.label}</span>
                <div class="course-card-meta">
                    <span><i class="fa-solid fa-hashtag"></i> Sección ${escapeHtml(c.section_code)}</span>
                    <span><i class="fa-solid fa-video"></i> ${c.platform === 'ZOOM' ? 'Zoom' : 'Google Meet'} — clase virtual en vivo</span>
                    ${scheduleLines ? `<span><i class="fa-solid fa-calendar-days"></i> ${escapeHtml(scheduleLines)}</span>` : ''}
                </div>
                <a class="btn-primary-sm" href="#/curso/${c.course_section_id}/notas">Ver mi módulo</a>
            </div>
        `;
    }).join('');
}

// --- Breadcrumb ---

function renderBreadcrumb(section, tab) {
    const bc = document.getElementById('breadcrumb');
    bc.innerHTML = `
        <a class="crumb" href="#/">Mis cursos</a>
        <span class="crumb-sep">/</span>
        <span class="crumb">${escapeHtml(translateHealthArea(section.health_area))}</span>
        <span class="crumb-sep">/</span>
        <a class="crumb" href="#/curso/${section.course_section_id}/notas">${escapeHtml(translateCourse(section.course_name))}</a>
        <span class="crumb-sep">/</span>
        <span class="crumb current">${TAB_LABELS[tab]}</span>
    `;
}

// --- Barra de progreso semanal ---

function computeWeekProgress(section) {
    const start = new Date(section.start_date);
    const totalWeeks = section.duration_weeks || 1;
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const today = new Date();

    let currentWeek = Math.floor((today - start) / msPerWeek) + 1;
    if (currentWeek < 1) currentWeek = 1;
    if (currentWeek > totalWeeks) currentWeek = totalWeeks;

    const pct = Math.round((currentWeek / totalWeeks) * 100);
    return { currentWeek, totalWeeks, pct };
}

function renderWeekProgress(section) {
    const { currentWeek, totalWeeks, pct } = computeWeekProgress(section);
    document.getElementById('weekProgressLabel').textContent = `Actualmente estás en la semana ${currentWeek} de ${totalWeeks}`;
    document.getElementById('weekProgressPct').textContent = `${pct}%`;
    document.getElementById('weekProgressFill').style.width = `${pct}%`;
    document.querySelector('.week-progress-bar').style.setProperty('--total-weeks', totalWeeks);
}

// --- Tabs ---

function setActiveTab(tab) {
    document.querySelectorAll('.course-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
}

function renderTabPanel(section, tab) {
    document.querySelectorAll('.tab-panel').forEach(p => { p.style.display = 'none'; });
    document.getElementById(`panel-${tab}`).style.display = 'block';

    if (tab === 'notas') renderNotas(section);
    else if (tab === 'asistencia') renderAsistencia(section);
    else if (tab === 'horario') renderHorario(section);
    else if (tab === 'encuesta') renderEncuesta(section);
    else if (tab === 'informacion') renderInformacion(section);
}

// --- Panel: Notas ---

function renderNotas(section) {
    const grade = gradesData.find(g => g.course_section_id === section.course_section_id);

    document.getElementById('weight-ec-tag').textContent = `${assessmentWeights.continuous}%`;
    document.getElementById('weight-ef-tag').textContent = `${assessmentWeights.final}%`;
    document.getElementById('weight-ec-label').textContent = assessmentWeights.continuous;
    document.getElementById('weight-ef-label').textContent = assessmentWeights.final;

    const ecVal = document.getElementById('val-ec');
    const efVal = document.getElementById('val-ef');
    const promedioVal = document.getElementById('val-promedio');
    const barEc = document.getElementById('bar-ec');
    const barEf = document.getElementById('bar-ef');

    if (!grade) {
        ecVal.textContent = '-';
        efVal.textContent = '-';
        promedioVal.textContent = '-';
        barEc.style.height = '0%';
        barEf.style.height = '0%';
        return;
    }

    const ec = parseFloat(grade.continuous_eval);
    const ef = parseFloat(grade.final_exam);

    ecVal.textContent = grade.continuous_eval !== null ? Math.round(ec) : '-';
    efVal.textContent = grade.final_exam !== null ? Math.round(ef) : '-';
    promedioVal.textContent = grade.final_grade !== null ? parseFloat(grade.final_grade).toFixed(2) : 'Pendiente';

    const ecHeight = grade.continuous_eval !== null ? Math.min((ec / 20) * 100, 100) : 0;
    const efHeight = grade.final_exam !== null ? Math.min((ef / 20) * 100, 100) : 0;

    barEc.style.height = '0%';
    barEf.style.height = '0%';
    setTimeout(() => {
        barEc.style.height = `${ecHeight}%`;
        barEf.style.height = `${efHeight}%`;
    }, 50);
}

// --- Panel: Asistencia ---

function formatSessionDate(rawDate) {
    const dateObj = new Date(rawDate);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const utcDate = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000);
    let dateStr = utcDate.toLocaleDateString('es-ES', options);
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
}

function renderAsistencia(section) {
    const items = attendanceData.filter(a => a.course_section_id === section.course_section_id);
    const asistenciasList = document.getElementById('asistenciasList');
    const faltasList = document.getElementById('faltasList');

    const asistencias = [];
    const faltas = [];

    items.forEach(item => {
        const dateStr = formatSessionDate(item.session_date);
        if (item.status === 'PRESENT' || item.status === 'LATE') asistencias.push(dateStr);
        else if (item.status === 'ABSENT' || item.status === 'JUSTIFIED') faltas.push(dateStr);
    });

    asistenciasList.innerHTML = asistencias.length === 0
        ? '<div class="empty-state">No hay asistencias registradas</div>'
        : asistencias.map(date => `
            <div class="asistencia-row">
                <div class="asistencia-row-left"><span class="dot dot-ef"></span><span>${escapeHtml(date)}</span></div>
                <span class="asistencia-badge present">Presente</span>
            </div>
        `).join('');

    faltasList.innerHTML = faltas.length === 0
        ? '<div class="empty-state">No hay faltas registradas</div>'
        : faltas.map(date => `
            <div class="asistencia-row">
                <div class="asistencia-row-left"><span class="dot" style="background:#ef4444"></span><span>${escapeHtml(date)}</span></div>
            </div>
        `).join('');
}

// --- Panel: Horario ---

function formatTime12(t) {
    const [hStr, mStr] = t.split(':');
    let h = parseInt(hStr, 10);
    const period = h >= 12 ? 'p. m.' : 'a. m.';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${mStr} ${period}`;
}

function formatScheduleLines(items) {
    if (!items || items.length === 0) return '';
    return items.map(i => `${DAY_SHORT[i.day_of_week]} ${formatTime12(i.start_time)} - ${formatTime12(i.end_time)}`).join(' · ');
}

function renderHorario(section) {
    const items = scheduleData.filter(s => s.course_section_id === section.course_section_id);
    const grid = document.getElementById('calendarGrid');

    if (items.length === 0) {
        grid.innerHTML = '<div class="calendar-empty-state">Este curso aún no tiene horario asignado.</div>';
        return;
    }

    let minHour = 23;
    let maxHour = 0;
    items.forEach(i => {
        const sh = parseInt(i.start_time.split(':')[0], 10);
        const eh = parseInt(i.end_time.split(':')[0], 10);
        if (sh < minHour) minHour = sh;
        if (eh > maxHour) maxHour = eh;
    });
    minHour = Math.max(0, minHour - 1);
    maxHour = Math.min(23, maxHour + 1);
    const hourCount = maxHour - minHour + 1;

    const todayIdx = (new Date().getDay() + 6) % 7; // Lunes=0 ... Domingo=6

    grid.style.gridTemplateColumns = '60px repeat(7, 1fr)';
    grid.style.gridTemplateRows = `44px repeat(${hourCount}, 56px)`;
    grid.innerHTML = '';

    grid.appendChild(document.createElement('div'));
    DAY_ORDER.forEach((day, idx) => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header' + (idx === todayIdx ? ' today' : '') + (day === 'SUNDAY' ? ' weekend' : '');
        header.textContent = DAY_SHORT[day];
        grid.appendChild(header);
    });

    for (let h = minHour; h <= maxHour; h++) {
        const row = (h - minHour) + 2;

        const label = document.createElement('div');
        label.className = 'calendar-hour-label';
        label.style.gridColumn = '1';
        label.style.gridRow = row;
        label.textContent = `${h} hrs`;
        grid.appendChild(label);

        for (let d = 1; d <= 7; d++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';
            cell.style.gridColumn = (d + 1).toString();
            cell.style.gridRow = row;
            grid.appendChild(cell);
        }
    }

    items.forEach(item => {
        const dIdx = DAY_ORDER.indexOf(item.day_of_week);
        const startHour = parseInt(item.start_time.split(':')[0], 10);
        const endHour = parseInt(item.end_time.split(':')[0], 10);
        const rowStart = (startHour - minHour) + 2;
        const rowEnd = (endHour - minHour) + 2;

        const event = document.createElement('div');
        event.className = 'calendar-event';
        event.style.gridColumn = (dIdx + 2).toString();
        event.style.gridRow = `${rowStart} / ${rowEnd}`;
        event.style.background = SCHEDULE_BLOCK_COLOR;
        event.innerHTML = `
            <strong>${item.start_time.slice(0, 5)} - ${item.end_time.slice(0, 5)}</strong>
            <span class="event-course">${escapeHtml(translateCourse(item.course_name))}</span>
            <span>Sección ${escapeHtml(item.section_code)}</span>
        `;
        grid.appendChild(event);
    });
}

// --- Panel: Encuesta ---

const SURVEY_QUESTIONS = [
    '¿El docente domina los temas del curso?',
    '¿El docente es puntual y respeta el horario de clases?',
    '¿El docente explica los temas de forma clara?',
    '¿Los materiales y recursos brindados fueron útiles?',
    '¿El docente responde las preguntas de manera adecuada?'
];

function isCourseFinished(section) {
    // Terminado si ya se calificó (status ya no ACTIVE) o si, según fecha de fin
    // y duración del curso, la semana actual ya alcanzó la última semana.
    const { currentWeek, totalWeeks } = computeWeekProgress(section);
    const endReachedByDate = new Date() >= new Date(section.end_date);
    return section.enrollment_status !== 'ACTIVE' || endReachedByDate || currentWeek >= totalWeeks;
}

function renderEncuesta(section) {
    const card = document.getElementById('surveyCard');

    if (!isCourseFinished(section)) {
        card.innerHTML = `
            <div class="survey-locked-state">
                <i class="fa-regular fa-clock"></i>
                <p>La encuesta de satisfacción estará disponible al finalizar el curso.</p>
            </div>
        `;
        return;
    }

    if (section.survey_completed) {
        card.innerHTML = `
            <div class="survey-locked-state completed">
                <i class="fa-solid fa-circle-check"></i>
                <p>Ya completaste la encuesta de este curso. ¡Gracias por tu retroalimentación!</p>
            </div>
        `;
        return;
    }

    const teacherName = `${section.teacher_first_name} ${section.teacher_last_name}`;

    card.innerHTML = `
        <h3>Encuesta de Satisfacción del Curso</h3>
        <p class="survey-subtitle">Evalúa a: <strong>${escapeHtml(teacherName)}</strong>. Tus respuestas son anónimas.</p>
        <p class="survey-scale-legend">1 = Muy en desacuerdo &nbsp;·&nbsp; 2 = En desacuerdo &nbsp;·&nbsp; 3 = Neutral &nbsp;·&nbsp; 4 = De acuerdo &nbsp;·&nbsp; 5 = Muy de acuerdo</p>
        <form id="surveyForm">
            ${SURVEY_QUESTIONS.map((q, idx) => `
                <div class="survey-question-row">
                    <span class="survey-question-text">${idx + 1}. ${escapeHtml(q)}</span>
                    <div class="survey-scale">
                        ${[1, 2, 3, 4, 5].map(v => `
                            <label>
                                <input type="radio" name="q${idx + 1}" value="${v}" ${v === 5 ? 'checked' : ''}>
                                ${v}
                            </label>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
            <div style="margin-top: 1.5rem;">
                <label style="font-weight: 600; display: block; margin-bottom: 8px;">Comentario adicional (opcional)</label>
                <textarea id="surveyComment" class="form-control" rows="3" placeholder="Déjanos tu opinión..."></textarea>
            </div>
            <div class="survey-actions">
                <button type="submit" class="btn-secondary" style="background: var(--primary); color: white;">Enviar Encuesta</button>
            </div>
        </form>
    `;

    document.getElementById('surveyForm').addEventListener('submit', (e) => {
        e.preventDefault();
        submitSurvey(section);
    });
}

async function submitSurvey(section) {
    const form = document.getElementById('surveyForm');
    const formData = new FormData(form);
    const payload = {
        enrollment_id: section.enrollment_id,
        q1: formData.get('q1'),
        q2: formData.get('q2'),
        q3: formData.get('q3'),
        q4: formData.get('q4'),
        q5: formData.get('q5'),
        comment: document.getElementById('surveyComment').value
    };

    try {
        const res = await fetch('/api/student/survey', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const json = await res.json();
        showCustomAlert(json.success ? 'success' : 'error', json.message, json.success ? 'ACEPTAR' : 'CERRAR');
        if (json.success) {
            section.survey_completed = true;
            renderEncuesta(section);
        }
    } catch (e) {
        showCustomAlert('error', 'Error de conexión', 'CERRAR');
    }
}

// --- Panel: Información ---

function renderInformacion(section) {
    const teacherName = `${section.teacher_first_name} ${section.teacher_last_name}`;
    document.getElementById('teacherName').textContent = teacherName;
    document.getElementById('teacherAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacherName)}&background=4B205A&color=fff&size=128`;

    const items = scheduleData.filter(s => s.course_section_id === section.course_section_id);
    document.getElementById('infoSchedule').textContent = items.length > 0 ? formatScheduleLines(items) : 'Por confirmar';
    document.getElementById('infoPlatform').textContent = section.platform === 'ZOOM' ? 'Zoom (clase virtual en vivo)' : 'Google Meet (clase virtual en vivo)';
    document.getElementById('infoSection').textContent = section.section_code;
    document.getElementById('infoDuration').textContent = `${section.duration_weeks} semana${section.duration_weeks === 1 ? '' : 's'}`;

    const linkEl = document.getElementById('infoMeetingLink');
    linkEl.innerHTML = '';
    if (section.meeting_link && /^https?:\/\//i.test(section.meeting_link)) {
        const a = document.createElement('a');
        a.href = section.meeting_link;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = section.meeting_link;
        linkEl.appendChild(a);
    } else {
        linkEl.textContent = 'Se compartirá antes de la clase';
    }
}
