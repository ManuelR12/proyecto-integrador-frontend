/**
 * Copy canónico de Agora — fuente única para Figma, código y documentación.
 * Importar desde aquí cuando se implementen pantallas; no duplicar strings en componentes.
 *
 * @see docs/COPY.md — guía legible con reglas de tono y glosario
 */

export const product = {
	name: "Agora",
	tagline: "Salas de estudio virtuales en tiempo real",
	description:
		"Conecta con tu equipo mediante chat, videollamadas y compartición de pantalla. Diseñado para el estudio síncrono universitario.",
} as const;

export const nav = {
	sidebarTitleLine1: "Dashboard",
	sidebarTitleLine2: "Principal",
	sidebarBrand: "Agora",
	dashboard: "Dashboard",
	asignaturas: "Asignaturas",
	calendario: "Calendario",
	sesionActual: "Sesión Actual",
} as const;

export const search = {
	placeholder: "Buscar reuniones, clases, fechas...",
} as const;

export const auth = {
	back: "← Volver",
	google: {
		continue: "Continuar con Google",
		divider: "o continúa con correo",
		loading: "Conectando con Google...",
		error: "No pudimos iniciar sesión con Google. Inténtalo de nuevo.",
		trustNote: "Usamos Google solo para verificar tu identidad. No publicamos nada en tu nombre.",
		verifiedBadge: "Cuenta verificada con Google",
		usernameSetup: {
			title: "Elige tu nombre de usuario",
			subtitle: "Es cómo te verán en las salas de estudio. Debe ser único en Agora.",
			subtitleLoading: "Comprobando si tu nombre de usuario está disponible...",
			subtitleError: "Revisa tu nombre de usuario antes de continuar.",
			statusLoading: "Verificando en la base de datos...",
			usernameLabel: "Nombre de usuario",
			usernamePlaceholder: "ej. ana_garcia",
			usernameHelper: "Entre 3 y 20 caracteres: letras, números o guión bajo.",
			submit: "Continuar al dashboard",
			submitLoading: "Verificando...",
			footnote: "No podrás cambiar tu nombre de usuario más adelante.",
			errors: {
				usernameTaken: "Este nombre de usuario ya está en uso. Prueba con otro.",
				usernameInvalid: "Usa entre 3 y 20 caracteres: letras, números o guión bajo.",
			},
		},
	},
	landing: {
		heroTitle: "Tu salón de estudio, en cualquier lugar",
		heroSubtitle:
			"Únete a salas privadas con tu cuenta de Google y colabora en tiempo real con chat, video y pantalla compartida.",
		googleCta: "Continuar con Google",
		emailCta: "Usar correo y contraseña",
		secondaryCta: "Crear cuenta con correo",
	},
	login: {
		title: "Iniciar sesión",
		subtitle: "Accede a tus salas y reuniones.",
		emailLabel: "Correo",
		emailPlaceholder: "tu@correo.edu",
		passwordLabel: "Contraseña",
		passwordPlaceholder: "••••••••",
		submit: "Iniciar sesión",
		submitLoading: "Iniciando sesión...",
		footerPrompt: "¿No tienes cuenta?",
		footerLink: "Regístrate",
		errors: {
			invalidCredentials: "Correo o contraseña incorrectos.",
			tooManyRequests: "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
			networkError: "Sin conexión. Verifica tu red e intenta de nuevo.",
		},
	},
	register: {
		title: "Crear cuenta",
		subtitle: "Completa tus datos para crear tu cuenta con correo.",
		subtitleError: "Revisa los campos marcados antes de continuar.",
		subtitleLoading: "Estamos creando tu cuenta. No cierres esta ventana.",
		nombresLabel: "Nombres",
		nombresPlaceholder: "Ej. Ana María",
		apellidosLabel: "Apellidos",
		apellidosPlaceholder: "Ej. García López",
		usernameLabel: "Nombre de usuario",
		usernamePlaceholder: "ej. ana_garcia",
		usernameHelper: "Entre 3 y 20 caracteres: letras, números o guión bajo.",
		avatarLabel: "Avatar",
		avatarUpload: "Subir foto",
		avatarChange: "Cambiar foto",
		avatarHelper: "JPG o PNG, máximo 2 MB",
		emailLabel: "Correo",
		emailPlaceholder: "tu@correo.edu",
		passwordLabel: "Contraseña",
		passwordPlaceholder: "Mínimo 8 caracteres",
		passwordHelper: "Usa al menos 8 caracteres con letras y números.",
		submit: "Crear cuenta",
		submitLoading: "Creando cuenta...",
		footerPrompt: "¿Ya tienes cuenta?",
		footerLink: "Iniciar sesión",
		errors: {
			nombresRequired: "Escribe tu nombre.",
			apellidosRequired: "Escribe tu apellido.",
			usernameTaken: "Este nombre de usuario ya está en uso. Prueba con otro.",
			usernameInvalid: "Usa entre 3 y 20 caracteres: letras, números o guión bajo.",
			emailInvalid: "Introduce un correo válido, por ejemplo tu@correo.edu.",
			passwordWeak: "La contraseña debe tener al menos 8 caracteres.",
			avatarRequired: "Selecciona una imagen para tu avatar.",
		},
	},
	home: {
		ctaGoogle: "Continuar con Google",
		ctaLogin: "Iniciar sesión con correo",
		ctaRegister: "Crear cuenta",
		features: ["Chat persistente", "Video y audio", "Compartir pantalla"] as const,
	},
} as const;

