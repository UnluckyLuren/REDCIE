<?php
namespace RedUdeg\Middleware;
use RedUdeg\Nucleo\{Solicitud, Respuesta};
final class AutorizacionMiddleware {
    public function __construct(private array $roles, private bool $valSede = false, private string $paramSede = 'idSede') {}
    public function __invoke(Solicitud $s, Respuesta $r, callable $next): void {
        $u = $s->obtenerUsuarioAutenticado();
        if(!$u || empty(array_intersect($u['roles'], $this->roles))) { $r->enviarError(403, 'Acceso denegado', 'err'); return; }
        $next();
    }
}
