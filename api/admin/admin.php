<?php
session_start();
require_once '../db.php';

// Проверка авторизации
$userId = $_SESSION['user_id'] ?? null;
if (!$userId) {
    header('Location: /account.html');
    exit;
}

$stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || $user['role'] !== 'admin') {
    die('Доступ запрещён. Только для администраторов.');
}

// ========== ОБРАБОТКА POST-ЗАПРОСОВ ==========
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    // Сохранение пользователя
    if ($action === 'save_user') {
        $editId = (int)$_POST['user_id'];
        $email = trim($_POST['email']);
        $name = trim($_POST['name']);
        $phone = trim($_POST['phone']);
        $isWholesale = (int)$_POST['is_wholesale'];
        $role = $_POST['role'];
        
        $stmt = $pdo->prepare("UPDATE users SET email = ?, name = ?, phone = ?, is_wholesale = ?, role = ? WHERE id = ?");
        $stmt->execute([$email, $name, $phone, $isWholesale, $role, $editId]);
        
        header('Location: admin.php?page=users&saved=1');
        exit;
    }
    
    // Изменение статуса заказа
    if ($action === 'update_order_status') {
        $orderId = (int)$_POST['order_id'];
        $status = $_POST['status'];
        
        $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $stmt->execute([$status, $orderId]);
        
        header('Location: admin.php?page=orders&updated=1');
        exit;
    }
}

