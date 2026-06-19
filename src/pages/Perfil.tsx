import { Link } from "react-router-dom";
import { perfil as copy } from "../copy/es";
import DeleteAccountModal from "../components/profile/DeleteAccountModal";
import AgoraBrandLink from "../components/layout/AgoraBrandLink";
import FormField from "../components/ui/FormField";
import SubmitButton from "../components/ui/SubmitButton";
import { useAuth } from "../contexts/AuthContext";
import { useDeleteAccount } from "../hooks/useDeleteAccount";
import { useUserProfile } from "../hooks/useUserProfile";
import { useProfileForm } from "../hooks/useProfileForm";

const Perfil = () => {
	const { user } = useAuth();
	const { avatarUrl: globalAvatarUrl } = useUserProfile();
	const {
		fields,
		fieldErrors,
		saving,
		checkingUsername,
		profileLoading,
		profileMissing,
		canSave,
		initials,
		setField,
		handleUsernameChange,
		handleSubmit,
	} = useProfileForm();
	const {
		isOpen: deleteModalOpen,
		phase: deleteModalPhase,
		confirmText: deleteConfirmText,
		openModal: openDeleteModal,
		closeModal: closeDeleteModal,
		setConfirmText: setDeleteConfirmText,
		handleConfirm: handleDeleteConfirm,
		handleReauthAction,
	} = useDeleteAccount();

	const headerPhoto = globalAvatarUrl ?? user?.photoURL;
	const headerInitials =
		initials ||
		(user?.displayName ?? "AG")
			.split(" ")
			.map((w) => w[0])
			.slice(0, 2)
			.join("")
			.toUpperCase();

	const avatarPreview = fields.avatarUrl ?? headerPhoto;

	return (
		<div id="perfil" className="flex min-h-screen w-full flex-col bg-[#f6f7f8]">
			<header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 sm:px-8">
				<AgoraBrandLink className="text-sm font-bold text-blue-600" />
				<Link to="/perfil" aria-label="Ir a mi perfil">
					{headerPhoto ? (
						<img
							src={headerPhoto}
							alt="Avatar"
							className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-200"
						/>
					) : (
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
							{headerInitials}
						</div>
					)}
				</Link>
			</header>

			<main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-8 sm:px-6">
				<div className="mb-6 text-center">
					<h1 className="text-2xl font-semibold text-slate-900">{copy.title}</h1>
					<p className="mt-1 text-sm text-slate-500">{copy.subtitle}</p>
				</div>

				{profileLoading ? (
					<div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
						<p className="text-sm text-slate-500">{copy.loading}</p>
					</div>
				) : profileMissing ? (
					<div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-8 text-center shadow-sm">
						<p className="text-sm text-amber-800">{copy.profileMissing}</p>
						<Link
							to="/username-setup"
							className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
						>
							Completar perfil
						</Link>
					</div>
				) : (
					<>
						<form
							id="profile-form"
							onSubmit={handleSubmit}
							noValidate
							aria-label="Formulario de perfil"
							className="rounded-xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8"
						>
							<fieldset disabled={saving} className="m-0 flex flex-col gap-5 border-0 p-0">
								<div className="flex flex-col gap-2">
									<span className="text-sm font-medium text-slate-700">{copy.avatarLabel}</span>
									<div className="flex items-center gap-4">
										{avatarPreview ? (
											<img
												src={avatarPreview}
												alt="Avatar"
												className="h-16 w-16 flex-shrink-0 rounded-full object-cover ring-2 ring-slate-200"
											/>
										) : (
											<div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
												{initials}
											</div>
										)}
										<div className="flex flex-1 flex-col gap-1">
											<input
												type="url"
												placeholder={copy.avatarUrlPlaceholder}
												disabled={saving}
												value={fields.avatarUrl ?? ""}
												className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
												onChange={(e) => setField("avatarUrl", e.target.value || null)}
											/>
											<p className="text-xs text-slate-500">{copy.avatarHelper}</p>
										</div>
									</div>
								</div>

								<FormField
									id="nombres"
									label={copy.nombresLabel}
									type="text"
									autoComplete="given-name"
									placeholder={copy.nombresPlaceholder}
									value={fields.nombres}
									error={fieldErrors.nombres}
									required
									onChange={(e) => setField("nombres", e.target.value)}
								/>

								<FormField
									id="apellidos"
									label={copy.apellidosLabel}
									type="text"
									autoComplete="family-name"
									placeholder={copy.apellidosPlaceholder}
									value={fields.apellidos}
									error={fieldErrors.apellidos}
									required
									onChange={(e) => setField("apellidos", e.target.value)}
								/>

								<div className="flex flex-col gap-1">
									<label htmlFor="username" className="text-sm font-medium text-slate-700">
										{copy.usernameLabel}
										<span aria-hidden="true" className="ml-0.5 text-red-500">
											*
										</span>
									</label>
									<div className="relative">
										<span
											aria-hidden="true"
											className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400"
										>
											@
										</span>
										<input
											id="username"
											type="text"
											autoComplete="username"
											placeholder={copy.usernamePlaceholder}
											value={fields.username}
											aria-invalid={Boolean(fieldErrors.username)}
											aria-busy={checkingUsername}
											aria-describedby={fieldErrors.username ? "username-error" : "username-helper"}
											required
											className={[
												"w-full rounded-lg border py-2 pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400",
												"focus:outline-none focus:ring-2",
												"disabled:cursor-not-allowed disabled:opacity-50",
												fieldErrors.username
													? "border-red-500 bg-red-50 focus:ring-red-300"
													: "border-slate-300 bg-white focus:ring-blue-300",
											].join(" ")}
											onChange={(e) => handleUsernameChange(e.target.value)}
										/>
									</div>
									{fieldErrors.username ? (
										<p id="username-error" role="alert" className="text-xs text-red-600">
											{fieldErrors.username}
										</p>
									) : (
										<p id="username-helper" className="text-xs text-slate-500">
											{copy.usernameHelper}
										</p>
									)}
								</div>

								<FormField
									id="email"
									label={copy.emailLabel}
									type="email"
									autoComplete="email"
									placeholder={copy.emailPlaceholder}
									value={fields.email}
									readOnly
									required
									className="cursor-not-allowed bg-slate-50 text-slate-600"
								/>
							</fieldset>

							<SubmitButton
								loading={saving}
								loadingLabel={copy.saveLoading}
								disabled={!canSave}
								className="mt-6"
							>
								{copy.save}
							</SubmitButton>
						</form>

						<section
							aria-labelledby="danger-zone-title"
							className="mt-8 rounded-xl border border-red-100 bg-white px-6 py-5 shadow-sm sm:px-8"
						>
							<h2 id="danger-zone-title" className="text-sm font-semibold text-red-600">
								{copy.dangerZone.title}
							</h2>
							<p className="mt-2 text-xs text-slate-500">{copy.dangerZone.body}</p>
							<button
								type="button"
								onClick={openDeleteModal}
								disabled={saving}
								className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									className="h-4 w-4"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.916m7.5 0a48.667 48.667 0 00-7.5 0"
									/>
								</svg>
								{copy.dangerZone.deleteButton}
							</button>
						</section>
					</>
				)}

				<p className="mt-6 text-center">
					<Link to="/dashboard" className="text-xs text-slate-500 transition hover:text-slate-700">
						← Volver al dashboard
					</Link>
				</p>
			</main>

			<DeleteAccountModal
				open={deleteModalOpen}
				phase={deleteModalPhase}
				confirmText={deleteConfirmText}
				onConfirmTextChange={setDeleteConfirmText}
				onConfirm={handleDeleteConfirm}
				onCancel={closeDeleteModal}
				onReauthAction={handleReauthAction}
			/>
		</div>
	);
};

export default Perfil;
