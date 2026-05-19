<?php
// api/db.php - подключение к БД с поддержкой DEBUG режима
require_once 'config.php';

if (DEBUG_MODE) {
    // В режиме отладки используем мок-класс вместо реального PDO
    class MockPDO {
        public function prepare($sql) { return new MockStatement(); }
        public function query($sql) { return new MockStatement(); }
        public function lastInsertId() { return 999; }
    }
    
    class MockStatement {
        public function execute($params = []) { return true; }
        public function fetch($style = null) { return null; }
        public function fetchAll($style = null) { return []; }
        public function rowCount() { return 0; }
    }
    
    $pdo = new MockPDO();
    
    // Функции-заглушки для получения данных
    function getProductsMock() { return getMockProducts(); }
    function getUsersMock() { return getMockUsers(); }
    function getOrdersMock() { return getMockOrders(); }
    
} else {
        $host = 'mysql-conditer.alwaysdata.net';
        $dbname = 'conditer_db';
        $username = 'conditer_db';
        $password = 'hC\EAKt94M';

        try {
            $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            die("Ошибка подключения к БД: " . $e->getMessage());
        }
}
?>