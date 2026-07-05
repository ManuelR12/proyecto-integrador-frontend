import { dashboard as copy } from "../../copy/es";

interface DashboardEmptyStateProps {
	onCreateRoom: () => void;
}

const EmptyIllustration = () => (
	<svg
		viewBox="0 0 240 180"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className="mx-auto h-40 w-full max-w-xs"
		aria-hidden="true"
	>
		<rect x="24" y="28" width="192" height="124" rx="16" fill="#EFF6FF" />
		<rect x="40" y="44" width="160" height="92" rx="10" fill="#DBEAFE" />
		<rect x="52" y="56" width="56" height="40" rx="8" fill="#BFDBFE" />
		<rect x="116" y="56" width="72" height="18" rx="4" fill="#93C5FD" />
		<rect x="116" y="82" width="48" height="12" rx="4" fill="#BFDBFE" />
		<circle cx="80" cy="118" r="12" fill="#2563EB" />
		<circle cx="108" cy="118" r="12" fill="#7C3AED" />
		<circle cx="136" cy="118" r="12" fill="#059669" />
		<path
			d="M168 118c0-6.627 5.373-12 12-12s12 5.373 12 12"
			stroke="#64748B"
			strokeWidth="2"
			strokeLinecap="round"
		/>
		<rect x="88" y="8" width="64" height="20" rx="10" fill="#2563EB" />
		<path d="M112 18h16" stroke="white" strokeWidth="2" strokeLinecap="round" />
		<path d="M120 10v16" stroke="white" strokeWidth="2" strokeLinecap="round" />
	</svg>
);

const DashboardEmptyState = ({ onCreateRoom }: DashboardEmptyStateProps) => {
	return (
		<section
			className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm"
			aria-labelledby="dashboard-empty-title"
		>
			<EmptyIllustration />
			<h2 id="dashboard-empty-title" className="mt-6 text-lg font-semibold text-slate-900">
				{copy.emptyState.title}
			</h2>
			<p className="mt-2 max-w-md text-sm text-slate-600">{copy.emptyState.body}</p>
			<button
				type="button"
				onClick={onCreateRoom}
				aria-label={copy.emptyState.cta}
				className="mt-6 inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
			>
				{copy.emptyState.cta}
			</button>
		</section>
	);
};

export default DashboardEmptyState;
