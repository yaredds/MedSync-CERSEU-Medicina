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

document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    const user = JSON.parse(localStorage.getItem('medsync_user'));
    
    if (!user || user.role !== 'COORDINATOR') {
        window.location.href = 'index.html';
        return;
    }

    // Configurar interfaz
    document.getElementById('userNameDisplay').textContent = user.username.toUpperCase();

    // Eventos de Navegación
    document.getElementById('navCatalog').addEventListener('click', (e) => {
        e.preventDefault();
        showCatalog();
    });

    document.getElementById('navEnroll').addEventListener('click', (e) => {
        e.preventDefault();
        showEnrollment();
    });

    document.getElementById('navReports').addEventListener('click', (e) => {
        e.preventDefault();
        showReports();
    });

    // Cargar datos iniciales
    fetchSections();

    // Eventos de Formularios
    document.getElementById('newStudentForm').addEventListener('submit', registerStudent);
    document.getElementById('enrollForm').addEventListener('submit', enrollStudent);
    
    document.getElementById('btnNewSection').addEventListener('click', showNewSectionForm);
    document.getElementById('btnCancelSection').addEventListener('click', () => {
        document.getElementById('newSectionCard').style.display = 'none';
        document.getElementById('catalogCard').style.display = 'block';
    });
    document.getElementById('newSectionForm').addEventListener('submit', submitNewSection);

    // Configurar Logout (Sidebar)
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
        
        document.getElementById('dropdownEmail').textContent = 'coordinador@cerseu.unmsm.edu.pe';
    }

    const dropLogout = document.getElementById('dropdownLogoutBtn');
    if (dropLogout) {
        dropLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('medsync_user');
            window.location.href = 'index.html';
        });
    }
});

