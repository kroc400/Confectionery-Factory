<?php
require_once 'db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? $_GET['action'] ?? '';

// ========== ШАГ 1: Запрос на восстановление (отправка email) ==========
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'request') {
    $email = $data['email'] ?? '';
    
    if (empty($email)) {
        echo json_encode(['error' => 'Введите email']);
        exit;
    }
    
    // Проверяем, существует ли пользователь
    $stmt = $pdo->prepare("SELECT id, name FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo json_encode(['error' => 'Пользователь с таким email не найден']);
        exit;
    }
    
    // Генерируем токен
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));
    
    // Сохраняем токен в БД
    $stmt = $pdo->prepare("UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?");
    $stmt->execute([$token, $expires, $user['id']]);
    
    // В реальном проекте здесь отправляется email
    // Для демонстрации возвращаем ссылку (в продакшене НЕ ДЕЛАЙТЕ ТАК!)
    $resetLink = "https://" . $_SERVER['HTTP_HOST'] . "/reset-password.html?token=" . $token;
    
    echo json_encode([
        'success' => true,
        'message' => 'Инструкция по восстановлению отправлена на ваш email',
        'demo_link' => $resetLink // ТОЛЬКО ДЛЯ ТЕСТИРОВАНИЯ! Удалить в продакшене
    ]);
    exit;
}

// ========== ШАГ 2: Проверка токена (GET) ==========
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'verify') {
    $token = $_GET['token'] ?? '';
    
    if (empty($token)) {
        echo json_encode(['error' => 'Неверный токен']);
        exit;
    }
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW()");
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo json_encode(['error' => 'Ссылка недействительна или истекла']);
        exit;
    }
    
    echo json_encode(['success' => true, 'token' => $token]);
    exit;
}

// ========== ШАГ 3: Установка нового пароля ==========
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'reset') {
    $token = $data['token'] ?? '';
    $newPassword = $data['password'] ?? '';
    
    if (empty($token) || empty($newPassword)) {
        echo json_encode(['error' => 'Заполните все поля']);
        exit;
    }
    
    if (strlen($newPassword) < 4) {
        echo json_encode(['error' => 'Пароль должен содержать минимум 4 символа']);
        exit;
    }
    
    // Проверяем токен
    $stmt = $pdo->prepare("SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW()");
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo json_encode(['error' => 'Ссылка недействительна или истекла']);
        exit;
    }
    
    // Обновляем пароль и очищаем токен
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?");
    $stmt->execute([$hashedPassword, $user['id']]);
    
    echo json_encode(['success' => true, 'message' => 'Пароль успешно изменён']);
    exit;
}
?>