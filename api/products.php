<?php
require_once 'db.php';

$stmt = $pdo->query("SELECT id, name, price, wholesale_min_qty, wholesale_discount, image, description FROM products");
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($products);
?>