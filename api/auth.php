<?php
require_once 'db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $data['action'] ?? '';
    
    if ($action === 'register') {
        // Проверка на существование пользователя
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        if ($stmt->fetch()) {
            echo json_encode(['error' => 'Пользователь с таким email уже существует']);
            exit;
        }
        
        // Хеширование пароля
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // Создание пользователя (по умолчанию роль 'user')
        $stmt = $pdo->prepare("INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, 'user')");
        $stmt->execute([$data['email'], $hashedPassword, $data['name'], $data['phone']]);
        
        echo json_encode(['success' => true, 'user_id' => $pdo->lastInsertId()]);
    }
    
    if ($action === 'login') {
        $stmt = $pdo->prepare("SELECT id, email, password, name, is_wholesale, role FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && password_verify($data['password'], $user['password'])) {
            unset($user['password']);
            echo json_encode(['success' => true, 'user' => $user]);

            session_start();
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_role'] = $user['role'];
            $_SESSION['user_name'] = $user['name'];
        } else {
            echo json_encode(['error' => 'Неверный email или пароль']);
        }
    }
}
?>