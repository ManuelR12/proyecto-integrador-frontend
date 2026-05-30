import { useRef } from 'react'
import type { ReactNode, MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { auth as copy, product } from '../copy/es'
import GoogleButton from '../components/ui/GoogleButton'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import { useReveal } from '../hooks/useReveal'

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

// ─── Scroll reveal wrapper ────────────────────────────────────────────────────

function Reveal({
	children,
	delay = 0,
	className = '',
}: {
	children: ReactNode
	delay?: number
	className?: string
}) {
	const { ref, inView } = useReveal()
	return (
		<div
			ref={ref}
			className={[
				'transition-all duration-700',
				inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
				className,
			].join(' ')}
			style={{ transitionDelay: `${delay}ms` }}
		>
			{children}
		</div>
	)
}

// ─── Feature card with 3D tilt ────────────────────────────────────────────────

function FeatureCard({ iconPath, label, description }: FeatureItem) {
	const cardRef = useRef<HTMLDivElement>(null)

	const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
		const card = cardRef.current
		if (!card) return
		const rect = card.getBoundingClientRect()
		const x = (e.clientX - rect.left) / rect.width - 0.5
		const y = (e.clientY - rect.top) / rect.height - 0.5
		card.style.transform = `perspective(900px) rotateX(${(-y * 9).toFixed(1)}deg) rotateY(${(x * 9).toFixed(1)}deg) translateZ(10px)`
		card.style.boxShadow = `${x * 12}px ${y * 12}px 40px rgba(0,0,0,0.10), 0 4px 20px rgba(0,0,0,0.06)`
	}

	const handleMouseLeave = () => {
		const card = cardRef.current
		if (!card) return
		card.style.transform = ''
		card.style.boxShadow = ''
	}

	return (
		<div
			ref={cardRef}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			className='group cursor-default rounded-2xl border border-slate-200 bg-white p-7 shadow-sm'
			style={{ transition: 'transform 0.18s ease, box-shadow 0.18s ease', transformStyle: 'preserve-3d' }}
		>
			<div className='mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-100'>
				<svg
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth={1.5}
					className='h-6 w-6 text-blue-600'
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
		<div className='bg-white font-sans text-slate-900 antialiased'>

			{/* ── Nav ── */}
			<nav
				aria-label='Principal'
				className='sticky top-0 z-50 border-b border-slate-100/80 bg-white/80 backdrop-blur-xl'
			>
				<div className='mx-auto flex max-w-6xl items-center justify-between px-6 py-4'>
					<span className='text-lg font-bold tracking-tight text-blue-600'>{product.name}</span>
					<div className='flex items-center gap-1'>
						<Link
							to='/login'
							className='rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900'
						>
							{copy.login.title}
						</Link>
						<Link
							to='/registro'
							className='ml-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-500 hover:shadow-md hover:shadow-blue-500/25'
						>
							{copy.home.ctaRegister}
						</Link>
					</div>
				</div>
			</nav>

			{/* ── Hero ── */}
			<section className='relative overflow-hidden px-6 pb-28 pt-20 text-center sm:pb-36 sm:pt-28'>

				{/* Grid pattern */}
				<div
					aria-hidden='true'
					className='pointer-events-none absolute inset-0'
					style={{
						backgroundImage: [
							'linear-gradient(to right, rgb(148 163 184 / 0.09) 1px, transparent 1px)',
							'linear-gradient(to bottom, rgb(148 163 184 / 0.09) 1px, transparent 1px)',
						].join(', '),
						backgroundSize: '44px 44px',
						maskImage: 'radial-gradient(ellipse 80% 70% at 50% 0%, black 30%, transparent 100%)',
						WebkitMaskImage:
							'radial-gradient(ellipse 80% 70% at 50% 0%, black 30%, transparent 100%)',
					}}
				/>

				{/* Blue gradient wash */}
				<div
					aria-hidden='true'
					className='pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-50/80 to-transparent'
				/>

				{/* Floating orbs */}
				<div
					aria-hidden='true'
					className='animate-float absolute left-1/4 top-1/3 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-300 opacity-[0.11] blur-3xl'
				/>
				<div
					aria-hidden='true'
					className='animate-float-alt absolute right-1/4 top-2/3 h-64 w-64 rounded-full bg-violet-300 opacity-[0.09] blur-3xl'
				/>
				<div
					aria-hidden='true'
					className='animate-float-delay absolute left-2/3 top-1/4 h-48 w-48 rounded-full bg-sky-300 opacity-[0.10] blur-2xl'
				/>
				<div
					aria-hidden='true'
					className='animate-float-delay-alt absolute right-1/3 top-1/2 h-36 w-36 rounded-full bg-indigo-300 opacity-[0.08] blur-2xl'
				/>

				{/* Badge */}
				<div className='relative mb-8 inline-flex animate-fade-up items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5'>
					<span className='relative flex h-2 w-2'>
						<span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75' />
						<span className='relative inline-flex h-2 w-2 rounded-full bg-blue-500' />
					</span>
					<span className='text-xs font-semibold tracking-wide text-blue-700'>
						Plataforma de estudio colaborativo
					</span>
				</div>

				{/* Heading */}
				<h1
					className='relative mx-auto max-w-3xl animate-fade-up text-5xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl'
					style={{ animationDelay: '80ms' }}
				>
					{copy.landing.heroTitle}
				</h1>

				{/* Description */}
				<p
					className='relative mx-auto mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-slate-600'
					style={{ animationDelay: '160ms' }}
				>
					{product.description}
				</p>

				{/* CTAs */}
				<div
					className='relative mt-10 flex animate-fade-up flex-wrap items-center justify-center gap-3'
					style={{ animationDelay: '240ms' }}
				>
					<GoogleButton
						id='btn-google-home'
						onClick={signIn}
						loading={googleLoading}
						className='!w-auto shadow-sm'
					/>
					<Link
						to='/login'
						className='rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-500 hover:shadow-md hover:shadow-blue-500/25'
					>
						{copy.home.ctaLogin}
					</Link>
					<Link
						to='/registro'
						className='rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'
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
			<section className='bg-gradient-to-b from-slate-50 to-white py-28'>
				<div className='mx-auto max-w-6xl px-6'>
					<Reveal className='mb-14 text-center'>
						<p className='mb-3 text-xs font-bold uppercase tracking-[0.15em] text-blue-600'>
							Funcionalidades
						</p>
						<h2 className='text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl'>
							Todo lo que necesitas para estudiar en equipo
						</h2>
					</Reveal>

					<div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
						{FEATURES.map((feature, i) => (
							<Reveal key={feature.label} delay={i * 110}>
								<FeatureCard {...feature} />
							</Reveal>
						))}
					</div>
				</div>
			</section>

			{/* ── CTA ── */}
			<section
				className='relative overflow-hidden py-28'
				style={{
					background: 'linear-gradient(135deg, #020617 0%, #0c1e45 40%, #0f2d6e 60%, #020617 100%)',
				}}
			>
				{/* Top edge glow */}
				<div
					aria-hidden='true'
					className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent'
				/>

				{/* Animated center glow */}
				<div
					aria-hidden='true'
					className='animate-pulse-glow absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 opacity-20 blur-3xl'
				/>
				<div
					aria-hidden='true'
					className='animate-pulse-glow-delay absolute left-1/3 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-violet-600 opacity-10 blur-2xl'
				/>

				<Reveal>
					<div className='relative mx-auto max-w-2xl px-6 text-center'>
						<h2 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
							Empieza a estudiar en equipo hoy
						</h2>
						<p className='mt-4 text-slate-400'>
							Crea tu cuenta gratis y únete a salas de estudio en segundos.
						</p>
						<div className='mt-8 flex flex-wrap items-center justify-center gap-4'>
							<Link
								to='/registro'
								className='rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 hover:shadow-xl'
							>
								{copy.home.ctaRegister} — es gratis
							</Link>
							<Link
								to='/login'
								className='text-sm font-medium text-slate-400 transition-colors hover:text-white'
							>
								Ya tengo cuenta →
							</Link>
						</div>
					</div>
				</Reveal>

				{/* Bottom edge glow */}
				<div
					aria-hidden='true'
					className='absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent'
				/>
			</section>

			{/* ── Footer ── */}
			<footer className='border-t border-slate-100 bg-white py-8'>
				<div className='mx-auto max-w-6xl px-6'>
					<div className='flex flex-col items-center gap-4 sm:flex-row sm:justify-between'>
						<span className='text-sm font-bold text-blue-600'>{product.name}</span>
						<div className='flex items-center gap-6'>
							<Link
								to='/'
								className='text-xs text-slate-500 transition-colors hover:text-blue-600'
							>
								Inicio
							</Link>
							<Link
								to='/login'
								className='text-xs text-slate-500 transition-colors hover:text-blue-600'
							>
								Iniciar sesión
							</Link>
							<Link
								to='/registro'
								className='text-xs text-slate-500 transition-colors hover:text-blue-600'
							>
								Crear cuenta
							</Link>
						</div>
						<p className='text-xs text-slate-400'>© 2026 {product.name}</p>
					</div>
				</div>
			</footer>
		</div>
	)
}

export default Home
