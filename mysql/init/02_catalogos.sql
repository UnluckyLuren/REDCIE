USE `red_udeg`;
INSERT INTO `roles` (`codigoRol`, `descripcion`, `requiereMfa`) VALUES
('ADMIN_UCEI', 'Administrador Global', 1),
('RESP_SEDE', 'Responsable de Sede', 1),
('TUTOR_SEMS', 'Tutor SEMS', 0),
('INVESTIGADOR', 'Investigador', 0),
('ESTUDIANTE', 'Estudiante', 0),
('EVALUADOR', 'Evaluador', 0),
('MENTOR', 'Mentor', 0),
('EXTERNO', 'Externo', 1),
('PUBLICO', 'Publico', 0);
INSERT INTO `categoriasReto` (`nombre`, `descripcion`) VALUES
('Ingeniería & IoT', 'Proyectos de hardware, firmware e Internet de las Cosas'),
('Sustentabilidad', 'Soluciones ambientales y energía renovable'),
('Diseño & UX', 'Experiencia de usuario, diseño industrial y comunicación'),
('Ciencias de la Salud', 'Biotecnología, farmacología y dispositivos médicos'),
('Ciencias Exactas', 'Matemáticas aplicadas, física y computación científica');
INSERT INTO `sedes` (`codigoSede`, `nombreOficial`, `tipoSede`, `region`, `slugUrl`, `estado`, `configModulosJson`)
VALUES ('CUCEI', 'CUCEI', 'CENTRO_UNIVERSITARIO', 'ZMG', 'cucei', 'ACTIVA', '{"observatorio":true,"investigadores":true,"portafolio":true,"retos":true,"incubadora":true,"escaparate":true}');
