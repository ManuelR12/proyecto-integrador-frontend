import { Link } from "react-router-dom";
import { auth as copy } from "../copy/es";
import AuthShell from "../components/layout/AuthShell";
import FormField from "../components/ui/FormField";
import SubmitButton from "../components/ui/SubmitButton";
import GoogleButton from "../components/ui/GoogleButton";
import { useLoginForm } from "../hooks/useLoginForm";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

const Login = () => {
	const { fields, fieldErrors, serverError, loading, setField, handleSubmit } = useLoginForm();
	const { signIn: signInGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();

	const isLoading = loading || googleLoading;

	return (
		<AuthShell>
			<div className="w-full max-w-[400px]">
				<div className="rounded-2xl border border-slate-200 bg-white px-8 py-8 shadow-sm">
					<Link to="/" className="text-xs text-slate-500 transition-colors hover:text-slate-700">
						{copy.back}
					</Link>

					<p className="mt-3 text-base font-bold tracking-tight text-blue-600">AGORA</p>
					<h1 className="mt-1 text-2xl font-semibold text-slate-900">{copy.login.title}</h1>
					<p className="mt-1 text-sm text-slate-500">{copy.login.subtitle}</p>

					<GoogleButton
						id="btn-google-login"
						onClick={signInGoogle}
						loading={googleLoading}
						disabled={isLoading}
						className="mt-5"
					/>
					{googleError && (
						<p
							id="login-google-error"
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
						id="login-form"
						onSubmit={handleSubmit}
						noValidate
						aria-label="Formulario de inicio de sesión"
					>
						<fieldset disabled={isLoading} className="m-0 flex flex-col gap-4 border-0 p-0">
							<FormField
								id="email"
								label={copy.login.emailLabel}
								type="email"
								autoComplete="email"
								placeholder={copy.login.emailPlaceholder}
								value={fields.email}
								error={fieldErrors.email}
								onChange={(e) => setField("email", e.target.value)}
							/>
							<FormField
								id="password"
								label={copy.login.passwordLabel}
								type="password"
								autoComplete="current-password"
								placeholder={copy.login.passwordPlaceholder}
								value={fields.password}
								error={fieldErrors.password}
								onChange={(e) => setField("password", e.target.value)}
							/>
						</fieldset>

						{serverError && (
							<p
								id="login-server-error"
								role="alert"
								className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
							>
								{serverError}
							</p>
						)}

						<SubmitButton
							loading={loading}
							loadingLabel={copy.login.submitLoading}
							className="mt-5"
						>
							{copy.login.submit}
						</SubmitButton>
					</form>
				</div>

				<p className="mt-4 text-center text-xs text-slate-500">
					{copy.login.footerPrompt}{" "}
					<Link to="/registro" className="text-blue-600 transition-colors hover:text-blue-500">
						{copy.login.footerLink}
					</Link>
				</p>
			</div>
		</AuthShell>
	);
};

export default Login;
