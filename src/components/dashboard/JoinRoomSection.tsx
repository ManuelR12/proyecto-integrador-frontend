import { dashboard as copy } from "../../copy/es";

interface JoinRoomSectionProps {
	roomId: string;
	error: string | null;
	joining: boolean;
	onRoomIdChange: (value: string) => void;
	onSubmit: (event: React.FormEvent) => void;
}

const JoinIcon = () => (
	<svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
		<path
			fillRule="evenodd"
			d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
			clipRule="evenodd"
		/>
		<path
			fillRule="evenodd"
			d="M12.22 11.22a.75.75 0 011.06 0l2.25 2.25a.75.75 0 010 1.06l-2.25 2.25a.75.75 0 11-1.06-1.06l.97-.97H8.25a.75.75 0 010-1.5h4.94l-.97-.97a.75.75 0 010-1.06z"
			clipRule="evenodd"
		/>
	</svg>
);

const ErrorIcon = () => (
	<svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-red-500" aria-hidden="true">
		<path
			fillRule="evenodd"
			d="M18 10A8 8 0 11.001 9.999 8 8 0 0118 10zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
			clipRule="evenodd"
		/>
	</svg>
);

const JoinRoomSection = ({
	roomId,
	error,
	joining,
	onRoomIdChange,
	onSubmit,
}: JoinRoomSectionProps) => {
	const hasError = Boolean(error);

	return (
		<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<h2 className="text-base font-semibold text-slate-900">{copy.joinSection.title}</h2>

			<form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
				<div className="flex-1">
					<div className="relative">
						<input
							id="join-room-id"
							type="text"
							value={roomId}
							onChange={(event) => onRoomIdChange(event.target.value)}
							placeholder={copy.joinSection.placeholder}
							disabled={joining}
							aria-invalid={hasError}
							aria-describedby={hasError ? "join-room-error" : "join-room-hint"}
							className={[
								"w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400",
								"focus:outline-none focus:ring-2",
								hasError
									? "border-red-500 bg-red-50 pr-10 focus:ring-red-300"
									: "border-slate-300 bg-white focus:ring-blue-300",
							].join(" ")}
						/>
						{hasError && (
							<div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
								<ErrorIcon />
							</div>
						)}
					</div>

					{hasError ? (
						<p
							id="join-room-error"
							role="alert"
							className="mt-2 flex items-center gap-1.5 text-xs text-red-600"
						>
							<ErrorIcon />
							{error}
						</p>
					) : (
						<p id="join-room-hint" className="mt-2 text-xs text-slate-500">
							{copy.joinSection.hint}
						</p>
					)}
				</div>

				<button
					type="submit"
					disabled={joining}
					aria-busy={joining}
					className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-65 sm:min-w-[120px]"
				>
					{joining ? (
						<svg
							className="h-4 w-4 animate-spin"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
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
					) : (
						<JoinIcon />
					)}
					{copy.joinSection.submit}
				</button>
			</form>
		</section>
	);
};

export default JoinRoomSection;
