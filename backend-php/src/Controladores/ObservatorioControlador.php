<?php
declare(strict_types=1);
namespace RedUdeg\Controladores;
use RedUdeg\Nucleo\{BaseDatos, Solicitud, Respuesta};
final class ObservatorioControlador {
    public function obtenerResumen(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void {
        $corte = BaseDatos::ejecutarConsulta(
            "SELECT c.*, s.`nombreOficial` AS nombreSede, s.`codigoSede`, s.`tipoSede`
             FROM `cortesAuditoria` c INNER JOIN `sedes` s ON s.`id` = c.`idSede` ORDER BY c.`fechaCorte` DESC LIMIT 1"
        )->fetch();
        if (!$corte) { $respuesta->json(['estado' => 'SIN_DATOS', 'mensaje' => 'No hay corte']); return; }
        $respuesta->json([
            'corteId' => $corte['id'], 'ultimaAuditoria' => $corte['fechaCorte'], 'estadoSincronizacion' => $corte['estadoSincronizacion'],
            'sede' => ['codigo' => $corte['codigoSede'], 'nombre' => $corte['nombreSede'], 'tipo' => $corte['tipoSede']],
            'kpis' => ['padronSnii' => $corte['totalSnii'], 'articulosIndexados' => $corte['totalArticulosIndexados'], 'cuerposAcademicos' => $corte['totalCuerposAcademicos'], 'proyectosActivos' => $corte['totalProyectosActivos']]
        ]);
    }
    public function listarSedes(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void { $respuesta->json(['datos' => []]); }
}
