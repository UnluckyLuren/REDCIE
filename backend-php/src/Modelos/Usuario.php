<?php
declare(strict_types=1);

namespace RedUdeg\Modelos;

use RedUdeg\Nucleo\BaseDatos;

final class Usuario
{
    public static function buscarPorCorreo(string $correo): array|false
    {
        return BaseDatos::ejecutarConsulta(
            'SELECT * FROM `usuarios` WHERE `correo` = ? AND `eliminadoEn` IS NULL',
            [$correo]
        )->fetch();
    }

    public static function obtenerRolesYSedes(int $idUsuario): array
    {
        $resultados = BaseDatos::ejecutarConsulta(
            'SELECT ars.`idSede`, r.`codigoRol`, s.`codigoSede`
             FROM `asignacionRolSede` ars
             INNER JOIN `roles` r ON r.`id` = ars.`idRol`
             INNER JOIN `sedes` s ON s.`id` = ars.`idSede`
             WHERE ars.`idUsuario` = ? AND ars.`activo` = 1',
            [$idUsuario]
        )->fetchAll();

        $roles = [];
        $sedes = [];

        foreach ($resultados as $fila) {
            if (!in_array($fila['codigoRol'], $roles, true)) {
                $roles[] = $fila['codigoRol'];
            }
            $sedes[] = [
                'idSede' => (int)$fila['idSede'],
                'codigoSede' => $fila['codigoSede'],
                'rol' => $fila['codigoRol']
            ];
        }

        return ['roles' => $roles, 'sedes' => $sedes];
    }

    public static function registrarIntentoFallido(int $idUsuario): void
        {
            BaseDatos::ejecutarConsulta(
                'UPDATE `usuarios`
                 SET `intentosFallidos` = `intentosFallidos` + 1,
                     `bloqueadoHasta` = CASE WHEN `intentosFallidos` >= 2 THEN DATE_ADD(NOW(), INTERVAL 15 MINUTE) ELSE NULL END,
                     `estado` = CASE WHEN `intentosFallidos` >= 2 THEN "BLOQUEADO_TEMPORAL" ELSE `estado` END
                 WHERE `id` = ?',
                [$idUsuario]
            );
        }

    public static function reiniciarIntentos(int $idUsuario): void
    {
        BaseDatos::ejecutarConsulta(
            'UPDATE `usuarios` SET `intentosFallidos` = 0, `bloqueadoHasta` = NULL, `estado` = "ACTIVO", `ultimoAccesoEn` = NOW() WHERE `id` = ?',
            [$idUsuario]
        );
    }
}
