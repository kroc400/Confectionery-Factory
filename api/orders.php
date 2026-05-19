<?php
require_once 'db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// GET: получение истории заказов
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
    if ($user_id <= 0) {
        echo json_encode(['error' => 'Не указан user_id']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT id, total_amount, status, DATE_FORMAT(created_at, '%d.%m.%Y %H:%i') as created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user_id]);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($orders);
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Ошибка БД: ' . $e->getMessage()]);
    }
    exit;
}

// POST: оформление заказа
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $user_id = (int)($data['user_id'] ?? 0);
    
    if ($user_id <= 0) {
        echo json_encode(['error' => 'Не указан пользователь']);
        exit;
    }
    
    try {
        $pdo->beginTransaction();
        
        // Получаем корзину с расчётом оптовых цен
        $stmt = $pdo->prepare("
            SELECT c.product_id, c.quantity,
                   p.price as original_price,
                   p.wholesale_min_qty,
                   p.wholesale_discount,
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
        
        // Расчёт итога
        $total = 0;
        foreach ($cart as $item) {
            $total += $item['final_price'] * $item['quantity'];
        }
        
        // Создаём заказ
        $stmt = $pdo->prepare("INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, 'new')");
        $stmt->execute([$user_id, $total]);
        $order_id = $pdo->lastInsertId();
        
        // Сохраняем позиции
        $stmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)");
        foreach ($cart as $item) {
            $stmt->execute([$order_id, $item['product_id'], $item['quantity'], $item['final_price']]);
        }
        
        // Очищаем корзину
        $stmt = $pdo->prepare("DELETE FROM cart WHERE user_id = ?");
        $stmt->execute([$user_id]);
        
        $pdo->commit();
        echo json_encode(['success' => true, 'order_id' => $order_id]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

echo json_encode(['error' => 'Метод не поддерживается']);
?>