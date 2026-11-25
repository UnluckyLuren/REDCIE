<?php
declare(strict_types=1);
require_once __DIR__ . '/../vendor/autoload.php';
use Dotenv\Dotenv;
use RedUdeg\Nucleo\{Enrutador, Solicitud, Respuesta};
use RedUdeg\Middleware\{AutenticacionMiddleware, AutorizacionMiddleware, CorsMiddleware};
use RedUdeg\Controladores\{AuthControlador,ObservatorioControlador,InvestigadorControlador,ProyectoControlador,NdaControlador,RetoControlador,FondoControlador,SedeControlador,AnaliticaControlador};
use RedUdeg\Controladores\UsuarioControlador;

$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->safeLoad();

$solicitud  = new Solicitud();
$respuesta  = new Respuesta();
$enrutador  = new Enrutador();

$cors = new CorsMiddleware();
$enrutador->registrarMiddlewareGlobal($cors);

$auth           = new AutenticacionMiddleware();
$soloAdmin      = new AutorizacionMiddleware(['ADMIN_UCEI']);
$adminORespSede = new AutorizacionMiddleware(['ADMIN_UCEI', 'RESP_SEDE']);
$autenticado    = new AutorizacionMiddleware(['ADMIN_UCEI', 'RESP_SEDE', 'INVESTIGADOR', 'ESTUDIANTE', 'EVALUADOR', 'MENTOR', 'EXTERNO']);

$ctrlAuth        = new AuthControlador();
$ctrlObs         = new ObservatorioControlador();
$ctrlInv         = new InvestigadorControlador();
$ctrlProy        = new ProyectoControlador();
$ctrlNda         = new NdaControlador();
$ctrlReto        = new RetoControlador();
$ctrlFondo       = new FondoControlador();
$ctrlSede        = new SedeControlador();
$ctrlAnalitica   = new AnaliticaControlador();
$ctrlUsuario     = new UsuarioControlador();

$enrutador->post('/auth/login',        [$ctrlAuth, 'login']);
$enrutador->get('/auth/sso/login',     [$ctrlAuth, 'ssoLogin']);
$enrutador->get('/auth/sso/callback',  [$ctrlAuth, 'ssoCallback']);

$enrutador->post('/auth/mfa/verify',   [$ctrlAuth, 'verificarMfa']);
$enrutador->post('/auth/refresh',      [$ctrlAuth, 'refrescarToken']);
$enrutador->post('/auth/logout',       $auth, [$ctrlAuth, 'cerrarSesion']);
$enrutador->get('/observatorio/resumen', [$ctrlObs, 'obtenerResumen']);
$enrutador->get('/observatorio/sedes',   [$ctrlObs, 'listarSedes']);
$enrutador->get('/investigadores',              [$ctrlInv, 'listar']);
$enrutador->get('/investigadores/{id}/radar',   [$ctrlInv, 'obtenerRadar']);
$enrutador->get('/investigadores/export.csv',   [$ctrlInv, 'exportarCsv']);
$enrutador->get('/proyectos',              $auth, $autenticado, [$ctrlProy, 'listar']);
$enrutador->post('/proyectos',             $auth, $autenticado, [$ctrlProy, 'registrar']);
$enrutador->get('/proyectos/{folio}',      $auth, $autenticado, [$ctrlProy, 'obtenerPorFolio']);
$enrutador->patch('/proyectos/{folio}',    $auth, $autenticado, [$ctrlProy, 'actualizar']);
$enrutador->post('/proyectos/{folio}/nda/solicitar',                  $auth, $autenticado, [$ctrlNda, 'solicitar']);
$enrutador->post('/proyectos/{folio}/nda/{idNda}/aprobar',            $auth, $adminORespSede, [$ctrlNda, 'aprobar']);
$enrutador->post('/proyectos/{folio}/nda/aceptar',                    $auth, $autenticado, [$ctrlNda, 'aceptar']);
$enrutador->get('/proyectos/{folio}/dataroom/{idArchivo}/download',   $auth, $autenticado, [$ctrlNda, 'descargarArchivo']);
$enrutador->get('/retos',                    [$ctrlReto, 'listar']);
$enrutador->post('/retos',                   $auth, $adminORespSede, [$ctrlReto, 'crear']);
$enrutador->post('/retos/{id}/postulaciones',$auth, $autenticado, [$ctrlReto, 'postular']);
$enrutador->get('/fondos',                      [$ctrlFondo, 'listar']);
$enrutador->post('/fondos',                     $auth, $soloAdmin, [$ctrlFondo, 'crear']);
$enrutador->post('/fondos/{id}/postulaciones',  $auth, $autenticado, [$ctrlFondo, 'postular']);
$enrutador->get('/sedes',              $auth, $soloAdmin, [$ctrlSede, 'listar']);
$enrutador->post('/sedes',             $auth, $soloAdmin, [$ctrlSede, 'crear']);
$enrutador->patch('/sedes/{codigo}',   $auth, $soloAdmin, [$ctrlSede, 'actualizar']);
$enrutador->get('/analitica/red',             $auth, $autenticado, [$ctrlAnalitica, 'mapaRed']);
$enrutador->get('/analitica/cuellos-botella', $auth, $autenticado, [$ctrlAnalitica, 'cuellosBotella']);

$enrutador->post('/auth/registro',           [$ctrlAuth, 'registrar']);
$enrutador->post('/auth/verificar-codigo',   [$ctrlAuth, 'verificarCodigo']);
$enrutador->post('/auth/reenviar-codigo',    [$ctrlAuth, 'reenviarCodigo']);

$enrutador->get('/admin/usuarios',            $auth, $soloAdmin, [$ctrlUsuario, 'listar']);
$enrutador->post('/admin/usuarios',           $auth, $soloAdmin, [$ctrlUsuario, 'guardar']);
$enrutador->delete('/admin/usuarios/{id}',    $auth, $soloAdmin, [$ctrlUsuario, 'eliminar']);

try {
    $enrutador->despachar($solicitud, $respuesta);
} catch (\Throwable $e) {
    $respuesta->enviarError(500, 'Error interno del servidor', 'err', $e->getMessage());
}
