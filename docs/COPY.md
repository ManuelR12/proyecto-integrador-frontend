# Agora — Copy canónico

Fuente única de textos para **Figma**, **código** (`src/copy/es.ts`) y **handoff**.  
Cuando se implementen pantallas en React, importar strings desde `src/copy/es.ts` — no hardcodear en componentes.

---

## Reglas generales

| Regla | Ejemplo |
|---|---|
| Nombre del producto | **Agora** (no “Proyecto Integrador” en UI) |
| Idioma | Español (Colombia / neutro LATAM) |
| Tono | Claro, directo, orientado a estudiantes |
| Mayúsculas | Solo en nombres propios y títulos de pantalla |
| Acentos | Siempre en UI final (`sesión`, `reunión`, `contraseña`) |
| Botones primarios | Verbo en infinitivo o imperativo corto: **Iniciar sesión**, **Crear reunión** |
| Fechas (mock) | `Fecha: Mar, 26 de Mayo, 13:00 – 14:30` (guión largo `–`) |

---

## Marca

| Clave | Texto |
|---|---|
| Nombre | Agora |
| Tagline | Salas de estudio virtuales en tiempo real |
| Descripción (Home) | Conecta con tu equipo mediante chat, videollamadas y compartición de pantalla. Diseñado para el estudio síncrono universitario. |

---

## Navegación (sidebar)

| Ítem | Texto |
|---|---|
| Título sidebar (línea 1) | Dashboard |
| Título sidebar (línea 2) | Principal |
| Marca (pie del sidebar) | **Agora** |
| Nav | Dashboard · Asignaturas · Calendario · Sesión Actual |

---

## Búsqueda global

| Elemento | Texto |
|---|---|
| Placeholder | Buscar reuniones, clases, fechas... |

---

## Auth

Firebase Authentication debe soportar **correo/contraseña** y **Google Sign-In**. Google es el acceso recomendado en landing y login.

### Landing (`/`) — entrada principal

| Elemento | Texto |
|---|---|
| Título hero | Tu salón de estudio, en cualquier lugar |
| Subtítulo | Únete a salas privadas con tu cuenta de Google y colabora en tiempo real con chat, video y pantalla compartida. |
| CTA primario | **Continuar con Google** |
| CTA secundario | Usar correo y contraseña |
| CTA terciario | Crear cuenta con correo |
| Nota de confianza | Usamos Google solo para verificar tu identidad. No publicamos nada en tu nombre. |
| Features | Chat persistente · Video y audio · Compartir pantalla |

### Home (variante compacta en Figma Auth)

| Elemento | Texto |
|---|---|
| CTA Google | Continuar con Google |
| CTA correo | Iniciar sesión con correo |
| CTA registro | Crear cuenta |

### Login (`/login`)

| Elemento | Texto |
|---|---|
| Volver | ← Volver |
| Google | **Continuar con Google** |
| Separador | o continúa con correo |
| Título | Iniciar sesión |
| Subtítulo | Accede a tus salas y reuniones. |
| Correo | Correo / placeholder: `tu@correo.edu` |
| Contraseña | Contraseña |
| CTA | Iniciar sesión |
| Footer | ¿No tienes cuenta? **Regístrate** |

### Registro (`/registro`)

| Elemento | Texto |
|---|---|
| Google | **Continuar con Google** |
| Separador | o continúa con correo |
| Título | Crear cuenta |
| Subtítulo (default) | Completa tus datos para crear tu cuenta con correo. |
| Subtítulo (error) | Revisa los campos marcados antes de continuar. |
| Subtítulo (cargando) | Estamos creando tu cuenta. No cierres esta ventana. |
| Nombres * | Nombres / placeholder: Ej. Ana María |
| Apellidos * | Apellidos / placeholder: Ej. García López |
| Nombre de usuario * | Nombre de usuario / placeholder: ej. ana_garcia |
| Helper username | Entre 3 y 20 caracteres: letras, números o guión bajo. |
| Avatar * | Subir foto · JPG o PNG, máximo 2 MB |
| Correo * | Correo / placeholder: tu@correo.edu |
| Contraseña * | Contraseña / placeholder: Mínimo 8 caracteres |
| Helper contraseña | Usa al menos 8 caracteres con letras y números. |
| CTA | Crear cuenta |
| CTA (cargando) | Creando cuenta... |
| Footer | ¿Ya tienes cuenta? **Iniciar sesión** |

#### Errores inline (sin jerga técnica)

| Campo | Mensaje |
|---|---|
| Apellidos vacío | Escribe tu apellido. |
| Username ocupado | Este nombre de usuario ya está en uso. Prueba con otro. |
| Correo inválido | Introduce un correo válido, por ejemplo tu@correo.edu. |
| Contraseña débil | La contraseña debe tener al menos 8 caracteres. |
| Avatar faltante | Selecciona una imagen para tu avatar. |

#### Estados visuales (Figma)

| Frame | Descripción |
|---|---|
| `Registro — Default` | Formulario vacío, labels con asterisco obligatorio |
| `Registro — Foco` | Borde azul 2px en campo activo |
| `Registro — Error` | Borde rojo + fondo `#fef2f2` + mensaje bajo el campo |
| `Registro — Cargando` | Inputs deshabilitados, botón con spinner y opacidad reducida |