export const dashboard = {
	proximasSesiones: "Próximas sesiones",
	verCalendario: "Ver calendario",
	crearReunion: {
		title: "Crear reunión",
		asuntoLabel: "Asunto",
		asuntoPlaceholder: "Ej. Clase de repaso — parcial 2",
		asignaturaLabel: "Asignatura",
		asignaturaPlaceholder: "Seleccionar asignatura",
		asignaturaOptions: [
			"Desarrollo de Software II",
			"Inteligencia Artificial",
			"Proyecto Integrador",
		] as const,
		fechaLabel: "Fecha",
		fechaPlaceholder: "Seleccionar fecha",
		horaLabel: "Hora",
		horaPlaceholder: "13:00 – 14:30",
		invitarLabel: "Invitar",
		invitarPlaceholder: "Correos separados por coma (ej. ana@uni.edu, luis@uni.edu)",
		invitarHelper: "Opcional. Los invitados recibirán el código de la sala.",
		submit: "Crear reunión",
	},
	unirseReunion: {
		title: "Unirse a reunión",
		description: "Ingresa el código de la reunión para entrar directamente.",
		codigoLabel: "Código",
		codigoPlaceholder: "ABC-1234",
		submit: "Unirse",
	},
	sessionCta: "Ir a reunión",
} as const;

export const sessions = {
	softwareII: {
		title: "Desarrollo de Software II",
		dateLabel: "Fecha: Mar, 26 de Mayo, 13:00 – 14:30",
	},
	ia: {
		title: "Inteligencia Artificial",
		dateLabel: "Fecha: Vie, 29 de Mayo, 10:00 – 12:00",
	},
	proyectoIntegrador: {
		title: "Proyecto Integrador",
		dateLabel: "Fecha: Sáb, 23 de Mayo, 8:00 – 10:30",
	},
} as const;

export const asignaturas = {
	title: "Asignaturas",
	sessionsCount: (n: number) => `${n} sesiones programadas`,
} as const;

export const calendario = {
	title: "Calendario — Mayo 2026",
	weekdays: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const,
} as const;

export const sala = {
	enVivo: "En vivo",
	stagePlaceholder: "Pantalla compartida / video principal",
	chatTitle: "Chat de la sala",
	chatPlaceholder: "Escribe un mensaje...",
	chatSend: "Enviar",
	controls: {
		microfono: "Micrófono",
		camara: "Cámara",
		compartirPantalla: "Compartir pantalla",
		salir: "Salir",
	},
	participantes: (n: number) => `${n} participantes`,
} as const;

export const perfil = {
	title: "Mi perfil",
	subtitle: "Gestiona tu información personal y la configuración de tu cuenta.",
	save: "Guardar cambios",
	deleteAccount: "Eliminar cuenta",
	fields: {
		nombre: "Nombre completo",
		correo: "Correo institucional",
		programa: "Programa",
	},
} as const;

export const modals = {
	editarSala: {
		title: "Editar reunión",
		body: "Actualiza asunto, fecha u hora de la sala de estudio.",
		confirm: "Guardar",
		cancel: "Cancelar",
	},
	eliminarSala: {
		title: "¿Eliminar reunión?",
		body: "Esta acción no se puede deshacer. Los participantes perderán el acceso.",
		confirm: "Eliminar",
		cancel: "Cancelar",
	},
} as const;

export const states = {
	loading: {
		title: "Cargando sesiones...",
		body: "Espera mientras cargamos tus próximas sesiones.",
	},
	empty: {
		title: "Sin sesiones programadas",
		body: "Crea una reunión o únete con un código para empezar.",
	},
	errorAuth: {
		title: "No pudimos iniciar sesión",
		body: "Verifica tus credenciales o tu conexión e inténtalo de nuevo.",
	},
	errorGoogleAuth: {
		title: "Error con Google",
		body: "No pudimos completar el inicio de sesión. Cierra el popup e inténtalo de nuevo.",
	},
	errorWebRtc: {
		title: "Conexión de video interrumpida",
		body: "Revisa tu red o permisos de cámara y micrófono.",
		retry: "Reintentar",
	},
} as const;

export const common = {
	cerrarSesion: "Cerrar sesión",
	continuarPanel: "Continuar al panel",
	enConstruccion: "Vista en construcción",
} as const;

/** Mapa de reemplazos para sincronizar textos legacy en Figma o código */
export const legacyReplacements: Record<string, string> = {
	"Proyecto Integrador": product.name,
	"Inicia sesión": auth.login.title,
	"Inicia sesion": auth.login.title,
	"Iniciar sesion": auth.login.submit,
	Registrate: auth.login.footerLink,
	"Proximas Sesiones": dashboard.proximasSesiones,
	"Proximas sesiones": dashboard.proximasSesiones,
	"Crear Reunion": dashboard.crearReunion.title,
	"Crear reunion": dashboard.crearReunion.submit,
	"Unirse a reunion": dashboard.unirseReunion.title,
	"Ir a Reunion": dashboard.sessionCta,
	"Ir a Reunion ": dashboard.sessionCta,
	Microfono: sala.controls.microfono,
	Camara: sala.controls.camara,
	Contrasena: auth.login.passwordLabel,
	"Compartir pantalla": sala.controls.compartirPantalla,
	Mie: "Mié",
	Sab: "Sáb",
};
