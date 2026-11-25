<?php
declare(strict_types=1);
namespace RedUdeg\Servicios;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

final class JwtServicio {

    public function extraerTokenDeEncabezado(string $enc): ?string {
        return str_starts_with($enc, 'Bearer ') ? substr($enc, 7) : null;
    }

    public function verificarToken(string $t): object {
        return JWT::decode($t, new Key($_ENV['JWT_SECRETO'], 'HS256'));
    }

    public function generarAccessToken(array $datosUsuario): string {
        $payload = [
            'iat' => time(),
            'exp' => time() + ((int)($_ENV['JWT_DURACION_MINUTOS'] ?? 15) * 60),
            'idUsuario' => $datosUsuario['id'],
            'correo' => $datosUsuario['correo'],
            'nombreCompleto' => $datosUsuario['nombreCompleto'] ?? '',
            'jerarquia' => $datosUsuario['jerarquia'] ?? 'EXTERNO',
            'esMenorEdad' => $datosUsuario['esMenorEdad'],
            'roles' => $datosUsuario['roles'],
            'sedes' => $datosUsuario['sedes']
        ];
        return JWT::encode($payload, $_ENV['JWT_SECRETO'], 'HS256');
    }

    public function generarRefreshToken(): array {
        $token = bin2hex(random_bytes(32));

        return [
            'token' => $token,
            'hash' => hash('sha256', $token)
        ];
    }
}
