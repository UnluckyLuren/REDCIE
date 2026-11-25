<?php
declare(strict_types=1);
namespace RedUdeg\Nucleo;
final class Respuesta {
    public function json(array $datos, int $codigoEstado = 200): void {
        http_response_code($codigoEstado);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    }
    public function enviarError(int $estado, string $titulo, string $tipo, string $detalle = '', array $extra = []): void {
        http_response_code($estado);
        header('Content-Type: application/problem+json; charset=UTF-8');
        echo json_encode(array_merge(['type'=>$tipo,'title'=>$titulo,'status'=>$estado,'detail'=>$detalle], $extra), JSON_UNESCAPED_UNICODE);
        exit;
    }
}
