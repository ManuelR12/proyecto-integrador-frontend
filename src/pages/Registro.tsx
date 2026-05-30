import { Link } from "react-router-dom";
import { auth as copy } from "../copy/es";
import AuthShell from "../components/layout/AuthShell";
import FormField from "../components/ui/FormField";
import AvatarPicker from "../components/ui/AvatarPicker";
import SubmitButton from "../components/ui/SubmitButton";
import GoogleButton from "../components/ui/GoogleButton";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

const Registro = () => {
	const { fields, fieldErrors, serverError, loading, setField, setAvatarError, handleSubmit } =
		useRegisterForm();
	const { signIn: signInGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();

	const isLoading = loading || googleLoading;
	const hasErrors = Object.values(fieldErrors).some(Boolean);

	const handleAvatarChange = (dataUrl: string | null, validationError?: string) => {
		setField("avatarDataUrl", dataUrl);
		setAvatarError(validationError);
	};

	return (
		<AuthShell>
			<div className="w-full max-w-[540px]">
				<div className="rounded-2xl border border-slate-200 bg-white px-8 py-8 shadow-sm">
					<Link to="/" className="text-xs text-slate-500 transition-colors hover:text-slate-700">
						{copy.back}
					</Link>

					<p className="mt-3 text-base font-bold tracking-tight text-blue-600">AGORA</p>
					<h1 className="mt-1 text-2xl font-semibold text-slate-900">{copy.register.title}</h1>
					<p className="mt-1 text-sm text-slate-500">
						{hasErrors ? copy.register.subtitleError : copy.register.subtitle}
					</p>

					<GoogleButton
						id="btn-google-register"
						onClick={signInGoogle}
						loading={googleLoading}
						disabled={isLoading}
						className="mt-5"
					/>
					{googleError && (
						<p
							id="register-google-error"
							role="alert"
							className="mt-2 text-center text-xs text-red-600"
						>
							{googleError}
						</p>
					)}

					<div className="relative my-5 flex items-center">
						<div className="flex-1 border-t border-slate-200" />
						<span className="mx-3 text-xs text-slate-400">{copy.google.divider}</span>
						<div className="flex-1 border-t border-slate-200" />
					</div>

					<form
						id="register-form"
						onSubmit={handleSubmit}
						noValidate
						aria-label="Formulario de registro"
					>
						<fieldset disabled={isLoading} className="m-0 flex flex-col gap-4 border-0 p-0">
							<div className="grid grid-cols-2 gap-3">
								<FormField
									id="nombres"
									label={copy.register.nombresLabel}
									type="text"
									autoComplete="given-name"
									placeholder={copy.register.nombresPlaceholder}
									value={fields.nombres}
									error={fieldErrors.nombres}
									required
									onChange={(e) => setField("nombres", e.target.value)}
								/>
								<FormField
									id="apellidos"
									label={copy.register.apellidosLabel}
									type="text"
									autoComplete="family-name"
									placeholder={copy.register.apellidosPlaceholder}
									value={fields.apellidos}
									error={fieldErrors.apellidos}
									required
									onChange={(e) => setField("apellidos", e.target.value)}
								/>
							</div>

							<FormField
								id="username"
								label={copy.register.usernameLabel}
								type="text"
								autoComplete="username"
								placeholder={copy.register.usernamePlaceholder}
								value={fields.username}
								error={fieldErrors.username}
								helper={!fieldErrors.username ? copy.register.usernameHelper : undefined}
								required
								onChange={(e) => setField("username", e.target.value)}
							/>

							<AvatarPicker
								preview={fields.avatarDataUrl}
								error={fieldErrors.avatar}
								disabled={isLoading}
								required
								onChange={handleAvatarChange}
							/>

							<FormField
								id="email"
								label={copy.register.emailLabel}
								type="email"
								autoComplete="email"
								placeholder={copy.register.emailPlaceholder}
								value={fields.email}
								error={fieldErrors.email}
								required
								onChange={(e) => setField("email", e.target.value)}
							/>

							<FormField
								id="password"
								label={copy.register.passwordLabel}
								type="password"
								autoComplete="new-password"
								placeholder={copy.register.passwordPlaceholder}
								value={fields.password}
								error={fieldErrors.password}
								helper={!fieldErrors.password ? copy.register.passwordHelper : undefined}
								required
								onChange={(e) => setField("password", e.target.value)}
							/>
						</fieldset>

						{serverError && (
							<p
								id="register-server-error"
								role="alert"
								className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
							>
								{serverError}
							</p>
						)}

						<SubmitButton
							loading={isLoading}
							loadingLabel={copy.register.submitLoading}
							className="mt-5"
						>
							{copy.register.submit}
						</SubmitButton>
					</form>
				</div>

				<p className="mt-4 text-center text-xs text-slate-500">
					{copy.register.footerPrompt}{" "}
					<Link to="/login" className="text-blue-600 transition-colors hover:text-blue-500">
						{copy.register.footerLink}
					</Link>
				</p>
			</div>
		</AuthShell>
	);
};

export default Registro;
