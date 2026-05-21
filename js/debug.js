// js/debug.js – обновлённая версия
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    let isDev = urlParams.get('dev') === '1';
    if (!isDev && sessionStorage.getItem('devmode') === 'true') isDev = true;
    
    if (urlParams.get('dev') === '1') {
        sessionStorage.setItem('devmode', 'true');
        if (window.history.replaceState) {
            const cleanUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    }
    
    if (!isDev) return;

    console.log('DEV-режим включён');

    const devBadge = document.createElement('div');
    devBadge.textContent = 'DEV MODE';
    devBadge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#E60000;color:white;padding:4px 10px;font-size:11px;z-index:9999;font-family:monospace;cursor:pointer;';
    devBadge.onclick = () => { sessionStorage.removeItem('devmode'); location.reload(); };
    document.body.appendChild(devBadge);

    // ========== МОК-ДАННЫЕ ==========
    let mockProducts = [
        { id: 1, name: 'Звёздный вальс', price: 350, wholesale_min_qty: 10, wholesale_discount: 15, image: '/img/products/звездный_вальс.jfif', description: 'Шоколадные трюфели' },
        { id: 2, name: 'Медовый луг', price: 420, wholesale_min_qty: 8, wholesale_discount: 12, image: '/img/products/медовый_луг.jfif', description: 'Пралине с цельным фундуком' },
        { id: 3, name: 'Морской бриз', price: 280, wholesale_min_qty: 12, wholesale_discount: 18, image: '/img/products/морской_бриз.jfif', description: 'Освежающие леденцы' },
        { id: 4, name: 'Бабушкины сказки', price: 390, wholesale_min_qty: 6, wholesale_discount: 10, image: '/img/products/бабушкины_сказки.jfif', description: 'Нежное суфле' }
    ];

    let mockUsers = [
        { id: 1, email: 'demo@example.com', name: 'Иван Петров', phone: '+7 (999) 123-45-67', is_wholesale: 0, role: 'user', created_at: '2024-01-15 10:30:00' },
        { id: 2, email: 'wholesale@example.com', name: 'Мария Смирнова', phone: '+7 (999) 765-43-21', is_wholesale: 1, role: 'user', created_at: '2024-02-20 14:20:00' },
        { id: 3, email: 'admin@example.com', name: 'Администратор', phone: '+7 (999) 000-00-00', is_wholesale: 1, role: 'admin', created_at: '2024-01-01 09:00:00' }
    ];

    let mockOrders = [
        { id: 156, user_name: 'Иван Петров', user_id: 1, total_amount: 2450, status: 'completed', created_at: '2024-05-15 10:30:00' },
        { id: 155, user_name: 'Мария Смирнова', user_id: 2, total_amount: 1280, status: 'processing', created_at: '2024-05-14 14:20:00' },
        { id: 154, user_name: 'Алексей К.', user_id: 1, total_amount: 3900, status: 'new', created_at: '2024-05-13 09:15:00' }
    ];

    let currentMockUser = mockUsers[2];
    let mockCart = JSON.parse(localStorage.getItem('dev_cart')) || [];

    function saveMockCart() { localStorage.setItem('dev_cart', JSON.stringify(mockCart)); }
    function updateMockCartCounter() { const c = document.getElementById('cartCount'); if (c) c.textContent = mockCart.length; }

    // Статистика для отчётов
    function getStats() {
        const totalUsers = mockUsers.length;
        const totalProducts = mockProducts.length;
        const totalOrders = mockOrders.length;
        const totalRevenue = mockOrders.reduce((s, o) => s + o.total_amount, 0);
        const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const wholesaleUsers = mockUsers.filter(u => u.is_wholesale === 1).length;
        
        // Топ товаров
        const productStats = mockProducts.map(p => ({
            name: p.name,
            sold: Math.floor(Math.random() * 100) + 20,
            revenue: Math.floor(Math.random() * 50000) + 10000
        })).sort((a, b) => b.sold - a.sold).slice(0, 3);
        
        // Продажи по месяцам
        const monthlySales = [
            { month: 'Март 2024', orders: 32, revenue: 45600 },
            { month: 'Апрель 2024', orders: 38, revenue: 52300 },
            { month: 'Май 2024', orders: 28, revenue: 36400 }
        ];
        
        return { totalUsers, totalProducts, totalOrders, totalRevenue, avgOrder, wholesaleUsers, productStats, monthlySales };
    }

    // ========== ПЕРЕХВАТ FETCH ==========
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        let url = args[0];
        if (typeof url !== 'string') url = url.url;
        const urlStr = url;
        const method = args[1]?.method || 'GET';
        
        console.log('[DEV]', method, urlStr);

        if (urlStr.includes('/api/products.php')) {
            return new Response(JSON.stringify(mockProducts.map(p => ({ id: p.id, name: p.name, price: p.price, wholesale_min_qty: p.wholesale_min_qty, wholesale_discount: p.wholesale_discount, image: p.image, description: p.description }))), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        if (urlStr.includes('/api/product.php')) {
            const idMatch = urlStr.match(/[?&]id=(\d+)/);
            const id = idMatch ? parseInt(idMatch[1]) : 0;
            const product = mockProducts.find(p => p.id === id) || { error: 'Товар не найден' };
            return new Response(JSON.stringify(product), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        if (urlStr.includes('/api/cart.php') && method === 'GET') {
            const cartItems = mockCart.map(item => {
                const product = mockProducts.find(p => p.id === item.product_id);
                if (!product) return null;
                return { product_id: item.product_id, name: product.name, quantity: item.quantity, price: product.price, final_price: product.price, discount_saved: 0, discount_percent: 0 };
            }).filter(Boolean);
            const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
            return new Response(JSON.stringify({ items: cartItems, summary: { subtotal: subtotal, discount: 0, total: subtotal, is_wholesale_user: false } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        if (urlStr.includes('/api/cart.php') && method === 'POST') {
            const body = JSON.parse(args[1]?.body || '{}');
            const existing = mockCart.find(i => i.product_id === body.product_id);
            if (existing) existing.quantity += body.quantity;
            else mockCart.push({ product_id: body.product_id, quantity: body.quantity });
            saveMockCart(); updateMockCartCounter();
            return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        if (urlStr.includes('/api/auth.php')) {
            const body = JSON.parse(args[1]?.body || '{}');
            if (body.action === 'login') {
                const user = mockUsers.find(u => u.email === body.email);
                if (user && (body.password === '123' || body.password === 'admin123')) {
                    currentMockUser = user;
                    const { password, ...userWithoutPassword } = user;
                    return new Response(JSON.stringify({ success: true, user: userWithoutPassword }), { status: 200, headers: { 'Content-Type': 'application/json' } });
                }
                return new Response(JSON.stringify({ error: 'Неверный email или пароль' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
            }
        }

        return originalFetch.apply(this, args);
    };

    // ========== РЕНДЕР АДМИНКИ ==========
    function renderAdminPanel() {
        const adminContent = document.querySelector('.admin-content');
        if (!adminContent) return;
        
        const page = new URLSearchParams(window.location.search).get('page') || 'dashboard';
        
        document.querySelectorAll('.admin-sidebar a').forEach(link => {
            const linkPage = link.getAttribute('data-page');
            if (linkPage === page) link.classList.add('active');
            else link.classList.remove('active');
        });
        
        const stats = getStats();
        
        if (page === 'dashboard') {
            adminContent.innerHTML = `
                <div class="admin-top-bar">
                    <h1 class="admin-page-title">Панель управления</h1>
                    <div class="admin-user-info"><span>${currentMockUser.name}</span><div class="admin-avatar">A</div></div>
                </div>
                <div class="admin-stats-grid">
                    <div class="admin-stat-card"><div class="admin-stat-number">${stats.totalUsers}</div><div class="admin-stat-title">Пользователей</div></div>
                    <div class="admin-stat-card"><div class="admin-stat-number">${stats.totalProducts}</div><div class="admin-stat-title">Товаров</div></div>
                    <div class="admin-stat-card"><div class="admin-stat-number">${stats.totalOrders}</div><div class="admin-stat-title">Заказов</div></div>
                    <div class="admin-stat-card"><div class="admin-stat-number">${stats.totalRevenue.toLocaleString()} ₽</div><div class="admin-stat-title">Выручка</div></div>
                </div>
                <div class="admin-data-table">
                    <h3>Последние заказы</h3>
                    <table><thead><tr><th>ID</th><th>Покупатель</th><th>Сумма</th><th>Статус</th><th>Дата</th></tr></thead>
                    <tbody>${mockOrders.slice(0, 5).map(o => `<tr><td>${o.id}</td><td>${o.user_name}</td><td>${o.total_amount} ₽</td><td>${o.status}</td><td>${o.created_at}</td></tr>`).join('')}</tbody>
                    </table>
                </div>
            `;
        } 
        else if (page === 'reports') {
            adminContent.innerHTML = `
                <div class="admin-top-bar"><h1 class="admin-page-title">Отчёты и аналитика</h1><div class="admin-user-info"><span>${currentMockUser.name}</span><div class="admin-avatar">A</div></div></div>
                <div class="admin-stats-grid">
                    <div class="admin-stat-card"><div class="admin-stat-number">${stats.avgOrder.toFixed(0)} ₽</div><div class="admin-stat-title">Средний чек</div></div>
                    <div class="admin-stat-card"><div class="admin-stat-number">${stats.wholesaleUsers}</div><div class="admin-stat-title">Оптовых покупателей</div></div>
                    <div class="admin-stat-card"><div class="admin-stat-number">${stats.totalOrders}</div><div class="admin-stat-title">Всего заказов</div></div>
                    <div class="admin-stat-card"><div class="admin-stat-number">${stats.totalRevenue.toLocaleString()} ₽</div><div class="admin-stat-title">Общая выручка</div></div>
                </div>
                <div class="admin-reports-grid">
                    <div class="admin-report-card"><h3>Топ товаров</h3><tr><tr><th>Товар</th><th>Продано</th><th>Выручка</th></tr>${stats.productStats.map(p => `<tr><td>${p.name}</td><td>${p.sold} шт</td><td>${p.revenue.toLocaleString()} ₽</td></tr>`).join('')}</table></div>
                    <div class="admin-report-card"><h3>Продажи по месяцам</h3><td><tr><th>Месяц</th><th>Заказов</th><th>Выручка</th></tr>${stats.monthlySales.map(m => `<tr><td>${m.month}</td><td>${m.orders}</td><td>${m.revenue.toLocaleString()} ₽</td></tr>`).join('')}</table></div>
                    <div class="admin-report-card"><h3>Статусы заказов</h3><tr><tr><th>Статус</th><th>Количество</th></tr><tr><td>Новые</td><td>${mockOrders.filter(o => o.status === 'new').length}</td></tr><tr><td>В обработке</td><td>${mockOrders.filter(o => o.status === 'processing').length}</td></tr><tr><td>Завершённые</td><td>${mockOrders.filter(o => o.status === 'completed').length}</td></tr></table></div>
                </div>
            `;
        }
        else if (page === 'users') {
            adminContent.innerHTML = `
                <div class="admin-top-bar"><h1 class="admin-page-title">Управление пользователями</h1><div class="admin-user-info"><span>${currentMockUser.name}</span><div class="admin-avatar">A</div></div></div>
                <div class="admin-data-table">
                    <table id="usersTable">
                        <thead><tr><th>ID</th><th>Email</th><th>Имя</th><th>Телефон</th><th>Оптовик</th><th>Роль</th><th>Действия</th></tr></thead>
                        <tbody>${mockUsers.map(u => `
                            <tr data-user-id="${u.id}">
                                <td>${u.id}</td>
                                <td class="edit-email">${u.email}</td>
                                <td class="edit-name">${u.name}</td>
                                <td class="edit-phone">${u.phone || '-'}</td>
                                <td class="edit-wholesale">${u.is_wholesale ? 'Да' : 'Нет'}</td>
                                <td class="edit-role">${u.role === 'admin' ? 'Админ' : 'Пользователь'}</td>
                                <td><button class="admin-edit-btn" onclick="editUser(${u.id})">Редактировать</button></td>
                            </tr>
                        `).join('')}</tbody>
                    </table>
                </div>
            `;
            window.editUser = (userId) => {
                const row = document.querySelector(`tr[data-user-id="${userId}"]`);
                const user = mockUsers.find(u => u.id === userId);
                if (!user) return;
                
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td><input type="email" class="admin-edit-input" id="edit-email-${userId}" value="${user.email}"></td>
                    <td><input type="text" class="admin-edit-input" id="edit-name-${userId}" value="${user.name}"></td>
                    <td><input type="text" class="admin-edit-input" id="edit-phone-${userId}" value="${user.phone || ''}"></td>
                    <td><select class="admin-edit-select" id="edit-wholesale-${userId}"><option value="0" ${user.is_wholesale === 0 ? 'selected' : ''}>Нет</option><option value="1" ${user.is_wholesale === 1 ? 'selected' : ''}>Да</option></select></td>
                    <td><select class="admin-edit-select" id="edit-role-${userId}"><option value="user" ${user.role === 'user' ? 'selected' : ''}>Пользователь</option><option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Админ</option></select></td>
                    <td><button class="admin-save-btn" onclick="saveUser(${userId})">Сохранить</button><button class="admin-btn-sm" onclick="renderAdminPanel()">Отмена</button></td>
                `;
            };
            window.saveUser = (userId) => {
                const user = mockUsers.find(u => u.id === userId);
                if (user) {
                    user.email = document.getElementById(`edit-email-${userId}`).value;
                    user.name = document.getElementById(`edit-name-${userId}`).value;
                    user.phone = document.getElementById(`edit-phone-${userId}`).value;
                    user.is_wholesale = parseInt(document.getElementById(`edit-wholesale-${userId}`).value);
                    user.role = document.getElementById(`edit-role-${userId}`).value;
                }
                renderAdminPanel();
            };
        }
        else if (page === 'orders') {
            const statuses = ['new', 'processing', 'completed', 'cancelled'];
            const statusNames = { 'new': 'Новый', 'processing': 'В обработке', 'completed': 'Завершён', 'cancelled': 'Отменён' };
            
            adminContent.innerHTML = `
                <div class="admin-top-bar"><h1 class="admin-page-title">Управление заказами</h1><div class="admin-user-info"><span>${currentMockUser.name}</span><div class="admin-avatar">A</div></div></div>
                <div class="admin-data-table">
                    <table id="ordersTable">
                        <thead><tr><th>ID</th><th>Покупатель</th><th>Сумма</th><th>Статус</th><th>Дата</th><th>Действия</th></tr></thead>
                        <tbody>${mockOrders.map(o => `
                            <tr data-order-id="${o.id}">
                                <td>${o.id}</td>
                                <td>${o.user_name}</td>
                                <td>${o.total_amount} ₽</td>
                                <td class="edit-status" data-status="${o.status}">${statusNames[o.status]}</td>
                                <td>${o.created_at}</td>
                                <td><select class="admin-edit-select" id="status-select-${o.id}">${statuses.map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${statusNames[s]}</option>`).join('')}</select>
                                <button class="admin-save-btn" onclick="updateOrderStatus(${o.id})">Сохранить</button></td>
                            </tr>
                        `).join('')}</tbody>
                    </table>
                </div>
            `;
            window.updateOrderStatus = (orderId) => {
                const order = mockOrders.find(o => o.id === orderId);
                if (order) {
                    const newStatus = document.getElementById(`status-select-${orderId}`).value;
                    order.status = newStatus;
                    renderAdminPanel();
                }
            };
        }
        else if (page === 'logout') {
            window.location.href = '/account.html';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        renderAdminPanel();
        updateMockCartCounter();
        
        document.querySelectorAll('.admin-sidebar a').forEach(link => {
            link.onclick = (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                if (page && page !== 'logout') {
                    const newUrl = window.location.pathname + '?page=' + page;
                    window.history.pushState({}, '', newUrl);
                    renderAdminPanel();
                } else if (page === 'logout') {
                    window.location.href = '/account.html';
                }
            };
        });
    });
    
    window.updateCartCounter = updateMockCartCounter;
})();