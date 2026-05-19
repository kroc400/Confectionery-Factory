// js/account.js
(function() {
    console.log('account.js загружен');

    function safeQuery(selector) {
        const el = document.querySelector(selector);
        if (!el) console.warn(`Элемент не найден: ${selector}`);
        return el;
    }

    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM готов');

        const authSection = document.getElementById('authSection');
        const accountSection = document.getElementById('accountSection');
        const userNameSpan = document.getElementById('userName');
        const ordersList = document.getElementById('ordersList');
        const logoutBtn = document.getElementById('logoutBtn');

        // ----- Переключение табов (с проверкой) -----
        const tabBtns = document.querySelectorAll('.tab-btn');
        console.log('Найдено табов:', tabBtns.length);
        if (tabBtns.length === 0) {
            console.error('Нет кнопок .tab-btn! Проверьте HTML.');
            return;
        }

        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = btn.dataset.tab;
                console.log('Клик по табу:', tab);
                // Скрыть все контенты
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                // Снять активность со всех кнопок
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const targetForm = document.getElementById(`${tab}Form`);
                if (targetForm) {
                    targetForm.classList.add('active');
                } else {
                    console.error(`Форма ${tab}Form не найдена`);
                }
            });
        });

        // ----- Регистрация -----
        const regForm = document.getElementById('registerFormElement');
        if (regForm) {
            regForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('regName').value;
                const email = document.getElementById('regEmail').value;
                const password = document.getElementById('regPassword').value;
                const phone = document.getElementById('regPhone').value;

                console.log('Отправка регистрации', { name, email, phone });

                try {
                    const res = await fetch('/api/auth.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'register', name, email, password, phone })
                    });
                    const data = await res.json();
                    if (data.success) {
                        alert('Регистрация успешна, теперь войдите');
                        // Переключиться на вкладку входа
                        const loginTab = document.querySelector('.tab-btn[data-tab="login"]');
                        if (loginTab) loginTab.click();
                    } else {
                        alert('Ошибка: ' + (data.error || 'Неизвестная ошибка'));
                    }
                } catch (err) {
                    console.error('Ошибка запроса регистрации', err);
                    alert('Сетевая ошибка. Проверьте соединение или путь к API.');
                }
            });
        } else {
            console.error('Форма регистрации не найдена');
        }

        // ----- Вход -----
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
                        showAccount(data.user.name);
                        loadOrders();
                    } else {
                        alert('Ошибка входа: ' + (data.error || 'Неверные данные'));
                    }
                } catch (err) {
                    console.error('Ошибка запроса входа', err);
                    alert('Сетевая ошибка. Проверьте путь /api/auth.php');
                }
            });
        } else {
            console.error('Форма входа не найдена');
        }

        function showAccount(name) {
            if (authSection) authSection.style.display = 'none';
            if (accountSection) accountSection.style.display = 'block';
            if (userNameSpan) userNameSpan.textContent = name;
        }

        async function loadOrders() {
            const userId = localStorage.getItem('userId');
            if (!userId) return;
            try {
                const res = await fetch(`/api/orders.php?user_id=${userId}`);
                const orders = await res.json();
                if (!ordersList) return;
                if (!orders.length) {
                    ordersList.innerHTML = '<p>У вас пока нет заказов.</p>';
                    return;
                }
                let html = '<ul>';
                orders.forEach(order => {
                    html += `<li>Заказ №${order.id} от ${order.created_at} – ${order.total_amount} ₽ (${order.status})</li>`;
                });
                html += '</ul>';
                ordersList.innerHTML = html;
            } catch (err) {
                console.error('Ошибка загрузки заказов', err);
                if (ordersList) ordersList.innerHTML = '<p>Не удалось загрузить заказы</p>';
            }
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('userId');
                localStorage.removeItem('userName');
                localStorage.removeItem('isWholesale');
                location.reload();
            });
        }

        // Проверка, залогинен ли пользователь
        const userId = localStorage.getItem('userId');
        if (userId) {
            showAccount(localStorage.getItem('userName'));
            loadOrders();
        }
    });
})();