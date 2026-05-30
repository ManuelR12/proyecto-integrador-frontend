import { Link } from 'react-router-dom'
import { auth as copy, product } from '../copy/es'
import GoogleButton from '../components/ui/GoogleButton'
import { useGoogleAuth } from '../hooks/useGoogleAuth'

// ─── Feature icons ────────────────────────────────────────────────────────────

const ICON_CHAT =
	'M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z'
const ICON_VIDEO =
	'M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z'
const ICON_SCREEN =
	'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25'

// ─── Feature data ─────────────────────────────────────────────────────────────

interface FeatureItem {
	iconPath: string
	label: string
	description: string
}

const FEATURES: FeatureItem[] = [
	{
		iconPath: ICON_CHAT,
		label: copy.home.features[0],
		description:
			'Los mensajes quedan en la sala. Retoma notas y acuerdos cuando vuelvas sin perder el hilo.',
	},
	{
		iconPath: ICON_VIDEO,
		label: copy.home.features[1],
		description:
			'Videollamadas de baja latencia con controles individuales de micrófono y cámara.',
	},
	{
		iconPath: ICON_SCREEN,
		label: copy.home.features[2],
		description:
			'Muestra tu código, diapositivas o ejercicios directamente desde el navegador.',
	},
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeatureCard({ iconPath, label, description }: FeatureItem) {
	return (
		<div className='group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md'>
			<div className='mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 transition group-hover:bg-blue-100'>
				<svg
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth={1.5}
					className='h-5 w-5 text-blue-600'
					aria-hidden='true'
				>
					<path strokeLinecap='round' strokeLinejoin='round' d={iconPath} />
				</svg>
			</div>
			<h3 className='mb-2 text-base font-semibold text-slate-900'>{label}</h3>
			<p className='text-sm leading-relaxed text-slate-500'>{description}</p>
		</div>
	)
}

// ─── Page ────────────────────────────────────────────────────────────────────

const Home = () => {
	const { signIn, loading: googleLoading, error: googleError } = useGoogleAuth()

	return (
		<div className='bg-white text-slate-900'>
			{/* ── Nav ── */}
			<nav
				aria-label='Principal'
				className='sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-sm'
			>
				<div className='mx-auto flex max-w-6xl items-center justify-between px-6 py-4'>
					<span className='text-lg font-bold tracking-tight text-blue-600'>{product.name}</span>
					<div className='flex items-center gap-3'>
						<Link
							to='/login'
							className='text-sm text-slate-600 transition hover:text-slate-900'
						>
							{copy.login.title}
						</Link>
						<Link
							to='/registro'
							className='rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-blue-500'
						>
							{copy.home.ctaRegister}
						</Link>
					</div>
				</div>
			</nav>

			{/* ── Hero ── */}
			<section className='relative overflow-hidden px-6 pb-24 pt-20 text-center sm:pb-32 sm:pt-28'>
				{/* Subtle gradient wash */}
				<div
					aria-hidden='true'
					className='pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-blue-50 to-transparent'
				/>

				{/* Live badge */}
				<div className='relative mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5'>
					<span className='relative flex h-2 w-2'>
						<span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75' />
						<span className='relative inline-flex h-2 w-2 rounded-full bg-blue-500' />
					</span>
					<span className='text-xs font-medium tracking-wide text-blue-700'>
						Plataforma de estudio colaborativo
					</span>
				</div>

				{/* Heading */}
				<h1 className='relative mx-auto max-w-3xl text-5xl font-bold leading-tight tracking-tight text-slate-900 sm:text-6xl lg:text-7xl'>
					{copy.landing.heroTitle}
				</h1>

				{/* Description */}
				<p className='relative mx-auto mt-6 max-w-lg text-lg leading-relaxed text-slate-600'>
					{product.description}
				</p>

				{/* CTAs */}
				<div className='relative mt-10 flex flex-wrap items-center justify-center gap-3'>
					<GoogleButton
						id='btn-google-home'
						onClick={signIn}
						loading={googleLoading}
						className='!w-auto'
					/>
					<Link
						to='/login'
						className='rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500'
					>
						{copy.home.ctaLogin}
					</Link>
					<Link
						to='/registro'
						className='rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50'
					>
						{copy.home.ctaRegister}
					</Link>
				</div>

				{googleError && (
					<p role='alert' className='relative mt-4 text-sm text-red-600'>
						{googleError}
					</p>
				)}
			</section>

			{/* ── Features ── */}
			<section className='bg-slate-50 py-24'>
				<div className='mx-auto max-w-6xl px-6'>
					<div className='mb-14 text-center'>
						<p className='mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600'>
							Funcionalidades
						</p>
						<h2 className='text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl'>
							Todo lo que necesitas para estudiar en equipo
						</h2>
					</div>

					<div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
						{FEATURES.map((feature) => (
							<FeatureCard key={feature.label} {...feature} />
						))}
					</div>
				</div>
			</section>

			{/* ── Bottom CTA ── */}
			<section className='bg-slate-900 py-24'>
				<div className='mx-auto max-w-2xl px-6 text-center'>
					<h2 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
						Empieza a estudiar en equipo hoy
					</h2>
					<p className='mt-4 text-slate-400'>
						Crea tu cuenta gratis y únete a salas de estudio en segundos.
					</p>
					<div className='mt-8 flex flex-wrap items-center justify-center gap-4'>
						<Link
							to='/registro'
							className='rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium text-white transition hover:bg-blue-500'
						>
							{copy.home.ctaRegister} — es gratis
						</Link>
						<Link
							to='/login'
							className='text-sm text-slate-400 transition hover:text-white'
						>
							Ya tengo cuenta →
						</Link>
					</div>
				</div>
			</section>

			{/* ── Footer ── */}
			<footer className='border-t border-slate-100 bg-white py-12'>
				<div className='mx-auto max-w-6xl px-6'>
					<div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
						{/* Brand */}
						<div className='lg:col-span-2'>
							<span className='text-lg font-bold text-blue-600'>{product.name}</span>
							<p className='mt-2 max-w-xs text-sm leading-relaxed text-slate-500'>
								{product.tagline}
							</p>
							<p className='mt-1 max-w-xs text-xs leading-relaxed text-slate-400'>
								{product.description}
							</p>
						</div>

						{/* Product links */}
						<div>
							<h4 className='mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400'>
								Producto
							</h4>
							<ul className='space-y-2 text-sm text-slate-600'>
								<li>
									<Link to='/' className='transition hover:text-blue-600'>
										Inicio
									</Link>
								</li>
								<li>
									<Link to='/login' className='transition hover:text-blue-600'>
										Iniciar sesión
									</Link>
								</li>
								<li>
									<Link to='/registro' className='transition hover:text-blue-600'>
										Crear cuenta
									</Link>
								</li>
							</ul>
						</div>

						{/* Project info */}
						<div>
							<h4 className='mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400'>
								Proyecto
							</h4>
							<ul className='space-y-2 text-xs text-slate-500'>
								<li>Proyecto Integrador</li>
								<li>Sprint 1 · 2025-1</li>
								<li>Ingeniería de Software</li>
							</ul>
						</div>
					</div>

					<div className='mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6'>
						<p className='text-xs text-slate-400'>© 2025 {product.name}. Proyecto académico.</p>
						<p className='text-xs text-slate-400'>{product.tagline}</p>
					</div>
				</div>
			</footer>
		</div>
	)
}

export default Home
