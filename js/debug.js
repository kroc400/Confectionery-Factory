// js/debug.js – универсальный режим разработки для всех страниц
(function() {
    // Проверяем параметр dev=1 в URL или сохранённый режим в sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    let isDev = urlParams.get('dev') === '1';
    if (!isDev && sessionStorage.getItem('devmode') === 'true') isDev = true;
    
    // Если включили режим – сохраняем в sessionStorage и чистим URL
    if (urlParams.get('dev') === '1') {
        sessionStorage.setItem('devmode', 'true');
        if (window.history.replaceState) {
            const cleanUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    }
    
    // Если не dev-режим – выходим
    if (!isDev) return;

    console.log('🛠️ DEV-режим включён – используются тестовые данные');
    console.log('💡 Добавьте ?dev=1 к любому URL для включения режима разработки');

    // ========== ДОБАВЛЯЕМ ВИЗУАЛЬНЫЙ БЕЙДЖ ==========
    const devBadge = document.createElement('div');
    devBadge.innerHTML = '🔧 DEV MODE <span style="margin-left:8px;cursor:pointer;font-size:14px;font-weight:bold;" class="dev-close">✕</span>';
    devBadge.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #ff5722;
        color: white;
        padding: 6px 14px;
        border-radius: 30px;
        font-size: 12px;
        font-weight: bold;
        z-index: 9999;
        font-family: monospace;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        pointer-events: auto;
        backdrop-filter: blur(4px);
    `;
    devBadge.querySelector('.dev-close').onclick = () => {
        sessionStorage.removeItem('devmode');
        location.reload();
    };
    document.body.appendChild(devBadge);

    // ========== МОК-ДАННЫЕ ==========
    const mockProducts = [
        { id: 1, name: 'Звёздный вальс', price: 350, wholesale_min_qty: 10, wholesale_discount: 15, image: '/img/products/звездный_вальс.jfif', description: 'Шоколадные трюфели с бархатистой текстурой', full_description: '<p>«Звёздный вальс» — коллекция шоколадных трюфелей...</p>' },
        { id: 2, name: 'Медовый луг', price: 420, wholesale_min_qty: 8, wholesale_discount: 12, image: '/img/products/медовый_луг.jfif', description: 'Пралине с цельным фундуком', full_description: '<p>Серия «Медовый луг» — это дань уважения старинным рецептам...</p>' },
        { id: 3, name: 'Морской бриз', price: 280, wholesale_min_qty: 12, wholesale_discount: 18, image: '/img/products/морской_бриз.jfif', description: 'Освежающие леденцы', full_description: '<p>«Морской бриз» — уникальная серия конфет...</p>' },
        { id: 4, name: 'Бабушкины сказки', price: 390, wholesale_min_qty: 6, wholesale_discount: 10, image: '/img/products/бабушкины_сказки.jfif', description: 'Нежное суфле в шоколаде', full_description: '<p>«Бабушкины сказки» — это путешествие в детство...</p>' }
    ];

    const mockUsers = [
        { id: 1, email: 'demo@example.com', name: 'Иван Петров', phone: '+7 (999) 123-45-67', is_wholesale: 0, role: 'user', created_at: '2024-01-15 10:30:00' },
        { id: 2, email: 'wholesale@example.com', name: 'Мария Смирнова', phone: '+7 (999) 765-43-21', is_wholesale: 1, role: 'user', created_at: '2024-02-20 14:20:00' },
        { id: 3, email: 'admin@example.com', name: 'Администратор', phone: '+7 (999) 000-00-00', is_wholesale: 1, role: 'admin', created_at: '2024-01-01 09:00:00' }
    ];

    const mockOrders = [
        { id: 156, user_name: 'Иван Петров', total_amount: 2450, status: 'completed', created_at: '2024-05-15 10:30:00' },
        { id: 155, user_name: 'Мария Смирнова', total_amount: 1280, status: 'processing', created_at: '2024-05-14 14:20:00' },
        { id: 154, user_name: 'Алексей К.', total_amount: 3900, status: 'new', created_at: '2024-05-13 09:15:00' },
        { id: 153, user_name: 'Елена В.', total_amount: 5600, status: 'completed', created_at: '2024-05-12 16:45:00' },
        { id: 152, user_name: 'Дмитрий П.', total_amount: 890, status: 'cancelled', created_at: '2024-05-11 11:00:00' }
    ];

    const mockStats = {
        users: mockUsers.length,
        products: mockProducts.length,
        orders: mockOrders.length,
        revenue: mockOrders.reduce((sum, o) => sum + o.total_amount, 0)
    };

    // ========== ФУНКЦИЯ ДЛЯ ЗАПОЛНЕНИЯ АДМИНКИ ==========
    function renderAdminPanel() {
        // Проверяем, находимся ли мы на странице админки
        const adminContent = document.querySelector('.admin-content');
        if (!adminContent) return;
        
        console.log('[DEV] Заполняем админ-панель мок-данными');
        
        // Получаем текущую страницу из URL или из data-атрибута
        const urlParams = new URLSearchParams(window.location.search);
        let page = urlParams.get('page') || 'dashboard';
        
        // Активные классы для меню
        document.querySelectorAll('.admin-sidebar a').forEach(link => {
            const linkPage = link.getAttribute('data-page');
            if (linkPage === page) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Рендерим нужную страницу
        switch(page) {
            case 'dashboard':
                adminContent.innerHTML = `
                    <div class="top-bar">
                        <h1 class="page-title">Панель управления</h1>
                        <div class="user-info">
                            <span>Администратор</span>
                            <div class="avatar">A</div>
                        </div>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-card"><div class="stat-number">${mockStats.users}</div><div>Пользователей</div><div class="stat-change">↑ 12% за месяц</div></div>
                        <div class="stat-card"><div class="stat-number">${mockStats.products}</div><div>Товаров</div><div class="stat-change">+2 добавлено</div></div>
                        <div class="stat-card"><div class="stat-number">${mockStats.orders}</div><div>Заказов</div><div class="stat-change">↑ 8% за месяц</div></div>
                        <div class="stat-card"><div class="stat-number">${mockStats.revenue.toLocaleString()} ₽</div><div>Выручка</div><div class="stat-change">↑ 15% за месяц</div></div>
                    </div>
                    <div class="data-table">
                        <h3>Последние заказы</h3>
                        <table>
                            <thead><tr><th>ID</th><th>Покупатель</th><th>Сумма</th><th>Статус</th><th>Дата</th><th></th></tr></thead>
                            <tbody>
                                ${mockOrders.slice(0, 5).map(order => `
                                    <tr>
                                        <td>#${order.id}</td>
                                        <td>${order.user_name}</td>
                                        <td>${order.total_amount.toLocaleString()} ₽</td>
                                        <td>${getStatusBadge(order.status)}</td>
                                        <td>${order.created_at}</td>
                                        <td><button class="btn btn-primary">Детали</button></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
                break;
                
            case 'reports':
                adminContent.innerHTML = `
                    <div class="top-bar">
                        <h1 class="page-title">📈 Отчёты и аналитика</h1>
                        <div class="user-info">
                            <span>Администратор</span>
                            <div class="avatar">A</div>
                        </div>
                    </div>
                    <div class="reports-grid">
                        <div class="report-card">
                            <h3>🏆 Топ-3 товаров</h3>
                            <table style="width:100%">
                                <tr><th>Товар</th><th>Продано</th><th>Выручка</th></tr>
                                <tr><td>Звёздный вальс</td><td>145 шт</td><td>50 750 ₽</td></tr>
                                <tr><td>Медовый луг</td><td>98 шт</td><td>41 160 ₽</td></tr>
                                <tr><td>Бабушкины сказки</td><td>76 шт</td><td>29 640 ₽</td></tr>
                            </table>
                        </div>
                        <div class="report-card">
                            <h3>📅 Продажи по месяцам</h3>
                            <table style="width:100%">
                                <tr><th>Месяц</th><th>Заказов</th><th>Выручка</th></tr>
                                <tr><td>Март 2024</td><td>32</td><td>45 600 ₽</td></tr>
                                <tr><td>Апрель 2024</td><td>38</td><td>52 300 ₽</td></tr>
                                <tr><td>Май 2024</td><td>28</td><td>36 400 ₽</td></tr>
                            </table>
                        </div>
                        <div class="report-card">
                            <h3>👑 Лучшие покупатели</h3>
                            <table style="width:100%">
                                <tr><th>Покупатель</th><th>Заказов</th><th>Потрачено</th></tr>
                                <tr><td>Иван Петров</td><td>5</td><td>12 450 ₽</td></tr>
                                <tr><td>Мария Смирнова</td><td>3</td><td>8 900 ₽</td></tr>
                                <tr><td>Алексей К.</td><td>2</td><td>5 600 ₽</td></tr>
                            </table>
                        </div>
                    </div>
                `;
                break;
                
            case 'users':
                adminContent.innerHTML = `
                    <div class="top-bar">
                        <h1 class="page-title">👥 Управление пользователями</h1>
                        <div class="user-info">
                            <span>Администратор</span>
                            <div class="avatar">A</div>
                        </div>
                    </div>
                    <div class="data-table">
                        <table>
                            <thead><tr><th>ID</th><th>Email</th><th>Имя</th><th>Телефон</th><th>Оптовик</th><th>Роль</th><th>Дата регистрации</th></tr></thead>
                            <tbody>
                                ${mockUsers.map(user => `
                                    <tr>
                                        <td>${user.id}</td>
                                        <td>${user.email}</td>
                                        <td>${user.name}</td>
                                        <td>${user.phone || '-'}</td>
                                        <td>${user.is_wholesale ? '✅ Да' : '❌ Нет'}</td>
                                        <td>${user.role === 'admin' ? '👑 Админ' : '👤 Пользователь'}</td>
                                        <td>${user.created_at}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
                break;
                
            case 'orders':
                adminContent.innerHTML = `
                    <div class="top-bar">
                        <h1 class="page-title">📦 Управление заказами</h1>
                        <div class="user-info">
                            <span>Администратор</span>
                            <div class="avatar">A</div>
                        </div>
                    </div>
                    <div class="data-table">
                        <table>
                            <thead><tr><th>ID</th><th>Пользователь</th><th>Сумма</th><th>Статус</th><th>Дата</th><th></th></tr></thead>
                            <tbody>
                                ${mockOrders.map(order => `
                                    <tr>
                                        <td>#${order.id}</td>
                                        <td>${order.user_name}</td>
                                        <td>${order.total_amount.toLocaleString()} ₽</td>
                                        <td>${getStatusBadge(order.status)}</td>
                                        <td>${order.created_at}</td>
                                        <td><button class="btn btn-sm">✏️</button> <button class="btn btn-sm btn-danger">🗑️</button></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
                break;
                
            case 'forms':
                adminContent.innerHTML = `
                    <div class="top-bar">
                        <h1 class="page-title">📝 Формы (ЛР №11)</h1>
                        <div class="user-info">
                            <span>Администратор</span>
                            <div class="avatar">A</div>
                        </div>
                    </div>
                    <div class="form-demo">
                        <h2 style="margin-bottom: 20px;">Форма обратной связи</h2>
                        <form id="feedbackForm">
                            <div class="form-group"><label>Ваше имя</label><input type="text" name="name" required></div>
                            <div class="form-group"><label>Email</label><input type="email" name="email" required></div>
                            <div class="form-group">
                                <label>Товар</label>
                                <select name="product_id">
                                    <option value="">-- Выберите товар --</option>
                                    ${mockProducts.map(p => `<option value="${p.id}">${p.name} - ${p.price} ₽</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group"><label>Количество</label><input type="number" name="quantity" value="1" min="1"></div>
                            <div class="form-group"><label>Сообщение</label><textarea name="message" rows="4" required></textarea></div>
                            <button type="submit" class="btn btn-primary">Отправить сообщение</button>
                        </form>
                        <div id="formResult" style="margin-top: 20px;"></div>
                    </div>
                `;
                
                // Обработка формы
                const form = document.getElementById('feedbackForm');
                if (form) {
                    form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        const resultDiv = document.getElementById('formResult');
                        resultDiv.innerHTML = '<div style="padding: 15px; background: #d1fae5; border-radius: 12px; color: #059669;">✅ Сообщение отправлено! (демо-режим)</div>';
                        form.reset();
                        setTimeout(() => resultDiv.innerHTML = '', 3000);
                    });
                }
                break;
                
            default:
                adminContent.innerHTML = `<div class="top-bar"><h1 class="page-title">Страница не найдена</h1></div>`;
        }
    }

    // Вспомогательная функция для статусов
    function getStatusBadge(status) {
        const statusMap = {
            'new': '<span class="status-badge status-new">🟡 Новый</span>',
            'processing': '<span class="status-badge status-processing">🔵 В обработке</span>',
            'completed': '<span class="status-badge status-completed">✅ Завершён</span>',
            'cancelled': '<span class="status-badge status-cancelled">❌ Отменён</span>'
        };
        return statusMap[status] || status;
    }

    // Добавляем стили для админки, если их нет
    function addAdminStyles() {
        if (document.getElementById('dev-admin-styles')) return;
        const style = document.createElement('style');
        style.id = 'dev-admin-styles';
        style.textContent = `
            .top-bar { background: white; border-radius: 16px; padding: 16px 24px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
            .page-title { font-size: 1.8rem; font-weight: 700; color: #1a1a2e; margin: 0; }
            .user-info { display: flex; align-items: center; gap: 12px; }
            .avatar { width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; margin-bottom: 40px; }
            .stat-card { background: white; border-radius: 20px; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: transform 0.2s; }
            .stat-card:hover { transform: translateY(-5px); }
            .stat-number { font-size: 2.2rem; font-weight: 700; color: #a3222f; }
            .stat-change { color: #48bb78; font-size: 0.8rem; margin-top: 8px; }
            .data-table { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .data-table h3 { padding: 20px 20px 0; margin: 0; color: #1a1a2e; }
            .data-table table { width: 100%; border-collapse: collapse; }
            .data-table th { background: #f7fafc; padding: 16px; text-align: left; font-weight: 600; color: #4a5568; }
            .data-table td { padding: 16px; border-top: 1px solid #e2e8f0; color: #718096; }
            .reports-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 24px; }
            .report-card { background: white; border-radius: 20px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .report-card h3 { margin-bottom: 15px; color: #1a1a2e; }
            .form-demo { background: white; border-radius: 20px; padding: 24px; max-width: 600px; margin: 0 auto; }
            .form-group { margin-bottom: 20px; }
            .form-group label { display: block; margin-bottom: 8px; font-weight: 500; color: #4a5568; }
            .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 14px; }
            .btn { padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-weight: 500; transition: all 0.2s; }
            .btn-primary { background: #a3222f; color: white; }
            .btn-primary:hover { background: #7e1924; }
            .btn-sm { padding: 4px 8px; font-size: 12px; background: #e2e8f0; }
            .btn-danger { background: #f56565; color: white; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
            .status-new { background: #fef3c7; color: #d97706; }
            .status-processing { background: #dbeafe; color: #2563eb; }
            .status-completed { background: #d1fae5; color: #059669; }
            .status-cancelled { background: #fee2e2; color: #dc2626; }
        `;
        document.head.appendChild(style);
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    document.addEventListener('DOMContentLoaded', () => {
        addAdminStyles();
        renderAdminPanel();
        
        // Обработка кликов по меню
        document.querySelectorAll('.admin-sidebar a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                if (page) {
                    const newUrl = `${window.location.pathname}?page=${page}`;
                    window.history.pushState({}, '', newUrl);
                    renderAdminPanel();
                }
            });
        });
    });
})();