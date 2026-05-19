<?php
require_once 'db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    echo json_encode(['error' => 'Неверный ID товара']);
    exit;
}

$stmt = $pdo->prepare("SELECT id, name, price, wholesale_min_qty, wholesale_discount, image, description FROM products WHERE id = ?");
$stmt->execute([$id]);
$product = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$product) {
    echo json_encode(['error' => 'Товар не найден']);
    exit;
}

echo json_encode($product);
?>