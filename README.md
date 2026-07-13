# MedSync - Sistema para CERSEU Medicina

## 🏥 Descripción
**MedSync** es una solución tecnológica robusta y de nivel empresarial diseñada para automatizar y optimizar los procesos académicos y administrativos del Centro de Responsabilidad Social y Extensión Universitaria (CERSEU) de la Facultad de Medicina de la **Universidad Nacional Mayor de San Marcos (UNMSM)**. 

Este proyecto busca centralizar la gestión de cursos de extensión y capacitación (ej. Salud Mental, Epidemiología, Primeros Auxilios), permitiendo la transición de procesos manuales a un entorno automatizado con altos estándares de calidad corporativa e interfaz moderna.

## ✨ Características Principales
El sistema interactúa entre una base de datos relacional (Backend) y una interfaz visual atractiva (Frontend) ofreciendo tres portales principales:
1. **Portal del Coordinador:** Creación del catálogo académico, visualización de vacantes libres, gestión de matrículas (validando cruces de horarios y topes de capacidad) y visualización de reportes de desempeño.
2. **Portal del Docente:** Gestión exclusiva de las secciones asignadas al profesor, toma de asistencia por sesión y registro de notas con cálculo automático del promedio.
3. **Portal del Estudiante:** Visualización de consolidado de notas (con traducción dinámica de cursos), récord de asistencia y módulo de Encuesta de Satisfacción Docente.
4. **Diseño Premium:** Interfaz con Modo Oscuro, tipografía institucional, colores representativos, perfiles de usuario dinámicos (ilustraciones SVG) y soporte de animaciones en la experiencia de usuario.

## 📁 Estructura del Repositorio
Para mantener el orden profesional exigido, el proyecto se divide en las siguientes carpetas principales:
```text
MedSync/
├── Archivos de exportación de la Base de Datos/
├── Archivos del Informe Corporativo e Informe Técnico/
├── Archivos fuentes de la aplicación desarrollada/  # (Aplicación Web Node.js)
├── Archivos fuentes del modelo conceptual/         
├── Archivos fuentes del modelo lógico/
├── Archivos fuentes del modelo físico/             
├── Entrega parcial 1/
├── Entrega parcial 2/
├── Scripts de Objetos de Programación/
├── Scripts de Prueba de Funcionalidades/
└── Scripts de creación de esquema de Base de Datos/# (Los 3 scripts SQL principales)
```

## 🛠️ Tecnologías Utilizadas
* **Backend y Base de Datos:** MySQL / Oracle SQL (Triggers, Procedimientos Almacenados, Vistas y Funciones).
* **Capa de Servidor (API):** Node.js con Express.js y `mysql2`.
* **Frontend:** HTML5, CSS3 Vainilla y JavaScript (Fetch API).
* **Diseño UI/UX:** Paleta de colores 'CERSEU' y tipografía 'Modern Professional' (Google Fonts: Poppins).

## 🎯 Objetivos del Proyecto
* **Centralizar** el registro de estudiantes, docentes y la oferta académica de extensión en Medicina.
* **Automatizar** el seguimiento de asistencias y la carga de calificaciones sin alteraciones de datos manuales.
* **Impacto Social (ODS 3):** Facilitar la gestión de programas educativos de bienestar público y asegurar la calidad educativa mediante encuestas de satisfacción.

## 📜 Reglas de Negocio (Resumen)
El sistema valida estrictamente las operaciones en la base de datos:
* **RN-16:** Un estudiante no puede matricularse en una sección si su horario choca con otra matrícula activa.
* **RN-17 / RN-18:** El sistema bloquea matrículas duplicadas y matrículas que excedan el límite máximo de estudiantes del curso.
* **RN-31 / RN-32:** La nota final se calcula ponderada (30/40/30) solo cuando el docente registra las tres notas, determinando automáticamente si aprueba (>= 11) o reprueba.
* **RN-42 / RN-43:** Las encuestas de evaluación docente son anónimas y de llenado único por alumno matriculado.

## 🚀 Cómo Ejecutar el Proyecto
### Paso 1: Levantar la Base de Datos
1. Abre MySQL Workbench u otro cliente SQL.
2. Abre y ejecuta los scripts de la carpeta `Scripts de creación de esquema de Base de Datos` estrictamente en este orden:
   - `script_creacionDB.sql` (Crea la BD `cerseu_med`)
   - `script_creacionTablasETC.sql` (Crea tablas, vistas, funciones y procedures)
   - `script_cangaDatos.sql` (Inserta toda la data ficticia)

### Paso 2: Levantar el Servidor Web
1. Abre una terminal y navega hasta la carpeta:
   `cd "Archivos fuentes de la aplicación desarrollada/medsync-app"`
2. Instala las dependencias necesarias:
   `npm install`
3. Ejecuta el servidor:
   `node server.js`
4. Abre tu navegador y dirígete a `http://localhost:3000`.

### 🔑 Credenciales Oficiales de Prueba (Para Presentación y Pruebas)
*(Nota: Para facilitar las pruebas interactivas, se ha configurado la clave maestra genérica `123456` para todas las cuentas en modo desarrollo)*

- **Portal Coordinador:** User: `coordinator` | Clave: `123456`
- **Portal Docente:** User: `lbaldeon` | Clave: `123456` *(Docente de Epidemiología)*
- **Portal Estudiante:** User: `atorres` | Clave: `123456` *(Estudiante modelo para encuestas)*

## 👥 Equipo de Desarrollo
* Bellodas Ramos, Emily Guisell
* Quispe Arango, Juan Pablo
* Paredes Galvez, Piero Alfonso
* Castro Loayza, Yared Benjamin
* Vargas Quispe, Sebastian Alexandre
