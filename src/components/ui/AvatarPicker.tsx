import type { ChangeEvent } from "react";
import { auth as copy } from "../../copy/es";

const MAX_SIZE_BYTES = 2 * 1024 * 1024;

interface AvatarPickerProps {
	preview: string | null;
	error?: string;
	disabled?: boolean;
	required?: boolean;
	onChange: (dataUrl: string | null, validationError?: string) => void;
}

const AvatarPicker = ({ preview, error, disabled, required, onChange }: AvatarPickerProps) => {
	const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!["image/jpeg", "image/png"].includes(file.type) || file.size > MAX_SIZE_BYTES) {
			onChange(null, copy.register.errors.avatarRequired);
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			onChange(reader.result as string, undefined);
		};
		reader.readAsDataURL(file);
	};

	return (
		<div className="flex flex-col gap-1">
			<span className="text-sm font-medium text-slate-700">
				{copy.register.avatarLabel}
				{required && (
					<span aria-hidden="true" className="ml-0.5 text-red-500">
						*
					</span>
				)}
			</span>
			<div className="flex items-center gap-4">
				{preview ? (
					<img
						src={preview}
						alt="Vista previa de avatar"
						className="h-14 w-14 rounded-full object-cover ring-2 ring-slate-200"
					/>
				) : (
					<div
						aria-hidden="true"
						className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400"
					>
						<svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
							<path d="M12 12a5 5 0 110-10 5 5 0 010 10zm0 2c5.523 0 10 2.686 10 6v1H2v-1c0-3.314 4.477-6 10-6z" />
						</svg>
					</div>
				)}
				<label
					className={[
						"cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5",
						"text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors",
						disabled ? "cursor-not-allowed opacity-50" : "",
					].join(" ")}
				>
					{preview ? copy.register.avatarChange : copy.register.avatarUpload}
					<input
						type="file"
						accept="image/jpeg,image/png"
						className="sr-only"
						disabled={disabled}
						onChange={handleFile}
					/>
				</label>
			</div>
			{error ? (
				<p role="alert" className="text-xs text-red-600">
					{error}
				</p>
			) : (
				<p className="text-xs text-slate-500">{copy.register.avatarHelper}</p>
			)}
		</div>
	);
};

export default AvatarPicker;
