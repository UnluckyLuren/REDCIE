<?php
declare(strict_types=1);

namespace RedUdeg\Controladores;

use RedUdeg\Nucleo\{BaseDatos, Solicitud, Respuesta};
use RedUdeg\Modelos\Sede;
use RedUdeg\Servicios\AuditoriaServicio;

final class SedeControlador
{
    private AuditoriaServicio $auditoriaServicio;

    public function __construct()
    {
        $this->auditoriaServicio = new AuditoriaServicio();
    }

    public function listar(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void
    {
        $sedes = Sede::obtenerTodasActivas();
        foreach ($sedes as &$sede) {
            $sede['configModulos'] = json_decode($sede['configModulosJson'], true);
            unset($sede['configModulosJson']);
        }
        $respuesta->json(['datos' => $sedes]);
    }

    public function crear(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void
    {
        $usuario = $solicitud->obtenerUsuarioAutenticado();

        $codigoSede = strtoupper($solicitud->obtenerCampo('codigoSede') ?? '');
        $nombreOficial = $solicitud->obtenerCampo('nombreOficial');
        $tipoSede = $solicitud->obtenerCampo('tipoSede');
        $region = $solicitud->obtenerCampo('region');

        if (!$codigoSede || !$nombreOficial || !$tipoSede || !$region) {
            $respuesta->enviarError(422, 'Campos incompletos', 'https://errors.udeg.mx/validation-error');
        }

        $slugUrl = strtolower(preg_replace('/[^a-zA-Z0-9\-]/', '', str_replace(' ', '-', $codigoSede)));
        $configModulosJson = json_encode([
            'observatorio' => true,
            'investigadores' => true,
            'portafolio' => true,
            'retos' => true,
            'incubadora' => $tipoSede !== 'PREPARATORIA',
            'escaparate' => $tipoSede !== 'PREPARATORIA'
        ]);

        BaseDatos::ejecutarConsulta(
            'INSERT INTO `sedes` (`codigoSede`, `nombreOficial`, `tipoSede`, `region`, `slugUrl`, `configModulosJson`) VALUES (?, ?, ?, ?, ?, ?)',
            [$codigoSede, $nombreOficial, $tipoSede, $region, $slugUrl, $configModulosJson]
        );

        $idSede = BaseDatos::obtenerInstancia()->lastInsertId();

        $this->auditoriaServicio->registrar(
            (int)$usuario['id'], 'sedes', (string)$idSede, 'CREAR', $solicitud->obtenerIp(), null,
            ['codigoSede' => $codigoSede, 'tipoSede' => $tipoSede]
        );

        $respuesta->json(['mensaje' => 'Sede creada exitosamente', 'idSede' => $idSede], 201);
    }

    public function actualizar(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void
    {
        $respuesta->json(['mensaje' => 'En construcción - SedeControlador: actualizar']);
    }
}
