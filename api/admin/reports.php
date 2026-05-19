<?php
// ========== ПОЛЬЗОВАТЕЛЬСКАЯ ФУНКЦИЯ ДЛЯ ОТЧЁТОВ ==========
function formatMoney($amount) {
    return number_format($amount, 2, '.', ' ') . ' ₽';
}

function getStatusBadge($status) {
    switch ($status) {
        case 'new': return '🟡 Новый';
        case 'processing': return '🔵 В обработке';
        case 'completed': return '✅ Завершён';
        case 'cancelled': return '❌ Отменён';
        default: return $status;
    }
}

// ========== ПОЛУЧЕНИЕ ДАННЫХ ДЛЯ ОТЧЁТОВ ==========
// Топ-5 товаров по продажам
$topProducts = $pdo->query("
    SELECT p.name, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.price_at_time) as revenue
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    GROUP BY oi.product_id
    ORDER BY total_sold DESC
    LIMIT 5
")->fetchAll();

// Продажи по месяцам
$monthlySales = $pdo->query("
    SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as orders, SUM(total_amount) as revenue
    FROM orders
    WHERE status != 'cancelled'
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month DESC
    LIMIT 6
")->fetchAll();

// Пользователи с наибольшим количеством заказов
$topUsers = $pdo->query("
    SELECT u.name, u.email, COUNT(o.id) as orders, SUM(o.total_amount) as spent
    FROM users u
    JOIN orders o ON u.id = o.user_id
    GROUP BY u.id
    ORDER BY spent DESC
    LIMIT 5
")->fetchAll();
?>

<h1>📈 Отчёты и аналитика</h1>

<!-- ========== УСЛОВНАЯ КОНСТРУКЦИЯ: проверка наличия данных ========== -->
<?php if (empty($topProducts)): ?>
    <div class="stat-card">Нет данных о продажах</div>
<?php else: ?>
    <div class="stats-grid">
        <div class="stat-card">
            <h3>🏆 Топ-5 товаров</h3>
            <table style="margin-top: 10px;">
                <tr><th>Товар</th><th>Продано</th><th>Выручка</th></tr>
                <?php foreach ($topProducts as $product): ?>
                <tr>
                    <td><?= htmlspecialchars($product['name']) ?></td>
                    <td><?= $product['total_sold'] ?> шт</td>
                    <td><?= formatMoney($product['revenue']) ?></td>
                </tr>
                <?php endforeach; ?>
            </table>
        </div>
        
        <div class="stat-card">
            <h3>📅 Продажи по месяцам</h3>
            <table style="margin-top: 10px;">
                <tr><th>Месяц</th><th>Заказов</th><th>Выручка</th></tr>
                <?php foreach ($monthlySales as $month): ?>
                <tr>
                    <td><?= $month['month'] ?></td>
                    <td><?= $month['orders'] ?></td>
                    <td><?= formatMoney($month['revenue']) ?></td>
                </tr>
                <?php endforeach; ?>
            </table>
        </div>
        
        <div class="stat-card">
            <h3>👑 Лучшие покупатели</h3>
            <table style="margin-top: 10px;">
                <tr><th>Покупатель</th><th>Заказов</th><th>Потрачено</th></tr>
                <?php foreach ($topUsers as $user): ?>
                <tr>
                    <td><?= htmlspecialchars($user['name']) ?></td>
                    <td><?= $user['orders'] ?></td>
                    <td><?= formatMoney($user['spent']) ?></td>
                </tr>
                <?php endforeach; ?>
            </table>
        </div>
    </div>
<?php endif; ?>

<!-- ========== ЦИКЛ PHP: сводная статистика ========== -->
<?php
$totalOrders = $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
$totalRevenue = $pdo->query("SELECT SUM(total_amount) FROM orders WHERE status != 'cancelled'")->fetchColumn();
$avgOrder = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;
$wholesaleUsers = $pdo->query("SELECT COUNT(*) FROM users WHERE is_wholesale = 1")->fetchColumn();
?>
<div class="stats-grid">
    <div class="stat-card"><div class="stat-number"><?= $totalOrders ?></div><div>Всего заказов</div></div>
    <div class="stat-card"><div class="stat-number"><?= formatMoney($totalRevenue) ?></div><div>Общая выручка</div></div>
    <div class="stat-card"><div class="stat-number"><?= formatMoney($avgOrder) ?></div><div>Средний чек</div></div>
    <div class="stat-card"><div class="stat-number"><?= $wholesaleUsers ?></div><div>Оптовых покупателей</div></div>
</div>