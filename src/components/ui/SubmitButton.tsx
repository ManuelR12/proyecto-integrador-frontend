import type { ButtonHTMLAttributes } from 'react'

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingLabel?: string
}

const SubmitButton = ({
  loading = false,
  loadingLabel,
  children,
  disabled,
  className = '',
  ...rest
}: SubmitButtonProps) => {
  const isDisabled = disabled || loading

  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-busy={loading}
      className={[
        'flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5',
        'text-sm font-medium text-white transition-colors',
        'bg-blue-600 hover:bg-blue-500',
        'disabled:cursor-not-allowed disabled:opacity-65',
        className,
      ].join(' ')}
      {...rest}
    >
      {loading && (
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
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
          />
        </svg>
      )}
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  )
}

export default SubmitButton
