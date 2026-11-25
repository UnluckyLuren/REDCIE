USE `red_udeg`;
INSERT INTO `usuarios` (`codigoUdeg`, `correo`, `tipoAuth`, `nombreCompleto`, `mfaActivo`, `estado`)
VALUES ('ADMIN001', 'admin@udeg.mx', 'SSO_INSTITUCIONAL', 'Administrador UCEI', 1, 'ACTIVO');
INSERT INTO `asignacionRolSede` (`idUsuario`, `idSede`, `idRol`)
SELECT u.`id`, s.`id`, r.`id` FROM `usuarios` u, `sedes` s, `roles` r
WHERE u.`correo` = 'admin@udeg.mx' AND s.`codigoSede` = 'CUCEI' AND r.`codigoRol` = 'ADMIN_UCEI';
INSERT INTO `secuenciaFolios` (`anio`, `ultimaSecuencia`) VALUES (2026, 0);
INSERT INTO `lineasInvestigacion` (`nombre`, `areaTematica`) VALUES
('Inteligencia Artificial y Aprendizaje Automático', 'Computación'),
('Metaheurísticas y Optimización', 'Computación'),
('Control Inteligente y Robótica', 'Ingeniería'),
('Visión Computacional', 'Computación'),
('Procesamiento de Imágenes', 'Computación'),
('Sistemas Ciberfísicos', 'Ingeniería'),
('Biotecnología de Alimentos', 'Ciencias Biológicas'),
('Farmacología Traslacional', 'Ciencias de la Salud'),
('Inmunología y Diagnóstico Molecular', 'Ciencias de la Salud'),
('Sistemas No Lineales', 'Ingeniería');

-- La contraseña para todos es: password

-- 1. Crear un Responsable de Sede
INSERT INTO usuarios (correo, contrasenaHash, tipoAuth, nombreCompleto, estado)
VALUES ('responsable@udeg.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LOCAL_EXTERNO', 'Responsable CUCEI', 'ACTIVO');

-- Asignar rol RESP_SEDE (id 2) en CUCEI (id 1)
INSERT INTO asignacionRolSede (idUsuario, idSede, idRol)
SELECT id, 1, 2 FROM usuarios WHERE correo = 'responsable@udeg.mx';

-- 2. Crear un Administrador Global para pruebas locales
INSERT INTO usuarios (correo, contrasenaHash, tipoAuth, nombreCompleto, estado)
VALUES ('admin.local@udeg.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LOCAL_EXTERNO', 'Admin Pruebas', 'ACTIVO');

-- Asignar rol ADMIN_UCEI (id 1) en CUCEI (id 1)
INSERT INTO asignacionRolSede (idUsuario, idSede, idRol)
SELECT id, 1, 1 FROM usuarios WHERE correo = 'admin.local@udeg.mx';

-- 3. Crear un Inversionista / Actor Externo
INSERT INTO usuarios (correo, contrasenaHash, tipoAuth, nombreCompleto, razonSocial, estado)
VALUES ('empresa@externo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LOCAL_EXTERNO', 'Juan Inversionista', 'Tech Corp SA', 'ACTIVO');

-- Asignar rol EXTERNO (id 8) en CUCEI (id 1)
INSERT INTO asignacionRolSede (idUsuario, idSede, idRol)
SELECT id, 1, 8 FROM usuarios WHERE correo = 'empresa@externo.com';

-- 1. Insertar las 5 cuentas de prueba faltantes
INSERT INTO usuarios (correo, contrasenaHash, tipoAuth, nombreCompleto, estado) VALUES
('tutor@udeg.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LOCAL_EXTERNO', 'Tutor de Prueba', 'ACTIVO'),
('investigador@udeg.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LOCAL_EXTERNO', 'Investigador de Prueba', 'ACTIVO'),
('estudiante@udeg.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LOCAL_EXTERNO', 'Estudiante de Prueba', 'ACTIVO'),
('evaluador@udeg.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LOCAL_EXTERNO', 'Evaluador de Prueba', 'ACTIVO'),
('mentor@udeg.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LOCAL_EXTERNO', 'Mentor de Prueba', 'ACTIVO');

-- 2. Asignar los roles de la Especificación a la sede CUCEI de forma segura
INSERT INTO asignacionRolSede (idUsuario, idSede, idRol)
SELECT u.id, s.id, r.id FROM usuarios u, sedes s, roles r
WHERE u.correo = 'tutor@udeg.mx' AND s.codigoSede = 'CUCEI' AND r.codigoRol = 'TUTOR_SEMS';

INSERT INTO asignacionRolSede (idUsuario, idSede, idRol)
SELECT u.id, s.id, r.id FROM usuarios u, sedes s, roles r
WHERE u.correo = 'investigador@udeg.mx' AND s.codigoSede = 'CUCEI' AND r.codigoRol = 'INVESTIGADOR';

INSERT INTO asignacionRolSede (idUsuario, idSede, idRol)
SELECT u.id, s.id, r.id FROM usuarios u, sedes s, roles r
WHERE u.correo = 'estudiante@udeg.mx' AND s.codigoSede = 'CUCEI' AND r.codigoRol = 'ESTUDIANTE';

INSERT INTO asignacionRolSede (idUsuario, idSede, idRol)
SELECT u.id, s.id, r.id FROM usuarios u, sedes s, roles r
WHERE u.correo = 'evaluador@udeg.mx' AND s.codigoSede = 'CUCEI' AND r.codigoRol = 'EVALUADOR';

INSERT INTO asignacionRolSede (idUsuario, idSede, idRol)
SELECT u.id, s.id, r.id FROM usuarios u, sedes s, roles r
WHERE u.correo = 'mentor@udeg.mx' AND s.codigoSede = 'CUCEI' AND r.codigoRol = 'MENTOR';