$page = $_GET['page'] ?? 'dashboard';
$saved = isset($_GET['saved']);
$updated = isset($_GET['updated']);
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Админ-панель | Сладость веков</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
    <style>
        :root {
            --color-white: #ffffff;
            --color-red: #E60000;
            --color-yellow: #FFE8BA;
            --color-dark: #1A202C;
            --font-family-base: 'Inter', sans-serif;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: var(--font-family-base); background: #f5f5f5; min-height: 100vh; }
        .admin-container { display: flex; min-height: 100vh; }
        .admin-sidebar { width: 260px; background: var(--color-red); color: white; padding: 20px 0; position: fixed; height: 100vh; overflow-y: auto; }
        .sidebar-header { text-align: center; padding: 0 20px 20px; border-bottom: 1px solid rgba(255,255,255,0.2); margin-bottom: 20px; }
        .sidebar-header h2 { font-size: 1.3rem; font-weight: 700; }
        .sidebar-header p { font-size: 0.7rem; opacity: 0.8; margin-top: 5px; }
        .admin-sidebar a { display: block; color: white; text-decoration: none; padding: 12px 24px; margin: 0; font-weight: 500; transition: background 0.2s; }
        .admin-sidebar a:hover { background: rgba(255,255,255,0.15); }
        .admin-sidebar a.active { background: rgba(255,255,255,0.25); font-weight: 600; }
        .admin-content { flex: 1; margin-left: 260px; padding: 20px 30px; }
        .admin-top-bar { background: white; padding: 15px 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #ddd; }
        .admin-page-title { font-size: 1.5rem; font-weight: 700; color: var(--color-dark); }
        .admin-user-info { display: flex; align-items: center; gap: 10px; }
        .admin-avatar { width: 35px; height: 35px; background: var(--color-red); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; }
        .admin-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
        .admin-stat-card { background: white; padding: 20px; border: 1px solid #ddd; }
        .admin-stat-number { font-size: 2rem; font-weight: 700; color: var(--color-red); }
        .admin-stat-title { color: #666; font-size: 0.85rem; margin-top: 5px; }
        .admin-data-table { background: white; border: 1px solid #ddd; overflow-x: auto; }
        .admin-data-table h3 { padding: 15px 20px; font-size: 1.2rem; font-weight: 600; border-bottom: 1px solid #ddd; background: #fafafa; }
        .admin-data-table table { width: 100%; border-collapse: collapse; }
        .admin-data-table th { background: #f5f5f5; padding: 12px 15px; text-align: left; font-weight: 600; border-bottom: 1px solid #ddd; }
        .admin-data-table td { padding: 12px 15px; border-bottom: 1px solid #eee; }
        .admin-btn { background: var(--color-red); color: white; border: none; padding: 6px 14px; font-size: 0.8rem; cursor: pointer; }
        .admin-btn:hover { background: #b30000; }
        .admin-btn-sm { background: #ddd; color: #333; padding: 4px 10px; font-size: 0.7rem; cursor: pointer; border: none; }
        .admin-reports-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .admin-report-card { background: white; padding: 20px; border: 1px solid #ddd; }
        .admin-report-card h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #ddd; }
        .admin-report-card table { width: 100%; }
        .admin-report-card td { padding: 6px 0; }
        .admin-edit-input, .admin-edit-select { width: 100%; padding: 5px; border: 1px solid #ddd; font-family: inherit; }
        .admin-save-btn { background: #10b981; color: white; border: none; padding: 4px 10px; cursor: pointer; margin-right: 5px; }
        .admin-edit-btn { background: #3b82f6; color: white; border: none; padding: 4px 10px; cursor: pointer; margin-right: 5px; }
        .success-msg { background: #d1fae5; color: #059669; padding: 10px 15px; margin-bottom: 20px; border: 1px solid #059669; }
        @media (max-width: 1000px) { .admin-stats-grid { grid-template-columns: repeat(2, 1fr); } .admin-reports-grid { grid-template-columns: 1fr; } }
        @media (max-width: 768px) { .admin-sidebar { width: 200px; } .admin-content { margin-left: 200px; } .admin-stats-grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="admin-container">
        <aside class="admin-sidebar">
            <div class="sidebar-header">
                <h2>Сладость веков</h2>
                <p>Админ-панель</p>
            </div>
            <a href="?page=dashboard" class="<?= $page === 'dashboard' ? 'active' : '' ?>">Панель управления</a>
            <a href="?page=reports" class="<?= $page === 'reports' ? 'active' : '' ?>">Отчёты</a>
            <a href="?page=users" class="<?= $page === 'users' ? 'active' : '' ?>">Пользователи</a>
            <a href="?page=orders" class="<?= $page === 'orders' ? 'active' : '' ?>">Заказы</a>
            <a href="/account.html" style="margin-top: 40px;">Выход</a>
        </aside>
        
        <main class="admin-content">
            <?php if ($saved): ?>
                <div class="success-msg">Пользователь сохранён</div>
            <?php endif; ?>
            <?php if ($updated): ?>
                <div class="success-msg">Статус заказа обновлён</div>
            <?php endif; ?>
            
            <?php if ($page === 'dashboard'): 
                $userCount = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
                $productCount = $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
                $orderCount = $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
                $orderSum = $pdo->query("SELECT SUM(total_amount) FROM orders WHERE status != 'cancelled'")->fetchColumn();
                $recentOrders = $pdo->query("SELECT o.id, u.name, o.total_amount, o.status, DATE_FORMAT(o.created_at, '%d.%m.%Y %H:%i') as created_at FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.id DESC LIMIT 5")->fetchAll();
            ?>
                <div class="admin-top-bar">
                    <h1 class="admin-page-title">Панель управления</h1>
                    <div class="admin-user-info"><span>Администратор</span><div class="admin-avatar">A</div></div>
                </div>
                <div class="admin-stats-grid">
                    <div class="admin-stat-card"><div class="admin-stat-number"><?= $userCount ?></div><div class="admin-stat-title">Пользователей</div></div>
                    <div class="admin-stat-card"><div class="admin-stat-number"><?= $productCount ?></div><div class="admin-stat-title">Товаров</div></div>
                    <div class="admin-stat-card"><div class="admin-stat-number"><?= $orderCount ?></div><div class="admin-stat-title">Заказов</div></div>
                    <div class="admin-stat-card"><div class="admin-stat-number"><?= number_format($orderSum, 0, '.', ' ') ?> ₽</div><div class="admin-stat-title">Выручка</div></div>
                </div>
                <div class="admin-data-table">
                    <h3>Последние заказы</h3>
                    <table>
                        <thead><tr><th>ID</th><th>Покупатель</th><th>Сумма</th><th>Статус</th><th>Дата</th></tr></thead>
                        <tbody><?php foreach ($recentOrders as $order): ?>
                            <tr><td><?= $order['id'] ?></td><td><?= htmlspecialchars($order['name']) ?></td><td><?= $order['total_amount'] ?> ₽</td><td><?= $order['status'] ?></td><td><?= $order['created_at'] ?></td></tr>
                        <?php endforeach; ?></tbody>
                    </table>
                </div>
            <?php elseif ($page === 'reports'):
                // Статистика
                $totalRevenue = $pdo->query("SELECT SUM(total_amount) FROM orders WHERE status != 'cancelled'")->fetchColumn();
                $totalOrders = $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
                $avgOrder = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;
                $wholesaleUsers = $pdo->query("SELECT COUNT(*) FROM users WHERE is_wholesale = 1")->fetchColumn();
                $newOrders = $pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'new'")->fetchColumn();
                $processingOrders = $pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'processing'")->fetchColumn();
                $completedOrders = $pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'completed'")->fetchColumn();
                
                // Топ товаров
                $topProducts = $pdo->query("SELECT p.name, SUM(oi.quantity) as sold, SUM(oi.quantity * oi.price_at_time) as revenue FROM order_items oi JOIN products p ON oi.product_id = p.id GROUP BY oi.product_id ORDER BY sold DESC LIMIT 3")->fetchAll();
                
                // Продажи по месяцам
                $monthlySales = $pdo->query("SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as orders, SUM(total_amount) as revenue FROM orders WHERE status != 'cancelled' GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month DESC LIMIT 3")->fetchAll();
            ?>
                <div class="admin-top-bar"><h1 class="admin-page-title">Отчёты и аналитика</h1><div class="admin-user-info"><span>Администратор</span><div class="admin-avatar">A</div></div></div>
                <div class="admin-stats-grid">
                    <div class="admin-stat-card"><div class="admin-stat-number"><?= round($avgOrder) ?> ₽</div><div class="admin-stat-title">Средний чек</div></div>
                    <div class="admin-stat-card"><div class="admin-stat-number"><?= $wholesaleUsers ?></div><div class="admin-stat-title">Оптовых покупателей</div></div>
                    <div class="admin-stat-card"><div class="admin-stat-number"><?= $totalOrders ?></div><div class="admin-stat-title">Всего заказов</div></div>
                    <div class="admin-stat-card"><div class="admin-stat-number"><?= number_format($totalRevenue, 0, '.', ' ') ?> ₽</div><div class="admin-stat-title">Общая выручка</div></div>
                </div>
                <div class="admin-reports-grid">
                    <div class="admin-report-card"><h3>Топ товаров</h3><table><?php foreach ($topProducts as $p): ?><tr><td><?= htmlspecialchars($p['name']) ?></td><td><?= $p['sold'] ?> шт</td><td><?= number_format($p['revenue'], 0, '.', ' ') ?> ₽</td></tr><?php endforeach; ?></table></div>
                    <div class="admin-report-card"><h3>Продажи по месяцам</h3><table><?php foreach ($monthlySales as $m): ?><tr><td><?= $m['month'] ?></td><td><?= $m['orders'] ?></td><td><?= number_format($m['revenue'], 0, '.', ' ') ?> ₽</td></tr><?php endforeach; ?></table></div>
                    <div class="admin-report-card"><h3>Статусы заказов</h3><table><tr><td>Новые</td><td><?= $newOrders ?></td></tr><tr><td>В обработке</td><td><?= $processingOrders ?></td></tr><tr><td>Завершённые</td><td><?= $completedOrders ?></td></tr></table></div>
                </div>
            <?php elseif ($page === 'users'): 
                $users = $pdo->query("SELECT id, email, name, phone, is_wholesale, role, created_at FROM users ORDER BY id")->fetchAll();
            ?>
                <div class="admin-top-bar"><h1 class="admin-page-title">Управление пользователями</h1><div class="admin-user-info"><span>Администратор</span><div class="admin-avatar">A</div></div></div>
                <div class="admin-data-table">
                    <form method="POST" id="userEditForm">
                        <input type="hidden" name="action" value="save_user">
                        <input type="hidden" name="user_id" id="edit_user_id">
                        <table>
                            <thead><tr><th>ID</th><th>Email</th><th>Имя</th><th>Телефон</th><th>Оптовик</th><th>Роль</th><th>Действия</th></tr></thead>
                            <tbody>
                                <?php foreach ($users as $u): ?>
                                <tr data-user-id="<?= $u['id'] ?>">
                                    <td><?= $u['id'] ?></td>
                                    <td class="email-cell"><?= htmlspecialchars($u['email']) ?></td>
                                    <td class="name-cell"><?= htmlspecialchars($u['name']) ?></td>
                                    <td class="phone-cell"><?= htmlspecialchars($u['phone'] ?? '-') ?></td>
                                    <td class="wholesale-cell"><?= $u['is_wholesale'] ? 'Да' : 'Нет' ?></td>
                                    <td class="role-cell"><?= $u['role'] === 'admin' ? 'Админ' : 'Пользователь' ?></td>
                                    <td><button type="button" class="admin-edit-btn" onclick="editUser(<?= $u['id'] ?>, '<?= htmlspecialchars($u['email']) ?>', '<?= htmlspecialchars($u['name']) ?>', '<?= htmlspecialchars($u['phone']) ?>', <?= $u['is_wholesale'] ?>, '<?= $u['role'] ?>')">Редактировать</button></td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                        <div id="editFields" style="display:none; margin-top:20px; padding:20px; border:1px solid #ddd; background:#fafafa;">
                            <h3>Редактирование пользователя</h3>
                            <div style="display:grid; gap:10px; grid-template-columns:repeat(2,1fr); margin-top:15px;">
                                <div><label>Email</label><input type="email" name="email" id="edit_email" class="admin-edit-input" style="width:100%"></div>
                                <div><label>Имя</label><input type="text" name="name" id="edit_name" class="admin-edit-input" style="width:100%"></div>
                                <div><label>Телефон</label><input type="text" name="phone" id="edit_phone" class="admin-edit-input" style="width:100%"></div>
                                <div><label>Оптовик</label><select name="is_wholesale" id="edit_wholesale" class="admin-edit-select" style="width:100%"><option value="0">Нет</option><option value="1">Да</option></select></div>
                                <div><label>Роль</label><select name="role" id="edit_role" class="admin-edit-select" style="width:100%"><option value="user">Пользователь</option><option value="admin">Админ</option></select></div>
                            </div>
                            <div style="margin-top:15px;"><button type="submit" class="admin-save-btn">Сохранить</button><button type="button" class="admin-btn-sm" onclick="cancelEdit()">Отмена</button></div>
                        </div>
                    </form>
                </div>
                <script>
                    function editUser(id, email, name, phone, isWholesale, role) {
                        document.getElementById('edit_user_id').value = id;
                        document.getElementById('edit_email').value = email;
                        document.getElementById('edit_name').value = name;
                        document.getElementById('edit_phone').value = phone === '-' ? '' : phone;
                        document.getElementById('edit_wholesale').value = isWholesale;
                        document.getElementById('edit_role').value = role;
                        document.getElementById('editFields').style.display = 'block';
                        document.getElementById('editFields').scrollIntoView({ behavior: 'smooth' });
                    }
                    function cancelEdit() {
                        document.getElementById('editFields').style.display = 'none';
                        document.getElementById('edit_user_id').value = '';
                    }
                </script>
            <?php elseif ($page === 'orders'): 
                $orders = $pdo->query("SELECT o.id, u.name as user_name, o.total_amount, o.status, DATE_FORMAT(o.created_at, '%d.%m.%Y %H:%i') as created_at FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.id DESC")->fetchAll();
            ?>
                <div class="admin-top-bar"><h1 class="admin-page-title">Управление заказами</h1><div class="admin-user-info"><span>Администратор</span><div class="admin-avatar">A</div></div></div>
                <div class="admin-data-table">
                    <form method="POST" id="orderStatusForm">
                        <input type="hidden" name="action" value="update_order_status">
                        <input type="hidden" name="order_id" id="order_id">
                        <table>
                            <thead><tr><th>ID</th><th>Покупатель</th><th>Сумма</th><th>Статус</th><th>Дата</th><th>Действия</th></tr></thead>
                            <tbody>
                                <?php foreach ($orders as $o): ?>
                                <tr>
                                    <td><?= $o['id'] ?></td>
                                    <td><?= htmlspecialchars($o['user_name']) ?></td>
                                    <td><?= $o['total_amount'] ?> ₽</td>
                                    <td class="status-cell-<?= $o['id'] ?>"><?= $o['status'] ?></td>
                                    <td><?= $o['created_at'] ?></td>
                                    <td>
                                        <select class="admin-edit-select" id="status_select_<?= $o['id'] ?>">
                                            <option value="new" <?= $o['status'] === 'new' ? 'selected' : '' ?>>Новый</option>
                                            <option value="processing" <?= $o['status'] === 'processing' ? 'selected' : '' ?>>В обработке</option>
                                            <option value="completed" <?= $o['status'] === 'completed' ? 'selected' : '' ?>>Завершён</option>
                                            <option value="cancelled" <?= $o['status'] === 'cancelled' ? 'selected' : '' ?>>Отменён</option>
                                        </select>
                                        <button type="button" class="admin-save-btn" onclick="updateStatus(<?= $o['id'] ?>)">Сохранить</button>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </form>
                </div>
                <script>
                    function updateStatus(orderId) {
                        const select = document.getElementById('status_select_' + orderId);
                        const newStatus = select.value;
                        const form = document.getElementById('orderStatusForm');
                        document.getElementById('order_id').value = orderId;
                        const hiddenInput = document.createElement('input');
                        hiddenInput.type = 'hidden';
                        hiddenInput.name = 'status';
                        hiddenInput.value = newStatus;
                        form.appendChild(hiddenInput);
                        form.submit();
                    }
                </script>
            <?php endif; ?>
        </main>
    </div>
</body>
</html>