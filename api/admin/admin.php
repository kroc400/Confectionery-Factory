<?php
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit;
}
require_once '../db.php';

// Проверка авторизации через сессию (для входа из админки)
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    // Если нет сессии, проверяем, не залогинен ли пользователь через основную авторизацию
    // (для перехода из account.html)
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    // В реальном проекте здесь была бы проверка токена
    // Для простоты перенаправляем на логин
    header('Location: login.php');
    exit;
}

// ========== УСЛОВНЫЕ КОНСТРУКЦИИ PHP (if, elseif, else) ==========
$page = $_GET['page'] ?? 'dashboard';
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Админ-панель</title>
    <link rel="stylesheet" href="../../styles.css">
    <style>
        .admin-container { display: flex; min-height: 100vh; }
        .admin-sidebar { width: 250px; background: #2c1810; color: white; padding: 20px; }
        .admin-sidebar a { display: block; color: white; text-decoration: none; padding: 10px; margin: 5px 0; border-radius: 8px; }
        .admin-sidebar a:hover { background: #a3222f; }
        .admin-content { flex: 1; padding: 20px; background: #f5f5f5; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .stat-number { font-size: 32px; font-weight: bold; color: #a3222f; }
        table { width: 100%; background: white; border-radius: 12px; overflow: hidden; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #a3222f; color: white; }
    </style>
</head>
<body>
    <div class="admin-container">
        <div class="admin-sidebar">
            <h3>Админ-панель</h3>
            <a href="?page=dashboard">📊 Главная</a>
            <a href="?page=reports">📈 Отчёты</a>
            <a href="?page=users">👥 Пользователи</a>
            <a href="?page=orders">📦 Заказы</a>
            <a href="?page=forms">📝 Формы (ЛР №11)</a>
            <a href="logout.php" style="margin-top: 50px;">🚪 Выход</a>
        </div>
        
        <div class="admin-content">
            <?php
            // ========== УСЛОВНЫЕ КОНСТРУКЦИИ (switch) ==========
            switch ($page) {
                case 'dashboard':
                    // Статистика
                    $userCount = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
                    $productCount = $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
                    $orderCount = $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
                    $orderSum = $pdo->query("SELECT SUM(total_amount) FROM orders WHERE status != 'cancelled'")->fetchColumn();
                    ?>
                    <h1>Панель управления</h1>
                    <div class="stats-grid">
                        <div class="stat-card"><div class="stat-number"><?= $userCount ?></div><div>Пользователей</div></div>
                        <div class="stat-card"><div class="stat-number"><?= $productCount ?></div><div>Товаров</div></div>
                        <div class="stat-card"><div class="stat-number"><?= $orderCount ?></div><div>Заказов</div></div>
                        <div class="stat-card"><div class="stat-number"><?= number_format($orderSum, 0, '.', ' ') ?> ₽</div><div>Выручка</div></div>
                    </div>
                    <?php
                    break;
                    
                case 'reports':
                    include 'reports.php';
                    break;
                    
                case 'users':
                    $users = $pdo->query("SELECT id, email, name, phone, is_wholesale, created_at FROM users ORDER BY id DESC")->fetchAll();
                    ?>
                    <h1>👥 Пользователи</h1>
                    <table>
                        <tr><th>ID</th><th>Email</th><th>Имя</th><th>Телефон</th><th>Оптовик</th><th>Дата регистрации</th></tr>
                        <?php foreach ($users as $user): ?>
                        <tr>
                            <td><?= $user['id'] ?></td>
                            <td><?= htmlspecialchars($user['email']) ?></td>
                            <td><?= htmlspecialchars($user['name']) ?></td>
                            <td><?= htmlspecialchars($user['phone'] ?? '-') ?></td>
                            <td><?= $user['is_wholesale'] ? '✅ Да' : '❌ Нет' ?></td>
                            <td><?= $user['created_at'] ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </table>
                    <?php
                    break;
                    
                case 'orders':
                    $orders = $pdo->query("SELECT o.*, u.name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.id DESC")->fetchAll();
                    ?>
                    <h1>📦 Заказы</h1>
                    <table>
                        <tr><th>ID</th><th>Пользователь</th><th>Сумма</th><th>Статус</th><th>Дата</th></tr>
                        <?php foreach ($orders as $order): ?>
                        <tr>
                            <td><?= $order['id'] ?></td>
                            <td><?= htmlspecialchars($order['name']) ?></td>
                            <td><?= $order['total_amount'] ?> ₽</td>
                            <td><?= $order['status'] ?></td>
                            <td><?= $order['created_at'] ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </table>
                    <?php
                    break;
                    
                case 'forms':
                    include 'forms-demo.php';
                    break;
                    
                default:
                    echo "<h1>Страница не найдена</h1>";
                    break;
            }
            ?>
        </div>
    </div>
</body>
</html>