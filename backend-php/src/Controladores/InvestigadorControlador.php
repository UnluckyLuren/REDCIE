<?php
declare(strict_types=1);
namespace RedUdeg\Controladores;

use RedUdeg\Nucleo\{Solicitud, Respuesta};

final class InvestigadorControlador {
    public function listar(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void {
        $respuesta->json(['msg' => 'En construcción - InvestigadorControlador: listar']);
    }

    public function obtenerRadar(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void {
        $respuesta->json(['msg' => 'En construcción - InvestigadorControlador: obtenerRadar']);
    }

    public function exportarCsv(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void {
        $respuesta->json(['msg' => 'En construcción - InvestigadorControlador: exportarCsv']);
    }
}
