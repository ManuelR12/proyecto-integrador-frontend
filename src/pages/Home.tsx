import { useRef } from 'react'
import type { ReactNode, MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { auth as copy, product } from '../copy/es'
import GoogleButton from '../components/ui/GoogleButton'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import { useReveal } from '../hooks/useReveal'

// ─── SVG paths ────────────────────────────────────────────────────────────────

const ICON_CHAT =
	'M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z'
const ICON_VIDEO =
	'M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z'
const ICON_SCREEN =
	'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25'
const ICON_MIC =
	'M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z'
const ICON_LOCK =
	'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z'
const ICON_CLOSE = 'M6 18L18 6M6 6l12 12'

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
		description: 'Los mensajes quedan en la sala. Retoma notas y acuerdos sin perder el hilo.',
	},
	{
		iconPath: ICON_VIDEO,
		label: copy.home.features[1],
		description: 'Videollamadas de baja latencia con controles individuales de micrófono y cámara.',
	},
	{
		iconPath: ICON_SCREEN,
		label: copy.home.features[2],
		description: 'Muestra tu código, diapositivas o ejercicios directamente desde el navegador.',
	},
]

// ─── Mockup data ──────────────────────────────────────────────────────────────

const MOCK_USERS = [
	{ letter: 'A', name: 'Ana G.', color: 'bg-blue-500', active: true },
	{ letter: 'L', name: 'Luis M.', color: 'bg-violet-500', active: false },
	{ letter: 'M', name: 'María P.', color: 'bg-emerald-500', active: false },
	{ letter: 'C', name: 'Carlos R.', color: 'bg-amber-500', active: false },
]

const MOCK_CHAT = [
	{ user: 'Ana', color: 'text-blue-500', text: 'Hola a todos 👋' },
	{ user: 'Luis', color: 'text-violet-500', text: '¿Empezamos con parcial?' },
	{ user: 'Ana', color: 'text-blue-500', text: 'Sí, comparto pantalla' },
	{ user: 'María', color: 'text-emerald-500', text: 'Listo! 📚' },
]

// ─── Scroll reveal ────────────────────────────────────────────────────────────

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
		card.style.boxShadow = `${x * 12}px ${y * 12}px 40px rgba(0,0,0,0.09), 0 4px 20px rgba(0,0,0,0.05)`
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

// ─── Mockup control button ────────────────────────────────────────────────────

function CtrlBtn({ icon, danger = false }: { icon: string; danger?: boolean }) {
	return (
		<div
			className={`flex h-8 w-8 items-center justify-center rounded-full ${danger ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-slate-300'}`}
		>
			<svg
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth={1.5}
				className='h-3.5 w-3.5'
				aria-hidden='true'
			>
				<path strokeLinecap='round' strokeLinejoin='round' d={icon} />
			</svg>
		</div>
	)
}

// ─── Product mockup ───────────────────────────────────────────────────────────