async function fetchSections() {
    const tableBody = document.getElementById('sectionsTableBody');
    
    try {
        const response = await fetch('/api/sections');
        const result = await response.json();
        
        if (result.success) {
            tableBody.innerHTML = '';
            
            if (result.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay secciones disponibles.</td></tr>';
                return;
            }

            result.data.forEach(section => {
                let statusClass = 'status-open';
                let statusText = 'Abierto';
                
                if (section.status === 'CLOSED') {
                    statusClass = 'status-closed';
                    statusText = 'Cerrado';
                } else if (section.status === 'IN_PROGRESS') {
                    statusClass = 'status-inprogress';
                    statusText = 'En Curso';
                } else if (section.status === 'CANCELLED') {
                    statusClass = 'status-closed';
                    statusText = 'Cancelado';
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${translateCourse(section.course_name)}</strong></td>
                    <td>${section.section_code}</td>
                    <td>${section.teacher}</td>
                    <td>${section.available_seats !== null ? section.available_seats : section.max_students} / ${section.max_students}</td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
            </tr>`;
                tableBody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Error fetching sections:', error);
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">Error cargando datos. Asegúrese de que el backend esté conectado a MySQL.</td></tr>';
    }
}

// --- LOGICA DE MATRICULAS ---

window.switchEnrollTab = function(tabName) {
    const tabReg = document.getElementById('tabRegister');
    const tabEnr = document.getElementById('tabEnroll');
    const secReg = document.getElementById('registerSection');
    const secEnr = document.getElementById('enrollSection');
    
    if (tabName === 'register') {
        tabReg.classList.add('active');
        tabReg.style.color = 'var(--primary)';
        tabReg.style.borderBottomColor = 'var(--primary)';
        
        tabEnr.classList.remove('active');
        tabEnr.style.color = 'var(--gray)';
        tabEnr.style.borderBottomColor = 'transparent';
        
        secReg.style.display = 'block';
        secEnr.style.display = 'none';
    } else {
        tabEnr.classList.add('active');
        tabEnr.style.color = 'var(--primary)';
        tabEnr.style.borderBottomColor = 'var(--primary)';
        
        tabReg.classList.remove('active');
        tabReg.style.color = 'var(--gray)';
        tabReg.style.borderBottomColor = 'transparent';
        
        secEnr.style.display = 'block';
        secReg.style.display = 'none';
    }
}

function showCatalog() {
    document.getElementById('navCatalog').classList.add('active');
    document.getElementById('navEnroll').classList.remove('active');
    document.getElementById('navReports').classList.remove('active');
    document.getElementById('catalogCard').style.display = 'block';
    document.getElementById('enrollCard').style.display = 'none';
    document.getElementById('reportsCard').style.display = 'none';
    document.getElementById('newSectionCard').style.display = 'none';
}

function showEnrollment() {
    document.getElementById('navEnroll').classList.add('active');
    document.getElementById('navCatalog').classList.remove('active');
    document.getElementById('navReports').classList.remove('active');
    document.getElementById('enrollCard').style.display = 'block';
    document.getElementById('catalogCard').style.display = 'none';
    document.getElementById('reportsCard').style.display = 'none';
    document.getElementById('newSectionCard').style.display = 'none';
    
    // Cargar listas al abrir la pestaña
    loadEnrollmentData();
}

function showReports() {
    document.getElementById('navReports').classList.add('active');
    document.getElementById('navCatalog').classList.remove('active');
    document.getElementById('navEnroll').classList.remove('active');
    document.getElementById('reportsCard').style.display = 'block';
    document.getElementById('catalogCard').style.display = 'none';
    document.getElementById('enrollCard').style.display = 'none';
    document.getElementById('newSectionCard').style.display = 'none';
    
    fetchReports();
}

async function fetchReports() {
    try {
        const res = await fetch('/api/coordinator/reports');
        const json = await res.json();
        const tbody = document.getElementById('reportsTableBody');
        tbody.innerHTML = '';
        if (json.success) {
            json.data.forEach(r => {
                let badgeClass = r.final_score >= 4 ? 'badge-open' : (r.final_score >= 3 ? 'badge-in-progress' : 'badge-closed');
                tbody.innerHTML += `<tr>
                    <td>${r.teacher}</td>
                    <td>${translateCourse(r.course_name)}</td>
                    <td>${r.section_code}</td>
                    <td><span class="badge ${badgeClass}">${r.final_score} / 5</span></td>
                    <td>${r.total_responses}</td>
                </tr>`;
            });
        }
    } catch (e) {
        document.getElementById('reportsTableBody').innerHTML = '<tr><td colspan="5">Error</td></tr>';
    }
}

async function showNewSectionForm() {
    document.getElementById('catalogCard').style.display = 'none';
    document.getElementById('newSectionCard').style.display = 'block';
    
    // Cargar docentes y cursos
    try {
        const res = await fetch('/api/coordinator/teachers-courses');
        const json = await res.json();
        if (json.success) {
            const selCourse = document.getElementById('nsCourseId');
            const selTeacher = document.getElementById('nsTeacherId');
            selCourse.innerHTML = '<option value="">Seleccione Curso...</option>';
            selTeacher.innerHTML = '<option value="">Seleccione Docente...</option>';
            
            json.courses.forEach(c => selCourse.innerHTML += `<option value="${c.course_id}">${translateCourse(c.name)}</option>`);
            json.teachers.forEach(t => selTeacher.innerHTML += `<option value="${t.teacher_id}">${t.first_name} ${t.last_name}</option>`);
        }
    } catch (e) {}
}

async function submitNewSection(e) {
    e.preventDefault();
    const data = {
        course_id: document.getElementById('nsCourseId').value,
        teacher_id: document.getElementById('nsTeacherId').value,
        section_code: document.getElementById('nsSectionCode').value,
        start_date: document.getElementById('nsStartDate').value,
        end_date: document.getElementById('nsEndDate').value,
        duration_weeks: document.getElementById('nsDuration').value,
        meeting_link: document.getElementById('nsLink').value
    };

    try {
        const res = await fetch('/api/coordinator/section', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        showCustomAlert(json.success ? 'success' : 'error', json.message, json.success ? 'ACEPTAR' : 'CERRAR');
        if (json.success) {
            document.getElementById('newSectionForm').reset();
            showCatalog();
            fetchSections();
        }
    } catch (error) {
        showCustomAlert('error', 'Error al guardar.', 'CERRAR');
    }
}

async function loadEnrollmentData() {
    // Cargar estudiantes
    try {
        const resStu = await fetch('/api/coordinator/students');
        const jsonStu = await resStu.json();
        const selStu = document.getElementById('enStudentId');
        selStu.innerHTML = '<option value="">Seleccione estudiante...</option>';
        if (jsonStu.success) {
            jsonStu.data.forEach(s => {
                selStu.innerHTML += `<option value="${s.student_id}">${s.full_name} (${s.dni})</option>`;
            });
        }
    } catch (e) {}

    // Cargar secciones abiertas
    try {
        const resSec = await fetch('/api/coordinator/open-sections');
        const jsonSec = await resSec.json();
        const selSec = document.getElementById('enSectionId');
        selSec.innerHTML = '<option value="">Seleccione sección...</option>';
        if (jsonSec.success) {
            jsonSec.data.forEach(s => {
                selSec.innerHTML += `<option value="${s.course_section_id}">${translateCourse(s.label)} - Vacantes: ${s.available_seats}</option>`;
            });
        }
    } catch (e) {}
}

async function registerStudent(e) {
    e.preventDefault();
    const data = {
        dni: document.getElementById('nsDni').value,
        first_name: document.getElementById('nsFirstName').value,
        last_name: document.getElementById('nsLastName').value,
        email: document.getElementById('nsEmail').value,
        phone: document.getElementById('nsPhone').value,
        profession: document.getElementById('nsProfession').value,
        institution: document.getElementById('nsInstitution').value,
        level: document.getElementById('nsLevel').value,
        username: document.getElementById('nsUsername').value,
        password: document.getElementById('nsPassword').value
    };

    try {
        const res = await fetch('/api/coordinator/student', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        showCustomAlert(json.success ? 'success' : 'error', json.message, json.success ? 'ACEPTAR' : 'CERRAR');
        if (json.success) {
            document.getElementById('newStudentForm').reset();
            loadEnrollmentData(); // Recargar lista de alumnos
        }
    } catch (error) {
        showCustomAlert('error', 'Error de conexión', 'CERRAR');
    }
}

async function enrollStudent(e) {
    e.preventDefault();
    const data = {
        student_id: document.getElementById('enStudentId').value,
        section_id: document.getElementById('enSectionId').value,
        scholarship_type_id: document.getElementById('enScholarship').value
    };

    try {
        const res = await fetch('/api/coordinator/enroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        showCustomAlert(json.success ? 'success' : 'error', json.message, json.success ? 'ACEPTAR' : 'CERRAR');
        if (json.success) {
            document.getElementById('enrollForm').reset();
            loadEnrollmentData(); // Actualizar vacantes
            fetchSections(); // Actualizar catálogo general
        }
    } catch (error) {
        showCustomAlert('error', 'Error de conexión', 'CERRAR');
    }
}
