// js/account.js
document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('authSection');
    const accountSection = document.getElementById('accountSection');
    const userNameSpan = document.getElementById('userName');
    const ordersList = document.getElementById('ordersList');
    const logoutBtn = document.getElementById('logoutBtn');

    // Переключение табов
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${tab}Form`).classList.add('active');
        });
    });

    // Регистрация
    document.getElementById('registerFormElement').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const phone = document.getElementById('regPhone').value;

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
            alert(data.error);
        }
    });

    // Вход
    document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

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
            alert(data.error);
        }
    });

    function showAccount(name) {
        authSection.style.display = 'none';
        accountSection.style.display = 'block';
        userNameSpan.textContent = name;
    }

    async function loadOrders() {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        const res = await fetch(`/api/orders.php?user_id=${userId}`);
        const orders = await res.json();
        if (orders.length === 0) {
            ordersList.innerHTML = '<p>У вас пока нет заказов.</p>';
            return;
        }
        let html = '<ul>';
        orders.forEach(order => {
            html += `<li>Заказ №${order.id} от ${order.created_at} – ${order.total_amount} ₽ (${order.status})</li>`;
        });
        html += '</ul>';
        ordersList.innerHTML = html;
    }

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('isWholesale');
        location.reload();
    });

    // Проверяем, есть ли уже сессия
    const userId = localStorage.getItem('userId');
    if (userId) {
        showAccount(localStorage.getItem('userName'));
        loadOrders();
    }
});