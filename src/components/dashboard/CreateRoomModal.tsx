import { dashboard as copy } from "../../copy/es";
import Modal from "../ui/Modal";
import SubmitButton from "../ui/SubmitButton";

interface CreateRoomModalProps {
	open: boolean;
	title: string;
	creating: boolean;
	error: string | null;
	maxTitleLength: number;
	onClose: () => void;
	onTitleChange: (value: string) => void;
	onSubmit: (event: React.FormEvent) => void;
}

const CreateRoomModal = ({
	open,
	title,
	creating,
	error,
	maxTitleLength,
	onClose,
	onTitleChange,
	onSubmit,
}: CreateRoomModalProps) => {
	const modalCopy = copy.createModal;

	return (
		<Modal
			open={open}
			title={modalCopy.title}
			onClose={onClose}
			closeOnBackdrop={!creating}
			closeOnEscape={!creating}
			showCloseButton={!creating}
		>
			<div className="pt-1">
				<h2 className="text-lg font-semibold text-slate-900">{modalCopy.title}</h2>
				<p className="mt-1 text-sm text-slate-600">{modalCopy.idHelper}</p>

				<form onSubmit={onSubmit} className="mt-5 space-y-5">
					<div className="flex flex-col gap-1">
						<div className="flex items-center justify-between">
							<label htmlFor="room-name" className="text-sm font-medium text-slate-700">
								{modalCopy.nameLabel}
								<span aria-hidden="true" className="ml-0.5 text-red-500">
									*
								</span>
							</label>
							<span className="text-xs text-slate-600">
								{title.length}/{maxTitleLength}
							</span>
						</div>
						<input
							id="room-name"
							type="text"
							value={title}
							onChange={(event) => onTitleChange(event.target.value)}
							placeholder={modalCopy.namePlaceholder}
							maxLength={maxTitleLength}
							aria-invalid={Boolean(error)}
							aria-describedby={error ? "room-name-error" : undefined}
							aria-required="true"
							disabled={creating}
							className={[
								"w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400",
								"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
								error
									? "border-red-500 bg-red-50 focus-visible:outline-red-500"
									: "border-slate-300 bg-white focus-visible:outline-purple-500",
							].join(" ")}
						/>
						{error && (
							<p id="room-name-error" role="alert" className="text-xs text-red-600">
								{error}
							</p>
						)}
					</div>

					<div className="flex justify-end gap-3 pt-1">
						<button
							type="button"
							onClick={onClose}
							disabled={creating}
							className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{modalCopy.cancel}
						</button>
						<SubmitButton
							loading={creating}
							loadingLabel={modalCopy.submitLoading}
							className="w-auto px-5"
						>
							{modalCopy.submit}
						</SubmitButton>
					</div>
				</form>
			</div>
		</Modal>
	);
};

export default CreateRoomModal;
