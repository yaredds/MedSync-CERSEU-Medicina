function showCustomAlert(type, message, btnText = 'ACEPTAR') {
    return new Promise((resolve) => {
        let overlay = document.getElementById('customModalOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'customModalOverlay';
            overlay.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 9999; justify-content: center; align-items: center;';
            
            const box = document.createElement('div');
            box.id = 'customModalBox';
            box.style.cssText = 'background: white; border-radius: 12px; padding: 2rem; width: 90%; max-width: 400px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.2);';
            
            const icon = document.createElement('img');
            icon.id = 'customModalIcon';
            icon.style.cssText = 'width: 80px; margin-bottom: 1rem;';
            
            const title = document.createElement('h2');
            title.textContent = 'Aviso';
            title.style.cssText = 'font-size: 1.5rem; margin-bottom: 0.5rem; color: #333; font-family: "Poppins", sans-serif; font-weight: 700;';
            
            const msg = document.createElement('p');
            msg.id = 'customModalMessage';
            msg.style.cssText = 'color: #666; margin-bottom: 1.5rem; line-height: 1.4; font-size: 0.95rem;';
            
            const btn = document.createElement('button');
            btn.id = 'customModalBtn';
            btn.style.cssText = 'background: #F4F4F4; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; color: #333; cursor: pointer; transition: background 0.2s; width: 100%; font-family: "Poppins", sans-serif;';
            btn.onmouseover = () => btn.style.background = '#E2E8F0';
            btn.onmouseout = () => btn.style.background = '#F4F4F4';
            
            box.appendChild(icon);
            box.appendChild(title);
            box.appendChild(msg);
            box.appendChild(btn);
            overlay.appendChild(box);
            document.body.appendChild(overlay);
        }
        
        const iconEl = document.getElementById('customModalIcon');
        if (type === 'success') {
            iconEl.src = 'like.png';
            document.getElementById('customModalBox').style.borderTop = '5px solid #10B981';
        } else {
            iconEl.src = 'error.jpg';
            document.getElementById('customModalBox').style.borderTop = '5px solid #EF4444';
        }
        
        document.getElementById('customModalMessage').textContent = message;
        
        const btnEl = document.getElementById('customModalBtn');
        btnEl.textContent = btnText;
        
        overlay.style.display = 'flex';
        
        btnEl.onclick = () => {
            overlay.style.display = 'none';
            resolve();
        };
    });
}

// Sobrescribir window.alert para que capture todos los alerts automáticamente
window.alert = function(message) {
    const type = message.toLowerCase().includes('error') ? 'error' : 'success';
    const btnText = type === 'success' ? 'ACEPTAR' : 'CERRAR';
    showCustomAlert(type, message, btnText);
};
