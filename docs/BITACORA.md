# Bitácora de diseño — Agora

Registro de decisiones de diseño para el **Documento Único** del proyecto integrador (750018C). Cada entrada vincula la decisión con al menos una heurística de Nielsen.

---

## Entrada 1 — Registro manual con validación inline

**Fecha:** 2026-05-27  
**Pantalla:** Registro (`Auth > Registro — Default`, `Registro — Error`)  
**Decisión:** Mostrar errores de validación **debajo de cada campo**, con borde rojo (`#dc2626`), fondo suave (`#fef2f2`) y microcopy orientado a la acción (p. ej. *“Este nombre de usuario ya está en uso. Prueba con otro.”*), en lugar de un único banner genérico al enviar el formulario.

**Justificación (Heurísticas de Nielsen):**

| # | Heurística | Cómo se aplica |
|---|---|---|
| **5** | **Prevención de errores** | Helpers preventivos bajo username y contraseña antes del envío; validación en blur/submit evita registrar datos inconsistentes. |
| **9** | **Ayuda a reconocer, diagnosticar y recuperarse de errores** | El mensaje indica qué campo falló y qué hacer (“Prueba con otro”), sin códigos técnicos de Firebase. |
| **6** | **Reconocimiento antes que recuerdo** | Labels visibles, placeholders de ejemplo y asteriscos en campos obligatorios reducen la carga de memoria. |

**Alternativa descartada:** Toast único con “Error auth/email-already-in-use”. Rechazado por exponer jerga técnica y no señalar el campo a corregir.

---

## Entrada 2 — Estado de carga en el botón principal

**Fecha:** 2026-05-27  
**Pantalla:** Registro (`Auth > Registro — Cargando`)  
**Decisión:** Al enviar el formulario, el botón **Crear cuenta** pasa a estado de carga: texto *“Creando cuenta...”*, spinner, opacidad reducida (~65 %) e inputs deshabilitados visualmente hasta completar la petición a Firebase.

**Justificación (Heurísticas de Nielsen):**

| # | Heurística | Cómo se aplica |
|---|---|---|
| **1** | **Visibilidad del estado del sistema** | El usuario ve que la acción está en curso y no interpreta un clic fallido como “nada pasó”. |
| **5** | **Prevención de errores** | Deshabilitar inputs evita envíos duplicados mientras Firebase procesa el registro. |
| **4** | **Consistencia y estándares** | Mismo patrón de carga que Google (*“Conectando con Google...”*) en Login/Registro. |

**Alternativa descartada:** Overlay de pantalla completa sin feedback en el botón. Rechazado por romper el contexto del formulario y ocultar qué acción se está ejecutando.

---

## Entrada 3 — Campo de avatar con acción explícita

**Fecha:** 2026-05-27  
**Pantalla:** Registro (`Auth > Registro — Default`)  
**Decisión:** El avatar se configura con **vista previa circular**, botón secundario *“Subir foto”* y helper *“JPG o PNG, máximo 2 MB”*, en lugar de un `<input type="file">` nativo sin contexto visual.

**Justificación (Heurísticas de Nielsen):**

| # | Heurística | Cómo se aplica |
|---|---|---|
| **2** | **Coincidencia entre el sistema y el mundo real** | Metáfora familiar de foto de perfil + botón de subida comprensible. |
| **8** | **Diseño estético y minimalista** | Una fila compacta (preview + acción) evita un bloque de archivo técnico que distrae del resto del formulario. |

---

## Entrada 4 — Modal bloqueante vs ruta dedicada para username (Google)

**Fecha:** 2026-05-27  
**Pantalla:** Google OAuth post-login (`Auth > Google — Username`)  
**Decisión:** Tras autenticarse con Google, mostrar un **modal centrado sobre overlay** (implementable como ruta `/completar-username` con apariencia modal) en lugar de redirigir directamente al dashboard o integrar el campo username dentro del formulario de registro manual.

**Justificación (Heurísticas de Nielsen):**

| # | Heurística | Cómo se aplica |
|---|---|---|
| **3** | **Control y libertad del usuario** | El overlay bloquea el dashboard hasta completar el paso obligatorio, pero el usuario ve su identidad Google confirmada (badge + avatar) y entiende por qué debe detenerse. |
| **5** | **Prevención de errores** | Separar el paso Google del formulario manual evita confundir campos ya provistos por OAuth (correo, nombre) con los que el usuario debe definir (username único). |
| **8** | **Diseño estético y minimalista** | Un solo campo en el modal reduce fricción frente a reutilizar el formulario completo de registro manual (6 campos). |

**Alternativa descartada — Ruta `/dashboard` directa con banner editable:** Permite entrar sin username único, generando colisiones en chat y salas. **Alternativa descartada — Incrustar username en Login:** Mezcla flujos OAuth y correo en una sola vista y dificulta el guard de ruta post-login.

---

## Entrada 5 — Retroalimentación de carga durante verificación de username

**Fecha:** 2026-05-27  
**Pantalla:** `Google — Username — Cargando`  
**Decisión:** Durante la consulta asíncrona a Firestore (`users.username` único), deshabilitar el input, cambiar el subtítulo a *“Comprobando si tu nombre de usuario está disponible...”*, mostrar nota *“Verificando en la base de datos...”* y reemplazar el CTA por *“Verificando...”* con spinner.

**Justificación (Heurísticas de Nielsen):**

| # | Heurística | Cómo se aplica |
|---|---|---|
| **1** | **Visibilidad del estado del sistema** | El usuario sabe que el sistema está comprobando disponibilidad, no que la app se congeló tras OAuth. |
| **5** | **Prevención de errores** | Input y botón deshabilitados impiden enviar el mismo username varias veces mientras corre la verificación. |
| **9** | **Recuperación de errores** | Si la verificación falla por colisión, el frame `Google — Username — Error` muestra el mismo patrón inline que registro manual, con instrucción clara (*“Prueba con otro”*). |

**Alternativa descartada:** Spinner global sin texto. Rechazado porque no comunica qué operación está en curso (OAuth vs verificación de username vs creación de perfil).

---

## Referencia Figma

| Frame | Node ID | Propósito |
|---|---|---|
| Registro — Default | `64:65` | Formulario vacío, todos los campos |
| Registro — Error | `101:47` | Username ocupado + errores de validación |
| Registro — Foco | `102:47` | Estado de foco en username |
| Registro — Cargando | `104:47` | Spinner y botón deshabilitado |
| Google — Username | `111:47` | Modal post-OAuth, campo username |
| Google — Username — Cargando | `111:73` | Verificación async en Firestore |
| Google — Username — Error | `111:101` | Colisión de username (inline) |

**Prototipo registro manual:** clic en **Crear cuenta** (Default) → **Cargando**.  
**Prototipo Google:** clic **Continuar con Google** (Login/Registro) → **Google — Username** → **Continuar al panel** → **Cargando**.

**Copy canónico:** `src/copy/es.ts` → `auth.register`, `auth.google.usernameSetup`  
**Guía legible:** `docs/COPY.md` → secciones Registro y Google
