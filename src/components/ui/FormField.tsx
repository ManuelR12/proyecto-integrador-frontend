import type { InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
	id: string
	label: string
	error?: string
	helper?: string
	checking?: boolean
}

const FormField = ({ id, label, error, helper, checking = false, ...inputProps }: FormFieldProps) => {
	const hasError = Boolean(error)

	return (
		<div className='flex flex-col gap-1'>
			<label htmlFor={id} className='text-sm font-medium text-slate-700'>
				{label}
				{inputProps.required && (
					<span aria-hidden='true' className='ml-0.5 text-red-500'>
						*
					</span>
				)}
			</label>
			<div className='relative'>
				<input
					id={id}
					aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
					aria-invalid={hasError}
					aria-busy={checking}
					className={[
						'w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
						'focus:outline-none focus:ring-2',
						'disabled:cursor-not-allowed disabled:opacity-50',
						checking ? 'pr-9' : '',
						hasError
							? 'border-red-500 bg-red-50 focus:ring-red-300'
							: 'border-slate-300 bg-white focus:ring-blue-300',
					].join(' ')}
					{...inputProps}
				/>
				{checking && (
					<div
						className='pointer-events-none absolute inset-y-0 right-3 flex items-center'
						aria-hidden='true'
					>
						<svg
							className='h-4 w-4 animate-spin text-slate-400'
							viewBox='0 0 24 24'
							fill='none'
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
					</div>
				)}
			</div>
			{error ? (
				<p id={`${id}-error`} role='alert' className='text-xs text-red-600'>
					{error}
				</p>
			) : helper ? (
				<p id={`${id}-helper`} className='text-xs text-slate-500'>
					{helper}
				</p>
			) : null}
		</div>
	)
}

export default FormField
