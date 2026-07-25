document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = document.getElementById('loginBtn');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Visual feedback
        loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando...';
        loginBtn.disabled = true;
        errorMessage.textContent = '';

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                // Store user info in localStorage
                localStorage.setItem('medsync_user', JSON.stringify(data));
                
                // Redirect based on role
                if (data.role === 'COORDINATOR') {
                    window.location.href = 'dashboard-coordinador.html';
                } else if (data.role === 'TEACHER') {
                    window.location.href = 'dashboard-docente.html';
                } else if (data.role === 'STUDENT') {
                    window.location.href = 'dashboard-estudiante.html';
                }
            } else {
                errorMessage.textContent = data.message;
                loginBtn.innerHTML = 'Ingresar <i class="fa-solid fa-arrow-right"></i>';
                loginBtn.disabled = false;
            }
        } catch (error) {
            errorMessage.textContent = 'Error de conexión con el servidor.';
            loginBtn.innerHTML = 'Ingresar <i class="fa-solid fa-arrow-right"></i>';
            loginBtn.disabled = false;
        }
    });
});
