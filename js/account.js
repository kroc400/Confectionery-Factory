// js/account.js
document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('authSection');
    const accountSection = document.getElementById('accountSection');
    const userNameSpan = document.getElementById('userName');
    const userRoleSpan = document.getElementById('userRole');
    const ordersList = document.getElementById('ordersList');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminPanelBtn = document.getElementById('adminPanelBtn');

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
            });
        });
    }

    // Регистрация
    const regForm = document.getElementById('registerFormElement');
    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
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

    // Проверка существующей сессии
    const userId = localStorage.getItem('userId');
    if (userId) {
        showAccount(localStorage.getItem('userName'), localStorage.getItem('userRole'));
        loadOrders();
    }
});