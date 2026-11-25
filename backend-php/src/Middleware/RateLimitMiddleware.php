<?php
declare(strict_types=1);

namespace RedUdeg\Middleware;

use RedUdeg\Nucleo\Solicitud;
use RedUdeg\Nucleo\Respuesta;
use Predis\Client as RedisClient;

/**
 * Limita la tasa de peticiones usando Redis para prevenir fuerza bruta.
 */
final class RateLimitMiddleware
{
    private RedisClient $redis;

    public function __construct(
        private readonly int $limite = 60,
        private readonly int $ventanaSegundos = 60
    ) {
        $this->redis = new RedisClient([
            'scheme'   => 'tcp',
            'host'     => $_ENV['REDIS_HOST'] ?? '127.0.0.1',
            'port'     => (int)($_ENV['REDIS_PUERTO'] ?? 6379),
            'password' => $_ENV['REDIS_PASSWORD'] ?? null,
        ]);
    }

    public function __invoke(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void
    {
        $ip = $solicitud->obtenerIp();
        $ruta = $solicitud->obtenerUri();
        $clave = "rate_limit:{$ip}:{$ruta}";

        $peticionesActuales = $this->redis->incr($clave);

        if ($peticionesActuales === 1) {
            $this->redis->expire($clave, $this->ventanaSegundos);
        }

        if ($peticionesActuales > $this->limite) {
            $respuesta->enviarError(
                429,
                'Demasiadas peticiones',
                'https://errors.udeg.mx/too-many-requests',
                'Ha excedido el límite de peticiones. Intente más tarde.'
            );
        }

        $siguiente();
    }
}
