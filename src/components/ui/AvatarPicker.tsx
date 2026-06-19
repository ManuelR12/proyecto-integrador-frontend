interface AvatarPickerProps {
	value: string | null;
	label?: string;
	placeholder?: string;
	helperText?: string;
	error?: string;
	disabled?: boolean;
	onChange: (url: string | null) => void;
}

const AvatarPicker = ({
	value,
	label,
	placeholder = "https://...",
	helperText,
	error,
	disabled,
	onChange,
}: AvatarPickerProps) => {
	return (
		<div className="flex flex-col gap-2">
			{label && <span className="text-sm font-medium text-slate-700">{label}</span>}
			<div className="flex items-center gap-4">
				<div className="relative h-16 w-16 flex-shrink-0">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
						<svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8" aria-hidden="true">
							<path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.337 0-10 1.676-10 5v2h20v-2c0-3.324-6.663-5-10-5z" />
						</svg>
					</div>
					{value && (
						<img
							key={value}
							src={value}
							alt=""
							className="absolute inset-0 h-16 w-16 rounded-full object-cover ring-2 ring-slate-200"
							onError={(e) => {
								e.currentTarget.style.display = "none";
							}}
						/>
					)}
				</div>

				<div className="flex flex-1 flex-col gap-1">
					<input
						type="url"
						placeholder={placeholder}
						disabled={disabled}
						value={value ?? ""}
						className={[
							"w-full rounded-lg border px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400",
							"focus:outline-none focus:ring-2",
							"disabled:cursor-not-allowed disabled:opacity-50",
							error
								? "border-red-500 bg-red-50 focus:ring-red-300"
								: "border-slate-300 bg-white focus:ring-blue-300",
						].join(" ")}
						onChange={(e) => onChange(e.target.value || null)}
					/>
					{error ? (
						<p role="alert" className="text-xs text-red-600">
							{error}
						</p>
					) : helperText ? (
						<p className="text-xs text-slate-500">{helperText}</p>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default AvatarPicker;