**Prototipo:** `Registro — Default` → clic en **Crear cuenta** → `Registro — Cargando`

### Google — estados OAuth

| Estado | Texto |
|---|---|
| Cargando (popup) | Conectando con Google... |
| Error OAuth | No pudimos iniciar sesión con Google. Inténtalo de nuevo. |
| Error (States) | Error con Google — No pudimos completar el inicio de sesión. Cierra el popup e inténtalo de nuevo. |
| Badge verificado | Cuenta verificada con Google |

### Google — configuración de username (post-OAuth)

Pantalla/modal bloqueante tras autenticación con Google cuando el usuario **no tiene username** en Firestore. Ruta propuesta: `/completar-username`.

| Elemento | Texto |
|---|---|
| Título | Elige tu nombre de usuario |
| Subtítulo (default) | Es cómo te verán en las salas de estudio. Debe ser único en Agora. |
| Subtítulo (cargando) | Comprobando si tu nombre de usuario está disponible... |
| Subtítulo (error) | Revisa tu nombre de usuario antes de continuar. |
| Estado de verificación | Verificando en la base de datos... |
| Campo | Nombre de usuario * / placeholder: ej. ana_garcia |
| Helper | Entre 3 y 20 caracteres: letras, números o guión bajo. |
| CTA | Continuar al panel |
| CTA (cargando) | Verificando... |
| Nota al pie | No podrás cambiar tu nombre de usuario más adelante. |

#### Errores inline

| Escenario | Mensaje |
|---|---|
| Username ocupado | Este nombre de usuario ya está en uso. Prueba con otro. |
| Formato inválido | Usa entre 3 y 20 caracteres: letras, números o guión bajo. |

#### Frames Figma

| Frame | Descripción |
|---|---|
| `Google — Username` | Modal sobre overlay; datos de Google visibles (avatar, nombre, correo) |
| `Google — Username — Cargando` | Campo deshabilitado, spinner en CTA, nota de verificación en BD |
| `Google — Username — Error` | Borde rojo + mensaje de colisión de username |

**Prototipo:** Login/Registro → clic **Continuar con Google** → `Google — Username` → **Continuar al panel** → `Google — Username — Cargando`

---

## Dashboard (`/dashboard`)

| Sección | Textos |
|---|---|
| Próximas sesiones | Título: **Próximas sesiones** · Link: **Ver calendario** |
| Sesión (CTA) | **Ir a reunión** |
| Crear reunión | Título · Asunto · **Asignatura** · Fecha · Hora · **Invitar** · **Crear reunión** |
| Unirse | Título · descripción · Código · **Unirse** |

### Crear reunión — campos

| Campo | Label | Placeholder / opciones |
|---|---|---|
| Asunto | Asunto | Ej. Clase de repaso — parcial 2 |
| Asignatura | Asignatura | Select: Desarrollo de Software II · Inteligencia Artificial · Proyecto Integrador |
| Fecha | Fecha | Seleccionar fecha |
| Hora | Hora | 13:00 – 14:30 |
| Invitar | Invitar | Correos separados por coma (ej. ana@uni.edu, luis@uni.edu) |
| Helper invitar | — | Opcional. Los invitados recibirán el código de la sala. |
| CTA | — | Crear reunión |

### Sesiones de ejemplo (mock)

| Materia | Fecha |
|---|---|
| Desarrollo de Software II | Fecha: Mar, 26 de Mayo, 13:00 – 14:30 |
| Inteligencia Artificial | Fecha: Vie, 29 de Mayo, 10:00 – 12:00 |
| Proyecto Integrador | Fecha: Sáb, 23 de Mayo, 8:00 – 10:30 |

---

## Asignaturas · Calendario · Sala · Perfil

Ver `src/copy/es.ts` para listado completo de claves exportadas.

---

## Modales

| Modal | Título | Confirmar | Cancelar |
|---|---|---|---|
| Editar sala | Editar reunión | Guardar | Cancelar |
| Eliminar sala | ¿Eliminar reunión? | Eliminar | Cancelar |

---

## Estados (feedback)

| Estado | Título |
|---|---|
| Loading | Cargando sesiones... |
| Empty | Sin sesiones programadas |
| Error auth | No pudimos iniciar sesión |
| Error Google | Error con Google |
| Error WebRTC | Conexión de video interrumpida |

---

## Legacy — textos a reemplazar

Textos que aparecen hoy en placeholders del repo o en Figma sin acentos:

| ❌ Evitar | ✅ Usar |
|---|---|
| Proyecto Integrador (como título de app) | Agora |
| Inicia sesión | Iniciar sesión |
| Inicia sesion / Iniciar sesion | Iniciar sesión |
| Registrate | Regístrate |
| Proximas Sesiones | Próximas sesiones |
| Crear Reunion | Crear reunión |
| Ir a Reunion | Ir a reunión |
| Microfono / Camara | Micrófono / Cámara |
| Contrasena | Contraseña |
| Mie / Sab (días) | Mié / Sáb |

---

## Sincronización

1. **Figma** — aplicar `legacyReplacements` en revisión de diseño  
2. **React** — `import { auth, dashboard } from '../copy/es'` al implementar  
3. **Handoff** — referenciar este doc, no duplicar tablas de copy extensas
