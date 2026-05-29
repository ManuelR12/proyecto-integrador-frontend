import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { product, auth as authCopy } from "../../copy/es";

interface AuthShellProps {
	children: ReactNode;
	/** Route the back button navigates to. Defaults to "/". */
	backTo?: string;
}

// Heroicons outline paths (24 × 24 viewBox)
const ICON_CHAT =
	"M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z";
const ICON_VIDEO =
	"M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z";
const ICON_SCREEN =
	"M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25";

const FEATURES = [
	{ icon: ICON_CHAT, label: authCopy.home.features[0] },
	{ icon: ICON_VIDEO, label: authCopy.home.features[1] },
	{ icon: ICON_SCREEN, label: authCopy.home.features[2] },
] as const;

const AuthShell = ({ children, backTo = "/" }: AuthShellProps) => (
	<div className="flex h-screen w-full overflow-hidden">
		{/* ── Brand panel (lg+) ── */}
		<aside
			aria-hidden="true"
			className="hidden lg:flex w-[400px] xl:w-[440px] flex-shrink-0 flex-col justify-between bg-[#0d1117] overflow-y-auto px-12 py-14"
		>
			<Link
				to={backTo}
				tabIndex={-1}
				className="text-lg font-bold tracking-tight text-white transition-colors hover:text-[#165dfb]"
			>
				{product.name}
			</Link>

			<div className="space-y-7">
				<div>
					<p className="text-3xl font-semibold leading-snug text-white">
						{authCopy.landing.heroTitle}
					</p>
					<p className="mt-3 text-sm leading-relaxed text-slate-500">{product.description}</p>
				</div>

				<ul className="space-y-3">
					{FEATURES.map(({ icon, label }) => (
						<li key={label} className="flex items-center gap-3">
							<span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#165dfb]/10">
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth={1.5}
									className="h-3.5 w-3.5 text-[#165dfb]"
									aria-hidden="true"
								>
									<path strokeLinecap="round" strokeLinejoin="round" d={icon} />
								</svg>
							</span>
							<span className="text-sm text-slate-400">{label}</span>
						</li>
					))}
				</ul>
			</div>

			{/* empty spacer keeps flex layout */}
			<span aria-hidden="true" />
		</aside>

		{/* ── Form area — scrolls independently ── */}
		<main className="flex-1 overflow-y-auto bg-[#f6f7f8]">
			<div className="relative flex min-h-full flex-col items-center justify-center px-6 py-12">
				<Link
					to={backTo}
					className="absolute top-6 left-6 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-800"
				>
					<svg
						viewBox="0 0 20 20"
						fill="currentColor"
						className="h-3.5 w-3.5"
						aria-hidden="true"
					>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
						/>
					</svg>
					Inicio
				</Link>

				{children}
			</div>
		</main>
	</div>
);

export default AuthShell;
