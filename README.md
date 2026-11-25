# Red UdeG - Ecosistema de Innovación e Investigación

Plataforma integral desarrollada para la Universidad de Guadalajara (UdeG) con el objetivo de centralizar, gestionar y dar trazabilidad a los proyectos de I+D+i, el portafolio tecnológico, y la vinculación entre investigadores, alumnos y actores externos. 

El sistema gestiona el ciclo de vida completo de los proyectos (desde preincubación hasta escalamiento/TRL 9), la asignación de fondos, infraestructura compartida (Banco de Capacidades) y el resguardo legal de la propiedad intelectual.

## Características Principales

* **Control de Accesos Basado en Roles (RBAC):** Jerarquía estricta que divide a los usuarios en Administradores (Globales y de Sede), Académicos (Profesores/Investigadores), Alumnos (Pregrado/Posgrado) y Externos.
* **Autenticación Segura y OTP:** Sistema JWT con almacenamiento en cookies `HttpOnly` / `Secure`. El registro incluye validación de dominio institucional (`@alumnos.udeg.mx`, `@academicos.udeg.mx`) y verificación en dos pasos (OTP) enviada por correo.
* **Dashboards Dinámicos:** La interfaz (Bento Grid) se adapta automáticamente al rol del usuario, mostrando KPIs específicos, gráficas SVG nativas interactivas y métricas de madurez tecnológica (TRL).
* **Gestión de Perfiles y Trazabilidad:** Administrador centralizado de perfiles con visualización gráfica de la jerarquía institucional de cada usuario.
* **Sistema de Temas Dinámico:** Implementación de Material Design 3 con soporte nativo para múltiples temas (Claro, Oscuro, Azul, Rosa) controlados por variables CSS en tiempo de ejecución.

## Stack Tecnológico

**Frontend:**
* React 18
* Vite (HMR y empaquetado)
* Tailwind CSS (Framework de estilos y UI)
* React Router DOM (Enrutamiento cliente)

**Backend:**
* PHP (Arquitectura MVC personalizada, sin frameworks pesados)
* MySQL (Base de datos relacional)
* PHPMailer (Gestión SMTP para correos OTP)
* Firebase JWT (Generación y validación de tokens)

**Infraestructura:**
* Docker & Docker Compose (Contenedorización del entorno)
* Nginx / PHP-FPM (Servidor web interno)

## Acomodo del Sistema (Arquitectura del Repositorio)

El proyecto está dividido en dos aplicaciones independientes orquestadas mediante Docker. Esta separación garantiza la escalabilidad y facilita el despliegue continuo.

```text
red-udeg/
├── frontend/                 # APLICACIÓN CLIENTE (React/Vite)
│   ├── src/
│   │   ├── componentes/      # UI reutilizable (Layout, Modales, Tablas)
│   │   ├── contexto/         # Estados globales y persistencia (AuthContexto)
│   │   ├── paginas/          # Vistas renderizadas (Dashboard, Login, Perfiles)
│   │   └── servicios/        # Clientes Fetch para consumo de la API REST
│   ├── index.css             # Variables globales (Temas de Material Design 3)
│   ├── tailwind.config.js    # Configuración de diseño y paletas dinámicas
│   └── package.json          # Dependencias de Node.js
│
├── backend-php/              # API REST (PHP)
│   ├── src/
│   │   ├── Controladores/    # Lógica de negocio (Auth, Usuarios, Proyectos)
│   │   ├── Modelos/          # Abstracción de datos (Active Record)
│   │   ├── Nucleo/           # Clases base (Router, Request, Respuesta, DB)
│   │   └── Servicios/        # Integraciones (JWT, PHPMailer)
│   ├── public/               # Entry point (index.php) y Front Controller
│   ├── Dockerfile            # Receta de construcción del contenedor PHP (Alpine)
│   └── composer.json         # Dependencias de PHP
│
├── docker-compose.yml        # Orquestación de contenedores (Nginx, PHP, MySQL)
├── .env.example              # Plantilla base de credenciales y configuración
└── .gitignore                # Exclusiones de Git (node_modules, vendor, .env)

```

## Setup y Entorno de Desarrollo (Guía de Instalación)

### Prerrequisitos

* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (o Docker Engine + Compose plugin) instalado y en ejecución.
* [Node.js](https://nodejs.org/) (v18 o superior).
* [Git](https://git-scm.com/).

### 1. Clonar el repositorio

Descarga el código fuente en tu máquina local:

```bash
git clone [https://github.com/tu-usuario/red-udeg.git](https://github.com/tu-usuario/red-udeg.git)
cd red-udeg

```

### 2. Configuración del Entorno (Variables)

El sistema requiere variables de entorno para la base de datos, el cifrado JWT y el servidor de correos SMTP. Nunca subas tus credenciales reales al repositorio.

Copia el archivo de ejemplo para crear tu configuración local:

```bash
cp .env.example .env

```

Abre el archivo `.env` y llena los datos requeridos, prestando especial atención a la sección `SMTP` si deseas probar el flujo de correos de verificación (OTP).

### 3. Levantar la Infraestructura Backend (Docker)

Docker se encargará de levantar la base de datos MySQL, instalar las dependencias de PHP vía Composer, y configurar el servidor web.

```bash
# Construir y levantar los contenedores en segundo plano
docker-compose up -d --build

```

*Nota: Si es la primera vez que lo ejecutas, asegúrate de importar el script SQL inicial (semillas) en el contenedor de MySQL para tener los catálogos de sedes y roles disponibles.*

### 4. Desplegar el Frontend (React)

Abre una nueva pestaña en tu terminal y navega a la carpeta del frontend para instalar los paquetes de Node e iniciar el servidor de desarrollo de Vite.

```bash
cd frontend
npm install
npm run dev

```

### 5. Acceso al Sistema

Una vez levantado todo el entorno:

* **Plataforma Web (Frontend):** `http://localhost:5161`
* **API REST (Backend):** Responderá en el puerto configurado en tu `.env` (ej. `http://localhost:8080/api/v1/...`).

## Arquitectura y Seguridad

* **Stateless Auth:** El backend no guarda sesiones activas en memoria. Todo se maneja a través de tokens JWT firmados (Access y Refresh tokens).
* **Protección CSRF y XSS:** Los tokens de acceso se almacenan en memoria (React Context) y los Refresh Tokens en cookies `HttpOnly`, evitando su lectura desde JavaScript.
* **Resolución DNS en Docker:** Configuración de resolutores externos (1.1.1.1 / 8.8.8.8) en el `docker-compose.yml` para garantizar la salida del tráfico SMTP del contenedor de PHP hacia proveedores de correo (ej. Gmail).
* **Bajas Lógicas:** La eliminación de perfiles, proyectos y expedientes no ejecuta un `DELETE` real en SQL, sino un `UPDATE` de estado (`eliminadoEn`), manteniendo intacto el historial de auditoría y trazabilidad.

```
