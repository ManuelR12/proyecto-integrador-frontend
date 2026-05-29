import type { ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { auth as copy } from "../copy/es";
import AuthShell from "../components/layout/AuthShell";
import FormField from "../components/ui/FormField";
import SubmitButton from "../components/ui/SubmitButton";
import { useRegisterForm } from "../hooks/useRegisterForm";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const Registro = () => {
	const { fields, fieldErrors, serverError, loading, setField, setAvatarError, handleSubmit } =
		useRegisterForm();

	const isLoading = loading;

	const handleAvatarFile = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!["image/jpeg", "image/png"].includes(file.type) || file.size > MAX_AVATAR_BYTES) {
			setAvatarError(copy.register.errors.avatarRequired);
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			setField("avatarDataUrl", reader.result as string);
			setAvatarError(undefined);
		};
		reader.readAsDataURL(file);
	};

	return (
		<AuthShell>
			<div className="w-full max-w-[420px]">
				{/* Header */}
				<h1 className="text-2xl font-semibold text-slate-900">{copy.register.title}</h1>
				<p className="mt-1 text-sm text-slate-500">
					{isLoading ? copy.register.subtitleLoading : copy.register.subtitle}
				</p>

				{/* Form card */}
				<form
					onSubmit={handleSubmit}
					noValidate
					aria-label="Formulario de registro"
					className="mt-5 rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm"
				>
					{/* ── Compact avatar at top ── */}
					<div className="mb-5 flex items-center gap-4 rounded-xl bg-slate-50 px-4 py-3">
						<label
							className={[
								"group relative cursor-pointer flex-shrink-0",
								isLoading ? "cursor-not-allowed opacity-50" : "",
							].join(" ")}
						>
							{fields.avatarDataUrl ? (
								<img
									src={fields.avatarDataUrl}
									alt="Avatar"
									className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-200"
								/>
							) : (
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 ring-2 ring-slate-200">
									<svg
										viewBox="0 0 24 24"
										fill="currentColor"
										className="h-6 w-6 text-slate-400"
										aria-hidden="true"
									>
										<path d="M12 12a5 5 0 110-10 5 5 0 010 10zm0 2c5.523 0 10 2.686 10 6v1H2v-1c0-3.314 4.477-6 10-6z" />
									</svg>
								</div>
							)}
							{/* Camera overlay on hover */}
							<span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/25 opacity-0 transition-opacity group-hover:opacity-100">
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
									className="h-4 w-4 text-white"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
									/>
								</svg>
							</span>
							<input
								type="file"
								accept="image/jpeg,image/png"
								className="sr-only"
								disabled={isLoading}
								onChange={handleAvatarFile}
							/>
						</label>
						<div className="min-w-0">
							<p className="text-sm font-medium text-slate-700">{copy.register.avatarLabel}</p>
							<p className="text-xs text-slate-400">
								{fields.avatarDataUrl ? copy.register.avatarChange : copy.register.avatarHelper}
							</p>
							{fieldErrors.avatar && (
								<p role="alert" className="text-xs text-red-600">
									{fieldErrors.avatar}
								</p>
							)}
						</div>
					</div>

					<fieldset disabled={isLoading} className="m-0 flex flex-col gap-4 border-0 p-0">
						{/* Row: nombres + apellidos */}
						<div className="grid grid-cols-2 gap-3">
							<FormField
								id="nombres"
								label={copy.register.nombresLabel}
								type="text"
								autoComplete="given-name"
								placeholder={copy.register.nombresPlaceholder}
								value={fields.nombres}
								error={fieldErrors.nombres}
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
								onChange={(e) => setField("apellidos", e.target.value)}
							/>
						</div>

						{/* Username */}
						<FormField
							id="username"
							label={copy.register.usernameLabel}
							type="text"
							autoComplete="username"
							placeholder={copy.register.usernamePlaceholder}
							value={fields.username}
							error={fieldErrors.username}
							helper={!fieldErrors.username ? copy.register.usernameHelper : undefined}
							onChange={(e) => setField("username", e.target.value)}
						/>

						{/* Email */}
						<FormField
							id="email"
							label={copy.register.emailLabel}
							type="email"
							autoComplete="email"
							placeholder={copy.register.emailPlaceholder}
							value={fields.email}
							error={fieldErrors.email}
							onChange={(e) => setField("email", e.target.value)}
						/>

						{/* Password */}
						<FormField
							id="password"
							label={copy.register.passwordLabel}
							type="password"
							autoComplete="new-password"
							placeholder={copy.register.passwordPlaceholder}
							value={fields.password}
							error={fieldErrors.password}
							helper={!fieldErrors.password ? copy.register.passwordHelper : undefined}
							onChange={(e) => setField("password", e.target.value)}
						/>
					</fieldset>

					{/* Server / global error */}
					{serverError && (
						<p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
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


const Registro = () => {
	const { fields, fieldErrors, serverError, loading, setField, setAvatarError, handleSubmit } =
		useRegisterForm();

	const isLoading = loading;

	return (
		<AuthShell>
			<div className="w-full max-w-md">
				{/* Header */}
				<h1 className="text-2xl font-semibold text-slate-900">{copy.register.title}</h1>
				<p className="mt-1 text-sm text-slate-500">
					{isLoading ? copy.register.subtitleLoading : copy.register.subtitle}
				</p>

				{/* Form card */}
				<form
					onSubmit={handleSubmit}
					noValidate
					aria-label="Formulario de registro"
					className="mt-6 rounded-2xl border border-slate-200 bg-white px-8 py-8 shadow-sm"
				>
					<fieldset disabled={isLoading} className="m-0 flex flex-col gap-5 border-0 p-0">
						{/* Row: nombres + apellidos */}
						<div className="grid grid-cols-2 gap-4">
							<FormField
								id="nombres"
								label={copy.register.nombresLabel}
								type="text"
								autoComplete="given-name"
								placeholder={copy.register.nombresPlaceholder}
								value={fields.nombres}
								error={fieldErrors.nombres}
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
								onChange={(e) => setField("apellidos", e.target.value)}
							/>
						</div>

						{/* Username */}
						<FormField
							id="username"
							label={copy.register.usernameLabel}
							type="text"
							autoComplete="username"
							placeholder={copy.register.usernamePlaceholder}
							value={fields.username}
							error={fieldErrors.username}
							helper={!fieldErrors.username ? copy.register.usernameHelper : undefined}
							onChange={(e) => setField("username", e.target.value)}
						/>

						{/* Avatar */}
						<AvatarPicker
							preview={fields.avatarDataUrl}
							error={fieldErrors.avatar}
							disabled={isLoading}
							onChange={(dataUrl, validationError) => {
								setField("avatarDataUrl", dataUrl);
								setAvatarError(validationError);
							}}
						/>

						{/* Email */}
						<FormField
							id="email"
							label={copy.register.emailLabel}
							type="email"
							autoComplete="email"
							placeholder={copy.register.emailPlaceholder}
							value={fields.email}
							error={fieldErrors.email}
							onChange={(e) => setField("email", e.target.value)}
						/>

						{/* Password */}
						<FormField
							id="password"
							label={copy.register.passwordLabel}
							type="password"
							autoComplete="new-password"
							placeholder={copy.register.passwordPlaceholder}
							value={fields.password}
							error={fieldErrors.password}
							helper={!fieldErrors.password ? copy.register.passwordHelper : undefined}
							onChange={(e) => setField("password", e.target.value)}
						/>
					</fieldset>

					{/* Server / global error */}
					{serverError && (
						<p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
							{serverError}
						</p>
					)}

					<SubmitButton
						loading={isLoading}
						loadingLabel={copy.register.submitLoading}
						className="mt-6"
					>
						{copy.register.submit}
					</SubmitButton>
				</form>

				<p className="mt-5 text-center text-xs text-slate-500">
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
