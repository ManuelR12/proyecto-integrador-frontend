import { Link } from 'react-router-dom'
import { auth as copy, product } from '../copy/es'
import GoogleButton from '../components/ui/GoogleButton'
import { useGoogleAuth } from '../hooks/useGoogleAuth'

const Home = () => {
	const { signIn, loading: googleLoading, error: googleError } = useGoogleAuth()

	return (
		<div className='flex min-h-screen flex-col items-center justify-center bg-[#f6f7f8] px-6'>
			<div className='w-full max-w-md text-center'>
				<h1 className='text-4xl font-bold tracking-tight text-blue-600'>
					{product.name.toUpperCase()}
				</h1>
				<p className='mt-3 text-xl font-semibold text-slate-900'>{product.tagline}</p>
				<p className='mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-500'>
					{product.description}
				</p>

				<div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
					<GoogleButton onClick={signIn} loading={googleLoading} />
					<Link
						to='/login'
						className={[
							'flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5',
							'text-sm font-medium text-white transition-colors hover:bg-blue-500',
							'whitespace-nowrap',
						].join(' ')}
					>
						{copy.home.ctaLogin}
					</Link>
					<Link
						to='/registro'
						className={[
							'flex items-center justify-center rounded-lg border border-slate-300',
							'bg-white px-5 py-2.5 text-sm font-medium text-slate-700',
							'transition-colors hover:bg-slate-50 whitespace-nowrap',
						].join(' ')}
					>
						{copy.home.ctaRegister}
					</Link>
				</div>

				{googleError && (
					<p role='alert' className='mt-3 text-sm text-red-600'>
						{googleError}
					</p>
				)}

				<div className='mt-8 flex flex-wrap justify-center gap-2'>
					{copy.home.features.map((feature) => (
						<span
							key={feature}
							className='rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 shadow-sm'
						>
							{feature}
						</span>
					))}
				</div>
			</div>
		</div>
	)
}

export default Home
