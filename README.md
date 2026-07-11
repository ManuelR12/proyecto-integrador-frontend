# Agora — Salón de Estudio Colaborativo en Tiempo Real (Frontend)

Agora es una aplicación web para **salas de estudio colaborativas en tiempo real**: los estudiantes
crean o se unen a una sala, se ven y escuchan por videollamada (WebRTC), controlan su audio/video,
comparten pantalla y conversan por un chat persistente.

Este repositorio contiene el **frontend** (SPA en React + Vite). El backend (API REST + servidor de
señalización Socket.io) vive en un repositorio aparte:
**[proyecto-integrador-backend](https://github.com/jeangiraldoo/proyecto-integrador-backend)**.

## Despliegues en producción

| Servicio                          | URL                                                        |
| --------------------------------- | ---------------------------------------------------------- |
| Frontend (Vercel)                 | https://proyecto-integrador-frontend-psi.vercel.app        |
| Backend / Signaling (Render)      | https://proyecto-integrador-backend-k2tf.onrender.com      |
| Documentación de la API (Swagger) | https://proyecto-integrador-backend-k2tf.onrender.com/docs |

---

## Arquitectura

Agora sigue una arquitectura cliente-servidor con comunicación en tiempo real y video P2P:

```
                 ┌───────────────────────────┐
                 │  Frontend (este repo)      │
                 │  React + Vite (Vercel)     │
                 └───────────┬───────────────┘
                             │
        HTTPS (REST, axios)  │  WSS (Socket.io)
                             ▼
                 ┌───────────────────────────┐        ┌───────────────────┐
                 │  Backend (Node.js/Express) │───────▶│  Firebase          │
                 │  + Signaling (Socket.io)   │        │  Auth + Firestore  │
                 │  (Render)                  │        └───────────────────┘
                 └───────────────────────────┘
                             ▲
                             │  Señalización WebRTC (offer/answer/ICE)
             ┌───────────────┴───────────────┐
             │        Video/Audio P2P         │
        ┌────┴─────┐   (WebRTC mesh)     ┌────┴─────┐
        │ Peer A   │◀───────────────────▶│ Peer B   │
        └──────────┘   STUN / TURN       └──────────┘
```

- **Frontend (React + Vite):** SPA en TypeScript. Estado global con **Zustand**, enrutado con
  **React Router**, peticiones REST con **axios** y tiempo real con **socket.io-client**. La
  identidad se maneja con **Firebase Authentication** desde el cliente.
- **Backend (Node.js/Express + Socket.io):** expone la API REST (salas, perfil) y actúa como
  **servidor de señalización** para WebRTC, retransmitiendo `offer`/`answer`/`ICE` y los eventos de
  estado de la sala. Usa `firebase-admin` sobre **Cloud Firestore**.
- **WebRTC (malla P2P):** el audio y video viajan **directo entre pares** (no pasan por el
  servidor). Se usan servidores **STUN** (Google + Metered) y **TURN** (Metered) como relevo para
  pares detrás de NAT/firewalls restrictivos.

### Estructura del proyecto (frontend)

```
src/
├── pages/         # Vistas enrutadas (Home, Login, Registro, Dashboard, Sala, ...)
├── components/    # Componentes de UI reutilizables (incluye layout y la sala)
├── hooks/         # Lógica de React (auth, salas, WebRTC, chat, media, wakeup del server)
├── services/      # Cliente de Socket.io y servicios de sala
├── lib/           # Utilidades puras: cliente axios, Firebase, config WebRTC/ICE, etc.
├── stores/        # Stores de Zustand (estado global)
├── contexts/      # React Contexts (perfil de usuario, toasts, ...)
├── types/         # Tipos e interfaces de TypeScript
└── main.tsx       # Punto de entrada de la SPA
```

---

## Requisitos previos

- **Node.js 18+** (recomendado 20 LTS) y **npm**.
- Un **proyecto de Firebase** con Authentication y Firestore habilitados (para obtener las
  credenciales `VITE_FIREBASE_*`).
- Una cuenta de **Metered TURN** (plan gratuito
  [Open Relay](https://www.metered.ca/tools/openrelay/)) para el relevo WebRTC.
- El **backend** corriendo (local o en producción); ver
  [proyecto-integrador-backend](https://github.com/jeangiraldoo/proyecto-integrador-backend).

---

## Puesta en marcha local (paso a paso)

### 1. Clonar el repositorio

```bash
git clone https://github.com/ManuelR12/proyecto-integrador-frontend.git
cd proyecto-integrador-frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar las variables de entorno

Copia el archivo de ejemplo y rellena tus valores:

```bash
cp .env.example .env.local
```

> En Windows (PowerShell): `Copy-Item .env.example .env.local`

Abre `.env.local` y completa cada variable (ver la tabla de abajo). **Nunca** subas `.env.local` al
control de versiones.

### 4. Levantar el backend

El frontend necesita el backend para autenticar, gestionar salas y hacer la señalización WebRTC.
Clona y levanta el backend siguiendo su propio README:

```bash
git clone https://github.com/jeangiraldoo/proyecto-integrador-backend.git
cd proyecto-integrador-backend
npm install
cp .env.example .env      # y completa las credenciales de Firebase (ver README del backend)
npm run dev               # por defecto queda en http://localhost:3000
```

Asegúrate de que `VITE_API_BASE_URL` del frontend apunte a esa URL (p. ej. `http://localhost:3000`).

### 5. Levantar el frontend

De vuelta en este repositorio:

```bash
npm run dev
```

La aplicación quedará disponible en **http://localhost:5173**. Regístrate o inicia sesión, crea una
sala y comparte el enlace/código para probar la videollamada con un segundo participante.

---

## Variables de entorno (frontend)

Todas se definen en `.env.local` a partir de `.env.example`. En Vite, solo las variables con prefijo
`VITE_` quedan expuestas al cliente.

| Variable                            | Requerida | Descripción                                                                |
| ----------------------------------- | --------- | -------------------------------------------------------------------------- |
| `VITE_FIREBASE_API_KEY`             | Sí        | Firebase Web API key                                                       |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Sí        | Dominio de autenticación de Firebase                                       |
| `VITE_FIREBASE_PROJECT_ID`          | Sí        | ID del proyecto de Firebase                                                |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Sí        | Bucket de Storage de Firebase                                              |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sí        | Messaging sender ID de Firebase                                            |
| `VITE_FIREBASE_APP_ID`              | Sí        | App ID de Firebase                                                         |
| `VITE_API_BASE_URL`                 | Sí        | URL base del backend (REST + Socket.io), p. ej. `http://localhost:3000`    |
| `VITE_TURN_HOST`                    | Sí        | Host del TURN de Metered (solo hostname, p. ej. `global.relay.metered.ca`) |
| `VITE_TURN_USERNAME`                | Sí        | Usuario TURN (del panel de Metered)                                        |
| `VITE_TURN_CREDENTIAL`              | Sí        | Credencial TURN (del panel de Metered)                                     |

> Nota: `VITE_TURN_HOST` debe ser **solo el hostname** (sin esquema ni puerto). La app genera
> automáticamente los endpoints UDP/TCP/TLS (`turn:host:80`, `?transport=tcp`, `turn:host:443`,
> `turns:host:443?transport=tcp`).

---

## Scripts disponibles

| Comando           | Descripción                                                      |
| ----------------- | ---------------------------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo (Vite) con HMR en `http://localhost:5173` |
| `npm run build`   | Compila TypeScript y genera el build de producción (`dist/`)     |
| `npm run preview` | Sirve localmente el build de producción                          |
| `npm run lint`    | Ejecuta ESLint sobre el proyecto                                 |

---

## Cómo funciona (flujo resumido)

1. **Autenticación:** el usuario inicia sesión con Firebase Auth; el token se envía al backend en
   las peticiones REST y en el handshake de Socket.io.
2. **Salas:** crear/unirse a una sala usa la API REST; el estado en tiempo real (participantes,
   chat, estados de audio/video) se sincroniza por Socket.io.
3. **Videollamada:** al entrar a una sala, los pares intercambian señalización WebRTC
   (`offer`/`answer`/`ICE`) a través del servidor y luego transmiten audio/video **directamente**
   entre sí (malla P2P), usando STUN/TURN para atravesar NAT/firewalls.

---

## Solución de problemas

- **La primera petición tarda ~30–60 s:** el backend en el plan gratuito de Render entra en "cold
  start". La app muestra un aviso de "servidor despertando"; espera unos segundos y reintenta.
- **No hay video/audio entre dos redes distintas:** revisa que `VITE_TURN_HOST`,
  `VITE_TURN_USERNAME` y `VITE_TURN_CREDENTIAL` estén configurados; sin TURN, los pares detrás de
  NAT estricto no logran conectarse.
- **Errores de CORS o de conexión al backend:** confirma que `VITE_API_BASE_URL` apunta a un backend
  activo y que ese backend permite el origen del frontend (ver README del backend).
- **Cambios en `.env.local` no se reflejan:** reinicia `npm run dev` (Vite lee las variables de
  entorno al arrancar).
