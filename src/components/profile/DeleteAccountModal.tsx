import { perfil as copy } from "../../copy/es";
import Modal from "../ui/Modal";

const CONFIRM_WORD = copy.deleteModal.confirmWord;

export type DeleteModalPhase = "confirm" | "loading" | "reauth";

interface DeleteAccountModalProps {
	open: boolean;
	phase: DeleteModalPhase;
	confirmText: string;
	onConfirmTextChange: (value: string) => void;
	onConfirm: () => void;
	onCancel: () => void;
	onReauthAction: () => void;
}

const Spinner = ({ className = "h-10 w-10" }: { className?: string }) => (
	<svg
		className={`animate-spin text-red-500 ${className}`}
		viewBox="0 0 24 24"
		fill="none"
		aria-hidden="true"
	>
		<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
		<path
			className="opacity-75"
			fill="currentColor"
			d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
		/>
	</svg>
);

const DeleteAccountModal = ({
	open,
	phase,
	confirmText,
	onConfirmTextChange,
	onConfirm,
	onCancel,
	onReauthAction,
}: DeleteAccountModalProps) => {
	const modalCopy = copy.deleteModal;
	const isLoading = phase === "loading";
	const canConfirm = confirmText.trim().toLowerCase() === CONFIRM_WORD && !isLoading;
	const isInteractive = phase === "confirm" || phase === "reauth";

	return (
		<Modal
			open={open}
			title={isLoading ? modalCopy.loadingTitle : modalCopy.title}
			onClose={onCancel}
			closeOnBackdrop={isInteractive}
			closeOnEscape={isInteractive}
			showCloseButton={isInteractive}
		>
			{phase === "loading" ? (
				<div className="flex flex-col items-center px-2 py-4 text-center">
					<Spinner />
					<p className="mt-5 text-lg font-semibold text-slate-900">{modalCopy.loadingTitle}</p>
					<p className="mt-2 text-sm text-blue-600">{modalCopy.loadingBody}</p>
				</div>
			) : (
				<div className="pt-2">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="h-7 w-7 text-amber-500"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
							/>
						</svg>
					</div>

					<p className="text-center text-lg font-semibold text-slate-900">{modalCopy.title}</p>
					<p className="mt-3 text-sm text-slate-600">{modalCopy.intro}</p>
					<ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-600">
						{modalCopy.consequences.map((item) => (
							<li key={item}>{item}</li>
						))}
					</ul>

					{phase === "reauth" && (
						<div
							role="alert"
							className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left"
						>
							<p className="text-sm font-semibold text-amber-900">{modalCopy.reauthAlert.title}</p>
							<p className="mt-1 text-xs text-amber-800">{modalCopy.reauthAlert.body}</p>
							<button
								type="button"
								onClick={onReauthAction}
								className="mt-3 w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-500"
							>
								{modalCopy.reauthAlert.action}
							</button>
						</div>
					)}

					<div className="mt-5">
						<label htmlFor="delete-confirm-input" className="text-sm text-slate-600">
							{modalCopy.confirmPrompt}{" "}
							<strong className="font-semibold text-slate-900">{CONFIRM_WORD}</strong> en el campo
							de abajo:
						</label>
						<input
							id="delete-confirm-input"
							type="text"
							value={confirmText}
							placeholder={modalCopy.confirmPlaceholder}
							autoComplete="off"
							disabled={phase === "reauth"}
							onChange={(e) => onConfirmTextChange(e.target.value)}
							className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:cursor-not-allowed disabled:bg-slate-50"
						/>
					</div>

					<div className="mt-6 flex flex-col gap-3">
						<button
							type="button"
							disabled={!canConfirm || phase === "reauth"}
							onClick={onConfirm}
							className="w-full rounded-lg bg-red-400 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{modalCopy.confirmButton}
						</button>
						<button
							type="button"
							onClick={onCancel}
							className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
						>
							{modalCopy.cancelButton}
						</button>
					</div>
				</div>
			)}
		</Modal>
	);
};

export default DeleteAccountModal;
