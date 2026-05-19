<?php
// api/config.php - конфигурация для режима DEBUG

// Режим разработки: true = используем мок-данные, false = реальная БД
define('DEBUG_MODE', isset($_GET['dev']) && $_GET['dev'] == 1);

if (DEBUG_MODE) {
    // Включаем отображение всех ошибок для отладки
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    
    // Функция-заглушка для получения данных без БД
    function getMockProducts() {
        return [
            ['id' => 1, 'name' => 'Звёздный вальс', 'price' => 350, 'wholesale_min_qty' => 10, 'wholesale_discount' => 15, 'image' => '/img/products/звездный_вальс.jfif', 'description' => 'Шоколадные трюфели с бархатистой текстурой'],
            ['id' => 2, 'name' => 'Медовый луг', 'price' => 420, 'wholesale_min_qty' => 8, 'wholesale_discount' => 12, 'image' => '/img/products/медовый_луг.jfif', 'description' => 'Пралине с цельным фундуком'],
            ['id' => 3, 'name' => 'Морской бриз', 'price' => 280, 'wholesale_min_qty' => 12, 'wholesale_discount' => 18, 'image' => '/img/products/морской_бриз.jfif', 'description' => 'Освежающие леденцы'],
            ['id' => 4, 'name' => 'Бабушкины сказки', 'price' => 390, 'wholesale_min_qty' => 6, 'wholesale_discount' => 10, 'image' => '/img/products/бабушкины_сказки.jfif', 'description' => 'Нежное суфле в шоколаде'],
            ['id' => 5, 'name' => 'Ну типа тестовая1', 'price' => 5000, 'wholesale_min_qty' => 100, 'wholesale_discount' => 20, 'image' => '/img/products/default.jpg', 'description' => 'Тестовый товар для отладки']
        ];
    }
    
    function getMockUsers() {
        return [
            ['id' => 1, 'name' => 'Иван Петров', 'email' => 'demo@example.com', 'role' => 'user', 'is_wholesale' => 0],
            ['id' => 2, 'name' => 'Мария Смирнова', 'email' => 'wholesale@example.com', 'role' => 'user', 'is_wholesale' => 1],
            ['id' => 3, 'name' => 'Администратор', 'email' => 'admin@example.com', 'role' => 'admin', 'is_wholesale' => 1]
        ];
    }
    
    function getMockOrders() {
        return [
            ['id' => 1, 'user_id' => 1, 'total_amount' => 2140, 'status' => 'completed', 'created_at' => '2024-05-15 10:30:00'],
            ['id' => 2, 'user_id' => 2, 'total_amount' => 1250, 'status' => 'processing', 'created_at' => '2024-05-18 14:20:00'],
            ['id' => 3, 'user_id' => 3, 'total_amount' => 5000, 'status' => 'new', 'created_at' => '2024-05-19 09:15:00']
        ];
    }
}
?>