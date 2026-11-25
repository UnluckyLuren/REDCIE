<?php
declare(strict_types=1);
namespace RedUdeg\Servicios;
use RedUdeg\Nucleo\BaseDatos;
use Ramsey\Uuid\Uuid;
final class AuditoriaServicio {
    public function registrar(?int $idActor, string $entidad, string $idRegistro, string $accion, string $ipOrigen, mixed $snapshotAntes = null, mixed $snapshotDespues = null, ?string $motivoCambio = null): void {
        $id = Uuid::uuid7()->toString();
        $hashNuevo = hash('sha256', $id);
        BaseDatos::ejecutarConsulta(
            'INSERT INTO `bitacoraAuditoria` (`id`, `idActor`, `entidad`, `idRegistro`, `accion`, `snapshotAntes`, `snapshotDespues`, `motivoCambio`, `ipOrigen`, `hashEncadenado`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [$id, $idActor, $entidad, $idRegistro, $accion, $snapshotAntes !== null ? json_encode($snapshotAntes) : null, $snapshotDespues !== null ? json_encode($snapshotDespues) : null, $motivoCambio, $ipOrigen, $hashNuevo]
        );
    }
}
