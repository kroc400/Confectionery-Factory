// js/reset-password.js
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    const resetForm = document.getElementById('resetForm');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resetMessage = document.getElementById('resetMessage');
    const formContainer = document.getElementById('resetFormContainer');
    
    if (!token) {
        showMessage('Неверная ссылка для восстановления', 'error');
        return;
    }
    
    // Проверяем токен
    loadingIndicator.style.display = 'block';
    
    try {
        const response = await fetch(`/api/reset-password.php?action=verify&token=${token}`);
        const data = await response.json();
        
        loadingIndicator.style.display = 'none';
        
        if (data.success) {
            // Показываем форму
            resetForm.style.display = 'block';
            
            // Обработка отправки формы
            resetForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const newPassword = document.getElementById('newPassword').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                
                // Очищаем предыдущее сообщение
                resetMessage.style.display = 'none';
                
                if (newPassword !== confirmPassword) {
                    showMessage('Пароли не совпадают', 'error');
                    return;
                }
                
                if (newPassword.length < 4) {
                    showMessage('Пароль должен содержать минимум 4 символа', 'error');
                    return;
                }
                
                try {
                    const resetResponse = await fetch('/api/reset-password.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'reset', token: token, password: newPassword })
                    });
                    
                    const resetData = await resetResponse.json();
                    
                    if (resetData.success) {
                        showMessage('Пароль успешно изменён! Перенаправляем на страницу входа...', 'success');
                        
                        setTimeout(() => {
                            window.location.href = '/account.html';
                        }, 3000);
                    } else {
                        showMessage(resetData.error, 'error');
                    }
                } catch (err) {
                    console.error('Ошибка:', err);
                    showMessage('Сетевая ошибка. Попробуйте позже.', 'error');
                }
            });
        } else {
            showMessage(data.error || 'Ссылка недействительна или истекла', 'error');
        }
    } catch (err) {
        console.error('Ошибка:', err);
        loadingIndicator.style.display = 'none';
        showMessage('Сетевая ошибка. Попробуйте позже.', 'error');
    }
    
    function showMessage(text, type) {
        resetMessage.textContent = text;
        resetMessage.className = `message ${type}`;
        resetMessage.style.display = 'block';
    }
});