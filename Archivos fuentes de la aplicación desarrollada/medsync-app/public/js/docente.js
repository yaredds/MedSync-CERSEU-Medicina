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

let currentSectionId = null;
let currentTeacherId = null;
let enrolledStudents = [];

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('medsync_user'));
    
    if (!user || user.role !== 'TEACHER') {
        window.location.href = 'index.html';
        return;
    }

    currentTeacherId = user.teacher_id;
    document.getElementById('userNameDisplay').textContent = user.username.toUpperCase();

    fetchTeacherSections();

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
});

async function fetchTeacherSections() {
    const tbody = document.getElementById('teacherSectionsBody');
    try {
        const res = await fetch(`/api/teacher/${currentTeacherId}/sections`);
        const result = await res.json();
        
        if (result.success) {
            tbody.innerHTML = '';
            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No tiene secciones asignadas.</td></tr>';
                return;
            }
            
            result.data.forEach(sec => {
                let statusClass = sec.status === 'OPEN' ? 'status-open' : (sec.status === 'CLOSED' ? 'status-closed' : 'status-inprogress');
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${translateCourse(sec.course_name)}</strong></td>
                    <td>${sec.section_code}</td>
                    <td>${new Date(sec.start_date).toLocaleDateString()} al ${new Date(sec.end_date).toLocaleDateString()}</td>
                    <td><span class="status-badge ${statusClass}">${sec.status}</span></td>
                    <td>
                        <button class="btn-secondary" onclick="manageSection(${sec.course_section_id}, '${sec.section_code}')">Gestionar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red;">Error de conexión.</td></tr>';
    }
}

async function manageSection(section_id, section_code) {
    currentSectionId = section_id;
    document.getElementById('managementTitle').textContent = `Gestionando: ${section_code}`;
    document.getElementById('managementArea').style.display = 'block';

    // Fetch Sessions and Students
    await loadSessions(section_id);
    await loadStudents(section_id);
    
    // Ensure the first tab is active when opening management area
    switchTeacherTab('attendance');
}

function closeManagement() {
    document.getElementById('managementArea').style.display = 'none';
    currentSectionId = null;
}

async function loadSessions(section_id) {
    const sel = document.getElementById('sessionSelect');
    sel.innerHTML = '<option value="">Seleccione Sesión...</option>';
    try {
        const res = await fetch(`/api/teacher/sections/${section_id}/sessions`);
        const json = await res.json();
        if (json.success) {
            json.data.forEach(s => {
                sel.innerHTML += `<option value="${s.session_id}">Sesión ${s.session_number}: ${new Date(s.session_date).toLocaleDateString()} - ${s.topic || 'Sin tema'}</option>`;
            });
        }
    } catch (e) { console.error(e); }
}

async function loadStudents(section_id) {
    const tbody = document.getElementById('bulkAttendanceBody');
    const tbodyG = document.getElementById('bulkGradesBody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Cargando estudiantes...</td></tr>';
    tbodyG.innerHTML = '<tr><td colspan="6" style="text-align:center;">Cargando estudiantes...</td></tr>';
    
    try {
        const res = await fetch(`/api/teacher/sections/${section_id}/students`);
        const json = await res.json();
        if (json.success) {
            enrolledStudents = json.data;
            tbody.innerHTML = '';
            tbodyG.innerHTML = '';
            
            if (json.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No hay alumnos matriculados en esta sección.</td></tr>';
                tbodyG.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay alumnos matriculados en esta sección.</td></tr>';
                return;
            }

            json.data.forEach((st, index) => {
                // Populate bulk attendance table
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${st.dni}</td>
                    <td>${st.full_name}</td>
                    <td style="text-align: center; background: #e6ffed;">
                        <input type="radio" name="att_${st.student_id}" value="PRESENT" checked>
                    </td>
                    <td style="text-align: center; background: #fff5b1;">
                        <input type="radio" name="att_${st.student_id}" value="LATE">
                    </td>
                    <td style="text-align: center; background: #ffebe9;">
                        <input type="radio" name="att_${st.student_id}" value="ABSENT">
                    </td>
                    <td>
                        <select class="form-control" id="interv_${st.student_id}" style="margin-bottom: 0; padding: 4px; font-size: 0.85rem;">
                            <option value="">-</option>
                            <option value="1">Buena</option>
                            <option value="2">Regular</option>
                            <option value="3">Mala</option>
                        </select>
                    </td>
                    <td>
                        <input type="text" id="obs_${st.student_id}" class="form-control" style="margin-bottom: 0; padding: 4px; font-size: 0.85rem;">
                    </td>
                `;
                tbody.appendChild(tr);

                // Populate bulk grades table
                const trG = document.createElement('tr');
                trG.innerHTML = `
                    <td>${st.dni}</td>
                    <td>${st.full_name}</td>
                    <td><input type="number" id="ep_${st.enrollment_id}" class="form-control calc-grade" data-enr="${st.enrollment_id}" style="margin-bottom:0; padding:4px;" min="0" max="20" step="1"></td>
                    <td><input type="number" id="evc_${st.enrollment_id}" class="form-control calc-grade" data-enr="${st.enrollment_id}" style="margin-bottom:0; padding:4px;" min="0" max="20" step="1"></td>
                    <td><input type="number" id="ef_${st.enrollment_id}" class="form-control calc-grade" data-enr="${st.enrollment_id}" style="margin-bottom:0; padding:4px;" min="0" max="20" step="1"></td>
                    <td style="text-align:center; font-weight:bold; background:#f8fafc; font-size:1.1rem; color:var(--primary);" id="pf_${st.enrollment_id}">-</td>
                `;
                tbodyG.appendChild(trG);
            });

            // Bind events for PF calculation
            document.querySelectorAll('.calc-grade').forEach(input => {
                input.addEventListener('input', (e) => {
                    // Enforce integer rules
                    let val = parseInt(e.target.value);
                    if (isNaN(val)) {
                        e.target.value = '';
                    } else {
                        if (val < 0) val = 0;
                        if (val > 20) val = 20;
                        e.target.value = val;
                    }

                    const enrId = e.target.getAttribute('data-enr');
                    const ep = parseInt(document.getElementById(`ep_${enrId}`).value) || 0;
                    const evc = parseInt(document.getElementById(`evc_${enrId}`).value) || 0;
                    const ef = parseInt(document.getElementById(`ef_${enrId}`).value) || 0;

                    let pf = Math.round((ep * 0.3) + (evc * 0.4) + (ef * 0.3));
                    const pfCell = document.getElementById(`pf_${enrId}`);
                    
                    if (!document.getElementById(`ep_${enrId}`).value && !document.getElementById(`evc_${enrId}`).value && !document.getElementById(`ef_${enrId}`).value) {
                        pfCell.textContent = '-';
                    } else {
                        pfCell.textContent = pf;
                        if (pf >= 11) pfCell.style.color = 'var(--primary)';
                        else pfCell.style.color = 'red';
                    }
                });
            });
        }
    } catch (e) { console.error(e); }
}

window.markBulkAttendance = async function() {
    const session_id = document.getElementById('sessionSelect').value;
    if (!session_id) return showCustomAlert('error', "Seleccione una sesión", 'CERRAR');

    if (enrolledStudents.length === 0) return showCustomAlert('error', "No hay estudiantes en esta sección", 'CERRAR');

    try {
        let successCount = 0;
        let failCount = 0;

        // Enviar uno por uno usando la ruta existente (o simular masivo si el backend no lo soporta)
        for (const st of enrolledStudents) {
            const statusNode = document.querySelector(`input[name="att_${st.student_id}"]:checked`);
            const status = statusNode ? statusNode.value : 'PRESENT';
            const interv = document.getElementById(`interv_${st.student_id}`).value;
            const obsText = document.getElementById(`obs_${st.student_id}`).value;
            
            let remarks = obsText;
            if (interv) {
                const intervText = interv === '1' ? 'Buena' : (interv === '2' ? 'Regular' : 'Mala');
                remarks = `Intervención: ${intervText}. ${obsText}`.trim();
            }

            const res = await fetch('/api/teacher/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id, student_id: st.student_id, status, remarks })
            });
            const json = await res.json();
            if (json.success) successCount++;
            else failCount++;
        }

        if (failCount === 0) {
            showCustomAlert('success', `Se registró la asistencia de ${successCount} alumnos.`, 'ACEPTAR');
        } else {
            showCustomAlert('error', `Se registró ${successCount} alumnos, pero fallaron ${failCount}.`, 'CERRAR');
        }
    } catch (e) { 
        showCustomAlert('error', 'Error de conexión al registrar masivamente', 'CERRAR'); 
    }
}

window.markBulkGrades = async function() {
    if (enrolledStudents.length === 0) return showCustomAlert('error', "No hay estudiantes matriculados en esta sección", 'CERRAR');

    try {
        let savedCount = 0;
        let failCount = 0;

        for (const st of enrolledStudents) {
            const enr = st.enrollment_id;
            const ep = document.getElementById(`ep_${enr}`).value;
            const evc = document.getElementById(`evc_${enr}`).value;
            const ef = document.getElementById(`ef_${enr}`).value;

            const updateGrade = async (assessment_type_id, score) => {
                if (!score || score < 0 || score > 20) return false;
                const res = await fetch('/api/teacher/grade', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ enrollment_id: enr, assessment_type_id, teacher_id: currentTeacherId, score })
                });
                const json = await res.json();
                return json.success;
            };

            // EP: id=1, EvC: id=2, EF: id=3
            if (ep) {
                const s = await updateGrade(1, ep);
                if(s) savedCount++; else failCount++;
            }
            if (evc) {
                const s = await updateGrade(2, evc);
                if(s) savedCount++; else failCount++;
            }
            if (ef) {
                const s = await updateGrade(3, ef);
                if(s) savedCount++; else failCount++;
            }
        }

        if (failCount === 0 && savedCount > 0) {
            showCustomAlert('success', `Se registraron ${savedCount} notas con éxito.`, 'ACEPTAR');
        } else if (savedCount > 0) {
            showCustomAlert('error', `Se guardaron ${savedCount} notas, pero fallaron ${failCount}. Revisa los valores ingresados.`, 'CERRAR');
        } else {
            showCustomAlert('error', 'No se ingresó ninguna nota nueva o válida.', 'CERRAR');
        }
    } catch (e) {
        showCustomAlert('error', 'Error de conexión al registrar calificaciones', 'CERRAR');
    }
}

window.switchTeacherTab = function(tabName) {
    const tabAtt = document.getElementById('tabAttendance');
    const tabGra = document.getElementById('tabGrades');
    const secAtt = document.getElementById('attendanceSection');
    const secGra = document.getElementById('gradeSection');
    
    if (tabName === 'attendance') {
        tabAtt.classList.add('active');
        tabAtt.style.color = 'var(--primary)';
        tabAtt.style.borderBottomColor = 'var(--primary)';
        
        tabGra.classList.remove('active');
        tabGra.style.color = 'var(--gray)';
        tabGra.style.borderBottomColor = 'transparent';
        
        secAtt.style.display = 'block';
        secGra.style.display = 'none';
    } else {
        tabGra.classList.add('active');
        tabGra.style.color = 'var(--primary)';
        tabGra.style.borderBottomColor = 'var(--primary)';
        
        tabAtt.classList.remove('active');
        tabAtt.style.color = 'var(--gray)';
        tabAtt.style.borderBottomColor = 'transparent';
        
        secGra.style.display = 'block';
        secAtt.style.display = 'none';
    }
}
