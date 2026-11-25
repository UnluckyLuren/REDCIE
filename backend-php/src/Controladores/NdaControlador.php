<?php
declare(strict_types=1);
namespace RedUdeg\Controladores;
use RedUdeg\Nucleo\{BaseDatos, Solicitud, Respuesta};
final class NdaControlador {
    public function solicitar(Solicitud $s, Respuesta $r, callable $n): void { $r->json(['mensaje' => 'Ok']); }
    public function aprobar(Solicitud $s, Respuesta $r, callable $n): void { $r->json(['mensaje' => 'Ok']); }
    public function aceptar(Solicitud $s, Respuesta $r, callable $n): void { $r->json(['mensaje' => 'Ok']); }
    public function descargarArchivo(Solicitud $s, Respuesta $r, callable $n): void { $r->json(['urlDescarga' => '']); }
}
