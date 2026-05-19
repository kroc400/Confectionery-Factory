<?php
require_once 'db.php';
$data = json_decode(file_get_contents('php://input'), true);
$user_id = $data['user_id'];

try {
    $pdo->beginTransaction();
    
    // 1. Получаем корзину пользователя
    $stmt = $pdo->prepare("
        SELECT c.product_id, c.quantity, p.price, 
               CASE 
                   WHEN c.quantity >= p.wholesale_min_qty THEN p.price * (100 - p.wholesale_discount) / 100
                   ELSE p.price
               END as final_price
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    ");
    $stmt->execute([$user_id]);
    $cart = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($cart)) {
        throw new Exception('Корзина пуста');
    }
    
    // 2. Рассчитываем итоговую сумму
    $total = array_sum(array_map(function($item) {
        return $item['final_price'] * $item['quantity'];
    }, $cart));
    
    // 3. Создаем заказ
    $stmt = $pdo->prepare("INSERT INTO orders (user_id, total_amount) VALUES (?, ?)");
    $stmt->execute([$user_id, $total]);
    $order_id = $pdo->lastInsertId();
    
    // 4. Добавляем позиции заказа
    $stmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)");
    foreach ($cart as $item) {
        $stmt->execute([$order_id, $item['product_id'], $item['quantity'], $item['final_price']]);
    }
    
    // 5. Очищаем корзину
    $stmt = $pdo->prepare("DELETE FROM cart WHERE user_id = ?");
    $stmt->execute([$user_id]);
    
    $pdo->commit();
    echo json_encode(['success' => true, 'order_id' => $order_id]);
    
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['error' => $e->getMessage()]);
}
?>