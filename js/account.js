// js/account.js
document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('authSection');
    const accountSection = document.getElementById('accountSection');
    const userNameSpan = document.getElementById('userName');
    const userRoleSpan = document.getElementById('userRole');
    const ordersList = document.getElementById('ordersList');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminPanelBtn = document.getElementById('adminPanelBtn');

    // ========== CAPTCHA ПЕРЕМЕННЫЕ И ФУНКЦИИ ==========
    let currentCaptcha = { question: '', answer: '' };

    // Генерация CAPTCHA (арифметический пример)
    function generateCaptcha() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operators = ['+', '-', '*'];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        
        let answer;
        switch(operator) {
            case '+': answer = num1 + num2; break;
            case '-': answer = num1 - num2; break;
            case '*': answer = num1 * num2; break;
            default: answer = num1 + num2;
        }
        
        currentCaptcha = {
            question: `${num1} ${operator} ${num2} = ?`,
            answer: answer.toString()
        };
        
        const captchaSpan = document.getElementById('captchaQuestion');
        if (captchaSpan) captchaSpan.textContent = currentCaptcha.question;
        
        // Очищаем поле ввода и ошибку
        const captchaInput = document.getElementById('captchaInput');
        const captchaError = document.getElementById('captchaError');
        if (captchaInput) captchaInput.value = '';
        if (captchaError) captchaError.style.display = 'none';
        
        console.log('CAPTCHA сгенерирована:', currentCaptcha);
    }

    // Проверка CAPTCHA
    function verifyCaptcha() {
        const userAnswer = document.getElementById('captchaInput')?.value.trim();
        const captchaError = document.getElementById('captchaError');
        
        if (!userAnswer) {
            if (captchaError) {
                captchaError.textContent = 'Введите ответ на капчу';
                captchaError.style.display = 'block';
            }
            return false;
        }
        
        if (userAnswer !== currentCaptcha.answer) {
            if (captchaError) {
                captchaError.textContent = 'Неверный ответ! Попробуйте ещё раз.';
                captchaError.style.display = 'block';
            }
            generateCaptcha(); // Обновляем капчу при ошибке
            return false;
        }
        
        return true;
    }

    // Переключение табов
    const tabBtns = document.querySelectorAll('.tab-btn');
    if (tabBtns.length === 0) {
        console.error('Нет кнопок .tab-btn!');
    } else {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const targetForm = document.getElementById(`${tab}Form`);
                if (targetForm) targetForm.classList.add('active');
                
                // При переключении на вкладку регистрации генерируем новую капчу
                if (tab === 'register') {
                    generateCaptcha();
                }
            });
        });
    }

    // Регистрация (с проверкой CAPTCHA)
    const regForm = document.getElementById('registerFormElement');
    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // ========== ПРОВЕРКА CAPTCHA ПЕРЕД ОТПРАВКОЙ ==========
            if (!verifyCaptcha()) {
                return; // Останавливаем отправку, если капча неверна
            }
            
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const phone = document.getElementById('regPhone').value;

            try {
                const res = await fetch('/api/auth.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'register', name, email, password, phone })
                });
                const data = await res.json();
                if (data.success) {
                    alert('Регистрация успешна, теперь войдите');
                    document.querySelector('.tab-btn[data-tab="login"]').click();
                } else {
                    alert('Ошибка: ' + (data.error || 'Неизвестная ошибка'));
                }
            } catch (err) {
                console.error('Ошибка регистрации:', err);
                alert('Сетевая ошибка. Проверьте соединение.');
            }
        });
    }

    // Вход
    const loginForm = document.getElementById('loginFormElement');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const res = await fetch('/api/auth.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'login', email, password })
                });
                const data = await res.json();
                if (data.success) {
                    localStorage.setItem('userId', data.user.id);
                    localStorage.setItem('userName', data.user.name);
                    localStorage.setItem('isWholesale', data.user.is_wholesale);
                    localStorage.setItem('userRole', data.user.role);
                    showAccount(data.user.name, data.user.role);
                    loadOrders();
                } else {
                    alert('Ошибка входа: ' + (data.error || 'Неверные данные'));
                }
            } catch (err) {
                console.error('Ошибка входа:', err);
                alert('Сетевая ошибка. Проверьте путь /api/auth.php');
            }
        });
    }

    function showAccount(name, role) {
        if (authSection) authSection.style.display = 'none';
        if (accountSection) accountSection.style.display = 'block';
        if (userNameSpan) userNameSpan.textContent = name;
        if (userRoleSpan) {
            userRoleSpan.textContent = role === 'admin' ? 'Администратор' : 'Покупатель';
        }
        
        // Показываем кнопку админ-панели только для админов
        if (adminPanelBtn) {
            adminPanelBtn.style.display = role === 'admin' ? 'inline-block' : 'none';
        }
    }

    async function loadOrders() {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        
        try {
            const res = await fetch(`/api/orders.php?user_id=${userId}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            const orders = await res.json();
            
            if (!ordersList) return;
            
            if (orders.error) {
                ordersList.innerHTML = `<p>Ошибка: ${orders.error}</p>`;
                return;
            }
            
            if (orders.length === 0) {
                ordersList.innerHTML = '<p>У вас пока нет заказов.</p>';
                return;
            }
            
            let html = '<ul class="orders-list">';
            orders.forEach(order => {
                html += `<li>Заказ №${order.id} от ${order.created_at} – ${order.total_amount} ₽ (${order.status})</li>`;
            });
            html += '</ul>';
            ordersList.innerHTML = html;
        } catch (err) {
            console.error('Ошибка загрузки заказов:', err);
            if (ordersList) ordersList.innerHTML = '<p>Не удалось загрузить заказы. Проверьте консоль.</p>';
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('isWholesale');
            localStorage.removeItem('userRole');
            location.reload();
        });
    }

    // Кнопка перехода в админ-панель
    if (adminPanelBtn) {
        adminPanelBtn.addEventListener('click', () => {
            window.location.href = '/api/admin/admin.php';
        });
    }

    // Обработчик обновления CAPTCHA
    const refreshBtn = document.getElementById('refreshCaptcha');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            generateCaptcha();
        });
    }

    // Проверка существующей сессии
    const userId = localStorage.getItem('userId');
    if (userId) {
        showAccount(localStorage.getItem('userName'), localStorage.getItem('userRole'));
        loadOrders();
    } else {
        // Если нет сессии, генерируем CAPTCHA при загрузке страницы
        generateCaptcha();
    }
});