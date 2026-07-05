import { Link, useLocation } from "react-router-dom";
import { auth as copy } from "../copy/es";
import AuthShell from "../components/layout/AuthShell";
import AgoraBrandLink from "../components/layout/AgoraBrandLink";
import AvatarPicker from "../components/ui/AvatarPicker";
import FormField from "../components/ui/FormField";
import SubmitButton from "../components/ui/SubmitButton";
import GoogleButton from "../components/ui/GoogleButton";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import PasswordStrengthChecklist from "../components/ui/PasswordStrengthChecklist";

const Registro = () => {
	const location = useLocation();
	const incompleteProfile = (location.state as { incompleteProfile?: boolean } | null)
		?.incompleteProfile;
	const { fields, fieldErrors, serverError, loading, setField, setAvatarError, handleSubmit } =
		useRegisterForm();
	const { signIn: signInGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();

	const isLoading = loading || googleLoading;
	const hasErrors = Object.values(fieldErrors).some(Boolean);

	return (
		<AuthShell>
			<div className="w-full max-w-[540px]">
				<div className="rounded-2xl border border-slate-200 bg-white px-8 py-8 shadow-sm">
					<Link
						to="/"
						className="text-xs text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
					>
						{copy.back}
					</Link>

					<AgoraBrandLink className="mt-3 block text-base font-bold tracking-tight text-blue-600" />
					<h1 className="mt-1 text-2xl font-semibold text-slate-900">{copy.register.title}</h1>
					<p className="mt-1 text-sm text-slate-600">
						{hasErrors ? copy.register.subtitleError : copy.register.subtitle}
					</p>

					{incompleteProfile && (
						<p className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
							Tu registro anterior no se completó. Por favor vuelve a crear tu cuenta.
						</p>
					)}

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
						<span className="mx-3 text-xs text-slate-600">{copy.google.divider}</span>
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
								value={fields.avatarUrl}
								label={copy.register.avatarLabel}
								helperText={copy.register.avatarHelper}
								error={fieldErrors.avatar}
								disabled={isLoading}
								onChange={(url, err) => {
									setField("avatarUrl", url);
									setAvatarError(err);
								}}
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

							<div>
								<FormField
									id="password"
									label={copy.register.passwordLabel}
									type="password"
									autoComplete="new-password"
									placeholder={copy.register.passwordPlaceholder}
									value={fields.password}
									error={fieldErrors.password}
									showPasswordToggle
									showPasswordLabel={copy.register.showPassword}
									hidePasswordLabel={copy.register.hidePassword}
									required
									onChange={(e) => setField("password", e.target.value)}
								/>
								<PasswordStrengthChecklist password={fields.password} />
							</div>
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

				<p className="mt-4 text-center text-xs text-slate-600">
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
