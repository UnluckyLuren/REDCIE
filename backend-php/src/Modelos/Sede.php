<?php
declare(strict_types=1);

namespace RedUdeg\Modelos;

use RedUdeg\Nucleo\BaseDatos;

final class Sede
{
    public static function obtenerTodasActivas(): array
    {
        return BaseDatos::ejecutarConsulta(
            'SELECT `id`, `codigoSede`, `nombreOficial`, `tipoSede`, `slugUrl`, `configModulosJson`
             FROM `sedes`
             WHERE `estado` = "ACTIVA" AND `eliminadoEn` IS NULL
             ORDER BY `nombreOficial` ASC'
        )->fetchAll();
    }

    public static function buscarPorCodigo(string $codigo): array|false
    {
        return BaseDatos::ejecutarConsulta(
            'SELECT * FROM `sedes` WHERE `codigoSede` = ? AND `eliminadoEn` IS NULL',
            [$codigo]
        )->fetch();
    }
}
