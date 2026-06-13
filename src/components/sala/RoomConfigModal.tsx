import { modals as copy } from "../../copy/es";
import Modal from "../ui/Modal";
import SubmitButton from "../ui/SubmitButton";

interface RoomConfigModalProps {
	open: boolean;
	name: string;
	saving: boolean;
	error: string | null;
	maxNameLength: number;
	onClose: () => void;
	onNameChange: (value: string) => void;
	onSubmit: (event: React.FormEvent) => void;
}

const RoomConfigModal = ({
	open,
	name,
	saving,
	error,
	maxNameLength,
	onClose,
	onNameChange,
	onSubmit,
}: RoomConfigModalProps) => {
	const modalCopy = copy.editarSala;

	return (
		<Modal
			open={open}
			title={modalCopy.title}
			onClose={onClose}
			closeOnBackdrop={!saving}
			closeOnEscape={!saving}
			showCloseButton={!saving}
		>
			<form onSubmit={onSubmit} className="space-y-5 pt-1">
				<div className="flex flex-col gap-1">
					<div className="flex items-center justify-between">
						<label htmlFor="room-config-name" className="text-sm font-medium text-slate-700">
							{modalCopy.nameLabel}
							<span aria-hidden="true" className="ml-0.5 text-red-500">
								*
							</span>
						</label>
						<span className="text-xs text-slate-400">
							{name.length}/{maxNameLength}
						</span>
					</div>
					<input
						id="room-config-name"
						type="text"
						value={name}
						onChange={(event) => onNameChange(event.target.value)}
						placeholder={modalCopy.namePlaceholder}
						maxLength={maxNameLength}
						disabled={saving}
						aria-invalid={Boolean(error)}
						aria-describedby={error ? "room-config-name-error" : undefined}
						className={[
							"w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400",
							"focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
							error
								? "border-red-500 bg-red-50 focus:ring-red-300"
								: "border-slate-300 bg-white focus:ring-blue-300",
						].join(" ")}
					/>
					{error && (
						<p id="room-config-name-error" role="alert" className="text-xs text-red-600">
							{error}
						</p>
					)}
				</div>

				<div className="flex justify-end gap-3">
					<button
						type="button"
						onClick={onClose}
						disabled={saving}
						className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{modalCopy.cancel}
					</button>
					<SubmitButton
						loading={saving}
						loadingLabel={modalCopy.confirmLoading}
						className="w-auto px-5"
					>
						{modalCopy.confirm}
					</SubmitButton>
				</div>
			</form>
		</Modal>
	);
};

export default RoomConfigModal;
