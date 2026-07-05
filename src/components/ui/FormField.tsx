import { useState, type InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
	id: string;
	label: string;
	error?: string;
	helper?: string;
	checking?: boolean;
	showPasswordToggle?: boolean;
	showPasswordLabel?: string;
	hidePasswordLabel?: string;
}

const EyeIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
		/>
		<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
	</svg>
);

const EyeSlashIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c1.841 0 3.575-.487 5.07-1.337M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
		/>
	</svg>
);

const FormField = ({
	id,
	label,
	error,
	helper,
	checking = false,
	showPasswordToggle = false,
	showPasswordLabel = "Mostrar contraseña",
	hidePasswordLabel = "Ocultar contraseña",
	type = "text",
	...inputProps
}: FormFieldProps) => {
	const [passwordVisible, setPasswordVisible] = useState(false);
	const hasError = Boolean(error);
	const isPasswordField = type === "password" && showPasswordToggle;
	const inputType = isPasswordField && passwordVisible ? "text" : type;
	const hasToggle = isPasswordField || checking;

	return (
		<div className="flex flex-col gap-1">
			<label htmlFor={id} className="text-sm font-medium text-slate-700">
				{label}
				{inputProps.required && (
					<span aria-hidden="true" className="ml-0.5 text-red-500">
						*
					</span>
				)}
			</label>
			<div className="relative">
				<input
					id={id}
					type={inputType}
					aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
					aria-invalid={hasError}
					aria-busy={checking}
					className={[
						"w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400",
						"focus:outline-none focus:ring-2",
						"disabled:cursor-not-allowed disabled:opacity-50",
						hasToggle ? "pr-10" : "",
						hasError
							? "border-red-500 bg-red-50 focus:ring-red-300"
							: "border-slate-300 bg-white focus:ring-blue-300",
					].join(" ")}
					{...inputProps}
				/>
				{isPasswordField && (
					<button
						type="button"
						onClick={() => setPasswordVisible((prev) => !prev)}
						disabled={inputProps.disabled}
						aria-label={passwordVisible ? hidePasswordLabel : showPasswordLabel}
						className="absolute inset-y-0 right-2 flex items-center rounded-md p-1 text-slate-600 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{passwordVisible ? <EyeSlashIcon /> : <EyeIcon />}
					</button>
				)}
				{checking && (
					<div
						className="pointer-events-none absolute inset-y-0 right-3 flex items-center"
						aria-hidden="true"
					>
						<svg className="h-4 w-4 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
					</div>
				)}
			</div>
			{error ? (
				<p id={`${id}-error`} role="alert" className="text-xs text-red-600">
					{error}
				</p>
			) : helper ? (
				<p id={`${id}-helper`} className="text-xs text-slate-500">
					{helper}
				</p>
			) : null}
		</div>
	);
};

export default FormField;
