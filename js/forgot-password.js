// js/forgot-password.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgotForm');
    const messageDiv = document.getElementById('message');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('resetEmail').value;
            
            // Скрываем предыдущее сообщение
            messageDiv.style.display = 'none';
            messageDiv.className = 'message';
            
            try {
                const response = await fetch('/api/reset-password.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'request', email: email })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    messageDiv.textContent = data.message;
                    messageDiv.className = 'message success';
                    messageDiv.style.display = 'block';
                    
                    // Очищаем форму
                    form.reset();
                    
                    // Показываем демо-ссылку (ТОЛЬКО ДЛЯ ТЕСТИРОВАНИЯ)
                    if (data.demo_link) {
                        const demoLink = document.createElement('p');
                        demoLink.style.marginTop = '15px';
                        demoLink.style.fontSize = '12px';
                        demoLink.innerHTML = `<strong>Тестовая ссылка:</strong> <a href="${data.demo_link}" target="_blank">${data.demo_link}</a>`;
                        messageDiv.parentNode.appendChild(demoLink);
                    }
                } else {
                    messageDiv.textContent = data.error;
                    messageDiv.className = 'message error';
                    messageDiv.style.display = 'block';
                }
            } catch (err) {
                console.error('Ошибка:', err);
                messageDiv.textContent = 'Сетевая ошибка. Попробуйте позже.';
                messageDiv.className = 'message error';
                messageDiv.style.display = 'block';
            }
        });
    }
});