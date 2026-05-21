<?php
session_start();
require_once '../db.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $login = $_POST['login'] ?? '';
    $password = $_POST['password'] ?? '';
    
    // ========== УСЛОВНЫЕ КОНСТРУКЦИИ PHP ==========
    if (empty($login) || empty($password)) {
        $error = 'Заполните все поля';
    } elseif ($login === 'admin' && $password === 'admin123') {
        $_SESSION['admin_logged_in'] = true;
        header('Location: admin.php');
        exit;
    } else {
        // Проверка в БД (дополнительно)
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND is_wholesale = 1");
        $stmt->execute([$login]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_user'] = $user['name'];
            header('Location: admin.php');
            exit;
        } else {
            $error = 'Неверный логин или пароль';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Вход в админ-панель</title>
    <link rel="stylesheet" href="../../styles.css">
    <style>
        .admin-login { max-width: 400px; margin: 100px auto; padding: 30px; background: white; }
        .admin-login h1 { text-align: center; color: #a3222f; }
        .admin-login input { width: 100%; padding: 10px; margin: 10px 0;}
        .admin-login button { width: 100%; padding: 12px; background: #a3222f; color: white; border: none; }
        .error { color: red; text-align: center; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="admin-login">
        <h1>🔐 Вход в админ-панель</h1>
        <?php if ($error): ?>
            <div class="error"><?= $error ?></div>
        <?php endif; ?>
        <form method="POST">
            <input type="text" name="login" placeholder="Логин (admin)" required>
            <input type="password" name="password" placeholder="Пароль (admin123)" required>
            <button type="submit">Войти</button>
        </form>
        <p style="text-align: center; margin-top: 15px; font-size: 12px;">Тестовый вход: admin / admin123</p>
    </div>
</body>
</html>