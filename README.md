
# 📊 val_sinba

**Sistema de Validación y Seguimiento de Indicadores Básicos en Salud Municipal**

---

## 📌 Resumen

**val_sinba** es un sistema web desarrollado para la carga, consulta y validación de indicadores de salud a nivel municipal. Facilita el procesamiento de datos estadísticos provenientes de archivos CSV, permitiendo su visualización dinámica mediante filtros por unidad médica (CLUES), sección y apartado. Está dirigido a equipos técnicos municipales y validadores estatales, con énfasis en transparencia y usabilidad.

---

## 🎯 Objetivo general

Brindar una herramienta digital que permita sistematizar la información de indicadores de salud básica a nivel municipal, desde su recolección hasta su validación, mediante una interfaz web eficiente, responsiva y segura.

---

## 🧰 Tecnologías utilizadas

- **Frontend**:
  - HTML5
  - CSS3 (con identidad visual CDMX)
  - JavaScript ES6
  - Bootstrap 5
  - DataTables.js (para tablas interactivas)

- **Backend-as-a-Service (BaaS)**:
  - Supabase (PostgreSQL + API REST)
  - Supabase Auth (en desarrollo para login por usuario)

- **DevOps y despliegue**:
  - Git y GitHub
  - GitHub Pages (hosting del frontend)

---

## 👥 Roles del sistema

| Rol              | Funciones principales                                           |
|------------------|----------------------------------------------------------------|
| Administrador (Estadígrafo) | Subir archivos CSV, gestionar y revisar los datos cargados |
| Coordinador (Validador)     | Consultar y validar la información registrada          |
| Usuario general             | Acceso restringido a consulta de datos (opcional)      |

---

## 🗂️ Estructura de base de datos

El sistema utiliza tres tablas principales en Supabase:

- `tbl_generales`: contiene los datos cargados desde archivos CSV.
- `tbl_clues`: catálogo de unidades médicas (clave y nombre).
- `tbl_indice`: catálogo de variables, apartados y secciones.

Relaciones:
- `tbl_generales.var` → `tbl_indice.id_var`
- `tbl_generales.clues` → `tbl_clues.clave_clues`

---

## 🔄 Funcionamiento general

### 📁 Subida de datos
1. El administrador selecciona un archivo CSV.
2. Se validan los encabezados y el contenido.
3. Los registros se suben a Supabase de forma asincrónica.

### 🔎 Consulta de datos
1. La tabla se construye dinámicamente con datos relacionados.
2. Se pueden aplicar filtros por CLUES, sección y apartado.
3. Se ofrece paginación, búsqueda instantánea y ordenamiento.

---

## 🎨 Diseño visual

El sistema adopta la identidad gráfica institucional de la **CDMX**:

- **Guinda institucional** para encabezados y títulos.
- **Gris institucional** para botones principales.
- **Bordes dorados** en los filtros de CLUES y Sección para destacar la funcionalidad.

---

## 🔐 Seguridad y autenticación

> **En desarrollo**: sistema de login usando Supabase Auth.

Próximamente se integrará autenticación con:
- Email/contraseña para el administrador y validador.
- Google OAuth (opcional).

---

## 🚀 Despliegue

Puedes acceder al sistema directamente desde:

👉 **[val_sinba en GitHub Pages](https://fghnic.github.io/val_sinba/)**

---

## 📁 Organización de archivos

