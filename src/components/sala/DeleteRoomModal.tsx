import { modals as copy } from "../../copy/es";
import Modal from "../ui/Modal";

interface DeleteRoomModalProps {
	open: boolean;
	deleting: boolean;
	error: string | null;
	onConfirm: () => void;
	onCancel: () => void;
}

const Spinner = () => (
	<svg
		className="h-5 w-5 animate-spin text-red-500"
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

const DeleteRoomModal = ({ open, deleting, error, onConfirm, onCancel }: DeleteRoomModalProps) => {
	const modalCopy = copy.eliminarSala;

	return (
		<Modal
			open={open}
			title={deleting ? modalCopy.confirmLoading : modalCopy.title}
			onClose={onCancel}
			closeOnBackdrop={!deleting}
			closeOnEscape={!deleting}
			showCloseButton={!deleting}
		>
			{deleting ? (
				<div className="flex flex-col items-center px-2 py-6 text-center">
					<Spinner />
					<p className="mt-4 text-sm font-medium text-slate-900">{modalCopy.confirmLoading}</p>
				</div>
			) : (
				<div className="pt-1">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="h-7 w-7 text-red-500"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
							/>
						</svg>
					</div>

					<p className="text-center text-sm text-slate-600">{modalCopy.body}</p>

					{error && (
						<p role="alert" className="mt-4 text-center text-xs text-red-600">
							{error}
						</p>
					)}

					<div className="mt-6 flex flex-col gap-3">
						<button
							type="button"
							onClick={onConfirm}
							className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500"
						>
							{modalCopy.confirm}
						</button>
						<button
							type="button"
							onClick={onCancel}
							className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
						>
							{modalCopy.cancel}
						</button>
					</div>
				</div>
			)}
		</Modal>
	);
};

export default DeleteRoomModal;
