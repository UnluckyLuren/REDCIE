<?php
declare(strict_types=1);
namespace RedUdeg\Nucleo;
final class Enrutador {
    private array $rutas = [];
    private array $mG = [];
    public function registrarMiddlewareGlobal(callable $m): void { $this->mG[] = $m; }
    public function get(string $r, callable ...$m): void { $this->rutas['GET']['/api/v1'.$r] = array_merge($this->mG, $m); }
    public function post(string $r, callable ...$m): void { $this->rutas['POST']['/api/v1'.$r] = array_merge($this->mG, $m); }
    public function patch(string $r, callable ...$m): void { $this->rutas['PATCH']['/api/v1'.$r] = array_merge($this->mG, $m); }
    public function delete(string $r, callable ...$m): void { $this->rutas['DELETE']['/api/v1'.$r] = array_merge($this->mG, $m); }
    public function despachar(Solicitud $s, Respuesta $r): void {
        $m = $s->obtenerMetodo(); $u = $s->obtenerUri();
        foreach ($this->rutas[$m] ?? [] as $p => $manejadores) {
            $regex = '@^' . preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $p) . '$@';
            if (preg_match($regex, $u, $matches)) {
                $s->establecerParametrosRuta(array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY));
                $idx = 0; $next = null;
                $next = function() use (&$manejadores, &$idx, $s, $r, &$next) { if ($idx < count($manejadores)) { $manejadores[$idx++]($s, $r, $next); } };
                $next(); return;
            }
        }
        $r->enviarError(404, 'Ruta no encontrada', 'err');
    }
}
