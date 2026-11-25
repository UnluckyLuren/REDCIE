SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;

CREATE DATABASE IF NOT EXISTS `red_udeg` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `red_udeg`;

CREATE TABLE IF NOT EXISTS `sedes` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `codigoSede` VARCHAR(15) NOT NULL,
    `nombreOficial` VARCHAR(200) NOT NULL,
    `tipoSede` ENUM('CENTRO_UNIVERSITARIO', 'PREPARATORIA', 'UNIDAD_CENTRAL') NOT NULL,
    `region` VARCHAR(100) NOT NULL,
    `slugUrl` VARCHAR(60) NOT NULL,
    `estado` ENUM('ACTIVA', 'SOLO_LECTURA', 'INACTIVA') NOT NULL DEFAULT 'ACTIVA',
    `configModulosJson` JSON NOT NULL,
    `versionLock` INT UNSIGNED NOT NULL DEFAULT 1,
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `actualizadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `eliminadoEn` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`), UNIQUE KEY `uq_sedes_codigo` (`codigoSede`), UNIQUE KEY `uq_sedes_slug` (`slugUrl`),
    INDEX `idx_sedes_estado` (`estado`), INDEX `idx_sedes_tipo` (`tipoSede`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `usuarios` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `codigoUdeg` VARCHAR(20) NULL DEFAULT NULL,
    `correo` VARCHAR(255) NOT NULL,
    `contrasenaHash` VARCHAR(255) NULL DEFAULT NULL,
    `tipoAuth` ENUM('SSO_INSTITUCIONAL', 'LOCAL_EXTERNO') NOT NULL,
    `nombreCompleto` VARCHAR(200) NOT NULL,
    `fechaNacimiento` DATE NULL DEFAULT NULL,
    `esMenorEdad` TINYINT(1) NOT NULL DEFAULT 0,
    `mfaActivo` TINYINT(1) NOT NULL DEFAULT 0,
    `mfaSecreto` VARCHAR(255) NULL DEFAULT NULL,
    `estado` ENUM('ACTIVO', 'BLOQUEADO_TEMPORAL', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    `intentosFallidos` TINYINT NOT NULL DEFAULT 0,
    `bloqueadoHasta` DATETIME NULL DEFAULT NULL,
    `ultimoAccesoEn` DATETIME NULL DEFAULT NULL,
    `razonSocial` VARCHAR(200) NULL DEFAULT NULL,
    `rfcExterno` VARCHAR(13) NULL DEFAULT NULL,
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `actualizadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `eliminadoEn` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`), UNIQUE KEY `uq_usuarios_correo` (`correo`), UNIQUE KEY `uq_usuarios_codigo` (`codigoUdeg`),
    INDEX `idx_usuarios_estado` (`estado`), INDEX `idx_usuarios_tipo_auth` (`tipoAuth`), INDEX `idx_usuarios_menor` (`esMenorEdad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `roles` (
    `id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `codigoRol` VARCHAR(30) NOT NULL,
    `descripcion` VARCHAR(200) NOT NULL,
    `requiereMfa` TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`), UNIQUE KEY `uq_roles_codigo` (`codigoRol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `asignacionRolSede` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `idUsuario` INT UNSIGNED NOT NULL,
    `idSede` INT UNSIGNED NOT NULL,
    `idRol` TINYINT UNSIGNED NOT NULL,
    `activo` TINYINT(1) NOT NULL DEFAULT 1,
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `eliminadoEn` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`), UNIQUE KEY `uq_ars_usuario_sede_rol` (`idUsuario`, `idSede`, `idRol`),
    INDEX `idx_ars_usuario` (`idUsuario`), INDEX `idx_ars_sede` (`idSede`),
    CONSTRAINT `fk_ars_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_ars_sede` FOREIGN KEY (`idSede`) REFERENCES `sedes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_ars_rol` FOREIGN KEY (`idRol`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `consentimientosMenores` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `idEstudiante` INT UNSIGNED NOT NULL,
    `idTutorSems` INT UNSIGNED NOT NULL,
    `idProyecto` INT UNSIGNED NULL DEFAULT NULL,
    `tipoConsentimiento` ENUM('REGISTRO_PROPUESTA', 'POSTULACION_RETO', 'VINCULACION_EXTERNA') NOT NULL,
    `archivoRuta` VARCHAR(500) NOT NULL,
    `estado` ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO', 'REVOCADO') NOT NULL DEFAULT 'PENDIENTE',
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `actualizadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`), INDEX `idx_cm_estudiante` (`idEstudiante`),
    CONSTRAINT `fk_cm_estudiante` FOREIGN KEY (`idEstudiante`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_cm_tutor` FOREIGN KEY (`idTutorSems`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sesiones` (
    `id` CHAR(36) NOT NULL,
    `idUsuario` INT UNSIGNED NOT NULL,
    `refreshTokenHash` VARCHAR(255) NOT NULL,
    `ipOrigen` VARCHAR(45) NOT NULL,
    `userAgent` VARCHAR(500) NOT NULL,
    `expiraEn` DATETIME NOT NULL,
    `revocadoEn` DATETIME NULL DEFAULT NULL,
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`), INDEX `idx_sesiones_usuario` (`idUsuario`), INDEX `idx_sesiones_expira` (`expiraEn`),
    CONSTRAINT `fk_sesiones_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `departamentos` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `idSede` INT UNSIGNED NOT NULL,
    `nombre` VARCHAR(200) NOT NULL,
    `codigoDepartamento` VARCHAR(30) NOT NULL,
    `estado` ENUM('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `eliminadoEn` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`), UNIQUE KEY `uq_depto_codigo_sede` (`codigoDepartamento`, `idSede`), INDEX `idx_depto_sede` (`idSede`),
    CONSTRAINT `fk_depto_sede` FOREIGN KEY (`idSede`) REFERENCES `sedes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `investigadores` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `idUsuario` INT UNSIGNED NOT NULL,
    `idSede` INT UNSIGNED NOT NULL,
    `idDepartamento` INT UNSIGNED NULL DEFAULT NULL,
    `nivelSnii` ENUM('CANDIDATO', 'NIVEL_I', 'NIVEL_II', 'NIVEL_III', 'EMERITO', 'SIN_SNII') NOT NULL DEFAULT 'SIN_SNII',
    `orcid` VARCHAR(20) NULL DEFAULT NULL,
    `verificado` TINYINT(1) NOT NULL DEFAULT 0,
    `aceptaTesis` TINYINT(1) NOT NULL DEFAULT 1,
    `fuenteOrigen` ENUM('PORTAL_CUCEI', 'IMPORTADO_ETL', 'CAPTURA_MANUAL') NOT NULL DEFAULT 'CAPTURA_MANUAL',
    `estadoValidacion` ENUM('VERIFICADO', 'IMPORTADO', 'DISCREPANCIA', 'PENDIENTE') NOT NULL DEFAULT 'PENDIENTE',
    `resumenPublico` TEXT NULL,
    `fotografia` VARCHAR(500) NULL DEFAULT NULL,
    `estado` ENUM('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `actualizadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `eliminadoEn` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`), UNIQUE KEY `uq_inv_usuario` (`idUsuario`), UNIQUE KEY `uq_inv_orcid` (`orcid`),
    INDEX `idx_inv_sede` (`idSede`), INDEX `idx_inv_nivel_snii` (`nivelSnii`), INDEX `idx_inv_verificado` (`verificado`),
    CONSTRAINT `fk_inv_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_inv_sede` FOREIGN KEY (`idSede`) REFERENCES `sedes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_inv_departamento` FOREIGN KEY (`idDepartamento`) REFERENCES `departamentos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `lineasInvestigacion` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,
    `areaTematica` VARCHAR(100) NOT NULL,
    `estado` ENUM('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    PRIMARY KEY (`id`), FULLTEXT KEY `ft_linea_nombre` (`nombre`, `areaTematica`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `investigadorLinea` (
    `idInvestigador` INT UNSIGNED NOT NULL,
    `idLinea` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`idInvestigador`, `idLinea`),
    CONSTRAINT `fk_il_inv` FOREIGN KEY (`idInvestigador`) REFERENCES `investigadores` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_il_linea` FOREIGN KEY (`idLinea`) REFERENCES `lineasInvestigacion` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `metricasRadar` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `idInvestigador` INT UNSIGNED NOT NULL,
    `dimension` ENUM('PRODUCCION', 'INNOVACION', 'FORMACION', 'IMPACTO', 'COLABORACION', 'FINANCIAMIENTO', 'LIDERAZGO', 'CIENCIA_ABIERTA', 'VINCULACION') NOT NULL,
    `valorCalculado` DECIMAL(5,2) NULL,
    `fuenteOrigen` VARCHAR(100) NULL,
    `urlEvidencia` VARCHAR(500) NULL,
    `estadoValidacion` ENUM('VERIFICADO', 'IMPORTADO', 'DISCREPANCIA', 'PENDIENTE') NOT NULL DEFAULT 'PENDIENTE',
    `fechaIngesta` DATETIME NULL,
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `actualizadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`), UNIQUE KEY `uq_mr_inv_dim` (`idInvestigador`, `dimension`), INDEX `idx_mr_inv` (`idInvestigador`),
    CONSTRAINT `fk_mr_inv` FOREIGN KEY (`idInvestigador`) REFERENCES `investigadores` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `produccionAcademica` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `idInvestigador` INT UNSIGNED NOT NULL,
    `idSede` INT UNSIGNED NOT NULL,
    `tipoProducto` ENUM('REVISTA_INDEXADA', 'CAPITULO_LIBRO', 'LIBRO', 'MEMORIA_EXTENSO', 'ARBITRADO_NO_INDEXADO', 'REVISION_CRITICA', 'DIFUSION') NOT NULL,
    `titulo` VARCHAR(500) NOT NULL,
    `revista` VARCHAR(300) NULL,
    `issn` VARCHAR(9) NULL,
    `doi` VARCHAR(255) NULL,
    `anioPublicacion` YEAR NOT NULL,
    `cuartil` ENUM('Q1','Q2','Q3','Q4') NULL,
    `citasNormalizadas` DECIMAL(8,2) NULL,
    `fuenteOrigen` VARCHAR(100) NOT NULL,
    `estadoValidacion` ENUM('VERIFICADO', 'IMPORTADO', 'DISCREPANCIA', 'PENDIENTE') NOT NULL DEFAULT 'IMPORTADO',
    `enCuarentena` TINYINT(1) NOT NULL DEFAULT 0,
    `motivoCuarentena` VARCHAR(500) NULL,
    `fechaIngesta` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `eliminadoEn` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`), UNIQUE KEY `uq_prod_doi` (`doi`), INDEX `idx_prod_inv` (`idInvestigador`), INDEX `idx_prod_sede` (`idSede`), INDEX `idx_prod_anio` (`anioPublicacion`), INDEX `idx_prod_tipo` (`tipoProducto`),
    CONSTRAINT `fk_prod_inv` FOREIGN KEY (`idInvestigador`) REFERENCES `investigadores` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_prod_sede` FOREIGN KEY (`idSede`) REFERENCES `sedes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cortesAuditoria` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `idSede` INT UNSIGNED NOT NULL,
    `periodoEtiqueta` VARCHAR(20) NOT NULL,
    `fechaCorte` DATE NOT NULL,
    `totalSnii` INT UNSIGNED NULL,
    `totalArticulosIndexados` INT UNSIGNED NULL,
    `totalCuerposAcademicos` INT UNSIGNED NULL,
    `totalProyectosActivos` INT UNSIGNED NULL,
    `distribucionSniiJson` JSON NULL,
    `produccionPorCategoriaJson` JSON NULL,
    `fuenteOrigen` VARCHAR(200) NOT NULL,
    `estadoSincronizacion` ENUM('SINCRONIZADO', 'PENDIENTE', 'ERROR') NOT NULL DEFAULT 'PENDIENTE',
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`), UNIQUE KEY `uq_corte_sede_periodo` (`idSede`, `periodoEtiqueta`), INDEX `idx_corte_sede` (`idSede`),
    CONSTRAINT `fk_corte_sede` FOREIGN KEY (`idSede`) REFERENCES `sedes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `proyectos` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `folio` VARCHAR(25) NOT NULL,
    `idSedeOrigen` INT UNSIGNED NOT NULL,
    `idResponsable` INT UNSIGNED NOT NULL,
    `titulo` VARCHAR(160) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `tipoIniciativa` ENUM('PROPUESTA_ESTUDIANTIL', 'INVESTIGACION', 'TESIS', 'TECNOLOGIA', 'SPIN_OFF') NOT NULL,
    `estadoFlujo` ENUM('EN_REVISION', 'PENDIENTE_AVAL_TUTOR', 'APROBADO', 'ACTIVO', 'EN_INCUBACION', 'GRADUADO', 'RECHAZADO', 'ARCHIVADO') NOT NULL DEFAULT 'EN_REVISION',
    `etapaMaduracion` ENUM('PREINCUBACION', 'VALIDACION', 'ESCALAMIENTO', 'TRANSFERENCIA') NULL DEFAULT NULL,
    `trl` TINYINT UNSIGNED NOT NULL,
    `programaEducativoDepartamento` VARCHAR(200) NOT NULL,
    `perfilApoyoSolicitado` VARCHAR(500) NULL,
    `publicoEnEscaparate` TINYINT(1) NOT NULL DEFAULT 0,
    `destacado` TINYINT(1) NOT NULL DEFAULT 0,
    `versionLock` INT UNSIGNED NOT NULL DEFAULT 1,
    `ultimoCambioEtapaEn` DATETIME NULL DEFAULT NULL,
    `causaCuelloBotella` ENUM('FINANCIAMIENTO', 'PROTOTIPADO', 'EMPRESA_PILOTO', 'EVALUACION', 'VALIDACION', 'PROPIEDAD_INTELECTUAL', 'REGULACION') NULL DEFAULT NULL,
    `idiomaOriginal` CHAR(2) NOT NULL DEFAULT 'es',
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `actualizadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `eliminadoEn` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`), UNIQUE KEY `uq_proyectos_folio` (`folio`), INDEX `idx_proy_sede_origen` (`idSedeOrigen`), INDEX `idx_proy_responsable` (`idResponsable`), INDEX `idx_proy_estado_flujo` (`estadoFlujo`), INDEX `idx_proy_trl` (`trl`), INDEX `idx_proy_etapa` (`etapaMaduracion`), INDEX `idx_proy_escaparate` (`publicoEnEscaparate`), INDEX `idx_proy_cuello` (`causaCuelloBotella`),
    CONSTRAINT `fk_proy_sede` FOREIGN KEY (`idSedeOrigen`) REFERENCES `sedes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_proy_responsable` FOREIGN KEY (`idResponsable`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `ck_proy_trl` CHECK (`trl` BETWEEN 1 AND 9)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `secuenciaFolios` (
    `anio` YEAR NOT NULL,
    `ultimaSecuencia` INT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (`anio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `integrantesProyecto` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `idProyecto` INT UNSIGNED NOT NULL,
    `idUsuario` INT UNSIGNED NOT NULL,
    `idSede` INT UNSIGNED NOT NULL,
    `rolEnProyecto` ENUM('LIDER', 'CO_INVESTIGADOR', 'ESTUDIANTE', 'MENTOR', 'COLABORADOR_EXTERNO') NOT NULL,
    `activo` TINYINT(1) NOT NULL DEFAULT 1,
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `eliminadoEn` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`), UNIQUE KEY `uq_ip_proy_usuario` (`idProyecto`, `idUsuario`), INDEX `idx_ip_proyecto` (`idProyecto`), INDEX `idx_ip_usuario` (`idUsuario`), INDEX `idx_ip_sede` (`idSede`),
    CONSTRAINT `fk_ip_proyecto` FOREIGN KEY (`idProyecto`) REFERENCES `proyectos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_ip_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_ip_sede` FOREIGN KEY (`idSede`) REFERENCES `sedes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `hitos` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `idProyecto` INT UNSIGNED NOT NULL,
    `idActor` INT UNSIGNED NOT NULL,
    `tipoEvento` VARCHAR(80) NOT NULL,
    `descripcion` VARCHAR(500) NOT NULL,
    `metadatosJson` JSON NULL,
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`), INDEX `idx_hitos_proyecto` (`idProyecto`),
    CONSTRAINT `fk_hitos_proyecto` FOREIGN KEY (`idProyecto`) REFERENCES `proyectos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_hitos_actor` FOREIGN KEY (`idActor`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `archivosDataRoom` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `idProyecto` INT UNSIGNED NOT NULL,
    `idSubidoPor` INT UNSIGNED NOT NULL,
    `nombreOriginal` VARCHAR(255) NOT NULL,
    `rutaCifrada` VARCHAR(500) NOT NULL,
    `mimeType` VARCHAR(100) NOT NULL,
    `tamanoBytes` INT UNSIGNED NOT NULL,
    `hashSha256` CHAR(64) NOT NULL,
    `clasificacion` ENUM('PUBLICO', 'USO_INTERNO', 'CONFIDENCIAL', 'RESTRINGIDO') NOT NULL DEFAULT 'CONFIDENCIAL',
    `escaneadoAntivirus` TINYINT(1) NOT NULL DEFAULT 0,
    `resultadoEscaneo` ENUM('LIMPIO', 'CUARENTENA', 'PENDIENTE') NOT NULL DEFAULT 'PENDIENTE',
    `estado` ENUM('ACTIVO', 'ELIMINADO') NOT NULL DEFAULT 'ACTIVO',
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `eliminadoEn` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`), INDEX `idx_adr_proyecto` (`idProyecto`), INDEX `idx_adr_clasificacion` (`clasificacion`),
    CONSTRAINT `fk_adr_proyecto` FOREIGN KEY (`idProyecto`) REFERENCES `proyectos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_adr_subido` FOREIGN KEY (`idSubidoPor`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `registrosNda` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `idProyecto` INT UNSIGNED NOT NULL,
    `idSolicitante` INT UNSIGNED NOT NULL,
    `versionNda` VARCHAR(10) NOT NULL DEFAULT 'v1.0',
    `estado` ENUM('PENDIENTE_APROBACION', 'APROBADO_PENDIENTE_FIRMA', 'FIRMADO', 'REVOCADO', 'EXPIRADO') NOT NULL DEFAULT 'PENDIENTE_APROBACION',
    `aprobadoPor` INT UNSIGNED NULL DEFAULT NULL,
    `firmaTimestampUtc` DATETIME NULL DEFAULT NULL,
    `ipFirma` VARCHAR(45) NULL DEFAULT NULL,
    `expiraEn` DATETIME NULL DEFAULT NULL,
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `actualizadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`), INDEX `idx_nda_proyecto` (`idProyecto`), INDEX `idx_nda_solicitante` (`idSolicitante`), INDEX `idx_nda_estado` (`estado`),
    CONSTRAINT `fk_nda_proyecto` FOREIGN KEY (`idProyecto`) REFERENCES `proyectos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_nda_solicitante` FOREIGN KEY (`idSolicitante`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rubricas` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(200) NOT NULL,
    `descripcion` TEXT NULL,
    `criteriosJson` JSON NOT NULL,
    `estado` ENUM('ACTIVA', 'INACTIVA') NOT NULL DEFAULT 'ACTIVA',
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `evaluaciones` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `idProyecto` INT UNSIGNED NOT NULL,
    `idEvaluador` INT UNSIGNED NOT NULL,
    `idRubrica` INT UNSIGNED NOT NULL,
    `puntajeTotal` DECIMAL(5,2) NULL,
    `calificacionesJson` JSON NOT NULL,
    `comentarios` TEXT NULL,
    `estado` ENUM('BORRADOR', 'ENVIADA', 'REABIERTA') NOT NULL DEFAULT 'BORRADOR',
    `conflictoInteres` TINYINT(1) NOT NULL DEFAULT 0,
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `enviadoEn` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`), INDEX `idx_eval_proyecto` (`idProyecto`), INDEX `idx_eval_evaluador` (`idEvaluador`),
    CONSTRAINT `fk_eval_proyecto` FOREIGN KEY (`idProyecto`) REFERENCES `proyectos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_eval_evaluador` FOREIGN KEY (`idEvaluador`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_eval_rubrica` FOREIGN KEY (`idRubrica`) REFERENCES `rubricas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `categoriasReto` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(300) NULL,
    `estado` ENUM('ACTIVA', 'INACTIVA') NOT NULL DEFAULT 'ACTIVA',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `retos` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `idSedeConvocante` INT UNSIGNED NOT NULL,
    `idCategoria` INT UNSIGNED NOT NULL,
    `idAsesor` INT UNSIGNED NULL DEFAULT NULL,
    `titulo` VARCHAR(200) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `montoIncentivo` DECIMAL(12,2) NULL,
    `fechaCierreUtc` DATETIME NOT NULL,
    `entregableTrlEsperado` TINYINT UNSIGNED NOT NULL,
    `perfilesBuscados` TEXT NULL,
    `sedesParticipantesJson` JSON NULL,
    `tamanoEquipoMin` TINYINT NOT NULL DEFAULT 3,
    `tamanoEquipoMax` TINYINT NOT NULL DEFAULT 5,
    `estado` ENUM('BORRADOR', 'EN_MODERACION', 'ABIERTO', 'CERRADO', 'CANCELADO') NOT NULL DEFAULT 'BORRADOR',
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `actualizadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `eliminadoEn` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`), INDEX `idx_retos_sede` (`idSedeConvocante`), INDEX `idx_retos_estado` (`estado`), INDEX `idx_retos_cierre` (`fechaCierreUtc`),
    CONSTRAINT `fk_retos_sede` FOREIGN KEY (`idSedeConvocante`) REFERENCES `sedes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_retos_categoria` FOREIGN KEY (`idCategoria`) REFERENCES `categoriasReto` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `postulacionesReto` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `idReto` INT UNSIGNED NOT NULL,
    `idLiderEquipo` INT UNSIGNED NOT NULL,
    `nombreEquipo` VARCHAR(100) NOT NULL,
    `integrantesJson` JSON NOT NULL,
    `estado` ENUM('PENDIENTE', 'CONFIRMADA', 'ACEPTADA', 'RECHAZADA') NOT NULL DEFAULT 'PENDIENTE',
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `eliminadoEn` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`), INDEX `idx_pr_reto` (`idReto`), INDEX `idx_pr_lider` (`idLiderEquipo`),
    CONSTRAINT `fk_pr_reto` FOREIGN KEY (`idReto`) REFERENCES `retos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `fondosConvocatoria` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(30) NOT NULL,
    `titulo` VARCHAR(200) NOT NULL,
    `modalidad` ENUM('CIERRE_FECHA_FIJA', 'VENTANILLA_CONTINUA') NOT NULL,
    `montoMaximo` DECIMAL(14,2) NOT NULL,
    `trlMin` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `trlMax` TINYINT UNSIGNED NOT NULL DEFAULT 9,
    `requisitosJson` JSON NOT NULL,
    `fechaCierreUtc` DATETIME NULL,
    `urlDocumentoBases` VARCHAR(500) NULL,
    `sedesElegiblesJson` JSON NULL,
    `estado` ENUM('BORRADOR', 'ABIERTA', 'CERRADA', 'CANCELADA') NOT NULL DEFAULT 'BORRADOR',
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `actualizadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `eliminadoEn` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`), UNIQUE KEY `uq_fondo_codigo` (`codigo`), INDEX `idx_fondo_estado` (`estado`),
    CONSTRAINT `ck_fondo_trl` CHECK (`trlMin` <= `trlMax`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `postulacionesFondo` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `idFondo` INT UNSIGNED NOT NULL,
    `idProyecto` INT UNSIGNED NOT NULL,
    `montoSolicitado` DECIMAL(14,2) NOT NULL,
    `justificacionTecnica` TEXT NOT NULL,
    `estado` ENUM('BORRADOR', 'EN_REVISION', 'POSTULADA', 'APROBADA', 'NO_SELECCIONADA') NOT NULL DEFAULT 'BORRADOR',
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `actualizadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `eliminadoEn` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`), UNIQUE KEY `uq_pf_activa` (`idFondo`, `idProyecto`), INDEX `idx_pf_fondo` (`idFondo`), INDEX `idx_pf_proyecto` (`idProyecto`),
    CONSTRAINT `fk_pf_fondo` FOREIGN KEY (`idFondo`) REFERENCES `fondosConvocatoria` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_pf_proyecto` FOREIGN KEY (`idProyecto`) REFERENCES `proyectos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `expedientesIncubacion` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `idProyecto` INT UNSIGNED NOT NULL,
    `idMentor` INT UNSIGNED NULL DEFAULT NULL,
    `etapaActual` ENUM('PREINCUBACION', 'VALIDACION', 'ESCALAMIENTO', 'TRANSFERENCIA') NOT NULL DEFAULT 'PREINCUBACION',
    `entregablesJson` JSON NULL,
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `actualizadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`), UNIQUE KEY `uq_ei_proyecto` (`idProyecto`),
    CONSTRAINT `fk_ei_proyecto` FOREIGN KEY (`idProyecto`) REFERENCES `proyectos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `capacidadesLaboratorio` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `idSede` INT UNSIGNED NOT NULL,
    `nombre` VARCHAR(200) NOT NULL,
    `tipo` ENUM('LABORATORIO', 'EQUIPAMIENTO', 'CLINICA_JURIDICA', 'MENTORIA') NOT NULL,
    `disponibilidad` ENUM('DISPONIBLE', 'EVALUACION_PREVIA', 'SATURADO', 'MANTENIMIENTO') NOT NULL DEFAULT 'DISPONIBLE',
    `descripcion` TEXT NULL,
    `estado` ENUM('ACTIVO', 'INACTIVA') NOT NULL DEFAULT 'ACTIVO',
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `eliminadoEn` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`), INDEX `idx_cap_sede` (`idSede`), INDEX `idx_cap_disponibilidad` (`disponibilidad`),
    CONSTRAINT `fk_cap_sede` FOREIGN KEY (`idSede`) REFERENCES `sedes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `documentosGenerados` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `idProyecto` INT UNSIGNED NOT NULL,
    `idGeneradoPor` INT UNSIGNED NOT NULL,
    `tipoDocumento` ENUM('NDA', 'CONTRATO_CONVENIO', 'FICHA_PI', 'OFICIO_INSTITUCIONAL', 'PLAN_EMPRESARIAL', 'CARTA_INTENCION', 'MINUTA', 'FICHA_EJECUTIVA') NOT NULL,
    `categoriaDocumento` ENUM('OPERATIVO', 'JURIDICO') NOT NULL,
    `numeroVersion` VARCHAR(10) NOT NULL DEFAULT 'v1.0',
    `clasificacion` ENUM('PUBLICO', 'USO_INTERNO', 'CONFIDENCIAL', 'RESTRINGIDO') NOT NULL DEFAULT 'USO_INTERNO',
    `rutaArchivo` VARCHAR(500) NULL,
    `estadoJuridico` ENUM('EN_REVISION_JURIDICA', 'APROBADO_PARA_FIRMA', 'VIGENTE', 'OBSOLETO') NOT NULL DEFAULT 'EN_REVISION_JURIDICA',
    `aprobadoPor` INT UNSIGNED NULL DEFAULT NULL,
    `aprobadoEn` DATETIME NULL DEFAULT NULL,
    `creadoEn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `eliminadoEn` DATETIME NULL DEFAULT NULL,
    PRIMARY KEY (`id`), INDEX `idx_doc_proyecto` (`idProyecto`),
    CONSTRAINT `fk_doc_proyecto` FOREIGN KEY (`idProyecto`) REFERENCES `proyectos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_doc_generado` FOREIGN KEY (`idGeneradoPor`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `bitacoraAuditoria` (
    `id` CHAR(36) NOT NULL,
    `idActor` INT UNSIGNED NULL,
    `entidad` VARCHAR(80) NOT NULL,
    `idRegistro` VARCHAR(50) NOT NULL,
    `accion` ENUM('CREAR', 'ACTUALIZAR', 'CAMBIO_ESTADO', 'ELIMINAR_LOGICO', 'ACCESO_DATA_ROOM', 'DESCARGA_CSV', 'DESCARGA_PDF', 'NDA_ACEPTADO', 'NDA_REVOCADO', 'LOGIN_EXITOSO', 'LOGIN_FALLIDO', 'ACCESO_DENEGADO') NOT NULL,
    `snapshotAntes` JSON NULL,
    `snapshotDespues` JSON NULL,
    `motivoCambio` VARCHAR(500) NULL,
    `ipOrigen` VARCHAR(45) NOT NULL,
    `userAgent` VARCHAR(500) NULL,
    `timestampUtc` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `hashEncadenado` CHAR(64) NOT NULL,
    PRIMARY KEY (`id`), INDEX `idx_audit_actor` (`idActor`), INDEX `idx_audit_entidad` (`entidad`, `idRegistro`), INDEX `idx_audit_accion` (`accion`), INDEX `idx_audit_timestamp` (`timestampUtc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE OR REPLACE VIEW `vistaColaboracionInterSede` AS
SELECT ip1.`idSede` AS idSedeA, ip2.`idSede` AS idSedeB, COUNT(DISTINCT p.`id`) AS totalProyectosCompartidos
FROM `integrantesProyecto` ip1
INNER JOIN `integrantesProyecto` ip2 ON ip1.`idProyecto` = ip2.`idProyecto` AND ip1.`idSede` < ip2.`idSede`
INNER JOIN `proyectos` p ON p.`id` = ip1.`idProyecto` AND p.`eliminadoEn` IS NULL
WHERE ip1.`eliminadoEn` IS NULL AND ip2.`eliminadoEn` IS NULL
GROUP BY ip1.`idSede`, ip2.`idSede`;

CREATE OR REPLACE VIEW `vistaCuellosBotella` AS
SELECT p.`id`, p.`folio`, p.`titulo`, p.`idSedeOrigen`, p.`etapaMaduracion`, p.`causaCuelloBotella`, p.`ultimoCambioEtapaEn`, DATEDIFF(NOW(), p.`ultimoCambioEtapaEn`) AS diasSinCambio
FROM `proyectos` p
WHERE p.`eliminadoEn` IS NULL AND p.`estadoFlujo` IN ('ACTIVO', 'EN_INCUBACION') AND p.`ultimoCambioEtapaEn` IS NOT NULL AND DATEDIFF(NOW(), p.`ultimoCambioEtapaEn`) > 30;

SET foreign_key_checks = 1;
