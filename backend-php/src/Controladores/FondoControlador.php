<?php
declare(strict_types=1);
namespace RedUdeg\Controladores;

use RedUdeg\Nucleo\{Solicitud, Respuesta};

final class FondoControlador {
    public function listar(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void {
        $respuesta->json(['msg' => 'En construcción - FondoControlador: listar']);
    }

    public function crear(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void {
        $respuesta->json(['msg' => 'En construcción - FondoControlador: crear']);
    }

    public function postular(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void {
        $respuesta->json(['msg' => 'En construcción - FondoControlador: postular']);
    }
}
