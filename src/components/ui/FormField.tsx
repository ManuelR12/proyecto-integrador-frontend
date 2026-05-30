import type { InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
	id: string
	label: string
	error?: string
	helper?: string
}

const FormField = ({ id, label, error, helper, ...inputProps }: FormFieldProps) => {
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
			<input
				id={id}
				aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
				aria-invalid={hasError}
				className={[
					'rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
					'focus:outline-none focus:ring-2',
					'disabled:cursor-not-allowed disabled:opacity-50',
					hasError
						? 'border-red-500 bg-red-50 focus:ring-red-300'
						: 'border-slate-300 bg-white focus:ring-blue-300',
				].join(' ')}
				{...inputProps}
			/>
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
