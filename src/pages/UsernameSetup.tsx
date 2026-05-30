import { auth as copy } from '../copy/es'
import FormField from '../components/ui/FormField'
import SubmitButton from '../components/ui/SubmitButton'
import { useUsernameSetup } from '../hooks/useUsernameSetup'

const UsernameSetup = () => {
	const {
		user,
		username,
		fieldError,
		serverStatus,
		loading,
		checking,
		handleUsernameChange,
		handleSubmit,
	} = useUsernameSetup()

	const setup = copy.google.usernameSetup
	const hasError = Boolean(fieldError)
	const isBusy = loading || checking
	const subtitle = loading
		? setup.subtitleLoading
		: hasError
			? setup.subtitleError
			: setup.subtitle

	if (!user) return null

	return (
		<div className='flex min-h-screen items-center justify-center bg-slate-500 px-4 py-10'>
			<div className='w-full max-w-lg rounded-2xl bg-white px-8 py-8 shadow-xl'>
				<div className='mb-6 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2.5'>
					{loading ? (
						<svg
							className='h-4 w-4 animate-spin text-green-500'
							viewBox='0 0 24 24'
							fill='none'
							aria-hidden='true'
						>
							<circle
								className='opacity-25'
								cx='12'
								cy='12'
								r='10'
								stroke='currentColor'
								strokeWidth='4'
							/>
							<path
								className='opacity-75'
								fill='currentColor'
								d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
							/>
						</svg>
					) : (
						<svg
							viewBox='0 0 20 20'
							fill='currentColor'
							className='h-4 w-4 text-green-500'
							aria-hidden='true'
						>
							<path
								fillRule='evenodd'
								clipRule='evenodd'
								d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z'
							/>
						</svg>
					)}
					<span className='text-sm font-medium text-green-700'>{copy.google.verifiedBadge}</span>
				</div>

				<div className='mb-6 flex items-center gap-3 border-b border-slate-100 pb-6'>
					{user.photoURL ? (
						<img
							src={user.photoURL}
							alt={user.displayName ?? 'Avatar'}
							referrerPolicy='no-referrer'
							className='h-12 w-12 rounded-full object-cover'
						/>
					) : (
						<div className='flex h-12 w-12 items-center justify-center rounded-full bg-slate-200'>
							<svg
								viewBox='0 0 24 24'
								fill='currentColor'
								className='h-6 w-6 text-slate-400'
								aria-hidden='true'
							>
								<path d='M12 12a5 5 0 110-10 5 5 0 010 10zm0 2c5.523 0 10 2.686 10 6v1H2v-1c0-3.314 4.477-6 10-6z' />
							</svg>
						</div>
					)}
					<div>
						<p className='font-semibold text-slate-900'>{user.displayName}</p>
						<p className='text-sm text-slate-500'>{user.email}</p>
					</div>
				</div>

				<h1 className='text-2xl font-semibold text-slate-900'>{setup.title}</h1>
				<p className='mt-1 text-sm text-slate-500'>{subtitle}</p>
				{loading && serverStatus && (
					<p className='mt-1 text-xs text-blue-600'>{serverStatus}</p>
				)}

				<form onSubmit={handleSubmit} noValidate className='mt-5'>
					<FormField
						id='username'
						label={setup.usernameLabel}
						type='text'
						autoComplete='username'
						placeholder={setup.usernamePlaceholder}
						value={username}
						error={fieldError}
						helper={!fieldError && !checking ? setup.usernameHelper : undefined}
						checking={checking}
						required
						disabled={loading}
						onChange={(e) => handleUsernameChange(e.target.value)}
					/>

					<SubmitButton
						loading={loading}
						loadingLabel={setup.submitLoading}
						disabled={isBusy || hasError}
						className='mt-4'
					>
						{setup.submit}
					</SubmitButton>
				</form>

				<p className='mt-4 text-center text-xs text-slate-500'>{setup.footnote}</p>
			</div>
		</div>
	)
}

export default UsernameSetup
