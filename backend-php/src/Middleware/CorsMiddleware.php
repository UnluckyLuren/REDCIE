<?php
declare(strict_types=1);

namespace RedUdeg\Middleware;

use RedUdeg\Nucleo\Solicitud;
use RedUdeg\Nucleo\Respuesta;

/**
 * Gestiona el Intercambio de Recursos de Origen Cruzado (CORS).
 */
final class CorsMiddleware
{
    public function __invoke(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void
    {
        $origenPermitido = $_ENV['APP_URL'] ?? 'http://localhost';

        header('Access-Control-Allow-Origin: ' . $origenPermitido);
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');

        if ($solicitud->obtenerMetodo() === 'OPTIONS') {
            http_response_code(204);
            exit;
        }

        $siguiente();
    }
}
