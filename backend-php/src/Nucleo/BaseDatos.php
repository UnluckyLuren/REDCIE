<?php
declare(strict_types=1);
namespace RedUdeg\Nucleo;
use PDO;
use PDOException;
final class BaseDatos {
    private static ?PDO $instancia = null;
    private function __construct() {}
    public static function obtenerInstancia(): PDO {
        if (self::$instancia === null) {
            $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $_ENV['DB_HOST'], $_ENV['DB_PUERTO'] ?? '3306', $_ENV['DB_NOMBRE']);
            try {
                self::$instancia = new PDO($dsn, $_ENV['DB_USUARIO'], $_ENV['DB_PASSWORD'], [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci, time_zone = '+00:00'"
                ]);
            } catch (PDOException $e) { throw new \RuntimeException('Error BD', 503); }
        }
        return self::$instancia;
    }
    public static function ejecutarConsulta(string $sql, array $parametros = []): \PDOStatement {
        $stmt = self::obtenerInstancia()->prepare($sql);
        $stmt->execute($parametros);
        return $stmt;
    }
}
