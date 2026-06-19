import { useState } from "react";

interface AvatarPickerProps {
	value: string | null;
	label?: string;
	changeLabel?: string;
	helperText?: string;
	error?: string;
	disabled?: boolean;
	onChange: (url: string | null, error?: string) => void;
}

function compressImage(file: File, size = 128): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement("canvas");
				canvas.width = size;
				canvas.height = size;
				const ctx = canvas.getContext("2d");
				if (!ctx) {
					reject(new Error("canvas unavailable"));
					return;
				}
				ctx.drawImage(img, 0, 0, size, size);
				resolve(canvas.toDataURL("image/jpeg", 0.75));
			};
			img.onerror = reject;
			img.src = reader.result as string;
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

const AvatarPicker = ({
	value,
	label,
	changeLabel = "Subir foto",
	helperText,
	error,
	disabled,
	onChange,
}: AvatarPickerProps) => {
	const [compressing, setCompressing] = useState(false);
	const isDisabled = disabled || compressing;

	const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;

		if (!["image/jpeg", "image/png"].includes(file.type)) {
			onChange(null, "Solo se aceptan imágenes JPG o PNG.");
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			onChange(null, "La imagen no debe superar 5 MB.");
			return;
		}

		setCompressing(true);
		try {
			const compressed = await compressImage(file);
			onChange(compressed, undefined);
		} catch {
			onChange(null, "No se pudo procesar la imagen. Intenta con otra.");
		} finally {
			setCompressing(false);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			{label && <span className="text-sm font-medium text-slate-700">{label}</span>}
			<div className="flex items-center gap-4">
				<div className="relative h-16 w-16 flex-shrink-0">
					{value ? (
						<img
							src={value}
							alt=""
							className="h-16 w-16 rounded-full object-cover ring-2 ring-slate-200"
						/>
					) : (
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
							<svg
								viewBox="0 0 24 24"
								fill="currentColor"
								className="h-8 w-8"
								aria-hidden="true"
							>
								<path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.337 0-10 1.676-10 5v2h20v-2c0-3.324-6.663-5-10-5z" />
							</svg>
						</div>
					)}
					{compressing && (
						<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
							<svg
								className="h-5 w-5 animate-spin text-white"
								fill="none"
								viewBox="0 0 24 24"
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
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
								/>
							</svg>
						</div>
					)}
				</div>

				<div className="flex flex-col gap-1">
					<label
						className={[
							"cursor-pointer text-sm font-medium text-blue-600 transition hover:text-blue-500",
							isDisabled ? "pointer-events-none opacity-50" : "",
						].join(" ")}
					>
						{compressing ? "Procesando..." : changeLabel}
						<input
							type="file"
							accept="image/jpeg,image/png"
							className="sr-only"
							disabled={isDisabled}
							onChange={handleFile}
						/>
					</label>
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
