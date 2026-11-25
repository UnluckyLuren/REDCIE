<?php
namespace RedUdeg\Middleware;
use RedUdeg\Nucleo\{Solicitud, Respuesta};
use RedUdeg\Servicios\JwtServicio;
final class AutenticacionMiddleware {
    public function __invoke(Solicitud $s, Respuesta $r, callable $next): void {
        $h = $s->obtenerEncabezado('Authorization');
        if(!$h) { $r->enviarError(401, 'No Auth', 'err'); return; }
        try {
            $payload = (new JwtServicio())->verificarToken((new JwtServicio())->extraerTokenDeEncabezado($h));
            $s->establecerUsuarioAutenticado(['id'=>$payload->idUsuario,'roles'=>(array)$payload->roles,'sedes'=>(array)$payload->sedes,'esMenorEdad'=>(bool)$payload->esMenorEdad]);
            $next();
        } catch (\Exception $e) { $r->enviarError(401, 'Token Invalido', 'err'); }
    }
}
