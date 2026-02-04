# Atom Challenge – Frontend (Gestor de Tareas)

Este repositorio contiene el Frontend del challenge técnico de Atom.  
La aplicación es una lista de tareas desarrollada con Angular, que permite autenticación simple por correo y gestión completa de tareas.

Web App desplegada en Firebase Hosting:

https://atom-proyecto.web.app

---

## Tecnologías utilizadas

- Angular 19 (Standalone Components)
- Bootstrap 5
- RxJS + Observables
- Reactive Forms
- Guards + Routing + Lazy Loading
- Firebase Hosting

---

## Funcionalidades

- Inicio de sesión solicitando únicamente correo
- Creación automática de usuario si no existe (con confirmación)
- Persistencia del token JWT en localStorage
- Crear tareas (título + descripción)
- Listar tareas ordenadas por fecha de creación
- Editar tareas
- Eliminar tareas
- Buscador de tareas
- Marcar tareas como completadas o pendientes mediante checkbox
- UI responsive tipo tarjetas adaptada a desktop y móvil
- Accesibilidad básica usando atributos ARIA

---

## Demo rápida

- Inicia sesión con cualquier correo (ej: `test@atom.com`)
- Si el usuario no existe, se solicitará confirmación para crearlo automáticamente
- Al ingresar, podrás gestionar tus tareas de forma completa (CRUD)

---

## Arquitectura del proyecto

El frontend sigue una estructura modular y escalable basada en buenas prácticas de Angular:

- `features/` contiene las páginas principales (Login y Tasks)
- `core/` contiene lógica global como autenticación, guards e interceptors
- Separación clara entre UI, lógica de negocio y consumo del API
- Componentes standalone organizados para facilitar mantenimiento y escalabilidad

---

## Buenas prácticas aplicadas

- Servicios desacoplados usando Observables (RxJS)
- Guards para proteger rutas autenticadas
- Lazy Loading para optimizar carga inicial
- Componentes bien estructurados y reutilizables
- Enlace de datos optimizado con Angular Forms
- UI accesible con atributos ARIA básicos

---

## Ejecución local

Instalar dependencias:

npm install

Levantar servidor de desarrollo:

ng serve

La aplicación estará disponible en:

http://localhost:4200

---

## Configuración del Backend API

El frontend consume el backend desplegado en Cloud Functions:

https://api-ykigm3b4pa-uc.a.run.app

Las requests se realizan usando JWT:

Authorization: Bearer <token>

---

## Pruebas unitarias

Ejecutar tests:

ng test

Incluye pruebas básicas de:

- Servicios principales
- Componentes principales

---

## Build y Deploy

Build de producción:

ng build --configuration production

Salida generada en:

dist/frontend/browser

Deploy a Firebase Hosting:

firebase deploy --only hosting

---

## Requisitos del challenge cubiertos

- Angular App con 2 páginas (Login + Tasks)
- Formulario de login solo con correo
- Confirmación de creación de usuario nuevo
- CRUD completo de tareas
- Checkbox completada/pendiente
- Responsive design con Bootstrap
- Guards + Lazy Loading
- Consumo seguro del API mediante JWT
- Unit tests básicos
- Deploy en Firebase Hosting

---

## Autor

Desarrollado por Jose Pablo Ponce
