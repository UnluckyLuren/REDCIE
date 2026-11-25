<?php
declare(strict_types=1);
namespace RedUdeg\Controladores;

use RedUdeg\Nucleo\{Solicitud, Respuesta};

final class RetoControlador {
    public function listar(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void {
        $respuesta->json(['msg' => 'En construcción - RetoControlador: listar']);
    }

    public function crear(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void {
        $respuesta->json(['msg' => 'En construcción - RetoControlador: crear']);
    }

    public function postular(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void {
        $respuesta->json(['msg' => 'En construcción - RetoControlador: postular']);
    }
}
