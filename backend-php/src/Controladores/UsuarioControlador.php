<?php
declare(strict_types=1);

namespace RedUdeg\Controladores;

use RedUdeg\Nucleo\{BaseDatos, Solicitud, Respuesta};

final class UsuarioControlador {

    public function listar(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void {
        $sql = "SELECT u.id, u.nombreCompleto as nombre, u.correo, u.estado,
                GROUP_CONCAT(r.codigoRol) as roles,
                GROUP_CONCAT(s.codigoSede) as sedeResponsable
                FROM usuarios u
                LEFT JOIN asignacionRolSede ars ON u.id = ars.idUsuario AND ars.activo = 1
                LEFT JOIN roles r ON ars.idRol = r.id
                LEFT JOIN sedes s ON ars.idSede = s.id
                WHERE u.eliminadoEn IS NULL
                GROUP BY u.id
                ORDER BY u.id DESC";

        $usuarios = BaseDatos::ejecutarConsulta($sql)->fetchAll();

        foreach ($usuarios as &$u) {
            $u['roles'] = $u['roles'] ? array_unique(explode(',', $u['roles'])) : [];
            $sedes = $u['sedeResponsable'] ? array_unique(explode(',', $u['sedeResponsable'])) : [];
            $u['sedeResponsable'] = !empty($sedes) ? $sedes[0] : null;
        }

        $respuesta->json(['datos' => $usuarios]);
    }

    public function guardar(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void {
        $id = $solicitud->obtenerCampo('id');
        $nombre = $solicitud->obtenerCampo('nombre');
        $correo = $solicitud->obtenerCampo('correo');
        $roles = $solicitud->obtenerCampo('roles') ?? [];
        $sede = $solicitud->obtenerCampo('sedeResponsable');

        $bd = BaseDatos::obtenerInstancia();
        $bd->beginTransaction();

        try {
            if ($id) {
                // Editar usuario existente
                BaseDatos::ejecutarConsulta('UPDATE usuarios SET nombreCompleto = ?, correo = ? WHERE id = ?', [$nombre, $correo, $id]);
            } else {
                // Crear usuario nuevo (se le asigna una contraseña temporal segura)
                $hash = password_hash('Temporal123!', PASSWORD_ARGON2ID);
                BaseDatos::ejecutarConsulta('INSERT INTO usuarios (correo, contrasenaHash, tipoAuth, nombreCompleto, jerarquiaInstitucional) VALUES (?, ?, "LOCAL_EXTERNO", ?, "EXTERNO")', [$correo, $hash, $nombre]);
                $id = $bd->lastInsertId();
            }

            // Reemplazar roles
            BaseDatos::ejecutarConsulta('DELETE FROM asignacionRolSede WHERE idUsuario = ?', [$id]);

            foreach ($roles as $rol) {
                $rolData = BaseDatos::ejecutarConsulta('SELECT id FROM roles WHERE codigoRol = ?', [$rol])->fetch();
                if ($rolData) {
                    $idSede = 1; // Sede por defecto (CUCEI)
                    if ($rol === 'RESP_SEDE' && $sede) {
                        $sedeData = BaseDatos::ejecutarConsulta('SELECT id FROM sedes WHERE codigoSede = ?', [$sede])->fetch();
                        if ($sedeData) $idSede = $sedeData['id'];
                    }
                    BaseDatos::ejecutarConsulta('INSERT INTO asignacionRolSede (idUsuario, idSede, idRol) VALUES (?, ?, ?)', [$id, $idSede, $rolData['id']]);
                }
            }

            $bd->commit();
            $respuesta->json(['mensaje' => 'Perfil guardado exitosamente']);
        } catch (\Exception $e) {
            $bd->rollBack();
            $respuesta->enviarError(500, 'Error al guardar el perfil', 'err', $e->getMessage());
        }
    }

    public function eliminar(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void {
        $id = $solicitud->obtenerParametroRuta('id');
        // Baja lógica
        BaseDatos::ejecutarConsulta('UPDATE usuarios SET estado = "INACTIVO", eliminadoEn = NOW() WHERE id = ?', [$id]);
        $respuesta->json(['mensaje' => 'Perfil inhabilitado']);
    }
}
