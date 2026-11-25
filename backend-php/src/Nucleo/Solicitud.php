<?php
declare(strict_types=1);
namespace RedUdeg\Nucleo;
final class Solicitud {
    private array $paramsRuta = [];
    private array $cuerpoJson = [];
    private ?array $usuarioAuth = null;
    public function __construct() {
        $c = file_get_contents('php://input');
        if (!empty($c)) {
            $d = json_decode($c, true);
            if(json_last_error() === JSON_ERROR_NONE && is_array($d)) $this->cuerpoJson = $d;
        }
    }
    public function obtenerMetodo(): string { return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET'); }
    public function obtenerUri(): string { return rtrim(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH), '/') ?: '/'; }
    public function obtenerEncabezado(string $n): ?string { $k = 'HTTP_'.strtoupper(str_replace('-','_',$n)); return $_SERVER[$k] ?? null; }
    public function obtenerIp(): string { return $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'; }
    public function obtenerCampo(string $c): mixed { return $this->cuerpoJson[$c] ?? null; }
    public function obtenerParametroRuta(string $n): ?string { return $this->paramsRuta[$n] ?? null; }
    public function obtenerQueryParam(string $n): ?string { return isset($_GET[$n]) ? htmlspecialchars(strip_tags((string)$_GET[$n]), ENT_QUOTES, 'UTF-8') : null; }
    public function establecerParametrosRuta(array $p): void { $this->paramsRuta = $p; }
    public function establecerUsuarioAutenticado(array $d): void { $this->usuarioAuth = $d; }
    public function obtenerUsuarioAutenticado(): ?array { return $this->usuarioAuth; }
}
