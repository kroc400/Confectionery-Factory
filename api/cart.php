<?php
require_once 'db.php';
$data = json_decode(file_get_contents('php://input'), true);
$user_id = $_GET['user_id'] ?? $data['user_id'] ?? null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("
        SELECT c.product_id, c.quantity, p.name, p.price, p.wholesale_min_qty, p.wholesale_discount,
               CASE 
                   WHEN c.quantity >= p.wholesale_min_qty THEN ROUND(p.price * (100 - p.wholesale_discount) / 100, 2)
                   ELSE p.price
               END as final_price,
               ROUND(CASE 
                   WHEN c.quantity >= p.wholesale_min_qty THEN p.price * c.quantity - (p.price * (100 - p.wholesale_discount) / 100 * c.quantity)
                   ELSE 0
               END, 2) as discount_amount
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    ");
    $stmt->execute([$user_id]);
    $cart = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($cart);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Добавление товара в корзину
    $stmt = $pdo->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)
                           ON DUPLICATE KEY UPDATE quantity = quantity + ?");
    $stmt->execute([$user_id, $data['product_id'], $data['quantity'], $data['quantity']]);
    echo json_encode(['success' => true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Обновление количества товара
    $stmt = $pdo->prepare("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?");
    $stmt->execute([$data['quantity'], $user_id, $data['product_id']]);
    echo json_encode(['success' => true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Удаление товара из корзины
    $stmt = $pdo->prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?");
    $stmt->execute([$user_id, $data['product_id']]);
    echo json_encode(['success' => true]);
}
?>