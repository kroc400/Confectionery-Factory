<?php
require_once 'db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// ========== ПОЛЬЗОВАТЕЛЬСКАЯ ФУНКЦИЯ ==========
/**
 * Рассчитывает итоговую цену с учётом оптовой скидки и статуса пользователя
 * @param float $price - розничная цена
 * @param int $quantity - количество товара
 * @param int $minWholesaleQty - минимальное количество для опта
 * @param int $discount - процент скидки
 * @param bool $isWholesaleUser - оптовый ли пользователь
 * @return array - ['unit_price' => цена за шт, 'total_price' => общая цена, 'discount_saved' => экономия]
 */
function calculatePriceWithDiscount($price, $quantity, $minWholesaleQty, $discount, $isWholesaleUser = false) {
    $unitPrice = $price;
    $discountApplied = false;
    
    // Условие для применения скидки
    if ($isWholesaleUser || ($minWholesaleQty > 0 && $quantity >= $minWholesaleQty)) {
        $unitPrice = round($price * (100 - $discount) / 100, 2);
        $discountApplied = true;
    }
    
    $totalPrice = round($unitPrice * $quantity, 2);
    $originalTotal = round($price * $quantity, 2);
    $discountSaved = round($originalTotal - $totalPrice, 2);
    
    return [
        'unit_price' => $unitPrice,
        'total_price' => $totalPrice,
        'original_total' => $originalTotal,
        'discount_saved' => $discountSaved,
        'discount_applied' => $discountApplied,
        'discount_percent' => $discountApplied ? $discount : 0
    ];
}

// ========== ОБРАБОТКА ЗАПРОСОВ ==========
$data = json_decode(file_get_contents('php://input'), true);
$user_id = $_GET['user_id'] ?? $data['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(['error' => 'Не указан пользователь']);
    exit;
}

// Получаем статус пользователя (оптовый или нет)
$stmt = $pdo->prepare("SELECT is_wholesale FROM users WHERE id = ?");
$stmt->execute([$user_id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
$isWholesaleUser = $user ? $user['is_wholesale'] == 1 : false;

// ========== GET: получение корзины с циклом и функцией ==========
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("
        SELECT c.product_id, c.quantity, p.name, p.price, p.wholesale_min_qty, p.wholesale_discount
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    ");
    $stmt->execute([$user_id]);
    $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // ========== ЦИКЛ PHP: обрабатываем каждый товар в корзине ==========
    $cart = [];
    $grandTotal = 0;
    $grandOriginal = 0;
    $grandDiscount = 0;
    
    foreach ($cartItems as $item) {
        // Используем нашу функцию для расчёта
        $calc = calculatePriceWithDiscount(
            $item['price'],
            $item['quantity'],
            $item['wholesale_min_qty'],
            $item['wholesale_discount'],
            $isWholesaleUser
        );
        
        $cart[] = [
            'product_id' => $item['product_id'],
            'name' => $item['name'],
            'quantity' => $item['quantity'],
            'price' => (float)$item['price'],
            'final_price' => $calc['unit_price'],
            'total' => $calc['total_price'],
            'discount_saved' => $calc['discount_saved'],
            'discount_percent' => $calc['discount_percent']
        ];
        
        $grandTotal += $calc['total_price'];
        $grandOriginal += $calc['original_total'];
        $grandDiscount += $calc['discount_saved'];
    }
    
    echo json_encode([
        'items' => $cart,
        'summary' => [
            'subtotal' => $grandOriginal,
            'discount' => $grandDiscount,
            'total' => $grandTotal,
            'is_wholesale_user' => $isWholesaleUser
        ]
    ]);
    exit;
}

// ========== POST: Добавление товара ==========
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)
                           ON DUPLICATE KEY UPDATE quantity = quantity + ?");
    $stmt->execute([$user_id, $data['product_id'], $data['quantity'], $data['quantity']]);
    echo json_encode(['success' => true]);
    exit;
}

// ========== PUT: Обновление количества ==========
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $stmt = $pdo->prepare("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?");
    $stmt->execute([$data['quantity'], $user_id, $data['product_id']]);
    echo json_encode(['success' => true]);
    exit;
}

// ========== DELETE: Удаление товара ==========
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $stmt = $pdo->prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?");
    $stmt->execute([$user_id, $data['product_id']]);
    echo json_encode(['success' => true]);
    exit;
}

// ========== OPTIONS: для CORS ==========
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Если метод не поддерживается
echo json_encode(['error' => 'Метод не поддерживается']);
?>