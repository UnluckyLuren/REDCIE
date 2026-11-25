<?php
declare(strict_types=1);

namespace RedUdeg\Controladores;

use RedUdeg\Nucleo\{BaseDatos, Solicitud, Respuesta};
use RedUdeg\Modelos\Usuario;
use RedUdeg\Servicios\{JwtServicio, AuditoriaServicio};
use RedUdeg\Helpers\ValidadorHelper;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

final class AuthControlador
{
    private JwtServicio $jwtServicio;
    private AuditoriaServicio $auditoriaServicio;

    public function __construct()
    {
        $this->jwtServicio = new JwtServicio();
        $this->auditoriaServicio = new AuditoriaServicio();
    }

    public function login(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void
    {
        $correo = $solicitud->obtenerCampo('correo');
        $contrasena = $solicitud->obtenerCampo('contrasena');

        if (!$correo || !$contrasena) {
            $respuesta->enviarError(400, 'Credenciales incompletas', 'https://errors.udeg.mx/bad-request');
        }

        $usuario = Usuario::buscarPorCorreo($correo);

        if (!$usuario) {
            $this->auditoriaServicio->registrar(null, 'usuarios', $correo, 'LOGIN_FALLIDO', $solicitud->obtenerIp());
            $respuesta->enviarError(401, 'Credenciales inválidas', 'https://errors.udeg.mx/unauthorized');
        }

        if ($usuario['estado'] === 'BLOQUEADO_TEMPORAL' && strtotime($usuario['bloqueadoHasta']) > time()) {
            $respuesta->enviarError(403, 'Cuenta bloqueada temporalmente', 'https://errors.udeg.mx/forbidden', 'Demasiados intentos fallidos. Espere 15 minutos.');
        }

        // Verificación Argon2id
        if (!password_verify($contrasena, $usuario['contrasenaHash'])) {
            Usuario::registrarIntentoFallido((int)$usuario['id']);
            $this->auditoriaServicio->registrar((int)$usuario['id'], 'usuarios', (string)$usuario['id'], 'LOGIN_FALLIDO', $solicitud->obtenerIp());
            $respuesta->enviarError(401, 'Credenciales inválidas', 'https://errors.udeg.mx/unauthorized');
        }

        Usuario::reiniciarIntentos((int)$usuario['id']);
        $accesos = Usuario::obtenerRolesYSedes((int)$usuario['id']);

        $datosUsuario = [
            'id' => (int)$usuario['id'],
            'correo' => $usuario['correo'],
            'nombreCompleto' => $usuario['nombreCompleto'],
            'esMenorEdad' => (bool)$usuario['esMenorEdad'],
            'jerarquia' => $usuario['jerarquiaInstitucional'],
            'roles' => $accesos['roles'],
            'sedes' => $accesos['sedes']
        ];

        $accessToken = $this->jwtServicio->generarAccessToken($datosUsuario);
        $refreshTokenData = $this->jwtServicio->generarRefreshToken();

        // Persistir refresh token
        BaseDatos::ejecutarConsulta(
            'INSERT INTO `sesiones` (`id`, `idUsuario`, `refreshTokenHash`, `ipOrigen`, `userAgent`, `expiraEn`) VALUES (UUID(), ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))',
            [(int)$usuario['id'], $refreshTokenData['hash'], $solicitud->obtenerIp(), $solicitud->obtenerEncabezado('User-Agent') ?? 'Desconocido', (int)($_ENV['JWT_REFRESH_DIAS'] ?? 7)]
        );

        $this->auditoriaServicio->registrar((int)$usuario['id'], 'usuarios', (string)$usuario['id'], 'LOGIN_EXITOSO', $solicitud->obtenerIp());

        // Cookie HttpOnly para el refresh token
        $host = parse_url($_ENV['APP_URL'], PHP_URL_HOST);
        $dominioCookie = ($host === 'localhost' || $host === '127.0.0.1') ? '' : $host;

        setcookie(
            'refreshToken',
            $refreshTokenData['token'],
            [
                'expires' => time() + ((int)($_ENV['JWT_REFRESH_DIAS'] ?? 7) * 86400),
                'path' => '/api/v1/auth/refresh',
                'domain' => $dominioCookie,
                'secure' => isset($_SERVER['HTTPS']) || $host === 'localhost',
                'httponly' => true,
                'samesite' => 'Strict'
            ]
        );

        $respuesta->json([
            'mensaje' => 'Autenticación exitosa',
            'accessToken' => $accessToken,
            'usuario' => [
                'nombre' => $usuario['nombreCompleto'],
                'roles' => $accesos['roles'],
                'sedes' => $accesos['sedes']
            ]
        ]);
    }

    public function refrescarToken(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void
    {
        $token = $_COOKIE['refreshToken'] ?? null;
        if (!$token) {
            $respuesta->enviarError(401, 'Refresh token ausente', 'https://errors.udeg.mx/unauthorized');
        }

        $hash = hash('sha256', $token);
        $sesion = BaseDatos::ejecutarConsulta(
            'SELECT * FROM `sesiones` WHERE `refreshTokenHash` = ? AND `expiraEn` > NOW() AND `revocadoEn` IS NULL',
            [$hash]
        )->fetch();

        if (!$sesion) {
            $respuesta->enviarError(401, 'Sesión inválida o expirada', 'https://errors.udeg.mx/unauthorized');
        }

        $usuario = BaseDatos::ejecutarConsulta('SELECT * FROM `usuarios` WHERE `id` = ?', [$sesion['idUsuario']])->fetch();
        $accesos = Usuario::obtenerRolesYSedes((int)$usuario['id']);

        $datosUsuario = [
            'id' => (int)$usuario['id'],
            'correo' => $usuario['correo'],
            'nombreCompleto' => $usuario['nombreCompleto'],
            'esMenorEdad' => (bool)$usuario['esMenorEdad'],
            'jerarquia' => $usuario['jerarquiaInstitucional'],
            'roles' => $accesos['roles'],
            'sedes' => $accesos['sedes']
        ];

        $accessToken = $this->jwtServicio->generarAccessToken($datosUsuario);

        $respuesta->json(['accessToken' => $accessToken]);
    }

    public function cerrarSesion(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void
        {
            $token = $_COOKIE['refreshToken'] ?? null;
            if ($token) {
                $hash = hash('sha256', $token);
                BaseDatos::ejecutarConsulta(
                    'UPDATE `sesiones` SET `revocadoEn` = NOW() WHERE `refreshTokenHash` = ? AND `revocadoEn` IS NULL',
                    [$hash]
                );
                // Destruir la cookie del Refresh Token
                $host = parse_url($_ENV['APP_URL'], PHP_URL_HOST);
                $dominioCookie = ($host === 'localhost' || $host === '127.0.0.1') ? '' : $host;

                setcookie('refreshToken', '', [
                    'expires' => time() - 3600,
                    'path' => '/api/v1/auth/refresh',
                    'domain' => $dominioCookie,
                    'secure' => isset($_SERVER['HTTPS']) || $host === 'localhost',
                    'httponly' => true,
                    'samesite' => 'Strict'
                ]);
            }
            $respuesta->json(['mensaje' => 'Sesión cerrada exitosamente']);
        }

        public function verificarMfa(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void
        {
            $respuesta->json(['mensaje' => 'En construcción - AuthControlador: verificarMfa']);
        }

        public function ssoLogin(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void
            {
                // SIMULADOR: En lugar de ir a la URL real del IdP de la universidad,
                // nos redirigimos a nosotros mismos enviando un código falso
                $redirectUrl = $_ENV['APP_URL'] . '/api/v1/auth/sso/callback?code=simulacion_123&state=ok';

                header('Location: ' . $redirectUrl);
                exit;
            }

            public function ssoCallback(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void
            {
                // SIMULADOR: Ignoramos la validación de cURL y forzamos el usuario de prueba
                $correoIdp = 'admin@udeg.mx';
                $usuario = Usuario::buscarPorCorreo($correoIdp);

                if (!$usuario) {
                    $respuesta->enviarError(404, 'Usuario SSO semilla no encontrado en la BD', 'err');
                }

                // Emitir sesión local
                $accesos = Usuario::obtenerRolesYSedes((int)$usuario['id']);

                $datosUsuario = [
                    'id' => (int)$usuario['id'],
                    'correo' => $usuario['correo'],
                    'nombreCompleto' => $usuario['nombreCompleto'],
                    'esMenorEdad' => (bool)$usuario['esMenorEdad'],
                    'jerarquia' => $usuario['jerarquiaInstitucional'],
                    'roles' => $accesos['roles'],
                    'sedes' => $accesos['sedes']
                ];

                $accessToken = $this->jwtServicio->generarAccessToken($datosUsuario);
                $refreshTokenData = $this->jwtServicio->generarRefreshToken();

                BaseDatos::ejecutarConsulta(
                    'INSERT INTO `sesiones` (`id`, `idUsuario`, `refreshTokenHash`, `ipOrigen`, `userAgent`, `expiraEn`) VALUES (UUID(), ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))',
                    [(int)$usuario['id'], $refreshTokenData['hash'], $solicitud->obtenerIp(), $solicitud->obtenerEncabezado('User-Agent') ?? 'SSO Simulador', (int)($_ENV['JWT_REFRESH_DIAS'] ?? 7)]
                );
                $this->auditoriaServicio->registrar((int)$usuario['id'], 'usuarios', (string)$usuario['id'], 'LOGIN_EXITOSO', $solicitud->obtenerIp());

                // Configurar Cookies de Frontend
                $host = parse_url($_ENV['APP_URL'], PHP_URL_HOST);
                $dominioCookie = ($host === 'localhost' || $host === '127.0.0.1') ? '' : $host;
                $esSeguro = isset($_SERVER['HTTPS']) || $host === 'localhost';

                setcookie('refreshToken', $refreshTokenData['token'], [
                    'expires' => time() + ((int)($_ENV['JWT_REFRESH_DIAS'] ?? 7) * 86400),
                    'path' => '/api/v1/auth/refresh',
                    'domain' => $dominioCookie,
                    'secure' => $esSeguro,
                    'httponly' => true,
                    'samesite' => 'Strict'
                ]);

                setcookie('accessToken', $accessToken, [
                    'expires' => time() + ((int)($_ENV['JWT_DURACION_MINUTOS'] ?? 15) * 60),
                    'path' => '/',
                    'domain' => $dominioCookie,
                    'secure' => $esSeguro,
                    'httponly' => false, // Falso para que JS lo pueda tomar y meter en el estado de React
                    'samesite' => 'Strict'
                ]);

                // Retornar al dashboard
                header('Location: /observatorio');
                exit;
            }

            public function registrar(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void
                {
                    $correo = strtolower(trim($solicitud->obtenerCampo('correo') ?? ''));
                    $contrasena = $solicitud->obtenerCampo('contrasena');
                    $jerarquia = $solicitud->obtenerCampo('jerarquia');

                    if (!$correo || !$contrasena || !$jerarquia) {
                        $respuesta->enviarError(400, 'Datos incompletos', 'err');
                    }

                    if (Usuario::buscarPorCorreo($correo)) {
                        $respuesta->enviarError(409, 'El correo ya está registrado', 'err');
                    }

                    $codigoOtp = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                    $contrasenaHash = password_hash($contrasena, PASSWORD_ARGON2ID);
                    $expiraEn = date('Y-m-d H:i:s', time() + 120);

                    $verifExistente = BaseDatos::ejecutarConsulta('SELECT * FROM `verificacionesCorreo` WHERE `correo` = ?', [$correo])->fetch();

                    if ($verifExistente) {
                        $tiempoDesdeUltimo = time() - strtotime($verifExistente['ultimoEnvioEn']);
                        $tiempoDesdePrimero = time() - strtotime($verifExistente['primerEnvioEn']);

                        if ($tiempoDesdeUltimo < 120) {
                            $respuesta->enviarError(429, 'Debes esperar 2 minutos entre envíos', 'err');
                        }

                        if ($verifExistente['intentosEnvio'] >= 5 && $tiempoDesdePrimero < 1800) {
                            $respuesta->enviarError(429, 'Límite de 5 envíos. Intenta en 30 minutos', 'err');
                        }

                        $intentos = ($tiempoDesdePrimero >= 1800) ? 1 : $verifExistente['intentosEnvio'] + 1;
                        $primerEnvio = ($tiempoDesdePrimero >= 1800) ? date('Y-m-d H:i:s') : $verifExistente['primerEnvioEn'];

                        BaseDatos::ejecutarConsulta(
                            'UPDATE `verificacionesCorreo` SET `codigoOtp`=?, `expiraEn`=?, `intentosEnvio`=?, `primerEnvioEn`=?, `ultimoEnvioEn`=NOW(), `contrasenaHash`=?, `jerarquiaInstitucional`=? WHERE `correo`=?',
                            [$codigoOtp, $expiraEn, $intentos, $primerEnvio, $contrasenaHash, $jerarquia, $correo]
                        );
                    } else {
                        BaseDatos::ejecutarConsulta(
                            'INSERT INTO `verificacionesCorreo` (`correo`, `contrasenaHash`, `jerarquiaInstitucional`, `codigoOtp`, `expiraEn`) VALUES (?, ?, ?, ?, ?)',
                            [$correo, $contrasenaHash, $jerarquia, $codigoOtp, $expiraEn]
                        );
                    }

                    // ==========================================
                    // ENVÍO DE CORREO CON PHPMAILER
                    // ==========================================
                    $mail = new PHPMailer(true);

                    try {
                        // Configuración del servidor SMTP
                        $mail->isSMTP();
                        $mail->Host       = $_ENV['SMTP_HOST'] ?? 'smtp.gmail.com';
                        $mail->SMTPAuth   = true;
                        $mail->Username   = $_ENV['SMTP_USUARIO'];
                        $mail->Password   = $_ENV['SMTP_PASSWORD'];
                        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                        $mail->Port       = (int)($_ENV['SMTP_PUERTO'] ?? 587);

                        // Configuración del charset para acentos
                        $mail->CharSet = 'UTF-8';

                        // Remitente y Destinatario
                        $mail->setFrom($_ENV['SMTP_FROM_EMAIL'], $_ENV['SMTP_FROM_NAME'] ?? 'Red UdeG');
                        $mail->addAddress($correo);

                        // Contenido del correo (HTML)
                        $mail->isHTML(true);
                        $mail->Subject = "Código de verificación: {$codigoOtp}";

                        // Plantilla HTML (Usando colores del sistema M3)
                        $mail->Body = "
                        <div style='font-family: Arial, sans-serif; max-w-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9ff; color: #0b1c30;'>
                            <div style='text-align: center; margin-bottom: 20px;'>
                                <h2 style='color: #00162d; margin: 0;'>Red UdeG</h2>
                                <p style='color: #455f88; margin: 5px 0 0 0; font-size: 14px;'>Plataforma de Innovación e Investigación</p>
                            </div>

                            <div style='background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); text-align: center;'>
                                <h3 style='margin-top: 0; color: #00162d;'>Verifica tu correo electrónico</h3>
                                <p style='color: #43474d; line-height: 1.5;'>Ingresa el siguiente código de 6 dígitos en la plataforma para completar tu registro. Este código es válido por 2 minutos.</p>

                                <div style='margin: 30px 0;'>
                                    <span style='background-color: #eff4ff; border: 1px solid #e5eeff; padding: 15px 25px; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #00162d;'>
                                        {$codigoOtp}
                                    </span>
                                </div>

                                <p style='color: #43474d; font-size: 12px;'>Si no solicitaste este código, puedes ignorar este correo.</p>
                            </div>
                        </div>";

                        // Texto plano de respaldo
                        $mail->AltBody = "Tu código de verificación para la Red UdeG es: {$codigoOtp}. Es válido por 2 minutos.";

                        $mail->send();
                    } catch (Exception $e) {
                        // Si el correo falla, registramos el error interno y avisamos al frontend
                        error_log("Error de PHPMailer al enviar a {$correo}: {$mail->ErrorInfo}");
                        $respuesta->enviarError(500, 'Error enviando el correo', 'err', 'No se pudo enviar el correo de verificación. Revisa la configuración SMTP.');
                    }

                    $respuesta->json(['mensaje' => 'Código enviado']);
                }

                public function verificarCodigo(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void
                {
                    $correo = strtolower(trim($solicitud->obtenerCampo('correo') ?? ''));
                    $codigo = $solicitud->obtenerCampo('codigo');

                    $verif = BaseDatos::ejecutarConsulta('SELECT * FROM `verificacionesCorreo` WHERE `correo` = ?', [$correo])->fetch();

                    if (!$verif || $verif['codigoOtp'] !== $codigo) {
                        $respuesta->enviarError(401, 'Código inválido', 'err');
                    }

                    if (time() > strtotime($verif['expiraEn'])) {
                        $respuesta->enviarError(410, 'El código ha expirado', 'err');
                    }

                    // Crear usuario definitivo
                    BaseDatos::ejecutarConsulta(
                        'INSERT INTO `usuarios` (`correo`, `contrasenaHash`, `tipoAuth`, `nombreCompleto`, `jerarquiaInstitucional`) VALUES (?, ?, "LOCAL_EXTERNO", ?, ?)',
                        [$correo, $verif['contrasenaHash'], explode('@', $correo)[0], $verif['jerarquiaInstitucional']]
                    );
                    $idUsuario = BaseDatos::obtenerInstancia()->lastInsertId();

                    // Asignar rol base dependiendo de la jerarquía
                    $rolBasico = str_starts_with($verif['jerarquiaInstitucional'], 'ALUMNO') ? 5 : (str_starts_with($verif['jerarquiaInstitucional'], 'TRABAJADOR_ACADEMICO') ? 4 : 8); // 5=ESTUDIANTE, 4=INVESTIGADOR, 8=EXTERNO
                    BaseDatos::ejecutarConsulta('INSERT INTO `asignacionRolSede` (`idUsuario`, `idSede`, `idRol`) VALUES (?, 1, ?)', [$idUsuario, $rolBasico]);

                    BaseDatos::ejecutarConsulta('DELETE FROM `verificacionesCorreo` WHERE `correo` = ?', [$correo]);
                    $respuesta->json(['mensaje' => 'Cuenta verificada y creada con éxito']);
                }

                public function reenviarCodigo(Solicitud $solicitud, Respuesta $respuesta, callable $siguiente): void
                {
                    $this->registrar($solicitud, $respuesta, $siguiente); // Reutilizamos la lógica con sus candados
                }
}
