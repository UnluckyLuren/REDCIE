<?php
declare(strict_types=1);
namespace RedUdeg\Controladores;

use RedUdeg\Nucleo\{Solicitud, Respuesta};

final class AnaliticaControlador {
    public function mapaRed(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void {
        $respuesta->json(['msg' => 'En construcción - AnaliticaControlador: mapaRed']);
    }

    public function cuellosBotella(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void {
        $respuesta->json(['msg' => 'En construcción - AnaliticaControlador: cuellosBotella']);
    }
}
