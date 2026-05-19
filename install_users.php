<?php
require_once 'api/db.php';

// Очищаем старых пользователей, чтобы избежать дублей
$pdo->exec("DELETE FROM users WHERE email IN ('demo@example.com', 'wholesale@example.com')");

// Создаём пользователей с правильными хешами
$users = [
    ['demo@example.com', '123', 'Иван Петров', '+7 (999) 123-45-67', 0],
    ['wholesale@example.com', 'wholesale', 'Мария Смирнова', '+7 (999) 765-43-21', 1]
];

foreach ($users as $user) {
    $email = $user[0];
    $plainPassword = $user[1];
    $name = $user[2];
    $phone = $user[3];
    $wholesale = $user[4];
    
    $hashed = password_hash($plainPassword, PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("INSERT INTO users (email, password, name, phone, is_wholesale) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$email, $hashed, $name, $phone, $wholesale]);
    
    echo "✅ Пользователь $email добавлен (пароль: $plainPassword)<br>";
}

echo "<br>🎉 Готово! Теперь можно входить.";
?>