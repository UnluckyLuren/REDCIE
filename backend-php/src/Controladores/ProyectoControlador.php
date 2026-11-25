<?php
declare(strict_types=1);
namespace RedUdeg\Controladores;
use RedUdeg\Nucleo\{BaseDatos, Solicitud, Respuesta};
final class ProyectoControlador {
    public function listar(Solicitud $s, Respuesta $r, callable $n): void { $r->json(['datos' => [], 'total' => 0]); }
    public function registrar(Solicitud $s, Respuesta $r, callable $n): void { $r->json(['mensaje' => 'Ok'], 201); }
    public function obtenerPorFolio(Solicitud $s, Respuesta $r, callable $n): void { $r->json(['datos' => []]); }
    public function actualizar(Solicitud $s, Respuesta $r, callable $n): void { $r->json(['mensaje' => 'Ok']); }
}
