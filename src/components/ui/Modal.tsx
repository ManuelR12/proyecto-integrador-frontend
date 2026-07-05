import { useEffect, useId, useRef, type ReactNode } from "react";
import { FocusTrap } from "focus-trap-react";

interface ModalProps {
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	closeOnBackdrop?: boolean;
	closeOnEscape?: boolean;
	showCloseButton?: boolean;
}

const Modal = ({
	open,
	onClose,
	title,
	children,
	closeOnBackdrop = true,
	closeOnEscape = true,
	showCloseButton = true,
}: ModalProps) => {
	const titleId = useId();
	const dialogRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;

		const previousFocus = document.activeElement as HTMLElement | null;
		dialogRef.current?.focus();

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && closeOnEscape) {
				onClose();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		document.body.style.overflow = "hidden";

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "";
			previousFocus?.focus();
		};
	}, [open, onClose, closeOnEscape]);

	if (!open) return null;

	return (
		<FocusTrap
			focusTrapOptions={{
				initialFocus: false,
				allowOutsideClick: true,
				returnFocusOnDeactivate: true,
			}}
		>
			<div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
				<button
					type="button"
					aria-label="Cerrar modal"
					className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
					onClick={closeOnBackdrop ? onClose : undefined}
					tabIndex={-1}
				/>
				<div
					ref={dialogRef}
					role="dialog"
					aria-modal="true"
					aria-labelledby={titleId}
					tabIndex={-1}
					className="relative z-10 w-full max-w-md rounded-2xl bg-white px-6 py-6 shadow-xl"
				>
					{showCloseButton && (
						<button
							type="button"
							onClick={onClose}
							aria-label="Cerrar"
							className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 focus-visible:text-slate-900"
						>
							<svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
								<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
							</svg>
						</button>
					)}
					<h2 id={titleId} className="sr-only">
						{title}
					</h2>
					{children}
				</div>
			</div>
		</FocusTrap>
	);
};

export default Modal;
