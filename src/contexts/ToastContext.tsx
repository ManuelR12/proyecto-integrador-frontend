import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info'

interface Toast {
	id: string
	message: string
	type: ToastType
}

interface ToastContextValue {
	showToast: (message: string, type?: ToastType) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} })

// ─── Icons ───────────────────────────────────────────────────────────────────

const ICON_CHECK =
	'M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z'
const ICON_X_CIRCLE =
	'M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z'
const ICON_INFO =
	'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z'
const ICON_CLOSE = 'M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z'

// ─── Toast item ───────────────────────────────────────────────────────────────

const STYLES: Record<ToastType, { border: string; icon: string; iconPath: string }> = {
	success: {
		border: 'border-l-emerald-500',
		icon: 'text-emerald-500',
		iconPath: ICON_CHECK,
	},
	error: {
		border: 'border-l-red-500',
		icon: 'text-red-500',
		iconPath: ICON_X_CIRCLE,
	},
	info: {
		border: 'border-l-blue-500',
		icon: 'text-blue-500',
		iconPath: ICON_INFO,
	},
}

function ToastItem({
	toast,
	onDismiss,
}: {
	toast: Toast
	onDismiss: () => void
}) {
	const s = STYLES[toast.type]
	return (
		<div
			role='alert'
			className={[
				'animate-toast-in flex w-full max-w-sm items-start gap-3',
				'rounded-xl border border-l-4 border-slate-100 bg-white px-4 py-3',
				'shadow-lg shadow-slate-900/8',
				s.border,
			].join(' ')}
		>
			<svg
				viewBox='0 0 20 20'
				fill='currentColor'
				className={`mt-0.5 h-5 w-5 flex-shrink-0 ${s.icon}`}
				aria-hidden='true'
			>
				<path fillRule='evenodd' clipRule='evenodd' d={s.iconPath} />
			</svg>

			<p className='flex-1 text-sm font-medium text-slate-700'>{toast.message}</p>

			<button
				type='button'
				onClick={onDismiss}
				aria-label='Cerrar notificación'
				className='mt-0.5 flex-shrink-0 text-slate-400 transition-colors hover:text-slate-600'
			>
				<svg viewBox='0 0 20 20' fill='currentColor' className='h-4 w-4' aria-hidden='true'>
					<path d={ICON_CLOSE} />
				</svg>
			</button>
		</div>
	)
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([])

	const dismiss = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id))
	}, [])

	const showToast = useCallback(
		(message: string, type: ToastType = 'info') => {
			const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
			setToasts((prev) => [{ id, message, type }, ...prev])
			setTimeout(() => dismiss(id), 4500)
		},
		[dismiss],
	)

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}
			<div
				aria-live='polite'
				aria-atomic='false'
				className='pointer-events-none fixed bottom-5 right-5 z-[300] flex flex-col gap-2.5'
			>
				{toasts.map((t) => (
					<div key={t.id} className='pointer-events-auto'>
						<ToastItem toast={t} onDismiss={() => dismiss(t.id)} />
					</div>
				))}
			</div>
		</ToastContext.Provider>
	)
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
	return useContext(ToastContext)
}