function ProductMockup() {
	return (
		<div
			className='relative mx-auto mt-14 w-full max-w-4xl animate-fade-up px-4 sm:px-6'
			style={{ animationDelay: '300ms' }}
		>
			<div className='overflow-hidden rounded-2xl border border-slate-200 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.14)] ring-1 ring-slate-900/5'>

				{/* Browser chrome */}
				<div className='flex items-center gap-1.5 border-b border-slate-200 bg-slate-100 px-4 py-2.5'>
					<span className='h-2.5 w-2.5 rounded-full bg-rose-400' />
					<span className='h-2.5 w-2.5 rounded-full bg-amber-400' />
					<span className='h-2.5 w-2.5 rounded-full bg-emerald-400' />
					<div className='mx-auto flex w-56 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-0.5'>
						<svg
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth={2}
							className='h-3 w-3 flex-shrink-0 text-slate-400'
							aria-hidden='true'
						>
							<path strokeLinecap='round' strokeLinejoin='round' d={ICON_LOCK} />
						</svg>
						<span className='truncate text-[11px] text-slate-400'>agora.app/sala/calculo-iii</span>
					</div>
				</div>

				{/* App content */}
				<div className='grid min-h-[320px] grid-cols-[1fr_180px]'>

					{/* Video area */}
					<div className='bg-slate-950 p-4'>
						{/* Room header */}
						<div className='mb-3 flex items-center justify-between'>
							<span className='text-sm font-semibold text-white'>Cálculo III · Parcial 2</span>
							<div className='flex items-center gap-1.5 rounded-full bg-green-500/15 px-2.5 py-0.5'>
								<span className='h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse' />
								<span className='text-xs font-semibold text-green-400'>En vivo</span>
							</div>
						</div>

						{/* Video tiles */}
						<div className='grid grid-cols-2 gap-2' style={{ height: '216px' }}>
							{MOCK_USERS.map((u) => (
								<div
									key={u.letter}
									className={[
										'flex flex-col items-center justify-center gap-1.5 rounded-xl',
										u.active ? 'bg-slate-700/70 ring-2 ring-blue-500' : 'bg-slate-800/60',
									].join(' ')}
								>
									<div
										className={`flex h-10 w-10 items-center justify-center rounded-full ${u.color} text-sm font-bold text-white`}
									>
										{u.letter}
									</div>
									<span className='text-xs text-slate-300'>{u.name}</span>
									{u.active && (
										<div className='flex gap-0.5'>
											{[0, 1, 2].map((j) => (
												<div
													key={j}
													className='h-1 w-1 rounded-full bg-blue-400 animate-bounce'
													style={{ animationDelay: `${j * 80}ms` }}
												/>
											))}
										</div>
									)}
								</div>
							))}
						</div>

						{/* Controls */}
						<div className='mt-3 flex items-center justify-center gap-2'>
							<CtrlBtn icon={ICON_MIC} />
							<CtrlBtn icon={ICON_VIDEO} />
							<CtrlBtn icon={ICON_SCREEN} />
							<div className='ml-1'>
								<CtrlBtn icon={ICON_CLOSE} danger />
							</div>
						</div>
					</div>

					{/* Chat */}
					<div className='flex flex-col border-l border-slate-200 bg-white'>
						<div className='border-b border-slate-100 px-3 py-2'>
							<p className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>Chat</p>
						</div>
						<div className='flex-1 space-y-3 overflow-hidden p-3'>
							{MOCK_CHAT.map((msg, i) => (
								<div key={i}>
									<p className={`text-[11px] font-semibold ${msg.color}`}>{msg.user}</p>
									<p className='text-[11px] leading-snug text-slate-600'>{msg.text}</p>
								</div>
							))}
						</div>
						<div className='border-t border-slate-100 p-2'>
							<div className='flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5'>
								<span className='flex-1 text-[10px] text-slate-300'>Escribe...</span>
								<div className='rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white'>
									↵
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Fade-out gradient */}
			<div
				aria-hidden='true'
				className='pointer-events-none absolute inset-x-4 bottom-0 h-20 rounded-b-2xl bg-gradient-to-t from-white to-transparent sm:inset-x-6'
			/>
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
			<section className='relative overflow-hidden px-6 pb-0 pt-20 text-center sm:pt-28'>

				{/* Grid pattern */}
				<div
					aria-hidden='true'
					className='pointer-events-none absolute inset-0'
					style={{
						backgroundImage: [
							'linear-gradient(to right, rgb(148 163 184 / 0.08) 1px, transparent 1px)',
							'linear-gradient(to bottom, rgb(148 163 184 / 0.08) 1px, transparent 1px)',
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
					className='pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-blue-50/80 to-transparent'
				/>

				{/* Floating orbs */}
				<div aria-hidden='true' className='animate-float absolute left-1/4 top-1/3 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-300 opacity-[0.10] blur-3xl' />
				<div aria-hidden='true' className='animate-float-alt absolute right-1/4 top-2/3 h-56 w-56 rounded-full bg-violet-300 opacity-[0.08] blur-3xl' />
				<div aria-hidden='true' className='animate-float-delay absolute left-2/3 top-1/4 h-40 w-40 rounded-full bg-sky-300 opacity-[0.09] blur-2xl' />

				{/* Badge */}
				<div className='relative mb-7 inline-flex animate-fade-up items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5'>
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

				{/* Subtitle */}
				<p
					className='relative mx-auto mt-5 max-w-xl animate-fade-up text-lg leading-relaxed text-slate-600'
					style={{ animationDelay: '160ms' }}
				>
					{product.description}
				</p>

				{/* CTAs */}
				<div
					className='relative mt-8 flex animate-fade-up flex-wrap items-center justify-center gap-3'
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
						className='rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50'
					>
						{copy.home.ctaRegister}
					</Link>
				</div>

				{googleError && (
					<p role='alert' className='relative mt-4 text-sm text-red-600'>
						{googleError}
					</p>
				)}

				{/* Product mockup */}
				<ProductMockup />
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
			<section className='border-t border-slate-100 bg-white py-24'>
				<Reveal>
					<div className='mx-auto max-w-xl px-6 text-center'>
						<h2 className='text-4xl font-extrabold tracking-tight text-slate-900'>
							Empieza gratis.
							<br />
							<span className='text-blue-600'>Sin tarjeta.</span>
						</h2>
						<p className='mt-4 text-lg leading-relaxed text-slate-600'>
							Únete a tu primera sala de estudio en menos de un minuto.
						</p>
						<div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
							<Link
								to='/registro'
								className='rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-500 hover:shadow-md hover:shadow-blue-500/25'
							>
								{copy.home.ctaRegister} — es gratis
							</Link>
							<Link
								to='/login'
								className='text-sm font-medium text-slate-500 transition-colors hover:text-slate-900'
							>
								Ya tengo cuenta →
							</Link>
						</div>
					</div>
				</Reveal>
			</section>

			{/* ── Footer ── */}
			<footer className='border-t border-slate-100 bg-white py-8'>
				<div className='mx-auto max-w-6xl px-6'>
					<div className='flex flex-col items-center gap-4 sm:flex-row sm:justify-between'>
						<span className='text-sm font-bold text-blue-600'>{product.name}</span>
						<div className='flex items-center gap-6'>
							<Link to='/' className='text-xs text-slate-500 transition-colors hover:text-blue-600'>
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
