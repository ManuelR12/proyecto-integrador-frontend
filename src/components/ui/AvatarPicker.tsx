import { useId, useRef, useState } from "react";

interface AvatarPickerProps {
	value: string | null;
	label?: string;
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
	helperText,
	error,
	disabled,
	onChange,
}: AvatarPickerProps) => {
	const id = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const [compressing, setCompressing] = useState(false);
	const [dragging, setDragging] = useState(false);
	const isDisabled = disabled || compressing;

	const processFile = async (file: File) => {
		if (!file.type.startsWith("image/")) {
			onChange(null, "Solo se aceptan archivos de imagen.");
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

	const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (file) void processFile(file);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragging(false);
		if (isDisabled) return;
		const file = e.dataTransfer.files[0];
		if (file) void processFile(file);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		if (!isDisabled) setDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
	};

	return (
		<div className="flex flex-col gap-1.5">
			{label && <span className="text-sm font-medium text-slate-700">{label}</span>}

			<label
				htmlFor={id}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				className={[
					"flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-5 text-center transition",
					dragging
						? "border-blue-400 bg-blue-50"
						: "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40",
					isDisabled ? "pointer-events-none opacity-50" : "",
				].join(" ")}
			>
				<div className="relative mt-1">
					{value ? (
						<>
							<img src={value} alt="" className="h-20 w-20 rounded-full object-cover shadow-sm" />
							<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition hover:bg-black/30">
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									className="h-6 w-6 text-white opacity-0 transition hover:opacity-100"
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
										d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
									/>
								</svg>
							</div>
						</>
					) : (
						<div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className={[
									"h-8 w-8 transition",
									dragging ? "text-blue-500" : "text-slate-400",
								].join(" ")}
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
									d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
								/>
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

				<div>
					<p className="text-sm font-medium text-slate-700">
						{compressing
							? "Procesando..."
							: dragging
								? "Suelta la imagen aquí"
								: value
									? "Haz clic o arrastra para cambiar"
									: "Haz clic o arrastra tu foto aquí"}
					</p>
					<p className="mt-0.5 text-xs text-slate-400">
						{helperText ?? "PNG, JPG, WEBP · Máx 5 MB"}
					</p>
				</div>

				<input
					ref={inputRef}
					id={id}
					type="file"
					accept="image/*"
					className="sr-only"
					disabled={isDisabled}
					onChange={handleFile}
				/>
			</label>

			{error && (
				<p role="alert" className="text-xs text-red-600">
					{error}
				</p>
			)}
		</div>
	);
};

export default AvatarPicker;
